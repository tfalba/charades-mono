import { useState } from "react";
import { TOPIC_INFO, type Topic } from "@charades/shared";
import logo from "./assets/logo.png";
import movieLogo from "./assets/movie-logo.png";
import booksLogo from "./assets/books-logo.png";
import songsLogo from "./assets/song-logo.png";
import tvLogo from "./assets/tv-logo.png";
import peopleLogo from "./assets/people-logo.png";
import placesLogo from "./assets/places-logo.png";
import thingsLogo from "./assets/things-logo.png";
import tvStatic from "./assets/tv-static.gif";
import { GameController } from "./components/GameController";
import { WheelScreen } from "./components/WheelScreen";
import { GameProvider, useGameContext } from "./context/GameContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoginButton, LogoutButton } from "./components/AuthButtons";

const TOPIC_LOGOS: Record<Topic, string> = {
  movies: movieLogo,
  books: booksLogo,
  songs: songsLogo,
  "tv-shows": tvLogo,
  people: peopleLogo,
  places: placesLogo,
  things: thingsLogo,
};

export default function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <GameShell />
      </GameProvider>
    </AuthProvider>
  );
}

function GameShell() {
  const [staticMotionDisabled, setStaticMotionDisabled] = useState(false);
  const staticBackgroundStyle = staticMotionDisabled
    ? { backgroundColor: "#231515" }
    : {
        backgroundImage: `url(${tvStatic})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "repeat",
      };

      const { user, idToken, authLoading } = useAuth();
  const {
    topic,
    difficulty,
    prompts,
    idx,
    hasAlternatePrompt,
    loading,
    requestSpin,
    canRequestSpin,
    players,
    selectedPlayer,
    getAlternate,
    turnOutcome,
    turnDeadline,
    handleTurnResult,
    formattedTime,
    setSelectedPlayer,
    results,
    roundCount,
    handleAddPlayer,
    handleRemovePlayer,
    spinSignal,
    fetchPrompts,
  } = useGameContext();

  const topicTheme = TOPIC_INFO[topic];
  const accentColor = topicTheme.color;

  return (
    <div className="nc-shell">
      <header
        className="nc-header text-white"
        style={staticBackgroundStyle}
      >
        <div className="absolute inset-0 header-gradient opacity-50" />
        <div className="relative mx-auto w-full max-w-3xl px-4 py-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-[min(10vw,6rem)] font-display font-extrabold tracking-tight">
                Charades
              </h1>
              {/* <p className="text-sm text-white/70 max-w-sm">
                Mobile-first rounds for fast party play.
              </p> */}
            </div>
            <div className="flex flex-col items-end gap-3">
              <img
                className="w-[120px] w-[50%] absolute top-0 right-0 opacity-60 rounded-2xl shadow-2xl border border-white/10 bg-black/20 p-2"
                alt="logo"
                src={logo}
              />
              <button
                type="button"
                onClick={() => setStaticMotionDisabled((prev) => !prev)}
                className="nc-btn-ghost absolute top-4 right-2"
                aria-pressed={staticMotionDisabled}
              >
                {staticMotionDisabled ? "Enable Static" : "Disable Static"}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {!user && <LoginButton />}
            {user && <div className="text-sm text-white/80">Welcome back!</div>}
            {authLoading && <div className="text-sm text-white/70">Loading...</div>}
            {user && <LogoutButton />}
          </div>
        </div>
      </header>

      <main
        className="mx-auto w-full max-w-3xl px-4 pb-10 pt-2 flex flex-col gap-3"
        style={{ backgroundColor: `${accentColor}10` }}
      >
        <GameController />

        <section
          className="nc-card border-2 mb-0 relative overflow-hidden"
          style={{ borderColor: accentColor }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-white/70 mb-4">
            <span
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1"
              aria-label={`${topicTheme.label} theme color`}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: accentColor }}
              />
              {topicTheme.label}
            </span>
            <span className="text-xs font-semibold text-white/80">
              Difficulty: {difficulty}
            </span>
          </div>
          {prompts.length === 0 && (selectedPlayer || loading) ? (
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              {(() => {
                const primaryDisabled =
                  loading || (!selectedPlayer && players.length === 0);
                const actionClass = primaryDisabled
                  ? "bg-white/10 text-white/50 cursor-not-allowed border-white/10"
                  : "bg-[color:var(--color-secondary)] text-black border-transparent hover:brightness-110";
                return (
                  <button
                    type="button"
                    onClick={selectedPlayer ? fetchPrompts : requestSpin}
                    disabled={primaryDisabled}
                    className={`px-5 py-3 rounded-full border text-xs uppercase tracking-wide font-semibold transition shadow ${actionClass}`}
                  >
                    {loading
                      ? "Loading…"
                      : selectedPlayer
                        ? "Get Prompts"
                        : null}
                        {/* : "Spin the Wheel"} */}
                  </button>
                );
              })()}
              <div className="flex justify-center">
                <img
                  src={TOPIC_LOGOS[topic] ?? logo}
                  alt="Loading"
                  className={`h-26 w-32 opacity-90 ${loading && "logo-spin"}`}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full pt-2 space-y-1">
              <div className="space-y-4 flex-1 flex flex-col items-center justify-center text-center">
                {!loading ? (
                  <>
                    <div className="flex flex-col items-center justify-center">
                      <img
                        src={TOPIC_LOGOS[topic] ?? logo}
                        alt="Loading"
                        className={`h-28 w-32 opacity-90 ${loading && "logo-spin"}`}
                      />
                      <p className="text-2xl mt-4 text-white font-semibold px-2">
                        {prompts[idx]}
                      </p>
                    </div>
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

          {hasAlternatePrompt ? (
            <section className="flex justify-end mt-4 sm:mt-0">
              <button
                className="nc-btn-ghost"
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="text-sm font-semibold text-white px-3 py-1 rounded-full bg-black/40 border border-white/10">
                  {selectedPlayer ? formattedTime : "05:00"}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleTurnResult(false)}
                    disabled={!selectedPlayer || !!turnOutcome}
                    className="rounded-full bg-red-500/80 text-white font-semibold px-4 py-2 text-sm uppercase tracking-wide shadow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-500"
                  >
                    Surrender
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTurnResult(true)}
                    disabled={!selectedPlayer || !turnDeadline || !!turnOutcome}
                    className="rounded-full bg-white text-slate-900 font-semibold px-4 py-2 text-sm uppercase tracking-wide shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Got It
                  </button>
                </div>
              </div>
            )}
          </div>
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
        // onPlayerSelected={setSelectedPlayer}
        // selectedPlayer={selectedPlayer}
        // players={players}
        // results={results}
        // roundCount={roundCount}
        // onAddPlayer={handleAddPlayer}
        // onRemovePlayer={handleRemovePlayer}
        // spinSignal={spinSignal}
        />
      </main>
      <footer
        className="w-full flex justify-center px-4 py-6 opacity-[.85] border-t border-[color:var(--color-border)]"
        style={staticBackgroundStyle}
      />
    </div>
  );
}
