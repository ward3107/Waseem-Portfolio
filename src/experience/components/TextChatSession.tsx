import React, { useEffect, useRef, useState } from 'react';
import { ConversationProvider, useConversation } from '@elevenlabs/react';
import { MessageCircle, Send, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useContact } from '@/features/contact/useContact';
import { AGENT_ID, labelsFor } from './conversationLabels';

/**
 * Text chat with Waseem's assistant — text-only (voice was removed), in every
 * language. It runs the public ElevenLabs agent in text-only mode, so it needs
 * no microphone and no API key. The model, system prompt, rules, hard bans and
 * knowledge base all live on the ElevenLabs agent (server-side); the browser
 * only sends the visitor's message text — it cannot set the model, token limit
 * or system prompt (agent overrides are locked off).
 *
 * Hardening handled here (client side):
 *   - Input validation: non-empty, trimmed, capped at MAX_LEN characters.
 *   - Bot disclosure: the header names it an automated assistant.
 *   - Human handoff: an always-visible "talk to a human" action, plus keyword
 *     detection (agent / human / נציג / ممثل …) that surfaces the WhatsApp path.
 *   - Fail-safe: a connect timeout so the visitor never watches a spinner that
 *     never resolves; any error shows a fixed fallback (handled by the parent).
 *   - Accessibility: aria-live transcript, focus into the input on open, Escape
 *     to close, reduced-motion-safe status pulse, dir set for RTL.
 */

interface Props {
  onClose: () => void;
  onError: () => void;
}

interface Turn {
  source: 'user' | 'ai';
  text: string;
}

// The agent also caps output; this guards the request at the door.
const MAX_LEN = 1000;
const CONNECT_TIMEOUT_MS = 20000;

// "I want a human" across the three languages — matched loosely (substring).
const HUMAN_KEYWORDS = [
  'agent', 'human', 'representative', 'real person', 'speak to someone',
  'נציג', 'בן אדם', 'אדם אמיתי', 'לדבר עם מישהו',
  'ممثل', 'إنسان', 'شخص حقيقي', 'موظف',
];

const TextChatInner: React.FC<Props> = ({ onClose, onError }) => {
  const { language, dir } = useLanguage();
  const L = labelsFor(language);
  const { whatsappUrl } = useContact();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const erroredRef = useRef(false);
  const handoffShownRef = useRef(false);

  const conversation = useConversation({
    onMessage: ({ message, source }: { message: string; source: 'user' | 'ai' }) => {
      // Only append the agent's replies here. The visitor's own messages are
      // shown optimistically the moment they hit Send (see `submit`) — the
      // text-only SDK doesn't reliably echo them back through onMessage.
      if (message && source === 'ai') setTurns((prev) => [...prev, { source, text: message }]);
    },
    onError: () => {
      if (erroredRef.current) return;
      erroredRef.current = true;
      onError();
    },
  });
  const { status, startSession, endSession, sendUserMessage } = conversation;
  const connected = status === 'connected';

  // Auto-connect once in text-only mode (no mic).
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    startSession({ agentId: AGENT_ID, connectionType: 'websocket', textOnly: true });
  }, [startSession]);

  // Fail-safe: if the socket never connects, don't leave the visitor staring at
  // a spinner — surface the fixed fallback after a bounded wait.
  useEffect(() => {
    if (connected) return;
    const t = window.setTimeout(() => {
      if (!erroredRef.current && conversation.status !== 'connected') {
        erroredRef.current = true;
        onError();
      }
    }, CONNECT_TIMEOUT_MS);
    return () => window.clearTimeout(t);
  }, [connected, conversation, onError]);

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

  // Move focus into the input when the chat becomes usable (accessibility).
  useEffect(() => {
    if (connected) inputRef.current?.focus();
  }, [connected]);

  // Escape closes the chat (keyboard operability, no focus trap needed).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Keep the newest message in view.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [turns]);

  const waHref = whatsappUrl;

  const isHumanRequest = (text: string): boolean => {
    const t = text.toLowerCase();
    return HUMAN_KEYWORDS.some((k) => t.includes(k));
  };

  const showHandoff = () => {
    if (handoffShownRef.current) return;
    handoffShownRef.current = true;
    setTurns((prev) => [...prev, { source: 'ai', text: L.humanHandoff }]);
  };

  // Single send path — used by the input form and by the tappable suggestions.
  const sendText = (raw: string) => {
    // Validate at the door: non-empty, trimmed, length-capped.
    const text = raw.trim().slice(0, MAX_LEN);
    if (!text || !connected) return;
    // Show the visitor's message immediately (optimistic), then send it.
    setTurns((prev) => [...prev, { source: 'user', text }]);
    sendUserMessage(text);
    setDraft('');
    // If they're asking for a person, surface the human path right away (the
    // agent is also instructed to hand off).
    if (isHumanRequest(text)) showHandoff();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    sendText(draft);
  };

  const remaining = MAX_LEN - draft.length;

  return (
    <div
      className="pointer-events-auto fixed bottom-5 right-5 z-[60] flex h-[26rem] max-h-[calc(100vh-2.5rem)] w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-white/15 bg-slate-900/95 shadow-xl shadow-black/50 backdrop-blur"
      role="dialog"
      aria-label={L.chatTitle}
      dir={dir}
    >
      <header className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2.5">
        <span className="flex min-w-0 flex-col">
          <span className="flex items-center gap-2 text-sm font-semibold text-white">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span
                className={`absolute inline-flex h-full w-full rounded-full ${connected ? 'bg-brand-cyan/70 motion-safe:animate-ping' : 'bg-slate-500'}`}
              />
              <span className={`relative inline-flex h-2 w-2 rounded-full ${connected ? 'bg-brand-cyan' : 'bg-slate-500'}`} />
            </span>
            <span className="truncate">{L.chatTitle}</span>
          </span>
          {/* Bot disclosure — always visible. */}
          <span className="ps-4 text-[11px] font-normal text-slate-400">{L.assistant}</span>
        </span>
        <div className="flex items-center gap-1">
          {/* Always-available human handoff. */}
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={L.human}
            title={L.human}
            className="grid h-8 w-8 place-items-center rounded-full text-emerald-300 transition hover:bg-white/10 hover:text-emerald-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
          </a>
          <button
            type="button"
            onClick={onClose}
            aria-label={L.close}
            className="grid h-8 w-8 place-items-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div
        ref={listRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label={L.chatTitle}
        className="flex-1 space-y-2 overflow-y-auto px-3 py-3"
      >
        {!connected && turns.length === 0 && (
          <p className="text-sm text-slate-300">{L.connecting}</p>
        )}
        {turns.map((turn, i) => (
          <div key={i} className={`flex ${turn.source === 'user' ? 'justify-end' : 'justify-start'}`}>
            <span
              className={`inline-block max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm leading-snug ${
                turn.source === 'user' ? 'bg-brand-cyan/25 text-white' : 'bg-white/10 text-slate-100'
              }`}
            >
              {turn.text}
            </span>
          </div>
        ))}
      </div>

      {/* Tappable suggested questions — a "click instead of type" shortcut,
          always available so a visitor can steer the chat with one tap. */}
      {connected && (
        <div
          className="flex gap-1.5 overflow-x-auto border-t border-white/10 px-2 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="group"
          aria-label={L.chatTitle}
        >
          {L.quickReplies.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => sendText(q)}
              className="shrink-0 whitespace-nowrap rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-1.5 text-xs font-medium text-brand-cyan transition hover:bg-brand-cyan/20 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="flex items-center gap-2 border-t border-white/10 p-2">
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={L.placeholder}
          aria-label={L.placeholder}
          disabled={!connected}
          maxLength={MAX_LEN}
          enterKeyHint="send"
          className="min-w-0 flex-1 rounded-full border border-white/10 bg-slate-800/80 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-brand-cyan/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan disabled:opacity-50"
        />
        {/* A quiet counter once they approach the limit. */}
        {remaining <= 100 && (
          <span className="shrink-0 text-[10px] tabular-nums text-slate-400" aria-hidden="true">
            {remaining}
          </span>
        )}
        <button
          type="submit"
          disabled={!connected || !draft.trim()}
          aria-label={L.send}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-cyan text-slate-900 transition hover:bg-brand-cyan/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan disabled:opacity-40"
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
