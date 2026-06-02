import { Router, Request, Response } from "express";
import { generateExcel } from "../services/excelService";
import { WorkEntry } from "../services/claudeService";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { entries } = req.body;

  if (!Array.isArray(entries) || entries.length === 0) {
    res.status(400).json({ error: "Manjka polje 'entries' ali je prazen" });
    return;
  }

  try {
    const buffer = await generateExcel(entries as WorkEntry[]);

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `Izvoz_delo_${dateStr}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`
    );
    res.setHeader("Content-Length", buffer.length);

    res.send(buffer);
  } catch (error: any) {
    console.error("Napaka pri generiranju Excel:", error);
    res.status(500).json({
      error: "Napaka pri generiranju Excel datoteke",
      details: error.message,
    });
  }
});

export default router;
