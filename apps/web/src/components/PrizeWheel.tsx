import React, { useMemo, useState } from "react";

export type Player = { name: string; color: string };

interface PrizeWheelProps {
  players: Player[];
  onSpinEnd?: (winner: Player) => void;
  size?: number; // optional: size in px
}

export const PrizeWheel: React.FC<PrizeWheelProps> = ({
  players,
  onSpinEnd,
  size = 300,
}) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);

  const radius = size / 2 - 10;
  const center = size / 2;

  // Precompute segment geometry
  const segments = useMemo(() => {
    const count = players.length;
    if (count === 0) return [];
    const sliceAngle = (2 * Math.PI) / count;

    return players.map((player, index) => {
      const startAngle = index * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const midAngle = startAngle + sliceAngle / 2;

      const x1 = center + radius * Math.cos(startAngle);
      const y1 = center + radius * Math.sin(startAngle);
      const x2 = center + radius * Math.cos(endAngle);
      const y2 = center + radius * Math.sin(endAngle);

      const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

      const pathData = [
        `M ${center} ${center}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        "Z",
      ].join(" ");

      // label position
      const labelRadius = radius * 0.6;
      const labelX = center + labelRadius * Math.cos(midAngle);
      const labelY = center + labelRadius * Math.sin(midAngle);

      return {
        player,
        index,
        pathData,
        labelX,
        labelY,
      };
    });
  }, [players, radius, center]);

  const spin = () => {
    if (isSpinning || players.length < 4) return;
    setIsSpinning(true);

    const count = players.length;
    const sliceDeg = 360 / count;

    // 1. pick a random winner index
    const targetIndex = Math.floor(Math.random() * players.length);
    setWinnerIndex(targetIndex);

    // 2. angle of the center of that segment (0deg is at 3 o'clock)
    const targetCenterDeg = targetIndex * sliceDeg + sliceDeg / 2;

    // 3. pointer is visually at the top (12 o'clock).
    // In our coordinate system (0deg = 3 o'clock, CCW positive),
    // top = -90deg.
    const POINTER_DEG = -90;

    // 4. compute a big spin that ends with the target center at the pointer
    const baseSpins = 5; // full rotations for drama
    const finalRotation =
      baseSpins * 360 + (POINTER_DEG - targetCenterDeg);

    setRotation(finalRotation);

    const durationMs = 3000; // keep in sync with CSS transition below
    window.setTimeout(() => {
      setIsSpinning(false);
      if (onSpinEnd) onSpinEnd(players[targetIndex]);
    }, durationMs);
  };

  const winner = winnerIndex != null ? players[winnerIndex] : null;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        {/* pointer */}
        <div className="absolute left-1/2 -top-4 -translate-x-1/2 z-20">
          <div className="w-0 h-0 border-l-8 border-r-8 border-b-[16px] border-l-transparent border-r-transparent border-b-nickBlack" />
        </div>

        {/* wheel */}
        <div className="w-full h-full rounded-full bg-nickCream shadow-2xl flex items-center justify-center">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="overflow-visible"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning
                ? "transform 3s cubic-bezier(0.22, 0.61, 0.36, 1)"
                : undefined,
            }}
          >
            {/* segments */}
            {segments.map((seg) => {
              const isWinner = seg.index === winnerIndex;
              return (
                <g key={seg.index}>
                  <path
                    d={seg.pathData}
                    fill={seg.player.color}
                    stroke="#ffffff"
                    strokeWidth={isWinner ? 4 : 2}
                    opacity={isWinner ? 1 : 0.9}
                  />
                  <text
                    x={seg.labelX}
                    y={seg.labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#ffffff"
                    fontSize={12}
                    style={{
                      fontWeight: isWinner ? 700 : 500,
                      textShadow:
                        "0 1px 2px rgba(0,0,0,0.45), 0 0 3px rgba(0,0,0,0.6)",
                    }}
                  >
                    {seg.player.name}
                  </text>
                </g>
              );
            })}

            {/* center circle */}
            <circle
              cx={center}
              cy={center}
              r={radius * 0.25}
              fill="#111827"
              stroke="#ffffff"
              strokeWidth={3}
            />
          </svg>
        </div>
      </div>

      <button
        type="button"
        onClick={spin}
        disabled={isSpinning || players.length < 4}
        className="px-6 py-3 rounded-full bg-nickRust text-white font-semibold text-sm tracking-wide shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-nickBrown transition"
      >
        {isSpinning ? "Spinning…" : "Spin the Wheel"}
      </button>

      {winner && !isSpinning && (
        <div className="mt-1 text-sm text-nickBlack">
          Winner:{" "}
          <span
            className="font-semibold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${winner.color}20`,
              border: `1px solid ${winner.color}`,
            }}
          >
            {winner.name}
          </span>
        </div>
      )}
    </div>
  );
};
