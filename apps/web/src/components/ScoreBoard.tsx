import { Player } from "./PrizeWheel";

type RoundResult = boolean | null;

interface ScoreBoardProps {
  roundHeaders: string[];
  players: Player[];
  selectedPlayer: Player | null;
  results: RoundResult[][];
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  roundHeaders,
  players,
  selectedPlayer,
  results,
}) => {
    return (
         <div className="w-full flex-1 max-w-xl">
          <div className="text-center text-lg font-semibold uppercase tracking-wide text-white mb-3">
            Scoreboard
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-600 bg-[#1f1f1f]/60 shadow-lg">
            <table className="min-w-full text-sm text-white">
              <thead>
                <tr className="text-xs uppercase tracking-wider bg-slate-900/50">
                  <th className="px-4 py-3 text-left">Player/Round</th>
                  {roundHeaders.map((label) => (
                    <th key={label} className="px-3 py-3 text-center">
                      {label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, playerIdx) => {
                  const playerRounds =
                    results[playerIdx] ??
                    Array(roundHeaders.length).fill(null);
                  return (
                    <tr
                      key={player.name}
                      className={`border-t border-slate-700 ${
                        playerIdx % 2 === 0 ? "bg-black/10" : "bg-black/30"
                      }`}
                    >
                      <td
                        className="px-4 py-3 font-semibold"
                        style={{
                          backgroundColor:
                            selectedPlayer?.name === player.name
                              ? player.color
                              : undefined,
                        }}
                      >
                        {player.name}
                      </td>
                      {roundHeaders.map((_, roundIdx) => {
                        const value = playerRounds[roundIdx];
                        let symbol = "—";
                        let symbolClass = "text-slate-400";
                        if (value === true) {
                          symbol = "✓";
                          symbolClass = "text-green-400 text-lg";
                        } else if (value === false) {
                          symbol = "✕";
                          symbolClass = "text-red-400 text-lg";
                        }
                        return (
                          <td
                            key={`${player.name}-round-${roundIdx}`}
                            className="px-2 py-2 text-center font-semibold"
                          >
                            <span className={symbolClass}>{symbol}</span>
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-center font-semibold">
                        {playerRounds.reduce(
                          (sum, result) => sum + (result ? 1 : 0),
                          0
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
    )
}
