import React from 'react';
import { ArrowLeft, Search, Sparkles, Send } from 'lucide-react';
import { SavedSong } from '../types';
import { motion } from 'motion/react';

interface Props {
  song: SavedSong;
  onBack: () => void;
}

export default function ThePad({ song, onBack }: Props) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-5xl mx-auto px-4 py-8 pb-32"
    >
      <button onClick={onBack} className="mb-8 flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft size={20} />
        <span>Back to Crate</span>
      </button>
      
      <div className="mb-8">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl font-display font-black gradient-text mb-4"
        >
          {song.title}
        </motion.h1>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-3 text-sm font-bold uppercase tracking-wider"
        >
          <span className="px-4 py-1.5 bg-cyan-400/10 text-cyan-400 rounded-full border border-cyan-400/20">{song.personaName}</span>
          {song.producerName && <span className="px-4 py-1.5 bg-purple-400/10 text-purple-400 rounded-full border border-purple-400/20">{song.producerName}</span>}
          <span className="px-4 py-1.5 bg-white/10 text-gray-300 rounded-full border border-white/10">{song.format}</span>
        </motion.div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="glass-panel p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-display font-bold text-purple-400">Lyrics</h3>
              <div className="flex space-x-2">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-bold transition-colors">
                  <Search size={14} />
                  <span>Find Rhyme</span>
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-bold transition-colors">
                  <Sparkles size={14} />
                  <span>AI Verse</span>
                </motion.button>
              </div>
            </div>
            <div className="bg-black/50 p-8 rounded-2xl font-mono text-base text-gray-300 border border-white/5 whitespace-pre-wrap leading-relaxed min-h-[500px]">
              {song.lyrics}
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <div className="glass-panel p-6">
            <h3 className="text-xl font-display font-bold mb-4 text-cyan-400">Style Tag</h3>
            <div className="bg-black/50 p-4 rounded-xl font-mono text-sm text-gray-300 border border-white/5 whitespace-pre-wrap">
              {song.styleTag}
            </div>
          </div>
          
          <div className="glass-panel p-6 bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border-cyan-500/30">
            <h3 className="text-xl font-display font-bold mb-4 text-white">Ready for Suno?</h3>
            <p className="text-sm text-gray-400 mb-6">Copy your style tag and lyrics, then head over to Suno AI to generate your track.</p>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="pill-button w-full flex items-center justify-center space-x-2 py-3">
              <Send size={16} />
              <span>Send to Suno</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
