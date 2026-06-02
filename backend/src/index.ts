import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import transcribeRouter from "./routes/transcribe";
import extractRouter from "./routes/extract";
import exportRouter from "./routes/export";
import { EMPLOYEES } from "./config/employees";

dotenv.config({ path: require("path").join(__dirname, "../../.env") });

const app = express();
const PORT = process.env.PORT || 3001;

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: "Preveč zahtev, poskusite pozneje" },
});
app.use("/api", limiter);

// Routes
app.use("/api/transcribe", transcribeRouter);
app.use("/api/extract", extractRouter);
app.use("/api/export", exportRouter);

app.get("/api/employees", (_req, res) => {
  res.json({ employees: EMPLOYEES });
});

// Clients endpoint - returns known clients (can be extended with DB)
app.get("/api/clients", (_req, res) => {
  res.json({ clients: [] });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Global error handler
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Napaka strežnika:", err);
    res.status(500).json({ error: "Interna napaka strežnika" });
  }
);

app.listen(PORT, () => {
  console.log(`Talpas Voice Timesheet backend teče na portu ${PORT}`);
  console.log(`OpenAI API: ${process.env.OPENAI_API_KEY ? "✓" : "✗ MANJKA"}`);
  console.log(
    `Anthropic API: ${process.env.ANTHROPIC_API_KEY ? "✓" : "✗ MANJKA"}`
  );
});

export default app;
