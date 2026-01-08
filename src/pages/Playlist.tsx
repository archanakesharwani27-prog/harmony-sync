import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Play, Shuffle, MoreHorizontal, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/contexts/PlayerContext';
import SongCard from '@/components/ui/SongCard';

// Sample playlists data - in a real app this would come from a database
const playlists: Record<string, { name: string; cover: string; songs: any[] }> = {
  liked: {
    name: 'Liked Songs',
    cover: 'https://misc.scdn.co/liked-songs/liked-songs-640.png',
    songs: [],
  },
  recent: {
    name: 'Recently Played',
    cover: '',
    songs: [],
  },
};

export default function Playlist() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentSong, isPlaying, playPlaylist, addToQueue } = usePlayer();

  const playlist = id ? playlists[id] : null;

  if (!playlist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Playlist not found</h2>
          <Button onClick={() => navigate('/library')}>Go to Library</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      {/* Header with back button */}
      <div className="flex items-center gap-4 px-4 py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
      </div>

      {/* Playlist Info */}
      <div className="px-4 py-4">
        <div className="flex items-end gap-4">
          <div className="w-32 h-32 rounded-xl overflow-hidden bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center shadow-lg">
            {playlist.cover ? (
              <img src={playlist.cover} alt={playlist.name} className="w-full h-full object-cover" />
            ) : (
              <Heart className="w-12 h-12 text-primary-foreground" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{playlist.name}</h1>
            <p className="text-muted-foreground">{playlist.songs.length} songs</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-6">
          <Button
            size="lg"
            className="rounded-full gradient-primary"
            disabled={playlist.songs.length === 0}
            onClick={() => playPlaylist(playlist.songs, 0)}
          >
            <Play className="w-5 h-5 mr-2" fill="currentColor" />
            Play
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            disabled={playlist.songs.length === 0}
          >
            <Shuffle className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="ml-auto">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Songs List */}
      <div className="px-4 py-4">
        {playlist.songs.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No songs yet</h3>
            <p className="text-muted-foreground">Songs you add will appear here</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl overflow-hidden">
            {playlist.songs.map((song, index) => (
              <SongCard
                key={song.id}
                song={song}
                index={index}
                variant="list"
                isPlaying={isPlaying}
                isActive={currentSong?.id === song.id}
                onPlay={() => playPlaylist(playlist.songs, index)}
                onAddToQueue={() => addToQueue(song)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
