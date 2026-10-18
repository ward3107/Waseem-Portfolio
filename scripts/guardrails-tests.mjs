import test from 'node:test';
import assert from 'node:assert/strict';
import { requiredChecks, makeRuleset, rulesCover, runEntry } from './activate-dependency-guardrails.mjs';

const entry = { repository: 'ward3107/example', branch: 'main', pull_request: 1, checks: ['Quality checks'] };
const pass = { id: 1, name: 'Quality checks', head_sha: 'abc', app: { id: 15368 }, status: 'completed', conclusion: 'success' };

test('missing, skipped, cancelled, pending and wrong-revision checks cannot authorize protection', () => {
  assert.equal(requiredChecks(entry, [pass], 'abc')[0].integration_id, 15368);
  for (const changes of [{ conclusion: 'skipped' }, { conclusion: 'failure' }, { conclusion: 'cancelled' }, { status: 'in_progress' }, { head_sha: 'old' }, { app: { id: 1 } }]) {
    assert.throws(() => requiredChecks(entry, [{ ...pass, ...changes }], 'abc'));
  }
  assert.throws(() => requiredChecks(entry, [], 'abc'));
  assert.throws(() => requiredChecks(entry, [pass, { ...pass, id: 2, conclusion: 'failure' }], 'abc'));
});

test('policy targets the exact branch, binds checks to Actions and never grants bypass', () => {
  const policy = makeRuleset({ ...entry, branch: 'claude/site' }, requiredChecks(entry, [pass], 'abc'));
  assert.deepEqual(policy.bypass_actors, []);
  assert.deepEqual(policy.conditions.ref_name.include, ['refs/heads/claude/site']);
  assert.equal(rulesCover(policy, policy), true);
  assert.equal(rulesCover({ ...policy, conditions: { ref_name: { exclude: [], include: policy.conditions.ref_name.include } } }, policy), true);
  assert.equal(rulesCover({ ...policy, bypass_actors: [{ actor_id: 5 }] }, policy), false);
  assert.equal(rulesCover({ ...policy, enforcement: 'disabled' }, policy), false);
  assert.throws(() => makeRuleset({ ...entry, repository: 'other/repo' }, [{}]));
});

function fixture({ checks = [pass], admin = true, changing = false, existing = false } = {}) {
  const writes = []; let reads = 0, saved;
  const policy = makeRuleset(entry, requiredChecks(entry, [pass], 'abc'));
  const api = (path, options = {}) => {
    if (options.body) { writes.push(options.body); saved = options.body; return { id: 9 }; }
    if (path === 'repos/' + entry.repository) return { default_branch: 'main', permissions: { admin } };
    if (path.endsWith('/pulls/1')) return {
      state: 'open', merged: false,
      base: { ref: 'main', repo: { full_name: entry.repository } },
      head: { ref: 'codex/safe-dependency-updates', repo: { full_name: entry.repository }, sha: changing && ++reads > 1 ? 'new' : 'abc' },
    };
    if (path.includes('/check-runs?')) return [{ check_runs: checks }];
    if (path.includes('/rulesets?')) return [existing ? [{ id: 9, name: policy.name }] : []];
    if (path.endsWith('/rulesets/9')) return saved || policy;
    throw new Error('Unexpected API path: ' + path);
  };
  return { api, writes };
}

test('dry run never mutates; application verifies its single mutation; repeat run is idempotent', () => {
  const dry = fixture(); assert.equal(runEntry(entry, dry).state, 'ready'); assert.equal(dry.writes.length, 0);
  const live = fixture(); assert.equal(runEntry(entry, { ...live, apply: true }).state, 'protected'); assert.equal(live.writes.length, 1);
  const again = fixture({ existing: true }); assert.equal(runEntry(entry, { ...again, apply: true }).state, 'already-protected'); assert.equal(again.writes.length, 0);
});

test('failed CI, missing admin permission and a moving PR cannot mutate settings', () => {
  for (const options of [{ checks: [] }, { admin: false }, { changing: true }]) {
    const f = fixture(options);
    assert.throws(() => runEntry(entry, { ...f, apply: true }));
    assert.equal(f.writes.length, 0);
  }
});
