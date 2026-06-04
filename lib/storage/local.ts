import type { Creature } from "@/types";
import type { Storage } from "./storage";

const KEY = "tama-ai:creature:v1";

/** Browser localStorage adapter. Safe to import on the server (guards window). */
export class LocalStorage implements Storage {
  async load(): Promise<Creature | null> {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Creature;
    } catch {
      return null;
    }
  }

  async save(creature: Creature): Promise<void> {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(KEY, JSON.stringify(creature));
  }

  async clear(): Promise<void> {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(KEY);
  }
}

export const localStore = new LocalStorage();
