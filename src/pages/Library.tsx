import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, ListMusic, Heart, Clock, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlaylistCard from '@/components/ui/PlaylistCard';
import SongCard from '@/components/ui/SongCard';
import { usePlayer } from '@/contexts/PlayerContext';
import { samplePlaylists, sampleSongs } from '@/data/sampleSongs';

export default function Library() {
  const navigate = useNavigate();
  const { currentSong, isPlaying, playPlaylist, addToQueue } = usePlayer();
  const [activeTab, setActiveTab] = useState('playlists');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-32 px-6 md:px-8 pt-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Your Library</h1>
        <Button className="gap-2 gradient-primary text-primary-foreground">
          <Plus className="w-4 h-4" />
          New Playlist
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <ListMusic className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{samplePlaylists.length}</p>
            <p className="text-xs text-muted-foreground">Playlists</p>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
            <Heart className="w-5 h-5 text-pink-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">24</p>
            <p className="text-xs text-muted-foreground">Liked Songs</p>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">12h</p>
            <p className="text-xs text-muted-foreground">Listening Time</p>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
            <Download className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">8</p>
            <p className="text-xs text-muted-foreground">Downloads</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-surface mb-6">
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
          <TabsTrigger value="songs">Songs</TabsTrigger>
          <TabsTrigger value="albums">Albums</TabsTrigger>
          <TabsTrigger value="artists">Artists</TabsTrigger>
        </TabsList>

        <TabsContent value="playlists">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* Liked Songs Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg p-4 cursor-pointer"
              onClick={() => navigate('/liked')}
            >
              <div className="aspect-square rounded-md overflow-hidden mb-4 bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                <Heart className="w-16 h-16 text-white fill-current" />
              </div>
              <h4 className="font-semibold text-white truncate">Liked Songs</h4>
              <p className="text-sm text-white/70 truncate">24 songs</p>
            </motion.div>

            {samplePlaylists.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                onPlay={() => playPlaylist(playlist.songs)}
                onClick={() => navigate(`/playlist/${playlist.id}`)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="songs">
          <div className="bg-card rounded-xl overflow-hidden">
            {sampleSongs.map((song, index) => (
              <SongCard
                key={song.id}
                song={song}
                index={index}
                variant="list"
                isPlaying={isPlaying}
                isActive={currentSong?.id === song.id}
                onPlay={() => playPlaylist(sampleSongs, index)}
                onAddToQueue={() => addToQueue(song)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="albums">
          <div className="text-center py-16">
            <p className="text-muted-foreground">No albums yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Import music to see your albums
            </p>
          </div>
        </TabsContent>

        <TabsContent value="artists">
          <div className="text-center py-16">
            <p className="text-muted-foreground">No artists yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Start listening to discover artists
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
