import { Router } from "express";
import OpenAI from "openai";
import type { ChallengeRequest, ChallengeResponse } from "@charades/shared";
import { getStoredPrompts, normalizePrompt, rememberPrompts } from "./storage";

export const router = Router();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/challenge", async (req, res) => {
  try {
    const { theme = "movies", difficulty = "Medium" } = (req.body ??
      {}) as Partial<ChallengeRequest>;

    const existingPrompts = getStoredPrompts(theme);
    const seenNormalized = new Set(existingPrompts.map(normalizePrompt));
    const avoidExamples = [...existingPrompts];

    const targetCount = 5;
    const maxAttempts = 3;
    const collected: string[] = [];

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: [
          "You are a CHARADES prompt generator that creates actable, pantomime-friendly items.",
          'OUTPUT FORMAT: Return only JSON { "items": string[] } with exactly ' +
            targetCount +
            " unique entries.",
          "",
          "OVERALL RULES:",
          "• Keep each item 1–4 words long, clear, and easy to mime without speaking.",
          "• Items must relate directly to the provided THEME — examples:",
          "    - movies → movie titles, famous scenes, or instantly recognizable characters.",
          "    - books → well-known novels or story elements with distinctive gestures.",
          "    - songs → song titles or lyrics that can be acted visually (not sung).",
          "    - tv-show → iconic shows, characters, or activities from them.",
          "    - objects → everyday things someone could pantomime using their body.",
          "    - actions → common verbs (e.g., brushing teeth, juggling).",
          "• Use full titles for media (movie/book/song/TV) rather than fragments.",
          "• For people: use famous individuals or a recognizable type of person (e.g., firefighter).",
          "• Prefer physical actions, familiar titles, or roles people can represent visually.",
          "• Avoid anything that depends on speech, spelling, or numbers.",
          "• Avoid abstract ideas (e.g., Happiness, Freedom), or items with no visible gesture.",
          "• Avoid long phrases, quotes, or brand/product names unless they’re extremely iconic within the theme.",
          "• No duplicates or near-duplicates.",
          "",
          "DIFFICULTY SCALING:",
          "• Easy → everyday actions or obvious references (1 simple motion).",
          "• Medium → popular movies/books/songs or multi-step actions but still mime-able.",
          "• Hard → less common references, compound actions, or subtle concepts that can still be acted silently.",
          "",
          "QUALITY CHECK:",
          "• Can an average person mime this in 30 seconds with no props?",
          "• Is it recognizable to a general audience familiar with the theme?",
          "• Replace any item that fails these checks.",
        ].join("\n"),
      },
      {
        role: "user",
        content: `THEME: ${theme}\nDIFFICULTY: ${difficulty}\nGenerate ${targetCount} charades items that fit this theme.`,
      },
      {
        role: "user",
        content:
          existingPrompts.length === 0
            ? "Avoid: none. Make sure all items are unique and distinct."
            : `Avoid these previously used prompts (case-insensitive): ${avoidExamples
                .slice(-50)
                .join(" | ")}`,
      },
      {
        role: "user",
        content: [
          "GOOD EXAMPLES (when appropriate to theme):",
          "• Jump rope",
          "• Snow angel",
          "• Air guitar",
          "• Titanic",
          "• Harry Potter",
          "• SpongeBob SquarePants",
          "",
          "BAD EXAMPLES:",
          "• Freedom (abstract)",
          "• Very angry person shouting (requires speech)",
          "• 1999 (numbers)",
          "• The entire plot of a long book",
          "",
          'Return only JSON: { "items": string[] }',
        ].join("\n"),
      },
    ];

    for (
      let attempt = 0;
      attempt < maxAttempts && collected.length < targetCount;
      attempt++
    ) {
      const avoidList = avoidExamples.slice(-50); // keep prompt short if the list grows
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages,
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
      throw new Error(
        "Unable to generate new prompts for this theme without repeats."
      );
    }

    rememberPrompts(theme, collected);

    const payload: ChallengeResponse = { ok: true, items: collected };
    res.json(payload);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});
