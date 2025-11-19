import React, { useState } from "react";

export type Player = { name: string; color: string };

const players: Player[] = [
  { name: "Paul",    color: "#F97316" }, // orange
  { name: "Christy", color: "#8B5CF6" }, // purple
  { name: "Sasha",   color: "#0EA5E9" }, // blue
  { name: "Xavier",  color: "#FACC15" }, // yellow
  { name: "Gwen",    color: "#EC4899" }, // pink
  { name: "Owen",    color: "#22C55E" }, // green
];

// CSS: 0deg = 3 o'clock, 90 = bottom, 180 = left, 270 = top
const POINTER_ANGLE =180;
const SPINS = 5;

interface GameWheelProps {
  onPlayerSelected?: (player: Player | null) => void;
}

export const GameWheel: React.FC<GameWheelProps> = ({ onPlayerSelected }) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // depends on current number of players, so compute inside component
  const sliceAngle = 360 / players.length;
  // orient wheel so slice 0 is centered under the pointer when rotation = 0
  const baseAngle = POINTER_ANGLE - sliceAngle / 2;

  const handleSpin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setSelectedIndex(null);
    onPlayerSelected?.(null);

    // 1) choose the winner first so logic is always right
    const targetIndex = Math.floor(Math.random() * players.length);

    // 2) current normalized rotation
    const current = ((rotation % 360) + 360) % 360;

    // 3) center angle of the chosen slice, including base orientation
    const targetCenter =
      baseAngle + targetIndex * sliceAngle + sliceAngle / 2;

    // 4) how much more we need to rotate so that:
    //    targetCenter + current + extraRotation ≡ POINTER_ANGLE (mod 360)
    const jitter = (Math.random() - 0.5) * sliceAngle * 0.4; // small randomness within slice
    const offsetToAlign =
      POINTER_ANGLE - targetCenter - current + jitter;

    const extraRotation = SPINS * 360 + offsetToAlign;
    const newRotation = rotation + extraRotation;

    setRotation(newRotation);

    window.setTimeout(() => {
      setSelectedIndex(targetIndex);
      setIsSpinning(false);
      onPlayerSelected?.(players[targetIndex]);
    }, 5000);
  };

  const gradientBackground = `conic-gradient(
    from ${baseAngle}deg,
    ${players
      .map((p, i) => {
        const start = i * sliceAngle;
        const end = (i + 1) * sliceAngle;
        return `${p.color} ${start}deg ${end}deg`;
      })
      .join(", ")}
  )`;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-72 h-72">
        {/* Arrow at top */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-30">
          <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-slate-900" />
        </div>

        {/* Spinning wheel */}
        <div
          className="absolute inset-0 rounded-full shadow-xl border border-slate-300 overflow-hidden transition-transform duration-[5000ms] ease-out"
          style={{
            transform: `rotate(${rotation}deg)`,
            backgroundImage: gradientBackground,
          }}
        >
          {/* Labels */}
          {players.map((player, index) => {
            const sliceCenter =
              baseAngle + index * sliceAngle + sliceAngle / 2;
            const isSelected = selectedIndex === index;

            return (
              <div
                key={player.name}
                className="absolute inset-0 origin-center pointer-events-none"
                style={{ transform: `rotate(${sliceCenter}deg)` }}
              >
                <div className="absolute bottom-[13%] left-1/2 -translate-x-1/2">
                  <div
                    className={`
                      font-extrabold text-[18px] text-white whitespace-nowrap
                      drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]
                      ${
                        isSelected
                          ? "text-yellow-300 drop-shadow-[0_0_8px_rgba(0,0,0,0.9)] scale-105"
                          : ""
                      }
                    `}
                    style={{ transform: `rotate(${-sliceCenter}deg)` }}
                  >
                    {player.name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Center button */}
        <button
          type="button"
          onClick={handleSpin}
          disabled={isSpinning}
          className="absolute inset-0 m-auto w-24 h-24 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-semibold shadow-md border border-slate-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 active:scale-95 transition-transform z-40"
        >
          Tap to Spin
        </button>
      </div>

      <div className="text-center">
        {selectedIndex !== null ? (
          <div className="text-lg uppercase tracking-[0.25em] text-slate-100">
            {players[selectedIndex].name}
          </div>
        ) : (
          <div className="text-sm text-slate-500">
            Tap the wheel to pick a player
          </div>
        )}
      </div>
    </div>
  );
};
