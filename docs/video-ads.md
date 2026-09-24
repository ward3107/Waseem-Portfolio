# Video ad showcase

The `/video-ads` route features the GreenTouch portfolio concept, with English, Hebrew and Arabic page copy. It is linked from navigation, footer and the homepage's Work section. The approved video has complete source photos and uses the user's selected music, Beach House Beat No Copyright by AbsoluteSound.

Music source: https://pixabay.com/music/soft-house-beach-house-beat-no-copyright-510788/
Published: April 2, 2026. Retrieved: September 24, 2026.
License: https://pixabay.com/service/terms/ (Pixabay Content License).
The source is marked Content ID Registered. No account-issued license certificate was obtained; retain source/license evidence for any platform claim. Do not distribute the standalone soundtrack.

The MP4 is 27 seconds, 1080x1920, H.264/AAC stereo. `preload="none"` avoids downloading video until requested. The home teaser uses only a WebP image. Native controls support playback, seeking, volume and fullscreen. English/Arabic subtitle tracks translate the Hebrew on-screen messages; a localized transcript is also available.

Update future projects through `src/features/video-ads/content.ts`. Keep published media paths versioned if replacing files after launch, because `/assets/` has immutable caching.

`npm run build` includes a postbuild script that creates `dist/video-ads/index.html` with route-specific sharing metadata. Vercel rewrites the clean route to that HTML; client navigation still uses React Router. The sitemap generator includes the new page.

Validation: typecheck, focused ESLint, production build, existing 44 tests, browser playback and responsive checks. Production publishing is a separate step; local implementation does not change the live website.
