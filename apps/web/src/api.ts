import type { ChallengeRequest, ChallengeResponse, Difficulty } from "@charades/shared";

const API = (import.meta as any).env?.VITE_API_BASE || "/api";

export async function getChallenge(theme: string, difficulty: ChallengeRequest["difficulty"]) {
  const body: ChallengeRequest = { theme, difficulty };
  const r = await fetch(`${API}/challenge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(`Request failed: ${r.status}`);
  return r.json() as Promise<ChallengeResponse>;
}
