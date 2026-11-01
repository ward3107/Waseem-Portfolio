// Shared UI strings for the voice agent, kept in their own tiny module so the
// lightweight launcher can use them WITHOUT pulling in the heavy ElevenLabs SDK
// (that lives in ConversationSession, lazy-loaded only when a visitor taps talk).

export type ConvoLang = 'en' | 'he' | 'ar';

export interface ConvoLabels {
  talk: string;
  connecting: string;
  listening: string;
  speaking: string;
  end: string;
  mute: string;
  unmute: string;
  micError: string;
  title: string;
  // Text chat (used as-is for Hebrew, where voice isn't supported, and as an
  // opt-in "type instead" for English/Arabic).
  chat: string;
  typeInstead: string;
  chatTitle: string;
  placeholder: string;
  send: string;
  close: string;
  chatError: string;
  // Bot disclosure + human handoff (accessibility / consumer-protection).
  assistant: string;
  human: string;
  humanHandoff: string;
  // Tappable suggested questions — a "click instead of type" shortcut, focused
  // on the site's services. Sent verbatim as the visitor's message.
  quickReplies: string[];
}

export const CONVO_LABELS: Record<ConvoLang, ConvoLabels> = {
  en: {
    talk: 'Talk to Vasia',
    connecting: 'Connecting…',
    listening: 'Listening…',
    speaking: 'Speaking…',
    end: 'End call',
    mute: 'Mute microphone',
    unmute: 'Unmute microphone',
    micError: 'Microphone access is needed to talk. Please allow it and try again.',
    title: "Vasia's AI assistant",
    chat: 'Chat with Vasia',
    typeInstead: 'Prefer to type?',
    chatTitle: "Chat with Vasia's assistant",
    placeholder: 'Type your message…',
    send: 'Send',
    close: 'Close chat',
    chatError: 'The chat could not connect. Please try again.',
    assistant: 'Automated assistant',
    human: 'Talk to a human',
    humanHandoff: 'Prefer a person? Message Vasia directly on WhatsApp and he’ll get back to you.',
    quickReplies: ['What do you offer?', 'Build me a website', 'What does it cost?', 'AI automation & bots'],
  },
  he: {
    talk: 'דברו עם וסיה',
    connecting: 'מתחבר…',
    listening: 'מקשיב…',
    speaking: 'מדבר…',
    end: 'סיום שיחה',
    mute: 'השתקת מיקרופון',
    unmute: 'ביטול השתקה',
    micError: 'צריך גישה למיקרופון כדי לדבר. אשרו את ההרשאה ונסו שוב.',
    title: 'העוזר החכם של וסיה',
    chat: "צ'אט עם וסיה",
    typeInstead: 'מעדיפים להקליד?',
    chatTitle: "צ'אט עם העוזר של וסיה",
    placeholder: 'כתבו הודעה…',
    send: 'שליחה',
    close: "סגירת הצ'אט",
    chatError: 'לא הצלחנו להתחבר לצ׳אט. נסו שוב.',
    assistant: 'עוזר אוטומטי',
    human: 'לדבר עם נציג',
    humanHandoff: 'מעדיפים אדם? כתבו אל וסיה ישירות בוואטסאפ והוא יחזור אליכם.',
    quickReplies: ['מה אתה מציע?', 'בנה לי אתר', 'כמה זה עולה?', 'אוטומציה ובוטים'],
  },
  ar: {
    talk: 'تحدّث مع واسيا',
    connecting: 'يتّصل…',
    listening: 'يستمع…',
    speaking: 'يتحدّث…',
    end: 'إنهاء المكالمة',
    mute: 'كتم الميكروفون',
    unmute: 'إلغاء كتم الميكروفون',
    micError: 'نحتاج إذن الميكروفون للتحدث. يُرجى السماح والمحاولة مرة أخرى.',
    title: 'مساعد واسيا الذكي',
    chat: 'دردشة مع واسيا',
    typeInstead: 'تفضّل الكتابة؟',
    chatTitle: 'دردشة مع مساعد واسيا',
    placeholder: 'اكتب رسالتك…',
    send: 'إرسال',
    close: 'إغلاق الدردشة',
    chatError: 'تعذّر الاتصال بالدردشة. حاول مرة أخرى.',
    assistant: 'مساعد آلي',
    human: 'التحدث مع ممثل',
    humanHandoff: 'تفضّل التحدث مع شخص؟ راسل واسيا مباشرة على واتساب وسيعود إليك.',
    quickReplies: ['ما الذي تقدّمه؟', 'ابنِ لي موقعاً', 'كم التكلفة؟', 'أتمتة وبوتات'],
  },
};

// Hebrew has no ElevenLabs conversational agent-voice yet, so Hebrew visitors
// get the text chat as their primary way to talk to the assistant.
export const voiceSupported = (language: string): boolean => language !== 'he';

export const labelsFor = (language: string): ConvoLabels =>
  CONVO_LABELS[(language as ConvoLang) in CONVO_LABELS ? (language as ConvoLang) : 'en'];

// Public agent id — safe to ship (the same identifier embed codes use).
// Overridable via env so the agent can be swapped without a code change.
export const AGENT_ID =
  (import.meta.env.VITE_ELEVENLABS_AGENT_ID as string | undefined) ??
  'agent_5301m1p82gt2f4kvf18ep9ffeez6';
