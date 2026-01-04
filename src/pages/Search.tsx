import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Mic, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import SongCard from '@/components/ui/SongCard';
import { usePlayer } from '@/contexts/PlayerContext';
import { sampleSongs } from '@/data/sampleSongs';

const genres = [
  { name: 'Pop', color: 'from-pink-500 to-rose-500', emoji: '🎤' },
  { name: 'Rock', color: 'from-red-500 to-orange-500', emoji: '🎸' },
  { name: 'Hip Hop', color: 'from-purple-500 to-indigo-500', emoji: '🎧' },
  { name: 'Jazz', color: 'from-amber-500 to-yellow-500', emoji: '🎷' },
  { name: 'Classical', color: 'from-blue-500 to-cyan-500', emoji: '🎻' },
  { name: 'Electronic', color: 'from-green-500 to-teal-500', emoji: '🎹' },
  { name: 'R&B', color: 'from-fuchsia-500 to-pink-500', emoji: '💜' },
  { name: 'Country', color: 'from-orange-500 to-amber-500', emoji: '🤠' },
];

export default function Search() {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const { currentSong, isPlaying, playPlaylist, addToQueue } = usePlayer();

  const filteredSongs = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return sampleSongs.filter(
      (song) =>
        song.title.toLowerCase().includes(lowerQuery) ||
        song.artist.toLowerCase().includes(lowerQuery) ||
        song.album?.toLowerCase().includes(lowerQuery) ||
        song.genre?.toLowerCase().includes(lowerQuery)
    );
  }, [query]);

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice search is not supported in your browser');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
    };

    recognition.start();
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
            placeholder="Search songs, artists, albums..."
            className="pl-12 pr-20 h-12 text-lg bg-surface border-none rounded-full"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
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

      {/* Search Results */}
      {query && filteredSongs.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Results for "{query}"
          </h2>
          <div className="bg-card rounded-xl overflow-hidden">
            {filteredSongs.map((song, index) => (
              <SongCard
                key={song.id}
                song={song}
                index={index}
                variant="list"
                isPlaying={isPlaying}
                isActive={currentSong?.id === song.id}
                onPlay={() => playPlaylist(filteredSongs, index)}
                onAddToQueue={() => addToQueue(song)}
              />
            ))}
          </div>
        </motion.section>
      )}

      {/* No Results */}
      {query && filteredSongs.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <p className="text-muted-foreground text-lg">No results found for "{query}"</p>
          <p className="text-muted-foreground text-sm mt-2">
            Try searching for something else
          </p>
        </motion.div>
      )}

      {/* Browse Categories (when no search) */}
      {!query && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <h2 className="text-xl font-bold text-foreground mb-4">Browse All</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {genres.map((genre) => (
              <motion.button
                key={genre.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setQuery(genre.name)}
                className={`relative h-32 rounded-xl overflow-hidden bg-gradient-to-br ${genre.color} p-4 text-left shadow-lg`}
              >
                <span className="text-2xl">{genre.emoji}</span>
                <h3 className="text-white font-bold text-lg mt-2">{genre.name}</h3>
              </motion.button>
            ))}
          </div>
        </motion.section>
      )}

      {/* Recent Searches */}
      {!query && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-10"
        >
          <h2 className="text-xl font-bold text-foreground mb-4">Top Songs</h2>
          <div className="bg-card rounded-xl overflow-hidden">
            {sampleSongs.slice(0, 5).map((song, index) => (
              <SongCard
                key={song.id}
                song={song}
                index={index}
                variant="list"
                isPlaying={isPlaying}
                isActive={currentSong?.id === song.id}
                onPlay={() => playPlaylist(sampleSongs.slice(0, 5), index)}
                onAddToQueue={() => addToQueue(song)}
              />
            ))}
          </div>
        </motion.section>
      )}
    </motion.div>
  );
}
