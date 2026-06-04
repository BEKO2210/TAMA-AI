// Text-to-speech via the browser's free Web Speech API. The creature speaks.

export function ttsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Speak text aloud with a slightly higher, cuter pitch. */
export function speak(text: string): void {
  if (!ttsSupported() || !text) return;
  const u = new SpeechSynthesisUtterance(text.replace(/[*_~`]/g, ""));
  u.lang = "en-US";
  u.pitch = 1.4;
  u.rate = 1.05;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export function stopSpeaking(): void {
  if (ttsSupported()) window.speechSynthesis.cancel();
}
