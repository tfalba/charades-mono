import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { Difficulty, Topic } from "@charades/shared";
import { getChallenge } from "../api";
import type { Player } from "../components/PrizeWheel";

const ROUNDS = 5;
const TURN_DURATION_MS = 5 * 60 * 1000;
type RoundResult = boolean | null;
type TurnOutcome = "success" | "fail" | null;
const PLAYERS_STORAGE_KEY = "charades.players";

const getSafeStorage = () => {
  if (typeof window === "undefined") return null;
  try {
    if (!("localStorage" in window)) return null;
    return window.localStorage;
  } catch {
    return null;
  }
};

interface GameContextValue {
  topic: Topic;
  difficulty: Difficulty;
  prompts: string[];
  loading: boolean;
  idx: number;
  hasAlternatePrompt: boolean;
  selectedPlayer: Player | null;
  players: Player[];
  results: RoundResult[][];
  turnDeadline: number | null;
  turnOutcome: TurnOutcome;
  formattedTime: string;
  spinSignal: number;
  canRequestSpin: boolean;
  roundCount: number;
  fetchPrompts: () => Promise<void>;
  handleAddPlayer: (player: Player) => void;
  handleRemovePlayer: (index: number) => void;
  handleTurnResult: (didWin: boolean) => void;
  handleClearRounds: () => void;
  handleClearPlayers: () => void;
  getAlternate: () => void;
  requestSpin: () => void;
  handleTopicChange: (topic: Topic) => void;
  setDifficulty: Dispatch<SetStateAction<Difficulty>>;
  setSelectedPlayer: Dispatch<SetStateAction<Player | null>>;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
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
  const [turnOutcome, setTurnOutcome] = useState<TurnOutcome>(null);
  const [spinSignal, setSpinSignal] = useState(0);

  const resetRoundState = useCallback(() => {
    setSelectedPlayer(null);
    setPrompts([]);
    setIdx(0);
    setTurnDeadline(null);
    setTimeRemainingMs(TURN_DURATION_MS);
    setTurnOutcome(null);
  }, []);

  const fetchPrompts = useCallback(async () => {
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
  }, [topic, difficulty]);

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
    if (prompts.length === 0 || idx >= prompts.length - 1) return;
    setIdx((prev) => prev + 1);
    setTurnDeadline((prev) => (prev ? prev - 30_000 : prev));
    setTimeRemainingMs((prev) => Math.max(0, prev - 30_000));
  }, [idx, prompts.length]);

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
    if (players.length === 0) return;
    setSpinSignal((prev) => prev + 1);
  }, [players.length]);

  const handleClearRounds = useCallback(() => {
    setResults((prev) => prev.map(() => Array(ROUNDS).fill(null)));
    resetRoundState();
  }, [resetRoundState]);

  const handleClearPlayers = useCallback(() => {
    setPlayers([]);
    setResults([]);
    resetRoundState();
  }, [resetRoundState]);

  useEffect(() => {
    const storage = getSafeStorage();
    if (!storage) return;
    const stored = storage.getItem(PLAYERS_STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as Player[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setPlayers(parsed);
        setResults(parsed.map(() => Array(ROUNDS).fill(null)));
      }
    } catch {
      storage.removeItem(PLAYERS_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const storage = getSafeStorage();
    if (!storage) return;
    if (players.length === 0) {
      storage.removeItem(PLAYERS_STORAGE_KEY);
    } else {
      try {
        storage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(players));
      } catch {
        storage.removeItem(PLAYERS_STORAGE_KEY);
      }
    }
  }, [players]);

  const handleTopicChange = useCallback((nextTopic: Topic) => {
    setPrompts([]);
    setTopic(nextTopic);
  }, []);

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
  const hasAlternatePrompt = prompts.length > 0 && idx < prompts.length - 1;

  const value = useMemo<GameContextValue>(
    () => ({
      topic,
      difficulty,
      prompts,
      loading,
      idx,
      hasAlternatePrompt,
      selectedPlayer,
      players,
      results,
      turnDeadline,
      turnOutcome,
      formattedTime,
      spinSignal,
      canRequestSpin,
      roundCount: ROUNDS,
      fetchPrompts,
      handleAddPlayer,
      handleRemovePlayer,
      handleTurnResult,
      handleClearRounds,
      handleClearPlayers,
      getAlternate,
      requestSpin,
      handleTopicChange,
      setDifficulty,
      setSelectedPlayer,
    }),
    [
      topic,
      difficulty,
      prompts,
      loading,
      idx,
      hasAlternatePrompt,
      selectedPlayer,
      players,
      results,
      turnDeadline,
      turnOutcome,
      formattedTime,
      spinSignal,
      canRequestSpin,
      fetchPrompts,
      handleAddPlayer,
      handleRemovePlayer,
      handleTurnResult,
      handleClearRounds,
      handleClearPlayers,
      getAlternate,
      requestSpin,
      handleTopicChange,
      setDifficulty,
      setSelectedPlayer,
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
}
