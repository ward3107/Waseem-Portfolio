# Portfolio selection and artwork

`src/features/projects/data.ts` contains the approved portfolio additions. The
classic homepage, the immersive 3D rail and its accessible link index all display
the complete project collection, including the existing CMS entries and the new
projects. No three-project homepage limit is applied. `/projects` provides an
additional view of the same full portfolio.

VocaBagrut already exists in the CMS. Entries merge by slug, live URL, and public
repository URL, so older CMS slugs do not create duplicate cards. The retired
WordPress Studio and Shop demos stay excluded. Private repository links are not
advertised on the new public cards. Language changes translate both curated and
CMS content without another database request.

Artwork is self-hosted under `public/assets/projects/`:

| Project | Source |
| --- | --- |
| NACRE — Ocean Atelier | Published Site preview (`cover.webp`) and the project’s own static product illustration (`product.svg`). Public design demonstration, with an English/Hebrew ocean journey. |
| MOVA | Original social cover in `ward3107/WordPress-WooCommerce-MOVA`, `dist/assets/social-cover.jpg` |
| Softec Vision | The site's `/he/opengraph-image` artwork |
| BizNix | Vector portfolio cover composed with the existing public `/favicon.svg` brand mark |
| Kiwi | Vector portfolio cover composed with the existing public `/icon-192.svg` robot mark |
| Shayish Kfar Yassif | The site's `/og-cover.jpg` artwork |
| NINNYO Flowers | Original `screenshots/hero-light.jpg` from `ward3107/NINNYO-FLOWERS` |
| VocaBagrut | The site's `/og-image.svg` artwork |

Brand covers are presentation artwork rather than screenshots. No client data,
performance metrics, payment claims, or fabricated app screens were added.
