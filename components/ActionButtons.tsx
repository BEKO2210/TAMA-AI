"use client";

import type { ActionKind } from "@/lib/game/tick";

const ACTIONS: { kind: ActionKind; label: string; icon: string }[] = [
  { kind: "feed", label: "Feed", icon: "🍙" },
  { kind: "play", label: "Play", icon: "🎾" },
  { kind: "sleep", label: "Sleep", icon: "💤" },
  { kind: "clean", label: "Clean", icon: "🧼" },
  { kind: "heal", label: "Heal", icon: "💊" },
];

export default function ActionButtons({
  onAction,
  disabled,
}: {
  onAction: (kind: ActionKind) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {ACTIONS.map(({ kind, label, icon }) => (
        <button
          key={kind}
          onClick={() => onAction(kind)}
          disabled={disabled}
          className="flex flex-col items-center gap-1 rounded-2xl bg-white/80 py-3 text-sm font-medium shadow-sm transition active:scale-95 enabled:hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="text-2xl">{icon}</span>
          {label}
        </button>
      ))}
    </div>
  );
}
