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
    <div className="min-h-dvh header-gradient flex flex-col justify-between">
      <header
        className="text-white min-h-[12vh] bg-[#231515]"
        style={staticBackgroundStyle}
      >
        <div className="relative mx-auto max-w-3xl px-4 py-1 gap-4 flex justify-center items-center">
          <h1 className="text-[min(9vw,15vh,60px)] font-italic font-bold">
            Charades
          </h1>
          <img
            className="w-full max-w-[145px] rounded-xl shadow-lg"
            alt="logo"
            src={logo}
          />
          <button
            type="button"
            onClick={() => setStaticMotionDisabled((prev) => !prev)}
            className="absolute top-[8vh] right-0 text-xs tracking-wide uppercase bg-black/60 text-white px-4 py-2 rounded-full border border-white/30 shadow-md hover:bg-black/70 transition"
            aria-pressed={staticMotionDisabled}
          >
            {staticMotionDisabled ? "Enable Static" : "Disable Static"}
          </button>
        </div>
        {!user && <LoginButton />}
        {user && (<div>Welcome back!</div>)}
        {authLoading && <div>Loading...</div>}
        {user && <LogoutButton />}
      </header>

      <main
        className="flex flex-col gap-4 rounded-xl mx-2 md:mx-auto max-w-3xl min-h-[100vh] p-4 space-y-2 min-w-[min(70vw,700px)] my-4 lg:my-6"
        style={{ backgroundColor: `${accentColor}15` }}
      >
        <GameController />

        <section
          className="card border-4 mb-0 relative overflow-hidden"
          style={{ borderColor: accentColor }}
        >
          <div className="flex justify-between items-center gap-2 text-sm text-slate-600 mb-4 sm:mb-0">
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
            <span className="text-xs font-semibold text-white">
              Difficulty: {difficulty}
            </span>
          </div>
          {prompts.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-8 space-y-4">
              {(() => {
                const primaryDisabled =
                  loading || (!selectedPlayer && players.length === 0);
                const actionClass = primaryDisabled
                  ? "bg-white/20 text-white/60 cursor-not-allowed border-white/20"
                  : "bg-white/10 text-white border-white/30 hover:bg-white/20";
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
                        : "Spin the Wheel"}
                  </button>
                );
              })()}
              <div className="flex justify-center">
                <img
                  src={TOPIC_LOGOS[topic] ?? logo}
                  alt="Loading"
                  className={`h-32 w-36 opacity-90 ${loading && "logo-spin"}`}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full py-8 space-y-4">
              <div className="space-y-4 flex-1 flex flex-col items-center justify-center text-center">
                {!loading ? (
                  <>
                    <div className="flex flex-col items-center justify-center">
                      <img
                        src={TOPIC_LOGOS[topic] ?? logo}
                        alt="Loading"
                        className={`h-32 w-36 opacity-90 ${loading && "logo-spin"}`}
                      />
                      <p className="text-2xl  mt-4 text-white font-semibold px-2">
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="text-sm font-semibold text-white px-3 py-1 rounded-full bg-slate-900/70 border border-white/10">
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
        className="bg-[#231515] w-full flex justify-center px-4 py-6 opacity-[.8]"
        style={staticBackgroundStyle}
      />
    </div>
  );
}
