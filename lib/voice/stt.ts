// Speech-to-text: record a short mic clip and send it to /api/stt (Whisper).

export function sttSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== "undefined"
  );
}

/**
 * Record from the mic until `stop()` is called, then resolve the transcript.
 * Returns a stop() function; awaiting its result gives the recognised text.
 */
export async function startRecording(): Promise<{ stop: () => Promise<string> }> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream);
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
  recorder.start();

  const stop = () =>
    new Promise<string>((resolve, reject) => {
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        try {
          const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
          const form = new FormData();
          form.append("audio", blob, "clip.webm");
          const res = await fetch("/api/stt", { method: "POST", body: form });
          if (!res.ok) throw new Error(`STT failed: ${res.status}`);
          const data = await res.json();
          resolve((data.text ?? "").trim());
        } catch (err) {
          reject(err);
        }
      };
      recorder.stop();
    });

  return { stop };
}
