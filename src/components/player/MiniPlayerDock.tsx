import React from "react";
import { useLocation } from "react-router-dom";
import { usePlayer } from "@/contexts/PlayerContext";
import MiniPlayer from "@/components/player/MiniPlayer";

export default function MiniPlayerDock() {
  const { currentSong } = usePlayer();
  const location = useLocation();

  // Hide mini player on now-playing page
  if (!currentSong || location.pathname === "/now-playing") return null;

  // Mobile: sits ABOVE the bottom nav (bottom-16 = 64px which is nav height)
  // Desktop: sits at the very bottom
  return (
    <div className="fixed left-0 right-0 z-40 bottom-16 md:bottom-0 pointer-events-auto">
      <MiniPlayer />
    </div>
  );
}
