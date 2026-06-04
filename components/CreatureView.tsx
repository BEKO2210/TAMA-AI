"use client";

import Image from "next/image";
import type { Creature } from "@/types";
import { deriveMood, moodEmoji, placeholderAvatar } from "@/lib/game/creature";

/** The stage where the creature lives — avatar, mood bubble, and animation. */
export default function CreatureView({
  creature,
  speaking,
}: {
  creature: Creature;
  speaking: boolean;
}) {
  const mood = deriveMood(creature);
  const animation =
    !creature.alive
      ? ""
      : mood === "sick" || mood === "sad"
      ? ""
      : speaking
      ? "animate-wiggle"
      : "animate-bob";

  return (
    <div className="relative flex h-56 flex-col items-center justify-center">
      <div className="absolute top-0 rounded-full bg-white/70 px-3 py-1 text-2xl shadow-sm">
        {moodEmoji(mood)}
      </div>

      <div className={`mt-6 ${animation}`}>
        {creature.avatarUrl ? (
          <Image
            src={creature.avatarUrl}
            alt={creature.name}
            width={160}
            height={160}
            unoptimized
            className="h-40 w-40 rounded-3xl object-contain drop-shadow-xl"
          />
        ) : (
          <span className="block select-none text-8xl drop-shadow-xl">
            {placeholderAvatar(creature)}
          </span>
        )}
      </div>

      <p className="mt-3 text-sm font-medium text-slate-500">
        {creature.name} · <span className="capitalize">{creature.stage}</span>
        {!creature.alive && " · 🕊️ resting"}
      </p>
    </div>
  );
}
