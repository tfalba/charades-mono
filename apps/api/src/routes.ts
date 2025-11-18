import { Router } from "express";
import OpenAI from "openai";
import type { ChallengeRequest, ChallengeResponse } from "@charades/shared";
import { getStoredPrompts, normalizePrompt, rememberPrompts } from "./storage";

export const router = Router();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/challenge", async (req, res) => {
  try {
    const { theme = "movies", difficulty = "medium" } = (req.body ?? {}) as Partial<ChallengeRequest>;

    const existingPrompts = getStoredPrompts(theme);
    const seenNormalized = new Set(existingPrompts.map(normalizePrompt));
    const avoidExamples = [...existingPrompts];

    const targetCount = 5;
    const maxAttempts = 3;
    const collected: string[] = [];

    for (let attempt = 0; attempt < maxAttempts && collected.length < targetCount; attempt++) {
      const avoidList = avoidExamples.slice(-50); // keep prompt short if the list grows
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: 'Return JSON: { "items": string[] } only.' },
          {
            role: "user",
            content: `Give ${targetCount} charades prompts. Theme: ${theme}. Difficulty: ${difficulty}. Do not repeat any previously used prompts for this theme and keep them distinct from one another.`,
          },
          {
            role: "user",
            content:
              avoidList.length === 0
                ? "No prior prompts. Ensure every item is unique and playable."
                : `Avoid every item in this list (case-insensitive): ${avoidList.join(" | ")}`,
          },
        ],
        max_tokens: 200,
      });

      const text = completion.choices[0]?.message?.content ?? "{}";
      const { items = [] } = JSON.parse(text) as { items?: string[] };

      for (const raw of items) {
        const item = (raw ?? "").trim();
        if (!item) continue;
        const normalized = normalizePrompt(item);
        if (seenNormalized.has(normalized)) continue;
        seenNormalized.add(normalized);
        avoidExamples.push(item);
        collected.push(item);
        if (collected.length >= targetCount) break;
      }
    }

    if (collected.length === 0) {
      throw new Error("Unable to generate new prompts for this theme without repeats.");
    }

    rememberPrompts(theme, collected);

    const payload: ChallengeResponse = { ok: true, items: collected };
    res.json(payload);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});
