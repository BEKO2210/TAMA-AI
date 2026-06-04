import type { Creature, Mood, Stats } from "@/types";

// Cute default starter names picked at random when an egg hatches.
const NAMES = [
  "Pip", "Mochi", "Bloop", "Tato", "Nibble", "Wobble", "Sprout",
  "Pixel", "Gummy", "Coco", "Pebble", "Zuzu", "Momo", "Fig", "Bean",
];

/** A handful of visual seeds so each creature looks distinct. */
const STYLE_WORDS = [
  "fluffy round slime", "tiny dragon hatchling", "chubby star spirit",
  "mushroom critter", "cloud puff buddy", "jelly blob with antennae",
  "cosmic kitten", "leafy forest sprite", "bubbly sea creature",
  "glowing ember fox",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function freshStats(): Stats {
  return { hunger: 80, happiness: 80, energy: 80, health: 100, hygiene: 90 };
}

/** Create a brand-new egg ready to hatch. */
export function hatchEgg(name?: string): Creature {
  const now = Date.now();
  return {
    id: `c_${now}_${Math.random().toString(36).slice(2, 8)}`,
    name: name?.trim() || pick(NAMES),
    styleSeed: pick(STYLE_WORDS),
    avatarUrl: null,
    stage: "egg",
    bornAt: now,
    lastTickAt: now,
    diedAt: null,
    alive: true,
    ageMs: 0,
    stats: freshStats(),
    personality: { affection: 0, energyTrait: 0, mood: 0, discipline: 0 },
    memory: [{ at: now, kind: "born", note: "A new egg appeared!" }],
  };
}

/** Derive the current mood purely from stats + alive state. */
export function deriveMood(c: Creature): Mood {
  if (!c.alive) return "dead";
  const s = c.stats;
  if (s.health <= 25) return "sick";
  if (s.hunger <= 25) return "hungry";
  if (s.energy <= 20) return "sleepy";
  if (s.hygiene <= 25) return "dirty";
  const avg = (s.hunger + s.happiness + s.energy + s.hygiene) / 4;
  if (s.happiness <= 30) return "sad";
  if (avg >= 70) return "happy";
  return "content";
}

const MOOD_EMOJI: Record<Mood, string> = {
  happy: "😄",
  content: "🙂",
  hungry: "🍽️",
  sleepy: "😴",
  dirty: "🛁",
  sad: "😢",
  sick: "🤒",
  dead: "💀",
};

export function moodEmoji(mood: Mood): string {
  return MOOD_EMOJI[mood];
}

const STAGE_EMOJI = { egg: "🥚", baby: "🐣", child: "🐥", adult: "🐔" } as const;

/** Simple emoji avatar used until an AI image is generated. */
export function placeholderAvatar(c: Creature): string {
  if (!c.alive) return "💀";
  return STAGE_EMOJI[c.stage];
}
