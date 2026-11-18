/* global process, Buffer */
/** Owner-only upload provisioning. Cloudflare credentials are server-only. */
const uuid = /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i;
const mediaId = /^[\da-f]{32}$/i;

export default async function handler(req, res) {
  const {
    CLOUDFLARE_STREAM_ACCOUNT_ID: account,
    CLOUDFLARE_STREAM_API_TOKEN: token,
    VITE_SUPABASE_URL: database,
    VITE_SUPABASE_ANON_KEY: anon,
  } = process.env;
  const enabled = Boolean(account && token && database && anon);
  res.setHeader('Cache-Control', 'private, no-store');
  const action = req.query.action;
  if (req.method === 'GET' && action === 'capabilities') return res.status(200).json({ enabled });
  if (!enabled) return res.status(503).json({ error: 'Stream is not configured' });
  if (!['create', 'check', 'preview', 'play'].includes(action)) return res.status(404).end();
  if (req.method !== (action === 'create' ? 'POST' : 'GET')) return res.status(405).end();
  const work = action === 'create' ? req.body?.work : req.query.work;
  const uid = req.query.uid;
  if (!uuid.test(work) || (action !== 'create' && !mediaId.test(uid))) return res.status(400).end();

  const base = 'https://api.cloudflare.com/client/v4/accounts/' + account + '/stream';
  const cf = { Authorization: 'Bearer ' + token };
  try {
    if (action === 'play') {
      // Never use an admin session for the public playback authorization check.
      const url = new URL('/rest/v1/portfolio_works', database);
      url.search = new URLSearchParams({
        select: 'id',
        id: 'eq.' + work,
        published: 'eq.true',
        video_path: 'eq.stream:' + uid,
      });
      const match = await fetch(url, {
        headers: { apikey: anon, Authorization: 'Bearer ' + anon },
      });
      if (!match.ok || !(await match.json()).length) return res.status(404).end();
    } else {
      const authorization = req.headers.authorization || '';
      if (!authorization.startsWith('Bearer ')) return res.status(401).end();
      const owner = await fetch(new URL('/rest/v1/rpc/is_owner', database), {
        method: 'POST',
        headers: { apikey: anon, authorization, 'Content-Type': 'application/json' },
        body: '{}',
      });
      if (!owner.ok || (await owner.json()) !== true) return res.status(403).end();
    }

    if (action === 'create') {
      const size = req.body?.size;
      if (!Number.isSafeInteger(size) || size < 1 || size > 30_000_000_000)
        return res.status(400).end();
      const name = String(req.body.name || 'portfolio').slice(0, 180);
      const meta = ['requiresignedurls', 'name ' + Buffer.from(name).toString('base64')].join(',');
      const created = await fetch(base + '?direct_user=true', {
        method: 'POST',
        headers: {
          ...cf,
          'Tus-Resumable': '1.0.0',
          'Upload-Length': String(size),
          'Upload-Metadata': meta,
          'Upload-Creator': 'vasia-work-' + work,
        },
      });
      const uid = created.headers.get('stream-media-id');
      const location = created.headers.get('location');
      if (!created.ok || !mediaId.test(uid) || !location)
        return res.status(502).json({ error: 'Upload could not be created' });
      const upload = new URL(location);
      if (
        upload.protocol !== 'https:' ||
        !/\.(?:videodelivery\.net|cloudflarestream\.com)$/.test(upload.hostname)
      )
        return res.status(502).end();
      return res.status(201).json({ uid, url: upload.href });
    }

    const read = await fetch(base + '/' + uid, { headers: cf });
    const video = read.ok ? (await read.json()).result : null;
    if (!video || video.creator !== 'vasia-work-' + work || !video.requireSignedURLs)
      return res.status(404).end();
    const state =
      video.status?.state === 'error' ? 'error' : video.readyToStream ? 'ready' : 'processing';
    if (action === 'check') return res.status(200).json({ state });
    if (state !== 'ready') return res.status(409).json({ state });
    const host = new URL(video.playback.hls);
    if (
      host.protocol !== 'https:' ||
      !/^(?:customer-[\w-]+\.cloudflarestream\.com|videodelivery\.net)$/.test(host.hostname)
    )
      return res.status(502).end();
    const signed = await fetch(base + '/' + uid + '/token', { method: 'POST', headers: cf });
    const playback = signed.ok && (await signed.json()).result?.token;
    if (!playback) return res.status(502).end();
    return res
      .status(200)
      .json({ iframe: host.origin + '/' + encodeURIComponent(playback) + '/iframe' });
  } catch {
    return res.status(502).json({ error: 'The video service is unavailable' });
  }
}
