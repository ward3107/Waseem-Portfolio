import { useLanguage } from '@/contexts/LanguageContext';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { useContact } from '@/features/contact/useContact';
import { A11Y_OPEN_EVENT } from '@/shared/widgets/accessibilitySettings';

const LAST_UPDATED = '2026-10-24';
const copy = {
  he: {
    title: 'הצהרת נגישות', updated: 'עודכן לאחרונה', intro: 'אני פועל לשיפור נגישות אתר ואסיה, כדי לאפשר שימוש נוח לאנשים עם מוגבלות ובטכנולוגיות מסייעות.',
    standards: 'מסגרת העבודה', standardText: 'העבודה מתייחסת לתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות) ולתקן הישראלי ת״י 5568. יעד הפיתוח הוא WCAG 2.2 ברמה AA. זו הצהרה על ההתאמות ועל מגבלותיהן; לא הושלמה בדיקת עמידה מלאה של כל האתר.',
    toolbar: 'התאמות זמינות', toolbarText: 'הכפתור נמצא באמצע השול הימני. החלון נפתח מימין וכולל גלילה עצמאית, ניווט במקלדת וסגירה ב־Escape. Tab ו־Shift+Tab עוברים בין הפקדים; החיצים ו־Page Down מאפשרים גלילה כשאזור הגלילה ממוקד.',
    features: ['גודל טקסט מ־100% עד 200%', 'ניגודיות בהירה וכהה', 'הדגשת קישורים', 'גופן קריא', 'ריווח טקסט מוגבר', 'הדגשת כותרות', 'מיקוד מקלדת מודגש', 'הפחתת תנועה והנפשות, כולל מעבר מתצוגת תלת־ממד לתוכן רגיל', 'סמן עכבר גדול', 'הסתרת מדיה דקורטיבית תוך שמירת תמונות בעלות משמעות', 'מדיה בגווני אפור', 'יישור טקסט לפי כיוון הקריאה', 'קו עזר לקריאה שעוקב אחר העכבר או המיקוד'],
    reopen: 'פתיחת התאמות הנגישות', storage: 'ההגדרות נשמרות במכשיר בלבד. אפשר לאפס אותן בכל עת. הסתרת הכפתור תקפה לביקור הנוכחי, ואפשר לפתוח אותו שוב מכאן.',
    limits: 'מגבלות ובדיקות', limitText: 'בוצעו בדיקות ממוקדות לרכיבי הנגישות והמחשבון. בדיקה ידנית מלאה עם NVDA, JAWS, VoiceOver ו־TalkBack טרם הושלמה. מדיה, סרטונים, מסמכים וקישורי צד שלישי עשויים להזדקק להתאמות נוספות, כגון כתוביות ותיאור קולי. תפריט ההתאמות הוא כלי עזר ואינו מחליף הנגשה של התוכן והקוד.',
    contact: 'עזרה ודיווח על קושי', contactText: 'אפשר לפנות לוואסים אבו עקל בנושא נגישות. כדאי לצרף כתובת עמוד, תיאור הקושי, דפדפן וטכנולוגיה מסייעת, אם נעשה בה שימוש. אפשר לבקש גם חלופה נגישה לתוכן.',
    email: 'דוא״ל', whatsapp: 'וואטסאפ', sources: 'מקורות: הנחיות הנציבות ו־W3C',
  },
  en: {
    title: 'Accessibility statement', updated: 'Last updated', intro: 'I work to improve accessibility on the vasia website so that people with disabilities and assistive technology users can use it comfortably.',
    standards: 'Standards and approach', standardText: 'The work refers to Israel’s Equal Rights for People with Disabilities accessibility regulations and Israeli Standard IS 5568. The development target is WCAG 2.2 Level AA. This statement describes implemented adjustments and their limitations; a full conformance audit of the entire site has not been completed.',
    toolbar: 'Available adjustments', toolbarText: 'The button is halfway down the right edge. Its panel opens on the right with independent scrolling, keyboard controls and Escape to close. Tab and Shift+Tab move between controls; arrows and Page Down scroll when the scrolling region has focus.',
    features: ['Text size from 100% to 200%', 'Light and dark high contrast', 'Link highlighting', 'Readable font', 'Extended text spacing', 'Heading highlighting', 'Stronger keyboard focus', 'Reduced motion and animations, including a text-based alternative to the 3D experience', 'Large cursor', 'Hide decorative media while preserving meaningful images', 'Grayscale media', 'Text alignment in reading direction', 'Reading guide following the pointer or keyboard focus'],
    reopen: 'Open accessibility settings', storage: 'Settings stay on this device and can be reset anytime. Hiding the button lasts for the current visit; reopen it here.',
    limits: 'Testing and limitations', limitText: 'Targeted checks cover the accessibility panel and calculator. A complete manual review with NVDA, JAWS, VoiceOver and TalkBack has not yet been completed. Media, videos, documents and third-party destinations may require further adjustments such as captions and audio description. The settings panel supports access; it does not replace accessible content and code.',
    contact: 'Help and reporting an issue', contactText: 'Contact Waseem Abu Akel about accessibility. Include the page URL, a description, browser and assistive technology where relevant. You can also request an accessible content alternative.',
    email: 'Email', whatsapp: 'WhatsApp', sources: 'Sources: Israeli commission guidance and W3C',
  },
  ar: {
    title: 'بيان إمكانية الوصول', updated: 'آخر تحديث', intro: 'أعمل على تحسين إمكانية الوصول في موقع vasia لتمكين الأشخاص ذوي الإعاقة ومستخدمي التقنيات المساعدة من استخدامه بسهولة.',
    standards: 'المعايير ونهج العمل', standardText: 'يراعي العمل أنظمة المساواة في حقوق الأشخاص ذوي الإعاقة الإسرائيلية والمعيار الإسرائيلي IS 5568. هدف التطوير هو WCAG 2.2 بالمستوى AA. يوضح هذا البيان التعديلات وحدودها؛ لم يكتمل تدقيق شامل لامتثال الموقع بأكمله.',
    toolbar: 'التعديلات المتاحة', toolbarText: 'الزر في منتصف الحافة اليمنى. تُفتح النافذة يميناً بتمرير مستقل وتنقل بلوحة المفاتيح وإغلاق بزر Escape. ينقل Tab وShift+Tab بين العناصر، وتتيح الأسهم وPage Down التمرير عند تركيز منطقة التمرير.',
    features: ['حجم النص من 100% إلى 200%', 'تباين فاتح وداكن', 'إبراز الروابط', 'خط واضح', 'تباعد نصوص موسّع', 'إبراز العناوين', 'إبراز تركيز لوحة المفاتيح', 'تقليل الحركة والمؤثرات مع بديل نصي للتجربة ثلاثية الأبعاد', 'مؤشر فأرة كبير', 'إخفاء الوسائط الزخرفية مع إبقاء الصور ذات المعنى', 'وسائط بتدرج رمادي', 'محاذاة النص مع اتجاه القراءة', 'خط قراءة يتبع المؤشر أو تركيز لوحة المفاتيح'],
    reopen: 'فتح إعدادات الوصول', storage: 'تُحفظ الإعدادات على هذا الجهاز ويمكن إعادة ضبطها. إخفاء الزر للزيارة الحالية فقط، ويمكن فتحه مجدداً من هنا.',
    limits: 'الفحوصات والحدود', limitText: 'أُجريت فحوصات محددة لنافذة الوصول وحاسبة الأسعار. لم تكتمل مراجعة يدوية شاملة باستخدام NVDA وJAWS وVoiceOver وTalkBack. قد تحتاج الوسائط والفيديوهات والمستندات والروابط الخارجية إلى تحسينات إضافية مثل الترجمة النصية والوصف الصوتي. النافذة أداة مساعدة ولا تستبدل محتوى وكوداً متاحين.',
    contact: 'المساعدة والإبلاغ عن صعوبة', contactText: 'يمكن التواصل مع وسيم أبو عقل بشأن الوصول. يُفضل إرفاق رابط الصفحة ووصف الصعوبة والمتصفح والتقنية المساعدة إن وُجدت. يمكن أيضاً طلب بديل متاح للمحتوى.',
    email: 'البريد الإلكتروني', whatsapp: 'واتساب', sources: 'المصادر: إرشادات المفوضية الإسرائيلية وW3C',
  },
} as const;

export default function AccessibilityPage() {
  const { language, t } = useLanguage();
  const contact = useContact();
  const text = copy[language];
  useDocumentTitle(t('page_title_accessibility'));
  return <section className="min-h-screen bg-white py-16 text-slate-900 dark:bg-slate-950 dark:text-white sm:py-24">
    <article className="prose prose-slate mx-auto max-w-3xl px-5 dark:prose-invert">
      <h1>{text.title}</h1>
      <p>{text.updated}: <time dateTime={LAST_UPDATED}>{LAST_UPDATED}</time></p>
      <p>{text.intro}</p>
      <h2>{text.standards}</h2><p>{text.standardText}</p>
      <h2>{text.toolbar}</h2><p>{text.toolbarText}</p>
      <button type="button" onClick={() => window.dispatchEvent(new Event(A11Y_OPEN_EVENT))}
        className="min-h-12 rounded-xl bg-indigo-800 px-5 py-3 font-bold text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-indigo-600">{text.reopen}</button>
      <ul>{text.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
      <p>{text.storage}</p>
      <h2>{text.limits}</h2><p>{text.limitText}</p>
      <h2>{text.contact}</h2><p>{text.contactText}</p>
      <p>{text.email}: <a href={'mailto:' + contact.email}>{contact.email}</a><br />
        {text.whatsapp}: <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer"><bdi>{contact.whatsappDisplay}</bdi></a></p>
      <p>{text.sources}: <a href="https://www.gov.il/he/pages/website_accessibility">IS 5568</a>, <a href="https://www.w3.org/TR/WCAG22/">WCAG 2.2</a>.</p>
    </article>
  </section>;
}
