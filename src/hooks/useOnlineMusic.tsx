import { useState, useCallback } from 'react';
import type { Song } from '@/types/music';
import { toast } from 'sonner';

// JioSaavn API endpoints (using public API)
const SAAVN_API = 'https://saavn.dev/api';

interface SaavnSong {
  id: string;
  name: string;
  artists: { primary: { name: string }[] };
  album: { name: string };
  duration: number;
  image: { url: string }[];
  downloadUrl: { url: string; quality: string }[];
  language: string;
  year: string;
}

interface SaavnSearchResult {
  success: boolean;
  data: {
    results: SaavnSong[];
  };
}

function transformSaavnSong(song: SaavnSong): Song {
  // Get the best quality download URL
  const downloadUrl = song.downloadUrl?.find(d => d.quality === '320kbps')?.url ||
                      song.downloadUrl?.find(d => d.quality === '160kbps')?.url ||
                      song.downloadUrl?.[0]?.url || '';
  
  // Get the best quality image
  const artwork = song.image?.find(i => i.url?.includes('500x500'))?.url ||
                  song.image?.[song.image.length - 1]?.url || '';
  
  return {
    id: `saavn-${song.id}`,
    title: song.name,
    artist: song.artists?.primary?.map(a => a.name).join(', ') || 'Unknown Artist',
    album: song.album?.name || '',
    duration: song.duration || 0,
    artwork: artwork,
    url: downloadUrl,
    genre: song.language || 'Indian',
    year: parseInt(song.year) || undefined,
    source: 'online',
  };
}

export function useOnlineMusic() {
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingTrending, setIsLoadingTrending] = useState(false);

  const searchSongs = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `${SAAVN_API}/search/songs?query=${encodeURIComponent(query)}&limit=20`
      );
      
      if (!response.ok) throw new Error('Search failed');
      
      const data: SaavnSearchResult = await response.json();
      
      if (data.success && data.data?.results) {
        const songs = data.data.results.map(transformSaavnSong);
        setSearchResults(songs);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search. Try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const fetchTrending = useCallback(async () => {
    setIsLoadingTrending(true);
    try {
      // Search for popular Hindi songs
      const queries = ['arijit singh', 'latest hindi songs', 'bollywood hits'];
      const randomQuery = queries[Math.floor(Math.random() * queries.length)];
      
      const response = await fetch(
        `${SAAVN_API}/search/songs?query=${encodeURIComponent(randomQuery)}&limit=15`
      );
      
      if (!response.ok) throw new Error('Failed to fetch trending');
      
      const data: SaavnSearchResult = await response.json();
      
      if (data.success && data.data?.results) {
        const songs = data.data.results.map(transformSaavnSong);
        setTrendingSongs(songs);
      }
    } catch (error) {
      console.error('Trending error:', error);
    } finally {
      setIsLoadingTrending(false);
    }
  }, []);

  const getSongsByAlbum = useCallback(async (albumId: string): Promise<Song[]> => {
    try {
      const response = await fetch(`${SAAVN_API}/albums?id=${albumId}`);
      if (!response.ok) throw new Error('Failed to fetch album');
      
      const data = await response.json();
      if (data.success && data.data?.songs) {
        return data.data.songs.map(transformSaavnSong);
      }
      return [];
    } catch (error) {
      console.error('Album fetch error:', error);
      return [];
    }
  }, []);

  const getPlaylistSongs = useCallback(async (playlistId: string): Promise<Song[]> => {
    try {
      const response = await fetch(`${SAAVN_API}/playlists?id=${playlistId}`);
      if (!response.ok) throw new Error('Failed to fetch playlist');
      
      const data = await response.json();
      if (data.success && data.data?.songs) {
        return data.data.songs.map(transformSaavnSong);
      }
      return [];
    } catch (error) {
      console.error('Playlist fetch error:', error);
      return [];
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
  }, []);

  return {
    searchResults,
    trendingSongs,
    isSearching,
    isLoadingTrending,
    searchSongs,
    fetchTrending,
    getSongsByAlbum,
    getPlaylistSongs,
    clearSearch,
  };
}
