export type Difficulty = "easy" | "medium" | "hard";

export const TOPICS = ["movies", "books", "songs", "tv-shows", "people", "places", "things"] as const;

export type Topic = typeof TOPICS[number];

export interface ChallengeRequest {
  theme: string;
  difficulty: Difficulty;
}

export interface ChallengeResponse {
  ok: true;
  items: string[];
}
