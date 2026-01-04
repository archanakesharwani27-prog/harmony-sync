import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Home,
  Search,
  Library,
  PlusCircle,
  Heart,
  Radio,
  Settings,
  Music2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const mainNavItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Search, label: 'Search', path: '/search' },
  { icon: Library, label: 'Your Library', path: '/library' },
];

const playlistNavItems = [
  { icon: PlusCircle, label: 'Create Playlist', path: '/playlist/create' },
  { icon: Heart, label: 'Liked Songs', path: '/liked' },
  { icon: Radio, label: 'Sync Sessions', path: '/sync' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full w-full bg-card border-r border-border">
      {/* Logo */}
      <div className="p-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg group-hover:glow-primary transition-all duration-300">
            <Music2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground">Suno Premium</h1>
            <p className="text-xs text-muted-foreground">🎵 Music Player</p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="px-3 space-y-1">
        {mainNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-3 h-11 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-surface-active text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'
                )}
              >
                <item.icon className={cn('w-5 h-5', isActive && 'text-primary')} />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <Separator className="my-4 mx-6" />

      {/* Playlist Navigation */}
      <nav className="px-3 space-y-1">
        {playlistNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-3 h-11 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-surface-active text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'
                )}
              >
                <item.icon className={cn('w-5 h-5', isActive && 'text-primary')} />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Playlists List */}
      <div className="flex-1 overflow-hidden mt-4">
        <div className="px-6 mb-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Your Playlists
          </h3>
        </div>
        <ScrollArea className="h-full px-3">
          <div className="space-y-0.5 pb-24">
            {/* Placeholder playlists */}
            {['Chill Vibes', 'Workout Mix', 'Study Focus', 'Party Hits'].map((name) => (
              <Link
                key={name}
                to={`/playlist/${name.toLowerCase().replace(' ', '-')}`}
                className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-surface-hover transition-colors truncate"
              >
                {name}
              </Link>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Settings */}
      <div className="p-3 border-t border-border">
        <Link to="/settings">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-11 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-surface-hover"
          >
            <Settings className="w-5 h-5" />
            Settings
          </Button>
        </Link>
      </div>
    </div>
  );
}
