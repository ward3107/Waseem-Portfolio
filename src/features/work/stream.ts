import { db } from '@/lib/content/db';

const endpoint = '/api/portfolio-stream';
export const isStream = (path?: string | null) => Boolean(path?.startsWith('stream:'));

export async function streamEnabled() {
  try {
    const response = await fetch(endpoint + '?action=capabilities');
    return response.ok && (await response.json()).enabled === true;
  } catch {
    return false;
  }
}

async function ownerHeader() {
  const client = await db();
  const {
    data: { session },
  } = await client.auth.getSession();
  if (!session) throw new Error('יש להתחבר מחדש.');
  return { Authorization: 'Bearer ' + session.access_token };
}

export async function streamPlayback(work: string, path: string, preview = false): Promise<string> {
  const qs = new URLSearchParams({
    action: preview ? 'preview' : 'play',
    work,
    uid: path.slice(7),
  });
  const response = await fetch(endpoint + '?' + qs, {
    headers: preview ? await ownerHeader() : {},
  });
  if (!response.ok) throw new Error('הסרטון עדיין בעיבוד או אינו זמין.');
  return (await response.json()).iframe;
}

export async function requireReadyStream(work: string, path: string) {
  const qs = new URLSearchParams({ action: 'check', work, uid: path.slice(7) });
  const response = await fetch(endpoint + '?' + qs, { headers: await ownerHeader() });
  if (!response.ok) throw new Error('לא ניתן לבדוק אם הסרטון מוכן.');
  const { state } = await response.json();
  if (state === 'error') throw new Error('עיבוד הסרטון נכשל. בחרו קובץ חדש.');
  if (state !== 'ready')
    throw new Error('הסרטון עדיין בעיבוד. הטיוטה נשמרת ואפשר לפרסם כשיהיה מוכן.');
}

type Ticket = { uid: string; url: string };
function readTicket(key: string): Ticket | null {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
}
function remember(key: string, ticket?: Ticket) {
  try {
    if (ticket) localStorage.setItem(key, JSON.stringify(ticket));
    else localStorage.removeItem(key);
  } catch {
    /* session can still finish */
  }
}

export async function uploadStream(
  work: string,
  file: File,
  progress: (n: number) => void,
  signal: AbortSignal
) {
  const { Upload } = await import('tus-js-client');
  const key = ['vasia-stream', work, file.name, file.size, file.lastModified].join('|');
  let ticket = readTicket(key);
  if (!ticket) {
    const response = await fetch(endpoint + '?action=create', {
      method: 'POST',
      signal,
      headers: { ...(await ownerHeader()), 'Content-Type': 'application/json' },
      body: JSON.stringify({ work, name: file.name, size: file.size }),
    });
    if (!response.ok) throw new Error('לא ניתן לפתוח העלאה לשירות הווידאו.');
    ticket = (await response.json()) as Ticket;
    remember(key, ticket);
  }
  const { url, uid } = ticket;
  await new Promise<void>((resolve, reject) => {
    const stop = () => {
      void upload.abort();
      reject(new DOMException('Paused', 'AbortError'));
    };
    const upload = new Upload(file, {
      uploadUrl: url,
      chunkSize: 10 * 1024 * 1024,
      storeFingerprintForResuming: false,
      retryDelays: [0, 1000, 3000, 5000, 10000],
      onProgress: (sent, total) => progress(Math.round((100 * sent) / total)),
      onSuccess: () => {
        signal.removeEventListener('abort', stop);
        resolve();
      },
      onError: (err) => {
        signal.removeEventListener('abort', stop);
        const status = 'originalResponse' in err ? err.originalResponse?.getStatus() : null;
        if (status === 404 || status === 410) remember(key);
        reject(err);
      },
    });
    if (signal.aborted) {
      stop();
      return;
    }
    signal.addEventListener('abort', stop, { once: true });
    upload.start();
  });
  remember(key);
  return 'stream:' + uid;
}
