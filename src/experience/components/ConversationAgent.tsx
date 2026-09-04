import React, { Suspense, lazy, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { labelsFor } from './conversationLabels';

/**
 * The "Talk to Waseem" launcher — deliberately lightweight. The ElevenLabs
 * Conversational AI SDK is large (~160KB gz), so it must NOT load just because
 * the experience mounted. This component ships only a button; the heavy session
 * (SDK + provider + live-call panel) is a separate lazy chunk that loads only
 * when a visitor actually taps to talk.
 *
 * While connected, the session drives the same glassy TalkingHead face (via
 * audioTourStore) so the bot's replies are lip-synced, and the narration yields.
 * The agent auto-detects English/Arabic; Hebrew is understood and answered in
 * text but has no conversational agent-voice on ElevenLabs yet.
 */
const ConversationSession = lazy(() => import('./ConversationSession'));

const ConversationAgent: React.FC = () => {
  const { language, dir } = useLanguage();
  const L = labelsFor(language);
  const [talking, setTalking] = useState(false);
  const [micError, setMicError] = useState(false);

  if (talking) {
    return (
      <Suspense
        fallback={
          <div className="pointer-events-none fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-900/85 px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-lg backdrop-blur" dir={dir}>
            <Loader2 className="h-4 w-4 animate-spin text-brand-cyan" aria-hidden="true" />
            {L.connecting}
          </div>
        }
      >
        <ConversationSession
          onEnd={() => setTalking(false)}
          onError={() => {
            setMicError(true);
            setTalking(false);
          }}
        />
      </Suspense>
    );
  }

  return (
    <div className="pointer-events-auto fixed bottom-5 right-5 z-50 flex max-w-[16rem] flex-col items-end gap-2" dir={dir}>
      {micError && (
        <p className="rounded-lg border border-red-400/30 bg-red-950/70 px-3 py-2 text-xs text-red-200 shadow-lg backdrop-blur">
          {L.micError}
        </p>
      )}
      <button
        type="button"
        onClick={() => {
          setMicError(false);
          setTalking(true);
        }}
        aria-label={L.talk}
        className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/30 bg-slate-900/80 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-cyan/10 backdrop-blur transition hover:border-brand-cyan/60 hover:bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
      >
        <Sparkles className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
        {L.talk}
      </button>
    </div>
  );
};

export default ConversationAgent;
