import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProjects } from '@/features/projects/useProjects';
import { STUDIO_VIDEOS } from '@/features/video-ads/portfolio';
import {
  blankWork,
  destinations,
  labels,
  PAGE_SIZE,
  projectKey,
  projectUrl,
  publicationError,
  websiteUrl,
  workUrl,
  type Kind,
  type Work,
} from './model';
import { listAdminWorks, mediaUrls, parentChoices, saveWork } from './repository';
import {
  isStream,
  requireReadyStream,
  streamEnabled,
  streamPlayback,
  uploadStream,
} from './stream';
import { uploadPhoto, uploadVideo, videoCover } from './upload';

function explain(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error) return String(error.message);
  return 'הפעולה נכשלה. אפשר לנסות שוב.';
}

function Preview({ work, target }: { work: Work; target?: string }) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [playing, setPlaying] = useState('');
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    setPlaying('');
    setFailed(false);
    mediaUrls(work.photos)
      .then((value) => {
        if (active) setUrls(value);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [work.photos, work.video_path]);
  return (
    <div className="work-preview">
      <strong>תצוגה מקדימה</strong>
      <h2>{work.title || 'שם העבודה'}</h2>
      <p>יופיע אחרי הפרסום ב־{destinations(work, target).join(' · ')}</p>
      {!!work.photos.length && (
        <div className="work-thumbs">
          {work.photos.map(
            (p, i) =>
              urls[p] && (
                <figure key={p}>
                  <img src={urls[p]} alt={i ? 'תמונה ' + (i + 1) : 'תמונת הכיסוי'} />
                </figure>
              )
          )}
        </div>
      )}
      {work.kind === 'video' &&
        work.video_path &&
        (playing && isStream(work.video_path) ? (
          <iframe
            className="work-stream"
            src={playing}
            title={work.title}
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        ) : playing ? (
          <video className="work-preview-video" src={playing} controls playsInline autoPlay />
        ) : (
          <button
            type="button"
            onClick={async () => {
              try {
                const path = work.video_path!;
                const url = isStream(path)
                  ? await streamPlayback(work.id, path, true)
                  : (await mediaUrls([path]))[path];
                if (!url) throw new Error();
                setPlaying(url);
              } catch {
                setFailed(true);
              }
            }}
          >
            ניגון לפני פרסום
          </button>
        ))}
      {failed && <p role="alert">לא ניתן לטעון את התצוגה המקדימה.</p>}
    </div>
  );
}

export default function WorkManager() {
  const [params] = useSearchParams();
  const initialParent = params.get('project') || '';
  const { projects } = useProjects();
  const [work, setWork] = useState<Work>(() => blankWork(initialParent));
  const [rows, setRows] = useState<Work[]>([]);
  const [sites, setSites] = useState<Pick<Work, 'id' | 'title'>[]>([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [adaptive, setAdaptive] = useState(false);
  useEffect(() => {
    let active = true;
    void streamEnabled().then((value) => {
      if (active) setAdaptive(value);
    });
    return () => {
      active = false;
    };
  }, []);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [libraryError, setLibraryError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const guard = useRef(false);
  const uploadController = useRef<AbortController | null>(null);

  useEffect(() => () => uploadController.current?.abort(), []);
  useEffect(() => {
    let active = true;
    Promise.all([listAdminWorks(page * PAGE_SIZE), parentChoices()])
      .then(([items, parents]) => {
        if (!active) return;
        setLibraryError('');
        setSites(parents);
        setRows(items.slice(0, PAGE_SIZE));
        setHasNext(items.length > PAGE_SIZE);
      })
      .catch((e) => {
        if (active) setLibraryError(explain(e));
      });
    return () => {
      active = false;
    };
  }, [page, refresh]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  const choices = [
    ...projects.map((p) => ({ key: 'project/' + p.id, title: p.title })),
    ...sites.filter((p) => p.id !== work.id).map((p) => ({ key: 'work/' + p.id, title: p.title })),
  ];
  const parent = projectKey(work);
  const destinationName = choices.find((option) => option.key === parent)?.title;
  const shareUrl = new URL(workUrl(work.id), window.location.origin).href;

  function edit(values: Partial<Work>) {
    setWork((w) => ({ ...w, ...values }));
    setDirty(true);
    setCanShare(false);
    setStatus('');
    setError('');
  }
  function open(row: Work) {
    if (
      guard.current ||
      (dirty && !window.confirm('לעבור לעבודה אחרת ולוותר על העריכות שטרם נשמרו?'))
    )
      return;
    setWork(row);
    setDirty(false);
    setCanShare(row.published);
    setStatus('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function changeKind(kind: Kind) {
    if (kind === work.kind) return;
    if (work.video_path && kind !== 'video' && !window.confirm('להסיר את הסרטון מהעריכה הזו?'))
      return;
    edit({
      kind,
      video_path: kind === 'video' ? work.video_path : null,
      website_url: kind === 'website' ? work.website_url : null,
      ...(kind === 'website' ? { parent_id: null, project_slug: null, listed: true } : {}),
    });
  }
  function chooseParent(key: string) {
    edit({
      parent_id: key.startsWith('work/') ? key.slice(5) : null,
      project_slug: key.startsWith('project/') ? key.slice(8) : null,
      listed: !key,
    });
  }
  async function persist(publish: boolean) {
    if (guard.current) return;
    const input = {
      ...work,
      title: work.title.trim(),
      website_url: websiteUrl(work.website_url),
      published: publish,
    };
    const problem = publish && publicationError(input);
    if (problem) {
      setError(problem);
      return;
    }
    guard.current = true;
    setBusy(true);
    setError('');
    try {
      if (publish && input.video_path && isStream(input.video_path))
        await requireReadyStream(input.id, input.video_path);
      const saved = await saveWork(input);
      setWork(saved);
      setDirty(false);
      setCanShare(publish);
      setStatus(publish ? 'העבודה פורסמה.' : 'הטיוטה נשמרה.');
      setPage(0);
      setRefresh((n) => n + 1);
    } catch (e) {
      setError(explain(e));
    } finally {
      guard.current = false;
      setBusy(false);
    }
  }

  async function upload(files: File[], video: boolean) {
    if (!files.length || guard.current) return;
    if (!video && work.photos.length + files.length > 100) {
      setError('אפשר לצרף עד 100 תמונות לעבודה.');
      return;
    }
    guard.current = true;
    setBusy(true);
    setError('');
    setCanShare(false);
    const controller = new AbortController();
    uploadController.current = controller;
    setUploadingVideo(video);
    let next = {
      ...work,
      title: work.title || files[0].name.replace(/\.[^.]+$/, '').slice(0, 180),
    };
    try {
      // Reserve a durable draft ID before uploading. A network interruption
      // can resume under the same draft without exposing a partial work.
      if (!next.updated_at) {
        next = await saveWork({
          ...next,
          published: false,
          website_url: websiteUrl(next.website_url),
        });
        setWork(next);
      }
      for (const [i, file] of files.entries()) {
        if (video && i > 0) {
          next = await saveWork({
            ...blankWork(projectKey(work)),
            kind: 'video',
            listed: work.listed,
            title: file.name.replace(/\.[^.]+$/, '').slice(0, 180),
          });
          setWork(next);
        }
        if (video) {
          const path = await (adaptive ? uploadStream : uploadVideo)(
            next.id,
            file,
            (pct) =>
              setStatus('העלאת סרטון ' + (i + 1) + ' מתוך ' + files.length + ' · ' + pct + '%'),
            controller.signal
          );
          const cover = !next.photos.length ? await videoCover(next.id, file) : null;
          next = { ...next, video_path: path, photos: cover ? [cover] : next.photos };
        } else {
          setStatus('העלאת תמונה ' + (i + 1) + ' מתוך ' + files.length);
          const path = await uploadPhoto(next.id, file);
          next = { ...next, photos: [...next.photos, path] };
        }
        // Drafts checkpoint every completed file. Edits to a live work stay
        // local until the owner explicitly approves publication.
        setWork(next);
        setDirty(true);
        if (!next.published)
          next = await saveWork({ ...next, website_url: websiteUrl(next.website_url) });
        setWork(next);
        setDirty(next.published);
      }
      setStatus(
        video && files.length > 1
          ? 'נשמרו ' + files.length + ' טיוטות. אפשר לפרסם כל סרטון מרשימת העבודות.'
          : next.published
            ? 'הקבצים מוכנים לתצוגה מקדימה. יש לאשר את העדכון.'
            : 'הקבצים נשמרו בטיוטה.'
      );
    } catch (e) {
      setError(
        controller.signal.aborted
          ? 'ההעלאה הושהתה. לביצוע המשך בחרו שוב את אותו הקובץ בטיוטה הזו.'
          : explain(e)
      );
      setStatus('');
    } finally {
      uploadController.current = null;
      setUploadingVideo(false);
      guard.current = false;
      setBusy(false);
      setRefresh((n) => n + 1);
    }
  }

  return (
    <div className="work-manager" dir="rtl" lang="he">
      <link rel="stylesheet" href="/portfolio-work.css" precedence="work" />
      <h1>הוספת עבודה</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void persist(true);
        }}
      >
        <fieldset disabled={busy}>
          <legend>מה מוסיפים?</legend>
          <div className="work-tabs">
            {(['website', 'video', 'album'] as const).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={work.kind === k}
                onClick={() => changeKind(k)}
              >
                {labels.he[k]}
              </button>
            ))}
          </div>
          <label>
            שם העבודה
            <input
              required
              maxLength={180}
              value={work.title}
              onChange={(e) => edit({ title: e.target.value })}
            />
          </label>
          {work.kind === 'website' ? (
            <label>
              כתובת האתר
              <input
                dir="ltr"
                inputMode="url"
                placeholder="https://"
                value={work.website_url ?? ''}
                onChange={(e) => edit({ website_url: e.target.value })}
              />
            </label>
          ) : (
            <label>
              שיוך לפרויקט
              <select value={parent} onChange={(e) => chooseParent(e.target.value)}>
                <option value="">עבודה עצמאית</option>
                {choices.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.title}
                  </option>
                ))}
              </select>
            </label>
          )}
          {work.kind === 'video' && (
            <>
              <label>
                סרטון מהטלפון
                <input
                  type="file"
                  multiple={!work.updated_at}
                  accept={adaptive ? 'video/*' : 'video/mp4,video/webm'}
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    e.target.value = '';
                    void upload(files, true);
                  }}
                />
                <small>
                  {adaptive
                    ? 'ניגון מותאם למהירות החיבור באמצעות Cloudflare Stream.'
                    : 'MP4 או WebM, עד 50 MB.'}{' '}
                  אפשר לבחור כמה סרטונים כטיוטות נפרדות. לחידוש העלאה בחרו שוב את אותו הקובץ.
                </small>
              </label>
              <details>
                <summary>בחירה מסרטוני הסטודיו הקיימים</summary>
                <label>
                  סרטון קיים
                  <select
                    value={STUDIO_VIDEOS.find((v) => v.src === work.video_path)?.id ?? ''}
                    onChange={(e) => {
                      const v = STUDIO_VIDEOS.find((film) => film.id === e.target.value);
                      if (v)
                        edit({
                          video_path: v.src,
                          photos: [
                            v.poster,
                            ...work.photos.filter(
                              (p) => p !== v.poster && !p.startsWith('/assets/video-ads/')
                            ),
                          ],
                          title: work.title || v.title.he,
                        });
                    }}
                  >
                    <option value="">בחירת סרטון</option>
                    {STUDIO_VIDEOS.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.title.he} · {v.id}
                      </option>
                    ))}
                  </select>
                </label>
              </details>
            </>
          )}
          <label>
            {work.kind === 'website' ? 'צילומי מסך ותמונת כיסוי' : 'תמונות לעבודה'}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                e.target.value = '';
                void upload(files, false);
              }}
            />
          </label>
          {!!work.photos.length && (
            <details>
              <summary>בחירת כיסוי והסרת תמונות</summary>
              {work.photos.map((p, i) => (
                <div key={p} className="work-actions">
                  <span>
                    תמונה {i + 1}
                    {i === 0 && ' · כיסוי'}
                  </span>
                  {i > 0 && (
                    <button
                      type="button"
                      onClick={() => edit({ photos: [p, ...work.photos.filter((x) => x !== p)] })}
                    >
                      בחירה ככיסוי
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => edit({ photos: work.photos.filter((x) => x !== p) })}
                  >
                    הסרה
                  </button>
                </div>
              ))}
            </details>
          )}
          {parent && (
            <label className="work-check">
              <input
                type="checkbox"
                checked={work.listed}
                onChange={(e) => edit({ listed: e.target.checked })}
              />
              הצגה גם ב{work.kind === 'video' ? 'עמוד הסרטונים' : 'גלריית התמונות'}
            </label>
          )}
          <label className="work-check">
            <input
              type="checkbox"
              checked={work.featured}
              onChange={(e) => edit({ featured: e.target.checked })}
            />
            מומלץ בדף הבית
          </label>
          <Preview work={work} target={destinationName} />
          <div className="work-actions">
            <button className="primary" type="submit">
              {work.published ? 'פרסום העדכון' : 'פרסום'}
            </button>
            <button
              type="button"
              onClick={() => {
                if (
                  !work.published ||
                  window.confirm('להסיר את העבודה מהתצוגה הציבורית ולשמור כטיוטה?')
                )
                  void persist(false);
              }}
            >
              {work.published ? 'החזרה לטיוטה' : 'שמירת טיוטה'}
            </button>
          </div>
        </fieldset>
        {uploadingVideo && (
          <button type="button" onClick={() => uploadController.current?.abort()}>
            השהיית ההעלאה
          </button>
        )}
        <p role="status">{status}</p>
        {error && <p role="alert">{error}</p>}
        {canShare && (
          <div className="work-actions">
            <a className="work-action" target="_blank" rel="noopener noreferrer" href={shareUrl}>
              פתיחת העבודה
            </a>
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(shareUrl);
                  setStatus('הקישור הועתק.');
                } catch {
                  setStatus(shareUrl);
                }
              }}
            >
              העתקת קישור
            </button>
            {parent && (
              <a
                className="work-action"
                href={work.parent_id ? workUrl(work.parent_id) : projectUrl(work.project_slug!)}
                target="_blank"
                rel="noopener noreferrer"
              >
                פתיחת תיק הפרויקט
              </a>
            )}
          </div>
        )}
      </form>
      {work.kind === 'website' && (
        <a className="work-action" href="/admin/projects/new">
          עורך פרויקטים מתקדם
        </a>
      )}
      <section className="work-panel">
        <div className="work-list-item">
          <h2>העבודות שלי</h2>
          <button disabled={busy} onClick={() => open(blankWork(initialParent))}>
            עבודה חדשה
          </button>
        </div>
        {libraryError && (
          <p role="alert">
            טעינת העבודות נכשלה.{' '}
            <button onClick={() => setRefresh((n) => n + 1)}>ניסיון נוסף</button> {libraryError}
          </p>
        )}
        {rows.map((row) => (
          <div className="work-list-item" key={row.id}>
            <p>
              <strong>{row.title || 'עבודה ללא שם'}</strong> · {labels.he[row.kind]} ·{' '}
              {row.published ? 'פורסם' : 'טיוטה'}
            </p>
            <button disabled={busy} onClick={() => open(row)}>
              עריכה
            </button>
            {row.kind === 'website' && row.published && (
              <button disabled={busy} onClick={() => open(blankWork('work/' + row.id))}>
                הוספת חומר לפרויקט
              </button>
            )}
          </div>
        ))}
        <div className="work-actions">
          {page > 0 && <button onClick={() => setPage((n) => n - 1)}>הקודם</button>}
          {hasNext && <button onClick={() => setPage((n) => n + 1)}>הבא</button>}
        </div>
      </section>
    </div>
  );
}
