/**
 * Coerce a user-typed URL to satisfy the database's URL checks. Three columns
 * carry `check (… ~ '^https?://')` — projects.link, projects.github, and
 * certifications.credential_url — and a value that reaches Postgres without a
 * scheme fails the whole write. Admins naturally type "example.com", so the
 * editors normalize through here before saving:
 *
 *   - blank / whitespace        → null
 *   - "example.com"             → "https://example.com"
 *   - "HTTPS://x.com"           → "https://x.com"   (scheme lowercased — the DB
 *                                  regex is case-sensitive, so an uppercase
 *                                  scheme is rejected)
 *   - "https://x.com" (valid)   → unchanged
 *
 * Returns null for empty input so nullable columns store NULL rather than an
 * empty string (which would itself violate the check). Required columns guard
 * emptiness at the call site, so they never receive null.
 */
export function normalizeHttpUrl(value: string | null | undefined): string | null {
  const v = (value ?? '').trim();
  if (!v) return null;
  const schemed = v.match(/^(https?):\/\/(.*)$/i);
  return schemed ? `${schemed[1].toLowerCase()}://${schemed[2]}` : `https://${v}`;
}
