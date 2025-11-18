import "dotenv/config";
import express from "express";
import cors from "cors";
import { router } from "./routes";

const app = express();

app.use(cors({
  origin: ["http://127.0.0.1:5173", "http://charades.local:5173"]
}));
app.use(express.json());
app.use("/api", router);

const port = Number(process.env.PORT || 8000);
app.listen(port, "127.0.0.1", () => {
  console.log(`API listening on http://127.0.0.1:${port}`);
});
