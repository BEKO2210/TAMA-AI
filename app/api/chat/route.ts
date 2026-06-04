import { NextRequest, NextResponse } from "next/server";
import { getProvider, type ChatTurn } from "@/lib/ai";
import { buildSystemPrompt } from "@/lib/game/personality";
import type { Creature } from "@/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { creature, messages } = (await req.json()) as {
      creature: Creature;
      messages: ChatTurn[];
    };
    if (!creature || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const provider = getProvider();
    const system = buildSystemPrompt(creature);
    const reply = await provider.chat({ system, messages: messages.slice(-10) });

    return NextResponse.json({ reply, provider: provider.name });
  } catch (err) {
    console.error("[/api/chat]", err);
    return NextResponse.json(
      { reply: "*looks dizzy* ...sorry, I got sleepy for a second. 😵‍💫" },
      { status: 200 }
    );
  }
}
