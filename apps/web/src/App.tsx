import { useState } from "react";
import { getChallenge } from "./api";
import type { Difficulty } from "@charades/shared";

export default function App() {
  const [theme, setTheme] = useState("movies");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [prompts, setPrompts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchPrompts() {
    setLoading(true);
    try {
      const res = await getChallenge(theme, difficulty);
      setPrompts(res.items);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="bg-midnight-800 text-white">
        <div className="mx-auto max-w-3xl p-4">
          <h1 className="text-2xl font-semibold">Charades</h1>
          <p className="text-sm opacity-80">Generate quick prompts via OpenAI</p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-4 space-y-6">
        <section className="card">
          <div className="grid gap-3 sm:grid-cols-[1fr,1fr,auto]">
            <input
              className="rounded-xl border px-3 py-2"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Theme (e.g., movies)"
            />
            <select
              className="rounded-xl border px-3 py-2"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            >
              <option value="easy">easy</option>
              <option value="medium">medium</option>
              <option value="hard">hard</option>
            </select>
            <button
              onClick={fetchPrompts}
              disabled={loading}
              className={`btn btn-primary ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loading ? "Loading…" : "Get Prompts"}
            </button>
          </div>
        </section>

        <section className="card">
          <h2 className="mb-2 text-lg font-semibold">Prompts</h2>
          {prompts.length === 0 ? (
            <p className="text-slate-500">No prompts yet—click “Get Prompts”.</p>
          ) : (
            <ol className="list-decimal space-y-1 pl-5">
              {prompts.map((p, i) => <li key={i}>{p}</li>)}
            </ol>
          )}
        </section>
      </main>
    </div>
  );
}
