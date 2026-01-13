import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';
import { Howl } from 'howler';
import { toast } from 'sonner';
import type { Song, PlayerState, RepeatMode } from '@/types/music';
import { supabase } from '@/integrations/supabase/client';

interface PlayerContextType extends PlayerState {
  play: (song?: Song) => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  setRepeat: (mode: RepeatMode) => void;
  addToQueue: (songs: Song | Song[]) => void;
  clearQueue: () => void;
  playPlaylist: (songs: Song[], startIndex?: number) => void;
  removefromQueue: (index: number) => void;
  toggleVideoMode: () => void;
}

type PlayerAction =
  | { type: 'SET_SONG'; payload: Song }
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'SET_MUTED'; payload: boolean }
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_SHUFFLE'; payload: boolean }
  | { type: 'SET_REPEAT'; payload: RepeatMode }
  | { type: 'SET_QUEUE'; payload: Song[] }
  | { type: 'SET_QUEUE_INDEX'; payload: number }
  | { type: 'ADD_TO_QUEUE'; payload: Song[] }
  | { type: 'REMOVE_FROM_QUEUE'; payload: number }
  | { type: 'CLEAR_QUEUE' }
  | { type: 'SET_VIDEO_MODE'; payload: boolean };

const initialState: PlayerState = {
  currentSong: null,
  isPlaying: false,
  volume: 0.7,
  isMuted: false,
  currentTime: 0,
  duration: 0,
  shuffle: false,
  repeat: 'none',
  queue: [],
  queueIndex: -1,
  videoMode: false, // Default to audio-only mode like YT Music
};

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'SET_SONG':
      return { ...state, currentSong: action.payload };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    case 'SET_VOLUME':
      return { ...state, volume: action.payload };
    case 'SET_MUTED':
      return { ...state, isMuted: action.payload };
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    case 'SET_SHUFFLE':
      return { ...state, shuffle: action.payload };
    case 'SET_REPEAT':
      return { ...state, repeat: action.payload };
    case 'SET_QUEUE':
      return { ...state, queue: action.payload };
    case 'SET_QUEUE_INDEX':
      return { ...state, queueIndex: action.payload };
    case 'ADD_TO_QUEUE':
      return { ...state, queue: [...state.queue, ...action.payload] };
    case 'REMOVE_FROM_QUEUE':
      return {
        ...state,
        queue: state.queue.filter((_, i) => i !== action.payload),
        queueIndex: action.payload < state.queueIndex ? state.queueIndex - 1 : state.queueIndex,
      };
    case 'CLEAR_QUEUE':
      return { ...state, queue: [], queueIndex: -1, currentSong: null };
    case 'SET_VIDEO_MODE':
      return { ...state, videoMode: action.payload };
    default:
      return state;
  }
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const howlRef = useRef<Howl | null>(null);
  const intervalRef = useRef<number | null>(null);

  const clearTimeInterval = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimeInterval = useCallback(() => {
    clearTimeInterval();
    intervalRef.current = window.setInterval(() => {
      if (howlRef.current && howlRef.current.playing()) {
        dispatch({ type: 'SET_CURRENT_TIME', payload: howlRef.current.seek() as number });
      }
    }, 250);
  }, [clearTimeInterval]);

  const loadSong = useCallback(
    async (song: Song) => {
      if (howlRef.current) {
        howlRef.current.unload();
        howlRef.current = null;
      }

      clearTimeInterval();
      dispatch({ type: 'SET_PLAYING', payload: false });
      dispatch({ type: 'SET_SONG', payload: song });
      dispatch({ type: 'SET_CURRENT_TIME', payload: 0 });

      let audioUrl = song.url;

      // YouTube tracks: try to extract audio via edge function
      if (song.id.startsWith('yt-')) {
        const videoId = song.id.replace('yt-', '');
        try {
          console.log('Extracting audio for YouTube video:', videoId);
          const { data, error } = await supabase.functions.invoke('youtube-audio', {
            body: { videoId },
          });

          if (error || !data?.audioUrl) {
            console.error('Failed to extract YouTube audio:', error || 'No audio URL');
            // YouTube audio extraction failed - the UI will handle this via videoMode
            dispatch({ type: 'SET_VIDEO_MODE', payload: true });
            dispatch({ type: 'SET_PLAYING', payload: true });
            return;
          }

          audioUrl = data.audioUrl;
          console.log('Got audio URL:', audioUrl);
        } catch (err) {
          console.error('YouTube audio extraction error:', err);
          // Fallback to video mode
          dispatch({ type: 'SET_VIDEO_MODE', payload: true });
          dispatch({ type: 'SET_PLAYING', payload: true });
          return;
        }
      }

      howlRef.current = new Howl({
        src: [audioUrl],
        html5: true,
        volume: state.isMuted ? 0 : state.volume,
        onload: () => {
          dispatch({ type: 'SET_DURATION', payload: howlRef.current?.duration() || 0 });
        },
        onplay: () => {
          dispatch({ type: 'SET_PLAYING', payload: true });
          startTimeInterval();
          updateMediaSession(song);
        },
        onpause: () => {
          dispatch({ type: 'SET_PLAYING', payload: false });
          clearTimeInterval();
        },
        onend: () => {
          dispatch({ type: 'SET_PLAYING', payload: false });
          clearTimeInterval();
          handleSongEnd();
        },
        onloaderror: (_, error) => {
          console.error('Howler load error:', error);
          // For YouTube, fall back to video mode on error
          if (song.id.startsWith('yt-')) {
            dispatch({ type: 'SET_VIDEO_MODE', payload: true });
            dispatch({ type: 'SET_PLAYING', payload: true });
          } else {
            toast.error('Failed to load audio');
            dispatch({ type: 'SET_PLAYING', payload: false });
          }
        },
        onplayerror: (_, error) => {
          console.error('Howler play error:', error);
          if (song.id.startsWith('yt-')) {
            dispatch({ type: 'SET_VIDEO_MODE', payload: true });
          } else {
            toast.error('Failed to play audio');
            dispatch({ type: 'SET_PLAYING', payload: false });
          }
        },
      });

      howlRef.current.play();
    },
    [state.volume, state.isMuted, startTimeInterval, clearTimeInterval]
  );

  const handleSongEnd = useCallback(async () => {
    const { repeat, queue, queueIndex, shuffle } = state;

    if (repeat === 'one') {
      howlRef.current?.seek(0);
      howlRef.current?.play();
      return;
    }

    let nextIndex = queueIndex + 1;

    if (shuffle && queue.length > 1) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * queue.length);
      } while (randomIndex === queueIndex);
      nextIndex = randomIndex;
    }

    if (nextIndex >= queue.length) {
      if (repeat === 'all') {
        nextIndex = 0;
      } else {
        return;
      }
    }

    dispatch({ type: 'SET_QUEUE_INDEX', payload: nextIndex });
    await loadSong(queue[nextIndex]);
    howlRef.current?.play();
  }, [state, loadSong]);

  const updateMediaSession = useCallback((song: Song) => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artist,
        album: song.album || '',
        artwork: song.artwork ? [{ src: song.artwork, sizes: '512x512', type: 'image/jpeg' }] : [],
      });

      navigator.mediaSession.setActionHandler('play', () => howlRef.current?.play());
      navigator.mediaSession.setActionHandler('pause', () => howlRef.current?.pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => previous());
      navigator.mediaSession.setActionHandler('nexttrack', () => next());
    }
  }, []);

  const play = useCallback(async (song?: Song) => {
    if (song) {
      await loadSong(song);
      howlRef.current?.play();
    } else if (howlRef.current) {
      howlRef.current.play();
    }
  }, [loadSong]);

  const pause = useCallback(() => {
    howlRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    if (howlRef.current?.playing()) {
      pause();
    } else {
      howlRef.current?.play();
    }
  }, [pause]);

  const next = useCallback(async () => {
    const { queue, queueIndex, shuffle, repeat } = state;
    if (queue.length === 0) return;

    let nextIndex = queueIndex + 1;

    if (shuffle) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * queue.length);
      } while (randomIndex === queueIndex && queue.length > 1);
      nextIndex = randomIndex;
    }

    if (nextIndex >= queue.length) {
      if (repeat === 'all') {
        nextIndex = 0;
      } else {
        return;
      }
    }

    dispatch({ type: 'SET_QUEUE_INDEX', payload: nextIndex });
    await loadSong(queue[nextIndex]);
    howlRef.current?.play();
  }, [state, loadSong]);

  const previous = useCallback(async () => {
    const { queue, queueIndex, currentTime } = state;
    
    // If more than 3 seconds in, restart current song
    if (currentTime > 3) {
      howlRef.current?.seek(0);
      dispatch({ type: 'SET_CURRENT_TIME', payload: 0 });
      return;
    }

    if (queue.length === 0) return;

    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) {
      prevIndex = state.repeat === 'all' ? queue.length - 1 : 0;
    }

    dispatch({ type: 'SET_QUEUE_INDEX', payload: prevIndex });
    await loadSong(queue[prevIndex]);
    howlRef.current?.play();
  }, [state, loadSong]);

  const seek = useCallback((time: number) => {
    howlRef.current?.seek(time);
    dispatch({ type: 'SET_CURRENT_TIME', payload: time });
  }, []);

  const setVolume = useCallback((volume: number) => {
    dispatch({ type: 'SET_VOLUME', payload: volume });
    dispatch({ type: 'SET_MUTED', payload: false });
    if (howlRef.current) {
      howlRef.current.volume(volume);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const newMuted = !state.isMuted;
    dispatch({ type: 'SET_MUTED', payload: newMuted });
    if (howlRef.current) {
      howlRef.current.volume(newMuted ? 0 : state.volume);
    }
  }, [state.isMuted, state.volume]);

  const toggleShuffle = useCallback(() => {
    dispatch({ type: 'SET_SHUFFLE', payload: !state.shuffle });
  }, [state.shuffle]);

  const setRepeat = useCallback((mode: RepeatMode) => {
    dispatch({ type: 'SET_REPEAT', payload: mode });
  }, []);

  const addToQueue = useCallback((songs: Song | Song[]) => {
    const songsArray = Array.isArray(songs) ? songs : [songs];
    dispatch({ type: 'ADD_TO_QUEUE', payload: songsArray });
  }, []);

  const clearQueue = useCallback(() => {
    howlRef.current?.unload();
    clearTimeInterval();
    dispatch({ type: 'CLEAR_QUEUE' });
    dispatch({ type: 'SET_PLAYING', payload: false });
  }, [clearTimeInterval]);

  const playPlaylist = useCallback(async (songs: Song[], startIndex = 0) => {
    dispatch({ type: 'SET_QUEUE', payload: songs });
    dispatch({ type: 'SET_QUEUE_INDEX', payload: startIndex });
    await loadSong(songs[startIndex]);
    howlRef.current?.play();
  }, [loadSong]);

  const removefromQueue = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_FROM_QUEUE', payload: index });
  }, []);

  const toggleVideoMode = useCallback(() => {
    dispatch({ type: 'SET_VIDEO_MODE', payload: !state.videoMode });
  }, [state.videoMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeInterval();
      howlRef.current?.unload();
    };
  }, [clearTimeInterval]);

  const value: PlayerContextType = {
    ...state,
    play,
    pause,
    toggle,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    setRepeat,
    addToQueue,
    clearQueue,
    playPlaylist,
    removefromQueue,
    toggleVideoMode,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
