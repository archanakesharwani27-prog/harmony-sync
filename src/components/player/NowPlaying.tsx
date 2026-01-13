import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '@/contexts/PlayerContext';
import { useLikes } from '@/contexts/LikesContext';
import { cn } from '@/lib/utils';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  ChevronDown,
  Volume2,
  VolumeX,
  ListMusic,
  Sliders,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export default function NowPlaying() {
  const navigate = useNavigate();
  const { isLiked, toggleLike } = useLikes();
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffle,
    repeat,
    toggle,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    setRepeat,
  } = usePlayer();

  if (!currentSong) {
    navigate('/');
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRepeatClick = () => {
    const modes: Array<'none' | 'all' | 'one'> = ['none', 'all', 'one'];
    const currentIndex = modes.indexOf(repeat);
    setRepeat(modes[(currentIndex + 1) % modes.length]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-background"
    >
      {/* Background with artwork blur */}
      {currentSong.artwork && (
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={currentSong.artwork}
            alt=""
            className="w-full h-full object-cover blur-3xl opacity-30 scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        </div>
      )}

      {/* Content */}
      <div className="relative flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronDown className="w-6 h-6" />
          </Button>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Now Playing
            </p>
            <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
              {currentSong.album || 'Unknown Album'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <Share2 className="w-5 h-5" />
          </Button>
        </div>

        {/* Album Art - Rotating Vinyl */}
        <div className="flex-1 flex items-center justify-center px-8 py-4">
          <motion.div
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
            className={cn(
              'relative w-full max-w-[320px] aspect-square rounded-full overflow-hidden shadow-2xl',
              !isPlaying && 'paused'
            )}
          >
            {currentSong.artwork ? (
              <img
                src={currentSong.artwork}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full gradient-primary flex items-center justify-center">
                <span className="text-8xl">🎵</span>
              </div>
            )}
            {/* Vinyl effect */}
            <div className="absolute inset-0 rounded-full border-4 border-foreground/10" />
            <div className="absolute inset-[35%] rounded-full bg-background/90 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-foreground/20" />
            </div>
          </motion.div>
        </div>

        {/* Song Info */}
        <div className="px-8 text-center">
          <div className="flex items-center justify-center gap-3">
            <h2 className="text-2xl font-bold text-foreground truncate">
              {currentSong.title}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleLike(currentSong)}
              className={cn(
                'h-8 w-8',
                isLiked(currentSong.id) ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Heart className={cn('w-5 h-5', isLiked(currentSong.id) && 'fill-current')} />
            </Button>
          </div>
          <p className="text-lg text-muted-foreground mt-1">{currentSong.artist}</p>
        </div>

        {/* Progress */}
        <div className="px-8 mt-8">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={([value]) => seek(value)}
            className="cursor-pointer"
          />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-muted-foreground">{formatTime(currentTime)}</span>
            <span className="text-xs text-muted-foreground">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-6 px-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleShuffle}
            className={cn(
              'h-10 w-10',
              shuffle ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Shuffle className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={previous}
            className="h-12 w-12 text-foreground hover:text-foreground"
          >
            <SkipBack className="w-7 h-7" />
          </Button>

          <Button
            onClick={toggle}
            size="icon"
            className="h-16 w-16 rounded-full gradient-primary text-primary-foreground hover:opacity-90 glow-primary"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={next}
            className="h-12 w-12 text-foreground hover:text-foreground"
          >
            <SkipForward className="w-7 h-7" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleRepeatClick}
            className={cn(
              'h-10 w-10',
              repeat !== 'none' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {repeat === 'one' ? (
              <Repeat1 className="w-5 h-5" />
            ) : (
              <Repeat className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Volume */}
        <div className="flex items-center justify-center gap-4 mt-6 px-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={([value]) => setVolume(value)}
            className="w-32 cursor-pointer"
          />
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-center gap-8 mt-8 pb-8">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/queue')}
          >
            <ListMusic className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/equalizer')}
          >
            <Sliders className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}