import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { useContact } from '@/features/contact/useContact';

// Privacy policy page — Israeli Privacy Protection Law (חוק הגנת הפרטיות)
// including Amendment 13 (תיקון 13) which came into force in August 2025.
// Also covers what EU visitors need to see under GDPR since the site accepts
// EU tourism traffic.
//
// Content lives in-page (not in translations/*.ts) because a legal document
// benefits from being reviewable in-full context, and the copy rarely churns.
// Effective date: bump `LAST_UPDATED` when the policy substantively changes.

const LAST_UPDATED = '2026-08-08';

const PrivacyPage: React.FC = () => {
  const { language, t } = useLanguage();
  const contact = useContact();
  useDocumentTitle(t('page_title_privacy'));

  const he = (
    <>
      <h1>מדיניות פרטיות</h1>
      <p className="lead">
        עודכן לאחרונה: <time dateTime={LAST_UPDATED}>{LAST_UPDATED}</time>
      </p>

      <p>
        אני, וסים אבו עקל (להלן: <b>"האתר"</b>, <b>"אני"</b> או <b>"בעל האתר"</b>),
        מכפר יאסיף, ישראל, מפעיל את האתר הזה ואוסף מידע מסוים מהמבקרים. מסמך זה
        מסביר בשקיפות איזה מידע נאסף, למה, כמה זמן הוא נשמר, מי חשוף אליו ואיך
        אתם יכולים לממש את הזכויות שלכם.
      </p>

      <h2>1. מי אחראי לעיבוד המידע</h2>
      <p>
        בעל האתר ובעל המאגר: <b>וסים אבו עקל</b>, כפר יאסיף, ישראל.
        <br />
        לפניות בנושא פרטיות:{' '}
        <a href={`mailto:${contact.email}`}>{contact.email}</a>.
      </p>

      <h2>2. מה נאסף</h2>
      <ul>
        <li>
          <b>פרטים שאתם מזינים בטפסים:</b> שם, כתובת אימייל, מספר טלפון, תוכן ההודעה
          — כשאתם ממלאים טופס פנייה או שולחים הודעה בוואטסאפ.
        </li>
        <li>
          <b>נתוני שימוש אנונימיים:</b> מספר ביקורים, עמודים נצפים, סוג דפדפן ומדינה כללית — דרך Vercel Analytics.
          Vercel Analytics לא משתמש בעוגיות ולא מזהה אתכם באופן אישי; ה-IP מוצפן.
        </li>
        <li>
          <b>עוגיות אופציונליות:</b> אם הסכמתם באמצעות באנר העוגיות — עוגיות
          אנליטיקה (Google Analytics) ו/או שיווק. ניתן לשנות את ההסכמה בכל רגע.
        </li>
        <li>
          <b>מידע טכני הכרחי:</b> כתובת IP ומידע שרת רגיל שנרשם באופן זמני לצורך
          אבטחה ואבחון תקלות (עד 30 יום).
        </li>
      </ul>

      <h2>3. למה זה נאסף</h2>
      <ul>
        <li>לתת מענה לפניות שלכם ולנהל את הקשר המסחרי.</li>
        <li>לשפר את האתר, לתקן באגים ולהבין אילו עמודים מעניינים את המבקרים.</li>
        <li>לעמוד בחובות חוקיות (חשבוניות, תיעוד תקשורת עסקית).</li>
      </ul>

      <h2>4. בסיס חוקי לעיבוד</h2>
      <p>
        עיבוד המידע מתבצע על בסיס אחד או יותר מהבאים: <b>הסכמתכם</b> (כשאתם ממלאים
        טופס או מסכימים לעוגיות), <b>קיום חוזה</b> (מתן שירות שביקשתם),{' '}
        <b>אינטרס לגיטימי</b> (אבטחה, שיפור מוצר), או <b>חובה חוקית</b>.
      </p>

      <h2>5. עם מי המידע משותף</h2>
      <p>
        אני לא מוכר את המידע שלכם. המידע יכול לעבור לספקי משנה טכניים בלבד, לצורך
        הפעלת האתר:
      </p>
      <ul>
        <li><b>Vercel</b> (אירוח האתר וניתוח תעבורה) — שרתים באיחוד האירופי/ארה"ב.</li>
        <li><b>Supabase</b> (מסד נתונים לפניות ותוכן) — שרתים באיחוד האירופי.</li>
        <li>
          <b>Web3Forms / Formspree</b> (משגר טפסים) — לפי הצורך; ההודעה מגיעה
          לאימייל שלי ואינה נשמרת אצלם לטווח ארוך.
        </li>
        <li>
          <b>Google Analytics</b> (רק אם הסכמתם) — לניתוח תעבורה מצטבר. Google
          עשויה לעבד את הנתונים גם בארה"ב.
        </li>
        <li>רשויות אכיפה — רק אם הדבר נדרש על פי חוק (למשל צו שיפוטי).</li>
      </ul>
      <p>
        חלק מספקי המשנה מעבדים מידע מחוץ לישראל. הם עומדים בסטנדרטים בינלאומיים
        להגנת פרטיות (GDPR, SCC).
      </p>

      <h2>6. משך שמירת המידע</h2>
      <ul>
        <li>פניות דרך טופס: עד 3 שנים מהפנייה האחרונה או סיום ההתקשרות.</li>
        <li>לוגי אבטחה טכניים: עד 30 יום.</li>
        <li>נתוני אנליטיקה מצטברים ואנונימיים: עד 14 חודשים.</li>
        <li>מסמכי חשבונאות (חשבוניות): 7 שנים כפי שנדרש על פי חוק המע"מ.</li>
      </ul>

      <h2>7. הזכויות שלכם (תיקון 13)</h2>
      <p>לפי חוק הגנת הפרטיות תשמ"א-1981 כפי שתוקן בתיקון 13, אתם זכאים ל:</p>
      <ul>
        <li><b>עיון:</b> לדעת איזה מידע יש עליכם.</li>
        <li><b>תיקון:</b> לתקן מידע לא מדויק או לא עדכני.</li>
        <li><b>מחיקה:</b> לבקש מחיקה של המידע (בכפוף לחובות שמירה חוקיות).</li>
        <li><b>ניידות:</b> לקבל את המידע בפורמט נגיש ומובנה.</li>
        <li><b>ביטול הסכמה:</b> לחזור בכם מהסכמה בכל עת (הביטול לא משפיע אחורה).</li>
        <li>
          <b>תלונה:</b> להגיש תלונה ל<b>רשות להגנת הפרטיות</b> במשרד המשפטים
          (<a href="https://www.gov.il/he/departments/the_privacy_protection_authority" target="_blank" rel="noopener noreferrer">gov.il/he/…privacy_protection_authority</a>).
        </li>
      </ul>
      <p>
        לממש זכות: שלחו אימייל ל־<a href={`mailto:${contact.email}`}>{contact.email}</a>{' '}
        עם הפרטים המזהים שלכם וסוג הבקשה. אענה תוך 30 יום.
      </p>

      <h2>8. אבטחת מידע</h2>
      <p>
        האתר משתמש בהצפנת HTTPS, בהגדרות כותרות אבטחה מחמירות (CSP, HSTS), בהזדהות
        דו-שלבית (MFA) לגישת אדמין, ובבידוד גישה למסד הנתונים ברמת הרשומה (RLS).
        המידע נשמר בשרתים מוגנים של ספקים מוכרים.
      </p>

      <h2>9. עוגיות (Cookies)</h2>
      <p>
        עוגיות הכרחיות (למשל שמירת שפה והסכמה) נטענות אוטומטית. עוגיות
        אנליטיקה ושיווק נטענות רק לאחר הסכמה שלכם דרך באנר העוגיות. ניתן לשנות
        או לבטל את ההסכמה בכל עת דרך הגדרות הדפדפן או על-ידי מחיקת נתוני האתר.
      </p>

      <h2>10. קבלת החלטות אוטומטית</h2>
      <p>אין באתר קבלת החלטות אוטומטית שמשפיעה עליכם באופן משמעותי.</p>

      <h2>11. שינויים במדיניות</h2>
      <p>
        אם המדיניות תעודכן, התאריך "עודכן לאחרונה" בראש העמוד ישונה. מומלץ לחזור
        לכאן מדי פעם. שינויים מהותיים יובלטו באמצעות באנר בעמוד הראשי.
      </p>

      <h2>12. יצירת קשר</h2>
      <p>
        לכל שאלה בנושא פרטיות:{' '}
        <a href={`mailto:${contact.email}`}>{contact.email}</a> ·{' '}
        <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer">
          וואטסאפ: {contact.whatsappDisplay}
        </a>
      </p>
    </>
  );

  const ar = (
    <>
      <h1>سياسة الخصوصية</h1>
      <p className="lead">
        آخر تحديث: <time dateTime={LAST_UPDATED}>{LAST_UPDATED}</time>
      </p>

      <p>
        أنا، وسيم أبو عقل (فيما يلي <b>"الموقع"</b>، <b>"أنا"</b> أو <b>"صاحب الموقع"</b>)،
        من كفر ياسيف، إسرائيل، أشغّل هذا الموقع وأجمع بعض المعلومات من الزوّار. توضّح هذه
        الوثيقة بشفافية ما الذي يُجمع، ولماذا، وكم يُحفظ، ومن يطّلع عليه، وكيف يمكنكم
        ممارسة حقوقكم.
      </p>

      <h2>1. المسؤول عن معالجة البيانات</h2>
      <p>
        صاحب الموقع ومسجّل قاعدة البيانات: <b>وسيم أبو عقل</b>، كفر ياسيف، إسرائيل.
        <br />
        للاستفسارات المتعلقة بالخصوصية:{' '}
        <a href={`mailto:${contact.email}`}>{contact.email}</a>.
      </p>

      <h2>2. ما الذي يُجمع</h2>
      <ul>
        <li>
          <b>البيانات التي تُدخلونها في النماذج:</b> الاسم، البريد الإلكتروني، رقم الهاتف،
          محتوى الرسالة — عند تعبئة نموذج تواصل أو إرسال رسالة عبر واتساب.
        </li>
        <li>
          <b>بيانات استخدام مجهولة الهوية:</b> عدد الزيارات، الصفحات المشاهدة، نوع
          المتصفح والدولة العامة — عبر Vercel Analytics. لا يستخدم Vercel Analytics
          الكوكيز ولا يعرّفكم شخصيًا؛ عنوان IP يُشفّر.
        </li>
        <li>
          <b>كوكيز اختيارية:</b> إذا وافقتم عبر شريط الكوكيز — كوكيز التحليلات
          (Google Analytics) و/أو التسويق. يمكنكم تغيير الموافقة في أي وقت.
        </li>
        <li>
          <b>بيانات تقنية ضرورية:</b> عنوان IP وسجلات الخادم العادية تُحفظ مؤقتًا
          لأغراض الأمان وتصحيح الأخطاء (حتى 30 يومًا).
        </li>
      </ul>

      <h2>3. لماذا تُجمع</h2>
      <ul>
        <li>للرد على استفساراتكم وإدارة العلاقة التجارية.</li>
        <li>لتحسين الموقع، إصلاح الأخطاء، وفهم أي الصفحات تهم الزوّار.</li>
        <li>لتلبية الالتزامات القانونية (الفواتير، توثيق التواصل التجاري).</li>
      </ul>

      <h2>4. الأساس القانوني للمعالجة</h2>
      <p>
        تتم المعالجة استنادًا إلى واحد أو أكثر مما يلي: <b>موافقتكم</b> (عند تعبئة
        نموذج أو الموافقة على الكوكيز)، <b>تنفيذ عقد</b> (تقديم الخدمة التي طلبتموها)،
        <b>مصلحة مشروعة</b> (الأمان، تحسين المنتج)، أو <b>واجب قانوني</b>.
      </p>

      <h2>5. مع من تُشارَك البيانات</h2>
      <p>أنا لا أبيع بياناتكم. قد تنتقل البيانات إلى مزوّدي خدمات تقنية فقط لتشغيل الموقع:</p>
      <ul>
        <li><b>Vercel</b> (استضافة الموقع وتحليل الزيارات) — خوادم في الاتحاد الأوروبي/الولايات المتحدة.</li>
        <li><b>Supabase</b> (قاعدة البيانات للاستفسارات والمحتوى) — خوادم في الاتحاد الأوروبي.</li>
        <li>
          <b>Web3Forms / Formspree</b> (خدمة إرسال النماذج) — عند الحاجة؛ الرسالة تصل
          إلى بريدي الإلكتروني ولا تُحفظ عندهم على المدى الطويل.
        </li>
        <li>
          <b>Google Analytics</b> (فقط إذا وافقتم) — لتحليل الزيارات المجمّع. قد تعالج
          Google البيانات في الولايات المتحدة أيضًا.
        </li>
        <li>سلطات إنفاذ القانون — فقط إذا اقتضى القانون ذلك (كأمر قضائي).</li>
      </ul>
      <p>
        بعض مزوّدي الخدمات يعالجون البيانات خارج إسرائيل. جميعهم يمتثلون لمعايير
        دولية لحماية الخصوصية (GDPR، SCC).
      </p>

      <h2>6. مدة الاحتفاظ بالبيانات</h2>
      <ul>
        <li>الاستفسارات عبر النموذج: حتى 3 سنوات من آخر تواصل أو انتهاء التعاقد.</li>
        <li>سجلات الأمان التقنية: حتى 30 يومًا.</li>
        <li>بيانات التحليلات المجمّعة والمجهولة: حتى 14 شهرًا.</li>
        <li>وثائق المحاسبة (الفواتير): 7 سنوات كما يقتضي قانون ضريبة القيمة المضافة.</li>
      </ul>

      <h2>7. حقوقكم (تعديل 13)</h2>
      <p>وفقًا لقانون حماية الخصوصية 5741-1981 كما تم تعديله بالتعديل 13، لكم الحق في:</p>
      <ul>
        <li><b>الاطلاع:</b> معرفة ما تحتفظ به عنكم من بيانات.</li>
        <li><b>التصحيح:</b> تصحيح البيانات غير الدقيقة أو غير المحدّثة.</li>
        <li><b>الحذف:</b> طلب حذف بياناتكم (رهنًا بالتزامات الحفظ القانونية).</li>
        <li><b>النقل:</b> الحصول على البيانات بتنسيق قابل للنقل والقراءة.</li>
        <li><b>سحب الموافقة:</b> سحب موافقتكم في أي وقت (لا يؤثر السحب على ما تم سابقًا).</li>
        <li>
          <b>الشكوى:</b> تقديم شكوى لـ<b>سلطة حماية الخصوصية</b> في وزارة العدل
          (<a href="https://www.gov.il/en/departments/the_privacy_protection_authority" target="_blank" rel="noopener noreferrer">gov.il/…privacy_protection_authority</a>).
        </li>
      </ul>
      <p>
        لممارسة حق: أرسلوا بريدًا إلى{' '}
        <a href={`mailto:${contact.email}`}>{contact.email}</a> مع بياناتكم التعريفية
        ونوع الطلب. سأرد خلال 30 يومًا.
      </p>

      <h2>8. أمن المعلومات</h2>
      <p>
        يستخدم الموقع تشفير HTTPS، ورؤوس أمان صارمة (CSP، HSTS)، والمصادقة الثنائية
        (MFA) للوصول الإداري، وعزل الوصول لقاعدة البيانات على مستوى السجل (RLS).
        تُحفظ البيانات على خوادم آمنة لدى مزوّدين موثوقين.
      </p>

      <h2>9. الكوكيز</h2>
      <p>
        الكوكيز الضرورية (كحفظ اللغة والموافقة) تُحمَّل تلقائيًا. كوكيز التحليلات
        والتسويق تُحمَّل فقط بعد موافقتكم عبر شريط الكوكيز. يمكنكم تغيير الموافقة
        أو إلغاؤها في أي وقت من خلال إعدادات المتصفح أو بحذف بيانات الموقع.
      </p>

      <h2>10. القرارات الآلية</h2>
      <p>لا يتخذ الموقع قرارات آلية تؤثر عليكم بشكل جوهري.</p>

      <h2>11. تغييرات على السياسة</h2>
      <p>
        إذا حُدِّثت السياسة، سيتغيّر تاريخ "آخر تحديث" أعلى الصفحة. يُنصح بمراجعة
        هذه الصفحة من حين لآخر. التغييرات الجوهرية ستُبرز عبر شريط في الصفحة الرئيسية.
      </p>

      <h2>12. للتواصل</h2>
      <p>
        لأي سؤال بخصوص الخصوصية:{' '}
        <a href={`mailto:${contact.email}`}>{contact.email}</a> ·{' '}
        <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer">
          واتساب: {contact.whatsappDisplay}
        </a>
      </p>
    </>
  );

  const en = (
    <>
      <h1>Privacy Policy</h1>
      <p className="lead">
        Last updated: <time dateTime={LAST_UPDATED}>{LAST_UPDATED}</time>
      </p>

      <p>
        I, Waseem Abu Aql (the <b>"Site"</b>, <b>"I"</b>, or the <b>"Site Owner"</b>),
        based in Kfar Yasif, Israel, operate this website and collect certain
        information from visitors. This document transparently explains what is
        collected, why, for how long, who sees it, and how you can exercise your
        rights.
      </p>

      <h2>1. Data Controller</h2>
      <p>
        The site owner and database controller is <b>Waseem Abu Aql</b>, Kfar
        Yasif, Israel.
        <br />
        Privacy inquiries: <a href={`mailto:${contact.email}`}>{contact.email}</a>.
      </p>

      <h2>2. What is collected</h2>
      <ul>
        <li>
          <b>Data you enter in forms:</b> name, email, phone number, message content —
          when you fill out a contact form or send a WhatsApp message.
        </li>
        <li>
          <b>Anonymous usage data:</b> number of visits, pages viewed, browser type,
          general country — via Vercel Analytics. Vercel Analytics does not use
          cookies and does not identify you personally; IP is hashed.
        </li>
        <li>
          <b>Optional cookies:</b> if you consent via the cookie banner —
          analytics (Google Analytics) and/or marketing cookies. You can change
          consent at any time.
        </li>
        <li>
          <b>Essential technical data:</b> IP address and standard server logs
          are recorded temporarily for security and diagnostics (up to 30 days).
        </li>
      </ul>

      <h2>3. Why it is collected</h2>
      <ul>
        <li>To respond to your inquiries and manage the business relationship.</li>
        <li>To improve the site, fix bugs, and understand which pages interest visitors.</li>
        <li>To meet legal obligations (invoices, business communication records).</li>
      </ul>

      <h2>4. Legal basis for processing</h2>
      <p>
        Processing takes place on one or more of the following bases: <b>your
        consent</b> (form submission, cookie acceptance), <b>contract performance</b>{' '}
        (delivering a service you requested), <b>legitimate interest</b>
        (security, product improvement), or <b>legal obligation</b>.
      </p>

      <h2>5. Who the data is shared with</h2>
      <p>
        I do not sell your data. Data may pass to technical sub-processors only,
        to operate the site:
      </p>
      <ul>
        <li><b>Vercel</b> (hosting + analytics) — EU/US servers.</li>
        <li><b>Supabase</b> (database for inquiries and content) — EU servers.</li>
        <li>
          <b>Web3Forms / Formspree</b> (form delivery) — as needed; the message
          reaches my email and is not retained long-term by them.
        </li>
        <li>
          <b>Google Analytics</b> (only if you consent) — aggregate traffic analysis.
          Google may process data in the US as well.
        </li>
        <li>Law enforcement — only when legally required (e.g. court order).</li>
      </ul>
      <p>
        Some sub-processors process data outside Israel. All meet international
        privacy standards (GDPR, SCC).
      </p>

      <h2>6. Retention period</h2>
      <ul>
        <li>Form inquiries: up to 3 years from the last contact or contract end.</li>
        <li>Technical security logs: up to 30 days.</li>
        <li>Aggregate and anonymous analytics data: up to 14 months.</li>
        <li>Accounting documents (invoices): 7 years as required by VAT law.</li>
      </ul>

      <h2>7. Your rights (Amendment 13)</h2>
      <p>
        Under Israel's Privacy Protection Law 5741-1981 as amended by Amendment 13,
        you are entitled to:
      </p>
      <ul>
        <li><b>Access:</b> know what data is held about you.</li>
        <li><b>Rectification:</b> correct inaccurate or outdated data.</li>
        <li><b>Erasure:</b> request deletion (subject to legal retention duties).</li>
        <li><b>Portability:</b> receive the data in a structured, accessible format.</li>
        <li><b>Withdraw consent:</b> withdraw at any time (does not affect prior processing).</li>
        <li>
          <b>Complaint:</b> file a complaint with the <b>Privacy Protection Authority</b>{' '}
          at the Ministry of Justice
          (<a href="https://www.gov.il/en/departments/the_privacy_protection_authority" target="_blank" rel="noopener noreferrer">gov.il/…privacy_protection_authority</a>).
        </li>
      </ul>
      <p>
        To exercise a right: email <a href={`mailto:${contact.email}`}>{contact.email}</a>{' '}
        with your identifying details and request type. I will respond within 30 days.
      </p>

      <h2>8. Security</h2>
      <p>
        The site uses HTTPS encryption, strict security headers (CSP, HSTS),
        two-factor authentication (MFA) for admin access, and row-level access
        isolation (RLS) for the database. Data lives on protected servers of
        recognised providers.
      </p>

      <h2>9. Cookies</h2>
      <p>
        Essential cookies (like language and consent state) load automatically.
        Analytics and marketing cookies only load after your consent via the
        cookie banner. You can change or revoke consent at any time via browser
        settings or by clearing site data.
      </p>

      <h2>10. Automated decisions</h2>
      <p>The site does not make automated decisions that significantly affect you.</p>

      <h2>11. Policy changes</h2>
      <p>
        If the policy is updated, the "Last updated" date at the top will change.
        Please revisit this page periodically. Material changes will be highlighted
        via a banner on the home page.
      </p>

      <h2>12. Contact</h2>
      <p>
        Any privacy-related question:{' '}
        <a href={`mailto:${contact.email}`}>{contact.email}</a> ·{' '}
        <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer">
          WhatsApp: {contact.whatsappDisplay}
        </a>
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

export default PrivacyPage;
