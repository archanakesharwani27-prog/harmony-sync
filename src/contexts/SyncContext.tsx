import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Song } from '@/types/music';

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
}

interface SyncContextType {
  session: SyncSession | null;
  isConnected: boolean;
  isHost: boolean;
  createSession: (name: string, userName: string) => Promise<string>;
  joinSession: (sessionId: string, userName: string) => Promise<boolean>;
  leaveSession: () => void;
  syncPlay: (song: Song, time?: number) => void;
  syncPause: () => void;
  syncSeek: (time: number) => void;
}

const SyncContext = createContext<SyncContextType | null>(null);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SyncSession | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userId] = useState(() => `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  const isHost = session?.hostId === userId;

  // Listen to realtime presence updates
  useEffect(() => {
    if (!session) return;

    const channel = supabase.channel(`sync-${session.id}`, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

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
        if (!isHost) {
          setSession(prev => prev ? { 
            ...prev, 
            currentSong: payload.song, 
            isPlaying: true,
            currentTime: payload.time || 0
          } : null);
        }
      })
      .on('broadcast', { event: 'pause' }, () => {
        if (!isHost) {
          setSession(prev => prev ? { ...prev, isPlaying: false } : null);
        }
      })
      .on('broadcast', { event: 'seek' }, ({ payload }) => {
        if (!isHost) {
          setSession(prev => prev ? { ...prev, currentTime: payload.time } : null);
        }
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
      setIsConnected(false);
    };
  }, [session?.id, userId, isHost]);

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
    setSession(null);
    setIsConnected(false);
    toast.success('Left the session');
  }, []);

  const syncPlay = useCallback((song: Song, time = 0) => {
    if (!session || !isHost) return;
    
    const channel = supabase.channel(`sync-${session.id}`);
    channel.send({
      type: 'broadcast',
      event: 'play',
      payload: { song, time },
    });
    
    setSession(prev => prev ? { ...prev, currentSong: song, isPlaying: true, currentTime: time } : null);
  }, [session, isHost]);

  const syncPause = useCallback(() => {
    if (!session || !isHost) return;
    
    const channel = supabase.channel(`sync-${session.id}`);
    channel.send({
      type: 'broadcast',
      event: 'pause',
      payload: {},
    });
    
    setSession(prev => prev ? { ...prev, isPlaying: false } : null);
  }, [session, isHost]);

  const syncSeek = useCallback((time: number) => {
    if (!session || !isHost) return;
    
    const channel = supabase.channel(`sync-${session.id}`);
    channel.send({
      type: 'broadcast',
      event: 'seek',
      payload: { time },
    });
    
    setSession(prev => prev ? { ...prev, currentTime: time } : null);
  }, [session, isHost]);

  return (
    <SyncContext.Provider value={{
      session,
      isConnected,
      isHost,
      createSession,
      joinSession,
      leaveSession,
      syncPlay,
      syncPause,
      syncSeek,
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
