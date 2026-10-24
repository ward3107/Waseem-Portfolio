# Accessibility panel and public pricing — 24 October 2026

The panel opens on the physical right edge in Hebrew, Arabic and English. It has independent native scrolling, a visible close control, keyboard focus containment, Escape dismissal and focus restoration. A native modal dialog in a body portal keeps it outside transformed scene containers and makes the background inert.

The original RTL flex alignment put the panel on the opposite side. Lenis intercepted its wheel/touch scrolling. Physical right positioning, native-scroll exclusions and pausing Lenis while the dialog is open address those causes.

## Adjustments

1. Text size from 100% to 200%.
2. Default, light and dark contrast.
3. Underlined links.
4. Readable font.
5. Extended text spacing.
6. Underlined headings.
7. Stronger keyboard focus.
8. Reduced motion, including the classic alternative to the 3D experience and paused autoplay media.
9. Large cursor.
10. Hidden decorative media, with meaningful images preserved.
11. Grayscale media.
12. Text aligned to reading direction.
13. Reading guide following pointer or keyboard focus.

Settings are validated before use, saved locally and resettable. Session hiding is reversible through the accessibility statement page.

## Pricing

All 32 existing service choices and 15 scope rates now have fixed amounts or estimate ranges, including app, AI, automation, video, SEO and accessibility work. The shared catalogue drives both the price list and the calculator/WhatsApp breakdown.

| Existing item | Previous ILS | Updated ILS |
| --- | ---: | ---: |
| One-page, one-language website base | 990 | 1,150 |
| Additional website page | 190 | 220 |
| Additional website language | 350 | 400 |
| Blog/CMS add-on | 390 | 450 |
| Animated hero add-on | 290 | 340 |

The increase to previously published rates is approximately 15%, rounded to useful amounts. Previously unpriced choices now have explicit prices or scope-based ranges. Website base scope, third-party costs and one-month maintenance terms are stated. The structured-data website offer uses the same base price.

Example: landing page + two additional pages + one additional language + animated hero = ILS 1,150 + 440 + 400 + 340 = **ILS 2,330**. The browser calculation and prepared WhatsApp message agree. No WhatsApp message was sent.

## Verification

- TypeScript typecheck passes.
- ESLint passes with two existing warnings in unrelated files.
- Production build passes; existing large-chunk notices remain.
- The full Vitest suite passes, including panel preferences, focus wrapping, hiding/restoring, price totals and outbound text.
- Chrome: wheel scrolling moves the panel without moving the background. CDP touch input scrolls the mobile panel.
- Physical right position checked in all three languages.
- Panel reflow checked at 320 × 568 with 200% text size, and 667 × 320 landscape. No panel horizontal overflow or clipped scroll region.
- Native modal behavior, Tab/Shift+Tab containment, Escape, focus restoration, persistence and all preference effects checked in the browser.
- axe WCAG 2/2.1/2.2 A/AA scans found no violations in the panel (all three languages), inline calculator and standalone calculator.
- Locale entry links preserve accessibility/calculator routes; homepage locale normalization preserves the classic-mode query and quote anchor.

These are targeted checks, not a complete site conformance certification. Manual screen-reader testing across NVDA, JAWS, VoiceOver and TalkBack and a full review of documents, videos and third-party content remain outside the completed verification. The public accessibility statement describes these limits.

## Reference guidance

- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [W3C modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [W3C reflow guidance](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [Israeli Commission guidance](https://www.gov.il/he/pages/website_accessibility)
- [Lenis nested-scroll guidance](https://github.com/darkroomengineering/lenis)
