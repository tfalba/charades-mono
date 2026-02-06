export type Difficulty = "Easy" | "Medium" | "Hard";
export declare const TOPICS: readonly ["movies", "books", "songs", "tv-shows", "people", "places", "things"];
export type Topic = typeof TOPICS[number];
export interface TopicInfo {
    key: Topic;
    label: string;
    color: string;
}
export declare const TOPIC_INFO: {
    readonly movies: {
        readonly key: "movies";
        readonly label: "Movies";
        readonly color: "#F97316";
    };
    readonly books: {
        readonly key: "books";
        readonly label: "Books";
        readonly color: "#8B5CF6";
    };
    readonly songs: {
        readonly key: "songs";
        readonly label: "Songs";
        readonly color: "#0EA5E9";
    };
    readonly "tv-shows": {
        readonly key: "tv-shows";
        readonly label: "TV Shows";
        readonly color: "#FACC15";
    };
    readonly people: {
        readonly key: "people";
        readonly label: "People";
        readonly color: "#EC4899";
    };
    readonly places: {
        readonly key: "places";
        readonly label: "Places";
        readonly color: "#22C55E";
    };
    readonly things: {
        readonly key: "things";
        readonly label: "Things";
        readonly color: "#64748B";
    };
};
export declare const TOPIC_LIST: TopicInfo[];
export interface ChallengeRequest {
    theme: string;
    difficulty: Difficulty;
}
export interface ChallengeResponse {
    ok: true;
    items: string[];
}
