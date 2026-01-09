import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Heart, Play, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SongCard from '@/components/ui/SongCard';
import { usePlayer } from '@/contexts/PlayerContext';
import { useLikes } from '@/contexts/LikesContext';

export default function LikedSongs() {
  const navigate = useNavigate();
  const { currentSong, isPlaying, playPlaylist, addToQueue } = usePlayer();
  const { likedSongs } = useLikes();

  const handlePlayAll = () => {
    if (likedSongs.length > 0) {
      playPlaylist(likedSongs, 0);
    }
  };

  const handleShuffle = () => {
    if (likedSongs.length > 0) {
      const shuffled = [...likedSongs].sort(() => Math.random() - 0.5);
      playPlaylist(shuffled, 0);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-32"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center gap-4 px-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" fill="white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Liked Songs</h1>
              <p className="text-sm text-muted-foreground">{likedSongs.length} songs</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {likedSongs.length > 0 && (
          <div className="flex gap-3 px-4 pb-4">
            <Button
              onClick={handlePlayAll}
              className="flex-1 gap-2 gradient-primary"
            >
              <Play className="w-4 h-4" fill="currentColor" />
              Play All
            </Button>
            <Button
              variant="outline"
              onClick={handleShuffle}
              className="gap-2"
            >
              <Shuffle className="w-4 h-4" />
              Shuffle
            </Button>
          </div>
        )}
      </div>

      {/* Songs List */}
      <div className="px-4 py-4">
        {likedSongs.length > 0 ? (
          <div className="bg-card rounded-xl overflow-hidden">
            {likedSongs.map((song, index) => (
              <SongCard
                key={song.id}
                song={song}
                index={index}
                variant="list"
                isPlaying={isPlaying}
                isActive={currentSong?.id === song.id}
                onPlay={() => playPlaylist(likedSongs, index)}
                onAddToQueue={() => addToQueue(song)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-foreground font-medium">No liked songs yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Tap the heart icon on any song to add it here
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
