import React from 'react';
import { motion } from 'framer-motion';
import { Play, Heart } from 'lucide-react';
import type { Song } from '@/types/music';

interface TrendingCardProps {
  song: Song;
  onPlay: () => void;
  isActive?: boolean;
  isPlaying?: boolean;
  showPremium?: boolean;
}

export default function TrendingCard({ song, onPlay, isActive, isPlaying, showPremium }: TrendingCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onPlay}
      className="relative flex-shrink-0 w-40 md:w-44 cursor-pointer group"
    >
      {/* Artwork */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-surface mb-3">
        <img
          src={song.artwork || '/placeholder.svg'}
          alt={song.title}
          className="w-full h-full object-cover"
        />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg"
          >
            <Play className="w-7 h-7 text-black ml-1" fill="black" />
          </motion.div>
        </div>

        {/* Playing Indicator */}
        {isActive && isPlaying && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-primary rounded px-2 py-1">
            <div className="flex gap-0.5 h-3">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-0.5 bg-primary-foreground equalizer-bar rounded-full"
                />
              ))}
            </div>
          </div>
        )}

        {/* Premium Badge */}
        {showPremium && (
          <div className="absolute bottom-2 left-2 bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded">
            PREMIUM
          </div>
        )}
      </div>

      {/* Song Info */}
      <h4 className="font-semibold text-foreground text-sm truncate">{song.title}</h4>
      <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
    </motion.div>
  );
}
