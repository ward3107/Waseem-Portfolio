import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { useContact } from '@/features/contact/useContact';

// Accessibility statement — Israeli Standard IS 5568 (WCAG 2.0 AA) + חוק שוויון
// זכויות לאנשים עם מוגבלות. Trilingual he/ar/en. Documents the built-in
// AccessibilityToolbar features + how to report an inaccessible area of the site.

const LAST_UPDATED = '2026-08-08';

const AccessibilityPage: React.FC = () => {
  const { language, t } = useLanguage();
  const contact = useContact();
  useDocumentTitle(t('page_title_accessibility'));

  const he = (
    <>
      <h1>הצהרת נגישות</h1>
      <p className="lead">
        עודכן לאחרונה: <time dateTime={LAST_UPDATED}>{LAST_UPDATED}</time>
      </p>

      <p>
        אני מחויב להנגיש את האתר לכל אדם, כולל אנשים עם מוגבלות. האתר עומד
        בדרישות תקן ישראלי <b>IS 5568</b> ברמת <b>AA</b> (WCAG 2.0 AA), ובחוק שוויון
        זכויות לאנשים עם מוגבלות, התשנ"ח-1998, ובתקנות הנגישות (התשע"ג-2013).
      </p>

      <h2>1. מה נגיש באתר</h2>
      <ul>
        <li><b>ניווט מקלדת מלא</b> — כל האתר ניתן לתפעול בלי עכבר (Tab, Shift+Tab, Enter, Escape).</li>
        <li><b>קורא מסך</b> — תגי ARIA, כותרות סמנטיות, alt לתמונות, ותוויות לכפתורים.</li>
        <li><b>ניגודיות</b> — הצבעים עומדים ביחס ניגודיות של 4.5:1 לפחות (7:1 לטקסט קטן).</li>
        <li><b>שינוי גודל טקסט</b> — עד 200% ללא שבירה של פריסה.</li>
        <li><b>Skip Link</b> — קפיצה ישירה לתוכן הראשי בלחיצה על Tab הראשונה.</li>
        <li><b>מבנה סמנטי</b> — landmarks (header, nav, main, footer) לניווט מהיר עם קורא מסך.</li>
        <li><b>תמיכה בכיווניות</b> — עברית וערבית מוצגות מימין לשמאל (RTL) באופן מלא.</li>
        <li><b>Prefers-reduced-motion</b> — הנפשות נכבות אוטומטית אם הגדרתם זאת במערכת ההפעלה.</li>
      </ul>

      <h2>2. סרגל נגישות פנימי</h2>
      <p>לחצן הנגישות הכחול-סגול בפינה התחתונה של האתר מאפשר להתאים את החוויה בזמן אמת:</p>
      <ul>
        <li>הגדלת גודל טקסט (100%–200%)</li>
        <li>מצב ניגודיות גבוהה, מצב היפוך צבעים</li>
        <li>הדגשת קישורים, גופן קריא, ריווח טקסט מוגבר</li>
        <li>סמן עכבר גדול</li>
        <li>הסתרת תמונות (למי שמסתמך רק על טקסט)</li>
        <li>ביטול הנפשות</li>
      </ul>
      <p>ההגדרות נשמרות בין ביקורים במכשיר שלכם ואינן נשלחות לשום שרת.</p>

      <h2>3. תאימות טכנולוגית</h2>
      <p>האתר נבדק ועובד עם:</p>
      <ul>
        <li>קוראי מסך: NVDA, JAWS (Windows), VoiceOver (Mac/iOS), TalkBack (Android)</li>
        <li>דפדפנים: Chrome, Safari, Firefox, Edge (שתי גרסאות אחרונות)</li>
        <li>מערכות הפעלה: Windows 10+, macOS 12+, iOS 15+, Android 10+</li>
        <li>ניווט מקלדת בלבד ומכשירי הצבעה חלופיים</li>
      </ul>

      <h2>4. מגבלות ידועות</h2>
      <p>
        חלק מהתוכן משולב (למשל תמונות פרויקטים ישנות) עשוי שלא לכלול טקסט חלופי מלא.
        כמו כן, גרפיקה תלת-ממדית מעוצבת (הלוגו והכותרות המונפשות) מוסתרת אוטומטית
        לקוראי מסך ומוצגת חלופה טקסטואלית — אך המעבר יכול לגרום לעיכוב קל בטעינה.
        אני עובד על שיפור מתמיד בשני האזורים.
      </p>

      <h2>5. איש הנגישות באתר</h2>
      <p>
        <b>וסים אבו עקל</b> · כפר יאסיף, ישראל<br />
        אימייל: <a href={`mailto:${contact.email}`}>{contact.email}</a><br />
        וואטסאפ: <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer">
          {contact.whatsappDisplay}
        </a>
      </p>

      <h2>6. פנייה בנושא נגישות</h2>
      <p>
        אם נתקלתם בבעיית נגישות, קושי בשימוש, או שצריכים פורמט חלופי (למשל מסמך מונגש
        לקורא מסך) — פנו אליי ואטפל בכך <b>תוך 7 ימי עסקים</b>. אני אתן קדימות
        לפניות שמגיעות מקוראי מסך או ממכשירי הצבעה חלופיים.
      </p>

      <h2>7. תקן ותאריך בדיקה אחרון</h2>
      <p>
        האתר נבדק לאחרונה מול תקן ישראלי IS 5568 (WCAG 2.0 AA) בתאריך{' '}
        <time dateTime={LAST_UPDATED}>{LAST_UPDATED}</time>. אני מבצע ביקורת חוזרת
        לפחות אחת לחצי שנה ובכל פעם שיש עדכון תוכן משמעותי.
      </p>
    </>
  );

  const ar = (
    <>
      <h1>بيان إمكانية الوصول</h1>
      <p className="lead">
        آخر تحديث: <time dateTime={LAST_UPDATED}>{LAST_UPDATED}</time>
      </p>

      <p>
        أنا ملتزم بجعل الموقع متاحًا لكل شخص، بمن فيهم الأشخاص ذوو الإعاقة. يمتثل
        الموقع لمعيار إسرائيل <b>IS 5568</b> بمستوى <b>AA</b> (WCAG 2.0 AA)، ولقانون
        المساواة في حقوق الأشخاص ذوي الإعاقة، 1998، ولأنظمة إمكانية الوصول 2013.
      </p>

      <h2>1. ما هو متاح في الموقع</h2>
      <ul>
        <li><b>تنقّل كامل بلوحة المفاتيح</b> — الموقع بالكامل يعمل بدون فأرة (Tab، Shift+Tab، Enter، Escape).</li>
        <li><b>قارئ الشاشة</b> — علامات ARIA، عناوين دلالية، alt للصور، وتسميات للأزرار.</li>
        <li><b>التباين</b> — الألوان تحقق نسبة تباين لا تقل عن 4.5:1 (7:1 للنص الصغير).</li>
        <li><b>تغيير حجم النص</b> — حتى 200% دون كسر التخطيط.</li>
        <li><b>رابط تخطّي</b> — قفزة مباشرة إلى المحتوى الرئيسي عند أول ضغطة Tab.</li>
        <li><b>بنية دلالية</b> — landmarks (header، nav، main، footer) للتنقل السريع بقارئ الشاشة.</li>
        <li><b>دعم اتجاه الكتابة</b> — العربية والعبرية تُعرضان من اليمين إلى اليسار (RTL) بشكل كامل.</li>
        <li><b>Prefers-reduced-motion</b> — تُعطَّل الحركات تلقائيًا إن ضبطتم ذلك في نظام التشغيل.</li>
      </ul>

      <h2>2. شريط الوصول الداخلي</h2>
      <p>يتيح زر الوصول الأزرق-البنفسجي في الزاوية السفلية تخصيص التجربة لحظيًا:</p>
      <ul>
        <li>تكبير النص (100%–200%)</li>
        <li>وضع تباين عالٍ، وضع عكس الألوان</li>
        <li>إبراز الروابط، خط قابل للقراءة، تباعد نصوص موسّع</li>
        <li>مؤشّر فأرة كبير</li>
        <li>إخفاء الصور (لمن يعتمد على النص فقط)</li>
        <li>تعطيل الحركات</li>
      </ul>
      <p>تُحفظ الإعدادات بين الزيارات على جهازكم ولا تُرسل لأي خادم.</p>

      <h2>3. التوافق التقني</h2>
      <p>تم اختبار الموقع مع:</p>
      <ul>
        <li>قارئات الشاشة: NVDA، JAWS (Windows)، VoiceOver (Mac/iOS)، TalkBack (Android)</li>
        <li>المتصفحات: Chrome، Safari، Firefox، Edge (آخر إصدارين)</li>
        <li>أنظمة التشغيل: Windows 10+، macOS 12+، iOS 15+، Android 10+</li>
        <li>التنقّل بلوحة المفاتيح فقط وأجهزة الإشارة البديلة</li>
      </ul>

      <h2>4. القيود المعروفة</h2>
      <p>
        قد لا يحتوي بعض المحتوى المدمج (كصور المشاريع القديمة) على نص بديل كامل. كذلك
        الرسومات ثلاثية الأبعاد المصمّمة (الشعار والعناوين المتحرّكة) تُخفَى تلقائيًا
        عن قارئات الشاشة مع عرض بديل نصي — لكن الانتقال قد يسبّب تأخيرًا طفيفًا في التحميل.
        أعمل على تحسين مستمر في المنطقتين.
      </p>

      <h2>5. منسّق الوصول في الموقع</h2>
      <p>
        <b>وسيم أبو عقل</b> · كفر ياسيف، إسرائيل<br />
        البريد الإلكتروني: <a href={`mailto:${contact.email}`}>{contact.email}</a><br />
        واتساب: <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer">
          {contact.whatsappDisplay}
        </a>
      </p>

      <h2>6. التواصل بشأن الوصول</h2>
      <p>
        إن واجهتم مشكلة في الوصول، صعوبة في الاستخدام، أو احتجتم لصيغة بديلة (كوثيقة
        متاحة لقارئ الشاشة) — تواصلوا معي وسأعالج ذلك <b>خلال 7 أيام عمل</b>.
        سأمنح الأولوية للاستفسارات القادمة من قارئات الشاشة أو أجهزة الإشارة البديلة.
      </p>

      <h2>7. المعيار وتاريخ آخر مراجعة</h2>
      <p>
        تمت مراجعة الموقع آخر مرة مقابل معيار إسرائيل IS 5568 (WCAG 2.0 AA) بتاريخ{' '}
        <time dateTime={LAST_UPDATED}>{LAST_UPDATED}</time>. أُجري مراجعة دورية كل ستة
        أشهر على الأقل ومع كل تحديث محتوى كبير.
      </p>
    </>
  );

  const en = (
    <>
      <h1>Accessibility Statement</h1>
      <p className="lead">
        Last updated: <time dateTime={LAST_UPDATED}>{LAST_UPDATED}</time>
      </p>

      <p>
        I am committed to making the site accessible to everyone, including
        people with disabilities. The site conforms to Israeli Standard{' '}
        <b>IS 5568</b> at <b>Level AA</b> (WCAG 2.0 AA), Israel's Equal Rights
        for People with Disabilities Law of 1998, and the Accessibility
        Regulations of 2013.
      </p>

      <h2>1. What's accessible on the site</h2>
      <ul>
        <li><b>Full keyboard navigation</b> — the entire site is operable without a mouse (Tab, Shift+Tab, Enter, Escape).</li>
        <li><b>Screen reader</b> — ARIA labels, semantic headings, image alt text, and button labels.</li>
        <li><b>Contrast</b> — colors meet a contrast ratio of at least 4.5:1 (7:1 for small text).</li>
        <li><b>Text resizing</b> — up to 200% without layout breakage.</li>
        <li><b>Skip link</b> — direct jump to the main content on first Tab.</li>
        <li><b>Semantic structure</b> — landmarks (header, nav, main, footer) for fast screen-reader navigation.</li>
        <li><b>Direction support</b> — Hebrew and Arabic render fully right-to-left (RTL).</li>
        <li><b>Prefers-reduced-motion</b> — animations automatically disabled if set in your OS.</li>
      </ul>

      <h2>2. Built-in accessibility toolbar</h2>
      <p>The blue-purple accessibility button in the bottom corner lets you adjust the experience live:</p>
      <ul>
        <li>Text size (100%–200%)</li>
        <li>High-contrast mode, inverted colours mode</li>
        <li>Link highlighting, readable font, extended text spacing</li>
        <li>Large cursor</li>
        <li>Image hiding (for text-only usage)</li>
        <li>Animation disabling</li>
      </ul>
      <p>Settings persist between visits on your device and are never sent to any server.</p>

      <h2>3. Technology compatibility</h2>
      <p>The site has been tested with:</p>
      <ul>
        <li>Screen readers: NVDA, JAWS (Windows), VoiceOver (Mac/iOS), TalkBack (Android)</li>
        <li>Browsers: Chrome, Safari, Firefox, Edge (last two versions)</li>
        <li>Operating systems: Windows 10+, macOS 12+, iOS 15+, Android 10+</li>
        <li>Keyboard-only navigation and alternative pointing devices</li>
      </ul>

      <h2>4. Known limitations</h2>
      <p>
        Some embedded content (like older project images) may not include full
        alt text. Decorative 3D graphics (logo, animated headlines) are hidden
        from screen readers with a text alternative shown instead — but the
        swap may cause a slight loading delay. I'm continuously improving both.
      </p>

      <h2>5. Accessibility coordinator</h2>
      <p>
        <b>Waseem Abu Aql</b> · Kfar Yasif, Israel<br />
        Email: <a href={`mailto:${contact.email}`}>{contact.email}</a><br />
        WhatsApp: <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer">
          {contact.whatsappDisplay}
        </a>
      </p>

      <h2>6. Reporting accessibility issues</h2>
      <p>
        If you hit an accessibility issue, usability difficulty, or need an
        alternative format (like a screen-reader-friendly document) — contact
        me and I will handle it <b>within 7 business days</b>. I prioritise
        requests coming from screen readers or alternative pointing devices.
      </p>

      <h2>7. Standard and last review date</h2>
      <p>
        The site was last audited against Israeli Standard IS 5568 (WCAG 2.0 AA)
        on <time dateTime={LAST_UPDATED}>{LAST_UPDATED}</time>. I re-audit at
        least every six months and after any major content update.
      </p>
    </>
  );

  const body = language === 'ar' ? ar : language === 'en' ? en : he;

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-slate-950 min-h-screen">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 md:px-10 prose prose-slate dark:prose-invert prose-headings:font-heading prose-h1:text-4xl prose-h1:mb-4 prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-3 prose-a:text-brand-purple hover:prose-a:text-brand-purpleLight text-slate-700 dark:text-slate-300">
        {body}
      </article>
    </section>
  );
};

export default AccessibilityPage;
