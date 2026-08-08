#!/usr/bin/env node
// NAP (Name, Address, Phone) citation audit.
//
// Goal: keep every profile of Waseem across the web pointing at the SAME name,
// address, and phone. Google's local ranking weights consistency across
// citations — a stray old "Nazareth" address on LinkedIn or a phone number
// with the wrong prefix on xplace is exactly what suppresses "בניית אתרים
// כפר יאסיף" search rankings.
//
// This script fetches each profile URL, extracts what it can find, diffs
// against the canonical values in scripts/nap-audit.config.mjs, and writes a
// markdown report you can act on manually.
//
// Usage:
//   1. cp scripts/nap-audit.config.example.mjs scripts/nap-audit.config.mjs
//   2. Edit the real values (that file is gitignored)
//   3. node scripts/nap-audit.mjs
//
// The report is written to the scratchpad dir (falls back to /tmp).

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const CONFIG_PATH = resolve(__dirname, 'nap-audit.config.mjs');
const EXAMPLE_PATH = resolve(__dirname, 'nap-audit.config.example.mjs');

const FETCH_TIMEOUT_MS = 15_000;
const USER_AGENT =
  'Mozilla/5.0 (compatible; nap-audit/1.0; +https://waseemp.vercel.app)';

// ---------------------------------------------------------------------------
// Load config (falls back to example with a warning).
// ---------------------------------------------------------------------------
async function loadConfig() {
  const target = existsSync(CONFIG_PATH) ? CONFIG_PATH : EXAMPLE_PATH;
  if (target === EXAMPLE_PATH) {
    console.warn(
      '⚠  scripts/nap-audit.config.mjs not found — running against the EXAMPLE\n' +
        '   config so you can see the report shape. Copy the example and edit it:\n' +
        '   cp scripts/nap-audit.config.example.mjs scripts/nap-audit.config.mjs\n',
    );
  }
  const mod = await import(pathToFileURL(target).href);
  return mod.default;
}

// ---------------------------------------------------------------------------
// Fetch a URL with timeout + friendly UA. Returns { ok, status, body, error }.
// Login-walled sites (LinkedIn, Facebook) will return a tiny page — we don't
// treat that as a hard error, we just flag "limited-content" in the diff.
// ---------------------------------------------------------------------------
async function fetchHtml(url) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,he;q=0.8,ar;q=0.7',
      },
      signal: controller.signal,
    });
    const body = await res.text();
    return { ok: res.ok, status: res.status, body };
  } catch (err) {
    return { ok: false, status: 0, body: '', error: err.message };
  } finally {
    clearTimeout(t);
  }
}

// ---------------------------------------------------------------------------
// Extractors — regex-only, no DOM parser. We work on the raw HTML because
// most citation pages we care about hide their real data behind JS that we
// can't execute — the visible-source name/phone/address is what Google sees
// too, so that's the right thing to audit.
// ---------------------------------------------------------------------------

// Strip HTML tags for cleaner text-only searching. Keep &nbsp; etc. — we're
// pattern-matching, not rendering.
const stripTags = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');

// Normalize a phone to digits only. Handles +972, 972, 0 prefixes.
const normalizePhone = (raw) => {
  if (!raw) return '';
  const digits = String(raw).replace(/\D/g, '');
  if (digits.startsWith('972')) return digits;
  if (digits.startsWith('0')) return '972' + digits.slice(1);
  return digits;
};

// Any phone-shaped string in the body. Broad on purpose — we filter later.
const findPhones = (text) => {
  const matches = new Set();
  const re = /(?:\+?972[-\s]?|\b0)(?:5[0-9])[-\s]?\d{3}[-\s]?\d{4}/g;
  for (const m of text.matchAll(re)) matches.add(normalizePhone(m[0]));
  return [...matches];
};

// Any of the canonical name variants present in the body (case-insensitive
// for Latin; exact for RTL scripts since Unicode case is fraught).
const findNameMatches = (text, names) => {
  const hits = [];
  for (const name of names) {
    const looksLatin = /^[\x00-\x7F]+$/.test(name);
    const re = looksLatin ? new RegExp(escapeRegex(name), 'i') : null;
    if (re ? re.test(text) : text.includes(name)) hits.push(name);
  }
  return hits;
};

// Any of the address locality variants present. Same latin-vs-rtl handling.
const findAddressMatches = (text, address) => {
  const hits = [];
  const candidates = [address.locality, ...(address.localityAliases || [])];
  for (const cand of candidates) {
    if (!cand) continue;
    const looksLatin = /^[\x00-\x7F]+$/.test(cand);
    const re = looksLatin ? new RegExp('\\b' + escapeRegex(cand) + '\\b', 'i') : null;
    if (re ? re.test(text) : text.includes(cand)) hits.push(cand);
  }
  return hits;
};

// Suspicious other-city names that shouldn't be there — help spot the ghost
// citations (e.g. an old Technion/Nazareth reference on a legacy profile).
const KNOWN_GHOST_CITIES = ['Nazareth', 'נצרת', 'الناصرة', 'Technion', 'טכניון'];
const findGhostCities = (text) =>
  KNOWN_GHOST_CITIES.filter((c) => {
    const looksLatin = /^[\x00-\x7F]+$/.test(c);
    return looksLatin
      ? new RegExp('\\b' + escapeRegex(c) + '\\b', 'i').test(text)
      : text.includes(c);
  });

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ---------------------------------------------------------------------------
// Diff one profile against canonical.
// ---------------------------------------------------------------------------
function auditProfile(fetched, canonical) {
  if (!fetched.ok) {
    return {
      status: 'error',
      note: fetched.error
        ? `fetch failed: ${fetched.error}`
        : `HTTP ${fetched.status}`,
      findings: [],
    };
  }

  const text = stripTags(fetched.body);
  const short = text.length < 800; // login walls / SPA shells look like this

  const phonesFound = findPhones(text);
  const canonicalPhone = normalizePhone(canonical.phone);
  const phoneOk = phonesFound.includes(canonicalPhone);
  const rogueP = phonesFound.filter((p) => p !== canonicalPhone);

  const nameHits = findNameMatches(text, canonical.names);
  const addrHits = findAddressMatches(text, canonical.address);
  const ghosts = findGhostCities(text);

  const findings = [];

  if (short) {
    findings.push({
      level: 'info',
      msg: 'Response body is small — likely a login-walled SPA. Compare manually while signed in.',
    });
  }

  if (nameHits.length === 0 && !short) {
    findings.push({ level: 'warn', msg: 'No canonical name variant found on page.' });
  } else if (nameHits.length > 0) {
    findings.push({ level: 'ok', msg: `Name found: ${nameHits.join(', ')}` });
  }

  if (addrHits.length === 0 && !short) {
    findings.push({
      level: 'warn',
      msg: `No canonical locality found (looked for: ${[canonical.address.locality, ...(canonical.address.localityAliases || [])].join(', ')}).`,
    });
  } else if (addrHits.length > 0) {
    findings.push({ level: 'ok', msg: `Address locality found: ${addrHits.join(', ')}` });
  }

  if (ghosts.length > 0) {
    findings.push({
      level: 'error',
      msg: `Ghost city references found — clean up: ${ghosts.join(', ')}`,
    });
  }

  if (phonesFound.length === 0 && !short) {
    findings.push({ level: 'info', msg: 'No phone number found on page.' });
  } else {
    if (phoneOk) {
      findings.push({ level: 'ok', msg: `Canonical phone present: ${canonical.phone}` });
    }
    if (rogueP.length > 0) {
      findings.push({
        level: 'error',
        msg: `Non-canonical phone(s) found: ${rogueP.map((p) => '+' + p).join(', ')}`,
      });
    }
  }

  return { status: short ? 'limited' : 'ok', findings };
}

// ---------------------------------------------------------------------------
// Format the markdown report.
// ---------------------------------------------------------------------------
function levelIcon(level) {
  return { ok: '✅', info: 'ℹ️', warn: '⚠️', error: '❌' }[level] || '•';
}
function statusBadge(status) {
  return (
    { ok: '🟢 clean', limited: '🟡 limited', error: '🔴 error' }[status] || status
  );
}

function renderReport(canonical, results) {
  const now = new Date().toISOString();
  const totals = { ok: 0, info: 0, warn: 0, error: 0 };
  for (const r of results) {
    for (const f of r.audit.findings) totals[f.level] = (totals[f.level] || 0) + 1;
  }

  const lines = [];
  lines.push('# NAP Citation Audit');
  lines.push('');
  lines.push(`Generated: \`${now}\`  `);
  lines.push(
    `Canonical: **${canonical.names[0]}** · ${canonical.address.locality}, ${canonical.address.country} · \`${canonical.phone}\``,
  );
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- ✅ passes: **${totals.ok || 0}**`);
  lines.push(`- ⚠️ warnings: **${totals.warn || 0}**`);
  lines.push(`- ❌ errors: **${totals.error || 0}**`);
  lines.push(`- ℹ️ info: **${totals.info || 0}**`);
  lines.push('');
  lines.push('## Per profile');
  lines.push('');

  for (const r of results) {
    lines.push(`### ${r.profile.label} — ${statusBadge(r.audit.status)}`);
    lines.push('');
    lines.push(`URL: <${r.profile.url}>`);
    lines.push('');
    if (r.audit.note) {
      lines.push(`> ${r.audit.note}`);
      lines.push('');
    }
    if (r.audit.findings.length === 0) {
      lines.push('_No findings._');
    } else {
      for (const f of r.audit.findings) {
        lines.push(`- ${levelIcon(f.level)} ${f.msg}`);
      }
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push(
    '_Notes: this script reads the raw HTML the URL serves to unauthenticated crawlers. ' +
      'Social sites that serve a login wall to bots (LinkedIn, Facebook, Instagram) will ' +
      'appear "limited" — cross-check those in a browser while signed in._',
  );

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Pick a place to write the report — scratchpad dir if it exists, else /tmp.
// ---------------------------------------------------------------------------
function resolveReportPath() {
  const scratch = process.env.CLAUDE_SCRATCHPAD_DIR;
  const dir = scratch && existsSync(scratch)
    ? scratch
    : resolve(REPO_ROOT, '.nap-audit');
  mkdirSync(dir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return resolve(dir, `nap-audit-${ts}.md`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const config = await loadConfig();

  console.log(`Auditing ${config.profiles.length} profile(s)…`);

  const results = await Promise.all(
    config.profiles.map(async (profile) => {
      process.stdout.write(`  · ${profile.label}\n`);
      const fetched = await fetchHtml(profile.url);
      const audit = auditProfile(fetched, config.canonical);
      return { profile, audit };
    }),
  );

  const report = renderReport(config.canonical, results);
  const outPath = resolveReportPath();
  writeFileSync(outPath, report, 'utf8');

  console.log(`\n✓ Report written: ${outPath}`);
  const errs = results.reduce(
    (n, r) => n + r.audit.findings.filter((f) => f.level === 'error').length,
    0,
  );
  const warns = results.reduce(
    (n, r) => n + r.audit.findings.filter((f) => f.level === 'warn').length,
    0,
  );
  console.log(`  ${errs} error(s), ${warns} warning(s).`);
  process.exit(errs > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error('nap-audit failed:', e);
  process.exit(2);
});
