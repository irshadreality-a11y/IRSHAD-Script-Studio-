import React from 'react';

interface ToggleGroupProps<T extends string> {
  label: string;
  options: T[];
  value: T;
  onChange: (value: T) => void;
}

export const ToggleGroup = <T extends string>({ 
  label, 
  options, 
  value, 
  onChange 
}: ToggleGroupProps<T>) => {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${value === option 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 ring-1 ring-blue-400' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 ring-1 ring-slate-700'}
            `}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};
