import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { Song, Playlist } from '@/types/music';

interface PlaylistContextType {
  playlists: Playlist[];
  createPlaylist: (name: string, description?: string) => Playlist;
  deletePlaylist: (id: string) => void;
  renamePlaylist: (id: string, name: string) => void;
  addSongToPlaylist: (playlistId: string, song: Song) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  getPlaylist: (id: string) => Playlist | undefined;
}

const PlaylistContext = createContext<PlaylistContextType | null>(null);

const STORAGE_KEY = 'music-app-playlists';

export function PlaylistProvider({ children }: { children: React.ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
  }, [playlists]);

  const createPlaylist = useCallback((name: string, description?: string): Playlist => {
    const now = new Date();
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name,
      description,
      artwork: '',
      songs: [],
      createdAt: now,
      updatedAt: now,
      isPublic: false,
    };
    setPlaylists(prev => [...prev, newPlaylist]);
    toast.success(`Playlist "${name}" created!`);
    return newPlaylist;
  }, []);

  const deletePlaylist = useCallback((id: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== id));
    toast.success('Playlist deleted');
  }, []);

  const renamePlaylist = useCallback((id: string, name: string) => {
    setPlaylists(prev => prev.map(p => p.id === id ? { ...p, name } : p));
    toast.success('Playlist renamed');
  }, []);

  const addSongToPlaylist = useCallback((playlistId: string, song: Song) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        if (p.songs.some(s => s.id === song.id)) {
          toast.error('Song already in playlist');
          return p;
        }
        toast.success(`Added to ${p.name}`);
        return { 
          ...p, 
          songs: [...p.songs, song],
          updatedAt: new Date(),
          artwork: p.songs.length === 0 ? song.artwork : p.artwork
        };
      }
      return p;
    }));
  }, []);

  const removeSongFromPlaylist = useCallback((playlistId: string, songId: string) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        return { ...p, songs: p.songs.filter(s => s.id !== songId), updatedAt: new Date() };
      }
      return p;
    }));
    toast.success('Song removed from playlist');
  }, []);

  const getPlaylist = useCallback((id: string) => {
    return playlists.find(p => p.id === id);
  }, [playlists]);

  return (
    <PlaylistContext.Provider value={{
      playlists,
      createPlaylist,
      deletePlaylist,
      renamePlaylist,
      addSongToPlaylist,
      removeSongFromPlaylist,
      getPlaylist,
    }}>
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylists() {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error('usePlaylists must be used within a PlaylistProvider');
  }
  return context;
}
