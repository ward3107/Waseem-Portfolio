// Bilingual review-request scripts handed to clients after delivery.
// Two variants per language:
//   • `written`    — polished, sentences a client can read aloud or paste
//     into the Google review box on the /handoff page.
//   • `voiceNote`  — spoken tone, casual — for the client to record on
//     WhatsApp if they'd rather leave an audio testimonial.
// Warm, personal, 2–3 sentences. NOT corporate copy — the review that
// converts is one that sounds like a person, not a marketing bullet.
//
// Consumed by /handoff/[client-slug] (Part 2 of the GBP system).

export type ReviewScriptLang = 'he' | 'ar';
export type ReviewScriptVariant = 'written' | 'voiceNote';

export interface ReviewScriptSet {
  written: string;
  voiceNote: string;
}

export const REVIEW_SCRIPTS: Record<ReviewScriptLang, ReviewScriptSet> = {
  he: {
    written:
      'וסים בנה לי אתר לעסק שלי בדיוק כמו שרציתי — מהיר, יפה ותומך בעברית ובערבית. ' +
      'הוא היה זמין לכל שאלה לאורך התהליך, והפניות התחילו להגיע דרך האתר תוך שבוע מההשקה. ' +
      'ממליץ בחום לכל בעל עסק קטן שמחפש עבודה מקצועית בלי הפתעות.',
    voiceNote:
      'היי, רציתי להגיד תודה לוסים על האתר שהוא בנה לי. ' +
      'באמת עשה משהו יפה ומקצועי, וכל פעם שהיה משהו קטן — הוא ענה מיד. ' +
      'אם אתם מחפשים מישהו שיבנה אתר לעסק הקטן שלכם — הוא הבחור שלכם.',
  },
  ar: {
    written:
      'وسيم بنى لي موقعًا لعملي كما أردته تمامًا — سريع، أنيق، وثنائي اللغة (عربي وعبري). ' +
      'كان متجاوبًا مع كل استفسار طوال العملية، والاستفسارات بدأت تصل من الموقع خلال أسبوع من الإطلاق. ' +
      'أنصح فيه بكل ثقة لأي صاحب نشاط صغير يبحث عن عمل احترافي بدون مفاجآت.',
    voiceNote:
      'مرحبا، حبّيت أشكر وسيم على الموقع اللي بناه إلي. ' +
      'الصراحة عمل شي حلو ومحترف، وكل ما احتجت إشي — رد عليّ فورًا. ' +
      'لأي واحد بده موقع لعمله الصغير — وسيم هو الشخص المناسب.',
  },
};

/**
 * Message Waseem sends to a client on WhatsApp with the /handoff link.
 * Bilingual, ready to paste. `handoffUrl` is the per-client review page.
 * Keep short — WhatsApp preview only shows the first ~120 chars.
 */
export const buildHandoffMessage = (
  lang: ReviewScriptLang,
  clientName: string,
  handoffUrl: string
): string => {
  if (lang === 'ar') {
    return (
      `أهلًا ${clientName} 🙂 يسعدني أن الموقع صار جاهزًا! ` +
      `إذا كانت التجربة إيجابية بالنسبة إلك، مراجعة قصيرة على جوجل تساعدني كثيرًا كصاحب عمل صغير في الشمال. ` +
      `اضغط هنا وستجد كل شي جاهز بضغطة — النص واللينك: ${handoffUrl}`
    );
  }
  return (
    `היי ${clientName} 🙂 שמח שהאתר יצא כמו שרצית! ` +
    `אם החוויה הייתה טובה, ביקורת קצרה בגוגל עוזרת לי מאוד כבעל עסק קטן בצפון. ` +
    `לחץ כאן ותמצא הכל מוכן בלחיצה — הטקסט והלינק: ${handoffUrl}`
  );
};
