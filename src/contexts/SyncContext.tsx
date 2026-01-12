import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Song } from '@/types/music';
import { usePlayer } from '@/contexts/PlayerContext';

interface SyncUser {
  id: string;
  name: string;
  isHost: boolean;
}

interface SyncSession {
  id: string;
  name: string;
  hostId: string;
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  users: SyncUser[];
  isLocked: boolean;
  sharedQueue: Song[];
}

interface SyncContextType {
  session: SyncSession | null;
  isConnected: boolean;
  isHost: boolean;
  userId: string;
  createSession: (name: string, userName: string) => Promise<string>;
  joinSession: (sessionId: string, userName: string) => Promise<boolean>;
  leaveSession: () => void;
  syncPlay: (song: Song, time?: number) => void;
  syncPause: () => void;
  syncSeek: (time: number) => void;
  // Host controls
  lockRoom: (locked: boolean) => void;
  kickUser: (userId: string) => void;
  transferHost: (userId: string) => void;
  addToSharedQueue: (song: Song) => void;
  removeFromSharedQueue: (index: number) => void;
  playFromSharedQueue: (index: number) => void;
  clearSharedQueue: () => void;
}

const SyncContext = createContext<SyncContextType | null>(null);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SyncSession | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const userIdRef = useRef(`user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const userId = userIdRef.current;
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  
  // Get player functions to actually play songs on other devices
  const player = usePlayer();

  const isHost = session?.hostId === userId;

  // Listen to realtime presence and broadcast updates
  useEffect(() => {
    if (!session) return;

    // Clean up previous channel
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }

    const channel = supabase.channel(`sync-${session.id}`, {
      config: {
        presence: {
          key: userId,
        },
      },
    });
    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users: SyncUser[] = Object.entries(state).map(([key, value]: [string, any]) => ({
          id: key,
          name: value[0]?.name || 'Unknown',
          isHost: value[0]?.isHost || false,
        }));
        setSession(prev => prev ? { ...prev, users } : null);
      })
      .on('broadcast', { event: 'play' }, ({ payload }) => {
        // Non-hosts should play the song when host broadcasts
        if (!isHost && payload.song) {
          console.log('Received play broadcast:', payload.song.title);
          setSession(prev => prev ? { 
            ...prev, 
            currentSong: payload.song, 
            isPlaying: true,
            currentTime: payload.time || 0
          } : null);
          
          // Actually play the song on this device!
          player.play(payload.song);
        }
      })
      .on('broadcast', { event: 'pause' }, () => {
        if (!isHost) {
          setSession(prev => prev ? { ...prev, isPlaying: false } : null);
          player.pause();
        }
      })
      .on('broadcast', { event: 'seek' }, ({ payload }) => {
        if (!isHost) {
          setSession(prev => prev ? { ...prev, currentTime: payload.time } : null);
          player.seek(payload.time);
        }
      })
      .on('broadcast', { event: 'lock' }, ({ payload }) => {
        setSession(prev => prev ? { ...prev, isLocked: payload.locked } : null);
        toast.info(payload.locked ? 'Room has been locked' : 'Room has been unlocked');
      })
      .on('broadcast', { event: 'kick' }, ({ payload }) => {
        if (payload.userId === userId) {
          toast.error('You have been removed from the session');
          setSession(null);
          setIsConnected(false);
        }
      })
      .on('broadcast', { event: 'transfer_host' }, ({ payload }) => {
        setSession(prev => {
          if (!prev) return null;
          const updatedUsers = prev.users.map(u => ({
            ...u,
            isHost: u.id === payload.newHostId
          }));
          return { ...prev, hostId: payload.newHostId, users: updatedUsers };
        });
        if (payload.newHostId === userId) {
          toast.success('You are now the host!');
        }
      })
      .on('broadcast', { event: 'queue_update' }, ({ payload }) => {
        setSession(prev => prev ? { ...prev, sharedQueue: payload.queue } : null);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          await channel.track({
            name: session.users.find(u => u.id === userId)?.name || 'User',
            isHost: session.hostId === userId,
          });
        }
      });

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
      setIsConnected(false);
    };
  }, [session?.id, userId, isHost, player]);

  const createSession = useCallback(async (name: string, userName: string): Promise<string> => {
    const sessionId = `session-${Date.now()}`;
    const newSession: SyncSession = {
      id: sessionId,
      name,
      hostId: userId,
      currentSong: null,
      isPlaying: false,
      currentTime: 0,
      users: [{ id: userId, name: userName, isHost: true }],
      isLocked: false,
      sharedQueue: [],
    };
    setSession(newSession);
    toast.success('Session created! Share the code with friends.');
    return sessionId;
  }, [userId]);

  const joinSession = useCallback(async (sessionId: string, userName: string): Promise<boolean> => {
    try {
      const newSession: SyncSession = {
        id: sessionId,
        name: 'Sync Session',
        hostId: '',
        currentSong: null,
        isPlaying: false,
        currentTime: 0,
        users: [{ id: userId, name: userName, isHost: false }],
        isLocked: false,
        sharedQueue: [],
      };
      setSession(newSession);
      toast.success('Joined session!');
      return true;
    } catch (error) {
      toast.error('Failed to join session');
      return false;
    }
  }, [userId]);

  const leaveSession = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    setSession(null);
    setIsConnected(false);
    toast.success('Left the session');
  }, []);

  const syncPlay = useCallback((song: Song, time = 0) => {
    if (!session || !isHost) return;
    
    console.log('Host broadcasting play:', song.title);
    
    channelRef.current?.send({
      type: 'broadcast',
      event: 'play',
      payload: { song, time },
    });
    
    setSession(prev => prev ? { ...prev, currentSong: song, isPlaying: true, currentTime: time } : null);
    
    // Host also plays the song
    player.play(song);
  }, [session, isHost, player]);

  const syncPause = useCallback(() => {
    if (!session || !isHost) return;
    
    channelRef.current?.send({
      type: 'broadcast',
      event: 'pause',
      payload: {},
    });
    
    setSession(prev => prev ? { ...prev, isPlaying: false } : null);
    player.pause();
  }, [session, isHost, player]);

  const syncSeek = useCallback((time: number) => {
    if (!session || !isHost) return;
    
    channelRef.current?.send({
      type: 'broadcast',
      event: 'seek',
      payload: { time },
    });
    
    setSession(prev => prev ? { ...prev, currentTime: time } : null);
    player.seek(time);
  }, [session, isHost, player]);

  // Host controls
  const lockRoom = useCallback((locked: boolean) => {
    if (!session || !isHost) return;

    channelRef.current?.send({
      type: 'broadcast',
      event: 'lock',
      payload: { locked },
    });

    setSession(prev => prev ? { ...prev, isLocked: locked } : null);
    toast.success(locked ? 'Room locked' : 'Room unlocked');
  }, [session, isHost]);

  const kickUser = useCallback((targetUserId: string) => {
    if (!session || !isHost || targetUserId === userId) return;

    channelRef.current?.send({
      type: 'broadcast',
      event: 'kick',
      payload: { userId: targetUserId },
    });

    setSession(prev => prev ? {
      ...prev,
      users: prev.users.filter(u => u.id !== targetUserId)
    } : null);

    toast.success('User removed from session');
  }, [session, isHost, userId]);

  const transferHost = useCallback((newHostId: string) => {
    if (!session || !isHost || newHostId === userId) return;

    channelRef.current?.send({
      type: 'broadcast',
      event: 'transfer_host',
      payload: { newHostId },
    });

    setSession(prev => {
      if (!prev) return null;
      const updatedUsers = prev.users.map(u => ({
        ...u,
        isHost: u.id === newHostId
      }));
      return { ...prev, hostId: newHostId, users: updatedUsers };
    });

    toast.success('Host transferred');
  }, [session, isHost, userId]);

  const addToSharedQueue = useCallback((song: Song) => {
    if (!session) return;

    const newQueue = [...session.sharedQueue, song];
    
    channelRef.current?.send({
      type: 'broadcast',
      event: 'queue_update',
      payload: { queue: newQueue },
    });

    setSession(prev => prev ? { ...prev, sharedQueue: newQueue } : null);
    toast.success('Added to shared queue');
  }, [session]);

  const removeFromSharedQueue = useCallback((index: number) => {
    if (!session || !isHost) return;

    const newQueue = session.sharedQueue.filter((_, i) => i !== index);
    
    channelRef.current?.send({
      type: 'broadcast',
      event: 'queue_update',
      payload: { queue: newQueue },
    });

    setSession(prev => prev ? { ...prev, sharedQueue: newQueue } : null);
  }, [session, isHost]);

  const playFromSharedQueue = useCallback((index: number) => {
    if (!session || !isHost) return;

    const song = session.sharedQueue[index];
    if (!song) return;

    // Remove from queue and play
    const newQueue = session.sharedQueue.filter((_, i) => i !== index);
    
    channelRef.current?.send({
      type: 'broadcast',
      event: 'queue_update',
      payload: { queue: newQueue },
    });

    syncPlay(song, 0);
    setSession(prev => prev ? { ...prev, sharedQueue: newQueue } : null);
  }, [session, isHost, syncPlay]);

  const clearSharedQueue = useCallback(() => {
    if (!session || !isHost) return;

    channelRef.current?.send({
      type: 'broadcast',
      event: 'queue_update',
      payload: { queue: [] },
    });

    setSession(prev => prev ? { ...prev, sharedQueue: [] } : null);
    toast.success('Queue cleared');
  }, [session, isHost]);

  return (
    <SyncContext.Provider value={{
      session,
      isConnected,
      isHost,
      userId,
      createSession,
      joinSession,
      leaveSession,
      syncPlay,
      syncPause,
      syncSeek,
      lockRoom,
      kickUser,
      transferHost,
      addToSharedQueue,
      removeFromSharedQueue,
      playFromSharedQueue,
      clearSharedQueue,
    }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
}
