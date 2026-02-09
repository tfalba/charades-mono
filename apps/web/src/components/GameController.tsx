import {
  type CSSProperties,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  TOPIC_INFO,
  TOPIC_LIST,
  type Difficulty,
  type Topic,
} from "@charades/shared";
import { useGameContext } from "../context/GameContext";

export function GameController() {
  const {
    topic,
    difficulty,
    handleTopicChange,
    setDifficulty,
    fetchPrompts,
    loading,
    selectedPlayer,
    prompts,
  } = useGameContext();

  const topicDropdownRef = useRef<HTMLDivElement | null>(null);
  const difficultyDropdownRef = useRef<HTMLDivElement | null>(null);
  const [isTopicMenuOpen, setIsTopicMenuOpen] = useState(false);
  const [isDifficultyMenuOpen, setIsDifficultyMenuOpen] = useState(false);
  const topicTheme = TOPIC_INFO[topic];
  const accentColor = topicTheme.color;
  const selectAccentStyle = { "--accent-color": accentColor } as CSSProperties;
  const isSelectionLocked = loading || prompts.length > 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const targetNode = event.target as Node;
      if (
        topicDropdownRef.current &&
        !topicDropdownRef.current.contains(targetNode)
      ) {
        setIsTopicMenuOpen(false);
      }
      if (
        difficultyDropdownRef.current &&
        !difficultyDropdownRef.current.contains(targetNode)
      ) {
        setIsDifficultyMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isSelectionLocked) return;
    setIsTopicMenuOpen(false);
    setIsDifficultyMenuOpen(false);
  }, [isSelectionLocked]);

  const onTopicSelect = (nextTopic: Topic) => {
    handleTopicChange(nextTopic);
    setIsTopicMenuOpen(false);
  };

  const onDifficultySelect = (level: Difficulty) => {
    setDifficulty(level);
    setIsDifficultyMenuOpen(false);
  };

  return (
    <section className="nc-panel">
      <div className="grid gap-3 grid-cols-[1fr,1fr]">
        <div className="theme-select-wrapper" ref={topicDropdownRef}>
          <button
            type="button"
            className={`theme-select flex items-center justify-between gap-3 ${
              isSelectionLocked ? "cursor-not-allowed opacity-60" : ""
            }`}
            style={{
              ...selectAccentStyle,
              boxShadow: "0 10px 24px rgba(0, 0, 0, 0.35)",
            }}
            onClick={() => {
              if (isSelectionLocked) return;
              setIsTopicMenuOpen((open) => !open);
            }}
            disabled={isSelectionLocked}
            aria-disabled={isSelectionLocked}
          >
            <span className="flex items-center gap-3 text-left">
              <span
                className="h-3 w-3 rounded-full border border-white/20"
                style={{ backgroundColor: accentColor }}
              />
              <span className="font-semibold tracking-wide">
                {topicTheme.label}
              </span>
            </span>
            <svg
              className={`transition-transform duration-150 ${
                isTopicMenuOpen ? "rotate-180" : ""
              }`}
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {isTopicMenuOpen && (
            <div className="absolute z-40 -mt-16 w-full rounded-2xl border border-[color:var(--color-border)] bg-[#0b0d17]/95 shadow-2xl backdrop-blur">
              <ul className="max-h-[20rem] overflow-auto py-2">
                {TOPIC_LIST.map((t) => (
                  <li key={t.key}>
                    <button
                      type="button"
                      onClick={() => onTopicSelect(t.key as Topic)}
                      className={`flex w-full items-center justify-between ml-4 px-4 py-3 text-left text-sm font-semibold transition ${
                        topic === t.key
                          ? "bg-white/15 text-white"
                          : "text-slate-200 hover:bg-white/10"
                      }`}
                      style={{
                        borderLeft: `12px solid ${TOPIC_INFO[t.key].color}`,
                      }}
                    >
                      <span>{t.label}</span>
                      {topic === t.key && (
                        <span className="flex items-center gap-2 text-white/80 text-xs pr-4">
                          <input
                            type="checkbox"
                            checked
                            readOnly
                            className="accent-white w-4 h-4"
                            aria-label={`${t.label} selected`}
                          />
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="theme-select-wrapper" ref={difficultyDropdownRef}>
          <button
            type="button"
            className={`theme-select flex items-center justify-between gap-3 ${
              isSelectionLocked ? "cursor-not-allowed opacity-60" : ""
            }`}
            style={{
              ...selectAccentStyle,
              boxShadow: "0 10px 24px rgba(0, 0, 0, 0.35)",
            }}
            onClick={() => {
              if (isSelectionLocked) return;
              setIsDifficultyMenuOpen((open) => !open);
            }}
            disabled={isSelectionLocked}
            aria-disabled={isSelectionLocked}
          >
            <span className="font-semibold tracking-wide">{difficulty}</span>
            <svg
              className={`transition-transform duration-150 ${
                isDifficultyMenuOpen ? "rotate-180" : ""
              }`}
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {isDifficultyMenuOpen && (
            <div className="absolute z-40 -mt-16 w-full rounded-2xl border border-[color:var(--color-border)] bg-[#0b0d17]/95 shadow-2xl backdrop-blur">
              <ul className="max-h-64 overflow-auto py-2">
                {["Easy", "Medium", "Hard"].map((level) => (
                  <li key={level}>
                    <button
                      type="button"
                      onClick={() => onDifficultySelect(level as Difficulty)}
                      className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold transition ${
                        difficulty === level
                          ? "bg-white/15 text-white"
                          : "text-slate-200 hover:bg-white/5"
                      }`}
                    >
                      <span>{level}</span>
                      {difficulty === level && (
                        <span className="flex items-center gap-2 text-white/80 text-xs">
                          <input
                            type="checkbox"
                            checked
                            readOnly
                            className="accent-white w-4 h-4"
                            aria-label={`${level} difficulty selected`}
                          />
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
