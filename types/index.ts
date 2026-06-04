// Shared types for TAMA-AI. Keep this framework-agnostic so the same model
// can be reused later on mobile (Expo / React Native).

export type Stage = "egg" | "baby" | "child" | "adult";

export type Mood =
  | "happy"
  | "content"
  | "hungry"
  | "sleepy"
  | "dirty"
  | "sad"
  | "sick"
  | "dead";

/** All 0–100. Higher is better (e.g. high hunger = well fed, not starving). */
export interface Stats {
  hunger: number;
  happiness: number;
  energy: number;
  health: number;
  hygiene: number;
}

export type StatKey = keyof Stats;

/** A single notable thing that happened, used for the "memory"/learning feel. */
export interface MemoryEvent {
  at: number; // timestamp (ms)
  kind: "fed" | "played" | "slept" | "cleaned" | "healed" | "sick" | "neglect" | "born" | "stage_up" | "chat";
  note: string;
}

/**
 * Personality traits in -1..1, shaped slowly by how the creature is treated.
 * These are summarised into words and injected into the LLM system prompt.
 */
export interface Personality {
  affection: number; // neglected (-1) ... deeply bonded (+1)
  energyTrait: number; // lethargic (-1) ... bouncy (+1)
  mood: number; // grumpy (-1) ... cheerful (+1)
  discipline: number; // chaotic (-1) ... well-raised (+1)
}

export interface Creature {
  id: string;
  name: string;
  /** Drives the unique, AI-generated look. Stable across the creature's life. */
  styleSeed: string;
  avatarUrl: string | null;
  stage: Stage;
  bornAt: number;
  lastTickAt: number;
  diedAt: number | null;
  alive: boolean;
  /** Total cared-for age in ms (drives stage progression). */
  ageMs: number;
  stats: Stats;
  personality: Personality;
  memory: MemoryEvent[];
}

export interface ChatMessage {
  role: "user" | "creature";
  text: string;
  at: number;
}
