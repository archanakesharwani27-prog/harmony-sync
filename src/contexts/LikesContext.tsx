import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Song } from '@/types/music';

interface LikesContextType {
  likedSongs: Song[];
  isLiked: (songId: string) => boolean;
  toggleLike: (song: Song) => void;
}

const LikesContext = createContext<LikesContextType | null>(null);

const STORAGE_KEY = 'melodia_liked_songs';

export function LikesProvider({ children }: { children: React.ReactNode }) {
  const [likedSongs, setLikedSongs] = useState<Song[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(likedSongs));
  }, [likedSongs]);

  const isLiked = useCallback((songId: string) => {
    return likedSongs.some(s => s.id === songId);
  }, [likedSongs]);

  const toggleLike = useCallback((song: Song) => {
    setLikedSongs(prev => {
      const exists = prev.some(s => s.id === song.id);
      if (exists) {
        return prev.filter(s => s.id !== song.id);
      }
      return [...prev, song];
    });
  }, []);

  return (
    <LikesContext.Provider value={{ likedSongs, isLiked, toggleLike }}>
      {children}
    </LikesContext.Provider>
  );
}

export function useLikes() {
  const context = useContext(LikesContext);
  if (!context) {
    throw new Error('useLikes must be used within a LikesProvider');
  }
  return context;
}
