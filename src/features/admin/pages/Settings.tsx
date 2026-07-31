import React, { useEffect, useState } from 'react';
import { Save, Loader2, Download } from 'lucide-react';
import Topbar from '@/features/admin/layout/Topbar';
import Skeleton from '@/features/admin/primitives/Skeleton';
import { getSettings, updateSettings, type SettingsPatch } from '@/lib/content/settings';
import { listProjectRows } from '@/lib/content/projects';
import { listCertRows } from '@/lib/content/certifications';
import { listReviewRows } from '@/lib/content/reviews';
import { toastSaved, toastError } from '@/lib/adminToast';
import type { LocalizedText, Language } from '@/types';

const emptyLocalized: LocalizedText = { en: '', he: '', ar: '' };

const EMPTY: SettingsPatch = {
  contact_email: '',
  whatsapp: '',
  github_url: '',
  linkedin_url: '',
  twitter_url: '',
  hero_badge: emptyLocalized,
  hero_headline: emptyLocalized,
  hero_subtitle: emptyLocalized,
  seo_title: '',
  seo_description: '',
};

const LocalizedRow: React.FC<{
  label: string;
  value: LocalizedText;
  onChange: (v: LocalizedText) => void;
  multiline?: boolean;
}> = ({ label, value, onChange, multiline }) => {
  const [lang, setLang] = useState<Language>('en');
  const set = (l: Language, v: string) => onChange({ ...value, [l]: v });
  return (
    <div>
      <div className="flex items-center gap-1 text-xs mb-1">
        <span className="font-medium mr-2">{label}</span>
        {(['en', 'he', 'ar'] as Language[]).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            className={`px-2 py-0.5 rounded ${lang === l ? 'bg-zinc-200 dark:bg-zinc-700 font-semibold' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>
      {multiline ? (
        <textarea
          rows={2}
          value={value[lang] ?? ''}
          onChange={(e) => set(lang, e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-purple"
        />
      ) : (
        <input
          value={value[lang] ?? ''}
          onChange={(e) => set(lang, e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-purple"
        />
      )}
    </div>
  );
};

const Settings: React.FC = () => {
  const [form, setForm] = useState<SettingsPatch>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let active = true;
    getSettings()
      .then((row) => {
        if (!active) return;
        if (row) {
          const merged: SettingsPatch = {
            contact_email: row.contact_email ?? '',
            whatsapp: row.whatsapp ?? '',
            github_url: row.github_url ?? '',
            linkedin_url: row.linkedin_url ?? '',
            twitter_url: row.twitter_url ?? '',
            hero_badge: { ...emptyLocalized, ...(row.hero_badge ?? {}) },
            hero_headline: { ...emptyLocalized, ...(row.hero_headline ?? {}) },
            hero_subtitle: { ...emptyLocalized, ...(row.hero_subtitle ?? {}) },
            seo_title: row.seo_title ?? '',
            seo_description: row.seo_description ?? '',
          };
          setForm(merged);
        }
      })
      .catch((err) => toastError(err, 'Could not load settings'))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const patch = <K extends keyof SettingsPatch>(key: K, value: SettingsPatch[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      await updateSettings(form);
      toastSaved('Settings');
    } catch (err) {
      toastError(err, 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const exportJson = async () => {
    setExporting(true);
    try {
      const [projects, certs, reviews, settings] = await Promise.all([
        listProjectRows(),
        listCertRows(),
        listReviewRows(),
        getSettings(),
      ]);
      const blob = new Blob(
        [JSON.stringify({ exportedAt: new Date().toISOString(), settings, projects, certs, reviews }, null, 2)],
        { type: 'application/json' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `waseem-portfolio-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toastSaved('Export ready');
    } catch (err) {
      toastError(err, 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <Topbar
        title="Settings"
        actions={
          <button
            type="button"
            onClick={save}
            disabled={saving || loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md bg-brand-purple text-white hover:bg-brand-purpleLight disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Saving…' : 'Save'}
          </button>
        }
      />

      {loading ? (
        <div className="p-6 space-y-3">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <div className="p-4 sm:p-6 max-w-2xl space-y-8">
          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Contact</legend>
            <label className="block">
              <span className="text-xs font-medium">Email</span>
              <input
                type="email"
                value={form.contact_email ?? ''}
                onChange={(e) => patch('contact_email', e.target.value)}
                placeholder="hello@example.com"
                className="mt-1 w-full px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-purple"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium">WhatsApp (digits only)</span>
              <input
                value={form.whatsapp ?? ''}
                onChange={(e) => patch('whatsapp', e.target.value)}
                placeholder="972534260632"
                className="mt-1 w-full px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-purple"
              />
            </label>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Social links</legend>
            {([
              ['github_url', 'GitHub URL', 'https://github.com/…'],
              ['linkedin_url', 'LinkedIn URL', 'https://linkedin.com/in/…'],
              ['twitter_url', 'Twitter / X URL', 'https://x.com/…'],
            ] as const).map(([k, label, ph]) => (
              <label key={k} className="block">
                <span className="text-xs font-medium">{label}</span>
                <input
                  type="url"
                  value={(form[k] as string | null) ?? ''}
                  onChange={(e) => patch(k, e.target.value)}
                  placeholder={ph}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                />
              </label>
            ))}
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Hero (currently hardcoded)</legend>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              Leaving a field blank keeps the existing translation from the code.
            </p>
            <LocalizedRow label="Badge" value={form.hero_badge ?? emptyLocalized} onChange={(v) => patch('hero_badge', v)} />
            <LocalizedRow label="Headline" value={form.hero_headline ?? emptyLocalized} onChange={(v) => patch('hero_headline', v)} multiline />
            <LocalizedRow label="Subtitle" value={form.hero_subtitle ?? emptyLocalized} onChange={(v) => patch('hero_subtitle', v)} multiline />
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">SEO defaults</legend>
            <label className="block">
              <span className="text-xs font-medium">Title override</span>
              <input
                value={form.seo_title ?? ''}
                onChange={(e) => patch('seo_title', e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-purple"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium">Meta description</span>
              <textarea
                rows={2}
                value={form.seo_description ?? ''}
                onChange={(e) => patch('seo_description', e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-purple"
              />
            </label>
          </fieldset>

          <fieldset className="space-y-3 border-t border-zinc-200 dark:border-zinc-800 pt-6">
            <legend className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Data</legend>
            <button
              type="button"
              onClick={exportJson}
              disabled={exporting}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50"
            >
              {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              Export everything as JSON
            </button>
          </fieldset>
        </div>
      )}
    </>
  );
};

export default Settings;
