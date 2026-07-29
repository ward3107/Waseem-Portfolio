/**
 * Guards for values that originate in the database (admin-editable content)
 * and end up in a dangerous DOM position. Content is owner-authored today, but
 * these keep a compromised or mistyped row from becoming an XSS vector.
 */

/**
 * Characters that must not survive verbatim inside a <script> element.
 *  - < >  can close the element early ("</script>" breakout).
 *  - &    is escaped so already-escaped sequences can't be reconstituted.
 *  - U+2028 / U+2029 are legal raw inside a JSON string but are line
 *    terminators in JS source, so they break the surrounding script.
 * Each maps to its \uXXXX form, which is valid JSON and parses back to the
 * original character — structured-data consumers are unaffected.
 */
const SCRIPT_UNSAFE: Record<string, string> = {
  '<': '\\u003c',
  '>': '\\u003e',
  '&': '\\u0026',
  [String.fromCharCode(0x2028)]: '\\u2028',
  [String.fromCharCode(0x2029)]: '\\u2029',
};

const SCRIPT_UNSAFE_RE = new RegExp(
  '[' + Object.keys(SCRIPT_UNSAFE).join('') + ']',
  'g'
);

/**
 * Serialize a value for embedding inside a `<script>` element.
 *
 * `JSON.stringify` alone is NOT safe here: it leaves `<` and `/` intact, so a
 * string containing `</script>` closes the element early and everything after
 * it is parsed as live markup.
 */
export function jsonForScriptTag(value: unknown): string {
  return JSON.stringify(value).replace(SCRIPT_UNSAFE_RE, (c) => SCRIPT_UNSAFE[c]);
}

/**
 * Return `url` only when it is a plain http(s) link, otherwise `undefined`.
 *
 * Blocks `javascript:`, `data:`, and other active-content schemes that React
 * will happily render into an `href` (it warns but still emits the attribute).
 */
export function safeHref(url?: string | null): string | undefined {
  if (!url) return undefined;
  try {
    const base =
      typeof window === 'undefined' ? 'https://localhost' : window.location.origin;
    const { protocol } = new URL(url, base);
    return protocol === 'http:' || protocol === 'https:' ? url : undefined;
  } catch {
    return undefined;
  }
}
