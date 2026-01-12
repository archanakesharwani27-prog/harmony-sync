import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { usePlayer } from "@/contexts/PlayerContext";

export default function MainLayout() {
  const { currentSong } = usePlayer();

  // Mobile: nav=64px, miniplayer=~72px when playing
  // Desktop: miniplayer=~72px when playing
  const mobileBottomPadding = currentSong ? "pb-36" : "pb-20";
  const desktopBottomPadding = currentSong ? "md:pb-24" : "md:pb-4";

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar - Hidden on mobile, visible on md+ */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div
          className={`flex-1 overflow-y-auto custom-scrollbar ${mobileBottomPadding} ${desktopBottomPadding}`}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}

