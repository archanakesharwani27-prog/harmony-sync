import React from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import MiniPlayer from "@/components/player/MiniPlayer";

export default function MiniPlayerDock() {
  const { currentSong } = usePlayer();
  if (!currentSong) return null;

  // On mobile we keep the mini player ABOVE the bottom nav (h-16)
  return (
    <div className="fixed left-0 right-0 z-50 bottom-16 md:bottom-0">
      <MiniPlayer />
    </div>
  );
}
