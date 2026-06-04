import type { Creature } from "@/types";

/**
 * Storage abstraction so we can swap localStorage (V1) for Supabase (later)
 * without touching game/UI code.
 */
export interface Storage {
  load(): Promise<Creature | null>;
  save(creature: Creature): Promise<void>;
  clear(): Promise<void>;
}
