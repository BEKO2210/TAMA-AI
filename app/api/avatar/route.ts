import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/ai";
import type { Creature } from "@/types";

export const runtime = "nodejs";

/**
 * Generate a unique avatar for the creature. Falls back to "" (empty) so the
 * UI keeps using the emoji placeholder when no image provider is configured.
 */
export async function POST(req: NextRequest) {
  try {
    const { creature } = (await req.json()) as { creature: Creature };
    if (!creature) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const prompt = `A cute ${creature.styleSeed}, ${creature.stage} stage, kawaii mascot, soft pastel colors, simple flat illustration, centered, white background, no text`;

    const provider = getProvider();
    const url = await provider.generateAvatar(prompt);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[/api/avatar]", err);
    return NextResponse.json({ url: "" }, { status: 200 });
  }
}
