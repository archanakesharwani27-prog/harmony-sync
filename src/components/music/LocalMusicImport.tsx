import React from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Upload, Music, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocalMusic } from '@/hooks/useLocalMusic';

interface LocalMusicImportProps {
  onClose?: () => void;
}

export default function LocalMusicImport({ onClose }: LocalMusicImportProps) {
  const { 
    localSongs, 
    isLoading, 
    openFilePicker, 
    openFolderPicker, 
    clearLocalSongs 
  } = useLocalMusic();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl p-6 border border-border"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Music className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Local Music</h3>
            <p className="text-sm text-muted-foreground">{localSongs.length} songs imported</p>
          </div>
        </div>
        {localSongs.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearLocalSongs}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-20 flex-col gap-2"
          onClick={openFilePicker}
          disabled={isLoading}
        >
          <Upload className="w-6 h-6" />
          <span className="text-sm">Add Files</span>
        </Button>
        <Button
          variant="outline"
          className="h-20 flex-col gap-2"
          onClick={openFolderPicker}
          disabled={isLoading}
        >
          <FolderOpen className="w-6 h-6" />
          <span className="text-sm">Scan Folder</span>
        </Button>
      </div>

      {isLoading && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"
          />
          Scanning files...
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-4 text-center">
        Supports MP3, WAV, OGG, M4A, FLAC, AAC
      </p>
    </motion.div>
  );
}
