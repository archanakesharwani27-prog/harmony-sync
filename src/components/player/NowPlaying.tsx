import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Video,
  VideoOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { AspectRatio } from '@/components/ui/aspect-ratio';

// Hidden YouTube audio player
const YouTubeHiddenPlayer = React.memo(
  function YouTubeHiddenPlayer({
    videoId,
    isPlaying,
  }: {
    videoId: string;
    isPlaying: boolean;
  }) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [src, setSrc] = useState("");
    const lastVideoIdRef = useRef(videoId);

    useEffect(() => {
      if (lastVideoIdRef.current !== videoId) {
        lastVideoIdRef.current = videoId;
        const origin =
          typeof window !== "undefined"
            ? encodeURIComponent(window.location.origin)
            : "";
        const params = new URLSearchParams({
          autoplay: "1",
          playsinline: "1",
          controls: "0",
          rel: "0",
          mute: "0",
          enablejsapi: "1",
        });
        if (origin) params.set("origin", origin);
        setSrc(`https://www.youtube.com/embed/${videoId}?${params.toString()}`);
      }
    }, [videoId]);

    useEffect(() => {
      if (iframeRef.current && src) {
        const command = isPlaying ? "playVideo" : "pauseVideo";
        iframeRef.current.contentWindow?.postMessage(
          JSON.stringify({ event: "command", func: command }),
          "*"
        );
      }
    }, [isPlaying, src]);

    if (!src) return null;

    return (
      <iframe
        ref={iframeRef}
        title="YouTube Audio"
        src={src}
        className="absolute w-1 h-1 opacity-0 pointer-events-none"
        allow="autoplay; encrypted-media"
        style={{ position: 'absolute', left: '-9999px' }}
      />
    );
  },
  (prev, next) => prev.videoId === next.videoId && prev.isPlaying === next.isPlaying
);

export default function NowPlaying() {
  const navigate = useNavigate();
  const { isLiked, toggleLike } = useLikes();
  const [ytPlaying, setYtPlaying] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffle,
    repeat,
    videoMode,
    toggle,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    setRepeat,
    toggleVideoMode,
  } = usePlayer();

  if (!currentSong) {
    navigate('/');
    return null;
  }

  const isYouTube = currentSong.id.startsWith('yt-');
  const youtubeId = isYouTube ? currentSong.id.replace('yt-', '') : '';

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

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

  const handleTogglePlay = () => {
    if (isYouTube) {
      if (videoMode && iframeRef.current) {
        const command = ytPlaying ? 'pauseVideo' : 'playVideo';
        iframeRef.current.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: command }),
          '*'
        );
      }
      setYtPlaying(!ytPlaying);
    } else {
      toggle();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-background"
    >
      {/* Hidden YouTube player for audio-only mode */}
      {isYouTube && !videoMode && (
        <YouTubeHiddenPlayer videoId={youtubeId} isPlaying={ytPlaying} />
      )}

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
          <div className="flex items-center gap-1">
            {/* Video/Audio toggle for YouTube */}
            {isYouTube && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleVideoMode}
                className="text-muted-foreground hover:text-foreground"
                title={videoMode ? "Switch to Audio" : "Switch to Video"}
              >
                {videoMode ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Media */}
        <div className="flex-1 flex items-center justify-center px-8 py-4">
          {isYouTube && videoMode ? (
            // Video mode - show YouTube player
            <div className="w-full max-w-[720px]">
              <AspectRatio
                ratio={16 / 9}
                className="overflow-hidden rounded-xl border border-border bg-muted"
              >
                <iframe
                  ref={iframeRef}
                  title={currentSong.title}
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&playsinline=1&controls=1&rel=0&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`}
                  className="h-full w-full"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </AspectRatio>
            </div>
          ) : (
            // Audio mode - show rotating album art (for both local and YouTube)
            <motion.div
              animate={{ rotate: (isYouTube ? ytPlaying : isPlaying) ? 360 : 0 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              style={{ animationPlayState: (isYouTube ? ytPlaying : isPlaying) ? 'running' : 'paused' }}
              className={cn(
                'relative w-full max-w-[320px] aspect-square rounded-full overflow-hidden shadow-2xl',
                !(isYouTube ? ytPlaying : isPlaying) && 'paused'
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
          )}
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

        {/* Progress - only for non-YouTube or add a note */}
        {!isYouTube && (
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
        )}

        {isYouTube && !videoMode && (
          <div className="px-8 mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Audio playing • Tap video icon to switch to video
            </p>
          </div>
        )}

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
            onClick={handleTogglePlay}
            size="icon"
            className="h-16 w-16 rounded-full gradient-primary text-primary-foreground hover:opacity-90 glow-primary"
          >
            {(isYouTube ? ytPlaying : isPlaying) ? (
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
        {!isYouTube && (
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
        )}

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
