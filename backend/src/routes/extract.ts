import { Router, Request, Response } from "express";
import { extractWorkEntries } from "../services/claudeService";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { text, default_date } = req.body;

  if (!text || typeof text !== "string") {
    res.status(400).json({ error: "Manjka polje 'text'" });
    return;
  }

  const defaultDate =
    default_date ||
    new Date().toLocaleDateString("sl-SI", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  try {
    const entries = await extractWorkEntries(text, defaultDate);
    res.json({ entries });
  } catch (error: any) {
    console.error("Napaka pri ekstrakciji:", error);
    res.status(500).json({
      error: "Napaka pri ekstrakciji podatkov",
      details: error.message,
    });
  }
});

export default router;
