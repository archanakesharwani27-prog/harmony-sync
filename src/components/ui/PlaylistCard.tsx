import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Playlist } from '@/types/music';

interface PlaylistCardProps {
  playlist: Playlist;
  onPlay: () => void;
  onClick: () => void;
}

export default function PlaylistCard({ playlist, onPlay, onClick }: PlaylistCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative bg-card rounded-lg p-4 hover:bg-surface-hover transition-all cursor-pointer"
      onClick={onClick}
    >
      {/* Artwork */}
      <div className="relative aspect-square rounded-md overflow-hidden mb-4 shadow-lg">
        {playlist.artwork ? (
          <img
            src={playlist.artwork}
            alt={playlist.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full gradient-primary flex items-center justify-center">
            <span className="text-4xl">🎵</span>
          </div>
        )}

        {/* Play button overlay */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ opacity: 1, scale: 1 }}
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all"
        >
          <Button
            size="icon"
            className="h-12 w-12 rounded-full gradient-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform"
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
          >
            <Play className="w-6 h-6 ml-0.5" />
          </Button>
        </motion.div>
      </div>

      {/* Info */}
      <h4 className="font-semibold text-foreground truncate">{playlist.name}</h4>
      <p className="text-sm text-muted-foreground truncate">
        {playlist.description || `${playlist.songs.length} songs`}
      </p>
    </motion.div>
  );
}
