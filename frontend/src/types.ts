export interface WorkEntry {
  id: string;
  opis_dela: string;
  stranka: string;
  kontakt: string | null;
  vrsta_prijave: string | null;
  datum: string;
  stevilo_ur: number | null;
  obisk: string | null;
  dostop_osebni_podatki: string | null;
  podroben_opis: string | null;
  opravil: string;
  vrsta_elementa: string | null;
  pot: string | null;
}

export type AppStep = "record" | "transcript" | "review";

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
}
