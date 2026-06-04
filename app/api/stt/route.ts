import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Whisper speech-to-text via Hugging Face. Receives an audio blob, returns text.
 * Needs HF_TOKEN. Without it (or on error) returns empty text so the UI degrades
 * gracefully to typing.
 */
export async function POST(req: NextRequest) {
  try {
    const token = process.env.HF_TOKEN;
    if (!token) return NextResponse.json({ text: "", note: "no HF_TOKEN" });

    const form = await req.formData();
    const audio = form.get("audio");
    if (!(audio instanceof Blob)) {
      return NextResponse.json({ error: "No audio" }, { status: 400 });
    }
    const model = process.env.HF_STT_MODEL ?? "openai/whisper-large-v3";
    const bytes = Buffer.from(await audio.arrayBuffer());

    const res = await fetch(
      `https://router.huggingface.co/hf-inference/models/${model}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": audio.type || "audio/webm",
        },
        body: bytes,
      }
    );
    if (!res.ok) throw new Error(`Whisper failed: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return NextResponse.json({ text: data.text ?? "" });
  } catch (err) {
    console.error("[/api/stt]", err);
    return NextResponse.json({ text: "" }, { status: 200 });
  }
}
