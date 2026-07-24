// Generates a static, SEO-optimized Hebrew blog into /public/blog/ (index +
// one folder per article). Build-time only + gitignored, same as the local
// landing pages, so the templated markup is never committed and doesn't trip
// SonarCloud duplication. Each article has BlogPosting + BreadcrumbList JSON-LD.
//
// Run: node .dev-scripts/generate-blog.mjs   (also run by `npm run build`)
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '..', 'public');
const blogDir = resolve(publicDir, 'blog');

const SITE = 'https://wwas.netlify.app';
const WHATSAPP = '972534260632';
const PUBLISHED = '2026-07-07';
const AUTHOR = 'וסים';

const wa = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent('היי וסים, קראתי את הבלוג ואשמח להצעת מחיר לאתר 🙂')}`;

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---------------------------------------------------------------------------
// Content blocks -> HTML. Each article `body` is an array of block objects.
// { h2 } | { p } | { ul: [] } | { cta } (renders the WhatsApp button)
// ---------------------------------------------------------------------------
const renderBlock = (b) => {
  if (b.h2) return `<h2>${esc(b.h2)}</h2>`;
  if (b.p) return `<p>${esc(b.p)}</p>`;
  if (b.ul)
    return `<ul>${b.ul.map((li) => `<li>${esc(li)}</li>`).join('')}</ul>`;
  if (b.cta)
    return `<div class="inline-cta"><a class="btn btn-primary" href="${wa}" target="_blank" rel="noopener">💬 ${esc(b.cta)}</a></div>`;
  return '';
};

// Articles — genuinely unique, substantial Hebrew content.
const articles = [
  {
    slug: 'kama-ole-atar-tadmit',
    title: 'כמה עולה אתר תדמית ב-2026? מדריך מחירים מלא לעסקים',
    desc: 'כמה באמת עולה אתר תדמית לעסק? פירוק מלא של טווחי המחירים, מה משפיע על העלות, ואיפה כדאי (ולא כדאי) לחסוך.',
    excerpt:
      'מדריך מחירים שקוף: כמה עולה אתר תדמית, מה מייקר ומה מוזיל, ואיך לבחור נכון בלי לזרוק כסף.',
    body: [
      { p: 'אחת השאלות הראשונות שכל בעל עסק שואל היא פשוט: "כמה זה יעלה לי?". התשובה הכנה היא שזה תלוי — אבל זה לא אומר שאי אפשר לתת טווחים ברורים. במדריך הזה אני מפרק את מחירי בניית אתרים ב-2026, כדי שתדעו בדיוק על מה אתם משלמים.' },
      { h2: 'טווחי מחירים לפי סוג אתר' },
      { p: 'המחיר נגזר בעיקר מהמורכבות. הנה החלוקה שאני עובד לפיה:' },
      { ul: [
        'אתר דף נחיתה (Landing Page): עמוד אחד ממוקד המרה — הזול והמהיר ביותר, מתאים לקמפיין או שירות בודד.',
        'אתר תדמית קלאסי (3–6 עמודים): בית, אודות, שירותים, גלריה, צור קשר — הבחירה הנפוצה לעסק קטן.',
        'אתר תדמית מורחב + בלוג / רב-לשוני: כשצריך תוכן שוטף, כמה שפות או אזור אישי — התוכן והמערכת מייקרים.',
        'חנות אונליין / מערכת: קטלוג, סליקה, ניהול הזמנות — הפרויקט המורכב ביותר וגם היקר.',
      ] },
      { h2: 'מה באמת משפיע על המחיר?' },
      { p: 'שני אתרים עם אותו מספר עמודים יכולים לעלות אחרת לגמרי. הגורמים העיקריים:' },
      { ul: [
        'עיצוב מותאם אישית מול תבנית מוכנה — עיצוב ייחודי דורש יותר עבודה אבל מבדל אתכם.',
        'כמות התוכן והשפות — אתר דו-לשוני (עברית + ערבית) מכפיל חלק מהעבודה.',
        'פיצ׳רים: טופס חכם, זימון תורים, אזור לקוחות, אינטגרציות (וואטסאפ, יומן, תשלומים).',
        'תמיכה ותחזוקה אחרי ההשקה — האם זו עסקה חד-פעמית או ליווי מתמשך.',
      ] },
      { h2: 'זול מדי? שימו לב לעלויות הנסתרות' },
      { p: 'אתר "ב-500 שקל" נשמע מפתה, אבל לרוב מסתתרות שם עלויות: תבנית גנרית שנראית כמו של כולם, אתר איטי שפוגע בדירוג בגוגל, אפס SEO, ואפס תמיכה כשמשהו נשבר. אתר הוא נכס עסקי — לא הוצאה חד-פעמית. אתר איטי ולא מותאם לנייד עולה לכם בלקוחות שעוזבים לפני שהעמוד בכלל נטען.' },
      { h2: 'איפה כן כדאי לחסוך' },
      { p: 'לא חייבים הכול ביום הראשון. אפשר להתחיל באתר תדמית ממוקד ומהיר, ולהוסיף בהמשך בלוג, חנות או אזור לקוחות כשהעסק גדל. ככה משלמים לפי הצורך האמיתי במקום על פיצ׳רים שלא בשימוש.' },
      { cta: 'קבלו הצעת מחיר שקופה לעסק שלכם' },
    ],
  },
  {
    slug: 'atar-tadmit-mul-hanut-online',
    title: 'אתר תדמית או חנות אונליין? המדריך לבחירה הנכונה לעסק',
    desc: 'לא בטוחים אם אתם צריכים אתר תדמית או חנות אונליין? השוואה מעשית שתעזור לכם להחליט לפי סוג העסק והמטרות.',
    excerpt:
      'תדמית מול חנות: מה ההבדל האמיתי, כמה זה עולה, ואיזה מהם מתאים לעסק שלכם דווקא עכשיו.',
    body: [
      { p: 'הרבה בעלי עסקים מתלבטים: "אני צריך סתם אתר, או חנות שאפשר לקנות בה?". הבחירה הזו משפיעה על התקציב, על הזמן ועל האופן שבו הלקוחות יתקשרו אתכם. בואו נעשה סדר.' },
      { h2: 'מה זה אתר תדמית' },
      { p: 'אתר תדמית מציג את העסק: מי אתם, מה אתם מציעים, למה לבחור בכם, ואיך יוצרים קשר. המטרה שלו היא לבנות אמון ולהניע לפנייה — טלפון, וואטסאפ או טופס. הוא מושלם לנותני שירות: יועצים, מטפלים, בעלי מקצוע, מסעדות ועסקים מקומיים.' },
      { h2: 'מה זה חנות אונליין' },
      { p: 'חנות אונליין (E-commerce) מאפשרת ללקוח לבחור מוצר, לשלם ולסיים עסקה — הכול לבד, 24/7. היא כוללת קטלוג, עגלת קניות, סליקה וניהול הזמנות ומלאי. זו השקעה גדולה יותר, אבל היא פותחת ערוץ מכירה שעובד גם כשאתם ישנים.' },
      { h2: 'איך לבחור — 3 שאלות' },
      { ul: [
        'האם אתם מוכרים מוצר פיזי/דיגיטלי שאפשר לשלם עליו אונליין? אם כן — חנות.',
        'האם המטרה העיקרית היא לידים ופניות (ולא מכירה ישירה)? אם כן — תדמית.',
        'מה התקציב והלוח זמנים? תדמית מהיר וזול יותר; חנות דורשת יותר תכנון ותקציב.',
      ] },
      { h2: 'הפתרון האמצעי' },
      { p: 'לא חייבים לבחור קיצוני. אפשר לבנות אתר תדמית מעולה, ולהוסיף לו "חנות קטנה" של כמה מוצרים או כפתור הזמנה/תשלום, בלי להקים מערכת מסחר מלאה. ככה מתחילים חכם ומרחיבים כשיש ביקוש אמיתי.' },
      { p: 'בכל מקרה — שני הסוגים חייבים להיות מהירים, מותאמים לנייד ובנויים ל-SEO, אחרת הלקוחות פשוט לא ימצאו אתכם בגוגל.' },
      { cta: 'לא בטוחים מה מתאים? בואו נתייעץ' },
    ],
  },
  {
    slug: 'lama-esek-tzarich-atar',
    title: '5 סיבות שהעסק שלך חייב אתר — גם אם יש לך אינסטגרם',
    desc: 'יש לכם דף עסקי באינסטגרם או פייסבוק וזה עובד? מעולה. הנה למה אתר משלכם עדיין הכרחי בדיוק בגלל זה.',
    excerpt:
      'רשתות חברתיות הן שכירות. אתר הוא נכס בבעלותכם. 5 סיבות למה עסק חייב אתר משלו.',
    body: [
      { p: 'המשפט שאני שומע הכי הרבה: "יש לי אינסטגרם עם עוקבים, בשביל מה לי אתר?". התשובה חשובה, כי היא ההבדל בין לבנות על קרקע שלכם לבין לשכור דירה שבעל הבית יכול לפנות אתכם ממנה בכל רגע.' },
      { h2: '1. האתר שלכם — הבעלות שלכם' },
      { p: 'עמוד אינסטגרם שייך לאינסטגרם. שינוי אלגוריתם, חסימה בטעות או ירידה בחשיפה — וכל הקהל שבניתם נעלם. אתר הוא נכס דיגיטלי שבבעלותכם המלאה, אף אחד לא יכול לקחת לכם אותו.' },
      { h2: '2. לקוחות מחפשים בגוגל, לא רק בפיד' },
      { p: 'כשמישהו צריך "בונה אתרים בכרמיאל" או "מסעדה בעכו" — הוא מקליד בגוגל. בלי אתר, אתם פשוט לא קיימים בחיפוש הזה, ומפספסים את הלקוח בדיוק ברגע שהוא הכי מוכן לקנות.' },
      { h2: '3. אמינות ומקצועיות' },
      { p: 'אתר מסודר משדר עסק רציני. לקוח שמתלבט בין שני עסקים יבחר לרוב בזה שיש לו אתר מקצועי — זה אות לכך שאתם כאן לאורך זמן.' },
      { h2: '4. אתם שולטים בחוויה ובמסר' },
      { p: 'ברשת אתם כלואים בתבנית של הפלטפורמה. באתר אתם מחליטים מה הלקוח רואה קודם, איך הוא יוצר קשר, ואיזו פעולה הוא מבצע. זה מגדיל דרמטית את אחוז ההמרה.' },
      { h2: '5. האתר עובד בשבילכם 24/7' },
      { p: 'טופס יצירת קשר, כפתור וואטסאפ, שאלות נפוצות — האתר עונה ללקוחות גם ב-3 בלילה. במקום להסביר שוב ושוב את אותם דברים בהודעות, הכול כתוב, ברור וזמין.' },
      { p: 'הכי חכם? לחבר את הכול: אתר במרכז, והרשתות מפנות אליו תנועה. ככה בונים נוכחות דיגיטלית שהיא באמת שלכם.' },
      { cta: 'בואו נבנה לכם בית דיגיטלי משלכם' },
    ],
  },
  {
    slug: 'seo-mekomi-tzafon',
    title: 'SEO מקומי: איך העסק שלך יופיע ראשון בגוגל בצפון',
    desc: 'מדריך SEO מקומי מעשי לעסקים בצפון — איך לטפס בתוצאות החיפוש של גוגל בלי לשלם על פרסום.',
    excerpt:
      'איך גורמים לגוגל להציג את העסק שלכם ראשון כשמחפשים שירות באזור שלכם — בלי לשלם על מודעות.',
    body: [
      { p: 'רוב העסקים המקומיים מתחרים על אותו דבר: להופיע גבוה בגוגל כשלקוח מהאזור מחפש שירות. הבשורה הטובה — SEO מקומי הוא אחד הכלים הכי חזקים לצמיחה אורגנית, בלי לשלם שקל על פרסום. הנה איך זה עובד.' },
      { h2: 'מה זה בכלל SEO מקומי' },
      { p: 'SEO מקומי הוא כל מה שגורם לגוגל להבין איפה אתם, מה אתם עושים, ולמי כדאי להציג אתכם. כשמישהו בכרמיאל מחפש "מעצב אתרים", גוגל מנסה להציג לו עסקים רלוונטיים באזור שלו — ואתם רוצים להיות שם.' },
      { h2: '1. פרופיל עסק בגוגל (Google Business Profile)' },
      { p: 'זה הבסיס. פרופיל מלא, עם קטגוריה נכונה, שעות, תמונות ותיאור — הוא מה שמופיע במפה ובצד הימני של החיפוש. עדכנו אותו באופן קבוע: פוסטים, תמונות ותשובות לפניות. פרופיל "חי" מדורג גבוה יותר.' },
      { h2: '2. ביקורות Google' },
      { p: 'ביקורות הן מנוע הדירוג המקומי החזק ביותר. בקשו ביקורת מכל לקוח מרוצה, ובקשו שיזכיר את השירות והעיר בטקסט. ענו על כל ביקורת — גם זה סיגנל לגוגל שאתם פעילים.' },
      { h2: '3. עמודים מקומיים באתר' },
      { p: 'עמוד ייעודי לכל אזור שירות ("בניית אתרים בעכו", "בניית אתרים בכרמיאל") עוזר לגוגל לקשר אתכם לכל עיר. חשוב שהתוכן יהיה ייחודי ואמיתי לכל עמוד — לא העתק-הדבק.' },
      { h2: '4. אתר מהיר ומותאם לנייד' },
      { p: 'גוגל מדרג לפי מהירות וחוויית משתמש. אתר איטי או שנראה שבור בנייד יידחק למטה, כמה שלא תשקיעו בשאר. מהירות היא לא מותרות — היא תנאי סף.' },
      { h2: '5. עקביות מעל הכול' },
      { p: 'SEO מקומי הוא מרתון, לא ספרינט. עדכון פרופיל, ביקורת חדשה, פוסט או מאמר — כל שבוע. העקביות הזו היא בדיוק מה שהופך גרף חיפושים יורד לגרף עולה, לאורך זמן ובלי תקציב פרסום.' },
      { cta: 'רוצים אתר שבנוי מהיסוד ל-SEO מקומי?' },
    ],
  },
  {
    slug: 'wordpress-mul-react',
    title: 'וורדפרס מול אתר בהתאמה אישית (React): מה עדיף לעסק שלך?',
    desc: 'וורדפרס או אתר בהתאמה אישית ב-React? השוואה כנה של מהירות, אבטחה, גמישות ועלות — כדי שתבחרו נכון.',
    excerpt:
      'וורדפרס מהיר להקים אבל כבד; אתר בהתאמה אישית מהיר וייחודי אבל דורש מפתח. איך בוחרים?',
    body: [
      { p: 'כשמתחילים לחשוב על אתר, שתי המילים שחוזרות הן "וורדפרס" ו"אתר בהתאמה אישית". שתיהן לגיטימיות — אבל הן פותרות בעיות שונות. הנה השוואה כנה שתעזור לכם להחליט לפי מה שחשוב לעסק שלכם.' },
      { h2: 'מה זה וורדפרס' },
      { p: 'וורדפרס היא מערכת ניהול תוכן (CMS) שמריצה חלק גדול מהאינטרנט. בונים איתה אתר מהר יחסית בעזרת תבניות ותוספים (plugins). היתרון: מהירות הקמה ועריכת תוכן עצמאית. החיסרון: תוספים רבים מכבידים על האתר, דורשים עדכוני אבטחה תכופים, ולעיתים האתר נראה "כמו כולם".' },
      { h2: 'מה זה אתר בהתאמה אישית (React)' },
      { p: 'אתר בהתאמה אישית נבנה מהיסוד בקוד (למשל React / Next.js). כל פיקסל וכל פונקציה נבנים בדיוק לצרכים שלכם. היתרון: מהירות גבוהה מאוד, אבטחה טובה יותר (פחות "דלתות" פתוחות), עיצוב ייחודי וחוויית משתמש מלוטשת. החיסרון: דורש מפתח כדי לבנות ולעדכן שינויים מבניים.' },
      { h2: 'השוואה מהירה' },
      { ul: [
        'מהירות: אתר בהתאמה אישית כמעט תמיד מהיר יותר — וזה משפיע ישירות על דירוג בגוגל ועל המרות.',
        'אבטחה: פחות תוספים = פחות פרצות. אתר מותאם אישית בטוח יותר כברירת מחדל.',
        'גמישות עיצוב: בהתאמה אישית אין גבול; בוורדפרס מוגבלים לתבנית ולתוספים.',
        'עריכת תוכן: וורדפרס נוח לעריכה עצמאית; באתר מותאם אפשר להוסיף מערכת ניהול תוכן לפי הצורך.',
        'עלות לאורך זמן: וורדפרס זול בהקמה אך צובר עלויות תוספים ותחזוקה; מותאם אישית יקר יותר בהתחלה אך יציב וזול לתחזוקה.',
      ] },
      { h2: 'אז מה לבחור?' },
      { p: 'אם אתם צריכים אתר תוכן שמתעדכן יומיומית ורוצים לערוך לבד — וורדפרס יכול להתאים. אם אתם רוצים אתר מהיר, ייחודי, מאובטח וממיר שמייצג עסק שרוצה לבלוט — אתר בהתאמה אישית ישתלם לכם הרבה יותר לאורך זמן. אני בונה בהתאמה אישית בדיוק בגלל היתרונות האלה, ומוסיף מערכת ניהול תוכן כשצריך.' },
      { cta: 'לא בטוחים מה מתאים? בואו נתייעץ' },
    ],
  },
  {
    slug: 'kama-zman-lokeach-livnot-atar',
    title: 'כמה זמן לוקח לבנות אתר? ציר זמן ריאלי משיחה ועד עלייה לאוויר',
    desc: 'כמה זמן באמת לוקח לבנות אתר? פירוק שלב-אחר-שלב של התהליך וטווחי זמן ריאליים לפי סוג האתר.',
    excerpt:
      'משיחת אפיון ועד עלייה לאוויר — כמה זמן כל שלב לוקח, ומה מזרז או מעכב את הפרויקט.',
    body: [
      { p: '"מתי האתר יהיה מוכן?" — שאלה הוגנת לגמרי. התשובה תלויה בהיקף, אבל התהליך עצמו די קבוע. הנה ציר הזמן הריאלי, שלב אחר שלב.' },
      { h2: 'שלב 1: אפיון ותכנון (1–3 ימים)' },
      { p: 'נשב (או נדבר בוואטסאפ) ונגדיר: מה מטרת האתר, אילו עמודים צריך, מי הקהל ומה הפעולה שאנחנו רוצים שהמבקר יעשה. ככל שהשלב הזה ברור יותר, כל השאר זורם מהר יותר.' },
      { h2: 'שלב 2: עיצוב (3–7 ימים)' },
      { p: 'בונים מראה ותחושה — צבעים, פונטים, מבנה העמודים. אתם מאשרים לפני שכותבים שורת קוד אחת, כדי שלא יהיו הפתעות.' },
      { h2: 'שלב 3: פיתוח (5–14 ימים)' },
      { p: 'הופכים את העיצוב לאתר עובד, מהיר ומותאם לנייד. כאן נכנסים גם טפסים, אינטגרציות (וואטסאפ, יומן) ו-SEO טכני.' },
      { h2: 'שלב 4: תוכן ובדיקות (2–4 ימים)' },
      { p: 'מכניסים טקסטים ותמונות, ובודקים הכל: תצוגה בכל מכשיר, מהירות, קישורים, טפסים. מתקנים פרטים אחרונים.' },
      { h2: 'שלב 5: עלייה לאוויר (1 יום)' },
      { p: 'מחברים דומיין, אחסון ו-SSL, מעלים לאוויר ומגישים לגוגל. האתר חי.' },
      { h2: 'טווחי זמן לפי סוג אתר' },
      { ul: [
        'דף נחיתה: 3–5 ימים.',
        'אתר תדמית (3–6 עמודים): שבוע עד שבועיים.',
        'אתר מורחב / רב-לשוני: 2–4 שבועות.',
        'חנות אונליין / מערכת: חודש עד שלושה.',
      ] },
      { p: 'מה מזרז? תוכן ותמונות מוכנים מראש, ומשוב מהיר בשלבי האישור. מה מעכב? שינויי כיוון באמצע והמתנה לתכנים. אצלי — לוח זמנים ברור מראש, בלי הפתעות.' },
      { cta: 'רוצים אתר מוכן בזמן? בואו נתחיל' },
    ],
  },
];

const blogCss = `
  :root {
    --purple:#483AA0;--purple-2:#6C5CE7;--cyan:#00B8D4;--gold:#D4AF37;
    --bg:#f8fafc;--card:#fff;--text:#0f172a;--muted:#475569;--border:#e2e8f0;
  }
  @media (prefers-color-scheme: dark){
    :root{--bg:#0a0820;--card:#14122e;--text:#f1f5f9;--muted:#94a3b8;--border:#2a2650;}
  }
  *{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{font-family:'Rubik','Segoe UI',system-ui,-apple-system,Arial,sans-serif;background:var(--bg);color:var(--text);line-height:1.8;-webkit-font-smoothing:antialiased}
  a{color:inherit;text-decoration:none}
  .wrap{max-width:760px;margin:0 auto;padding:0 20px}
  .nav{display:flex;align-items:center;justify-content:space-between;padding:18px 0;max-width:1080px;margin:0 auto}
  .brand{font-weight:800;font-size:20px;letter-spacing:-.5px}
  .brand span{color:var(--purple-2)}
  .nav a.back{font-size:14px;color:var(--muted)}
  .crumbs{font-size:13px;color:var(--muted);padding:24px 0 4px}
  .crumbs a:hover{color:var(--purple-2)}
  h1{font-size:clamp(26px,5vw,40px);font-weight:800;line-height:1.25;letter-spacing:-.5px;margin:10px 0 14px}
  .meta{color:var(--muted);font-size:14px;margin-bottom:28px;border-bottom:1px solid var(--border);padding-bottom:20px}
  article h2{font-size:clamp(20px,3.4vw,26px);font-weight:800;margin:34px 0 12px;letter-spacing:-.3px}
  article p{color:var(--text);margin:14px 0;font-size:17px}
  article ul{margin:14px 0;padding-inline-start:8px;list-style:none;display:grid;gap:10px}
  article ul li{display:flex;gap:12px;align-items:flex-start;color:var(--text);font-size:16px}
  article ul li::before{content:'←';color:var(--purple-2);font-weight:800}
  .inline-cta{margin:26px 0;text-align:center}
  .btn{display:inline-flex;align-items:center;gap:8px;font-weight:700;font-size:16px;padding:14px 26px;border-radius:14px;transition:transform .2s}
  .btn-primary{background:linear-gradient(90deg,var(--purple),var(--purple-2));color:#fff;box-shadow:0 10px 30px color-mix(in srgb,var(--purple) 40%,transparent)}
  .btn-primary:hover{transform:translateY(-2px)}
  .end-cta{background:linear-gradient(120deg,var(--purple),var(--purple-2));color:#fff;border-radius:24px;padding:40px 26px;text-align:center;margin:44px 0}
  .end-cta h2{color:#fff;margin:0 0 10px}
  .end-cta p{opacity:.9;margin:0 auto 22px;max-width:520px}
  .end-cta .btn-primary{background:#fff;color:var(--purple)}
  .related{margin:40px 0}
  .related h3{font-size:18px;margin-bottom:14px}
  .related a{display:block;padding:14px 18px;background:var(--card);border:1px solid var(--border);border-radius:14px;margin-bottom:10px;font-weight:600;transition:border-color .2s}
  .related a:hover{border-color:var(--purple-2)}
  .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:18px;margin:24px 0 10px}
  .post-card{background:var(--card);border:1px solid var(--border);border-radius:18px;padding:26px;transition:transform .2s,border-color .2s}
  .post-card:hover{transform:translateY(-4px);border-color:color-mix(in srgb,var(--purple) 40%,transparent)}
  .post-card h2{font-size:20px;margin-bottom:10px;line-height:1.35}
  .post-card p{color:var(--muted);font-size:15px}
  .post-card .more{color:var(--purple-2);font-weight:700;font-size:14px;margin-top:12px;display:inline-block}
  .lead{color:var(--muted);font-size:18px;margin:6px 0 10px}
  footer{border-top:1px solid var(--border);padding:30px 0;margin-top:20px;font-size:14px;color:var(--muted);max-width:1080px;margin-inline:auto}
  footer a:hover{color:var(--purple-2)}
`;

const head = (title, desc, url, jsonLd) => `  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}" />
  <meta name="author" content="Waseem" />
  <meta name="robots" content="index, follow" />
  <meta name="theme-color" content="#483AA0" />
  <link rel="canonical" href="${url}" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:image" content="${SITE}/og-image.png" />
  <meta property="og:locale" content="he_IL" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(desc)}" />
  <meta name="twitter:image" content="${SITE}/og-image.png" />
${jsonLd.map((o) => `  <script type="application/ld+json">\n${JSON.stringify(o, null, 2)}\n  </script>`).join('\n')}
  <style>${blogCss}</style>`;

const articlePage = (a) => {
  const url = `${SITE}/blog/${a.slug}/`;
  const related = articles.filter((x) => x.slug !== a.slug).slice(0, 3);
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      headline: a.title,
      description: a.desc,
      image: `${SITE}/og-image.png`,
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
      inLanguage: 'he',
      author: { '@type': 'Person', name: AUTHOR, url: SITE },
      publisher: {
        '@type': 'Person',
        name: AUTHOR,
        logo: { '@type': 'ImageObject', url: `${SITE}/og-image.png` },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'דף הבית', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'בלוג', item: `${SITE}/blog/` },
        { '@type': 'ListItem', position: 3, name: a.title, item: url },
      ],
    },
  ];

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
${head(a.title + ' | וסים', a.desc, url, jsonLd)}
</head>
<body>
  <header>
    <nav class="nav">
      <a class="brand" href="${SITE}/">Waseem<span>.</span></a>
      <a class="back" href="${SITE}/blog/">← לכל המאמרים</a>
    </nav>
  </header>
  <main class="wrap">
    <div class="crumbs"><a href="${SITE}/">בית</a> / <a href="${SITE}/blog/">בלוג</a> / ${esc(a.title)}</div>
    <h1>${esc(a.title)}</h1>
    <div class="meta">מאת ${esc(AUTHOR)} · מפתח ובונה אתרים · ${PUBLISHED}</div>
    <article>
      ${a.body.map(renderBlock).join('\n      ')}
    </article>

    <div class="end-cta">
      <h2>מוכנים לאתר שמביא לקוחות?</h2>
      <p>ספרו לי על העסק שלכם ואחזור אליכם עם רעיון והצעת מחיר — בלי התחייבות.</p>
      <a class="btn btn-primary" href="${wa}" target="_blank" rel="noopener">💬 דברו איתי בוואטסאפ</a>
    </div>

    <div class="related">
      <h3>מאמרים נוספים</h3>
      ${related.map((r) => `<a href="${SITE}/blog/${r.slug}/">${esc(r.title)}</a>`).join('\n      ')}
    </div>
  </main>
  <footer class="wrap">
    © 2026 וסים — בניית אתרים בצפון · <a href="${SITE}/" style="color:var(--purple-2)">לאתר הראשי</a> · <a href="${SITE}/about#contact">צור קשר</a>
  </footer>
</body>
</html>
`;
};

const indexPage = () => {
  const url = `${SITE}/blog/`;
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      '@id': `${url}#blog`,
      name: 'הבלוג של וסים — בניית אתרים ו-SEO',
      description:
        'טיפים, מדריכים ותובנות על בניית אתרים, SEO מקומי וצמיחה דיגיטלית לעסקים בצפון.',
      url,
      inLanguage: 'he',
      author: { '@type': 'Person', name: AUTHOR, url: SITE },
      blogPost: articles.map((a) => ({
        '@type': 'BlogPosting',
        headline: a.title,
        description: a.desc,
        datePublished: PUBLISHED,
        url: `${SITE}/blog/${a.slug}/`,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'דף הבית', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'בלוג', item: url },
      ],
    },
  ];

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
${head('הבלוג של וסים — בניית אתרים, SEO וצמיחה דיגיטלית', 'מדריכים וטיפים על בניית אתרים, מחירים, SEO מקומי וצמיחה דיגיטלית לעסקים בצפון — מאת וסים, מפתח ובונה אתרים.', url, jsonLd)}
</head>
<body>
  <header>
    <nav class="nav">
      <a class="brand" href="${SITE}/">Waseem<span>.</span></a>
      <a class="back" href="${SITE}/">← לאתר הראשי</a>
    </nav>
  </header>
  <main class="wrap">
    <div class="crumbs"><a href="${SITE}/">בית</a> / בלוג</div>
    <h1>הבלוג</h1>
    <p class="lead">מדריכים, טיפים ותובנות על בניית אתרים, SEO מקומי וצמיחה דיגיטלית לעסקים בצפון.</p>
    <div class="cards">
      ${articles
        .map(
          (a) =>
            `<a class="post-card" href="${SITE}/blog/${a.slug}/">
        <h2>${esc(a.title)}</h2>
        <p>${esc(a.excerpt)}</p>
        <span class="more">קראו עוד ←</span>
      </a>`,
        )
        .join('\n      ')}
    </div>
  </main>
  <footer class="wrap">
    © 2026 וסים — בניית אתרים בצפון · <a href="${SITE}/" style="color:var(--purple-2)">לאתר הראשי</a> · <a href="${SITE}/about#contact">צור קשר</a>
  </footer>
</body>
</html>
`;
};

// Write index + articles
mkdirSync(blogDir, { recursive: true });
writeFileSync(resolve(blogDir, 'index.html'), indexPage(), 'utf8');
console.log('✓ blog/index.html');
for (const a of articles) {
  const dir = resolve(blogDir, a.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, 'index.html'), articlePage(a), 'utf8');
  console.log(`✓ blog/${a.slug}/index.html`);
}
console.log(`\nGenerated blog index + ${articles.length} articles.`);
