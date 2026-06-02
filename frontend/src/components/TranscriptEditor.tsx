import React, { useState } from "react";
import { FileText, Zap, Loader2 } from "lucide-react";

interface TranscriptEditorProps {
  transcript: string;
  date: string;
  onTranscriptChange: (text: string) => void;
  onDateChange: (date: string) => void;
  onExtract: () => void;
  isExtracting: boolean;
}

export function TranscriptEditor({
  transcript,
  date,
  onTranscriptChange,
  onDateChange,
  onExtract,
  isExtracting,
}: TranscriptEditorProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* Transcript text */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FileText size={16} className="text-blue-400" />
          <label className="text-sm font-semibold text-slate-300">
            Transkribiraono besedilo
          </label>
          <span className="text-xs text-slate-500 ml-auto">
            {transcript.length} znakov
          </span>
        </div>
        <textarea
          value={transcript}
          onChange={(e) => onTranscriptChange(e.target.value)}
          rows={8}
          className="input-field font-mono text-sm leading-relaxed resize-none"
          placeholder="Besedilo bo prikazano tukaj po transkripciji..."
          spellCheck={false}
        />
        <p className="text-xs text-slate-500 mt-1">
          Besedilo lahko ročno popravite pred ekstrakcijo podatkov.
        </p>
      </div>

      {/* Date */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-slate-300 mb-1.5">
            Privzeti datum
          </label>
          <input
            type="text"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            placeholder="DD.MM.YYYY"
            className="input-field"
            pattern="\d{2}\.\d{2}\.\d{4}"
          />
          <p className="text-xs text-slate-500 mt-1">
            Datum se uporabi, če v govoru ni omenjen specifičen datum.
          </p>
        </div>
      </div>

      {/* Extract button */}
      <button
        onClick={onExtract}
        disabled={!transcript.trim() || isExtracting}
        className="btn-primary flex items-center justify-center gap-2 w-full py-3 text-base"
      >
        {isExtracting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Ekstrakcija v teku...
          </>
        ) : (
          <>
            <Zap size={18} />
            Ekstrahiraj podatke
          </>
        )}
      </button>
    </div>
  );
}
