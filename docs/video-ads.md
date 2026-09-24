# Social-video showcase

The `/video-ads` route features the GreenTouch and NINNYO FLOWERS case studies, with English, Hebrew and Arabic page copy. It is linked from navigation, footer and the homepage's Work section. Both videos preserve the original product photography and are presented without invented campaign results.

## GreenTouch

Music source: https://pixabay.com/music/soft-house-beach-house-beat-no-copyright-510788/
Published: April 2, 2026. Retrieved: September 24, 2026.
License: https://pixabay.com/service/terms/ (Pixabay Content License).
The source is marked Content ID Registered. No account-issued license certificate was obtained; retain source/license evidence for any platform claim. Do not distribute the standalone soundtrack.

The MP4 is 27 seconds, 1080x1920, H.264/AAC stereo. English/Arabic subtitle tracks translate the Hebrew on-screen messages; a localized transcript is also available.

## NINNYO FLOWERS

The reel uses eight real bouquet photos from the public NINNYO FLOWERS repository. It is 20 seconds, 1080x1920, H.264/AAC stereo, and targets Instagram and Facebook Reels.

Music source: https://pixabay.com/music/electronic-stylish-upbeat-commercial-advertising-funk-267753/
Track: Stylish — Upbeat Commercial Advertising Funk by FASSounds.
Retrieved: September 24, 2026. License: https://pixabay.com/service/license-summary/
The source is marked Content ID Registered. Keep the source evidence and obtain an account-issued certificate if needed before paid placement.

Both players use native controls for playback, seeking, volume and fullscreen. The home teaser uses WebP images only, so the videos do not download before someone opens the showcase.

Update future projects through `src/features/video-ads/content.ts`. Keep published media paths versioned if replacing files after launch, because `/assets/` has immutable caching.

`npm run build` includes a postbuild script that creates `dist/video-ads/index.html` with route-specific sharing metadata. Vercel rewrites the clean route to that HTML; client navigation still uses React Router. The sitemap generator includes the new page.

Validation: typecheck, focused ESLint, production build, automated tests, browser playback and responsive checks. Production publishing is a separate step; local implementation does not change the live website.
