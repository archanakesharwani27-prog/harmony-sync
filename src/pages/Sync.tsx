import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Radio, Wifi, Users, Share2, Copy, LogOut, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSync } from '@/contexts/SyncContext';
import { toast } from 'sonner';

export default function Sync() {
  const navigate = useNavigate();
  const { session, isConnected, isHost, createSession, joinSession, leaveSession } = useSync();
  const [userName, setUserName] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');

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
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center">
                <Radio className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{session.name}</h1>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <p className="text-sm text-muted-foreground">
                    {isConnected ? 'Connected' : 'Connecting...'}
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

          {/* Participants */}
          <div className="bg-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Participants ({session.users.length})</h3>
            </div>
            <div className="space-y-3">
              {session.users.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                    <span className="text-primary-foreground font-bold">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{user.name}</p>
                    {user.isHost && <p className="text-xs text-primary">Host</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

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
