import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  User, 
  Heart, 
  Clock, 
  Download, 
  Settings,
  ChevronRight,
  Music2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLikes } from '@/contexts/LikesContext';

export default function Profile() {
  const navigate = useNavigate();
  const { likedSongs } = useLikes();

  const menuItems = [
    { 
      icon: Heart, 
      label: 'Liked Songs', 
      value: `${likedSongs.length} songs`,
      path: '/liked',
      color: 'text-red-500'
    },
    { 
      icon: Clock, 
      label: 'Recently Played', 
      value: 'View history',
      path: '/library',
      color: 'text-blue-500'
    },
    { 
      icon: Download, 
      label: 'Downloads', 
      value: 'Offline music',
      path: '/library',
      color: 'text-green-500'
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      value: 'App preferences',
      path: '/settings',
      color: 'text-muted-foreground'
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-32"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center gap-4 px-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Profile</h1>
        </div>
      </div>

      {/* Profile Section */}
      <div className="px-4 py-8">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-4">
            <User className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Music Lover</h2>
          <p className="text-muted-foreground">Free Account</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{likedSongs.length}</p>
            <p className="text-xs text-muted-foreground">Liked</p>
          </div>
          <div className="bg-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">0</p>
            <p className="text-xs text-muted-foreground">Playlists</p>
          </div>
          <div className="bg-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">0</p>
            <p className="text-xs text-muted-foreground">Following</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-card rounded-xl overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-4 p-4 hover:bg-surface-hover transition-colors text-left border-b border-border last:border-0"
            >
              <item.icon className={`w-5 h-5 ${item.color}`} />
              <div className="flex-1">
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.value}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* App Info */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Music2 className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground">Suno Premium</span>
          </div>
          <p className="text-xs text-muted-foreground">Version 1.0.0</p>
        </div>
      </div>
    </motion.div>
  );
}
