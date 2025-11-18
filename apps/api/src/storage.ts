import fs from "fs";
import path from "path";

type ThemeStore = Record<string, string[]>;

const DATA_DIR = path.resolve(__dirname, "../data");
const STORE_PATH = path.join(DATA_DIR, "challenge-history.json");

let storeCache: ThemeStore | null = null;

function loadStore(): ThemeStore {
  if (storeCache) return storeCache;
  try {
    const raw = fs.readFileSync(STORE_PATH, "utf8");
    storeCache = JSON.parse(raw) as ThemeStore;
  } catch {
    storeCache = {};
  }
  return storeCache;
}

function persist(store: ThemeStore) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

export function normalizePrompt(text: string) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export function getStoredPrompts(theme: string): string[] {
  const store = loadStore();
  return store[theme] ?? [];
}

export function rememberPrompts(theme: string, prompts: string[]) {
  if (!prompts.length) return;

  const store = loadStore();
  const existing = store[theme] ?? [];
  const existingNormalized = new Set(existing.map(normalizePrompt));

  const cleanNew: string[] = [];
  for (const prompt of prompts) {
    const trimmed = prompt.trim();
    if (!trimmed) continue;
    const normalized = normalizePrompt(trimmed);
    if (existingNormalized.has(normalized)) continue;
    existingNormalized.add(normalized);
    cleanNew.push(trimmed);
  }

  if (!cleanNew.length) return;

  store[theme] = [...existing, ...cleanNew];
  persist(store);
}
