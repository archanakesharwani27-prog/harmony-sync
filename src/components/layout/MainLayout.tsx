import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { usePlayer } from "@/contexts/PlayerContext";
import { cn } from "@/lib/utils";

export default function MainLayout() {
  const { currentSong } = usePlayer();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar - Hidden on mobile, visible on md+ */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div
          className={cn(
            "flex-1 overflow-y-auto custom-scrollbar",
            // Reserve space for fixed bottom UI (mobile nav + optional mini player)
            currentSong ? "pb-32 md:pb-20" : "pb-16 md:pb-0"
          )}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}

