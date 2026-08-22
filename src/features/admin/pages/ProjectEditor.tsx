import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Trash2, Sparkles, Loader2, Eye } from 'lucide-react';
import Topbar from '@/features/admin/layout/Topbar';
import Skeleton from '@/features/admin/primitives/Skeleton';
import ChipInput from '@/features/admin/primitives/ChipInput';
import MarkdownEditor from '@/features/admin/primitives/MarkdownEditor';
import ImageGallery from '@/features/admin/primitives/ImageGallery';
import ProjectPreviewCard from '@/features/admin/preview/ProjectPreviewCard';
import {
  createProject,
  deleteProject,
  listProjectRows,
  updateProject,
  type ProjectInput,
} from '@/lib/content/projects';
import { fetchRepoMeta } from '@/lib/github';
import { toastSaved, toastDeleted, toastError } from '@/lib/adminToast';
import { useConfirm } from '@/shared/hooks/useConfirm';
import type { LocalizedText, Language } from '@/types';

const EMPTY: ProjectInput = {
  slug: '',
  title: '',
  category: 'Web',
  description: { en: '', he: '', ar: '' } as LocalizedText,
  image_url: null,
  tech: [],
  link: null,
  github: null,
  screenshots: [],
  sort_order: 0,
};

/**
 * Coerce a typed URL to satisfy the DB's `^https?://` check (projects_link_scheme
 * / projects_gh_scheme): blank → null, a scheme-less host like "example.com" →
 * "https://example.com", an already-schemed URL kept as typed. Without this a
 * value like "careerconnect.com" reaches Postgres verbatim and the whole insert
 * is rejected with a check-constraint violation.
 */
const normalizeUrl = (value: string | null): string | null => {
  const v = (value ?? '').trim();
  if (!v) return null;
  // Lowercase the scheme when present — the DB check `~ '^https?://'` is
  // case-sensitive, so "HTTPS://x" would otherwise still be rejected.
  const schemed = v.match(/^(https?):\/\/(.*)$/i);
  if (schemed) return `${schemed[1].toLowerCase()}://${schemed[2]}`;
  return `https://${v}`;
};

/** slugify — lowercase, spaces→dashes, strip anything that's not [a-z0-9-]. */
const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const ProjectEditor: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isNew = !id;
  const navigate = useNavigate();
  const confirm = useConfirm();

  const [form, setForm] = useState<ProjectInput>(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [descLang, setDescLang] = useState<Language>('en');
  const [autoFilling, setAutoFilling] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const originalSlugRef = useRef<string>('');

  // Load existing project by id.
  useEffect(() => {
    if (isNew) return;
    let active = true;
    listProjectRows()
      .then((rows) => {
        if (!active) return;
        const row = rows.find((r) => r.id === id);
        if (!row) {
          toastError(new Error('Project not found'), 'Not found');
          navigate('/admin/projects');
          return;
        }
        const { id: _id, created_at: _c, updated_at: _u, ...rest } = row;
        // Ensure all three language keys exist so language-tab toggling can
        // always render a controlled input.
        const desc = rest.description ?? {};
        setForm({
          ...rest,
          description: { en: desc.en ?? '', he: desc.he ?? '', ar: desc.ar ?? '' },
        });
        originalSlugRef.current = row.slug;
      })
      .catch((err) => toastError(err, 'Could not load project'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id, isNew, navigate]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const patch = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  };

  // Auto-derive slug from title on blur (only when the slug is empty/untouched).
  const onTitleBlur = () => {
    if (!form.slug && form.title) {
      patch('slug', slugify(form.title));
    }
  };

  const autoFillFromGithub = async () => {
    if (!form.github) return;
    setAutoFilling(true);
    try {
      const meta = await fetchRepoMeta(form.github);
      if (!meta) throw new Error('GitHub API returned no data for that URL');
      setForm((f) => ({
        ...f,
        title: f.title || meta.title,
        description: { ...f.description, en: f.description.en || meta.description },
        tech: f.tech.length ? f.tech : meta.tech,
      }));
      setDirty(true);
      toastSaved('Fields filled from GitHub');
    } catch (err) {
      toastError(err, 'Auto-fill failed');
    } finally {
      setAutoFilling(false);
    }
  };

  const save = async () => {
    if (saving || !dirty || !form.slug || !form.title) return;
    setSaving(true);
    try {
      // First screenshot is the cover: mirror it into image_url — including
      // null when all screenshots have been removed, so admins can actually
      // publish a text-only card.
      // Normalize the URL fields so a scheme-less entry ("careerconnect.com")
      // satisfies the DB's `^https?://` check instead of failing the insert.
      const payload: ProjectInput = {
        ...form,
        link: normalizeUrl(form.link),
        github: normalizeUrl(form.github),
        image_url: form.screenshots[0] ?? null,
      };
      if (isNew) {
        await createProject(payload);
        toastSaved('Project created');
        setDirty(false);
        navigate('/admin/projects');
      } else if (id) {
        await updateProject(id, payload);
        toastSaved('Project');
        setDirty(false);
      }
    } catch (err) {
      toastError(err, 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  // Cmd/Ctrl+S saves. Listener attaches once; the ref keeps `save` fresh
  // without re-attaching the keydown handler on every render.
  const saveRef = useRef(save);
  useEffect(() => { saveRef.current = save; });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onDelete = async () => {
    if (isNew || !id) return;
    const ok = await confirm({
      title: `Delete "${form.title}"?`,
      body: 'This removes the project from the public site.',
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteProject(id);
      toastDeleted(form.title);
      navigate('/admin/projects');
    } catch (err) {
      toastError(err, 'Could not delete');
    }
  };

  const previewMemo = useMemo(
    () => (
      <ProjectPreviewCard
        title={form.title}
        category={form.category}
        description={form.description}
        image_url={form.screenshots[0] ?? form.image_url}
        tech={form.tech}
      />
    ),
    [form.title, form.category, form.description, form.screenshots, form.image_url, form.tech]
  );

  return (
    <>
      <Topbar
        title={isNew ? 'New project' : `Edit: ${form.title || '…'}`}
        actions={
          <>
            <button
              type="button"
              onClick={() => setShowPreview((s) => !s)}
              className="xl:hidden inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            >
              <Eye size={14} aria-hidden="true" />
              {showPreview ? 'Hide preview' : 'Preview'}
            </button>
            {!isNew && (
              <button
                type="button"
                onClick={onDelete}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                <Trash2 size={14} aria-hidden="true" />
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={save}
              disabled={saving || !dirty || !form.slug || !form.title}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md bg-brand-purple text-white hover:bg-brand-purpleLight disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Save size={14} aria-hidden="true" />}
              {saving ? 'Saving…' : 'Save'}
            </button>
          </>
        }
      />

      {loading ? (
        <div className="p-6 space-y-3">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <div className="grid xl:grid-cols-[minmax(0,1fr)_320px] gap-6 p-4 sm:p-6">
          {/* Form */}
          <div className="space-y-6 min-w-0">
            <fieldset className="space-y-3">
              <legend className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500 mb-2">Basics</legend>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Title</span>
                  <input
                    required
                    type="text"
                    value={form.title}
                    onChange={(e) => patch('title', e.target.value)}
                    onBlur={onTitleBlur}
                    className="mt-1 w-full px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Slug</span>
                  <input
                    required
                    type="text"
                    value={form.slug}
                    onChange={(e) => patch('slug', slugify(e.target.value))}
                    placeholder="auto-from-title"
                    className="mt-1 w-full px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-purple font-mono"
                  />
                </label>
              </div>
              <div className="flex gap-2">
                {(['Web', 'AI', 'Mobile'] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => patch('category', c)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md ${
                      form.category === c ? 'bg-brand-purple text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Live URL</span>
                  <input
                    type="url"
                    value={form.link ?? ''}
                    onChange={(e) => patch('link', e.target.value || null)}
                    placeholder="https://…"
                    className="mt-1 w-full px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">GitHub URL</span>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="url"
                      value={form.github ?? ''}
                      onChange={(e) => patch('github', e.target.value || null)}
                      placeholder="https://github.com/…"
                      className="flex-1 px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    />
                    <button
                      type="button"
                      onClick={autoFillFromGithub}
                      disabled={!form.github || autoFilling}
                      className="inline-flex items-center gap-1 px-2 text-xs font-semibold rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50"
                      title="Auto-fill title + description + tech from GitHub"
                    >
                      {autoFilling ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      Auto-fill
                    </button>
                  </div>
                </label>
              </div>
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500 mb-2">Description</legend>
              <div className="flex gap-1 text-xs">
                {(['en', 'he', 'ar'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setDescLang(lang)}
                    className={`px-2 py-1 rounded ${
                      descLang === lang ? 'bg-zinc-200 dark:bg-zinc-700 font-semibold' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    {lang.toUpperCase()}
                    {lang === 'en' && ' *'}
                  </button>
                ))}
              </div>
              <MarkdownEditor
                value={form.description[descLang] ?? ''}
                onChange={(v) => patch('description', { ...form.description, [descLang]: v })}
                placeholder={descLang === 'en' ? 'Required. What is this project?' : 'Optional translation. Falls back to English.'}
                ariaLabel={`Description in ${descLang.toUpperCase()}`}
              />
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500 mb-2">Tech stack</legend>
              <ChipInput
                value={form.tech}
                onChange={(next) => patch('tech', next)}
                placeholder="Add a tech (Enter to commit)"
                ariaLabel="Tech stack"
              />
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500 mb-2">Images</legend>
              <ImageGallery
                value={form.screenshots}
                folder={`projects/${form.slug || 'misc'}`}
                onChange={(urls) => patch('screenshots', urls)}
              />
            </fieldset>
          </div>

          {/* Live preview */}
          <aside className={`xl:sticky xl:top-16 xl:self-start space-y-2 ${showPreview ? '' : 'hidden xl:block'}`}>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
              Live preview (EN)
            </p>
            <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 p-6">
              {previewMemo}
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

export default ProjectEditor;
