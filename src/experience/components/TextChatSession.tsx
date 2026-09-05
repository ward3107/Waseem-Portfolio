import React, { useEffect, useRef, useState } from 'react';
import { ConversationProvider, useConversation } from '@elevenlabs/react';
import { Send, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AGENT_ID, labelsFor } from './conversationLabels';

/**
 * Text chat with Waseem's assistant — the assistant is text-only (voice was
 * removed), in every language. It runs the public ElevenLabs agent in text-only
 * mode, so it needs no microphone and no API key. The agent is grounded on a
 * Services/FAQ knowledge base and replies in the visitor's own language
 * (English / Hebrew / Arabic), detected from what they type.
 *
 * The visitor's own messages are rendered optimistically on send (the SDK does
 * not reliably echo them back); onMessage only appends the agent's replies.
 *
 * Lazy-loaded (it pulls the ElevenLabs SDK) — only mounted once a visitor opens
 * the chat.
 */

interface Props {
  onClose: () => void;
  onError: () => void;
}

interface Turn {
  source: 'user' | 'ai';
  text: string;
}

const TextChatInner: React.FC<Props> = ({ onClose, onError }) => {
  const { language, dir } = useLanguage();
  const L = labelsFor(language);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const erroredRef = useRef(false);

  const conversation = useConversation({
    onMessage: ({ message, source }: { message: string; source: 'user' | 'ai' }) => {
      // Only append the agent's replies here. The visitor's own messages are
      // shown optimistically the moment they hit Send (see `submit`) — the
      // text-only SDK doesn't reliably echo them back through onMessage, so
      // relying on it left the transcript showing only the AI side.
      if (message && source === 'ai') setTurns((prev) => [...prev, { source, text: message }]);
    },
    onError: () => {
      if (erroredRef.current) return;
      erroredRef.current = true;
      onError();
    },
  });
  const { status, startSession, endSession, sendUserMessage } = conversation;

  // Auto-connect once in text-only mode (no mic).
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    startSession({ agentId: AGENT_ID, connectionType: 'websocket', textOnly: true });
  }, [startSession]);

  // Tidy up the socket on unmount.
  useEffect(() => {
    return () => {
      try {
        endSession();
      } catch {
        /* already closed */
      }
    };
  }, [endSession]);

  // Keep the newest message in view.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [turns]);

  const connected = status === 'connected';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !connected) return;
    // Show the visitor's message immediately (optimistic) — the SDK won't echo
    // it back — then send it to the agent.
    setTurns((prev) => [...prev, { source: 'user', text }]);
    sendUserMessage(text);
    setDraft('');
  };

  return (
    <div
      className="pointer-events-auto fixed bottom-5 right-5 z-[60] flex h-[26rem] max-h-[calc(100vh-2.5rem)] w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-white/15 bg-slate-900/90 shadow-xl shadow-black/50 backdrop-blur"
      role="dialog"
      aria-label={L.chatTitle}
      dir={dir}
    >
      <header className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2.5">
        <span className="flex items-center gap-2 text-sm font-semibold text-white">
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full rounded-full ${connected ? 'animate-ping bg-brand-cyan/70' : 'bg-slate-500'}`}
            />
            <span className={`relative inline-flex h-2 w-2 rounded-full ${connected ? 'bg-brand-cyan' : 'bg-slate-500'}`} />
          </span>
          {L.chatTitle}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label={L.close}
          className="grid h-8 w-8 place-items-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </header>

      <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
        {!connected && turns.length === 0 && (
          <p className="text-sm text-slate-400">{L.connecting}</p>
        )}
        {turns.map((turn, i) => (
          <div
            key={i}
            className={`flex ${turn.source === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <span
              className={`inline-block max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-snug ${
                turn.source === 'user'
                  ? 'bg-brand-cyan/20 text-white'
                  : 'bg-white/10 text-slate-100'
              }`}
            >
              {turn.text}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 border-t border-white/10 p-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={L.placeholder}
          aria-label={L.placeholder}
          disabled={!connected}
          className="min-w-0 flex-1 rounded-full border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand-cyan/50 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!connected || !draft.trim()}
          aria-label={L.send}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-cyan/90 text-slate-900 transition hover:bg-brand-cyan focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan disabled:opacity-40"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
};

const TextChatSession: React.FC<Props> = (props) => (
  <ConversationProvider>
    <TextChatInner {...props} />
  </ConversationProvider>
);

export default TextChatSession;
