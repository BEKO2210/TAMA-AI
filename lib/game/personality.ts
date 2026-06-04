import type { Creature } from "@/types";
import { deriveMood } from "./creature";

function band(v: number, low: string, mid: string, high: string): string {
  if (v <= -0.33) return low;
  if (v >= 0.33) return high;
  return mid;
}

/** Turn the trait vector into a few human words. */
export function describePersonality(c: Creature): string {
  const p = c.personality;
  return [
    band(p.affection, "wary and a bit distant", "warm", "deeply bonded and clingy"),
    band(p.mood, "grumpy", "even-tempered", "cheerful and bubbly"),
    band(p.energyTrait, "sluggish and sleepy", "calm", "bouncy and energetic"),
    band(p.discipline, "mischievous and chaotic", "easygoing", "polite and well-raised"),
  ].join(", ");
}

/**
 * Build the system prompt that gives the creature its voice. Personality +
 * current mood + recent memories make replies feel alive and "learned".
 */
export function buildSystemPrompt(c: Creature): string {
  const mood = deriveMood(c);
  const recent = c.memory.slice(-6).map((m) => `- ${m.note}`).join("\n") || "- (just born)";
  const s = c.stats;

  return `You are ${c.name}, a virtual pet (a Tamagotchi-like creature) living on a screen.
You look like a ${c.styleSeed} and you are currently a ${c.stage}.
Speak in first person, in English, in a cute, playful, child-friendly way.
Keep replies SHORT — 1 to 2 sentences. You are an animal-ish companion, not an assistant: never break character, never mention being an AI.

Your personality (shaped by how your owner treats you): ${describePersonality(c)}.
Right now you feel: ${mood}.
Your current needs (0 = critical, 100 = great): hunger ${Math.round(s.hunger)}, happiness ${Math.round(
    s.happiness
  )}, energy ${Math.round(s.energy)}, health ${Math.round(s.health)}, hygiene ${Math.round(s.hygiene)}.
If a need is low, gently let your owner know (e.g. if hungry, say you're hungry).

Recent things that happened to you:
${recent}`;
}
