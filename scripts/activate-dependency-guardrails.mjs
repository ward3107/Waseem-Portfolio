import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

export const RULESET_NAME = 'Dependency update guardrails';
const ACTIONS_APP = 15368;

export function requiredChecks(entry, runs, sha) {
  if (!entry.checks?.length) throw new Error('No required checks configured');
  return entry.checks.map(name => {
    const latest = runs.filter(run => run.name === name && run.head_sha === sha &&
      run.app?.id === ACTIONS_APP).sort((a, b) => b.id - a.id)[0];
    if (!latest || latest.status !== 'completed' || latest.conclusion !== 'success') {
      throw new Error('Required check did not pass: ' + name);
    }
    return { context: name, integration_id: ACTIONS_APP };
  });
}

export function makeRuleset(entry, checks) {
  if (!/^ward3107\/[A-Za-z0-9_.-]+$/.test(entry.repository) ||
      !entry.branch || /[\r\n*?\[\]]/.test(entry.branch) || !checks.length) {
    throw new Error('Invalid repository, branch or check configuration');
  }
  return {
    name: RULESET_NAME, target: 'branch', enforcement: 'active', bypass_actors: [],
    conditions: { ref_name: { include: ['refs/heads/' + entry.branch], exclude: [] } },
    rules: [
      { type: 'pull_request', parameters: {
        dismiss_stale_reviews_on_push: true,
        require_code_owner_review: false,
        require_last_push_approval: false,
        required_approving_review_count: 0,
        required_review_thread_resolution: true,
      } },
      { type: 'required_status_checks', parameters: {
        strict_required_status_checks_policy: true,
        do_not_enforce_on_create: false,
        required_status_checks: checks,
      } },
      { type: 'non_fast_forward' }, { type: 'deletion' },
    ],
  };
}

export function rulesCover(actual, desired) {
  if (actual.name !== desired.name || actual.target !== 'branch' ||
      actual.enforcement !== 'active' || !Array.isArray(actual.bypass_actors) ||
      actual.bypass_actors.length) return false;
  const actualRefs = actual.conditions?.ref_name;
  const desiredRefs = desired.conditions.ref_name;
  if (JSON.stringify(actualRefs?.include) !== JSON.stringify(desiredRefs.include) ||
      !Array.isArray(actualRefs?.exclude) || actualRefs.exclude.length) return false;
  const pull = actual.rules?.find(rule => rule.type === 'pull_request')?.parameters;
  if (!pull?.dismiss_stale_reviews_on_push || !pull.required_review_thread_resolution) return false;
  const status = actual.rules?.find(rule => rule.type === 'required_status_checks')?.parameters;
  if (!status?.strict_required_status_checks_policy || status.do_not_enforce_on_create === true) return false;
  const required = desired.rules.find(rule => rule.type === 'required_status_checks').parameters.required_status_checks;
  if (!required.every(want => status.required_status_checks?.some(have =>
    have.context === want.context && have.integration_id === want.integration_id))) return false;
  return ['non_fast_forward', 'deletion'].every(type => actual.rules.some(rule => rule.type === type));
}

function assertPR(entry, pr) {
  if (pr.base?.ref !== entry.branch || pr.base?.repo?.full_name !== entry.repository ||
      pr.head?.repo?.full_name !== entry.repository || pr.head?.ref !== 'codex/safe-dependency-updates' ||
      (pr.state !== 'open' && !pr.merged)) {
    throw new Error('Rollout PR is closed, retargeted or from an unexpected branch/repository');
  }
}

export function runEntry(entry, { api, apply = false }) {
  const root = 'repos/' + entry.repository;
  const metadata = api(root);
  if (metadata.default_branch !== entry.branch) throw new Error('Default branch changed; review the manifest');
  if (apply && !metadata.permissions?.admin) throw new Error('Repository administrator access is required');
  const pr = api(root + '/pulls/' + entry.pull_request);
  assertPR(entry, pr);
  const branchPath = root + '/git/ref/heads/' + entry.branch;
  const sha = pr.merged ? api(branchPath).object.sha : pr.head.sha;
  const pages = api(root + '/commits/' + sha + '/check-runs?filter=latest&per_page=100', { paginate: true });
  const checks = requiredChecks(entry, pages.flatMap(page => page.check_runs), sha);
  const policy = makeRuleset(entry, checks);
  const rulesets = api(root + '/rulesets?per_page=100', { paginate: true }).flat();
  const named = rulesets.filter(rule => rule.name === RULESET_NAME);
  if (named.length > 1) throw new Error('Multiple matching rulesets; inspect settings manually');
  if (named.length) {
    const existing = api(root + '/rulesets/' + named[0].id);
    if (!rulesCover(existing, policy)) throw new Error('Existing named ruleset differs; it was left untouched');
    return { state: 'already-protected', sha, id: named[0].id };
  }
  if (!apply) return { state: 'ready', sha, policy, administrator: metadata.permissions?.admin === true };

  // Recheck the revision immediately before the single settings mutation.
  const current = api(root + '/pulls/' + entry.pull_request);
  assertPR(entry, current);
  const currentSha = current.merged ? api(branchPath).object.sha : current.head.sha;
  if (currentSha !== sha) throw new Error('Revision changed during inspection; rerun the dry run');
  const created = api(root + '/rulesets', { body: policy });
  const verified = api(root + '/rulesets/' + created.id);
  if (!rulesCover(verified, policy)) throw new Error('Ruleset was created but verification failed; inspect settings');
  return { state: 'protected', sha, id: created.id };
}

function github(endpoint, { body, paginate = false } = {}) {
  const args = ['api', '--hostname', 'github.com', endpoint,
    '--method', body ? 'POST' : 'GET', '-H', 'Accept: application/vnd.github+json'];
  if (paginate) args.push('--paginate', '--slurp');
  if (body) args.push('--input', '-');
  try {
    return JSON.parse(execFileSync('gh', args, {
      input: body ? JSON.stringify(body) : undefined,
      encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'],
      maxBuffer: 16 * 1024 * 1024,
    }));
  } catch (error) {
    throw new Error(String(error.stderr || error.message).trim());
  }
}

export function main() {
  const { values } = parseArgs({ options: {
    apply: { type: 'boolean', default: false },
    repo: { type: 'string', multiple: true },
    help: { type: 'boolean' },
  } });
  if (values.help) {
    console.log('node scripts/activate-dependency-guardrails.mjs [--repo ward3107/REPO] [--apply]');
    console.log('Default: read-only readiness check. --apply adds a verified ruleset; never merges or deploys.');
    return;
  }
  const entries = JSON.parse(readFileSync(new URL('./dependency-guardrails.json', import.meta.url), 'utf8'));
  for (const requested of values.repo || []) {
    if (!entries.some(entry => entry.repository === requested)) throw new Error('Unknown repository: ' + requested);
  }
  let blocked = 0;
  for (const entry of entries.filter(entry => !values.repo || values.repo.includes(entry.repository))) {
    try {
      const result = runEntry(entry, { api: github, apply: values.apply });
      console.log(JSON.stringify({ repository: entry.repository, branch: entry.branch, checks: entry.checks, ...result }));
    } catch (error) {
      blocked++;
      console.error(JSON.stringify({ repository: entry.repository, state: 'blocked', reason: error.message }));
    }
  }
  if (blocked) process.exitCode = 1;
}
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) main();
