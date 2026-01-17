export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // in seconds
  artwork?: string;
  source: 'local' | 'online';
  url: string;
  genre?: string;
  year?: number;
  addedAt?: Date;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  artwork?: string;
  songs: Song[];
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  userId?: string;
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  shuffle: boolean;
  repeat: 'none' | 'one' | 'all';
  queue: Song[];
  queueIndex: number;
}

export interface EqualizerPreset {
  id: string;
  name: string;
  gains: number[]; // 5-band or 10-band
}

export interface SyncSession {
  id: string;
  code: string;
  hostId: string;
  currentSongId?: string;
  currentTime: number;
  isPlaying: boolean;
  createdAt: Date;
  participants: string[];
}

export interface AudioMode {
  id: string;
  name: string;
  icon: string;
  description: string;
  equalizerPreset: EqualizerPreset;
}

export type RepeatMode = 'none' | 'one' | 'all';

export interface SearchResult {
  songs: Song[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
}

export interface Album {
  id: string;
  name: string;
  artist: string;
  artwork?: string;
  year?: number;
  songs: Song[];
}

export interface Artist {
  id: string;
  name: string;
  image?: string;
  genres?: string[];
  albums?: Album[];
}
