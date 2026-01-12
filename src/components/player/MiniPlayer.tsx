import React, { useMemo, useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "@/contexts/PlayerContext";
import { useLikes } from "@/contexts/LikesContext";
import { cn } from "@/lib/utils";
import { Play, Pause, SkipForward, Heart, ChevronUp, Video, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";

// Hidden YouTube audio player - plays in background
const YouTubeAudioPlayer = React.memo(
  function YouTubeAudioPlayer({
    videoId,
    isPlaying,
    onStateChange,
  }: {
    videoId: string;
    isPlaying: boolean;
    onStateChange?: (playing: boolean) => void;
  }) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [src, setSrc] = useState("");
    const lastVideoIdRef = useRef(videoId);

    // Only update the src when the videoId actually changes
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

    // Control playback via postMessage
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

export default function MiniPlayer() {
  const navigate = useNavigate();
  const { isLiked, toggleLike } = useLikes();
  const { 
    currentSong, 
    isPlaying, 
    currentTime, 
    duration, 
    videoMode,
    toggle, 
    next, 
    seek,
    toggleVideoMode,
  } = usePlayer();
  const [ytPlaying, setYtPlaying] = useState(true);

  if (!currentSong) return null;

  const isYouTube = currentSong.id.startsWith("yt-");
  const youtubeId = isYouTube ? currentSong.id.replace("yt-", "") : "";

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleExpandPlayer = () => {
    navigate("/now-playing");
  };

  const handleTogglePlay = () => {
    if (isYouTube) {
      setYtPlaying(!ytPlaying);
    } else {
      toggle();
    }
  };

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="bg-card border-t border-border player-shadow"
    >
      {/* Hidden YouTube player for audio-only mode */}
      {isYouTube && !videoMode && (
        <YouTubeAudioPlayer 
          videoId={youtubeId} 
          isPlaying={ytPlaying}
        />
      )}

      {/* Progress bar at top - clickable seek bar */}
      {!isYouTube && (
        <div
          className="absolute top-0 left-0 right-0 h-1 bg-muted cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            seek(percent * duration);
          }}
        >
          <motion.div
            className="h-full bg-primary"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex items-center gap-2 px-3 py-2 md:px-6 md:py-3">
        {/* Album Art (always show for YouTube in audio mode) */}
        <button
          onClick={handleExpandPlayer}
          className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-muted"
        >
          {currentSong.artwork ? (
            <img
              src={currentSong.artwork}
              alt={currentSong.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full gradient-primary flex items-center justify-center">
              <span className="text-xl">🎵</span>
            </div>
          )}
        </button>

        {/* Title & Artist */}
        <button
          onClick={handleExpandPlayer}
          className="min-w-0 flex-1 text-left"
        >
          <h4 className="font-medium text-foreground truncate text-sm">
            {currentSong.title}
          </h4>
          <p className="text-xs text-muted-foreground truncate">
            {currentSong.artist}
          </p>
        </button>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9",
              isLiked(currentSong.id) ? "text-primary" : "text-muted-foreground"
            )}
            onClick={() => toggleLike(currentSong)}
          >
            <Heart
              className={cn(
                "w-5 h-5",
                isLiked(currentSong.id) && "fill-current"
              )}
            />
          </Button>

          {/* Video/Audio toggle for YouTube */}
          {isYouTube && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleVideoMode}
              className="h-9 w-9 text-muted-foreground"
              title={videoMode ? "Switch to Audio" : "Switch to Video"}
            >
              {videoMode ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </Button>
          )}

          <Button
            onClick={handleTogglePlay}
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-foreground"
          >
            {(isYouTube ? ytPlaying : isPlaying) ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" fill="currentColor" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={next}
            className="h-9 w-9 text-foreground"
          >
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
