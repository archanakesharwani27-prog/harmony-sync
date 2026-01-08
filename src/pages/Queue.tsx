import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ListMusic, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/contexts/PlayerContext';
import SongCard from '@/components/ui/SongCard';

export default function Queue() {
  const navigate = useNavigate();
  const { queue, currentSong, isPlaying, playPlaylist, removefromQueue } = usePlayer();

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-4 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div className="flex items-center gap-2">
          <ListMusic className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Queue</h1>
        </div>
      </div>

      {/* Queue List */}
      <div className="px-4 py-4">
        {queue.length === 0 ? (
          <div className="text-center py-16">
            <ListMusic className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Queue is empty</h3>
            <p className="text-muted-foreground">Add songs to your queue to see them here</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl overflow-hidden">
            {queue.map((song, index) => (
              <motion.div
                key={song.id + index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center"
              >
                <div className="flex-1">
                  <SongCard
                    song={song}
                    index={index}
                    variant="list"
                    isPlaying={isPlaying}
                    isActive={currentSong?.id === song.id}
                    onPlay={() => playPlaylist(queue, index)}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-2 text-muted-foreground hover:text-destructive"
                  onClick={() => removefromQueue(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
