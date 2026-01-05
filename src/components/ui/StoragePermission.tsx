import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen, X, Music, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StoragePermissionProps {
  onGranted: () => void;
  onDismiss: () => void;
}

export default function StoragePermission({ onGranted, onDismiss }: StoragePermissionProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleGrant = async () => {
    // Check if File System Access API is available
    if ('showDirectoryPicker' in window) {
      try {
        // @ts-ignore
        const dirHandle = await window.showDirectoryPicker({ mode: 'read' });
        localStorage.setItem('storagePermissionGranted', 'true');
        onGranted();
        setIsVisible(false);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Permission error:', error);
        }
      }
    } else {
      // Fallback for browsers without File System Access API
      localStorage.setItem('storagePermissionGranted', 'true');
      onGranted();
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('storagePermissionDismissed', 'true');
    setIsVisible(false);
    onDismiss();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed inset-x-4 bottom-24 z-50 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:max-w-md"
      >
        <div className="bg-card border border-border rounded-2xl p-5 shadow-xl">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
              <FolderOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-lg">
                Play Local Music
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Allow access to your music folder to play local songs and enable background playback
              </p>
              
              <div className="flex items-center gap-2 mt-4">
                <Button 
                  onClick={handleGrant}
                  className="gradient-primary text-primary-foreground flex-1"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Allow Access
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleDismiss}
                  className="text-muted-foreground"
                >
                  Later
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
