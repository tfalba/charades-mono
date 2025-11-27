import React, { useEffect, useMemo, useState } from "react";
import { Player, PrizeWheel } from "./PrizeWheel";
import { ScoreBoard } from "./ScoreBoard";

const COLOR_PALETTE = [
  { name: "Orange", color: "#F97316" },
  { name: "Purple", color: "#8B5CF6" },
  { name: "Blue", color: "#0EA5E9" },
  { name: "Yellow", color: "#FACC15" },
  { name: "Pink", color: "#EC4899" },
  { name: "Green", color: "#22C55E" },
];

type RoundResult = boolean | null;

interface WheelScreenProps {
  onPlayerSelected?: (player: Player | null) => void;
  selectedPlayer: Player | null;
  players: Player[];
  results: RoundResult[][];
  roundCount: number;
  onAddPlayer: (player: Player) => void;
  onRemovePlayer: (index: number) => void;
  spinSignal: number;
}

export const WheelScreen: React.FC<WheelScreenProps> = ({
  onPlayerSelected,
  selectedPlayer,
  players,
  results,
  roundCount,
  onAddPlayer,
  onRemovePlayer,
  spinSignal,
}) => {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0].color);

  const roundHeaders = useMemo(
    () => Array.from({ length: roundCount }, (_, index) => `${index + 1}`),
    [roundCount]
  );

  const handleAddPlayer = () => {
    const trimmed = newPlayerName.trim();
    if (!trimmed) return;

    onAddPlayer({ name: trimmed, color: selectedColor });
    setNewPlayerName("");
  };

  const handleRemovePlayer = (index: number) => {
    onRemovePlayer(index);
  };

  useEffect(() => {
    if (players.length === 0) {
      setIsPanelOpen(true);
    }
  }, [players.length]);

  return (
    <div className="relative min-h-auto flex flex-col gap-4 items-center justify-center bg-midnight/80 text-white py-6">
     
      <div className="flex flex-wrap gap-4 items-start justify-center w-full px-4">
        <PrizeWheel
          players={players}
          onSpinEnd={onPlayerSelected}
          spinSignal={spinSignal}
          size={250}
        />
        <div className="flex flex-col gap-4">
        <ScoreBoard
          roundHeaders={roundHeaders}
          players={players}
          selectedPlayer={selectedPlayer}
          results={results}
        />
         <div className="w-full flex justify-end px-4">
        <button
          type="button"
          onClick={() => setIsPanelOpen(true)}
          className="px-4 py-2 rounded-full bg-white/10 border border-white/30 text-xs uppercase tracking-wide hover:bg-white/20 transition shadow"
        >
          Manage Players
        </button>
      </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          isPanelOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isPanelOpen}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-full max-w-sm bg-[#1a1a1d] text-white shadow-2xl transition-transform duration-300 ${
          isPanelOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-white/60">
              Player Setup
            </p>
            <h2 className="text-2xl font-semibold">Create Your Team</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsPanelOpen(false)}
            disabled={players.length === 0}
            className="px-3 py-1 rounded-full border border-white/40 text-xs uppercase tracking-wide hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
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

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wide text-white/60">
              Add Player
            </p>
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Player name"
              className="w-full rounded-2xl border border-white/20 bg-black/30 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
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
              onClick={handleAddPlayer}
              disabled={!newPlayerName.trim()}
              className="w-full rounded-xl bg-white text-black font-semibold py-3 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to List
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};
