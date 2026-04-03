import React from 'react';
import { PRODUCERS } from '../constants';
import { Producer } from '../types';

interface Props {
  selectedProducer: Producer | null;
  onSelect: (producer: Producer) => void;
}

export default function Step3Producer({ selectedProducer, onSelect }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-display font-bold text-white mb-8">Producer (Sonic Identity)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PRODUCERS.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            className={`p-6 text-left border rounded-2xl transition-all duration-300 ${
              selectedProducer?.id === p.id
                ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_20px_rgba(0,242,254,0.2)] scale-[1.02]'
                : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
            }`}
          >
            <h3 className={`text-xl font-display font-bold ${selectedProducer?.id === p.id ? 'text-cyan-400' : 'text-white'}`}>{p.name}</h3>
            <p className={`mt-2 text-sm leading-relaxed ${selectedProducer?.id === p.id ? 'text-cyan-100' : 'text-gray-400'}`}>
              {p.tags}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
