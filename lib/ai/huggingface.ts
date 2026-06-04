import type { AIProvider, ChatTurn } from "./provider";

const ROUTER = "https://router.huggingface.co/v1/chat/completions";

/** Free dev provider using Hugging Face's OpenAI-compatible inference router. */
export class HuggingFaceProvider implements AIProvider {
  name = "huggingface";
  private token: string;
  private textModel: string;
  private imageModel: string;

  constructor() {
    this.token = process.env.HF_TOKEN ?? "";
    this.textModel = process.env.HF_TEXT_MODEL ?? "meta-llama/Llama-3.2-3B-Instruct";
    this.imageModel = process.env.HF_IMAGE_MODEL ?? "black-forest-labs/FLUX.1-schnell";
  }

  async chat({ system, messages }: { system: string; messages: ChatTurn[] }): Promise<string> {
    const res = await fetch(ROUTER, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.textModel,
        max_tokens: 120,
        temperature: 0.9,
        messages: [{ role: "system", content: system }, ...messages],
      }),
    });
    if (!res.ok) {
      throw new Error(`HF chat failed: ${res.status} ${await res.text()}`);
    }
    const data = await res.json();
    return data?.choices?.[0]?.message?.content?.trim() ?? "...";
  }

  async generateAvatar(prompt: string): Promise<string> {
    // HF text-to-image returns raw image bytes; wrap as a data URL.
    const res = await fetch(
      `https://router.huggingface.co/hf-inference/models/${this.imageModel}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
          Accept: "image/png",
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );
    if (!res.ok) throw new Error(`HF image failed: ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    return `data:image/png;base64,${buf.toString("base64")}`;
  }
}
