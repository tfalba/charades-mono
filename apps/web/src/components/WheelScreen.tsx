import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Player, PrizeWheel } from "./PrizeWheel";
import { ScoreBoard } from "./ScoreBoard";
import { useGameContext } from "../context/GameContext";

const COLOR_PALETTE = [
  { name: "Neon Coral", color: "#FF3B30" },
  { name: "Electric Cyan", color: "#00C2FF" },
  { name: "Laser Lime", color: "#7CFF6B" },
  { name: "Sunbeam", color: "#FEE440" },
  { name: "Magenta Pop", color: "#FF4DB8" },
  { name: "Ultraviolet", color: "#8B5CF6" },
];

type RoundResult = boolean | null;

interface WheelScreenProps {
  // onPlayerSelected?: (player: Player | null) => void;
  // selectedPlayer: Player | null;
  // players: Player[];
  // results: RoundResult[][];
  // roundCount: number;
  // onAddPlayer: (player: Player) => void;
  // onRemovePlayer: (index: number) => void;
  // spinSignal: number;
}

export const WheelScreen: React.FC<WheelScreenProps> = () => {
  const [newPlayerName, setNewPlayerName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0].color);
  const {
    handleAddPlayer,
    handleRemovePlayer,
    spinSignal,
    results,
    roundCount,
    players,
    handleClearRounds,
    handleClearPlayers,
    setSelectedPlayer,
    selectedPlayer,
  } = useGameContext();
  const [isPanelOpen, setIsPanelOpen] = useState(players.length === 0);

  const roundHeaders = useMemo(
    () => Array.from({ length: roundCount }, (_, index) => `${index + 1}`),
    [roundCount]
  );

  const addPlayer = useCallback(() => {
    const trimmed = newPlayerName.trim();
    if (!trimmed) return;
    handleAddPlayer({ name: trimmed, color: selectedColor });
    setNewPlayerName("");
  }, [handleAddPlayer, newPlayerName, selectedColor]);

  useEffect(() => {
    if (players.length === 0) {
      setIsPanelOpen(true);
    }
  }, [players.length]);

  return (
    <div className="relative flex flex-col gap-4 items-center justify-center text-white pt-2 pb-6">
      {players.length > 1 && (
        <div className="flex flex-wrap gap-6 items-start justify-center w-full">
          <div className="nc-panel flex flex-col items-center gap-4">
            <div className="text-xs uppercase tracking-[0.35em] text-white/60">
              Spin Order
            </div>
            <PrizeWheel
              players={players}
              onSpinEnd={setSelectedPlayer}
              spinSignal={spinSignal}
              size={250}
            />
          </div>

          <div className="flex flex-col gap-4 w-full max-w-xl">
            <ScoreBoard
              roundHeaders={roundHeaders}
              players={players}
              selectedPlayer={selectedPlayer}
              results={results}
            />
            <div className="w-full flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setIsPanelOpen(true)}
                className="nc-btn-ghost"
              >
                Manage Players
              </button>
              <button
                type="button"
                onClick={() => handleClearRounds()}
                className="nc-btn-ghost"
              >
                Clear Rounds
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          isPanelOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isPanelOpen}
        onClick={() => {
          if (players.length >= 2) {
            setIsPanelOpen(false);
          }
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-full max-w-sm bg-[color:var(--color-surface)] text-white shadow-2xl transition-transform duration-300 ${
          isPanelOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[color:var(--color-border)]">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-white/60">
              Player Setup
            </p>
            <h2 className="text-2xl font-semibold">Create Your Team</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsPanelOpen(false)}
            disabled={players.length < 2}
            className="nc-btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Done
          </button>
        </div>

        <div className="h-full overflow-y-auto px-5 py-4 space-y-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/60 mb-2">
              Current Players
            </p>
            {players.length === 0 ? (
              <p className="text-sm text-white/60">
                Add players to begin spinning the wheel.
              </p>
            ) : (
              <ul className="space-y-2">
                {players.map((player, idx) => (
                  <li
                    key={`${player.name}-${idx}`}
                    className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2 border border-white/10"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemovePlayer(idx)}
                      className="text-lg text-white/80 hover:text-white transition"
                      aria-label={`Remove ${player.name}`}
                    >
                      ×
                    </button>
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: player.color }}
                    />
                    <span className="font-semibold">{player.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div
            className="space-y-3"
            onKeyDown={(e) => {
              if (e.key === "Enter" && newPlayerName.trim()) {
                e.preventDefault();
                addPlayer();
              }
            }}
          >
            <p className="text-xs uppercase tracking-wide text-white/60">
              Add Player
            </p>
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Player name"
              className="nc-input"
            />
            <div>
              <p className="text-xs uppercase tracking-wide text-white/60 mb-2">
                Choose a Color
              </p>
              <div className="flex flex-wrap gap-2">
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color.color}
                    type="button"
                    onClick={() => setSelectedColor(color.color)}
                    className={`w-10 h-10 rounded-full border-2 transition ${
                      selectedColor === color.color
                        ? "border-white scale-105"
                        : "border-transparent opacity-70"
                    }`}
                    style={{ backgroundColor: color.color }}
                    aria-label={color.name}
                  />
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={addPlayer}
              disabled={!newPlayerName.trim()}
              className="w-full rounded-xl bg-[color:var(--color-secondary)] text-black font-semibold py-3 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to List
            </button>
            <button
              type="button"
              onClick={handleClearPlayers}
              disabled={players.length === 0}
              className="w-full rounded-full border border-white/20 text-white text-xs py-2 uppercase tracking-wide hover:bg-white/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Clear All Players
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};
