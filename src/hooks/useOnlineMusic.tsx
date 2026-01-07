import { useState, useCallback } from 'react';
import type { Song } from '@/types/music';
import { toast } from 'sonner';

// YouTube Data API
const YOUTUBE_API_KEY = 'AIzaSyDm5ecl-qgSbq6P6dWtSUFpL4_Cj7Qcjcw';
const YOUTUBE_API = 'https://www.googleapis.com/youtube/v3';

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      high: { url: string };
      medium: { url: string };
      default: { url: string };
    };
    publishedAt: string;
  };
}

interface YouTubeSearchResponse {
  items: YouTubeSearchItem[];
}

function transformYouTubeSong(item: YouTubeSearchItem): Song {
  const thumbnail = item.snippet.thumbnails.high?.url || 
                    item.snippet.thumbnails.medium?.url || 
                    item.snippet.thumbnails.default?.url || '';
  
  return {
    id: `yt-${item.id.videoId}`,
    title: item.snippet.title.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim(),
    artist: item.snippet.channelTitle.replace(' - Topic', '').replace('VEVO', '').trim(),
    album: '',
    duration: 0, // YouTube API doesn't provide duration in search
    artwork: thumbnail,
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    genre: 'Music',
    year: new Date(item.snippet.publishedAt).getFullYear(),
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
        `${YOUTUBE_API}/search?part=snippet&q=${encodeURIComponent(query + ' official audio')}&type=video&videoCategoryId=10&maxResults=20&key=${YOUTUBE_API_KEY}`
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Search failed');
      }
      
      const data: YouTubeSearchResponse = await response.json();
      
      if (data.items) {
        const songs = data.items.map(transformYouTubeSong);
        setSearchResults(songs);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const fetchTrending = useCallback(async () => {
    setIsLoadingTrending(true);
    try {
      // Search for trending Hindi songs
      const queries = ['latest hindi songs 2024', 'bollywood hits', 'punjabi songs new'];
      const randomQuery = queries[Math.floor(Math.random() * queries.length)];
      
      const response = await fetch(
        `${YOUTUBE_API}/search?part=snippet&q=${encodeURIComponent(randomQuery)}&type=video&videoCategoryId=10&maxResults=15&key=${YOUTUBE_API_KEY}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch trending');
      
      const data: YouTubeSearchResponse = await response.json();
      
      if (data.items) {
        const songs = data.items.map(transformYouTubeSong);
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
      const response = await fetch(
        `${YOUTUBE_API}/search?part=snippet&q=${encodeURIComponent(albumId)}&type=video&videoCategoryId=10&maxResults=20&key=${YOUTUBE_API_KEY}`
      );
      if (!response.ok) throw new Error('Failed to fetch album');
      
      const data: YouTubeSearchResponse = await response.json();
      if (data.items) {
        return data.items.map(transformYouTubeSong);
      }
      return [];
    } catch (error) {
      console.error('Album fetch error:', error);
      return [];
    }
  }, []);

  const getPlaylistSongs = useCallback(async (playlistId: string): Promise<Song[]> => {
    try {
      const response = await fetch(
        `${YOUTUBE_API}/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${YOUTUBE_API_KEY}`
      );
      if (!response.ok) throw new Error('Failed to fetch playlist');
      
      const data = await response.json();
      if (data.items) {
        return data.items.map((item: any) => ({
          id: `yt-${item.snippet.resourceId.videoId}`,
          title: item.snippet.title,
          artist: item.snippet.channelTitle,
          album: '',
          duration: 0,
          artwork: item.snippet.thumbnails?.high?.url || '',
          url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
          genre: 'Music',
          source: 'online' as const,
        }));
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
