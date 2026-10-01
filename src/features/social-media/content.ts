import type { Language } from '@/types';

type SocialCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  platforms: string;
  services: { title: string; text: string }[];
  formats: string[];
  cta: string;
  prefill: string;
};

export const socialMediaCopy: Record<Language, SocialCopy> = {
  he: {
    eyebrow: 'ניהול סושיאל מדיה',
    title: 'תוכן שנותן לעסק שלכם קול.',
    intro:
      'מהרעיון הראשון ועד הפוסט הבא — עיצוב, כתיבה ותכנון תוכן שמציגים את העסק שלכם בצורה ברורה ועקבית.',
    platforms: 'Instagram · Facebook · TikTok',
    services: [
      {
        title: 'אסטרטגיה ותכנון',
        text: 'מגדירים את הקהל, המסר וסגנון המותג, ובונים לוח תוכן שמתאים למטרות העסק.',
      },
      {
        title: 'עיצוב ויצירת תוכן',
        text: 'פוסטים, סטוריז ורילס, עם עיצוב מותאם למותג, כתיבה ברורה והנעה לפעולה.',
      },
      {
        title: 'ניהול ופרסום',
        text: 'סדר בפרסום, התאמת התוכן לכל פלטפורמה ומעקב אחר הנתונים כדי לשפר את התוכן הבא.',
      },
    ],
    formats: ['פוסטים מעוצבים', 'סטוריז', 'רילס', 'לוח תוכן'],
    cta: 'בואו נבנה תוכן לעסק שלכם',
    prefill: 'היי ואסים, אני מעוניין בתוכן ובניהול סושיאל מדיה לעסק שלי.',
  },
  en: {
    eyebrow: 'Social media management',
    title: 'Content that gives your business a voice.',
    intro:
      'From the first idea to your next post — design, copywriting and content planning that keep your business clear and consistent.',
    platforms: 'Instagram · Facebook · TikTok',
    services: [
      {
        title: 'Strategy & planning',
        text: 'Define your audience, message and brand style, then build a content calendar around your business goals.',
      },
      {
        title: 'Design & content',
        text: 'Posts, stories and reels with on-brand design, clear copy and a purposeful call to action.',
      },
      {
        title: 'Management & publishing',
        text: 'Organize publishing, adapt content to each platform and review the data to improve your next post.',
      },
    ],
    formats: ['Designed posts', 'Stories', 'Reels', 'Content calendar'],
    cta: 'Let’s create content for your business',
    prefill: 'Hi Waseem, I am interested in content and social media management for my business.',
  },
  ar: {
    eyebrow: 'إدارة السوشيال ميديا',
    title: 'محتوى بيعطي صوت لمصلحتكم.',
    intro:
      'من أول فكرة لحد البوست الجاي — تصميم، كتابة وتخطيط محتوى بيعرّف الناس على شغلكم بشكل واضح ومتناسق.',
    platforms: 'Instagram · Facebook · TikTok',
    services: [
      {
        title: 'استراتيجية وتخطيط',
        text: 'بنحدّد الجمهور، الرسالة وأسلوب البراند، وبنبني جدول محتوى مناسب لأهداف مصلحتكم.',
      },
      {
        title: 'تصميم وصناعة محتوى',
        text: 'بوستات، ستوريز وريلز، بتصميم مناسب للبراند، نصوص واضحة ودعوة للتواصل.',
      },
      {
        title: 'إدارة ونشر',
        text: 'بنرتّب النشر، بنجهّز المحتوى لكل منصة وبنتابع الأرقام عشان نحسّن المحتوى الجاي.',
      },
    ],
    formats: ['بوستات مصمّمة', 'ستوريز', 'ريلز', 'جدول محتوى'],
    cta: 'خلّينا نجهّز محتوى لمصلحتكم',
    prefill: 'مرحبا وسيم، مهتم بمحتوى وإدارة سوشيال ميديا لمصلحتي.',
  },
};
