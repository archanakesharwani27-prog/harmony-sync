import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '@/contexts/PlayerContext';
import { cn } from '@/lib/utils';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export default function MiniPlayer() {
  const navigate = useNavigate();
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    toggle,
    next,
    previous,
    seek,
  } = usePlayer();

  if (!currentSong) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExpandPlayer = () => {
    navigate('/now-playing');
  };

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="bg-card border-t border-border player-shadow"
    >
      {/* Progress bar at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
        <motion.div
          className="h-full gradient-primary"
          style={{ width: `${progress}%` }}
          layoutId="progress"
        />
      </div>

      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        {/* Song Info */}
        <button
          onClick={handleExpandPlayer}
          className="flex items-center gap-3 flex-1 min-w-0 text-left"
        >
          {/* Album Art */}
          <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
            {currentSong.artwork ? (
              <img
                src={currentSong.artwork}
                alt={currentSong.title}
                className={cn(
                  'w-full h-full object-cover transition-transform duration-300',
                  isPlaying && 'scale-105'
                )}
              />
            ) : (
              <div className="w-full h-full gradient-primary flex items-center justify-center">
                <span className="text-2xl">🎵</span>
              </div>
            )}
          </div>

          {/* Title & Artist */}
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-foreground truncate text-sm md:text-base">
              {currentSong.title}
            </h4>
            <p className="text-xs md:text-sm text-muted-foreground truncate">
              {currentSong.artist}
            </p>
          </div>
        </button>

        {/* Controls */}
        <div className="flex items-center gap-1 md:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex h-9 w-9 text-muted-foreground hover:text-foreground"
          >
            <Heart className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={previous}
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
          >
            <SkipBack className="w-5 h-5" />
          </Button>

          <Button
            onClick={toggle}
            size="icon"
            className="h-10 w-10 rounded-full gradient-primary text-primary-foreground hover:opacity-90"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={next}
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
          >
            <SkipForward className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleExpandPlayer}
            className="h-9 w-9 text-muted-foreground hover:text-foreground md:hidden"
          >
            <ChevronUp className="w-5 h-5" />
          </Button>
        </div>

        {/* Desktop: Time & Volume */}
        <div className="hidden lg:flex items-center gap-4 ml-6 min-w-[200px]">
          <span className="text-xs text-muted-foreground w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={([value]) => seek(value)}
            className="w-32 cursor-pointer"
          />
          <span className="text-xs text-muted-foreground w-10">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Mobile bottom padding for navigation */}
      <div className="h-16 md:hidden" />
    </motion.div>
  );
}
