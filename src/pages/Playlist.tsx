import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Play, Shuffle, MoreHorizontal, Heart, Trash2, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/contexts/PlayerContext';
import { usePlaylists } from '@/contexts/PlaylistContext';
import SongCard from '@/components/ui/SongCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Playlist() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentSong, isPlaying, playPlaylist, addToQueue } = usePlayer();
  const { getPlaylist, deletePlaylist, removeSongFromPlaylist } = usePlaylists();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const playlist = id ? getPlaylist(id) : null;

  const handleDeletePlaylist = () => {
    if (id) {
      deletePlaylist(id);
      navigate('/library');
    }
  };

  const handleRemoveSong = (songId: string) => {
    if (id) {
      removeSongFromPlaylist(id, songId);
    }
  };

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-32"
    >
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
            {playlist.artwork ? (
              <img src={playlist.artwork} alt={playlist.name} className="w-full h-full object-cover" />
            ) : (
              <Music className="w-12 h-12 text-primary-foreground" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{playlist.name}</h1>
            {playlist.description && (
              <p className="text-sm text-muted-foreground mb-1">{playlist.description}</p>
            )}
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
            onClick={() => {
              const shuffled = [...playlist.songs].sort(() => Math.random() - 0.5);
              playPlaylist(shuffled, 0);
            }}
          >
            <Shuffle className="w-5 h-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-auto">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Playlist
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Songs List */}
      <div className="px-4 py-4">
        {playlist.songs.length === 0 ? (
          <div className="text-center py-16">
            <Music className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No songs yet</h3>
            <p className="text-muted-foreground">Add songs from search or your library</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl overflow-hidden">
            {playlist.songs.map((song, index) => (
              <div key={song.id} className="relative group">
                <SongCard
                  song={song}
                  index={index}
                  variant="list"
                  isPlaying={isPlaying}
                  isActive={currentSong?.id === song.id}
                  onPlay={() => playPlaylist(playlist.songs, index)}
                  onAddToQueue={() => addToQueue(song)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                  onClick={() => handleRemoveSong(song.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Playlist?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{playlist.name}" and all its songs. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlaylist} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
