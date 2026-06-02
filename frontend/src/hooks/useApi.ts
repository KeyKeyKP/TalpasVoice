import axios from "axios";
import { WorkEntry } from "../types";

const api = axios.create({ baseURL: "/api" });

export async function transcribeAudio(
  audioBlob: Blob,
  recordingDate: string
): Promise<{ text: string; date: string }> {
  const formData = new FormData();
  const ext = audioBlob.type.includes("webm")
    ? "webm"
    : audioBlob.type.includes("wav")
    ? "wav"
    : "webm";
  formData.append("audio", audioBlob, `recording.${ext}`);
  formData.append("recordingDate", recordingDate);

  const response = await api.post("/transcribe", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120000,
  });
  return response.data;
}

export async function extractEntries(
  text: string,
  defaultDate: string
): Promise<{ entries: WorkEntry[] }> {
  const response = await api.post(
    "/extract",
    { text, default_date: defaultDate },
    { timeout: 60000 }
  );
  // Add IDs to entries
  const entries = response.data.entries.map((e: any, i: number) => ({
    ...e,
    id: `entry-${Date.now()}-${i}`,
  }));
  return { entries };
}

export async function exportToExcel(entries: WorkEntry[]): Promise<void> {
  const response = await api.post(
    "/export",
    { entries },
    { responseType: "blob", timeout: 30000 }
  );

  const dateStr = new Date().toISOString().split("T")[0];
  const filename = `Izvoz_delo_${dateStr}.xlsx`;

  const url = URL.createObjectURL(
    new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function fetchEmployees(): Promise<string[]> {
  const response = await api.get("/employees");
  return response.data.employees;
}

export async function fetchClients(): Promise<string[]> {
  const response = await api.get("/clients");
  return response.data.clients;
}
