import { useEffect, useRef, useState, type CSSProperties } from "react";
import { getChallenge } from "./api";
import {
  TOPIC_INFO,
  TOPIC_LIST,
  type Difficulty,
  type Topic,
} from "@charades/shared";
import logo from "./assets/logo.png";
import { WheelScreen } from "./components/WheelScreen";
import { Player } from "./components/PrizeWheel";
import tvStatic from "./assets/tv-static.gif";

export default function App() {
  const [topic, setTopic] = useState<Topic>("movies");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [prompts, setPrompts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [idx, setIdx] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isTopicMenuOpen, setIsTopicMenuOpen] = useState(false);
  const [isDifficultyMenuOpen, setIsDifficultyMenuOpen] = useState(false);
  const [staticMotionDisabled, setStaticMotionDisabled] = useState(false);
  const topicDropdownRef = useRef<HTMLDivElement | null>(null);
  const difficultyDropdownRef = useRef<HTMLDivElement | null>(null);
  const topicTheme = TOPIC_INFO[topic];
  const accentColor = topicTheme.color;
  const selectAccentStyle = { "--accent-color": accentColor } as CSSProperties;
  const staticBackgroundStyle = staticMotionDisabled
    ? { backgroundColor: "#231515" }
    : {
        backgroundImage: `url(${tvStatic})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "repeat",
      };

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const targetNode = event.target as Node;
      if (
        topicDropdownRef.current &&
        !topicDropdownRef.current.contains(targetNode)
      ) {
        setIsTopicMenuOpen(false);
      }
      if (
        difficultyDropdownRef.current &&
        !difficultyDropdownRef.current.contains(targetNode)
      ) {
        setIsDifficultyMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function getAlternate(i: number) {
    setIdx(i + 1);
  }

  function menuHighlightStyle(d: string) {
    if (difficulty === d) {
      console.log(selectedPlayer?.color, "color");
      return selectedPlayer?.color;
    }
    else return "";
  }

  return (
    <div className={`min-h-dvh header-gradient flex flex-col justify-between`}>
      <header
        className="text-white min-h-[15vh] bg-[#231515]"
        style={staticBackgroundStyle}
      >
        <div className="relative mx-auto max-w-3xl px-4 py-1 gap-4 flex justify-center items-center">
          <h1 className=" text-[min(9vw,15vh,60px)] font-italic font-bold">
            Charades
          </h1>
          <img
            className="w-full max-w-[176px] rounded-xl shadow-lg"
            alt="logo"
            src={logo}
          ></img>
          <button
            type="button"
            onClick={() => setStaticMotionDisabled((prev) => !prev)}
            className="absolute top-3 right-0 text-xs tracking-wide uppercase bg-black/60 text-white px-4 py-2 rounded-full border border-white/30 shadow-md hover:bg-black/70 transition"
            aria-pressed={staticMotionDisabled}
          >
            {staticMotionDisabled ? "Enable Static" : "Disable Static"}
          </button>
        </div>
      </header>

      <main
        className="rounded-xl mx-8 md:mx-auto max-w-3xl p-4 space-y-2 min-w-[min(70vw,700px)] my-4 lg:my-8"
        style={{ backgroundColor: `${accentColor}70` }}
      >
        <section>
          <div className="grid gap-3 grid-cols-[1fr,1fr] md:grid-cols-[1fr,1fr,auto]">
            <div className="theme-select-wrapper" ref={topicDropdownRef}>
              <button
                type="button"
                className="theme-select flex items-center justify-between gap-3"
                style={{
                  ...selectAccentStyle,
                  boxShadow: "0 6px 18px rgba(0, 0, 0, 0.3)",
                }}
                onClick={() => setIsTopicMenuOpen((open) => !open)}
              >
                <span className="flex items-center gap-3 text-left">
                  <span
                    className="h-3 w-3 rounded-full border border-white/20"
                    style={{ backgroundColor: accentColor }}
                  />
                  <span className="font-semibold tracking-wide">
                    {topicTheme.label}
                  </span>
                </span>
                <svg
                  className={`transition-transform duration-150 ${
                    isTopicMenuOpen ? "rotate-180" : ""
                  }`}
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {isTopicMenuOpen && (
                <div className="absolute z-40 -mt-16 w-full rounded-2xl border border-slate-700 bg-[#1f1f1f]/95 shadow-2xl backdrop-blur">
                  <ul className="max-h-[20rem] overflow-auto py-2">
                    {TOPIC_LIST.map((t) => (
                      <li key={t.key}>
                        <button
                          type="button"
                          onClick={() => {
                            setPrompts([]);
                            setTopic(t.key as Topic);
                            setIsTopicMenuOpen(false);
                          }}
                          className={`flex w-full items-center justify-between ml-4 px-4 py-3 text-left text-sm font-semibold transition ${
                            topic === t.key
                              ? "bg-white/15 text-white"
                              : "text-slate-200 hover:bg-white/10"
                          }`}
                          style={{
                            borderLeft: `12px solid ${TOPIC_INFO[t.key].color}`,
                          }}
                        >
                          <span>{t.label}</span>
                          {topic === t.key && (
                            <span className="flex items-center gap-2 text-white/80 text-xs pr-4">
                              <input
                                type="checkbox"
                                checked
                                readOnly
                                className="accent-white w-4 h-4"
                                aria-label={`${t.label} selected`}
                              />
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="theme-select-wrapper" ref={difficultyDropdownRef}>
              <button
                type="button"
                className="theme-select flex items-center justify-between gap-3"
                style={{
                  ...selectAccentStyle,
                  boxShadow: "0 6px 18px rgba(0, 0, 0, 0.3)",
                }}
                onClick={() => setIsDifficultyMenuOpen((open) => !open)}
              >
                <span className="font-semibold tracking-wide">
                  {difficulty}
                </span>
                <svg
                  className={`transition-transform duration-150 ${
                    isDifficultyMenuOpen ? "rotate-180" : ""
                  }`}
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {isDifficultyMenuOpen && (
                <div className="absolute z-40 -mt-16 w-full rounded-2xl border border-slate-700 bg-[#1f1f1f]/95 shadow-2xl backdrop-blur">
                  <ul className="max-h-64 overflow-auto py-2">
                    {["Easy", "Medium", "Hard"].map((level) => (
                      <li key={level}>
                        <button
                          type="button"
                          onClick={() => {
                            setDifficulty(level as Difficulty);
                            setIsDifficultyMenuOpen(false);
                          }}
                          className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold transition ${
                            difficulty === level
                              ? // ? "bg-white/10 text-white"
                                "text-white"
                              : "text-slate-200 hover:bg-white/25"
                          }`}
                          style={{ backgroundColor: menuHighlightStyle(level) }}
                          // style={{difficulty === level && backgroundColor: selectedPlayer?.color || ""}`}
                        >
                          <span>{level}</span>
                          {difficulty === level && (
                            <span className="flex items-center gap-2 text-white/80 text-xs">
                              <input
                                type="checkbox"
                                checked
                                readOnly
                                className="accent-white w-4 h-4"
                                aria-label={`${level} difficulty selected`}
                              />
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <button
              onClick={fetchPrompts}
              disabled={loading}
              className={`btn btn-primary ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
              style={{ backgroundColor: accentColor, borderColor: accentColor }}
            >
              {loading ? "Loading…" : "Get Prompts"}
            </button>
          </div>
        </section>

        <section
          className="card border-2 h-[195px] mb-0 relative overflow-hidden"
          style={{ borderColor: accentColor }}
        >
          {prompts.length === 0 ? (
            <>
              <p className="text-slate-500">Click Prompt to Generate</p>
              <div className="flex justify-center my-2">
                <img
                  src={logo}
                  alt="Loading"
                  className={`h-32 w-36 opacity-90 ${loading && "logo-spin"}`}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col h-full">
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
              <div className="space-y-1 flex-1 flex items-center justify-center">
                {!loading ? (
                  <p className="text-xl font-semibold text-center px-2">
                    {prompts[idx]}
                  </p>
                ) : (
                  <div className="flex justify-center my-4">
                    <img
                      src={logo}
                      alt="Loading"
                      className="h-20 w-20 logo-spin opacity-90"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          {prompts.length > 0 && selectedPlayer && (
            <div className="absolute bottom-3 left-3">
              <span
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-xs font-semibold shadow-lg"
                style={{ backgroundColor: selectedPlayer.color }}
              >
                <span className="h-2.5 w-2.5 rounded-full bg-white/80" />
                {selectedPlayer.name}
              </span>
            </div>
          )}
        </section>
        {prompts.length > 0 && idx < 4 ? (
          <section className="flex justify-end">
            <button
              className="btn btn-primary items-end ml-auto"
              style={{ backgroundColor: accentColor, borderColor: accentColor }}
              onClick={() => getAlternate(idx)}
            >
              Get Alternate
            </button>
          </section>
        ) : (
          <section className="flex py-1 min-h-full">
            {/* <GameWheel /> */}
            <button
              className=" w-0 items-end ml-auto text-transparent"
              onClick={() => getAlternate(idx)}
            >
              Dummy
            </button>
          </section>
        )}
      </main>
      <footer
        className="bg-[#231515/85] w-full flex justify-center px-4 py-6 opacity-[.8]"
        style={staticBackgroundStyle}
      >
        <WheelScreen
          onPlayerSelected={setSelectedPlayer}
          selectedPlayer={selectedPlayer}
        />
      </footer>
    </div>
  );
}
