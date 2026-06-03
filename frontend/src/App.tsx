import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Download, Loader2, ArrowLeft, ArrowRight, FileSpreadsheet } from "lucide-react";
import { AppStep, WorkEntry } from "./types";
import { StepWizard } from "./components/StepWizard";
import { EmployeeSelector } from "./components/EmployeeSelector";
import { AudioRecorder } from "./components/AudioRecorder";
import { TranscriptEditor } from "./components/TranscriptEditor";
import { DataTable } from "./components/DataTable";
import {
  transcribeAudio,
  extractEntries,
  exportToExcel,
  fetchEmployees,
  fetchClients,
} from "./hooks/useApi";

export default function App() {
  const [step, setStep] = useState<AppStep>("record");
  const [completedSteps, setCompletedSteps] = useState<Set<AppStep>>(new Set());
  const [employees, setEmployees] = useState<string[]>([]);
  const [clients, setClients] = useState<string[]>([]);
  const [currentEmployee, setCurrentEmployee] = useState<string>("");

  // Step 1 state
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Step 2 state
  const [transcript, setTranscript] = useState("");
  const [recordingDate, setRecordingDate] = useState(
    new Date().toLocaleDateString("sl-SI", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  );
  const [isExtracting, setIsExtracting] = useState(false);

  // Step 3 state
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchEmployees()
      .then(setEmployees)
      .catch(() => console.warn("Ni mogoče naložiti seznama zaposlenih"));
    fetchClients()
      .then(setClients)
      .catch(() => {});
  }, []);

  const markCompleted = (s: AppStep) => {
    setCompletedSteps((prev) => new Set([...prev, s]));
  };

  const handleAudioReady = async (blob: Blob, date: string) => {
    setIsTranscribing(true);
    setRecordingDate(date);
    const toastId = toast.loading("Transkripcija v teku...");

    try {
      const result = await transcribeAudio(blob, date);
      setTranscript(result.text);
      if (result.date) setRecordingDate(result.date);
      markCompleted("record");
      setStep("transcript");
      toast.success("Transkripcija uspešna!", { id: toastId });
    } catch (err: any) {
      const msg =
        err?.response?.data?.details ||
        err?.response?.data?.error ||
        "Napaka pri transkripciji";
      toast.error(msg, { id: toastId });
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleExtract = async () => {
    if (!transcript.trim()) return;
    setIsExtracting(true);
    const toastId = toast.loading("Ekstrakcija podatkov...");

    try {
      const result = await extractEntries(transcript, recordingDate);
      // Auto-fill opravil with current employee if empty
      const filled = result.entries.map((e) => ({
        ...e,
        opravil: e.opravil || currentEmployee,
      }));
      setEntries(filled);
      markCompleted("transcript");
      setStep("review");
      toast.success(
        `Ekstrahiranih ${filled.length} vnos${filled.length === 1 ? "" : filled.length < 5 ? "i" : "ov"}`,
        { id: toastId }
      );
    } catch (err: any) {
      const msg =
        err?.response?.data?.details ||
        err?.response?.data?.error ||
        "Napaka pri ekstrakciji";
      toast.error(msg, { id: toastId });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleExport = async () => {
    // Validate required fields
    const invalid = entries.filter(
      (e) => !e.stranka || !e.opis_dela || !e.datum || !e.opravil || e.stevilo_ur === null
    );
    if (invalid.length > 0) {
      toast.error(
        `${invalid.length} vnos${invalid.length === 1 ? " ima" : "i imajo"} nepopolne obvezne podatke (STRANKA, Opis dela, Datum, Število ur, Opravil)`
      );
      return;
    }

    setIsExporting(true);
    const toastId = toast.loading("Generiranje Excel datoteke...");

    try {
      await exportToExcel(entries);
      toast.success("Excel datoteka je bila prenesena!", { id: toastId });
    } catch (err: any) {
      const msg =
        err?.response?.data?.error || "Napaka pri generiranju Excel datoteke";
      toast.error(msg, { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const handleNewRecording = () => {
    setTranscript("");
    setEntries([]);
    setCompletedSteps(new Set());
    setStep("record");
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileSpreadsheet size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-100 leading-none">
                Glasovni Diktafon
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Talpas — vnos opravljenega dela
              </p>
            </div>
          </div>

          {/* Employee selector */}
          <div className="w-52 sm:w-64">
            <EmployeeSelector
              employees={employees}
              selected={currentEmployee}
              onChange={setCurrentEmployee}
            />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Step wizard */}
        <div className="mb-8">
          <StepWizard
            currentStep={step}
            completedSteps={completedSteps}
            onStepClick={setStep}
          />
        </div>

        {/* Step content */}
        <div className="card max-w-3xl mx-auto">
          {/* === STEP 1: Recording === */}
          {step === "record" && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-100">Korak 1 — Snemanje</h2>
                <p className="text-slate-400 text-sm mt-1">
                  Opišite opravljeno delo v govoru. Aplikacija bo besedilo samodejno
                  transkribiral in ekstrahirala strukturirane podatke.
                </p>
              </div>

              {isTranscribing ? (
                <div className="flex flex-col items-center gap-4 py-12">
                  <Loader2 className="animate-spin text-blue-400" size={48} />
                  <p className="text-slate-400">Transkripcija zvoka...</p>
                  <p className="text-slate-500 text-sm">
                    To lahko traja do 30 sekund
                  </p>
                </div>
              ) : (
                <AudioRecorder
                  onAudioReady={handleAudioReady}
                  disabled={isTranscribing}
                />
              )}
            </div>
          )}

          {/* === STEP 2: Transcript === */}
          {step === "transcript" && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-100">
                  Korak 2 — Pregled transkripcije
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Preverite in po potrebi popravite transkribirano besedilo, nato
                  kliknite &ldquo;Ekstrahiraj podatke&rdquo;.
                </p>
              </div>

              <TranscriptEditor
                transcript={transcript}
                date={recordingDate}
                onTranscriptChange={setTranscript}
                onDateChange={setRecordingDate}
                onExtract={handleExtract}
                isExtracting={isExtracting}
              />

              <div className="mt-4 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setStep("record")}
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <ArrowLeft size={15} /> Nazaj na snemanje
                </button>
              </div>
            </div>
          )}

          {/* === STEP 3: Review & Export === */}
          {step === "review" && (
            <div>
              <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-100">
                    Korak 3 — Pregled in izvoz
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Preverite in uredite ekstrahirane podatke, nato izvozite v Excel.
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setStep("transcript")}
                    className="flex items-center gap-1.5 text-sm btn-secondary py-2 px-3"
                  >
                    <ArrowLeft size={14} /> Nazaj
                  </button>
                  <button
                    onClick={handleExport}
                    disabled={isExporting || entries.length === 0}
                    className="btn-success flex items-center gap-2"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Izvažanje...
                      </>
                    ) : (
                      <>
                        <Download size={16} />
                        Izvozi v Excel
                      </>
                    )}
                  </button>
                </div>
              </div>

              {entries.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p>Ni vnosov za prikaz.</p>
                </div>
              ) : (
                <DataTable
                  entries={entries}
                  employees={employees}
                  clients={clients}
                  currentEmployee={currentEmployee}
                  onEntriesChange={setEntries}
                />
              )}

              {/* Summary */}
              {entries.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-sm text-slate-400 flex-wrap gap-2">
                  <span>
                    {entries.length} vnos{entries.length === 1 ? "" : entries.length < 5 ? "i" : "ov"} •{" "}
                    {entries
                      .reduce((s, e) => s + (e.stevilo_ur ?? 0), 0)
                      .toFixed(2)}{" "}
                    ur skupaj
                  </span>
                  <button
                    onClick={handleNewRecording}
                    className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                  >
                    + Novo snemanje
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
