import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, ListMusic, Heart, ArrowUpDown, FolderOpen, Upload, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FilterChips from '@/components/ui/FilterChips';
import SongCard from '@/components/ui/SongCard';
import { usePlayer } from '@/contexts/PlayerContext';
import { useLocalMusic } from '@/hooks/useLocalMusic';
import { usePlaylists } from '@/contexts/PlaylistContext';
import { useLikes } from '@/contexts/LikesContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const libraryFilters = [
  { id: 'playlists', label: 'Playlists' },
  { id: 'songs', label: 'Songs' },
  { id: 'local', label: 'Local' },
];

export default function Library() {
  const navigate = useNavigate();
  const { currentSong, isPlaying, playPlaylist, addToQueue } = usePlayer();
  const { localSongs, isLoading, openFilePicker, openFolderPicker } = useLocalMusic();
  const { playlists, createPlaylist } = usePlaylists();
  const { likedSongs } = useLikes();
  const [activeFilter, setActiveFilter] = useState('playlists');
  const [sortBy, setSortBy] = useState('recents');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      const playlist = createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setShowCreateDialog(false);
      navigate(`/playlist/${playlist.id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-32"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background">
        <div className="flex items-center justify-between px-4 md:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
              <ListMusic className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Your Library</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/search')}>
              <Search className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="gradient-primary text-primary-foreground rounded-full"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <div className="px-4 md:px-6 pb-2">
          <FilterChips chips={libraryFilters} activeChip={activeFilter} onChange={setActiveFilter} />
        </div>
      </div>

      <div className="px-4 md:px-6 py-3">
        <button 
          className="flex items-center gap-2 text-sm text-muted-foreground"
          onClick={() => setSortBy(sortBy === 'recents' ? 'name' : 'recents')}
        >
          <ArrowUpDown className="w-4 h-4" />
          {sortBy === 'recents' ? 'Recents' : 'Alphabetical'}
        </button>
      </div>

      <div className="px-4 md:px-6">
        {activeFilter === 'playlists' && (
          <div className="space-y-3">
            {/* Liked Songs */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/liked')}
              className="w-full flex items-center gap-4 p-2 rounded-lg hover:bg-surface transition-colors"
            >
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" fill="white" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-semibold text-foreground">Liked Songs</h4>
                <p className="text-sm text-muted-foreground">Playlist • {likedSongs.length} songs</p>
              </div>
            </motion.button>

            {/* User Playlists */}
            {playlists.map((playlist) => (
              <motion.button
                key={playlist.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/playlist/${playlist.id}`)}
                className="w-full flex items-center gap-4 p-2 rounded-lg hover:bg-surface transition-colors"
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                  {playlist.artwork ? (
                    <img src={playlist.artwork} alt={playlist.name} className="w-full h-full object-cover" />
                  ) : (
                    <ListMusic className="w-6 h-6 text-primary-foreground" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-foreground">{playlist.name}</h4>
                  <p className="text-sm text-muted-foreground">Playlist • {playlist.songs.length} songs</p>
                </div>
              </motion.button>
            ))}

            {playlists.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Tap + to create your first playlist</p>
            )}
          </div>
        )}

        {activeFilter === 'songs' && (
          <div>
            {localSongs.length > 0 ? (
              <div className="bg-card rounded-xl overflow-hidden">
                {localSongs.map((song, index) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    index={index}
                    variant="list"
                    isPlaying={isPlaying}
                    isActive={currentSong?.id === song.id}
                    onPlay={() => playPlaylist(localSongs, index)}
                    onAddToQueue={() => addToQueue(song)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState icon={ListMusic} title="No songs yet" subtitle="Import your local music to see it here" />
            )}
          </div>
        )}

        {activeFilter === 'local' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-24 flex-col gap-2 bg-surface border-dashed" onClick={openFilePicker} disabled={isLoading}>
                <Upload className="w-6 h-6 text-primary" />
                <span className="text-sm">Add Files</span>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2 bg-surface border-dashed" onClick={openFolderPicker} disabled={isLoading}>
                <FolderOpen className="w-6 h-6 text-primary" />
                <span className="text-sm">Scan Folder</span>
              </Button>
            </div>
            {localSongs.length > 0 && (
              <div className="bg-card rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm text-muted-foreground">{localSongs.length} local songs</p>
                </div>
                {localSongs.map((song, index) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    index={index}
                    variant="list"
                    isPlaying={isPlaying}
                    isActive={currentSong?.id === song.id}
                    onPlay={() => playPlaylist(localSongs, index)}
                    onAddToQueue={() => addToQueue(song)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Playlist Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Playlist</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Playlist name"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreatePlaylist} disabled={!newPlaylistName.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function EmptyState({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) {
  return (
    <div className="text-center py-16">
      <Icon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
      <p className="text-foreground font-medium">{title}</p>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
}
