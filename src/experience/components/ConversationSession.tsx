import React, { useEffect, useRef } from 'react';
import { ConversationProvider, useConversation } from '@elevenlabs/react';
import { Mic, MicOff, PhoneOff } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { audioTourStore } from '../audioTourStore';
import { AGENT_ID, labelsFor } from './conversationLabels';

/**
 * The live voice call with Waseem's agent — the heavy half of the feature,
 * lazy-loaded (it pulls in the ElevenLabs SDK) only when a visitor taps talk.
 *
 * It auto-connects on mount, renders a compact glass panel (status, live
 * transcript, mute, end), and — crucially — reuses the site's glassy TalkingHead
 * face: while connected it publishes the agent's output volume to audioTourStore
 * as mouth openness and claims `conversing`, so the face lip-syncs to the agent's
 * replies and the scroll narration stands down. The agent is public, so the
 * browser connects with just the agent id — no API key is shipped.
 */

interface Props {
  onEnd: () => void;
  onError: () => void;
}

const SessionInner: React.FC<Props> = ({ onEnd, onError }) => {
  const { language, dir } = useLanguage();
  const L = labelsFor(language);

  const endedRef = useRef(false);
  const conversation = useConversation({
    onError: () => {
      if (endedRef.current) return;
      endedRef.current = true;
      onError();
    },
  });
  const { status, isSpeaking, message, isMuted, setMuted, startSession, endSession, getOutputVolume } =
    conversation;

  // Auto-connect once on mount (the visitor already tapped "Talk").
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    startSession({ agentId: AGENT_ID, connectionType: 'websocket' });
  }, [startSession]);

  // When the call ends (disconnected after we started), hand control back.
  useEffect(() => {
    if (status === 'disconnected' && startedRef.current && !endedRef.current) {
      endedRef.current = true;
      onEnd();
    }
  }, [status, onEnd]);

  // Clean up the store and the socket if we unmount mid-call.
  useEffect(() => {
    return () => {
      audioTourStore.set({ conversing: false, speaking: false, mouth: 0 });
      try {
        endSession();
      } catch {
        /* already closed */
      }
    };
  }, [endSession]);

  // Drive the shared glassy face from the agent's output volume while connected.
  const speakingRef = useRef(false);
  speakingRef.current = isSpeaking;
  useEffect(() => {
    if (status !== 'connected') return;
    audioTourStore.set({ conversing: true });
    let raf = 0;
    let mouth = 0;
    const tick = () => {
      let vol = 0;
      try {
        vol = getOutputVolume();
      } catch {
        vol = 0;
      }
      const target = Math.min(1, vol * 1.6);
      mouth += (target - mouth) * (target > mouth ? 0.5 : 0.25);
      if (mouth < 0.001) mouth = 0;
      audioTourStore.set({ conversing: true, speaking: speakingRef.current, mouth });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      audioTourStore.set({ conversing: true, speaking: false, mouth: 0 });
    };
  }, [status, getOutputVolume]);

  const connected = status === 'connected';
  const statusText = !connected ? L.connecting : isSpeaking ? L.speaking : L.listening;
  const statusColor = !connected ? 'text-slate-300' : isSpeaking ? 'text-brand-gold' : 'text-brand-cyan';

  return (
    <div
      className="pointer-events-auto fixed bottom-5 right-5 z-50 flex w-[min(20rem,calc(100vw-2.5rem))] flex-col gap-2 rounded-2xl border border-white/15 bg-slate-900/85 p-3 shadow-xl shadow-black/50 backdrop-blur"
      role="group"
      aria-label={L.title}
      dir={dir}
    >
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full ${
              isSpeaking ? 'bg-brand-gold/70' : 'bg-brand-cyan/70'
            }`}
          />
          <span
            className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
              isSpeaking ? 'bg-brand-gold' : 'bg-brand-cyan'
            }`}
          />
        </span>
        <span className={`text-sm font-semibold ${statusColor}`}>{statusText}</span>
      </div>

      {connected && message && (
        <p className="max-h-24 overflow-y-auto text-sm leading-snug text-slate-200">{message}</p>
      )}

      <div className="mt-1 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setMuted(!isMuted)}
          disabled={!connected}
          aria-label={isMuted ? L.unmute : L.mute}
          aria-pressed={isMuted}
          className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan disabled:opacity-40"
        >
          {isMuted ? <MicOff className="h-4 w-4" aria-hidden="true" /> : <Mic className="h-4 w-4" aria-hidden="true" />}
        </button>
        <button
          type="button"
          onClick={() => {
            if (endedRef.current) return;
            endedRef.current = true;
            try {
              endSession();
            } catch {
              /* already closed */
            }
            onEnd();
          }}
          className="inline-flex items-center gap-2 rounded-full bg-red-500/90 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
        >
          <PhoneOff className="h-4 w-4" aria-hidden="true" />
          {L.end}
        </button>
      </div>
    </div>
  );
};

const ConversationSession: React.FC<Props> = (props) => (
  <ConversationProvider>
    <SessionInner {...props} />
  </ConversationProvider>
);

export default ConversationSession;
