# TAMA-AI 🥚

Your own **AI-powered Tamagotchi** — a virtual pet you adopt as an egg, raise
through life stages, and chat with. It has a personality shaped by how you treat
it, a unique AI-generated look, real-time needs, and (optionally) a voice.

> This is the **V1 web prototype** (Next.js). It runs out-of-the-box with **no
> API keys** thanks to a built-in mock AI, and upgrades to free Hugging Face
> models or Claude with a single env var.

## Features (V1)

- 🥚 **Life stages** — egg → baby → child → adult; neglect makes it sick and it
  can die (revive it as a fresh egg).
- ⏱️ **Real-time** — hunger, happiness, energy, health and hygiene decay even
  while the app is closed (a "catch-up" simulation runs when you return).
- 🎮 **Care actions** — feed, play, sleep, clean, heal.
- 💬 **Chat with personality** — the creature talks back; its tone reflects its
  mood and how you've cared for it.
- 🎤🔊 **Voice (optional)** — speak to it (Whisper STT) and let it speak back
  (browser TTS).
- 💾 **Saves locally** — state persists in your browser; storage is abstracted so
  cloud sync (Supabase) can drop in later.

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
```

No keys needed — the **mock AI** gives cute, mood-aware replies so you can play
immediately.

## Plug in real AI (optional)

Copy `.env.local.example` → `.env.local` and fill in what you want:

```bash
# Free Hugging Face models (chat + avatar generation + Whisper STT)
AI_PROVIDER=huggingface
HF_TOKEN=hf_...

# …or Claude for the best personality (pay-as-you-go API key,
# NOT the same as a Claude Max subscription)
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
```

Switching providers is a single env var — see `lib/ai/index.ts`.

## Architecture

```
app/            Next.js App Router pages + API routes (chat / stt / avatar)
components/     UI: CreatureView, StatsBars, ActionButtons, ChatPanel, VoiceButton
lib/ai/         Swappable AI provider (mock | huggingface | anthropic)
lib/game/       Creature model, real-time tick/decay, personality → prompt
lib/storage/    Storage interface + localStorage adapter (Supabase later)
lib/voice/      Browser TTS + mic recording for Whisper STT
types/          Shared types
```

## Roadmap

- **Phase 2** — unique AI avatars per stage, full voice loop, animations, day/night.
- **Phase 3** — Claude provider, Supabase cloud + auth + sync, care reminders,
  multi-creature collection.
- **Phase 4** — mobile (Expo/React Native reusing `lib/`), then hardware.

Deploy target: **Vercel**.
