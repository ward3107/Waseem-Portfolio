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
          <button
            type="button"
            onClick={() => {
              setMicError(false);
              setMode('voice');
            }}
            aria-label={L.talk}
            className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/30 bg-slate-900/80 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-cyan/10 backdrop-blur transition hover:border-brand-cyan/60 hover:bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
          >
            <Sparkles className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
            {L.talk}
          </button>
          <button
            type="button"
            onClick={() => {
              setChatError(false);
              setMode('text');
            }}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-slate-300 underline-offset-2 transition hover:text-white hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
          >
            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
            {L.typeInstead}
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
          className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/30 bg-slate-900/80 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-cyan/10 backdrop-blur transition hover:border-brand-cyan/60 hover:bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
        >
          <MessageCircle className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
          {L.chat}
        </button>
      )}
    </div>
  );
};

export default ConversationAgent;
