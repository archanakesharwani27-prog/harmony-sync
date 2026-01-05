import { useState, useCallback } from 'react';
import type { Song } from '@/types/music';
import { toast } from 'sonner';

// Parse audio file metadata using browser APIs
async function parseAudioFile(file: File): Promise<Partial<Song>> {
  return new Promise((resolve) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);
    
    audio.onloadedmetadata = () => {
      // Extract basic metadata
      const song: Partial<Song> = {
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        artist: 'Unknown Artist',
        duration: Math.floor(audio.duration),
        url: url,
        source: 'local',
      };
      resolve(song);
    };
    
    audio.onerror = () => {
      resolve({
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Unknown Artist',
        duration: 0,
        url: url,
        source: 'local',
      });
    };
    
    audio.src = url;
  });
}

export function useLocalMusic() {
  const [localSongs, setLocalSongs] = useState<Song[]>(() => {
    const saved = localStorage.getItem('localSongs');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(false);

  const saveToStorage = useCallback((songs: Song[]) => {
    // Store metadata only, not blob URLs (they don't persist)
    const toStore = songs.map(s => ({ ...s, url: '' }));
    localStorage.setItem('localSongs', JSON.stringify(toStore));
  }, []);

  const importFiles = useCallback(async (files: FileList | File[]) => {
    setIsLoading(true);
    const fileArray = Array.from(files);
    const audioFiles = fileArray.filter(f => 
      f.type.startsWith('audio/') || 
      /\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(f.name)
    );

    if (audioFiles.length === 0) {
      toast.error('No audio files found');
      setIsLoading(false);
      return;
    }

    const newSongs: Song[] = [];
    
    for (const file of audioFiles) {
      try {
        const metadata = await parseAudioFile(file);
        newSongs.push(metadata as Song);
      } catch (error) {
        console.error('Failed to parse file:', file.name, error);
      }
    }

    setLocalSongs(prev => {
      const updated = [...prev, ...newSongs];
      saveToStorage(updated);
      return updated;
    });
    
    toast.success(`${newSongs.length} song${newSongs.length > 1 ? 's' : ''} imported!`);
    setIsLoading(false);
    return newSongs;
  }, [saveToStorage]);

  const openFilePicker = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'audio/*,.mp3,.wav,.ogg,.m4a,.flac,.aac';
    
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        importFiles(files);
      }
    };
    
    input.click();
  }, [importFiles]);

  const openFolderPicker = useCallback(async () => {
    try {
      // @ts-ignore - showDirectoryPicker is experimental
      if ('showDirectoryPicker' in window) {
        // @ts-ignore
        const dirHandle = await window.showDirectoryPicker();
        const files: File[] = [];
        
        for await (const entry of dirHandle.values()) {
          if (entry.kind === 'file') {
            const file = await entry.getFile();
            if (file.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(file.name)) {
              files.push(file);
            }
          }
        }
        
        if (files.length > 0) {
          await importFiles(files);
        } else {
          toast.info('No audio files found in folder');
        }
      } else {
        // Fallback to file picker
        openFilePicker();
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Folder picker error:', error);
        toast.error('Failed to access folder');
      }
    }
  }, [importFiles, openFilePicker]);

  const removeLocalSong = useCallback((songId: string) => {
    setLocalSongs(prev => {
      const updated = prev.filter(s => s.id !== songId);
      saveToStorage(updated);
      return updated;
    });
    toast.success('Song removed');
  }, [saveToStorage]);

  const clearLocalSongs = useCallback(() => {
    setLocalSongs([]);
    localStorage.removeItem('localSongs');
    toast.success('Library cleared');
  }, []);

  return {
    localSongs,
    isLoading,
    importFiles,
    openFilePicker,
    openFolderPicker,
    removeLocalSong,
    clearLocalSongs,
  };
}
