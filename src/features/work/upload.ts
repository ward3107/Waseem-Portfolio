import { db } from '@/lib/content/db';
import { supabaseAnonKey, supabaseUrl } from '@/lib/supabaseConfig';
import { BUCKET } from './model';

async function imageBlob(
  source: CanvasImageSource,
  width: number,
  height: number,
  maxSide: number
): Promise<Blob> {
  if (!width || !height) throw new Error('לא ניתן לקרוא את ממדי התמונה.');
  const ratio = Math.min(1, maxSide / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * ratio));
  canvas.height = Math.max(1, Math.round(height * ratio));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('לא ניתן לעבד את התמונה.');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('עיבוד התמונה נכשל.'))),
      'image/jpeg',
      0.84
    );
  });
}

async function storePhoto(
  workId: string,
  source: CanvasImageSource,
  width: number,
  height: number
): Promise<string> {
  const client = await db();
  const bucket = client.storage.from(BUCKET);
  const key = workId + '/' + crypto.randomUUID();
  const full = key + '.jpg';
  const thumb = key + '-thumb.jpg';
  const [image, small] = await Promise.all([
    imageBlob(source, width, height, 1400),
    imageBlob(source, width, height, 480),
  ]);
  const options = { contentType: 'image/jpeg', cacheControl: '3600' };
  const results = await Promise.all([
    bucket.upload(full, image, options),
    bucket.upload(thumb, small, options),
  ]);
  const failure = results.find((item) => item.error)?.error;
  if (failure) {
    await bucket.remove([full, thumb]).catch(() => undefined);
    throw failure;
  }
  return full;
}

export async function uploadPhoto(workId: string, file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return await storePhoto(workId, image, image.naturalWidth, image.naturalHeight);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function videoCover(workId: string, file: File): Promise<string | null> {
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  try {
    await new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(() => reject(new Error('Video cover timeout')), 5000);
      const finish = (ok: boolean) => {
        clearTimeout(timer);
        if (ok) resolve();
        else reject(new Error('Video unavailable'));
      };
      video.onloadedmetadata = () => {
        video.currentTime = Math.min(0.25, (video.duration || 1) / 2);
      };
      video.onseeked = () => finish(true);
      video.onerror = () => finish(false);
      video.src = url;
    });
    return await storePhoto(workId, video, video.videoWidth, video.videoHeight);
  } catch {
    return null;
  } finally {
    video.removeAttribute('src');
    video.load();
    URL.revokeObjectURL(url);
  }
}

export async function uploadVideo(
  workId: string,
  file: File,
  progress: (value: number) => void,
  signal: AbortSignal
): Promise<string> {
  if (!file.size || file.size > 50 * 1024 * 1024) throw new Error('בחרו סרטון עד 50 MB.');
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const tag = String.fromCharCode(...head.slice(4, 8));
  const mp4 = tag === 'ftyp' && String.fromCharCode(...head.slice(8, 12)) !== 'qt  ';
  const webm = head[0] === 0x1a && head[1] === 0x45 && head[2] === 0xdf && head[3] === 0xa3;
  if (!mp4 && !webm) throw new Error('יש לבחור וידאו בפורמט MP4 או WebM.');
  const [{ Upload }, client] = await Promise.all([import('tus-js-client'), db()]);
  const {
    data: { session },
  } = await client.auth.getSession();
  if (!session) throw new Error('יש להתחבר מחדש.');
  const path = workId + '/' + crypto.randomUUID() + (mp4 ? '.mp4' : '.webm');
  const id = [BUCKET, supabaseUrl, workId, file.name, file.size, file.lastModified].join('|');
  const endpoint = new URL('/storage/v1/upload/resumable', supabaseUrl);
  let storedPath = path;
  await new Promise<void>((resolve, reject) => {
    const stop = () => {
      void upload.abort();
      reject(new DOMException('Upload paused', 'AbortError'));
    };
    const upload = new Upload(file, {
      endpoint: endpoint.href,
      headers: { apikey: supabaseAnonKey },
      chunkSize: 6 * 1024 * 1024,
      retryDelays: [0, 1000, 3000, 5000, 10000],
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      fingerprint: async () => id,
      metadata: {
        bucketName: BUCKET,
        objectName: path,
        contentType: mp4 ? 'video/mp4' : 'video/webm',
        cacheControl: '3600',
      },
      onBeforeRequest: async (request) => {
        const { data } = await client.auth.getSession();
        if (!data.session) throw new Error('יש להתחבר מחדש.');
        request.setHeader('Authorization', 'Bearer ' + data.session.access_token);
      },
      onError: (error) => {
        signal.removeEventListener('abort', stop);
        reject(error);
      },
      onSuccess: () => {
        signal.removeEventListener('abort', stop);
        resolve();
      },
      onProgress: (sent, total) => {
        if (!signal.aborted) progress(Math.round((100 * sent) / total));
      },
    });
    void upload
      .findPreviousUploads()
      .then((previous) => {
        if (signal.aborted) {
          stop();
          return;
        }
        const saved = previous.find((item) => item.metadata?.objectName?.startsWith(workId + '/'));
        if (saved) {
          storedPath = saved.metadata!.objectName;
          upload.resumeFromPreviousUpload(saved);
          // tus-js-client creates a fresh upload when the saved URL expired.
          // In that case the new upload must still write the previously selected path.
          upload.options.metadata = { ...upload.options.metadata, objectName: storedPath };
        }
        signal.addEventListener('abort', stop, { once: true });
        upload.start();
      })
      .catch(reject);
  });
  return storedPath;
}
