import React, { useState, useEffect } from 'react';
import { Format, Persona, Framework, Track, SavedSong, Producer } from '../types';
import { FORMATS } from '../constants';
import { generateTrack } from '../services/geminiService';
import { Copy, Save, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  format: Format;
  persona: Persona;
  producer: Producer;
  framework: Framework;
  concept: string;
}

export default function Step5Output({ format, persona, producer, framework, concept }: Props) {
  const formatConfig = FORMATS.find(f => f.name === format)!;
  const totalTracks = formatConfig.tracks;

  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [refinement, setRefinement] = useState('');
  const [showRefine, setShowRefine] = useState(false);

  // Initialize tracks
  useEffect(() => {
    const initialTracks: Track[] = Array.from({ length: totalTracks }, (_, i) => ({
      id: `track-${i + 1}`,
      trackNumber: i + 1,
      title: `Track ${i + 1}`,
      status: 'pending',
    }));
    setTracks(initialTracks);
  }, [format, totalTracks]);

  const startGeneration = async () => {
    setIsGenerating(true);
    let currentProjectTitle = '';
    
    for (let i = 0; i < totalTracks; i++) {
      // Update status to generating
      setTracks(prev => prev.map((t, idx) => idx === i ? { ...t, status: 'generating', error: undefined } : t));
      setCurrentTrackIndex(i);

      try {
        const { title, projectTitle, styleTag, lyrics } = await generateTrack(
          format, 
          persona, 
          producer, 
          framework, 
          concept, 
          i + 1, 
          totalTracks, 
          undefined, 
          currentProjectTitle
        );
        
        if (i === 0) {
          currentProjectTitle = projectTitle;
        }
        
        setTracks(prev => prev.map((t, idx) => idx === i ? {
          ...t,
          title,
          projectTitle,
          status: 'done',
          styleTag,
          lyrics
        } : t));
      } catch (error: any) {
        setTracks(prev => prev.map((t, idx) => idx === i ? {
          ...t,
          status: 'error',
          error: error.message || 'An unknown error occurred'
        } : t));
        break; // Stop sequential generation on error
      }
    }
    
    setIsGenerating(false);
  };

  const handleRefine = async () => {
    if (!refinement.trim()) return;
    
    const track = tracks[currentTrackIndex];
    if (!track || track.status === 'generating') return;

    setIsGenerating(true);
    setTracks(prev => prev.map((t, idx) => idx === currentTrackIndex ? { ...t, status: 'generating', error: undefined } : t));

    try {
      const { title, styleTag, lyrics } = await generateTrack(
        format, 
        persona, 
        producer, 
        framework, 
        concept, 
        track.trackNumber, 
        totalTracks, 
        refinement,
        // Pass a dummy project title if we don't have one, or maybe we don't need it for refine
        undefined
      );
      
      setTracks(prev => prev.map((t, idx) => idx === currentTrackIndex ? {
        ...t,
        title: title !== `Track ${track.trackNumber}` ? title : t.title, // Keep old title if not provided
        status: 'done',
        styleTag,
        lyrics
      } : t));
      setRefinement('');
      setShowRefine(false);
    } catch (error: any) {
      setTracks(prev => prev.map((t, idx) => idx === currentTrackIndex ? {
        ...t,
        status: 'error',
        error: error.message || 'An unknown error occurred'
      } : t));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    const track = tracks[currentTrackIndex];
    if (!track || track.status !== 'done' || !track.styleTag || !track.lyrics) return;

    const savedSongsJson = localStorage.getItem('ghostwriter_saved_songs');
    const savedSongs: SavedSong[] = savedSongsJson ? JSON.parse(savedSongsJson) : [];

    const newSong: SavedSong = {
      id: `song-${Date.now()}`,
      title: track.title || `${format} - Track ${track.trackNumber}`,
      personaName: persona.name,
      producerName: producer.name,
      format,
      dateSaved: new Date().toISOString(),
      styleTag: track.styleTag,
      lyrics: track.lyrics,
    };

    localStorage.setItem('ghostwriter_saved_songs', JSON.stringify([newSong, ...savedSongs]));
    alert('Song saved to Library!');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const currentTrack = tracks[currentTrackIndex];
  const allPending = tracks.every(t => t.status === 'pending');

  const getCharCountColor = (count: number) => {
    const percentage = count / 5000;
    if (percentage <= 0.85) return 'bg-green-500';
    if (percentage <= 0.95) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">Generation & Output</h2>
          {tracks[0]?.projectTitle && (
            <p className="text-cyan-400 font-display font-bold mt-2 text-xl">{tracks[0].projectTitle}</p>
          )}
        </div>
        {allPending && (
          <button
            onClick={startGeneration}
            disabled={isGenerating}
            className="pill-button px-8 py-3 disabled:opacity-50 disabled:grayscale"
          >
            Generate {format}
          </button>
        )}
      </div>

      {/* Tracklist */}
      {totalTracks > 1 && (
        <div className="flex flex-wrap gap-3 mb-8">
          {tracks.map((t, idx) => (
            <button
              key={t.id}
              onClick={() => setCurrentTrackIndex(idx)}
              className={`flex items-center space-x-3 px-4 py-2 rounded-full border transition-all duration-300 ${
                currentTrackIndex === idx 
                  ? 'border-cyan-400 bg-cyan-400/10 text-white shadow-[0_0_15px_rgba(0,242,254,0.2)]' 
                  : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full shadow-lg ${
                t.status === 'pending' ? 'bg-gray-500' :
                t.status === 'generating' ? 'bg-amber-400 animate-pulse shadow-amber-400/50' :
                t.status === 'done' ? 'bg-green-400 shadow-green-400/50' : 'bg-red-400 shadow-red-400/50'
              }`} />
              <span className="font-medium text-sm">{t.title}</span>
            </button>
          ))}
        </div>
      )}

      {currentTrack && (
        <div className="glass-panel overflow-hidden border border-white/10">
          {/* Header */}
          <div className="bg-black/40 p-6 border-b border-white/10 flex justify-between items-center backdrop-blur-md">
            <div className="flex items-center space-x-4">
              {totalTracks > 1 && (
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setCurrentTrackIndex(Math.max(0, currentTrackIndex - 1))}
                    disabled={currentTrackIndex === 0}
                    className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 transition-colors text-white"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={() => setCurrentTrackIndex(Math.min(totalTracks - 1, currentTrackIndex + 1))}
                    disabled={currentTrackIndex === totalTracks - 1}
                    className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 transition-colors text-white"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
              <h3 className="font-display font-bold text-2xl text-white">{currentTrack.title}</h3>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 px-3 py-1 bg-cyan-400/10 rounded-full border border-cyan-400/20">{persona.name}</span>
            </div>
            
            {currentTrack.status === 'done' && (
              <div className="flex space-x-3">
                <button onClick={() => setShowRefine(!showRefine)} className="flex items-center space-x-2 px-4 py-2 text-sm font-bold border border-white/20 rounded-full hover:bg-white/10 transition-colors text-white">
                  <RefreshCw size={16} />
                  <span>Refine</span>
                </button>
                <button onClick={handleSave} className="pill-button flex items-center space-x-2 px-6 py-2 text-sm">
                  <Save size={16} />
                  <span>Save</span>
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-8">
            {currentTrack.status === 'pending' && (
              <div className="text-center py-16 text-gray-500 font-medium">
                Ready to generate. Click the button above to start.
              </div>
            )}

            {currentTrack.status === 'generating' && (
              <div className="text-center py-16">
                <div className="inline-block w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mb-6 shadow-[0_0_15px_rgba(0,242,254,0.5)]"></div>
                <p className="text-cyan-400 font-display font-bold text-xl animate-pulse">Engineering track {currentTrack.trackNumber}...</p>
              </div>
            )}

            {currentTrack.status === 'error' && (
              <div className="bg-red-500/10 text-red-400 p-6 rounded-2xl border border-red-500/20">
                <h4 className="font-display font-bold text-lg mb-2">Generation Error</h4>
                <p className="text-sm font-mono bg-black/50 p-4 rounded-xl mb-4">{currentTrack.error}</p>
                <button 
                  onClick={startGeneration}
                  className="px-6 py-2 bg-red-500/20 text-red-300 rounded-full text-sm font-bold hover:bg-red-500/30 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {currentTrack.status === 'done' && (
              <div className="space-y-10">
                {/* Area 1: Style Tag */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="font-display font-bold text-cyan-400 text-lg">Suno Style Tag</label>
                    <button 
                      onClick={() => copyToClipboard(currentTrack.styleTag || '')}
                      className="text-sm text-gray-400 flex items-center space-x-2 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-full border border-white/10"
                    >
                      <Copy size={14} />
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="p-6 bg-black/50 border border-white/10 rounded-2xl font-mono text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {currentTrack.styleTag}
                  </div>
                </div>

                {/* Area 2: Lyrics */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="font-display font-bold text-purple-400 text-lg">Lyrics</label>
                    <button 
                      onClick={() => copyToClipboard(currentTrack.lyrics || '')}
                      className="text-sm text-gray-400 flex items-center space-x-2 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-full border border-white/10"
                    >
                      <Copy size={14} />
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="p-8 bg-black/50 border border-white/10 rounded-2xl font-mono text-sm text-gray-300 whitespace-pre-wrap min-h-[300px] leading-relaxed">
                    {currentTrack.lyrics}
                  </div>
                  
                  {/* Character Count Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                      <span>Character count</span>
                      <span>{currentTrack.lyrics?.length || 0} / 5000</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${getCharCountColor(currentTrack.lyrics?.length || 0)}`} 
                        style={{ width: `${Math.min(((currentTrack.lyrics?.length || 0) / 5000) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Refine Panel */}
          {showRefine && currentTrack.status === 'done' && (
            <div className="border-t border-white/10 p-6 bg-cyan-900/20 backdrop-blur-md">
              <label className="block text-sm font-display font-bold text-cyan-400 mb-3">Refinement Instructions</label>
              <textarea
                value={refinement}
                onChange={(e) => setRefinement(e.target.value)}
                placeholder="e.g. Make the second verse more aggressive, change the hook to be more melodic..."
                className="w-full h-32 p-4 border border-cyan-500/30 rounded-xl bg-black/60 text-white focus:border-cyan-400 focus:outline-none resize-y mb-4 placeholder-gray-500"
              />
              <div className="flex justify-end space-x-3">
                <button onClick={() => setShowRefine(false)} className="px-6 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={handleRefine}
                  disabled={!refinement.trim() || isGenerating}
                  className="pill-button px-8 py-2 text-sm disabled:opacity-50 disabled:grayscale"
                >
                  Regenerate Track
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
