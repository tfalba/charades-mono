"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePrompt = normalizePrompt;
exports.getStoredPrompts = getStoredPrompts;
exports.rememberPrompts = rememberPrompts;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DATA_DIR = path_1.default.resolve(__dirname, "../data");
const STORE_PATH = path_1.default.join(DATA_DIR, "challenge-history.json");
let storeCache = null;
function loadStore() {
    if (storeCache)
        return storeCache;
    try {
        const raw = fs_1.default.readFileSync(STORE_PATH, "utf8");
        storeCache = JSON.parse(raw);
    }
    catch {
        storeCache = {};
    }
    return storeCache;
}
function persist(store) {
    fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
    fs_1.default.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}
function normalizePrompt(text) {
    return text.toLowerCase().replace(/\s+/g, " ").trim();
}
function getStoredPrompts(theme) {
    const store = loadStore();
    return store[theme] ?? [];
}
function rememberPrompts(theme, prompts) {
    if (!prompts.length)
        return;
    const store = loadStore();
    const existing = store[theme] ?? [];
    const existingNormalized = new Set(existing.map(normalizePrompt));
    const cleanNew = [];
    for (const prompt of prompts) {
        const trimmed = prompt.trim();
        if (!trimmed)
            continue;
        const normalized = normalizePrompt(trimmed);
        if (existingNormalized.has(normalized))
            continue;
        existingNormalized.add(normalized);
        cleanNew.push(trimmed);
    }
    if (!cleanNew.length)
        return;
    store[theme] = [...existing, ...cleanNew];
    persist(store);
}
