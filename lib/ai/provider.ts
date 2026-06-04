// The single seam through which all AI flows. Swap implementations freely.

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface AIProvider {
  name: string;
  /** Generate the creature's reply given its system prompt + conversation. */
  chat(args: { system: string; messages: ChatTurn[] }): Promise<string>;
  /** Make a unique avatar image. Returns a URL/data-URL, or "" if unsupported. */
  generateAvatar(prompt: string): Promise<string>;
}

/**
 * Zero-config fallback so the whole app is playable with NO API keys.
 * Gives short, mood-aware canned lines based on the last user message + prompt.
 */
export class MockProvider implements AIProvider {
  name = "mock";

  async chat({ system, messages }: { system: string; messages: ChatTurn[] }): Promise<string> {
    const last = messages[messages.length - 1]?.content.toLowerCase() ?? "";
    const hungry = /hunger \d/.test(system) && /hunger ([0-9]|1[0-9]|2[0-5])\b/.test(system);
    const lines: string[] = [];
    if (/hello|hi|hey/.test(last)) lines.push("Hi hi! *wiggles happily* 💕");
    if (/love|like you|good/.test(last)) lines.push("Yay! I like you too! 🥰");
    if (/name/.test(last)) lines.push("That's a secret... just kidding, you named me! 😄");
    if (hungry) lines.push("My tummy is rumbly... can I have a snack? 🍙");
    if (lines.length === 0) {
      const generic = [
        "*bounces* Tell me more!",
        "Boop! 🫧",
        "I'm so happy you're here!",
        "*tilts head curiously*",
        "Wheee! Let's play!",
      ];
      lines.push(generic[Math.floor(Math.random() * generic.length)]);
    }
    return lines.join(" ");
  }

  async generateAvatar(): Promise<string> {
    return ""; // no image — UI falls back to an emoji avatar
  }
}
