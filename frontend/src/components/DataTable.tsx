import React, { useState, useRef, useEffect } from "react";
import { Trash2, Plus } from "lucide-react";
import { WorkEntry } from "../types";

interface DataTableProps {
  entries: WorkEntry[];
  employees: string[];
  clients: string[];
  currentEmployee: string;
  onEntriesChange: (entries: WorkEntry[]) => void;
}

const HOUR_OPTIONS = [
  0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8,
];

const VRSTA_PRIJAVE_OPTIONS = ["elektronska pošta", "telefon", "osebno", "drugo"];
const DA_NE_OPTIONS = ["da", "ne"];

function generateId() {
  return `entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function emptyEntry(employee: string): WorkEntry {
  const today = new Date().toLocaleDateString("sl-SI", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return {
    id: generateId(),
    opis_dela: "",
    stranka: "",
    kontakt: null,
    vrsta_prijave: null,
    datum: today,
    stevilo_ur: null,
    obisk: null,
    dostop_osebni_podatki: null,
    podroben_opis: null,
    opravil: employee,
    vrsta_elementa: null,
    pot: null,
  };
}

interface AutocompleteInputProps {
  value: string;
  suggestions: string[];
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

function AutocompleteInput({
  value,
  suggestions,
  onChange,
  placeholder,
  className = "",
  required,
}: AutocompleteInputProps) {
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState(value);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputVal(value);
  }, [value]);

  const filtered = suggestions.filter((s) =>
    s.toLowerCase().includes(inputVal.toLowerCase())
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      <input
        type="text"
        value={inputVal}
        onChange={(e) => {
          setInputVal(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        required={required}
        className={`input-field text-sm py-1.5 px-2 ${className} ${
          required && !inputVal ? "border-red-500" : ""
        }`}
      />
      {open && filtered.length > 0 && inputVal && (
        <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-40 overflow-y-auto">
          {filtered.map((s) => (
            <li
              key={s}
              onMouseDown={() => {
                onChange(s);
                setInputVal(s);
                setOpen(false);
              }}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-slate-700 text-slate-200"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function DataTable({
  entries,
  employees,
  clients,
  currentEmployee,
  onEntriesChange,
}: DataTableProps) {
  const updateEntry = (id: string, field: keyof WorkEntry, value: any) => {
    onEntriesChange(
      entries.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const deleteEntry = (id: string) => {
    onEntriesChange(entries.filter((e) => e.id !== id));
  };

  const addEntry = () => {
    onEntriesChange([...entries, emptyEntry(currentEmployee)]);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800 border-b border-slate-700">
              {[
                { label: "Opis dela *", w: "w-36" },
                { label: "STRANKA *", w: "w-36" },
                { label: "Kontakt", w: "w-28" },
                { label: "Vrsta prijave", w: "w-32" },
                { label: "Datum *", w: "w-28" },
                { label: "Ur *", w: "w-20" },
                { label: "Obisk", w: "w-20" },
                { label: "Os. podatki", w: "w-24" },
                { label: "Podroben opis", w: "w-44" },
                { label: "Opravil *", w: "w-32" },
                { label: "Vrsta el.", w: "w-24" },
                { label: "Pot", w: "w-20" },
                { label: "", w: "w-10" },
              ].map((col) => (
                <th
                  key={col.label}
                  className={`px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider ${col.w}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, idx) => (
              <tr
                key={entry.id}
                className={`border-b border-slate-800 ${
                  idx % 2 === 0 ? "bg-slate-900" : "bg-slate-900/60"
                } hover:bg-slate-800/50 transition-colors`}
              >
                {/* Opis dela */}
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={entry.opis_dela}
                    onChange={(e) => updateEntry(entry.id, "opis_dela", e.target.value)}
                    placeholder="Kratek opis"
                    className={`input-field text-sm py-1.5 px-2 ${!entry.opis_dela ? "border-red-500/60" : ""}`}
                  />
                </td>
                {/* STRANKA */}
                <td className="px-3 py-2">
                  <AutocompleteInput
                    value={entry.stranka}
                    suggestions={clients}
                    onChange={(v) => updateEntry(entry.id, "stranka", v)}
                    placeholder="Ime stranke"
                    required
                  />
                </td>
                {/* Kontakt */}
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={entry.kontakt ?? ""}
                    onChange={(e) =>
                      updateEntry(entry.id, "kontakt", e.target.value || null)
                    }
                    placeholder="Kontaktna oseba"
                    className="input-field text-sm py-1.5 px-2"
                  />
                </td>
                {/* Vrsta prijave */}
                <td className="px-3 py-2">
                  <select
                    value={entry.vrsta_prijave ?? ""}
                    onChange={(e) =>
                      updateEntry(entry.id, "vrsta_prijave", e.target.value || null)
                    }
                    className="input-field text-sm py-1.5 px-2"
                  >
                    <option value="">—</option>
                    {VRSTA_PRIJAVE_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </td>
                {/* Datum */}
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={entry.datum}
                    onChange={(e) => updateEntry(entry.id, "datum", e.target.value)}
                    placeholder="DD.MM.YYYY"
                    className={`input-field text-sm py-1.5 px-2 font-mono ${!entry.datum ? "border-red-500/60" : ""}`}
                  />
                </td>
                {/* Število ur */}
                <td className="px-3 py-2">
                  <select
                    value={entry.stevilo_ur ?? ""}
                    onChange={(e) =>
                      updateEntry(
                        entry.id,
                        "stevilo_ur",
                        e.target.value ? parseFloat(e.target.value) : null
                      )
                    }
                    className={`input-field text-sm py-1.5 px-2 ${
                      entry.stevilo_ur === null ? "border-red-500/60" : ""
                    }`}
                  >
                    <option value="">—</option>
                    {HOUR_OPTIONS.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </td>
                {/* Obisk */}
                <td className="px-3 py-2">
                  <select
                    value={entry.obisk ?? ""}
                    onChange={(e) =>
                      updateEntry(entry.id, "obisk", e.target.value || null)
                    }
                    className="input-field text-sm py-1.5 px-2"
                  >
                    <option value="">—</option>
                    {DA_NE_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </td>
                {/* Dostop osebni podatki */}
                <td className="px-3 py-2">
                  <select
                    value={entry.dostop_osebni_podatki ?? ""}
                    onChange={(e) =>
                      updateEntry(entry.id, "dostop_osebni_podatki", e.target.value || null)
                    }
                    className="input-field text-sm py-1.5 px-2"
                  >
                    <option value="">—</option>
                    {DA_NE_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </td>
                {/* Podroben opis */}
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={entry.podroben_opis ?? ""}
                    onChange={(e) =>
                      updateEntry(entry.id, "podroben_opis", e.target.value || null)
                    }
                    placeholder="Podrobni opis"
                    className="input-field text-sm py-1.5 px-2"
                  />
                </td>
                {/* Opravil */}
                <td className="px-3 py-2">
                  <select
                    value={entry.opravil}
                    onChange={(e) =>
                      updateEntry(entry.id, "opravil", e.target.value)
                    }
                    className={`input-field text-sm py-1.5 px-2 ${!entry.opravil ? "border-red-500/60" : ""}`}
                  >
                    <option value="">— Izberi —</option>
                    {employees.map((emp) => (
                      <option key={emp} value={emp}>{emp}</option>
                    ))}
                  </select>
                </td>
                {/* Vrsta elementa */}
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={entry.vrsta_elementa ?? ""}
                    onChange={(e) =>
                      updateEntry(entry.id, "vrsta_elementa", e.target.value || null)
                    }
                    placeholder=""
                    className="input-field text-sm py-1.5 px-2"
                  />
                </td>
                {/* Pot */}
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={entry.pot ?? ""}
                    onChange={(e) =>
                      updateEntry(entry.id, "pot", e.target.value || null)
                    }
                    placeholder=""
                    className="input-field text-sm py-1.5 px-2"
                  />
                </td>
                {/* Delete */}
                <td className="px-2 py-2">
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {entries.map((entry, idx) => (
          <div key={entry.id} className="card relative">
            <button
              onClick={() => deleteEntry(entry.id)}
              className="absolute top-3 right-3 p-1 rounded text-slate-500 hover:text-red-400 transition-colors"
            >
              <Trash2 size={15} />
            </button>
            <p className="text-xs text-slate-500 mb-3 font-medium">
              Vnos {idx + 1}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Opis dela *</label>
                <input
                  type="text"
                  value={entry.opis_dela}
                  onChange={(e) => updateEntry(entry.id, "opis_dela", e.target.value)}
                  placeholder="Kratek opis"
                  className="input-field text-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-slate-400 mb-1">STRANKA *</label>
                <AutocompleteInput
                  value={entry.stranka}
                  suggestions={clients}
                  onChange={(v) => updateEntry(entry.id, "stranka", v)}
                  placeholder="Ime stranke"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Kontakt</label>
                <input
                  type="text"
                  value={entry.kontakt ?? ""}
                  onChange={(e) =>
                    updateEntry(entry.id, "kontakt", e.target.value || null)
                  }
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Vrsta prijave</label>
                <select
                  value={entry.vrsta_prijave ?? ""}
                  onChange={(e) =>
                    updateEntry(entry.id, "vrsta_prijave", e.target.value || null)
                  }
                  className="input-field text-sm"
                >
                  <option value="">—</option>
                  {VRSTA_PRIJAVE_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Datum *</label>
                <input
                  type="text"
                  value={entry.datum}
                  onChange={(e) => updateEntry(entry.id, "datum", e.target.value)}
                  className="input-field text-sm font-mono"
                  placeholder="DD.MM.YYYY"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Število ur *</label>
                <select
                  value={entry.stevilo_ur ?? ""}
                  onChange={(e) =>
                    updateEntry(
                      entry.id,
                      "stevilo_ur",
                      e.target.value ? parseFloat(e.target.value) : null
                    )
                  }
                  className="input-field text-sm"
                >
                  <option value="">—</option>
                  {HOUR_OPTIONS.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Obisk</label>
                <select
                  value={entry.obisk ?? ""}
                  onChange={(e) =>
                    updateEntry(entry.id, "obisk", e.target.value || null)
                  }
                  className="input-field text-sm"
                >
                  <option value="">—</option>
                  {DA_NE_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Dostop os. podatki</label>
                <select
                  value={entry.dostop_osebni_podatki ?? ""}
                  onChange={(e) =>
                    updateEntry(entry.id, "dostop_osebni_podatki", e.target.value || null)
                  }
                  className="input-field text-sm"
                >
                  <option value="">—</option>
                  {DA_NE_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Opravil *</label>
                <select
                  value={entry.opravil}
                  onChange={(e) => updateEntry(entry.id, "opravil", e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">— Izberi —</option>
                  {employees.map((emp) => (
                    <option key={emp} value={emp}>{emp}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Podroben opis</label>
                <input
                  type="text"
                  value={entry.podroben_opis ?? ""}
                  onChange={(e) =>
                    updateEntry(entry.id, "podroben_opis", e.target.value || null)
                  }
                  className="input-field text-sm"
                  placeholder="Podrobni opis"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Vrsta elementa</label>
                <input
                  type="text"
                  value={entry.vrsta_elementa ?? ""}
                  onChange={(e) =>
                    updateEntry(entry.id, "vrsta_elementa", e.target.value || null)
                  }
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Pot</label>
                <input
                  type="text"
                  value={entry.pot ?? ""}
                  onChange={(e) =>
                    updateEntry(entry.id, "pot", e.target.value || null)
                  }
                  className="input-field text-sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add row button */}
      <button
        onClick={addEntry}
        className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors py-2 px-3 rounded-lg hover:bg-blue-900/20 self-start"
      >
        <Plus size={16} /> Dodaj vrstico
      </button>
    </div>
  );
}
