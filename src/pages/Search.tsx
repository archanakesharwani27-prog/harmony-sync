import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Mic, X, Loader2, Camera } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import SongCard from '@/components/ui/SongCard';
import { usePlayer } from '@/contexts/PlayerContext';
import { useOnlineMusic } from '@/hooks/useOnlineMusic';
import { useLocalMusic } from '@/hooks/useLocalMusic';

const browseCategories = [
  { name: 'Music', color: 'bg-purple-600', query: 'trending songs' },
  { name: 'Podcasts', color: 'bg-red-600', query: 'podcasts' },
  { name: 'Charts', color: 'bg-blue-500', query: 'top hits' },
  { name: 'Live Events', color: 'bg-pink-600', query: 'live' },
];

const genres = [
  { name: 'Bollywood', image: 'https://i.scdn.co/image/ab67706f00000002cad5dcb53a44de5f476e71ef' },
  { name: 'Punjabi', image: 'https://i.scdn.co/image/ab67706f00000002936af3cd6bc8dd6f3c5cb065' },
  { name: 'Indie', image: 'https://i.scdn.co/image/ab67706f00000002e02bdc87d1eb9fe9a49cd4ab' },
];

const exploreMore = [
  { name: 'Discover', color: 'bg-gradient-to-br from-purple-500 to-pink-500' },
  { name: 'Made for you', color: 'bg-gradient-to-br from-blue-500 to-cyan-500' },
];

export default function Search() {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const { currentSong, isPlaying, playPlaylist, addToQueue } = usePlayer();
  const { searchResults, trendingSongs, isSearching, fetchTrending, searchSongs, clearSearch } = useOnlineMusic();
  const { localSongs } = useLocalMusic();

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        searchSongs(query);
      } else {
        clearSearch();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query, searchSongs, clearSearch]);

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice search is not supported');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
    };

    recognition.start();
  };

  const handleCategoryClick = (categoryQuery: string) => {
    setQuery(categoryQuery);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-32"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background px-4 md:px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full gradient-primary" />
            <h1 className="text-xl font-bold text-foreground">Search</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className={isListening ? 'text-primary animate-pulse' : ''}
              onClick={handleVoiceSearch}
            >
              <Mic className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Camera className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to listen to?"
            className="pl-12 pr-12 h-12 text-base bg-surface border-none rounded-lg"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isSearching && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setQuery('')}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Search Results */}
      {query && searchResults.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 md:px-6 mt-4"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Results for "{query}"
          </h2>
          <div className="bg-card rounded-xl overflow-hidden">
            {searchResults.map((song, index) => (
              <SongCard
                key={song.id}
                song={song}
                index={index}
                variant="list"
                isPlaying={isPlaying}
                isActive={currentSong?.id === song.id}
                onPlay={() => playPlaylist(searchResults, index)}
                onAddToQueue={() => addToQueue(song)}
              />
            ))}
          </div>
        </motion.section>
      )}

      {/* No Results */}
      {query && !isSearching && searchResults.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 px-4"
        >
          <p className="text-foreground text-lg">No results for "{query}"</p>
          <p className="text-muted-foreground text-sm mt-2">
            Try different keywords or browse categories below
          </p>
        </motion.div>
      )}

      {/* Browse Section (when no search) */}
      {!query && (
        <div className="px-4 md:px-6 space-y-8 mt-4">
          {/* Start Browsing */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-4">Start browsing</h2>
            <div className="grid grid-cols-2 gap-3">
              {browseCategories.map((cat) => (
                <motion.button
                  key={cat.name}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategoryClick(cat.query)}
                  className={`${cat.color} h-24 rounded-lg p-4 text-left relative overflow-hidden`}
                >
                  <span className="text-white font-bold text-lg">{cat.name}</span>
                </motion.button>
              ))}
            </div>
          </section>

          {/* Explore Your Genres */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-4">Explore your genres</h2>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
              {genres.map((genre) => (
                <motion.button
                  key={genre.name}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategoryClick(genre.name + ' songs')}
                  className="flex-shrink-0 w-28"
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-surface mb-2">
                    <img 
                      src={genre.image} 
                      alt={genre.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm text-foreground font-medium">#{genre.name}</p>
                </motion.button>
              ))}
            </div>
          </section>

          {/* Browse All */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-4">Browse all</h2>
            <div className="grid grid-cols-2 gap-3">
              {exploreMore.map((item) => (
                <motion.button
                  key={item.name}
                  whileTap={{ scale: 0.95 }}
                  className={`${item.color} h-24 rounded-lg p-4 text-left`}
                >
                  <span className="text-white font-bold">{item.name}</span>
                </motion.button>
              ))}
            </div>
          </section>

          {/* Trending Now */}
          {trendingSongs.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-foreground mb-4">🔥 Trending Now</h2>
              <div className="bg-card rounded-xl overflow-hidden">
                {trendingSongs.slice(0, 8).map((song, index) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    index={index}
                    variant="list"
                    isPlaying={isPlaying}
                    isActive={currentSong?.id === song.id}
                    onPlay={() => playPlaylist(trendingSongs, index)}
                    onAddToQueue={() => addToQueue(song)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </motion.div>
  );
}
