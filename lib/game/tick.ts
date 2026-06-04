import type { Creature, MemoryEvent, Stage, StatKey, Stats } from "@/types";
import { deriveMood } from "./creature";

/**
 * Central tuning knobs. All decay is per real-time MINUTE so the creature
 * keeps living while the app is closed ("catch-up" simulation on return).
 * Defaults are demo-friendly (you can see change within a session); slow these
 * down for a calmer, multi-day pet.
 */
export const GAME_CONFIG = {
  // stat lost per minute
  decayPerMin: {
    hunger: 0.7,
    happiness: 0.5,
    energy: 0.4,
    hygiene: 0.4,
  } as Record<Exclude<StatKey, "health">, number>,

  // health changes per minute depending on overall condition
  healthRegenPerMin: 0.6, // when well cared for
  healthDecayPerMin: 1.2, // when neglected (hungry/dirty/exhausted)

  // age thresholds (ms of cared-for life) for each stage
  stageAgeMs: {
    baby: 2 * 60_000, // 2 min
    child: 15 * 60_000, // 15 min
    adult: 45 * 60_000, // 45 min
  } as Record<Exclude<Stage, "egg">, number>,

  maxMemory: 30,
  // cap how much offline time counts, so a week away isn't an instant death
  maxCatchUpMs: 12 * 60 * 60_000, // 12 h
};

function clamp(n: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, n));
}

function nudge(v: number, delta: number): number {
  return Math.max(-1, Math.min(1, v + delta));
}

function pushMemory(c: Creature, ev: MemoryEvent): void {
  c.memory.push(ev);
  if (c.memory.length > GAME_CONFIG.maxMemory) {
    c.memory.splice(0, c.memory.length - GAME_CONFIG.maxMemory);
  }
}

function nextStage(ageMs: number): Stage {
  const { stageAgeMs } = GAME_CONFIG;
  if (ageMs >= stageAgeMs.adult) return "adult";
  if (ageMs >= stageAgeMs.child) return "child";
  if (ageMs >= stageAgeMs.baby) return "baby";
  return "egg";
}

/**
 * Advance the creature to `now`, simulating any elapsed real time. Pure-ish:
 * mutates a clone and returns it, so callers can compare/notify on changes.
 */
export function tick(input: Creature, now = Date.now()): Creature {
  const c: Creature = structuredClone(input);
  const elapsedRaw = Math.max(0, now - c.lastTickAt);
  c.lastTickAt = now;
  if (!c.alive) return c;

  const elapsed = Math.min(elapsedRaw, GAME_CONFIG.maxCatchUpMs);
  const mins = elapsed / 60_000;
  if (mins <= 0) return c;

  c.ageMs += elapsed;

  // 1) decay the four care stats
  const d = GAME_CONFIG.decayPerMin;
  const s = c.stats;
  s.hunger = clamp(s.hunger - d.hunger * mins);
  s.happiness = clamp(s.happiness - d.happiness * mins);
  s.energy = clamp(s.energy - d.energy * mins);
  s.hygiene = clamp(s.hygiene - d.hygiene * mins);

  // 2) health follows overall condition
  const neglected = s.hunger <= 20 || s.hygiene <= 15 || s.energy <= 10;
  const thriving = s.hunger > 50 && s.hygiene > 40 && s.happiness > 40;
  if (neglected) {
    s.health = clamp(s.health - GAME_CONFIG.healthDecayPerMin * mins);
  } else if (thriving) {
    s.health = clamp(s.health + GAME_CONFIG.healthRegenPerMin * mins);
  }

  // 3) sickness / death
  if (s.health <= 0) {
    c.alive = false;
    c.diedAt = now;
    pushMemory(c, { at: now, kind: "neglect", note: `${c.name} could not hold on...` });
    return c;
  }
  if (s.health <= 25) {
    const last = c.memory[c.memory.length - 1];
    if (!last || last.kind !== "sick") {
      pushMemory(c, { at: now, kind: "sick", note: `${c.name} fell ill and needs healing.` });
    }
  }

  // 4) stage progression (age-driven: egg → baby → child → adult)
  const stage = nextStage(c.ageMs);
  if (stage !== c.stage) {
    c.stage = stage;
    const note = stage === "baby" ? `${c.name} hatched! 🐣` : `${c.name} grew into a ${stage}!`;
    pushMemory(c, { at: now, kind: "stage_up", note });
  }

  // 5) personality slowly shaped by how it's being treated
  const avg = (s.hunger + s.happiness + s.energy + s.hygiene) / 4;
  const p = c.personality;
  const careDelta = ((avg - 50) / 50) * (mins / 30); // gentle
  p.affection = nudge(p.affection, careDelta);
  p.mood = nudge(p.mood, careDelta);
  p.energyTrait = nudge(p.energyTrait, ((s.energy - 50) / 50) * (mins / 60));
  p.discipline = nudge(p.discipline, (thriving ? 1 : neglected ? -1 : 0) * (mins / 90));

  return c;
}

// ---- Player actions -------------------------------------------------------

export type ActionKind = "feed" | "play" | "sleep" | "clean" | "heal";

const ACTION_EFFECTS: Record<ActionKind, Partial<Stats>> = {
  feed: { hunger: +30, happiness: +5, energy: +5 },
  play: { happiness: +25, energy: -10, hunger: -5 },
  sleep: { energy: +35, health: +5 },
  clean: { hygiene: +40, happiness: +5 },
  heal: { health: +35, happiness: +5 },
};

const ACTION_MEMORY: Record<ActionKind, MemoryEvent["kind"]> = {
  feed: "fed",
  play: "played",
  sleep: "slept",
  clean: "cleaned",
  heal: "healed",
};

const ACTION_NOTE: Record<ActionKind, string> = {
  feed: "had a tasty meal",
  play: "played and had fun",
  sleep: "took a good nap",
  clean: "got all clean",
  heal: "got some medicine",
};

/** Apply a care action. Returns a new creature (ticked to now first). */
export function applyAction(input: Creature, action: ActionKind, now = Date.now()): Creature {
  const c = tick(input, now);
  if (!c.alive || c.stage === "egg") return c; // eggs just wait to hatch
  const effects = ACTION_EFFECTS[action];
  const s = c.stats;
  (Object.keys(effects) as StatKey[]).forEach((k) => {
    s[k] = clamp(s[k] + (effects[k] ?? 0));
  });
  pushMemory(c, { at: now, kind: ACTION_MEMORY[action], note: `${c.name} ${ACTION_NOTE[action]}.` });
  return c;
}

/** Bring a dead creature back as a fresh egg, keeping its name lineage. */
export function reviveAsEgg(c: Creature): Creature {
  const now = Date.now();
  return {
    ...c,
    stage: "egg",
    alive: true,
    diedAt: null,
    ageMs: 0,
    bornAt: now,
    lastTickAt: now,
    avatarUrl: null,
    stats: { hunger: 80, happiness: 80, energy: 80, health: 100, hygiene: 90 },
    memory: [{ at: now, kind: "born", note: `${c.name} returns as a fresh egg. 🥚` }],
  };
}

export { deriveMood };
