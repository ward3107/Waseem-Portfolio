import React, { Suspense, lazy, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { labelsFor } from './conversationLabels';

/**
 * The assistant launcher — text chat only. The heavy ElevenLabs SDK must NOT
 * load just because the experience mounted, so this component ships only the
 * button; the chat session is a separate lazy chunk that loads when a visitor
 * opens it. (Live voice was removed — visitors type and the agent answers in
 * text, in every language.)
 *
 * Placement: the button docks *beside* the WhatsApp CTA at the bottom. It's
 * rendered through a portal into a slot inside WhatsAppFloat (#assistant-dock-
 * slot) so the two contact actions sit together and never overlap. If the slot
 * isn't present (e.g. a page without the WhatsApp dock), it falls back to a
 * fixed bottom corner.
 */
const TextChatSession = lazy(() => import('./TextChatSession'));

// Master on/off switch for the AI chat assistant. OFF by default so it's hidden
// for now. To turn it back on for everyone, set VITE_ENABLE_CHAT_ASSISTANT=true
// in the host env (Vercel) and redeploy, or flip this fallback to 'true'. The
// whole component (dock button, lazy session) stays wired up — this only
// controls whether it renders at all.
const CHAT_ENABLED =
  ((import.meta.env.VITE_ENABLE_CHAT_ASSISTANT as string | undefined) ?? 'false') === 'true';

type Mode = 'idle' | 'text';

const ConversationAgent: React.FC = () => {
  const { language, dir } = useLanguage();
  const L = labelsFor(language);
  const [mode, setMode] = useState<Mode>('idle');
  const [chatError, setChatError] = useState(false);

  // The dock slot lives in WhatsAppFloat (eager site chrome), so by the time
  // this lazy component mounts it already exists; look it up once.
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setSlot(document.getElementById('assistant-dock-slot'));
  }, []);

  const connectingFallback = (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-900/85 px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-lg backdrop-blur" dir={dir}>
      <Loader2 className="h-4 w-4 animate-spin text-brand-cyan" aria-hidden="true" />
      {L.connecting}
    </div>
  );

  // Hidden while the master switch is off — nothing renders or loads.
  if (!CHAT_ENABLED) return null;

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

  // The chat button — sized to sit flush beside the WhatsApp pill in the dock.
  const chatButton = (
    <button
      type="button"
      onClick={() => {
        setChatError(false);
        setMode('text');
      }}
      aria-label={L.chat}
      title={L.chat}
      className="pointer-events-auto grid h-12 w-12 shrink-0 place-items-center rounded-full border border-brand-cyan/40 bg-slate-900/85 text-brand-cyan shadow-lg shadow-black/40 backdrop-blur transition active:scale-95 hover:bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
    >
      <MessageCircle className="h-6 w-6" aria-hidden="true" />
    </button>
  );

  return (
    <>
      {chatError && (
        <p
          className="pointer-events-none fixed bottom-24 right-4 z-50 max-w-[16rem] rounded-lg border border-red-400/30 bg-red-950/80 px-3 py-2 text-xs text-red-200 shadow-lg backdrop-blur"
          dir={dir}
        >
          {L.chatError}
        </p>
      )}
      {slot ? (
        createPortal(chatButton, slot)
      ) : (
        <div className="pointer-events-auto fixed bottom-24 right-4 z-40" dir={dir}>
          {chatButton}
        </div>
      )}
    </>
  );
};

export default ConversationAgent;
