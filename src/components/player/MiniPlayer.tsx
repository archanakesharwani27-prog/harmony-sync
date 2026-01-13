import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "@/contexts/PlayerContext";
import { useLikes } from "@/contexts/LikesContext";
import { cn } from "@/lib/utils";
import { Play, Pause, SkipForward, Heart, Video, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  if (!currentSong) return null;

  const isYouTube = currentSong.id.startsWith("yt-");
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleExpandPlayer = () => {
    navigate("/now-playing");
  };

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="bg-card border-t border-border player-shadow"
    >
      {/* Progress bar at top - clickable seek bar */}
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

      <div className="flex items-center gap-2 px-3 py-2 md:px-6 md:py-3">
        {/* Album Art */}
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
            onClick={toggle}
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-foreground"
          >
            {isPlaying ? (
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