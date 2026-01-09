import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, MoreHorizontal, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Song } from '@/types/music';
import { Button } from '@/components/ui/button';
import { useLikes } from '@/contexts/LikesContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
interface SongCardProps {
  song: Song;
  index?: number;
  isPlaying?: boolean;
  isActive?: boolean;
  onPlay: () => void;
  onAddToQueue?: () => void;
  onAddToPlaylist?: () => void;
  variant?: 'list' | 'grid';
}

export default function SongCard({
  song,
  index,
  isPlaying = false,
  isActive = false,
  onPlay,
  onAddToQueue,
  onAddToPlaylist,
  variant = 'list',
}: SongCardProps) {
  const { isLiked, toggleLike } = useLikes();
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  if (variant === 'grid') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group relative bg-card rounded-lg p-4 hover:bg-surface-hover transition-all cursor-pointer"
        onClick={onPlay}
      >
        {/* Artwork */}
        <div className="relative aspect-square rounded-md overflow-hidden mb-4 shadow-lg">
          {song.artwork ? (
            <img
              src={song.artwork}
              alt={song.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full gradient-primary flex items-center justify-center">
              <span className="text-4xl">🎵</span>
            </div>
          )}

          {/* Play button overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-black/40 flex items-center justify-center"
          >
            <Button
              size="icon"
              className="h-12 w-12 rounded-full gradient-primary text-primary-foreground shadow-lg"
            >
              {isPlaying && isActive ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </Button>
          </motion.div>

          {/* Playing indicator */}
          {isActive && isPlaying && (
            <div className="absolute bottom-2 right-2 flex items-end gap-0.5 h-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-primary rounded-full equalizer-bar"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <h4 className="font-semibold text-foreground truncate">{song.title}</h4>
        <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'group flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer',
        isActive && 'bg-surface-active'
      )}
      onClick={onPlay}
    >
      {/* Index or Play Icon */}
      <div className="w-5 flex items-center justify-center text-muted-foreground">
        {isActive && isPlaying ? (
          <div className="flex items-end gap-0.5 h-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-0.5 bg-primary rounded-full equalizer-bar"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        ) : (
          <span className="group-hover:hidden text-sm">
            {index !== undefined ? index + 1 : ''}
          </span>
        )}
        <Play className="w-4 h-4 hidden group-hover:block text-foreground" />
      </div>

      {/* Artwork */}
      <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-muted">
        {song.artwork ? (
          <img
            src={song.artwork}
            alt={song.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full gradient-primary flex items-center justify-center">
            <span className="text-lg">🎵</span>
          </div>
        )}
      </div>

      {/* Title & Artist */}
      <div className="flex-1 min-w-0">
        <h4
          className={cn(
            'font-medium truncate text-sm',
            isActive ? 'text-primary' : 'text-foreground'
          )}
        >
          {song.title}
        </h4>
        <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
      </div>

      {/* Duration */}
      <span className="text-sm text-muted-foreground">
        {formatDuration(song.duration)}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8",
            isLiked(song.id) ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(song);
          }}
        >
          <Heart className={cn("w-4 h-4", isLiked(song.id) && "fill-current")} />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onAddToQueue}>
              Add to Queue
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onAddToPlaylist}>
              Add to Playlist
            </DropdownMenuItem>
            <DropdownMenuItem>Share</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}
