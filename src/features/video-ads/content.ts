import type { Language } from '@/types';

export type VideoAd = {
  id: 'greentouch' | 'ninnyo-friday';
  src: string;
  poster: string;
  thumbnail: string;
  duration: number;
  tracks?: { src: string; srcLang: string; label: string }[];
};

export const VIDEO_ADS: VideoAd[] = [
  {
    id: 'greentouch',
    src: '/assets/video-ads/greentouch-house.mp4',
    poster: '/assets/video-ads/greentouch-poster.webp',
    thumbnail: '/assets/video-ads/greentouch-thumbnail.webp',
    duration: 27,
    tracks: [
      { src: '/assets/video-ads/greentouch-en.vtt', srcLang: 'en', label: 'English' },
      { src: '/assets/video-ads/greentouch-ar.vtt', srcLang: 'ar', label: 'العربية' },
    ],
  },
  {
    id: 'ninnyo-friday',
    src: '/assets/video-ads/ninnyo-friday-wow.mp4',
    poster: '/assets/video-ads/ninnyo-friday-poster.webp',
    thumbnail: '/assets/video-ads/ninnyo-friday-thumbnail.webp',
    duration: 20,
  },
];

type ProjectCopy = {
  project: string;
  tagline: string;
  watch: string;
  audience: string;
  purpose: string;
  source: string;
  edit: string;
  format: string;
  platforms: string;
  music: string;
  disclosure: string;
  lines: string[];
};

type PageCopy = {
  title: string;
  heading: string;
  intro: string;
  category: string;
  cta: string;
  prefill: string;
  sound: string;
  back: string;
  unavailable: string;
  direct: string;
  transcript: string;
  audienceLabel: string;
  purposeLabel: string;
  sourceLabel: string;
  editLabel: string;
  deliveryLabel: string;
  musicLabel: string;
  ask: string;
  askText: string;
  previewTitle: string;
  previewText: string;
  explore: string;
  projects: Record<VideoAd['id'], ProjectCopy>;
};

export const videoAdsCopy: Record<Language, PageCopy> = {
  en: {
    title: 'Social Video Portfolio | Waseem',
    heading: 'Real products.\nStories made for the feed.',
    intro: 'Two vertical social-video case studies, built from the brands’ original product photography and shaped for clear, fast mobile storytelling.',
    category: 'Video editing for brands',
    cta: 'Get a video for your business',
    prefill: 'Hi Waseem, I saw your social-video portfolio and would like a reel for my business.',
    sound: 'Music on. Press play to watch with sound.',
    back: 'Back to portfolio',
    unavailable: 'The video could not play. You can open the MP4 directly below.',
    direct: 'Open video file',
    transcript: 'Read the on-screen copy',
    audienceLabel: 'Made for', purposeLabel: 'The goal', sourceLabel: 'Source material',
    editLabel: 'The edit', deliveryLabel: 'Delivery', musicLabel: 'Music',
    ask: 'Have the photos? Let’s make them move.',
    askText: 'Send your product photos and the message people should remember. I’ll shape the pacing, captions, music and final call to action around your business.',
    previewTitle: 'Two brands. Two stories in motion.',
    previewText: 'Watch GreenTouch and NINNYO FLOWERS: vertical social ads built from real product photos, Hebrew copy and music.',
    explore: 'View the video work',
    projects: {
      greentouch: {
        project: 'GreenTouch', tagline: 'Artificial plants that look completely real.',
        watch: 'Watch the 27-second GreenTouch ad',
        audience: 'Homeowners, offices and businesses looking for green interiors without ongoing maintenance.',
        purpose: 'Reveal that the plants are artificial, then turn that surprise into three simple benefits: no water, no light and no maintenance.',
        source: 'Six original GreenTouch product photos: indoor cactus scenes, hanging plants and green walls.',
        edit: 'A 27-second reveal with gentle push-ins, Hebrew captions and cuts aligned to the music.',
        format: '27 seconds · Vertical 9:16 · 1080p',
        platforms: 'Instagram Reels, TikTok and Meta placements.',
        music: 'Beach House Beat by AbsoluteSound, edited to the final duration.',
        disclosure: 'Self-initiated portfolio concept, not a commissioned campaign. No campaign results are claimed.',
        lines: ['Wait… are these real?', 'None of them are.', 'All artificial.', 'No water. No light. No maintenance.', 'And this? Also us.', 'Green walls for every space.', 'Looks alive, 365 days a year.', 'GreenTouch — installation nationwide.'],
      },
      'ninnyo-friday': {
        project: 'NINNYO FLOWERS', tagline: 'A colourful Friday reel made to stop the scroll.',
        watch: 'Watch the 20-second NINNYO FLOWERS reel',
        audience: 'Local customers choosing flowers for the Friday table or as a gift for someone they love.',
        purpose: 'Turn the bouquet collection into a quick, emotional Friday message and lead viewers directly to WhatsApp ordering.',
        source: 'Eight real bouquet photos from the NINNYO FLOWERS website repository.',
        edit: 'A fast opening montage, full-frame bouquet moments, animated Hebrew copy and a four-bouquet closing wall.',
        format: '20 seconds · Vertical 9:16 · 1080p',
        platforms: 'Instagram Reels and Facebook Reels.',
        music: 'Stylish — Upbeat Commercial Advertising Funk by FASSounds (Pixabay).',
        disclosure: 'Portfolio social creative using the brand’s supplied photography. The track is Content ID registered; no campaign results are claimed.',
        lines: ['Friday.', 'Flowers.', 'Wow.', 'A little colour.', 'A lot of joy.', 'For the Friday table.', 'Or for someone you love.', 'Which bouquet is yours?', 'Order on WhatsApp.'],
      },
    },
  },
  he: {
    title: 'תיק עבודות וידאו לסושיאל | Waseem',
    heading: 'מוצרים אמיתיים.\nסיפורים שנועדו לפיד.',
    intro: 'שתי עבודות וידאו אנכיות לסושיאל, שנבנו מתמונות המוצר המקוריות של המותגים ועברו עריכה ברורה, מהירה ומדויקת למובייל.',
    category: 'עריכת וידאו למותגים',
    cta: 'רוצים סרטון לעסק שלכם?',
    prefill: 'היי ואסים, ראיתי את עבודות הווידאו שלך ואשמח לריל עבור העסק שלי.',
    sound: 'כולל מוזיקה. לחצו להפעלה עם סאונד.',
    back: 'חזרה לתיק העבודות',
    unavailable: 'לא ניתן להפעיל את הסרטון. אפשר לפתוח את קובץ הווידאו בקישור למטה.',
    direct: 'פתיחת קובץ הסרטון',
    transcript: 'לקריאת הטקסט שבסרטון',
    audienceLabel: 'למי', purposeLabel: 'המטרה', sourceLabel: 'מאיפה הגיע החומר',
    editLabel: 'מה עשינו בעריכה', deliveryLabel: 'פורמט ויעד', musicLabel: 'מוזיקה',
    ask: 'יש לכם תמונות? בואו ניתן להן תנועה.',
    askText: 'שלחו את תמונות המוצרים ואת המסר שחשוב שיזכרו. אתאים לעסק את הקצב, הכיתובים, המוזיקה וההנעה לפעולה.',
    previewTitle: 'שני מותגים. שני סיפורים בתנועה.',
    previewText: 'GreenTouch ו־NINNYO FLOWERS: סרטוני סושיאל אנכיים מתמונות מוצר אמיתיות, טקסט עברי ומוזיקה.',
    explore: 'לצפייה בעבודות הווידאו',
    projects: {
      greentouch: {
        project: 'GreenTouch', tagline: 'צמחים מלאכותיים שנראים אמיתיים לגמרי.',
        watch: 'צפייה בסרטון GreenTouch — 27 שניות',
        audience: 'בעלי בתים, משרדים ועסקים שרוצים חלל ירוק בלי תחזוקה שוטפת.',
        purpose: 'לחשוף שהצמחים מלאכותיים ולהפוך את ההפתעה לשלושה יתרונות ברורים: בלי מים, בלי אור ובלי טיפול.',
        source: 'שש תמונות מוצר מקוריות של GreenTouch: קקטוסים בחלל פנימי, צמחים תלויים וקירות ירוקים.',
        edit: 'סיפור של 27 שניות עם חשיפה הדרגתית, תנועות זום עדינות, כיתובים בעברית וחיתוכים לפי המוזיקה.',
        format: '27 שניות · אנכי 9:16 · 1080p',
        platforms: 'Instagram Reels, TikTok ומודעות Meta.',
        music: 'Beach House Beat מאת AbsoluteSound, בעריכה לאורך הסרטון.',
        disclosure: 'קונספט עצמאי לתיק העבודות, ולא קמפיין שהוזמן מהמותג. לא מוצגות תוצאות קמפיין.',
        lines: ['רגע… אלה אמיתיים?', 'אף אחד מהם לא.', 'הכול מלאכותי.', 'בלי מים. בלי אור. בלי טיפול.', 'וזה? גם אנחנו.', 'קירות ירוקים לכל חלל.', 'נראה חי — 365 ימים בשנה.', 'GreenTouch — התקנה בכל הארץ.'],
      },
      'ninnyo-friday': {
        project: 'NINNYO FLOWERS', tagline: 'ריל צבעוני לשישי שנועד לעצור את הגלילה.',
        watch: 'צפייה בריל NINNYO FLOWERS — 20 שניות',
        audience: 'לקוחות מקומיים שמחפשים פרחים לשולחן שישי או מתנה למישהו שאוהבים.',
        purpose: 'להפוך את קולקציית הזרים למסר קצר ורגשי לשישי, ולהוביל ישירות להזמנה בוואטסאפ.',
        source: 'שמונה תמונות זרים אמיתיות מתוך מאגר התמונות של אתר NINNYO FLOWERS.',
        edit: 'פתיחה מהירה, תצוגה מלאה של הזרים, טקסט עברי מונפש וסיום עם קיר של ארבעה זרים.',
        format: '20 שניות · אנכי 9:16 · 1080p',
        platforms: 'Instagram Reels ו־Facebook Reels.',
        music: 'Stylish — Upbeat Commercial Advertising Funk מאת FASSounds ‏(Pixabay).',
        disclosure: 'קריאייטיב לתיק העבודות שנבנה מהתמונות שסופקו למותג. המוזיקה רשומה ב־Content ID; לא מוצגות תוצאות קמפיין.',
        lines: ['שישי.', 'פרחים.', 'וואו.', 'קצת צבע.', 'המון שמחה.', 'לשולחן של שישי.', 'או למישהו שאוהבים.', 'איזה זר שלך?', 'להזמנות בוואטסאפ.'],
      },
    },
  },
  ar: {
    title: 'معرض فيديو للسوشيال | Waseem',
    heading: 'منتجات حقيقية.\nقصص صُممت للمنشورات.',
    intro: 'مشروعا فيديو عموديان للسوشيال، صُنعا من صور المنتجات الأصلية للعلامتين وبمونتاج واضح وسريع يناسب الهاتف.',
    category: 'مونتاج فيديو للعلامات التجارية',
    cta: 'تريدون فيديو لمشروعكم؟',
    prefill: 'مرحباً وسيم، شاهدت أعمال الفيديو وأرغب بريل لمشروعي.',
    sound: 'مع موسيقى. اضغط للتشغيل بالصوت.',
    back: 'العودة إلى ملف الأعمال',
    unavailable: 'تعذّر تشغيل الفيديو. يمكن فتح ملف الفيديو مباشرة أدناه.',
    direct: 'فتح ملف الفيديو', transcript: 'اقرأ النص الظاهر في الفيديو',
    audienceLabel: 'لمن', purposeLabel: 'الهدف', sourceLabel: 'مصدر المواد',
    editLabel: 'المونتاج', deliveryLabel: 'الصيغة والمنصات', musicLabel: 'الموسيقى',
    ask: 'لديكم الصور؟ لنمنحها الحركة.',
    askText: 'أرسلوا صور المنتجات والرسالة التي تريدون أن يتذكّرها الناس. سأبني الإيقاع والنصوص والموسيقى والدعوة للتواصل بما يناسب مشروعكم.',
    previewTitle: 'علامتان. قصتان تتحرّكان.',
    previewText: 'GreenTouch وNINNYO FLOWERS: فيديوهات عمودية للسوشيال بصور منتجات حقيقية ونص عبري وموسيقى.',
    explore: 'شاهد أعمال الفيديو',
    projects: {
      greentouch: {
        project: 'GreenTouch', tagline: 'نباتات صناعية تبدو حقيقية تماماً.',
        watch: 'شاهد إعلان GreenTouch — 27 ثانية',
        audience: 'أصحاب البيوت والمكاتب والمشاريع الباحثون عن ديكور أخضر بلا صيانة مستمرة.',
        purpose: 'كشف أن النباتات صناعية، ثم تحويل المفاجأة إلى ثلاث فوائد: بلا ماء، بلا ضوء وبلا عناية.',
        source: 'ست صور أصلية لمنتجات GreenTouch: صبّار داخلي، نباتات معلّقة وجدران خضراء.',
        edit: 'قصة من 27 ثانية، حركة هادئة، نصوص بالعبرية وقطعات متزامنة مع الموسيقى.',
        format: '27 ثانية · عمودي 9:16 · 1080p', platforms: 'ريلز إنستغرام وتيك توك وإعلانات Meta.',
        music: 'Beach House Beat للمؤلف AbsoluteSound، بمونتاج يناسب مدة الفيديو.',
        disclosure: 'نموذج مستقل لملف الأعمال وليس حملة بتكليف من العلامة. لا تُعرض نتائج حملة.',
        lines: ['لحظة… هل هذه حقيقية؟', 'ولا واحدة منها.', 'كلها صناعية.', 'بلا ماء. بلا ضوء. بلا عناية.', 'وهذا؟ أيضاً منّا.', 'جدران خضراء لكل مساحة.', 'تبدو حيّة طوال العام.', 'GreenTouch — تركيب في جميع أنحاء البلاد.'],
      },
      'ninnyo-friday': {
        project: 'NINNYO FLOWERS', tagline: 'ريل ملوّن للجمعة صُمم ليوقف التمرير.',
        watch: 'شاهد ريل NINNYO FLOWERS — 20 ثانية',
        audience: 'عملاء محليون يختارون الزهور لمائدة الجمعة أو هدية لشخص يحبونه.',
        purpose: 'تحويل مجموعة الباقات إلى رسالة قصيرة وعاطفية للجمعة تقود مباشرة للطلب عبر واتساب.',
        source: 'ثماني صور حقيقية للباقات من مستودع موقع NINNYO FLOWERS.',
        edit: 'افتتاح سريع، عرض كامل للباقات، نص عبري متحرك ونهاية بجدار من أربع باقات.',
        format: '20 ثانية · عمودي 9:16 · 1080p', platforms: 'ريلز إنستغرام وفيسبوك.',
        music: 'Stylish — Upbeat Commercial Advertising Funk للمؤلف FASSounds ‏(Pixabay).',
        disclosure: 'عمل إبداعي لملف الأعمال باستخدام صور العلامة المتاحة. المقطع مسجّل في Content ID؛ لا تُعرض نتائج حملة.',
        lines: ['الجمعة.', 'زهور.', 'واو.', 'قليل من اللون.', 'كثير من الفرح.', 'لمائدة الجمعة.', 'أو لمن نحب.', 'أي باقة لك؟', 'للطلب عبر واتساب.'],
      },
    },
  },
};
