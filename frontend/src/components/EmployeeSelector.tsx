import React from "react";
import { User } from "lucide-react";

interface EmployeeSelectorProps {
  employees: string[];
  selected: string;
  onChange: (name: string) => void;
}

export function EmployeeSelector({
  employees,
  selected,
  onChange,
}: EmployeeSelectorProps) {
  return (
    <div className="flex items-center gap-3 bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3">
      <User className="text-blue-400 shrink-0" size={20} />
      <div className="flex-1 min-w-0">
        <label className="block text-xs text-slate-400 mb-0.5 font-medium">
          Prijavljeni kot
        </label>
        <select
          value={selected}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-slate-100 font-semibold text-sm focus:outline-none cursor-pointer"
        >
          <option value="" className="bg-slate-900">
            — Izberi zaposlenega —
          </option>
          {employees.map((emp) => (
            <option key={emp} value={emp} className="bg-slate-900">
              {emp}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
