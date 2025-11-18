import { useState, type CSSProperties } from "react";
import { getChallenge } from "./api";
import {
  TOPIC_INFO,
  TOPIC_LIST,
  type Difficulty,
  type Topic,
} from "@charades/shared";
import logo from "./assets/logo.png";

export default function App() {
  const [topic, setTopic] = useState<Topic>("movies");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [prompts, setPrompts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [idx, setIdx] = useState(0);
  const topicTheme = TOPIC_INFO[topic];
  const accentColor = topicTheme.color;
  const selectAccentStyle = { "--accent-color": accentColor } as CSSProperties;

  async function fetchPrompts() {
    setIdx(0);
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
    <div className={`min-h-dvh header-gradient flex flex-col justify-between`}>
      <header className="text-white min-h-[15vh] bg-[#231515] ">
        <div className="mx-auto max-w-3xl px-4 py-8 flex justify-evenly items-center">
          <h1 className=" text-[min(9vw,15vh,60px)] font-italic font-bold">
            Charades
          </h1>
          <img
            className="w-full max-w-[200px] rounded-xl shadow-lg"
            alt="logo"
            src={logo}
          ></img>
        </div>
      </header>

      <main
        className="rounded-xl mx-8 md:mx-auto max-w-3xl p-4 space-y-6 min-h-[40vh] min-w-[min(50vw,700px)] my-8 lg:my-12"
        style={{ backgroundColor: `${accentColor}80` }}
      >
        <section>
          <div className="grid gap-3 grid-cols-[1fr,1fr,auto]">
            <select
              className="theme-select"
              value={topic}
              onChange={(e) => {
                setPrompts([]);
                setTopic(e.target.value as Topic);
              }}
              style={selectAccentStyle}
            >
              {TOPIC_LIST.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>

            <select
              className="theme-select"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              style={selectAccentStyle}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </section>
        <button
          onClick={fetchPrompts}
          disabled={loading}
          className={`btn btn-primary ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          style={{ backgroundColor: accentColor, borderColor: accentColor }}
        >
          {loading ? "Loading…" : "Get Prompts"}
        </button>

        <section className="card border-2" style={{ borderColor: accentColor }}>
          {prompts.length === 0 ? (
            <p className="text-slate-500">
              No prompts yet—click “Get Prompts”.
            </p>
          ) : (
            <div className="flex flex-col">
              <div className="flex justify-between items-center gap-2 text-sm text-slate-600">
                <span
                  className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1"
                  aria-label={`${topicTheme.label} theme color`}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: accentColor }}
                  />
                  {topicTheme.label}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Difficulty: {difficulty}
                </span>
              </div>
              <div className="space-y-1">
                {!loading ? (
                  <p className="text-xl font-semibold text-center my-6">
                    {prompts[idx]}
                  </p>
                ) : (
                  <p className="text-center my-7">Loading...</p>
                )}
              </div>
            </div>
          )}
        </section>
        {prompts.length > 0 && idx < 4 && (
          <section className="flex justify-end">
            <button
              className="btn btn-primary items-end ml-auto"
              style={{ backgroundColor: accentColor, borderColor: accentColor }}
              onClick={() => getAlternate(idx)}
            >
              Get Alternate
            </button>
          </section>
        )}
      </main>
      <footer className="bg-[#231515] h-[40vh] w-[100vw]"></footer>
    </div>
  );
}
