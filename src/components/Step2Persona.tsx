import React, { useState, useEffect } from 'react';
import { LOCKED_PERSONAS } from '../constants';
import { Persona } from '../types';
import { Trash2 } from 'lucide-react';

interface Props {
  selectedPersona: Persona | null;
  onSelect: (persona: Persona) => void;
}

export default function Step2Persona({ selectedPersona, onSelect }: Props) {
  const [customPersonas, setCustomPersonas] = useState<Persona[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [genderLane, setGenderLane] = useState('male rapper');
  const [pitchRange, setPitchRange] = useState('mid neutral');
  const [texture, setTexture] = useState('smooth');
  const [primaryArtist, setPrimaryArtist] = useState('');
  const [secondaryArtist, setSecondaryArtist] = useState('');
  const [personaName, setPersonaName] = useState('');
  const [energy, setEnergy] = useState('high energy');

  useEffect(() => {
    const saved = localStorage.getItem('ghostwriter_custom_personas');
    if (saved) {
      try {
        setCustomPersonas(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse custom personas');
      }
    }
  }, []);

  const saveCustomPersonas = (personas: Persona[]) => {
    setCustomPersonas(personas);
    localStorage.setItem('ghostwriter_custom_personas', JSON.stringify(personas));
  };

  const handleCreatePersona = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personaName || !primaryArtist) return;

    const artistInfluence = secondaryArtist ? `${primaryArtist} and ${secondaryArtist} influence` : `${primaryArtist} influence`;
    const vocalBlock = `${genderLane}, ${primaryArtist} vocal style, ${pitchRange} range, ${texture} delivery, ${energy}, ${artistInfluence}`;

    const newPersona: Persona = {
      id: `custom-${Date.now()}`,
      name: personaName.toUpperCase(),
      vocalBlock,
      isCustom: true,
    };

    saveCustomPersonas([...customPersonas, newPersona]);
    onSelect(newPersona);
    setShowForm(false);
    
    // Reset form
    setGenderLane('male rapper');
    setPitchRange('mid neutral');
    setTexture('smooth');
    setPrimaryArtist('');
    setSecondaryArtist('');
    setPersonaName('');
    setEnergy('high energy');
  };

  const handleDeleteCustom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customPersonas.filter(p => p.id !== id);
    saveCustomPersonas(updated);
    if (selectedPersona?.id === id) {
      onSelect(LOCKED_PERSONAS[0]); // fallback
    }
  };

  const allPersonas = [...LOCKED_PERSONAS, ...customPersonas];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-display font-bold text-white">Vocal Identity</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 text-sm border border-cyan-400 text-cyan-400 rounded-full hover:bg-cyan-400/10 transition-colors"
        >
          {showForm ? 'Cancel' : 'Build New Persona'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreatePersona} className="p-6 border border-white/10 rounded-2xl bg-white/5 space-y-4 mb-8">
          <h3 className="text-xl font-display font-bold text-white mb-4">Create Custom Persona</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Persona Name</label>
              <input required type="text" value={personaName} onChange={e => setPersonaName(e.target.value)} className="w-full p-3 border border-white/10 rounded-xl bg-black/50 text-white focus:border-cyan-400 focus:outline-none transition-colors" placeholder="e.g. LUNA" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Vocal Gender & Lane</label>
              <select value={genderLane} onChange={e => setGenderLane(e.target.value)} className="w-full p-3 border border-white/10 rounded-xl bg-black/50 text-white focus:border-cyan-400 focus:outline-none transition-colors">
                <option value="male rapper">Male Rapper</option>
                <option value="female rapper">Female Rapper</option>
                <option value="male R&B vocalist">Male R&B</option>
                <option value="female R&B vocalist">Female R&B</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Pitch Range</label>
              <select value={pitchRange} onChange={e => setPitchRange(e.target.value)} className="w-full p-3 border border-white/10 rounded-xl bg-black/50 text-white focus:border-cyan-400 focus:outline-none transition-colors">
                <option value="deep baritone">Deep Baritone</option>
                <option value="mid-low">Mid-Low</option>
                <option value="mid neutral">Mid Neutral</option>
                <option value="mid-high">Mid-High</option>
                <option value="high tenor or soprano">High Tenor / Soprano</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Texture</label>
              <select value={texture} onChange={e => setTexture(e.target.value)} className="w-full p-3 border border-white/10 rounded-xl bg-black/50 text-white focus:border-cyan-400 focus:outline-none transition-colors">
                <option value="smooth">Smooth</option>
                <option value="raspy">Raspy</option>
                <option value="breathy">Breathy</option>
                <option value="airy">Airy</option>
                <option value="aggressive">Aggressive</option>
                <option value="nasal">Nasal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Energy</label>
              <input required type="text" value={energy} onChange={e => setEnergy(e.target.value)} className="w-full p-3 border border-white/10 rounded-xl bg-black/50 text-white focus:border-cyan-400 focus:outline-none transition-colors" placeholder="e.g. high energy, laid back" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Primary Artist Reference (One name)</label>
              <input required type="text" value={primaryArtist} onChange={e => setPrimaryArtist(e.target.value)} className="w-full p-3 border border-white/10 rounded-xl bg-black/50 text-white focus:border-cyan-400 focus:outline-none transition-colors" placeholder="e.g. Drake" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Secondary Artist Reference (Optional)</label>
              <input type="text" value={secondaryArtist} onChange={e => setSecondaryArtist(e.target.value)} className="w-full p-3 border border-white/10 rounded-xl bg-black/50 text-white focus:border-cyan-400 focus:outline-none transition-colors" placeholder="e.g. The Weeknd" />
            </div>
          </div>
          <div className="pt-4">
            <button type="submit" className="pill-button px-8 py-3">
              Save Persona
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allPersonas.map((p) => (
          <div
            key={p.id}
            onClick={() => onSelect(p)}
            className={`p-6 border rounded-2xl cursor-pointer transition-all duration-300 relative ${
              selectedPersona?.id === p.id
                ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_20px_rgba(0,242,254,0.2)] scale-[1.02]'
                : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className={`text-xl font-display font-bold ${selectedPersona?.id === p.id ? 'text-cyan-400' : 'text-white'}`}>{p.name}</h3>
              {p.isCustom && (
                <button
                  onClick={(e) => handleDeleteCustom(p.id, e)}
                  className={`p-1.5 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-colors ${selectedPersona?.id === p.id ? 'text-cyan-200' : 'text-gray-500'}`}
                  title="Delete persona"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <p className={`text-sm leading-relaxed ${selectedPersona?.id === p.id ? 'text-cyan-100' : 'text-gray-400'}`}>
              {p.vocalBlock}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
