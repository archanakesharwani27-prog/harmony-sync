import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MiniPlayer from '../player/MiniPlayer';
import { usePlayer } from '@/contexts/PlayerContext';

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
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <Outlet />
        </div>
      </main>

      {/* Mini Player - Fixed at bottom */}
      {currentSong && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <MiniPlayer />
        </div>
      )}
    </div>
  );
}
