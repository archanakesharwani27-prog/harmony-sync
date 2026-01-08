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

  const isYouTube = currentSong.id.startsWith('yt-');

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
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-muted">
        <motion.div
          className="h-full bg-primary"
          style={{ width: `${progress}%` }}
          layoutId="progress"
        />
      </div>

      <div className="flex items-center justify-between px-3 py-2 md:px-6 md:py-3">
        {/* Song Info */}
        <button
          onClick={handleExpandPlayer}
          className="flex items-center gap-3 flex-1 min-w-0 text-left"
        >
          {/* Album Art */}
          <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-muted">
            {currentSong.artwork ? (
              <img
                src={currentSong.artwork}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full gradient-primary flex items-center justify-center">
                <span className="text-xl">🎵</span>
              </div>
            )}
          </div>

          {/* Title & Artist */}
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-foreground truncate text-sm">
              {currentSong.title}
            </h4>
            <p className="text-xs text-muted-foreground truncate">
              {currentSong.title}
            </p>
          </div>
        </button>

        {/* Controls - JioSaavn Style */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-foreground"
          >
            <Heart className="w-5 h-5" />
          </Button>

          <Button
            onClick={isYouTube ? handleExpandPlayer : toggle}
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-foreground"
          >
            {isYouTube ? (
              <ChevronUp className="w-6 h-6" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" fill="currentColor" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={next}
            className="h-10 w-10 text-foreground"
          >
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>

        {/* Desktop: Time & Slider */}
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
