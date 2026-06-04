"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage, Creature } from "@/types";
import { speak, ttsSupported } from "@/lib/voice/tts";
import VoiceButton from "./VoiceButton";

export default function ChatPanel({
  creature,
  onSpeakingChange,
}: {
  creature: Creature;
  onSpeakingChange?: (speaking: boolean) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => setVoiceOn(ttsSupported()), []);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending || !creature.alive) return;
    setInput("");

    const history: ChatMessage[] = [...messages, { role: "user", text: trimmed, at: Date.now() }];
    setMessages(history);
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creature,
          messages: history.map((m) => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });
      const data = await res.json();
      const reply: string = data.reply ?? "...";
      setMessages((m) => [...m, { role: "creature", text: reply, at: Date.now() }]);

      if (voiceOn) {
        onSpeakingChange?.(true);
        speak(reply);
        // rough estimate of speech duration so the wiggle stops
        const ms = Math.min(6000, 600 + reply.length * 55);
        setTimeout(() => onSpeakingChange?.(false), ms);
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-full flex-col rounded-3xl bg-white/60 p-3 shadow-sm backdrop-blur">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-sm font-semibold text-slate-600">
          💬 Talk to {creature.name}
        </span>
        {ttsSupported() && (
          <button
            onClick={() => setVoiceOn((v) => !v)}
            className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-medium shadow-sm"
            title="Toggle the creature's voice"
          >
            {voiceOn ? "🔊 Voice on" : "🔈 Voice off"}
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto px-1 pb-2">
        {messages.length === 0 && (
          <p className="mt-6 text-center text-sm text-slate-400">
            Say hi to {creature.name}! 👋
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                m.role === "user"
                  ? "bg-violet-500 text-white"
                  : "bg-white text-slate-700"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-white px-3 py-2 text-sm text-slate-400 shadow-sm">
              …
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <VoiceButton onTranscript={send} disabled={sending || !creature.alive} />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder={creature.alive ? "Type a message…" : "Your pet is resting…"}
          disabled={sending || !creature.alive}
          className="flex-1 rounded-full border border-white/80 bg-white/90 px-4 py-2.5 text-sm outline-none focus:border-violet-300 disabled:opacity-50"
        />
        <button
          onClick={() => send(input)}
          disabled={sending || !input.trim() || !creature.alive}
          className="rounded-full bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-95 disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </div>
  );
}
