export interface WorkEntry {
  id: string;
  stranka: string;
  delo: string;
  datum: string;
  kontakt: string | null;
  stevilo_ur: number | null;
  opis: string | null;
  opravil: string;
}

export type AppStep = "record" | "transcript" | "review";

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
}
