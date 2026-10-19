import type { Language } from '@/types';
import { SOUVLAKI_REELS, VIDEO_ADS, videoAdsCopy } from './content';
import additions from './portfolio.json';

export type VideoCategory =
  | 'social'
  | 'food'
  | 'fashion'
  | 'automotive'
  | 'motion'
  | 'education'
  | 'presenter';

export type PortfolioVideo = {
  id: string;
  title: Record<Language, string>;
  category: VideoCategory;
  language: Language | null;
  src: string;
  poster: string;
  duration?: number;
  width: number;
  height: number;
  tracks?: { src: string; srcLang: string; label: string }[];
};

const languages: Language[] = ['en', 'he', 'ar'];

export const VIDEO_PORTFOLIO: PortfolioVideo[] = [
  ...(additions as PortfolioVideo[]),
  ...VIDEO_ADS.map(
    (video): PortfolioVideo => ({
      ...video,
      title: Object.fromEntries(
        languages.map((language) => [language, videoAdsCopy[language].projects[video.id].project])
      ) as Record<Language, string>,
      category: 'social',
      language: 'he',
      width: 1080,
      height: 1920,
    })
  ),
  ...SOUVLAKI_REELS.map(
    (video): PortfolioVideo => ({
      ...video,
      id: `souvlaki-${video.number}`,
      title: {
        en: `Souvlaki · Reel ${video.number}`,
        he: `סופלאקי · ריל ${video.number}`,
        ar: `سوفلاكي · ريل ${video.number}`,
      },
      category: 'food',
      language: null,
      width: 540,
      height: 960,
    })
  ),
];

// A compact selection also keeps the homepage's scroll chapter within its frame.
export const FEATURED_VIDEOS = VIDEO_PORTFOLIO.slice(0, 4);

export function formatVideoDuration(duration: number): string {
  const seconds = Math.round(duration);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export const videoLibraryCopy = {
  he: {
    heading: 'כל עבודות הווידאו',
    intro: 'פרסומות, רילים, מושן ופרזנטורים דיגיטליים. בחרו סרטון וצפו בו עם סאונד ובמסך מלא.',
    videos: 'סרטונים',
    all: 'הכול',
    language: 'שפת הסרטון',
    allLanguages: 'כל השפות',
    watch: 'צפייה בסרטון',
    close: 'סגירת הסרטון',
    direct: 'פתיחת קובץ הסרטון',
    share: 'העתקת קישור לסרטון',
    copied: 'הקישור הועתק',
    copyFailed: 'אפשר להעתיק את הקישור משורת הכתובת.',
    unavailable: 'הסרטון לא נטען. אפשר לפתוח אותו ישירות בקישור למטה.',
    empty: 'אין סרטונים שמתאימים לבחירה הזו.',
    reset: 'הצגת כל הסרטונים',
    stories: 'הסיפורים מאחורי העבודה',
    note: 'עבודות נבחרות מתוך הסטודיו; פרטי המבצעים בתוך הסרטונים מתייחסים למועד יצירתם.',
    categories: {
      social: 'מותגים וסושיאל',
      food: 'אוכל ומסעדות',
      fashion: 'אופנה',
      automotive: 'רכב',
      motion: 'מושן ודיגיטל',
      education: 'חינוך',
      presenter: 'פרזנטורים AI',
    },
    languages: { he: 'עברית', ar: 'ערבית', en: 'אנגלית' },
  },
  en: {
    heading: 'The video collection',
    intro:
      'Brand films, reels, motion design and digital presenters. Pick a film to watch with sound and fullscreen controls.',
    videos: 'videos',
    all: 'All work',
    language: 'Video language',
    allLanguages: 'All languages',
    watch: 'Watch video',
    close: 'Close video',
    direct: 'Open video file',
    share: 'Copy video link',
    copied: 'Link copied',
    copyFailed: 'You can copy the link from the address bar.',
    unavailable: 'The video could not load. Open it directly using the link below.',
    empty: 'No videos match this selection.',
    reset: 'Show all videos',
    stories: 'Behind the work',
    note: 'Selected studio work. Offers shown inside films reflect the time they were created.',
    categories: {
      social: 'Brands & social',
      food: 'Food & restaurants',
      fashion: 'Fashion',
      automotive: 'Automotive',
      motion: 'Motion & digital',
      education: 'Education',
      presenter: 'AI presenters',
    },
    languages: { he: 'Hebrew', ar: 'Arabic', en: 'English' },
  },
  ar: {
    heading: 'كل أعمال الفيديو',
    intro: 'إعلانات وريلز وموشن ومقدّمون افتراضيون. اختاروا فيديو للمشاهدة بالصوت وبملء الشاشة.',
    videos: 'فيديو',
    all: 'كل الأعمال',
    language: 'لغة الفيديو',
    allLanguages: 'كل اللغات',
    watch: 'شاهد الفيديو',
    close: 'إغلاق الفيديو',
    direct: 'فتح ملف الفيديو',
    share: 'نسخ رابط الفيديو',
    copied: 'تم نسخ الرابط',
    copyFailed: 'يمكن نسخ الرابط من شريط العنوان.',
    unavailable: 'تعذّر تحميل الفيديو. يمكن فتحه مباشرة من الرابط أدناه.',
    empty: 'لا توجد فيديوهات مطابقة لهذا الاختيار.',
    reset: 'عرض كل الفيديوهات',
    stories: 'وراء الأعمال',
    note: 'أعمال مختارة من الاستوديو. العروض داخل الفيديوهات تعود إلى وقت إنتاجها.',
    categories: {
      social: 'علامات وسوشيال',
      food: 'طعام ومطاعم',
      fashion: 'أزياء',
      automotive: 'سيارات',
      motion: 'موشن ورقمي',
      education: 'تعليم',
      presenter: 'مقدّمون بالذكاء الاصطناعي',
    },
    languages: { he: 'العبرية', ar: 'العربية', en: 'الإنجليزية' },
  },
};
