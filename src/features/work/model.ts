import type { Language } from '@/types';
import { normalizeHttpUrl } from '@/lib/url';

export type Kind = 'website' | 'album' | 'video';
export type Scope = 'websites' | 'gallery' | 'videos' | 'featured' | 'project';
export interface Work {
  id: string;
  kind: Kind;
  title: string;
  website_url: string | null;
  photos: string[];
  video_path: string | null;
  project_slug: string | null;
  parent_id: string | null;
  listed: boolean;
  featured: boolean;
  published: boolean;
  updated_at: string | null;
}
export const BUCKET = 'portfolio-media';
export const PAGE_SIZE = 12;
export const projectKey = (w: Work) =>
  w.parent_id ? 'work/' + w.parent_id : w.project_slug ? 'project/' + w.project_slug : '';
export const workUrl = (id: string, lang: Language = 'he') =>
  '/work/' + id + (lang === 'he' ? '' : '?lang=' + lang);
export const projectUrl = (slug: string, lang: Language = 'he') =>
  '/work/project/' + encodeURIComponent(slug) + (lang === 'he' ? '' : '?lang=' + lang);

export function blankWork(parent = ''): Work {
  const slash = parent.indexOf('/');
  const id = parent.slice(slash + 1);
  return {
    id: crypto.randomUUID(),
    kind: parent ? 'album' : 'website',
    title: '',
    photos: [],
    website_url: null,
    video_path: null,
    project_slug: parent.startsWith('project/') ? id : null,
    parent_id: parent.startsWith('work/') ? id : null,
    listed: !parent,
    featured: false,
    published: false,
    updated_at: null,
  };
}

export const labels = {
  he: {
    website: 'אתר',
    album: 'תמונות',
    video: 'סרטון',
    websites: 'אתרים שבניתי',
    gallery: 'עבודות בגלריה',
    videos: 'סרטונים',
    featured: 'עבודות נבחרות',
    project: 'עבודות בפרויקט',
    more: 'הצגת עוד עבודות',
    visit: 'פתיחת האתר',
    play: 'הפעלת הסרטון',
    loading: 'בטעינה…',
    retry: 'ניסיון נוסף',
    missing: 'העבודה אינה זמינה לצפייה',
    fail: 'העבודות לא נטענו',
    back: 'לכל הפרויקטים',
    related: 'לתיק הפרויקט',
    photo: 'תמונה',
    share: 'העתקת קישור',
    copied: 'הקישור הועתק',
    unavailable: 'הקובץ לא נטען',
  },
  ar: {
    website: 'موقع',
    album: 'صور',
    video: 'فيديو',
    websites: 'مواقع صمّمتها',
    gallery: 'أعمال المعرض',
    videos: 'فيديوهات',
    featured: 'أعمال مختارة',
    project: 'أعمال المشروع',
    more: 'عرض المزيد',
    visit: 'فتح الموقع',
    play: 'تشغيل الفيديو',
    loading: 'جارٍ التحميل…',
    retry: 'إعادة المحاولة',
    missing: 'هذا العمل غير متاح',
    fail: 'تعذّر تحميل الأعمال',
    back: 'كل المشاريع',
    related: 'ملف المشروع',
    photo: 'صورة',
    share: 'نسخ الرابط',
    copied: 'تم نسخ الرابط',
    unavailable: 'تعذّر تحميل الملف',
  },
  en: {
    website: 'Website',
    album: 'Photos',
    video: 'Video',
    websites: 'Websites I built',
    gallery: 'Gallery work',
    videos: 'Videos',
    featured: 'Featured work',
    project: 'Work in this project',
    more: 'Show more work',
    visit: 'Visit website',
    play: 'Play video',
    loading: 'Loading…',
    retry: 'Retry',
    missing: 'This work is unavailable',
    fail: 'Could not load the work',
    back: 'All projects',
    related: 'Project collection',
    photo: 'Photo',
    share: 'Copy link',
    copied: 'Link copied',
    unavailable: 'Could not load the file',
  },
} as const;

export function destinations(work: Work, projectTitle?: string): string[] {
  const attached = Boolean(projectKey(work));
  const labels: string[] = [];
  if (attached) labels.push('עמוד הפרויקט ' + (projectTitle || 'שנבחר'));
  if (!attached || work.listed)
    labels.push(
      { website: 'אתרים שבניתי', album: 'גלריית התמונות', video: 'סרטוני פרסום' }[work.kind]
    );
  if (work.featured) labels.push('דף הבית');
  return labels;
}

export function websiteUrl(value: string | null): string | null {
  const normalized = normalizeHttpUrl(value);
  if (!normalized) return null;
  try {
    const url = new URL(normalized);
    return url.hostname.includes('.') && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

export function publicationError(work: Work): string | undefined {
  if (!work.title.trim()) return 'יש להוסיף שם לעבודה.';
  if (work.kind === 'website' && !websiteUrl(work.website_url)) return 'יש להוסיף כתובת אתר תקינה.';
  if (work.kind === 'album' && !work.photos.length) return 'יש לבחור לפחות תמונה אחת.';
  if (work.kind === 'video' && !work.video_path)
    return 'יש להשלים את העלאת הסרטון או לבחור סרטון קיים.';
}

export function isLegacyAsset(path: string): boolean {
  return /^\/assets\/video-ads\/[\w./-]+$/.test(path) && !path.includes('..');
}

export function thumbnailPath(path: string): string {
  return path && !isLegacyAsset(path) ? path.replace(/\.jpg$/, '-thumb.jpg') : path;
}
