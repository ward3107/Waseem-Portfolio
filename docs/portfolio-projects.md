# Portfolio selection and artwork

`src/features/projects/data.ts` contains the approved portfolio additions and the
explicit homepage selection: MOVA, Softec Vision, and BizNix. The classic homepage
and the immersive 3D rail use that same selection. `/projects` displays the full
portfolio, including unrelated CMS entries. The all-projects link opens this page.

VocaBagrut already exists in the CMS. Entries merge by slug, live URL, and public
repository URL, so older CMS slugs do not create duplicate cards. The retired
WordPress Studio and Shop demos stay excluded. Private repository links are not
advertised on the new public cards. Language changes translate both curated and
CMS content without another database request.

Artwork is self-hosted under `public/assets/projects/`:

| Project | Source |
| --- | --- |
| MOVA | Original social cover in `ward3107/WordPress-WooCommerce-MOVA`, `dist/assets/social-cover.jpg` |
| Softec Vision | The site's `/he/opengraph-image` artwork |
| BizNix | Vector portfolio cover composed with the existing public `/favicon.svg` brand mark |
| Kiwi | Vector portfolio cover composed with the existing public `/icon-192.svg` robot mark |
| Shayish Kfar Yassif | The site's `/og-cover.jpg` artwork |
| NINNYO Flowers | Original `screenshots/hero-light.jpg` from `ward3107/NINNYO-FLOWERS` |
| VocaBagrut | The site's `/og-image.svg` artwork |

Brand covers are presentation artwork rather than screenshots. No client data,
performance metrics, payment claims, or fabricated app screens were added.
