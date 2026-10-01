# Journal, gallery and inquiry measurement

## Publishing content

`npm run build` generates three journal indexes, 39 translated guides, three
portfolio galleries, three story indexes and nine translated project stories.
The generated HTML is fully readable without JavaScript. Existing article URLs
are preserved. Source registries and reviewed copy live in `scripts/blog/editorial.mjs`;
UI translations and the shared HTML shell are in `scripts/blog/ui.mjs`.

The 2026-10-01 editorial pass replaced unsupported conversion/ranking guarantees
with scoped guidance. Numbered references attach primary documentation to the
specific factual paragraph. Recommendations and checklists are editorial advice,
not research results. No new publication dates, independent peer review or client
performance metrics are claimed. Recheck platform policies when revising articles.

Existing portfolio media supplies illustrative covers and gallery images. These
are examples, not scientific figures. Project stories reuse the video portfolio's
approved source/production descriptions and disclosures. GreenTouch and WordPress
Studio are explicitly labelled as portfolio concepts; no sales results are invented.

## Interaction verification

`npm test` includes the generated-page tests in `scripts/blog/verify.test.mjs`:
search plus topic filtering, empty states, localized citations and images, reading
tools, and analytics opt-in / revocation / payload minimization.

Gallery uses a native dialog (Escape closes it), with focus restored to the opener.
Reading lists and source links are available without scripting. Reduced-motion
preferences disable transforms and smooth scrolling. Comments are not enabled yet;
they need persistent storage, moderation and a separate publication workflow.

## Measurement

`public/assets/site-engagement.js` provides one delegated integration for both
static pages and the React site. It loads the existing first-party Vercel Web
Analytics script only after `cookie-consent.analytics === true`. The existing SPA
consent banner dispatches `vasia:consent`; static pages use the same stored choice.
Changes to consent apply to future events and page views.

| Event | Meaning |
|---|---|
| `contact_intent` | Click on a WhatsApp, email or phone link; or the exit-intent WhatsApp action |
| `lead_submitted` | Project wizard accepted by its backend, or discount form successfully saved |
| `testimonial_submitted` | Existing testimonial form reports success |
| `gallery_open` | Visitor opens a gallery image |

Only language, page pathname, an allowed source label and contact channel are sent.
No message text, phone numbers, email addresses, form values, free-text searches,
UTM strings or query strings are included. Page URLs are stripped of query/hash in
`beforeSend`. There is no local fake counter or publicly exposed lead database.

Review events in the project's Vercel Web Analytics / Events dashboard. Custom
events depend on the account's plan and analytics configuration. During this work,
the site's analytics script was available, but the connected Vercel tool returned
no teams. Dashboard ingestion and plan entitlement therefore remain unverified.
No paid feature or subscription was enabled. Do not call a WhatsApp click a sent
message, an accepted form a qualified lead, or a lead a completed sale.
