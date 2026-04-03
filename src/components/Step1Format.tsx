import React from 'react';
import { FORMATS } from '../constants';
import { Format } from '../types';

interface Props {
  selectedFormat: Format | null;
  onSelect: (format: Format) => void;
}

export default function Step1Format({ selectedFormat, onSelect }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-display font-bold text-white mb-8">Select Format</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FORMATS.map((f) => (
          <button
            key={f.name}
            onClick={() => onSelect(f.name)}
            className={`p-6 text-left border rounded-2xl transition-all duration-300 ${
              selectedFormat === f.name
                ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_20px_rgba(0,242,254,0.2)] scale-[1.02]'
                : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
            }`}
          >
            <h3 className={`text-xl font-display font-bold ${selectedFormat === f.name ? 'text-cyan-400' : 'text-white'}`}>{f.name}</h3>
            <p className={`mt-2 text-sm ${selectedFormat === f.name ? 'text-cyan-100' : 'text-gray-400'}`}>
              {f.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
