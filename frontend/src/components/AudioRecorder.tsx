import React, { useRef, useState } from "react";
import {
  Mic,
  MicOff,
  Pause,
  Play,
  Square,
  Upload,
  RotateCcw,
} from "lucide-react";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { WaveformVisualizer } from "./WaveformVisualizer";

interface AudioRecorderProps {
  onAudioReady: (blob: Blob, date: string) => void;
  disabled?: boolean;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function AudioRecorder({ onAudioReady, disabled }: AudioRecorderProps) {
  const recorder = useAudioRecorder();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const today = new Date().toLocaleDateString("sl-SI", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const handleStopAndSend = () => {
    recorder.stopRecording();
  };

  // When audioBlob becomes available after stop
  React.useEffect(() => {
    if (recorder.audioBlob) {
      onAudioReady(recorder.audioBlob, today);
    }
  }, [recorder.audioBlob]);

  const handleFileSelect = (file: File) => {
    if (file.size > 25 * 1024 * 1024) {
      alert("Datoteka je prevelika (max 25 MB)");
      return;
    }
    setUploadedFile(file);
    const fileDate = new Date(file.lastModified).toLocaleDateString("sl-SI", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    onAudioReady(file, fileDate);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("audio/")) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Error */}
      {recorder.error && (
        <div className="w-full bg-red-900/30 border border-red-700 rounded-lg p-3 text-red-300 text-sm">
          {recorder.error}
        </div>
      )}

      {/* Main recording button */}
      <div className="relative flex items-center justify-center">
        {recorder.isRecording && !recorder.isPaused && (
          <>
            <div className="absolute w-40 h-40 rounded-full bg-red-500/20 pulse-ring" />
            <div className="absolute w-32 h-32 rounded-full bg-red-500/15 pulse-ring" style={{ animationDelay: "0.4s" }} />
          </>
        )}

        <button
          onClick={
            recorder.isRecording
              ? handleStopAndSend
              : recorder.startRecording
          }
          disabled={disabled}
          className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center transition-all duration-200 shadow-2xl
            ${
              recorder.isRecording
                ? "bg-red-600 hover:bg-red-500 shadow-red-900/50"
                : "bg-blue-600 hover:bg-blue-500 shadow-blue-900/50"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {recorder.isRecording ? (
            <Square size={40} className="text-white" />
          ) : (
            <Mic size={40} className="text-white" />
          )}
        </button>
      </div>

      {/* Status label */}
      <div className="text-center">
        {recorder.isRecording ? (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${recorder.isPaused ? "bg-yellow-400" : "bg-red-500 animate-pulse"}`} />
              <span className="text-lg font-mono font-bold text-slate-100">
                {formatDuration(recorder.duration)}
              </span>
            </div>
            <span className="text-sm text-slate-400">
              {recorder.isPaused ? "Pavza" : "Snemanje..."}
            </span>
          </div>
        ) : recorder.audioBlob ? (
          <span className="text-emerald-400 font-medium">Posnetek pripravljen</span>
        ) : (
          <span className="text-slate-400 text-sm">
            Pritisni za začetek snemanja
          </span>
        )}
      </div>

      {/* Waveform */}
      {recorder.isRecording && (
        <div className="w-full max-w-md">
          <WaveformVisualizer
            analyserNode={recorder.analyserNode}
            isActive={recorder.isRecording && !recorder.isPaused}
          />
        </div>
      )}

      {/* Pause / Resume */}
      {recorder.isRecording && (
        <div className="flex gap-3">
          <button
            onClick={
              recorder.isPaused ? recorder.resumeRecording : recorder.pauseRecording
            }
            className="btn-secondary flex items-center gap-2"
          >
            {recorder.isPaused ? (
              <>
                <Play size={16} /> Nadaljuj
              </>
            ) : (
              <>
                <Pause size={16} /> Pavza
              </>
            )}
          </button>
          <button
            onClick={handleStopAndSend}
            className="bg-red-700 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2"
          >
            <Square size={16} /> Ustavi
          </button>
        </div>
      )}

      {/* Audio preview */}
      {recorder.audioUrl && !recorder.isRecording && (
        <div className="w-full max-w-md bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-2 font-medium">Predogled posnetka</p>
          <audio controls src={recorder.audioUrl} className="w-full" />
          <button
            onClick={recorder.reset}
            className="mt-3 text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
          >
            <RotateCcw size={12} /> Posname znova
          </button>
        </div>
      )}

      {/* Divider */}
      {!recorder.isRecording && !recorder.audioBlob && (
        <div className="flex items-center gap-3 w-full max-w-md">
          <div className="flex-1 h-px bg-slate-700" />
          <span className="text-slate-500 text-xs">ALI</span>
          <div className="flex-1 h-px bg-slate-700" />
        </div>
      )}

      {/* File upload */}
      {!recorder.isRecording && !recorder.audioBlob && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full max-w-md border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors duration-150
            ${isDragOver
              ? "border-blue-500 bg-blue-500/10"
              : "border-slate-600 hover:border-slate-500 hover:bg-slate-800/30"
            }`}
        >
          <Upload className="mx-auto mb-2 text-slate-400" size={24} />
          <p className="text-slate-300 text-sm font-medium">
            {uploadedFile ? uploadedFile.name : "Naloži zvočno datoteko"}
          </p>
          <p className="text-slate-500 text-xs mt-1">
            WebM, WAV, MP3, MP4, OGG — max 25 MB
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileSelect(f);
            }}
          />
        </div>
      )}
    </div>
  );
}
