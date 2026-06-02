import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { transcribeAudio } from "../services/whisperService";

const router = Router();

const UPLOAD_DIR = path.join(__dirname, "../../uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".webm";
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "audio/webm",
      "audio/wav",
      "audio/mpeg",
      "audio/mp4",
      "audio/ogg",
      "audio/flac",
      "audio/x-wav",
      "audio/wave",
      "video/webm", // browsers sometimes send webm as video
    ];
    if (allowed.includes(file.mimetype) || file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error(`Nepodprt format datoteke: ${file.mimetype}`));
    }
  },
});

router.post("/", upload.single("audio"), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: "Ni audio datoteke" });
    return;
  }

  const filePath = req.file.path;

  try {
    const text = await transcribeAudio(filePath);

    // Use recording date from request or current date
    const recordingDate =
      (req.body.recordingDate as string) ||
      new Date().toLocaleDateString("sl-SI", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

    res.json({ text, date: recordingDate });
  } catch (error: any) {
    console.error("Napaka pri transkripciji:", error);
    res.status(500).json({
      error: "Napaka pri transkripciji zvoka",
      details: error.message,
    });
  } finally {
    // Always delete the uploaded file
    fs.unlink(filePath, (err) => {
      if (err) console.error("Napaka pri brisanju datoteke:", err);
    });
  }
});

export default router;
