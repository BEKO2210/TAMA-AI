"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Creature } from "@/types";
import { hatchEgg } from "@/lib/game/creature";
import { applyAction, reviveAsEgg, tick, GAME_CONFIG, type ActionKind } from "@/lib/game/tick";
import { localStore } from "@/lib/storage/local";
import StatsBars from "@/components/StatsBars";
import CreatureView from "@/components/CreatureView";
import ActionButtons from "@/components/ActionButtons";
import ChatPanel from "@/components/ChatPanel";

const TICK_MS = 3000; // how often the game loop advances on screen

export default function Home() {
  const [creature, setCreature] = useState<Creature | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [genBusy, setGenBusy] = useState(false);
  const creatureRef = useRef<Creature | null>(null);
  creatureRef.current = creature;

  // Load saved creature once, applying real-time catch-up.
  useEffect(() => {
    let cancelled = false;
    localStore.load().then((saved) => {
      if (cancelled) return;
      setCreature(saved ? tick(saved) : null);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist whenever the creature changes.
  useEffect(() => {
    if (creature) void localStore.save(creature);
  }, [creature]);

  // The real-time game loop.
  useEffect(() => {
    const id = setInterval(() => {
      const cur = creatureRef.current;
      if (cur && cur.alive) setCreature(tick(cur));
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  const startEgg = useCallback(() => {
    setCreature(hatchEgg(nameInput));
    setNameInput("");
  }, [nameInput]);

  const hatchNow = useCallback(() => {
    setCreature((c) => {
      if (!c || c.stage !== "egg") return c;
      const n = structuredClone(c);
      n.stage = "baby";
      n.ageMs = Math.max(n.ageMs, GAME_CONFIG.stageAgeMs.baby);
      n.memory.push({ at: Date.now(), kind: "stage_up", note: `${n.name} hatched! 🐣` });
      return n;
    });
  }, []);

  const doAction = useCallback((kind: ActionKind) => {
    setCreature((c) => (c ? applyAction(c, kind) : c));
  }, []);

  const revive = useCallback(() => {
    setCreature((c) => (c ? reviveAsEgg(c) : c));
  }, []);

  const generateLook = useCallback(async () => {
    const cur = creatureRef.current;
    if (!cur || genBusy) return;
    setGenBusy(true);
    try {
      const res = await fetch("/api/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creature: cur }),
      });
      const data = await res.json();
      if (data.url) setCreature((c) => (c ? { ...c, avatarUrl: data.url } : c));
    } finally {
      setGenBusy(false);
    }
  }, [genBusy]);

  if (!loaded) {
    return (
      <main className="grid min-h-dvh place-items-center">
        <span className="animate-pulse text-4xl">🥚</span>
      </main>
    );
  }

  // ---- Start screen (no creature yet) ----
  if (!creature) {
    return (
      <main className="grid min-h-dvh place-items-center p-6">
        <div className="w-full max-w-sm rounded-3xl bg-white/70 p-8 text-center shadow-lg backdrop-blur">
          <div className="mb-4 text-7xl">🥚</div>
          <h1 className="mb-1 text-2xl font-bold">TAMA-AI</h1>
          <p className="mb-6 text-sm text-slate-500">
            Adopt an egg and raise your very own AI pet.
          </p>
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && startEgg()}
            placeholder="Name it (optional)…"
            className="mb-3 w-full rounded-full border border-white bg-white/90 px-4 py-2.5 text-center text-sm outline-none focus:border-violet-300"
          />
          <button
            onClick={startEgg}
            className="w-full rounded-full bg-violet-500 py-3 font-semibold text-white shadow-sm transition active:scale-95 hover:bg-violet-600"
          >
            🐣 Adopt an egg
          </button>
        </div>
      </main>
    );
  }

  // ---- Main game ----
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-3 p-4">
      <header className="flex items-center justify-between px-1">
        <h1 className="text-lg font-bold">TAMA-AI</h1>
        <button
          onClick={generateLook}
          disabled={genBusy || !creature.alive}
          className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium shadow-sm disabled:opacity-40"
          title="Generate a unique AI look"
        >
          {genBusy ? "✨…" : "✨ Look"}
        </button>
      </header>

      <section className="rounded-3xl bg-white/60 p-4 shadow-sm backdrop-blur">
        <CreatureView creature={creature} speaking={speaking} />

        {creature.stage === "egg" ? (
          <button
            onClick={hatchNow}
            className="mt-2 w-full rounded-2xl bg-amber-400 py-3 font-semibold text-white shadow-sm transition active:scale-95 hover:bg-amber-500"
          >
            👆 Tap to hatch!
          </button>
        ) : creature.alive ? (
          <div className="mt-3">
            <StatsBars stats={creature.stats} />
          </div>
        ) : (
          <button
            onClick={revive}
            className="mt-2 w-full rounded-2xl bg-emerald-500 py-3 font-semibold text-white shadow-sm transition active:scale-95 hover:bg-emerald-600"
          >
            🕊️ Hatch a new egg in their memory
          </button>
        )}
      </section>

      {creature.alive && creature.stage !== "egg" && (
        <ActionButtons onAction={doAction} disabled={!creature.alive} />
      )}

      <section className="min-h-[18rem] flex-1">
        <ChatPanel creature={creature} onSpeakingChange={setSpeaking} />
      </section>
    </main>
  );
}
