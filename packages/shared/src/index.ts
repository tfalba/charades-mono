export type Difficulty = "Easy" | "Medium" | "Hard";

export const TOPICS = ["movies", "books", "songs", "tv-shows", "people", "places", "things"] as const;

export type Topic = typeof TOPICS[number];

export interface TopicInfo {
  key: Topic;
  label: string;
  color: string;
}

export const TOPIC_INFO = {
  movies: { key: "movies", label: "Movies", color: "#F97316" },
  books: { key: "books", label: "Books", color: "#8B5CF6" },
  songs: { key: "songs", label: "Songs", color: "#0EA5E9" },
  "tv-shows": { key: "tv-shows", label: "TV Shows", color: "#FACC15" },
  people: { key: "people", label: "People", color: "#EC4899" },
  places: { key: "places", label: "Places", color: "#22C55E" },
  things: { key: "things", label: "Things", color: "#64748B" }
} as const satisfies Record<Topic, TopicInfo>;

export const TOPIC_LIST: TopicInfo[] = Object.values(TOPIC_INFO);

export interface ChallengeRequest {
  theme: string;
  difficulty: Difficulty;
}

export interface ChallengeResponse {
  ok: true;
  items: string[];
}
