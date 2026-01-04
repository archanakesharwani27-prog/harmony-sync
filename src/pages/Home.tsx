import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Play, Search, Upload, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SongCard from '@/components/ui/SongCard';
import PlaylistCard from '@/components/ui/PlaylistCard';
import { usePlayer } from '@/contexts/PlayerContext';
import {
  sampleSongs,
  samplePlaylists,
  trendingSongs,
  recentlyPlayed,
} from '@/data/sampleSongs';

export default function Home() {
  const navigate = useNavigate();
  const { currentSong, isPlaying, playPlaylist, addToQueue } = usePlayer();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen pb-32"
    >
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-10" />
        <div className="relative px-6 py-8 md:px-8 md:py-12">
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {greeting()} 👋
            </h1>
            <p className="text-muted-foreground mt-2">
              What would you like to listen to?
            </p>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="flex gap-3 mt-6 flex-wrap">
            <Button
              variant="secondary"
              className="gap-2"
              onClick={() => navigate('/search')}
            >
              <Search className="w-4 h-4" />
              Search
            </Button>
            <Button
              variant="secondary"
              className="gap-2"
              onClick={() => navigate('/import')}
            >
              <Upload className="w-4 h-4" />
              Import Music
            </Button>
            <Button
              variant="secondary"
              className="gap-2"
              onClick={() => navigate('/sync')}
            >
              <Radio className="w-4 h-4" />
              Sync Session
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Quick Playlists Grid */}
      <motion.section variants={itemVariants} className="px-6 md:px-8 mt-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {samplePlaylists.slice(0, 4).map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => {
                playPlaylist(playlist.songs);
              }}
              className="flex items-center gap-3 bg-surface rounded-lg overflow-hidden hover:bg-surface-hover transition-colors group"
            >
              <img
                src={playlist.artwork}
                alt={playlist.name}
                className="w-12 h-12 object-cover"
              />
              <span className="font-medium text-sm text-foreground truncate pr-3">
                {playlist.name}
              </span>
              <div className="ml-auto mr-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shadow-lg">
                  <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </motion.section>

      {/* Trending Now */}
      <motion.section variants={itemVariants} className="px-6 md:px-8 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Trending Now 🔥</h2>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            See All <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {trendingSongs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              variant="grid"
              isPlaying={isPlaying}
              isActive={currentSong?.id === song.id}
              onPlay={() => playPlaylist(trendingSongs, trendingSongs.indexOf(song))}
              onAddToQueue={() => addToQueue(song)}
            />
          ))}
        </div>
      </motion.section>

      {/* Featured Playlists */}
      <motion.section variants={itemVariants} className="px-6 md:px-8 mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Featured Playlists</h2>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            See All <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {samplePlaylists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              onPlay={() => playPlaylist(playlist.songs)}
              onClick={() => navigate(`/playlist/${playlist.id}`)}
            />
          ))}
        </div>
      </motion.section>

      {/* Recently Played */}
      <motion.section variants={itemVariants} className="px-6 md:px-8 mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Recently Played</h2>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            See All <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="bg-card rounded-xl overflow-hidden">
          {recentlyPlayed.map((song, index) => (
            <SongCard
              key={song.id}
              song={song}
              index={index}
              variant="list"
              isPlaying={isPlaying}
              isActive={currentSong?.id === song.id}
              onPlay={() => playPlaylist(recentlyPlayed, index)}
              onAddToQueue={() => addToQueue(song)}
            />
          ))}
        </div>
      </motion.section>

      {/* All Songs */}
      <motion.section variants={itemVariants} className="px-6 md:px-8 mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">All Songs</h2>
        </div>
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
      </motion.section>
    </motion.div>
  );
}
