import { Router } from "express";
import OpenAI from "openai";
import type { ChallengeRequest, ChallengeResponse } from "@charades/shared";

export const router = Router();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function firstText(r: OpenAI.Responses.Response) {
  const t = r.output_text;
  if (t) return t;
  const item = r.output?.[0];
  const chunk = item && "content" in item ? item.content?.[0] : undefined;
  return (chunk && "text" in chunk ? chunk.text : "") ?? "";
}

router.post("/challenge", async (req, res) => {
  try {
    const { theme = "movies", difficulty = "medium" } = (req.body ??
      {}) as Partial<ChallengeRequest>;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: 'Return JSON: { "items": string[] } only.' },
        {
          role: "user",
          content: `Give 5 charades prompts. Theme: ${theme}. Difficulty: ${difficulty}.`,
        },
      ],
      max_tokens: 200,
    });

    const text = completion.choices[0]?.message?.content ?? "{}";
    const { items = [] } = JSON.parse(text) as { items?: string[] };

    const payload: ChallengeResponse = { ok: true, items };
    res.json(payload);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});
