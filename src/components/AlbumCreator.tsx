import React, { useState, useEffect } from 'react';
import { SavedSong } from '../types';
import { ArrowLeft, Disc3 } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  onBack: () => void;
}

export default function AlbumCreator({ onBack }: Props) {
  const [songs, setSongs] = useState<SavedSong[]>([]);
  const [albumTracks, setAlbumTracks] = useState<(SavedSong | null)[]>(Array(10).fill(null));

  useEffect(() => {
    const saved = localStorage.getItem('ghostwriter_saved_songs');
    if (saved) {
      try {
        setSongs(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved songs');
      }
    }
  }, []);

  const handleDragStart = (e: React.DragEvent, song: SavedSong) => {
    e.dataTransfer.setData('songId', song.id);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const songId = e.dataTransfer.getData('songId');
    const song = songs.find(s => s.id === songId);
    
    if (song) {
      setAlbumTracks(prev => {
        const newTracks = [...prev];
        // If song is already in album, remove it from previous position
        const existingIndex = newTracks.findIndex(t => t?.id === song.id);
        if (existingIndex !== -1) {
          newTracks[existingIndex] = null;
        }
        newTracks[index] = song;
        return newTracks;
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeTrack = (index: number) => {
    setAlbumTracks(prev => {
      const newTracks = [...prev];
      newTracks[index] = null;
      return newTracks;
    });
  };

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center mb-12">
        <button onClick={onBack} className="mr-6 p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-5xl font-display font-black gradient-text tracking-tight">Album Creator</h1>
      </div>

      <div className="flex gap-8 h-[calc(100vh-200px)]">
        {/* Available Tracks */}
        <div className="w-1/3 glass-panel p-6 flex flex-col">
          <h2 className="text-xl font-display font-bold mb-4 flex items-center space-x-2">
            <Disc3 className="text-cyan-400" />
            <span>Available Tracks</span>
          </h2>
          <div className="overflow-y-auto flex-1 space-y-3 pr-2">
            {songs.map(song => (
              <motion.div
                key={song.id}
                draggable
                onDragStart={(e) => handleDragStart(e as any, song)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/5 border border-white/10 p-4 rounded-xl cursor-grab active:cursor-grabbing hover:bg-white/10 transition-colors"
              >
                <h4 className="font-bold text-white">{song.title}</h4>
                <p className="text-xs text-gray-400 mt-1">{song.personaName}</p>
              </motion.div>
            ))}
            {songs.length === 0 && (
              <p className="text-gray-500 text-sm text-center mt-10">No saved tracks available.</p>
            )}
          </div>
        </div>

        {/* Album Grid */}
        <div className="w-2/3 glass-panel p-6 overflow-y-auto">
          <h2 className="text-xl font-display font-bold mb-6">Tracklist</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {albumTracks.map((track, index) => (
              <div
                key={index}
                onDrop={(e) => handleDrop(e, index)}
                onDragOver={handleDragOver}
                className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 relative transition-colors ${
                  track ? 'border-cyan-400/50 bg-cyan-400/5' : 'border-white/20 hover:border-white/40 bg-white/5'
                }`}
              >
                <span className="absolute top-3 left-3 text-sm font-bold text-gray-500">{index + 1}</span>
                
                {track ? (
                  <>
                    <button 
                      onClick={() => removeTrack(index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-full flex items-center justify-center text-xs transition-colors"
                    >
                      ×
                    </button>
                    <div className="text-center">
                      <h4 className="font-display font-bold text-lg text-white line-clamp-2">{track.title}</h4>
                      <p className="text-xs text-cyan-400 mt-2">{track.personaName}</p>
                    </div>
                  </>
                ) : (
                  <span className="text-gray-500 text-sm font-medium">Drag track here</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
