import { useState } from "react";
import { getChallenge } from "./api";
import { TOPICS, type Difficulty, type Topic } from "@charades/shared";

export default function App() {
  const [topic, setTopic] = useState<Topic>("movies");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [prompts, setPrompts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [idx, setIdx] = useState(0);

  async function fetchPrompts() {
    setLoading(true);
    try {
      const res = await getChallenge(topic, difficulty);
      setPrompts(res.items);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function getAlternate(i: number) {
    setIdx(i + 1);
  }

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="bg-midnight-800 text-white">
        <div className="mx-auto max-w-3xl p-4">
          <h1 className="text-2xl font-semibold">Charades</h1>
          <p className="text-sm opacity-80">
            Generate quick prompts via OpenAI
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-4 space-y-6">
        <section>
          <div className="grid gap-3 grid-cols-[1fr,1fr,auto]">
            <select
              className="card rounded-xl border px-3 py-2"
              value={topic}
              onChange={(e) => setTopic(e.target.value as Topic)}
            >
              {TOPICS.map((t) => (
                <option value={t}>{t}</option>
              ))}
            </select>

            <select
              className="card rounded-xl border px-3 py-2"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            >
              <option value="easy">easy</option>
              <option value="medium">medium</option>
              <option value="hard">hard</option>
            </select>
          </div>
        </section>
        <button
          onClick={fetchPrompts}
          disabled={loading}
          className={`btn btn-primary ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {loading ? "Loading…" : "Get Prompts"}
        </button>

        <section className="card">
          {prompts.length === 0 ? (
            <p className="text-slate-500">
              No prompts yet—click “Get Prompts”.
            </p>
          ) : (
            <div className="flex flex-col">
              <div className="space-y-1">
                <p className="text-xl font-semibold text-center my-6">
                  {prompts[idx]}
                </p>
              </div>
            </div>
          )}
        </section>
        {prompts.length > 0 && idx < 4 && (
          <section className="flex justify-end">
            <button
              className={`btn btn-primary items-end ml-auto}`}
              onClick={() => getAlternate(idx)}
            >
              Get Alternate
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
