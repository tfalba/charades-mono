import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useGameContext } from "../context/GameContext";

export type Player = { name: string; color: string };

interface PrizeWheelProps {
  players: Player[];
  onSpinEnd?: (winner: Player) => void;
  size?: number; // optional: size in px
  spinSignal?: number;
}

export const PrizeWheel: React.FC<PrizeWheelProps> = ({
  players,
  onSpinEnd,
  size = 300,
  spinSignal = 0,
}) => {
  const { selectedPlayer } = useGameContext();
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
      const labelOuterRadius = radius * 0.85;
      const labelInnerRadius = radius * 0.32;
      const labelX =
        center +
        ((labelOuterRadius + labelInnerRadius) / 2) * Math.cos(midAngle);
      const labelY =
        center +
        ((labelOuterRadius + labelInnerRadius) / 2) * Math.sin(midAngle);
      const outerTextX = center + labelOuterRadius * Math.cos(midAngle);
      const outerTextY = center + labelOuterRadius * Math.sin(midAngle);
      const innerTextX = center + labelInnerRadius * Math.cos(midAngle);
      const innerTextY = center + labelInnerRadius * Math.sin(midAngle);
      const pathId = `slice-label-${index}`;
      const labelPath = `M ${outerTextX} ${outerTextY} L ${innerTextX} ${innerTextY}`;

      return {
        player,
        index,
        pathData,
        labelX,
        labelY,
        labelPath,
        pathId,
      };
    });
  }, [players, radius, center]);

  const spin = useCallback(() => {
    if (isSpinning || players.length === 0) return;
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
    const baseSpins = 8; // full rotations for drama
    const finalRotation = baseSpins * 360 + (POINTER_DEG - targetCenterDeg);

    setRotation(finalRotation);

    const durationMs = 2500; // keep in sync with CSS transition below
    window.setTimeout(() => {
      setIsSpinning(false);
      if (onSpinEnd) onSpinEnd({ ...players[targetIndex] });
      // reset rotation state so the next spin starts fresh
      setRotation((prev) => prev % 360);
      setWinnerIndex(null);
    }, durationMs);
  }, [isSpinning, onSpinEnd, players]);

  const winner = winnerIndex != null ? players[winnerIndex] : null;

  const lastSpinSignal = useRef(0);
  useEffect(() => {
    if (!spinSignal) return;
    if (spinSignal === lastSpinSignal.current) return;
    lastSpinSignal.current = spinSignal;
    spin();
  }, [spin, spinSignal]);

  return (
    <div className="flex flex-col flex-1 items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        {/* pointer */}
        {selectedPlayer && (
          <div className="absolute left-1/2 -top-4 -translate-x-1/2 z-20">
            <div className="w-0 h-0 border-l-8 border-r-8 border-b-[16px] border-l-transparent border-r-transparent border-b-nickBlack" />
          </div>
        )}

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
                ? "transform 2.5s cubic-bezier(0.22, 0.61, 0.36, 1)"
                : undefined,
            }}
          >
            <defs>
              {segments.map((seg) => (
                <path key={seg.pathId} id={seg.pathId} d={seg.labelPath} />
              ))}
            </defs>
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
                    fill="#ffffff"
                    fontSize={15}
                    textAnchor="start"
                    dominantBaseline="hanging"
                    style={{
                      fontWeight: isWinner ? 700 : 500,
                      textShadow:
                        "0 1px 2px rgba(0,0,0,0.45), 0 0 3px rgba(0,0,0,0.6)",
                    }}
                  >
                    <textPath
                      href={`#${seg.pathId}`}
                      startOffset="4%"
                      method="align"
                      spacing="auto"
                    >
                      {seg.player.name}
                    </textPath>
                  </text>
                </g>
              );
            })}

            {/* center circle */}
            <circle
              cx={center}
              cy={center}
              r={radius * 0.25}
              onClick={spin}
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
        disabled={isSpinning || players.length === 0}
        className="px-6 py-3 rounded-full bg-nickRust text-white font-semibold text-sm tracking-wide shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-nickBrown transition"
      >
        {isSpinning ? "Spinning…" : "Spin the Wheel"}
      </button>
    </div>
  );
};
