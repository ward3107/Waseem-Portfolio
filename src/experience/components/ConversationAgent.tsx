import React, { Suspense, lazy, useState } from 'react';
import { Loader2, MessageCircle, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { labelsFor, voiceSupported } from './conversationLabels';

/**
 * The assistant launcher — deliberately lightweight. The ElevenLabs SDK is large
 * (~160KB gz), so it must NOT load just because the experience mounted. This
 * component ships only the buttons; the heavy sessions (voice or text) are
 * separate lazy chunks that load only when a visitor actually opens one.
 *
 * Language routing:
 *   - English / Arabic → voice call by default ("Talk to Waseem"), with a
 *     "prefer to type?" link that opens the text chat instead.
 *   - Hebrew → text chat only. ElevenLabs' conversational voice has no Hebrew
 *     agent yet, so Hebrew visitors type and the agent answers in Hebrew text.
 *
 * A connected voice call drives the same glassy TalkingHead face (via
 * audioTourStore); the text chat is a self-contained panel.
 */
const ConversationSession = lazy(() => import('./ConversationSession'));
const TextChatSession = lazy(() => import('./TextChatSession'));

type Mode = 'idle' | 'voice' | 'text';

const ConversationAgent: React.FC = () => {
  const { language, dir } = useLanguage();
  const L = labelsFor(language);
  const canVoice = voiceSupported(language);
  const [mode, setMode] = useState<Mode>('idle');
  const [micError, setMicError] = useState(false);
  const [chatError, setChatError] = useState(false);

  const connectingFallback = (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-900/85 px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-lg backdrop-blur" dir={dir}>
      <Loader2 className="h-4 w-4 animate-spin text-brand-cyan" aria-hidden="true" />
      {L.connecting}
    </div>
  );

  if (mode === 'voice') {
    return (
      <Suspense fallback={connectingFallback}>
        <ConversationSession
          onEnd={() => setMode('idle')}
          onError={() => {
            setMicError(true);
            setMode('idle');
          }}
        />
      </Suspense>
    );
  }

  if (mode === 'text') {
    return (
      <Suspense fallback={connectingFallback}>
        <TextChatSession
          onClose={() => setMode('idle')}
          onError={() => {
            setChatError(true);
            setMode('idle');
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
      {chatError && (
        <p className="rounded-lg border border-red-400/30 bg-red-950/70 px-3 py-2 text-xs text-red-200 shadow-lg backdrop-blur">
          {L.chatError}
        </p>
      )}

      {canVoice ? (
        <>
          {/* Primary: talk. iOS-style circular button — no wide pill to overflow. */}
          <button
            type="button"
            onClick={() => {
              setMicError(false);
              setMode('voice');
            }}
            aria-label={L.talk}
            title={L.talk}
            className="pointer-events-auto grid h-14 w-14 place-items-center rounded-full border border-brand-cyan/40 bg-slate-900/80 text-white shadow-lg shadow-brand-cyan/20 backdrop-blur transition active:scale-95 hover:border-brand-cyan/70 hover:bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
          >
            <Sparkles className="h-6 w-6 text-brand-cyan" aria-hidden="true" />
          </button>
          {/* Secondary: type instead. */}
          <button
            type="button"
            onClick={() => {
              setChatError(false);
              setMode('text');
            }}
            aria-label={L.typeInstead}
            title={L.typeInstead}
            className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-slate-900/70 text-white shadow-lg shadow-black/40 backdrop-blur transition active:scale-95 hover:bg-slate-900/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
          >
            <MessageCircle className="h-5 w-5 text-slate-200" aria-hidden="true" />
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => {
            setChatError(false);
            setMode('text');
          }}
          aria-label={L.chat}
          title={L.chat}
          className="pointer-events-auto grid h-14 w-14 place-items-center rounded-full border border-brand-cyan/40 bg-slate-900/80 text-white shadow-lg shadow-brand-cyan/20 backdrop-blur transition active:scale-95 hover:border-brand-cyan/70 hover:bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
        >
          <MessageCircle className="h-6 w-6 text-brand-cyan" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export default ConversationAgent;
