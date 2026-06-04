"use client";

import { useEffect, useRef, useState } from "react";
import { sttSupported, startRecording } from "@/lib/voice/stt";

/** Tap to start recording, tap again to stop → transcript via onTranscript. */
export default function VoiceButton({
  onTranscript,
  disabled,
}: {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}) {
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [supported, setSupported] = useState(true);
  const stopRef = useRef<(() => Promise<string>) | null>(null);

  useEffect(() => setSupported(sttSupported()), []);
  if (!supported) return null;

  async function toggle() {
    if (busy) return;
    if (!recording) {
      try {
        const { stop } = await startRecording();
        stopRef.current = stop;
        setRecording(true);
      } catch {
        setSupported(false);
      }
      return;
    }
    // stop & transcribe
    setRecording(false);
    setBusy(true);
    try {
      const text = await stopRef.current?.();
      if (text) onTranscript(text);
    } catch {
      /* ignore — user can type */
    } finally {
      setBusy(false);
      stopRef.current = null;
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled || busy}
      title={recording ? "Stop & send" : "Hold a chat — speak to your pet"}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl shadow-sm transition active:scale-95 disabled:opacity-40 ${
        recording ? "bg-red-500 text-white animate-pulse" : "bg-white/80 hover:bg-white"
      }`}
    >
      {busy ? "…" : recording ? "⏹️" : "🎤"}
    </button>
  );
}
