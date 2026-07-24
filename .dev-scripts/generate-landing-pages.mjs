// Generates static, SEO-optimized local landing pages in Hebrew AND Arabic
// (one folder per city per language) into /public/, plus regenerates
// /public/sitemap.xml with hreflang alternates.
//
//   Hebrew:  /public/<slug>/index.html        -> /<slug>/
//   Arabic:  /public/ar/<slug>/index.html     -> /ar/<slug>/
//
// These are standalone HTML pages (no React) so Google crawls real, unique
// content at clean URLs. Each page has its own title/description/canonical +
// hreflang alternates and LocalBusiness + BreadcrumbList + FAQPage JSON-LD
// scoped to the city and language. Build-time only + gitignored.
//
// Run: node .dev-scripts/generate-landing-pages.mjs   (also run by `npm run build`)
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '..', 'public');

const SITE = 'https://wwas.netlify.app';
const WHATSAPP = '972534260632';
const LASTMOD = '2026-07-07';
const LANGS = ['he', 'ar'];

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---------------------------------------------------------------------------
// UI strings (static labels) per language. Functions take the localized city
// name where the label mentions it.
// ---------------------------------------------------------------------------
const T = {
  he: {
    badge: (c) => `מפתח ובונה אתרים · שירות ב${c} והצפון`,
    servicesTitle: (c) => `מה אני בונה עבור עסקים ב${c}`,
    cards: [
      { ico: '🌐', h: 'אתרי תדמית', p: 'אתר נקי, מהיר ומקצועי שמשדר אמינות ומביא פניות — מותאם לנייד ולכל מסך.' },
      { ico: '🛒', h: 'חנויות ומערכות', p: 'חנות אונליין, מערכת ניהול או אפליקציית ווב מלאה שבנויה לגדול איתך.' },
      { ico: '🚀', h: 'SEO וקידום אורגני', p: 'אתר שבנוי מהיסוד להופיע בגוגל — כותרות, מהירות ו-Schema של עסק מקומי.' },
      { ico: '🤖', h: 'אוטומציה ו-AI', p: 'צ׳אטבוטים, טפסים חכמים ואוטומציות שחוסכות לך זמן ומטפלות בלקוחות 24/7.' },
    ],
    whyTitle: 'למה לבחור בי',
    whyLast: 'מחיר שקוף מראש, בלי הפתעות — ותמיכה אישית אחרי ההשקה.',
    faqTitle: (c) => `שאלות נפוצות — בניית אתרים ב${c}`,
    ctaTitle: 'מוכנים לאתר שמביא לקוחות?',
    ctaText: (c) => `ספרו לי על העסק שלכם ב${c} — ואחזור אליכם עם רעיון והצעת מחיר, בלי התחייבות.`,
    ctaBtn: '💬 בואו נתחיל בוואטסאפ',
    heroBtn: '💬 דברו איתי בוואטסאפ',
    back: '← לאתר הראשי',
    viewWork: 'צפו בעבודות שלי',
    areasLabel: 'שירות גם באזורים הבאים:',
    sibling: (c) => `בניית אתרים ב${c}`,
    credit: '© 2026 וסים — בניית אתרים בצפון.',
    toMain: 'לאתר הראשי',
    whatsapp: 'וואטסאפ',
    contact: 'צור קשר',
    waText: (c) => `היי וסים, אני מעוניין באתר לעסק שלי ב${c} 🙂`,
    otherLang: 'العربية',
  },
  ar: {
    badge: (c) => `مطوّر ومصمّم مواقع · خدمة في ${c} والشمال`,
    servicesTitle: (c) => `ماذا أبني لأصحاب الأعمال في ${c}`,
    cards: [
      { ico: '🌐', h: 'مواقع تعريفية', p: 'موقع نظيف وسريع واحترافي يعكس المصداقية ويجلب الاستفسارات — متوافق مع الجوال وكل الشاشات.' },
      { ico: '🛒', h: 'متاجر وأنظمة', p: 'متجر إلكتروني، نظام إدارة أو تطبيق ويب كامل مبني لينمو معك.' },
      { ico: '🚀', h: 'SEO وتحسين محركات البحث', p: 'موقع مبني من الأساس ليظهر في جوجل — عناوين، سرعة و Schema لنشاط تجاري محلي.' },
      { ico: '🤖', h: 'أتمتة و AI', p: 'شات بوت، نماذج ذكية وأتمتة توفّر وقتك وتخدم العملاء ٢٤/٧.' },
    ],
    whyTitle: 'لماذا تختارني',
    whyLast: 'سعر شفّاف مسبقًا بدون مفاجآت — ودعم شخصي بعد الإطلاق.',
    faqTitle: (c) => `أسئلة شائعة — بناء المواقع في ${c}`,
    ctaTitle: 'جاهزون لموقع يجلب العملاء؟',
    ctaText: (c) => `احكوا لي عن نشاطكم في ${c} — وسأعود إليكم بفكرة وعرض سعر، بدون التزام.`,
    ctaBtn: '💬 لنبدأ عبر واتساب',
    heroBtn: '💬 تواصلوا معي عبر واتساب',
    back: '← إلى الموقع الرئيسي',
    viewWork: 'شاهدوا أعمالي',
    areasLabel: 'خدمة أيضًا في المناطق التالية:',
    sibling: (c) => `بناء مواقع في ${c}`,
    credit: '© 2026 وسيم — بناء مواقع في الشمال.',
    toMain: 'إلى الموقع الرئيسي',
    whatsapp: 'واتساب',
    contact: 'تواصل',
    waText: (c) => `مرحبا وسيم، أنا مهتم بموقع لنشاطي التجاري في ${c} 🙂`,
    otherLang: 'עברית',
  },
};

// ---------------------------------------------------------------------------
// Per-city data with Hebrew + Arabic content.
// ---------------------------------------------------------------------------
const cities = [
  {
    slug: 'web-design-kfar-yasif',
    en: 'Kfar Yasif',
    geo: { lat: 32.9556, lng: 35.1706 },
    name: { he: 'כפר יאסיף', ar: 'كفر ياسيف' },
    he: {
      lead: 'אני וסים — מפתח ובונה אתרים מכפר יאסיף. אני חי ועובד כאן, מכיר מקרוב את העסקים המקומיים ואת מה שעובד בשטח. אני בונה אתרים מהירים, ברורים וממירים — בעברית, בערבית ובאנגלית — שמביאים לקוחות אמיתיים ולא רק ביקורים.',
      angle: [
        'בן המקום — פגישות פנים אל פנים, בלי מרחק ובלי מתווכים.',
        'אתר דו-לשוני (עברית + ערבית) שמדבר לכל הקהל בכפר ובסביבה.',
        'תמיכה שוטפת אחרי ההשקה — אני כאן, לא חברה רחוקה.',
      ],
      faq: [
        { q: 'כמה עולה אתר תדמית בכפר יאסיף?', a: 'אתר תדמית מקצועי מתחיל בטווח נגיש לעסק קטן. המחיר תלוי במספר העמודים ובפיצ׳רים (טופס, גלריה, רב-לשוני). נשלח הצעת מחיר ברורה מראש, בלי הפתעות.' },
        { q: 'האם האתר יהיה בעברית ובערבית?', a: 'כן. אני בונה אתרים דו-לשוניים ורב-לשוניים במקור, כולל תמיכה מלאה ב-RTL, כך שהאתר נראה מושלם גם בעברית וגם בערבית.' },
        { q: 'כמה זמן לוקח לבנות אתר?', a: 'אתר תדמית סטנדרטי מוכן תוך שבוע-שבועיים. פרויקטים מורכבים יותר (חנות, מערכת) לוקחים בין חודש לשלושה.' },
      ],
    },
    ar: {
      lead: 'أنا وسيم — مطوّر ومصمّم مواقع من كفر ياسيف. أعيش وأعمل هنا، أعرف الأنشطة التجارية المحلية عن قرب وما ينجح فعليًا. أبني مواقع سريعة وواضحة وفعّالة — بالعربية والعبرية والإنجليزية — تجلب عملاء حقيقيين لا مجرد زيارات.',
      angle: [
        'ابن البلد — لقاءات وجهًا لوجه، بدون وسطاء وبدون مسافات.',
        'موقع ثنائي اللغة (عربي + عبري) يخاطب كل الجمهور في البلدة والمحيط.',
        'دعم متواصل بعد الإطلاق — أنا هنا، لست شركة بعيدة.',
      ],
      faq: [
        { q: 'كم يكلّف موقع تعريفي في كفر ياسيف؟', a: 'موقع تعريفي احترافي يبدأ من سعر مناسب لنشاط صغير. السعر يعتمد على عدد الصفحات والمزايا (نموذج، معرض، تعدد لغات). أرسل عرض سعر واضح مسبقًا بدون مفاجآت.' },
        { q: 'هل سيكون الموقع بالعربية والعبرية؟', a: 'نعم. أبني مواقع ثنائية ومتعددة اللغات من الأساس، مع دعم كامل لاتجاه الكتابة، بحيث يظهر الموقع مثاليًا بالعربية والعبرية.' },
        { q: 'كم يستغرق بناء الموقع؟', a: 'موقع تعريفي عادي يكون جاهزًا خلال أسبوع إلى أسبوعين. المشاريع الأعقد (متجر، نظام) تستغرق بين شهر وثلاثة أشهر.' },
      ],
    },
  },
  {
    slug: 'web-design-akko',
    en: 'Acre',
    geo: { lat: 32.9281, lng: 35.0817 },
    name: { he: 'עכו', ar: 'عكا' },
    he: {
      lead: 'עכו היא עיר של תיירות, מסעדות ועסקים קטנים — בעיר העתיקה ובעיר החדשה. לעסק בעכו אתר מהיר וברור הוא ההבדל בין תייר שמזמין שולחן לבין תייר שממשיך הלאה. אני בונה אתרים דו-לשוניים עם הזמנות, תפריטים וניווט — שממירים מבקרים ללקוחות.',
      angle: [
        'מותאם לעסקי תיירות ואירוח — תפריטים, הזמנות ו-Google Maps מוטמע.',
        'טעינה מהירה גם על סלולר, כי רוב התיירים מחפשים מהנייד.',
        'אופטימיזציה מקומית ל-״מסעדה בעכו״, ״אטרקציות בעכו״ ודומיהם.',
      ],
      faq: [
        { q: 'יש לי מסעדה בעכו — אתם בונים אתר עם תפריט והזמנות?', a: 'בהחלט. אני בונה אתרי מסעדות עם תפריט דיגיטלי, כפתור הזמנת שולחן/וואטסאפ, גלריה ומפה מוטמעת — הכל מהיר ומותאם לנייד.' },
        { q: 'האם האתר יופיע בגוגל כשמחפשים עסק בעכו?', a: 'אני בונה כל אתר עם SEO מקומי מובנה — כותרות, תיאורים ו-Schema של עסק מקומי — כדי לתת לך את הסיכוי הטוב ביותר להופיע בחיפושים מקומיים בעכו.' },
        { q: 'אני צריך אתר בעברית ובערבית — אפשר?', a: 'כן, זו ההתמחות שלי. אתרים דו-לשוניים עברית-ערבית עם מעבר שפה חלק ותצוגה מושלמת בשני הכיוונים.' },
      ],
    },
    ar: {
      lead: 'عكا مدينة سياحة ومطاعم وأنشطة صغيرة — في البلدة القديمة والمدينة الجديدة. لنشاطك في عكا، موقع سريع وواضح هو الفرق بين سائح يحجز طاولة وسائح يكمل طريقه. أبني مواقع ثنائية اللغة مع حجوزات وقوائم طعام وتنقّل — تحوّل الزوار إلى عملاء.',
      angle: [
        'مناسب لأنشطة السياحة والضيافة — قوائم طعام، حجوزات وخرائط جوجل مدمجة.',
        'تحميل سريع على الجوال، لأن معظم السياح يبحثون من الهاتف.',
        'تحسين محلي لكلمات مثل «مطعم في عكا» و«معالم عكا».',
      ],
      faq: [
        { q: 'لدي مطعم في عكا — هل تبنون موقعًا مع قائمة وحجوزات؟', a: 'بالتأكيد. أبني مواقع مطاعم مع قائمة رقمية، زر حجز طاولة/واتساب، معرض صور وخريطة مدمجة — كله سريع ومتوافق مع الجوال.' },
        { q: 'هل سيظهر الموقع في جوجل عند البحث عن نشاط في عكا؟', a: 'أبني كل موقع مع SEO محلي مدمج — عناوين، أوصاف و Schema لنشاط محلي — لأعطيك أفضل فرصة للظهور في عمليات البحث المحلية في عكا.' },
        { q: 'أحتاج موقعًا بالعربية والعبرية — هل هذا ممكن؟', a: 'نعم، هذا تخصّصي. مواقع ثنائية اللغة عربي-عبري مع تبديل سلس للّغة وعرض مثالي في الاتجاهين.' },
      ],
    },
  },
  {
    slug: 'web-design-karmiel',
    en: 'Karmiel',
    geo: { lat: 32.9186, lng: 35.2952 },
    name: { he: 'כרמיאל', ar: 'كرمئيل' },
    he: {
      lead: 'כרמיאל היא מרכז מסחרי, תעשייתי ורפואי לכל הגליל. לעסקים, מרפאות, נותני שירות ובעלי מקצוע בכרמיאל, אתר מקצועי הוא כרטיס הביקור הראשון שהלקוח רואה. אני בונה אתרים אמינים ומהירים עם טופס לידים חכם — שהופכים גולשים לפניות.',
      angle: [
        'מותאם לנותני שירות, מרפאות ובעלי מקצוע — טופס פנייה שמייצר לידים.',
        'עיצוב אמין ונקי שמשדר מקצועיות מהרגע הראשון.',
        'אינטגרציה עם וואטסאפ ו-Google לניהול פניות פשוט.',
      ],
      faq: [
        { q: 'יש לי קליניקה בכרמיאל — אני צריך מערכת זימון תורים?', a: 'אפשר. אני יכול לשלב טופס זימון תורים, קישור לוואטסאפ, או מערכת זימונים מלאה — לפי הצורך והתקציב שלך.' },
        { q: 'אתם מטפלים גם בדומיין ובאחסון?', a: 'כן. אני מטפל בכל התהליך מקצה לקצה — רכישת דומיין, אחסון, תעודת SSL והעלאה לאוויר. אתה לא צריך להתעסק עם הטכני.' },
        { q: 'האתר יהיה מהיר גם עם הרבה תמונות?', a: 'בהחלט. אני בונה עם טכנולוגיות מודרניות ואופטימיזציית תמונות, כך שהאתר נטען מהר וקל — וזה גם עוזר לדירוג בגוגל.' },
      ],
    },
    ar: {
      lead: 'كرمئيل مركز تجاري وصناعي وطبي لكل الجليل. لأصحاب الأعمال والعيادات ومقدّمي الخدمات وأصحاب المهن في كرمئيل، الموقع الاحترافي هو بطاقة التعريف الأولى التي يراها العميل. أبني مواقع موثوقة وسريعة مع نموذج ذكي لالتقاط العملاء المحتملين — تحوّل الزوار إلى استفسارات.',
      angle: [
        'مناسب لمقدّمي الخدمات والعيادات وأصحاب المهن — نموذج تواصل يولّد عملاء محتملين.',
        'تصميم موثوق ونظيف يعكس الاحترافية من اللحظة الأولى.',
        'تكامل مع واتساب وجوجل لإدارة الاستفسارات ببساطة.',
      ],
      faq: [
        { q: 'لدي عيادة في كرمئيل — هل أحتاج نظام حجز مواعيد؟', a: 'ممكن. أستطيع دمج نموذج حجز مواعيد، رابط واتساب، أو نظام حجوزات كامل — حسب حاجتك وميزانيتك.' },
        { q: 'هل تتكفّلون بالدومين والاستضافة أيضًا؟', a: 'نعم. أتكفّل بكل العملية من البداية للنهاية — شراء الدومين، الاستضافة، شهادة SSL والنشر. لا داعي لتتعامل مع الجانب التقني.' },
        { q: 'هل سيكون الموقع سريعًا حتى مع صور كثيرة؟', a: 'بالتأكيد. أبني بتقنيات حديثة وتحسين للصور، بحيث يُحمّل الموقع بسرعة وخفّة — وهذا يساعد أيضًا في ترتيب جوجل.' },
      ],
    },
  },
  {
    slug: 'web-design-nahariya',
    en: 'Nahariya',
    geo: { lat: 33.0059, lng: 35.0942 },
    name: { he: 'נהריה', ar: 'نهاريا' },
    he: {
      lead: 'נהריה, עיר החוף של הצפון, מלאה בעסקי תיירות, מסעדות, בתי הארחה ומטפלים. אתר מזמין ומהיר עוזר לעסק בנהריה לתפוס את הלקוח בדיוק ברגע שהוא מחפש. אני בונה אתרים יפים, מותאמים לנייד וממירים — שמביאים הזמנות ופניות.',
      angle: [
        'עיצוב חוֹפי ומזמין שמתאים לעסקי תיירות ואירוח.',
        'מותאם לנייד במיוחד — הלקוחות מחפשים בזמן אמת מהטלפון.',
        'טפסים והזמנות מהירים כדי לא לפספס אף פנייה.',
      ],
      faq: [
        { q: 'יש לי צימר/בית הארחה בנהריה — אתם בונים אתר עם הזמנות?', a: 'כן. אני בונה אתרי אירוח עם גלריה, מחירים, זמינות וכפתור הזמנה/וואטסאפ — הכל מהיר ומותאם לנייד כדי לתפוס את הלקוח מיד.' },
        { q: 'כמה עולה אתר לעסק קטן בנהריה?', a: 'המחיר תלוי בהיקף, אבל אתר תדמית לעסק קטן מתחיל בטווח נגיש. תמיד תקבל הצעת מחיר שקופה מראש.' },
        { q: 'תוכל לעדכן את האתר עבורי אחרי ההשקה?', a: 'כן. אני מציע חבילות תחזוקה ועדכונים שוטפים, כך שהאתר תמיד מעודכן, מאובטח ומהיר.' },
      ],
    },
    ar: {
      lead: 'نهاريا، مدينة الشمال الساحلية، مليئة بأنشطة السياحة والمطاعم وبيوت الضيافة والمعالجين. موقع جذّاب وسريع يساعد نشاطك في نهاريا على التقاط العميل في اللحظة التي يبحث فيها بالضبط. أبني مواقع جميلة ومتوافقة مع الجوال وفعّالة — تجلب الحجوزات والاستفسارات.',
      angle: [
        'تصميم ساحلي وجذّاب يناسب أنشطة السياحة والضيافة.',
        'متوافق مع الجوال بشكل خاص — العملاء يبحثون لحظيًا من الهاتف.',
        'نماذج وحجوزات سريعة كي لا يفوتك أي استفسار.',
      ],
      faq: [
        { q: 'لدي شاليه/بيت ضيافة في نهاريا — هل تبنون موقعًا مع حجوزات؟', a: 'نعم. أبني مواقع ضيافة مع معرض صور، أسعار، توفّر وزر حجز/واتساب — كله سريع ومتوافق مع الجوال لالتقاط العميل فورًا.' },
        { q: 'كم يكلّف موقع لنشاط صغير في نهاريا؟', a: 'السعر يعتمد على الحجم، لكن موقعًا تعريفيًا لنشاط صغير يبدأ من سعر مناسب. ستحصل دائمًا على عرض سعر شفّاف مسبقًا.' },
        { q: 'هل يمكنك تحديث الموقع لي بعد الإطلاق؟', a: 'نعم. أقدّم باقات صيانة وتحديثات متواصلة، بحيث يبقى الموقع محدّثًا وآمنًا وسريعًا.' },
      ],
    },
  },
  {
    slug: 'web-design-haifa',
    en: 'Haifa',
    geo: { lat: 32.794, lng: 34.9896 },
    name: { he: 'חיפה', ar: 'حيفا' },
    he: {
      lead: 'חיפה היא עיר הטכנולוגיה של הצפון — סטארטאפים, עסקים גדולים, סטודנטים ונותני שירות. בשוק תחרותי כזה, אתר מהיר, מודרני וממיר הוא יתרון אמיתי. אני בונה אתרים ואפליקציות ווב ב-React ו-Next.js, עם SEO ואוטומציית AI — ברמה שמתאימה גם לעסק וגם לסטארטאפ.',
      angle: [
        'טכנולוגיה מתקדמת (React, Next.js) לעסקים וסטארטאפים תובעניים.',
        'אינטגרציית AI ואוטומציה — צ׳אטבוטים ותהליכים חכמים.',
        'ביצועים ו-SEO ברמה גבוהה כדי לבלוט בשוק החיפאי התחרותי.',
      ],
      faq: [
        { q: 'אני סטארטאפ בחיפה — אתם בונים גם אפליקציות ווב מלאות?', a: 'כן. מעבר לאתרי תדמית אני בונה אפליקציות ווב מלאות (Full-Stack) ב-React, Next.js ו-Node.js — כולל מסדי נתונים, ממשקי ניהול ואינטגרציות.' },
        { q: 'אתם משלבים AI ואוטומציה באתר?', a: 'בהחלט. אני משלב צ׳אטבוטים חכמים, אוטומציית תהליכים ועיבוד נתונים מבוסס AI — כדי לחסוך לך זמן ולשפר את חוויית הלקוח.' },
        { q: 'האתר יהיה מותאם ל-SEO ולחיפוש ב-AI?', a: 'כן. אני בונה עם SEO, AEO (אופטימיזציה למנועי תשובות) ו-GEO בראש — כך שהאתר מוכן גם לגוגל וגם לחיפוש דרך ChatGPT ומנועי AI.' },
      ],
    },
    ar: {
      lead: 'حيفا هي مدينة التكنولوجيا في الشمال — شركات ناشئة، أنشطة كبيرة، طلاب ومقدّمو خدمات. في سوق تنافسي كهذا، الموقع السريع والحديث والفعّال ميزة حقيقية. أبني مواقع وتطبيقات ويب بـ React و Next.js، مع SEO وأتمتة AI — بمستوى يناسب النشاط التجاري والشركة الناشئة معًا.',
      angle: [
        'تقنيات متقدّمة (React، Next.js) للأنشطة والشركات الناشئة الطموحة.',
        'تكامل AI وأتمتة — شات بوتات وعمليات ذكية.',
        'أداء و SEO بمستوى عالٍ للتميّز في سوق حيفا التنافسي.',
      ],
      faq: [
        { q: 'أنا شركة ناشئة في حيفا — هل تبنون تطبيقات ويب كاملة أيضًا؟', a: 'نعم. إلى جانب المواقع التعريفية أبني تطبيقات ويب كاملة (Full-Stack) بـ React و Next.js و Node.js — بما في ذلك قواعد البيانات، لوحات الإدارة والتكاملات.' },
        { q: 'هل تدمجون AI وأتمتة في الموقع؟', a: 'بالتأكيد. أدمج شات بوتات ذكية، أتمتة عمليات ومعالجة بيانات معتمدة على AI — لتوفير وقتك وتحسين تجربة العميل.' },
        { q: 'هل سيكون الموقع محسّنًا لـ SEO وللبحث عبر AI؟', a: 'نعم. أبني مع مراعاة SEO و AEO (تحسين لمحركات الإجابات) و GEO — بحيث يكون الموقع جاهزًا لجوجل وللبحث عبر ChatGPT ومحركات AI.' },
      ],
    },
  },
];

// URL for a city page in a given language.
const cityUrl = (city, lang) =>
  lang === 'ar' ? `${SITE}/ar/${city.slug}/` : `${SITE}/${city.slug}/`;

const waLink = (city, lang) =>
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(T[lang].waText(city.name[lang]))}`;

const siblingLinks = (current, lang) =>
  cities
    .filter((c) => c.slug !== current.slug)
    .map((c) => `<a href="${cityUrl(c, lang)}">${esc(T[lang].sibling(c.name[lang]))}</a>`)
    .join('\n          ');

const faqJsonLd = (city, lang) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: city[lang].faq.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});

const businessJsonLd = (city, lang) => ({
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${cityUrl(city, lang)}#localbusiness`,
  name: `${lang === 'ar' ? 'وسيم — بناء مواقع في' : 'וסים — בניית אתרים ב'}${city.name[lang]}`,
  image: `${SITE}/og-image.png`,
  url: cityUrl(city, lang),
  telephone: `+${WHATSAPP}`,
  priceRange: '$$',
  description: city[lang].lead,
  areaServed: { '@type': 'City', name: city.en },
  address: {
    '@type': 'PostalAddress',
    addressLocality: city.en,
    addressRegion: 'Northern District',
    addressCountry: 'IL',
  },
  geo: { '@type': 'GeoCoordinates', latitude: city.geo.lat, longitude: city.geo.lng },
  knowsLanguage: ['he', 'ar', 'en'],
  sameAs: ['https://github.com/ward3107', 'https://www.linkedin.com/in/waseem-abu-akel-334486374/'],
});

const breadcrumbJsonLd = (city, lang) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: lang === 'ar' ? 'الرئيسية' : 'דף הבית', item: `${SITE}/` },
    { '@type': 'ListItem', position: 2, name: T[lang].sibling(city.name[lang]), item: cityUrl(city, lang) },
  ],
});

const CSS = `
    :root {
      --purple: #483AA0; --purple-2: #6C5CE7; --cyan: #00B8D4; --gold: #D4AF37;
      --bg: #f8fafc; --card: #ffffff; --text: #0f172a; --muted: #475569; --border: #e2e8f0;
    }
    @media (prefers-color-scheme: dark) {
      :root { --bg: #0a0820; --card: #14122e; --text: #f1f5f9; --muted: #94a3b8; --border: #2a2650; }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { font-family: 'Rubik','Segoe UI',system-ui,-apple-system,Arial,sans-serif; background: var(--bg); color: var(--text); line-height: 1.7; -webkit-font-smoothing: antialiased; }
    a { color: inherit; text-decoration: none; }
    .wrap { max-width: 1080px; margin: 0 auto; padding: 0 20px; }
    .nav { display: flex; align-items: center; justify-content: space-between; padding: 18px 0; gap: 12px; }
    .brand { font-weight: 800; font-size: 20px; letter-spacing: -0.5px; }
    .brand span { color: var(--purple-2); }
    .nav .right { display: flex; align-items: center; gap: 16px; }
    .nav a.back { font-size: 14px; color: var(--muted); }
    .nav a.lang { font-size: 13px; font-weight: 700; color: var(--purple-2); border: 1px solid color-mix(in srgb, var(--purple) 30%, transparent); padding: 4px 12px; border-radius: 999px; }
    .hero { padding: 56px 0 40px; text-align: center; }
    .badge { display: inline-block; font-size: 13px; font-weight: 700; color: var(--purple-2); background: color-mix(in srgb, var(--purple) 12%, transparent); border: 1px solid color-mix(in srgb, var(--purple) 30%, transparent); padding: 6px 14px; border-radius: 999px; margin-bottom: 20px; }
    h1 { font-size: clamp(30px, 6vw, 52px); font-weight: 800; line-height: 1.15; letter-spacing: -1px; margin-bottom: 18px; }
    h1 .grad { background: linear-gradient(90deg, var(--purple-2), var(--cyan)); -webkit-background-clip: text; background-clip: text; color: transparent; }
    .lead { font-size: clamp(16px, 2.4vw, 19px); color: var(--muted); max-width: 720px; margin: 0 auto 30px; }
    .cta-row { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
    .btn { display: inline-flex; align-items: center; gap: 8px; font-weight: 700; font-size: 16px; padding: 14px 26px; border-radius: 14px; transition: transform .2s, box-shadow .2s; }
    .btn-primary { background: linear-gradient(90deg, var(--purple), var(--purple-2)); color: #fff; box-shadow: 0 10px 30px color-mix(in srgb, var(--purple) 40%, transparent); }
    .btn-primary:hover { transform: translateY(-2px); }
    .btn-ghost { background: var(--card); color: var(--text); border: 1.5px solid var(--border); }
    .btn-ghost:hover { border-color: var(--purple-2); }
    section { padding: 40px 0; }
    h2 { font-size: clamp(24px, 4vw, 34px); font-weight: 800; margin-bottom: 24px; letter-spacing: -0.5px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 18px; }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 18px; padding: 24px; transition: transform .2s, border-color .2s; }
    .card:hover { transform: translateY(-4px); border-color: color-mix(in srgb, var(--purple) 40%, transparent); }
    .card .ico { font-size: 26px; margin-bottom: 12px; }
    .card h3 { font-size: 18px; margin-bottom: 8px; }
    .card p { color: var(--muted); font-size: 15px; }
    ul.checks { list-style: none; display: grid; gap: 14px; }
    ul.checks li { display: flex; gap: 12px; align-items: flex-start; font-size: 16px; }
    ul.checks li::before { content: '✓'; color: #fff; background: var(--purple-2); border-radius: 50%; width: 24px; height: 24px; min-width: 24px; display: inline-flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; }
    .faq details { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 4px 20px; margin-bottom: 12px; }
    .faq summary { cursor: pointer; font-weight: 700; font-size: 17px; padding: 16px 0; list-style: none; display: flex; justify-content: space-between; align-items: center; }
    .faq summary::-webkit-details-marker { display: none; }
    .faq summary::after { content: '+'; color: var(--purple-2); font-size: 24px; font-weight: 700; }
    .faq details[open] summary::after { content: '−'; }
    .faq details p { color: var(--muted); padding: 0 0 18px; }
    .cta-band { background: linear-gradient(120deg, var(--purple), var(--purple-2)); color: #fff; border-radius: 24px; padding: 44px 28px; text-align: center; margin: 20px 0; }
    .cta-band h2 { color: #fff; }
    .cta-band p { opacity: .9; margin-bottom: 24px; max-width: 560px; margin-inline: auto; }
    .cta-band .btn-primary { background: #fff; color: var(--purple); box-shadow: 0 10px 30px rgba(0,0,0,.2); }
    footer { border-top: 1px solid var(--border); padding: 34px 0; margin-top: 20px; font-size: 14px; color: var(--muted); }
    footer .areas { display: flex; flex-wrap: wrap; gap: 10px 18px; margin: 14px 0 20px; }
    footer .areas a:hover { color: var(--purple-2); }
    footer .fine { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
`;

const page = (city, lang) => {
  const s = T[lang];
  const c = city[lang];
  const cityName = city.name[lang];
  const url = cityUrl(city, lang);
  const wa = waLink(city, lang);
  const otherLang = lang === 'ar' ? 'he' : 'ar';
  const heroPrefix = lang === 'ar' ? 'بناء مواقع في ' : 'בניית אתרים ב';
  const title =
    lang === 'ar'
      ? `بناء مواقع في ${cityName} | وسيم — مطوّر ومصمّم مواقع في الشمال`
      : `בניית אתרים ב${cityName} | וסים — מפתח ובונה אתרים בצפון`;
  const desc = c.lead.slice(0, 155);
  const keywords =
    lang === 'ar'
      ? `بناء مواقع ${cityName}, تصميم مواقع ${cityName}, مطور مواقع ${cityName}, موقع تعريفي, موقع لنشاط تجاري, website designer ${city.en}`
      : `בניית אתרים ${cityName}, מפתח אתרים ${cityName}, בונה אתרים ${cityName}, עיצוב אתרים ${cityName}, אתר תדמית, אתר לעסק, website designer ${city.en}`;

  return `<!DOCTYPE html>
<html lang="${lang}" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="title" content="${esc(title)}" />
  <meta name="description" content="${esc(desc)}" />
  <meta name="keywords" content="${esc(keywords)}" />
  <meta name="author" content="Waseem" />
  <meta name="robots" content="index, follow" />
  <meta name="theme-color" content="#483AA0" />
  <link rel="canonical" href="${url}" />
  <link rel="alternate" hreflang="he" href="${cityUrl(city, 'he')}" />
  <link rel="alternate" hreflang="ar" href="${cityUrl(city, 'ar')}" />
  <link rel="alternate" hreflang="x-default" href="${cityUrl(city, 'he')}" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

  <meta property="og:type" content="website" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:image" content="${SITE}/og-image.png" />
  <meta property="og:locale" content="${lang === 'ar' ? 'ar_AR' : 'he_IL'}" />
  <meta property="og:site_name" content="Waseem Portfolio" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(desc)}" />
  <meta name="twitter:image" content="${SITE}/og-image.png" />

  <script type="application/ld+json">
${JSON.stringify(businessJsonLd(city, lang), null, 2)}
  </script>
  <script type="application/ld+json">
${JSON.stringify(breadcrumbJsonLd(city, lang), null, 2)}
  </script>
  <script type="application/ld+json">
${JSON.stringify(faqJsonLd(city, lang), null, 2)}
  </script>

  <style>${CSS}</style>
</head>
<body>
  <header class="wrap">
    <nav class="nav">
      <a class="brand" href="${SITE}/">Waseem<span>.</span></a>
      <div class="right">
        <a class="lang" href="${cityUrl(city, otherLang)}" hreflang="${otherLang}">${esc(s.otherLang)}</a>
        <a class="back" href="${SITE}/">${esc(s.back)}</a>
      </div>
    </nav>
  </header>

  <main>
    <section class="hero wrap">
      <span class="badge">${esc(s.badge(cityName))}</span>
      <h1>${esc(heroPrefix)}<span class="grad">${esc(cityName)}</span></h1>
      <p class="lead">${esc(c.lead)}</p>
      <div class="cta-row">
        <a class="btn btn-primary" href="${wa}" target="_blank" rel="noopener">${esc(s.heroBtn)}</a>
        <a class="btn btn-ghost" href="${SITE}/projects">${esc(s.viewWork)}</a>
      </div>
    </section>

    <section class="wrap">
      <h2>${esc(s.servicesTitle(cityName))}</h2>
      <div class="grid">
        ${s.cards
          .map(
            (card) =>
              `<div class="card"><div class="ico">${card.ico}</div><h3>${esc(card.h)}</h3><p>${esc(card.p)}</p></div>`,
          )
          .join('\n        ')}
      </div>
    </section>

    <section class="wrap">
      <h2>${esc(s.whyTitle)}</h2>
      <ul class="checks">
        ${c.angle.map((a) => `<li>${esc(a)}</li>`).join('\n        ')}
        <li>${esc(s.whyLast)}</li>
      </ul>
    </section>

    <section class="wrap faq">
      <h2>${esc(s.faqTitle(cityName))}</h2>
      ${c.faq
        .map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`)
        .join('\n      ')}
    </section>

    <section class="wrap">
      <div class="cta-band">
        <h2>${esc(s.ctaTitle)}</h2>
        <p>${esc(s.ctaText(cityName))}</p>
        <a class="btn btn-primary" href="${wa}" target="_blank" rel="noopener">${esc(s.ctaBtn)}</a>
      </div>
    </section>
  </main>

  <footer class="wrap">
    <strong>${esc(s.areasLabel)}</strong>
    <div class="areas">
      ${siblingLinks(city, lang)}
    </div>
    <div class="fine">
      <span>${esc(s.credit)} <a href="${SITE}/" style="color:var(--purple-2)">${esc(s.toMain)}</a></span>
      <span><a href="${wa}" target="_blank" rel="noopener">${esc(s.whatsapp)}</a> · <a href="${SITE}/about#contact">${esc(s.contact)}</a></span>
    </div>
  </footer>
</body>
</html>
`;
};

// ---------------------------------------------------------------------------
// Write pages (both languages)
// ---------------------------------------------------------------------------
for (const city of cities) {
  for (const lang of LANGS) {
    const dir =
      lang === 'ar'
        ? resolve(publicDir, 'ar', city.slug)
        : resolve(publicDir, city.slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, 'index.html'), page(city, lang), 'utf8');
    console.log(`✓ ${lang === 'ar' ? 'ar/' : ''}${city.slug}/index.html`);
  }
}

// ---------------------------------------------------------------------------
// Regenerate sitemap.xml (homepage + city pages he/ar with hreflang + blog).
// Blog slugs mirror .dev-scripts/generate-blog.mjs — keep in sync.
// ---------------------------------------------------------------------------
const BLOG_SLUGS = [
  'kama-ole-atar-tadmit',
  'atar-tadmit-mul-hanut-online',
  'lama-esek-tzarich-atar',
  'seo-mekomi-tzafon',
  'wordpress-mul-react',
  'kama-zman-lokeach-livnot-atar',
];

const simpleEntry = (loc, priority) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${LASTMOD}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;

// A city page entry with hreflang alternates to its other-language twin.
const cityEntry = (city, lang) => `  <url>
    <loc>${cityUrl(city, lang)}</loc>
    <lastmod>${LASTMOD}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="he" href="${cityUrl(city, 'he')}" />
    <xhtml:link rel="alternate" hreflang="ar" href="${cityUrl(city, 'ar')}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${cityUrl(city, 'he')}" />
  </url>`;

const cityEntries = cities
  .flatMap((c) => LANGS.map((lang) => cityEntry(c, lang)))
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <url>
    <loc>${SITE}/</loc>
    <lastmod>${LASTMOD}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/" />
    <xhtml:link rel="alternate" hreflang="he" href="${SITE}/?lang=he" />
    <xhtml:link rel="alternate" hreflang="ar" href="${SITE}/?lang=ar" />
  </url>

${simpleEntry(`${SITE}/projects`, '0.9')}
${simpleEntry(`${SITE}/about`, '0.9')}

${cityEntries}

${simpleEntry(`${SITE}/blog/`, '0.7')}
${BLOG_SLUGS.map((s) => simpleEntry(`${SITE}/blog/${s}/`, '0.6')).join('\n')}

</urlset>
`;
writeFileSync(resolve(publicDir, 'sitemap.xml'), sitemap, 'utf8');
console.log('✓ sitemap.xml');
console.log(`\nGenerated ${cities.length} cities × ${LANGS.length} languages.`);
