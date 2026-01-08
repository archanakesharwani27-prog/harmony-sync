import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Play, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FilterChips from '@/components/ui/FilterChips';
import TrendingCard from '@/components/ui/TrendingCard';
import ArtistCard from '@/components/ui/ArtistCard';
import StoragePermission from '@/components/ui/StoragePermission';
import SongCard from '@/components/ui/SongCard';
import { usePlayer } from '@/contexts/PlayerContext';
import { useOnlineMusic } from '@/hooks/useOnlineMusic';
import { useLocalMusic } from '@/hooks/useLocalMusic';

const filterChips = [
  { id: 'all', label: 'All' },
  { id: 'music', label: 'Music' },
  { id: 'local', label: 'Local Songs' },
  { id: 'bollywood', label: 'Bollywood' },
  { id: 'punjabi', label: 'Punjabi' },
];

const featuredArtists = [
  { name: 'Arijit Singh', image: 'https://c.saavncdn.com/artists/Arijit_Singh_500x500.jpg', label: 'Featuring' },
  { name: 'Diljit Dosanjh', image: 'https://c.saavncdn.com/artists/Diljit_Dosanjh_500x500.jpg', label: 'Featuring' },
  { name: 'AP Dhillon', image: 'https://c.saavncdn.com/artists/AP_Dhillon_000_20220405125916_500x500.jpg', label: 'Featuring' },
  { name: 'Atif Aslam', image: 'https://c.saavncdn.com/artists/Atif_Aslam_500x500.jpg', label: 'Featuring' },
];

export default function Home() {
  const navigate = useNavigate();
  const { currentSong, isPlaying, playPlaylist, addToQueue } = usePlayer();
  const { trendingSongs, isLoadingTrending, fetchTrending, searchSongs, searchResults, isSearching } = useOnlineMusic();
  const { localSongs, openFolderPicker } = useLocalMusic();
  const [activeFilter, setActiveFilter] = useState('all');
  const [showPermission, setShowPermission] = useState(false);

  useEffect(() => {
    fetchTrending();
    // Check if we should show permission prompt
    const dismissed = localStorage.getItem('storagePermissionDismissed');
    const granted = localStorage.getItem('storagePermissionGranted');
    if (!dismissed && !granted && localSongs.length === 0) {
      const timer = setTimeout(() => setShowPermission(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [fetchTrending, localSongs.length]);

  // Handle filter change
  useEffect(() => {
    if (activeFilter === 'bollywood') {
      searchSongs('bollywood new songs');
    } else if (activeFilter === 'punjabi') {
      searchSongs('punjabi new songs');
    }
  }, [activeFilter, searchSongs]);

  const handleArtistClick = (artistName: string) => {
    navigate('/search?q=' + encodeURIComponent(artistName));
  };

  const handlePermissionGranted = () => {
    setShowPermission(false);
    openFolderPicker();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Songs to display based on filter
  const displaySongs = activeFilter === 'local' 
    ? localSongs 
    : (activeFilter === 'bollywood' || activeFilter === 'punjabi') && searchResults.length > 0
      ? searchResults
      : trendingSongs;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen pb-32"
    >
      {/* Filter Chips */}
      <motion.div variants={itemVariants} className="px-4 md:px-6 pt-4">
        <FilterChips 
          chips={filterChips} 
          activeChip={activeFilter} 
          onChange={setActiveFilter} 
        />
      </motion.div>

      {/* Trending Songs Section */}
      <motion.section variants={itemVariants} className="mt-6">
        <div className="flex items-center justify-between px-4 md:px-6 mb-4">
          <h2 className="text-xl font-bold text-foreground">Trending Songs</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground bg-surface rounded-full px-4"
            onClick={() => navigate('/search')}
          >
            View All
          </Button>
        </div>
        
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 px-4 md:px-6 pb-2">
            {isLoadingTrending || isSearching ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-40 md:w-44">
                  <div className="aspect-square rounded-xl bg-surface animate-pulse" />
                  <div className="h-4 bg-surface rounded mt-3 w-3/4" />
                  <div className="h-3 bg-surface rounded mt-2 w-1/2" />
                </div>
              ))
            ) : displaySongs.length > 0 ? (
              displaySongs.slice(0, 10).map((song, index) => (
                <TrendingCard
                  key={song.id}
                  song={song}
                  onPlay={() => playPlaylist(displaySongs, index)}
                  isActive={currentSong?.id === song.id}
                  isPlaying={isPlaying}
                  showPremium={index < 3}
                />
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No songs found</p>
            )}
          </div>
        </div>
      </motion.section>

      {/* Featured Artists Section */}
      <motion.section variants={itemVariants} className="mt-8">
        <div className="flex items-center justify-between px-4 md:px-6 mb-4">
          <h2 className="text-xl font-bold text-foreground">Popular Artists</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground bg-surface rounded-full px-4"
          >
            View All
          </Button>
        </div>
        
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 px-4 md:px-6 pb-2">
            {featuredArtists.map((artist) => (
              <ArtistCard
                key={artist.name}
                name={artist.name}
                image={artist.image}
                label={artist.label}
                onClick={() => handleArtistClick(artist.name)}
              />
            ))}
          </div>
        </div>
      </motion.section>

      {/* Local Songs Section */}
      {localSongs.length > 0 && (
        <motion.section variants={itemVariants} className="mt-8 px-4 md:px-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Music className="w-5 h-5" />
              Your Local Music
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground"
              onClick={() => navigate('/library')}
            >
              See All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="bg-card rounded-xl overflow-hidden">
            {localSongs.slice(0, 5).map((song, index) => (
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
        </motion.section>
      )}

      {/* More Trending */}
      {trendingSongs.length > 10 && activeFilter !== 'local' && (
        <motion.section variants={itemVariants} className="mt-8 px-4 md:px-6">
          <h2 className="text-xl font-bold text-foreground mb-4">🔥 Hot Right Now</h2>
          <div className="bg-card rounded-xl overflow-hidden">
            {trendingSongs.slice(10, 20).map((song, index) => (
              <SongCard
                key={song.id}
                song={song}
                index={index + 10}
                variant="list"
                isPlaying={isPlaying}
                isActive={currentSong?.id === song.id}
                onPlay={() => playPlaylist(trendingSongs, index + 10)}
                onAddToQueue={() => addToQueue(song)}
              />
            ))}
          </div>
        </motion.section>
      )}

      {/* Storage Permission Modal */}
      {showPermission && (
        <StoragePermission 
          onGranted={handlePermissionGranted}
          onDismiss={() => setShowPermission(false)}
        />
      )}
    </motion.div>
  );
}
