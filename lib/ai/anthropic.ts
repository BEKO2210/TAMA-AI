import type { AIProvider, ChatTurn } from "./provider";

const API = "https://api.anthropic.com/v1/messages";

/**
 * Claude provider — the target for the best personality. Needs a pay-as-you-go
 * ANTHROPIC_API_KEY (separate from a Claude Max subscription). Claude has no
 * image generation, so generateAvatar returns "" and the UI falls back.
 */
export class AnthropicProvider implements AIProvider {
  name = "anthropic";
  private key: string;
  private model: string;

  constructor() {
    this.key = process.env.ANTHROPIC_API_KEY ?? "";
    this.model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
  }

  async chat({ system, messages }: { system: string; messages: ChatTurn[] }): Promise<string> {
    const res = await fetch(API, {
      method: "POST",
      headers: {
        "x-api-key": this.key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 150,
        system,
        messages: messages.map((m: ChatTurn) => ({ role: m.role, content: m.content })),
      }),
    });
    if (!res.ok) {
      throw new Error(`Anthropic chat failed: ${res.status} ${await res.text()}`);
    }
    const data = await res.json();
    return data?.content?.[0]?.text?.trim() ?? "...";
  }

  async generateAvatar(): Promise<string> {
    return ""; // Claude doesn't generate images
  }
}
