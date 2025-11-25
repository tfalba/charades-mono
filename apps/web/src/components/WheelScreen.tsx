import React, { useMemo, useState } from "react";
import { Player, PrizeWheel } from "./PrizeWheel";
import { ScoreBoard } from "./ScoreBoard";

const players: Player[] = [
  { name: "Paul",    color: "#F97316" }, // orange
  { name: "Christy", color: "#8B5CF6" }, // purple
  { name: "Sasha",   color: "#0EA5E9" }, // blue
  { name: "Xavier",  color: "#FACC15" }, // yellow
  { name: "Gwen",    color: "#EC4899" }, // pink
  { name: "Owen",    color: "#22C55E" }, // green
];

const ROUNDS = 5;


interface WheelScreenProps {
  onPlayerSelected?: (player: Player | null) => void;
  selectedPlayer: (Player | null);
}

export const WheelScreen: React.FC<WheelScreenProps> = ({onPlayerSelected, selectedPlayer}) => {
   const [results, setResults] = useState<boolean[][]>(() =>
      players.map(() => Array(ROUNDS).fill(false))
    );
    const [winner, setWinner] = useState<Player | null>(selectedPlayer)
  const toggleResult = (playerIdx: number, roundIdx: number) => {
    setResults((prev) =>
      prev.map((playerRounds, idx) =>
        idx === playerIdx
          ? playerRounds.map((value, rIdx) =>
              rIdx === roundIdx ? !value : value
            )
          : playerRounds
      )
    );
  };

   const roundHeaders = useMemo(
      () => Array.from({ length: ROUNDS }, (_, index) => `${index + 1}`),
      []
    );
  
    return (
    <div className="min-h-auto flex gap-4 items-center justify-center bg-slate-900 text-white">
      <PrizeWheel
        players={players}
        onSpinEnd={onPlayerSelected}
      />
          <ScoreBoard
                roundHeaders={roundHeaders}
                players={players}
                selectedPlayer={selectedPlayer}
                results={results}
                toggleResult={toggleResult}
              />
    </div>
  );
};
