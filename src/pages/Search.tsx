import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Mic, X, Loader2, Globe, Music } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SongCard from '@/components/ui/SongCard';
import { usePlayer } from '@/contexts/PlayerContext';
import { useOnlineMusic } from '@/hooks/useOnlineMusic';
import { useLocalMusic } from '@/hooks/useLocalMusic';

const genres = [
  { name: 'Bollywood', color: 'from-orange-500 to-red-500', emoji: '🎬', query: 'bollywood hits' },
  { name: 'Punjabi', color: 'from-yellow-500 to-orange-500', emoji: '🎤', query: 'punjabi songs' },
  { name: 'Hindi Romantic', color: 'from-pink-500 to-rose-500', emoji: '💕', query: 'hindi romantic songs' },
  { name: 'Arijit Singh', color: 'from-purple-500 to-indigo-500', emoji: '🎵', query: 'arijit singh' },
  { name: 'Diljit Dosanjh', color: 'from-blue-500 to-cyan-500', emoji: '🔥', query: 'diljit dosanjh' },
  { name: 'AP Dhillon', color: 'from-green-500 to-teal-500', emoji: '🎧', query: 'ap dhillon' },
  { name: 'Atif Aslam', color: 'from-rose-500 to-pink-500', emoji: '🎶', query: 'atif aslam' },
  { name: 'Retro Hindi', color: 'from-amber-500 to-yellow-500', emoji: '🕺', query: 'old hindi songs' },
];

export default function Search() {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [activeTab, setActiveTab] = useState('online');
  const { currentSong, isPlaying, playPlaylist, addToQueue } = usePlayer();
  const { searchResults, trendingSongs, isSearching, fetchTrending, searchSongs, clearSearch } = useOnlineMusic();
  const { localSongs } = useLocalMusic();

  // Fetch trending on mount
  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  // Debounced search
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

  // Filter local songs
  const filteredLocalSongs = localSongs.filter(song => {
    if (!query.trim()) return true;
    const lowerQuery = query.toLowerCase();
    return song.title.toLowerCase().includes(lowerQuery) ||
           song.artist.toLowerCase().includes(lowerQuery);
  });

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice search is not supported in your browser');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN'; // Hindi language support

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
    };

    recognition.start();
  };

  const handleGenreClick = (genreQuery: string) => {
    setQuery(genreQuery);
    setActiveTab('online');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-32 px-6 md:px-8 pt-6"
    >
      {/* Search Bar */}
      <div className="sticky top-0 z-10 bg-background pb-4">
        <div className="relative max-w-2xl">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs, artists... (Hindi/English)"
            className="pl-12 pr-20 h-12 text-lg bg-surface border-none rounded-full"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
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
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${isListening ? 'text-primary animate-pulse' : ''}`}
              onClick={handleVoiceSearch}
            >
              <Mic className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs for Online/Local */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList className="bg-surface">
          <TabsTrigger value="online" className="gap-2">
            <Globe className="w-4 h-4" />
            Online
          </TabsTrigger>
          <TabsTrigger value="local" className="gap-2">
            <Music className="w-4 h-4" />
            Local ({localSongs.length})
          </TabsTrigger>
        </TabsList>

        {/* Online Results */}
        <TabsContent value="online">
          {/* Search Results */}
          {query && searchResults.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
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
              className="text-center py-16"
            >
              <p className="text-muted-foreground text-lg">No results found for "{query}"</p>
              <p className="text-muted-foreground text-sm mt-2">
                Try searching in Hindi or English
              </p>
            </motion.div>
          )}

          {/* Browse Categories (when no search) */}
          {!query && (
            <>
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <h2 className="text-xl font-bold text-foreground mb-4">Browse by Artist & Genre</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {genres.map((genre) => (
                    <motion.button
                      key={genre.name}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleGenreClick(genre.query)}
                      className={`relative h-28 rounded-xl overflow-hidden bg-gradient-to-br ${genre.color} p-4 text-left shadow-lg`}
                    >
                      <span className="text-2xl">{genre.emoji}</span>
                      <h3 className="text-white font-bold text-base mt-2">{genre.name}</h3>
                    </motion.button>
                  ))}
                </div>
              </motion.section>

              {/* Trending Songs */}
              {trendingSongs.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mt-10"
                >
                  <h2 className="text-xl font-bold text-foreground mb-4">🔥 Trending Now</h2>
                  <div className="bg-card rounded-xl overflow-hidden">
                    {trendingSongs.slice(0, 10).map((song, index) => (
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
                </motion.section>
              )}
            </>
          )}
        </TabsContent>

        {/* Local Songs */}
        <TabsContent value="local">
          {filteredLocalSongs.length > 0 ? (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <h2 className="text-lg font-semibold text-foreground mb-4">
                {query ? `Local results for "${query}"` : 'Your Local Songs'}
              </h2>
              <div className="bg-card rounded-xl overflow-hidden">
                {filteredLocalSongs.map((song, index) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    index={index}
                    variant="list"
                    isPlaying={isPlaying}
                    isActive={currentSong?.id === song.id}
                    onPlay={() => playPlaylist(filteredLocalSongs, index)}
                    onAddToQueue={() => addToQueue(song)}
                  />
                ))}
              </div>
            </motion.section>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No local songs</p>
              <p className="text-muted-foreground text-sm mt-2">
                Go to Library → Import to add local music
              </p>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
