export type Difficulty = "easy" | "medium" | "hard";

export interface ChallengeRequest {
  theme: string;
  difficulty: Difficulty;
}

export interface ChallengeResponse {
  ok: true;
  items: string[];
}
