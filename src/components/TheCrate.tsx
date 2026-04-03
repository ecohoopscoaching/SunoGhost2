import React, { useState, useEffect } from 'react';
import { SavedSong } from '../types';
import { Plus, Disc3, Music } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  onNewTrack: () => void;
  onOpenAlbumCreator: () => void;
  onOpenSong: (song: SavedSong) => void;
}

export default function TheCrate({ onNewTrack, onOpenAlbumCreator, onOpenSong }: Props) {
  const [songs, setSongs] = useState<SavedSong[]>([]);

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

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-5xl font-display font-black gradient-text tracking-tight">Your Projects</h1>
      </div>

      {songs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <Music size={64} className="mb-4 opacity-20" />
          <p className="text-xl font-medium">Your crate is empty.</p>
          <p className="mt-2">Start a new project to fill it up.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-32">
          {songs.map((song, index) => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5, rotateX: 5, rotateY: -5 }}
              className="glass-panel p-6 cursor-pointer group"
              onClick={() => onOpenSong(song)}
              style={{ perspective: 1000 }}
            >
              <h3 className="text-2xl font-display font-bold text-white mb-2 group-hover:gradient-text transition-all">{song.title}</h3>
              <div className="space-y-1 text-sm text-gray-300">
                <p><span className="text-gray-500">Persona:</span> {song.personaName}</p>
                {song.producerName && <p><span className="text-gray-500">Producer:</span> {song.producerName}</p>}
                <p><span className="text-gray-500">Format:</span> {song.format}</p>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                {new Date(song.dateSaved).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNewTrack}
          className="pill-button px-16 py-6 text-3xl font-black tracking-wide flex items-center space-x-4 shadow-[0_0_40px_rgba(0,242,254,0.6)]"
        >
          <Disc3 size={32} />
          <span>Album Creator</span>
        </motion.button>
      </div>
    </div>
  );
}
