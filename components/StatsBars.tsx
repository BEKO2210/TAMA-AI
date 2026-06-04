"use client";

import type { Stats, StatKey } from "@/types";

const META: Record<StatKey, { label: string; icon: string; color: string }> = {
  hunger: { label: "Hunger", icon: "🍗", color: "bg-orange-400" },
  happiness: { label: "Happy", icon: "💖", color: "bg-pink-400" },
  energy: { label: "Energy", icon: "⚡", color: "bg-yellow-400" },
  health: { label: "Health", icon: "❤️", color: "bg-red-400" },
  hygiene: { label: "Clean", icon: "🫧", color: "bg-sky-400" },
};

const ORDER: StatKey[] = ["hunger", "happiness", "energy", "health", "hygiene"];

export default function StatsBars({ stats }: { stats: Stats }) {
  return (
    <div className="flex flex-col gap-2">
      {ORDER.map((key) => {
        const value = Math.round(stats[key]);
        const { label, icon, color } = META[key];
        const low = value <= 25;
        return (
          <div key={key} className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-sm font-medium">
              {icon} {label}
            </span>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/60">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  low ? "bg-red-500 animate-pulse" : color
                }`}
                style={{ width: `${value}%` }}
              />
            </div>
            <span className="w-9 shrink-0 text-right text-xs tabular-nums text-slate-500">
              {value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
