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
}

export const CONVO_LABELS: Record<ConvoLang, ConvoLabels> = {
  en: {
    talk: 'Talk to Waseem',
    connecting: 'Connecting…',
    listening: 'Listening…',
    speaking: 'Speaking…',
    end: 'End call',
    mute: 'Mute microphone',
    unmute: 'Unmute microphone',
    micError: 'Microphone access is needed to talk. Please allow it and try again.',
    title: "Waseem's AI assistant",
  },
  he: {
    talk: 'דברו עם וסים',
    connecting: 'מתחבר…',
    listening: 'מקשיב…',
    speaking: 'מדבר…',
    end: 'סיום שיחה',
    mute: 'השתקת מיקרופון',
    unmute: 'ביטול השתקה',
    micError: 'צריך גישה למיקרופון כדי לדבר. אשרו את ההרשאה ונסו שוב.',
    title: 'העוזר החכם של וסים',
  },
  ar: {
    talk: 'تحدّث مع وسيم',
    connecting: 'يتّصل…',
    listening: 'يستمع…',
    speaking: 'يتحدّث…',
    end: 'إنهاء المكالمة',
    mute: 'كتم الميكروفون',
    unmute: 'إلغاء كتم الميكروفون',
    micError: 'نحتاج إذن الميكروفون للتحدث. يُرجى السماح والمحاولة مرة أخرى.',
    title: 'مساعد وسيم الذكي',
  },
};

export const labelsFor = (language: string): ConvoLabels =>
  CONVO_LABELS[(language as ConvoLang) in CONVO_LABELS ? (language as ConvoLang) : 'en'];

// Public agent id — safe to ship (the same identifier embed codes use).
// Overridable via env so the agent can be swapped without a code change.
export const AGENT_ID =
  (import.meta.env.VITE_ELEVENLABS_AGENT_ID as string | undefined) ??
  'agent_5301m1p82gt2f4kvf18ep9ffeez6';
