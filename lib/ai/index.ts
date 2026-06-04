import { AnthropicProvider } from "./anthropic";
import { HuggingFaceProvider } from "./huggingface";
import { MockProvider, type AIProvider } from "./provider";

export type { AIProvider, ChatTurn } from "./provider";

/**
 * Pick the AI provider from env. Order:
 *   AI_PROVIDER=anthropic  + ANTHROPIC_API_KEY  -> Claude
 *   AI_PROVIDER=huggingface + HF_TOKEN          -> Hugging Face (free)
 *   otherwise                                   -> Mock (zero-config, always works)
 *
 * Switching providers is literally one env var.
 */
export function getProvider(): AIProvider {
  const choice = (process.env.AI_PROVIDER ?? "huggingface").toLowerCase();

  if (choice === "anthropic" && process.env.ANTHROPIC_API_KEY) {
    return new AnthropicProvider();
  }
  if (choice === "huggingface" && process.env.HF_TOKEN) {
    return new HuggingFaceProvider();
  }
  return new MockProvider();
}
