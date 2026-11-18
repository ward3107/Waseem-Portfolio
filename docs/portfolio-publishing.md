# Publishing portfolio work

Open `/admin` and choose **הוספת עבודה**. The editor at `/admin/work` accepts a website link, an album of photos, a video file, or a film already in the studio collection. Selecting several videos on a new entry creates separate drafts. Images taken on a phone are resized before upload. To resume an interrupted video, open the saved draft and select the same file on the same device.

Standalone websites appear under `/projects`, albums under `/gallery/`, and films under `/video-ads`. Attached work appears in the selected project's collection. The listing checkbox additionally lists attached work in its media section. The featured shelf shows up to six recently updated featured works on both home layouts. A published entry has its own share link at `/work/<id>`. Existing portfolio projects have a collection at `/work/project/<slug>`.

## Deployment

Apply the checked-in migration `supabase/migrations/20261118051542_portfolio_works.sql` to the same portfolio database as the site's existing `VITE_SUPABASE_URL`. It relies on the existing owner policy function `public.is_owner()`. It adds a table and a private storage bucket. Rolls out independently of existing public projects and existing video links.

The default upload path uses the existing Supabase connection. The bucket caps a single MP4/WebM file at 50 MiB. Files are uploaded directly using resumable TUS requests. Private assets receive one-hour signed links. Moving a work to draft prevents new public links to its media. Previously issued media links can work until they expire.

For adaptive streaming and larger source files, configure an already enabled Cloudflare Stream account on Vercel. Set **server-only** variables `CLOUDFLARE_STREAM_ACCOUNT_ID` and `CLOUDFLARE_STREAM_API_TOKEN` (Stream Write permission scoped to that account), alongside the existing Supabase URL and anonymous key. Deploy the function in `api/portfolio-stream.js` with the site. The owner session authorizes a single upload URL and the browser sends video bytes directly to Stream. Publication checks processing status. Signed playback is issued only for the public work that references the video, or to its owner for preview. Credentials are never sent to the browser. Do not enable provider billing as part of deploying the default path.
