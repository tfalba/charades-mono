"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = require("./routes");
const app = (0, express_1.default)();
const allowList = process.env.CORS_ALLOWED_ORIGINS?.split(",").map((origin) => origin.trim()).filter(Boolean) ?? [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "http://charades.local:5173",
];
app.use((0, cors_1.default)({ origin: allowList }));
app.use(express_1.default.json());
app.use("/api", routes_1.router);
const port = Number(process.env.PORT || 8000);
app.listen(port, "127.0.0.1", () => {
    console.log(`API listening on http://127.0.0.1:${port}`);
});
