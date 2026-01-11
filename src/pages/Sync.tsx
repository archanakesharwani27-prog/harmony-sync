import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Radio, 
  Wifi, 
  Users, 
  Share2, 
  Copy, 
  LogOut, 
  Music,
  Lock,
  Unlock,
  UserX,
  Crown,
  ListMusic,
  Trash2,
  Play,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSync } from '@/contexts/SyncContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Sync() {
  const navigate = useNavigate();
  const { 
    session, 
    isConnected, 
    isHost, 
    userId,
    createSession, 
    joinSession, 
    leaveSession,
    lockRoom,
    kickUser,
    transferHost,
    playFromSharedQueue,
    removeFromSharedQueue,
    clearSharedQueue,
  } = useSync();
  const [userName, setUserName] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [activeTab, setActiveTab] = useState<'participants' | 'queue'>('participants');

  const handleCreate = async () => {
    if (!userName.trim() || !sessionName.trim()) {
      toast.error('Please enter your name and session name');
      return;
    }
    await createSession(sessionName, userName);
  };

  const handleJoin = async () => {
    if (!userName.trim() || !joinCode.trim()) {
      toast.error('Please enter your name and session code');
      return;
    }
    await joinSession(joinCode, userName);
  };

  const copySessionCode = () => {
    if (session) {
      navigator.clipboard.writeText(session.id);
      toast.success('Session code copied!');
    }
  };

  // Active session view
  if (session) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen pb-32"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border">
          <div className="flex items-center gap-4 px-4 py-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center relative">
                <Radio className="w-6 h-6 text-white" />
                {session.isLocked && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive flex items-center justify-center">
                    <Lock className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{session.name}</h1>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <p className="text-sm text-muted-foreground">
                    {isConnected ? 'Connected' : 'Connecting...'}
                    {isHost && ' • You are the host'}
                  </p>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={leaveSession}>
              <LogOut className="w-5 h-5 text-destructive" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-6 space-y-6">
          {/* Session Code */}
          <div className="bg-card rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-2">Session Code</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-muted px-4 py-3 rounded-lg text-foreground font-mono text-lg">
                {session.id}
              </code>
              <Button variant="outline" size="icon" onClick={copySessionCode}>
                <Copy className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Share this code with friends to invite them</p>
          </div>

          {/* Host Controls */}
          {isHost && (
            <div className="bg-card rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold text-foreground">Host Controls</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={session.isLocked ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => lockRoom(!session.isLocked)}
                  className="gap-2"
                >
                  {session.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  {session.isLocked ? 'Unlock Room' : 'Lock Room'}
                </Button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('participants')}
              className={cn(
                "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2",
                activeTab === 'participants' 
                  ? "bg-background text-foreground shadow" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Users className="w-4 h-4" />
              Participants ({session.users.length})
            </button>
            <button
              onClick={() => setActiveTab('queue')}
              className={cn(
                "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2",
                activeTab === 'queue' 
                  ? "bg-background text-foreground shadow" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ListMusic className="w-4 h-4" />
              Queue ({session.sharedQueue.length})
            </button>
          </div>

          {/* Participants Tab */}
          {activeTab === 'participants' && (
            <div className="bg-card rounded-xl p-4">
              <div className="space-y-3">
                {session.users.map((user) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                      <span className="text-primary-foreground font-bold">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{user.name}</p>
                        {user.id === userId && <span className="text-xs text-muted-foreground">(You)</span>}
                      </div>
                      {user.isHost && (
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Crown className="w-3 h-3" />
                          <span className="text-xs">Host</span>
                        </div>
                      )}
                    </div>
                    {isHost && user.id !== userId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <span className="sr-only">User actions</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => transferHost(user.id)} className="gap-2">
                            <Crown className="w-4 h-4 text-yellow-500" />
                            Make Host
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => kickUser(user.id)} className="gap-2 text-destructive">
                            <UserX className="w-4 h-4" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Queue Tab */}
          {activeTab === 'queue' && (
            <div className="bg-card rounded-xl p-4">
              {isHost && session.sharedQueue.length > 0 && (
                <div className="flex justify-end mb-4">
                  <Button variant="outline" size="sm" onClick={clearSharedQueue} className="gap-2 text-destructive">
                    <Trash2 className="w-4 h-4" />
                    Clear Queue
                  </Button>
                </div>
              )}
              {session.sharedQueue.length === 0 ? (
                <div className="text-center py-8">
                  <ListMusic className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Shared queue is empty</p>
                  <p className="text-xs text-muted-foreground mt-1">Songs added by participants will appear here</p>
                </div>
              ) : (
                <ScrollArea className="max-h-64">
                  <div className="space-y-2">
                    {session.sharedQueue.map((song, index) => (
                      <div key={`${song.id}-${index}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                        <div className="w-10 h-10 rounded overflow-hidden bg-muted flex-shrink-0">
                          {song.artwork ? (
                            <img src={song.artwork} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">🎵</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{song.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                        </div>
                        {isHost && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => playFromSharedQueue(index)}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => removeFromSharedQueue(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}

          {/* Now Playing */}
          <div className="bg-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Music className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Now Playing</h3>
            </div>
            {session.currentSong ? (
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                  {session.currentSong.artwork ? (
                    <img src={session.currentSong.artwork} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">🎵</div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">{session.currentSong.title}</p>
                  <p className="text-sm text-muted-foreground">{session.currentSong.artist}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                {isHost ? 'Play a song to sync with everyone' : 'Waiting for host to play a song...'}
              </p>
            )}
          </div>

          {isHost && (
            <p className="text-sm text-muted-foreground text-center">
              As the host, songs you play will be synced to everyone in the session
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  // Menu/Create/Join views
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
            onClick={() => mode === 'menu' ? navigate(-1) : setMode('menu')}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center">
              <Radio className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Sync Sessions</h1>
              <p className="text-sm text-muted-foreground">Listen together with friends</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      {mode === 'menu' && (
        <div className="px-4 py-8">
          <div className="text-center py-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-600/20 to-teal-600/20 flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Listen Together</h2>
            <p className="text-muted-foreground max-w-sm mx-auto mb-8">
              Create or join a sync session to listen to music with friends in real-time.
            </p>
          </div>

          <div className="space-y-4 max-w-sm mx-auto">
            <Button 
              className="w-full h-14 text-lg gradient-primary"
              onClick={() => setMode('create')}
            >
              <Radio className="w-5 h-5 mr-2" />
              Create Session
            </Button>
            <Button 
              variant="outline" 
              className="w-full h-14 text-lg"
              onClick={() => setMode('join')}
            >
              <Users className="w-5 h-5 mr-2" />
              Join Session
            </Button>
          </div>

          <div className="mt-12 space-y-4 max-w-sm mx-auto">
            <div className="bg-card rounded-xl p-4 flex items-center gap-4">
              <Wifi className="w-8 h-8 text-primary flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium text-foreground">Real-time Sync</p>
                <p className="text-sm text-muted-foreground">Everyone hears the same song at the same time</p>
              </div>
            </div>
            
            <div className="bg-card rounded-xl p-4 flex items-center gap-4">
              <Crown className="w-8 h-8 text-yellow-500 flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium text-foreground">Host Controls</p>
                <p className="text-sm text-muted-foreground">Lock room, kick users, transfer host</p>
              </div>
            </div>

            <div className="bg-card rounded-xl p-4 flex items-center gap-4">
              <ListMusic className="w-8 h-8 text-primary flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium text-foreground">Shared Queue</p>
                <p className="text-sm text-muted-foreground">Everyone can add songs to the queue</p>
              </div>
            </div>
            
            <div className="bg-card rounded-xl p-4 flex items-center gap-4">
              <Share2 className="w-8 h-8 text-primary flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium text-foreground">Easy Sharing</p>
                <p className="text-sm text-muted-foreground">Share session code with friends to join</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Session */}
      {mode === 'create' && (
        <div className="px-4 py-8">
          <div className="max-w-sm mx-auto space-y-6">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Your Name</label>
              <Input
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="h-12"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Session Name</label>
              <Input
                placeholder="My Music Session"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                className="h-12"
              />
            </div>
            <Button 
              className="w-full h-14 text-lg gradient-primary"
              onClick={handleCreate}
              disabled={!userName.trim() || !sessionName.trim()}
            >
              Create Session
            </Button>
          </div>
        </div>
      )}

      {/* Join Session */}
      {mode === 'join' && (
        <div className="px-4 py-8">
          <div className="max-w-sm mx-auto space-y-6">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Your Name</label>
              <Input
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="h-12"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Session Code</label>
              <Input
                placeholder="Enter session code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="h-12 font-mono"
              />
            </div>
            <Button 
              className="w-full h-14 text-lg gradient-primary"
              onClick={handleJoin}
              disabled={!userName.trim() || !joinCode.trim()}
            >
              Join Session
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
