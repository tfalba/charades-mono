import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
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

const ROUNDS = 5;
const TURN_DURATION_MS = 5 * 60 * 1000;
type RoundResult = boolean | null;

export default function App() {
  const [topic, setTopic] = useState<Topic>("movies");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [prompts, setPrompts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [idx, setIdx] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [results, setResults] = useState<RoundResult[][]>([]);
  const [turnDeadline, setTurnDeadline] = useState<number | null>(null);
  const [timeRemainingMs, setTimeRemainingMs] =
    useState<number>(TURN_DURATION_MS);
  const [turnOutcome, setTurnOutcome] = useState<"success" | "fail" | null>(
    null
  );
  const [spinSignal, setSpinSignal] = useState(0);
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

  const handleTurnResult = useCallback(
    (didWin: boolean) => {
      if (!selectedPlayer) return;
      const playerIdx = players.findIndex(
        (player) => player.name === selectedPlayer.name
      );
      if (playerIdx === -1) return;
      const playerRounds = results[playerIdx] ?? [];
      const roundIdx = playerRounds.findIndex((value) => value === null);
      if (roundIdx === -1) return;

      setResults((prev) =>
        prev.map((rounds, idx) =>
          idx === playerIdx
            ? rounds.map((value, i) => (i === roundIdx ? didWin : value))
            : rounds
        )
      );
      setTurnOutcome(didWin ? "success" : "fail");
      setTurnDeadline(null);
      setTimeRemainingMs(0);
      setSelectedPlayer(null);
      setPrompts([]);
      setIdx(0);
    },
    [players, results, selectedPlayer]
  );

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

  useEffect(() => {
    if (!selectedPlayer || prompts.length === 0) {
      setTurnDeadline(null);
      setTimeRemainingMs(TURN_DURATION_MS);
      return;
    }
    setTurnOutcome(null);
    setTurnDeadline(Date.now() + TURN_DURATION_MS);
    setTimeRemainingMs(TURN_DURATION_MS);
  }, [selectedPlayer, prompts.length]);

  useEffect(() => {
    if (!turnDeadline || turnOutcome || !selectedPlayer) return;
    const tick = () => {
      const remaining = turnDeadline - Date.now();
      if (remaining <= 0) {
        setTimeRemainingMs(0);
        handleTurnResult(false);
      } else {
        setTimeRemainingMs(remaining);
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [turnDeadline, turnOutcome, selectedPlayer, handleTurnResult]);

  useEffect(() => {
    if (!turnOutcome) return;
    const timeout = window.setTimeout(() => setTurnOutcome(null), 2000);
    return () => window.clearTimeout(timeout);
  }, [turnOutcome]);

  useEffect(() => {
    if (prompts.length > 0 && turnOutcome) {
      setTurnOutcome(null);
    }
  }, [prompts.length, turnOutcome]);

  const getAlternate = useCallback(() => {
    setIdx((prev) => prev + 1);
    setTimeRemainingMs((prev) => Math.max(0, prev - 30_000));
  }, []);

  const handleAddPlayer = useCallback((player: Player) => {
    setPlayers((prev) => [...prev, player]);
    setResults((prev) => [...prev, Array(ROUNDS).fill(null)]);
  }, []);

  const handleRemovePlayer = useCallback(
    (index: number) => {
      setPlayers((prev) => {
        const removed = prev[index];
        if (removed && selectedPlayer?.name === removed.name) {
          setSelectedPlayer(null);
        }
        return prev.filter((_, idx) => idx !== index);
      });
      setResults((prev) => prev.filter((_, idx) => idx !== index));
    },
    [selectedPlayer]
  );

  const requestSpin = useCallback(() => {
    if (players.length === 0 || prompts.length === 0) return;
    setSpinSignal((prev) => prev + 1);
  }, [players.length, prompts.length]);

  const formattedTime = useMemo(() => {
    const totalSeconds = Math.max(0, Math.ceil(timeRemainingMs / 1000));
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [timeRemainingMs]);
  const canRequestSpin =
    players.length > 0 && prompts.length > 0 && !selectedPlayer && !turnOutcome;

  return (
    <div className={`min-h-dvh header-gradient flex flex-col justify-between`}>
      <header
        className="text-white min-h-[12vh] bg-[#231515]"
        style={staticBackgroundStyle}
      >
        <div className="relative mx-auto max-w-3xl px-4 py-1 gap-4 flex justify-center items-center">
          <h1 className=" text-[min(9vw,15vh,60px)] font-italic font-bold">
            Charades
          </h1>
          <img
            className="w-full max-w-[145px] rounded-xl shadow-lg"
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
        className="flex flex-col gap-4 rounded-xl mx-8 md:mx-auto max-w-3xl min-h-[100vh] p-4 space-y-2 min-w-[min(70vw,700px)] my-4 lg:my-6"
        style={{ backgroundColor: `${accentColor}15` }}
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
                              ? "bg-white/15 text-white"
                              : "text-slate-200 hover:bg-white/5"
                          }`}
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
              className={`px-4 py-2 rounded-full border text-xs uppercase tracking-wide font-semibold transition shadow ${
                loading
                  ? "bg-white/20 text-white/60 cursor-not-allowed border-white/20"
                  : "bg-white/10 text-white border-white/30 hover:bg-white/20"
              }`}
            >
              {loading ? "Loading…" : "Get Prompts"}
            </button>
          </div>
        </section>

        <section
          className="card border-4 mb-0 relative overflow-hidden"
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
              <div className="space-y-4 flex-1 flex flex-col items-center justify-center text-center">
                {!loading ? (
                  <>
                    <p className="text-xl font-semibold px-2">{prompts[idx]}</p>
                    <button
                      type="button"
                      onClick={requestSpin}
                      disabled={!canRequestSpin}
                      className={`flex flex-col items-center justify-center rounded-2xl border border-white/30 px-5 py-3 shadow-lg transition ${
                        canRequestSpin
                          ? "bg-white/90 text-slate-900 hover:bg-white"
                          : "bg-white/20 text-white/60 cursor-not-allowed"
                      }`}
                    >
                      <img
                        src={logo}
                        alt="Spin"
                        className={`h-16 w-18 ${canRequestSpin ? "logo-spin" : ""}`}
                      />
                      <span className="mt-2 text-sm font-semibold tracking-wide uppercase">
                        {players.length === 0
                          ? "Add players to spin"
                          : selectedPlayer
                            ? "Round in progress"
                            : "Spin to pick player"}
                      </span>
                    </button>
                  </>
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
          {selectedPlayer && (
            <div className="absolute bottom-3 right-3">
              <span
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-xs font-semibold shadow-lg"
                style={{ backgroundColor: selectedPlayer.color }}
              >
                <span className="h-2.5 w-2.5 rounded-full bg-white/80" />
                {selectedPlayer.name}
              </span>
            </div>
          )}
        {prompts.length > 0 && idx < 4 ? (
            <section className="flex justify-end">
              <button
                className="items-end ml-auto px-4 py-2 rounded-full border text-xs uppercase tracking-wide font-semibold transition shadow bg-white/10 text-white border-white/30 hover:bg-white/20"
                onClick={getAlternate}
              >
                Get Alternate
              </button>
            </section>
          ) : (
            <section className="flex py-1 min-h-full" />
          )}
          <div className="flex items-end justify-between">
            {prompts.length > 0 && (
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                <div className="text-sm font-semibold text-white px-3 py-1 rounded-full bg-slate-900/70 border border-white/10">
                  {selectedPlayer ? formattedTime : "05:00"}
                </div>
                <button
                  type="button"
                  onClick={() => handleTurnResult(true)}
                  disabled={!selectedPlayer || !turnDeadline || !!turnOutcome}
                  className="rounded-full bg-white text-slate-900 font-semibold px-4 py-2 text-sm uppercase tracking-wide shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Got It
                </button>
              </div>
            )}
          </div>

          {turnOutcome && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 backdrop-blur-sm">
              <div
                className={`text-6xl font-black drop-shadow-2xl ${
                  turnOutcome === "success" ? "text-green-400" : "text-red-400"
                }`}
              >
                {turnOutcome === "success" ? "✓" : "✕"}
              </div>
              <p className="text-lg font-semibold text-white">
                {turnOutcome === "success" ? "Round Won!" : "Time's Up!"}
              </p>
            </div>
          )}
          </section>

        <WheelScreen
          onPlayerSelected={setSelectedPlayer}
          selectedPlayer={selectedPlayer}
          players={players}
          results={results}
          roundCount={ROUNDS}
          onAddPlayer={handleAddPlayer}
          onRemovePlayer={handleRemovePlayer}
          spinSignal={spinSignal}
        />
      </main>
      <footer
        className="bg-[#231515] w-full flex justify-center px-4 py-6 opacity-[.8]"
        style={staticBackgroundStyle}
      />
    </div>
  );
}
