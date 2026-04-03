import React, { useState } from 'react';
import Step1Format from './components/Step1Format';
import Step2Persona from './components/Step2Persona';
import Step3Producer from './components/Step3Producer';
import Step4Concept from './components/Step4Concept';
import Step5Output from './components/Step5Output';
import TheCrate from './components/TheCrate';
import AlbumCreator from './components/AlbumCreator';
import ThePad from './components/ThePad';
import { Music, ArrowLeft } from 'lucide-react';
import { Format, Persona, Framework, Producer, SavedSong } from './types';
import { LOCKED_PERSONAS, PRODUCERS } from './constants';

type View = 'crate' | 'wizard' | 'album' | 'song_detail';

export default function App() {
  const [view, setView] = useState<View>('crate');
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSong, setSelectedSong] = useState<SavedSong | null>(null);

  // State for all steps
  const [format, setFormat] = useState<Format | null>(null);
  const [persona, setPersona] = useState<Persona | null>(LOCKED_PERSONAS[0]);
  const [producer, setProducer] = useState<Producer | null>(PRODUCERS[0]);
  const [framework, setFramework] = useState<Framework | null>(null);
  const [concept, setConcept] = useState('');

  const canProceed = () => {
    if (currentStep === 1) return format !== null;
    if (currentStep === 2) return persona !== null;
    if (currentStep === 3) return producer !== null;
    if (currentStep === 4) return framework !== null && concept.trim().length > 0;
    return false;
  };

  const nextStep = () => {
    if (canProceed() && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const startNewTrack = () => {
    setCurrentStep(1);
    setFormat(null);
    setConcept('');
    setView('wizard');
  };

  return (
    <div className="min-h-screen bg-midnight text-white font-sans selection:bg-cyan-500/30">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setView('crate')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-cyan-500/50 transition-all">
              <Music size={20} className="text-white" />
            </div>
            <h1 className="text-2xl font-display font-black tracking-widest text-white">GHOSTWRITER</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="h-[calc(100vh-80px)] overflow-y-auto">
        {view === 'crate' && (
          <TheCrate 
            onNewTrack={startNewTrack} 
            onOpenAlbumCreator={() => setView('album')}
            onOpenSong={(song) => {
              setSelectedSong(song);
              setView('song_detail');
            }}
          />
        )}

        {view === 'album' && (
          <AlbumCreator onBack={() => setView('crate')} />
        )}

        {view === 'song_detail' && selectedSong && (
          <ThePad song={selectedSong} onBack={() => setView('crate')} />
        )}

        {view === 'wizard' && (
          <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
            <div className="flex items-center mb-8">
              <button onClick={() => setView('crate')} className="mr-4 p-2 hover:bg-white/10 rounded-full transition-colors">
                <ArrowLeft size={24} />
              </button>
              <h2 className="text-3xl font-display font-bold">Album Creator</h2>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-12 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-white/10 -z-10"></div>
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex flex-col items-center relative bg-midnight px-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border-2 transition-all ${
                    step < currentStep ? 'bg-cyan-500 border-cyan-500 text-black shadow-[0_0_15px_rgba(0,242,254,0.5)]' :
                    step === currentStep ? 'bg-gradient-to-r from-cyan-400 to-purple-600 border-transparent text-white shadow-[0_0_20px_rgba(161,140,209,0.5)]' :
                    'bg-midnight border-white/20 text-gray-500'
                  }`}>
                    {step}
                  </div>
                  <span className={`text-xs mt-3 font-medium uppercase tracking-wider ${
                    step <= currentStep ? 'text-white' : 'text-gray-500'
                  }`}>
                    {step === 1 ? 'Format' : step === 2 ? 'Persona' : step === 3 ? 'Producer' : step === 4 ? 'Concept' : 'Output'}
                  </span>
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="glass-panel p-8 min-h-[400px]">
              {currentStep === 1 && (
                <Step1Format selectedFormat={format} onSelect={setFormat} />
              )}
              {currentStep === 2 && (
                <Step2Persona selectedPersona={persona} onSelect={setPersona} />
              )}
              {currentStep === 3 && (
                <Step3Producer selectedProducer={producer} onSelect={setProducer} />
              )}
              {currentStep === 4 && (
                <Step4Concept 
                  selectedFramework={framework} 
                  onSelectFramework={setFramework}
                  concept={concept}
                  onConceptChange={setConcept}
                />
              )}
              {currentStep === 5 && format && persona && producer && framework && (
                <Step5Output 
                  format={format}
                  persona={persona}
                  producer={producer}
                  framework={framework}
                  concept={concept}
                />
              )}
            </div>

            {/* Navigation */}
            <div className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-xl border-t border-white/10 p-4 z-50">
              <div className="max-w-4xl mx-auto flex justify-between items-center">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`px-8 py-3 rounded-full font-bold transition-all ${
                    currentStep === 1 ? 'opacity-0 pointer-events-none' : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  Back
                </button>
                
                {currentStep < 5 && (
                  <button
                    onClick={nextStep}
                    disabled={!canProceed()}
                    className="pill-button px-10 py-3 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
