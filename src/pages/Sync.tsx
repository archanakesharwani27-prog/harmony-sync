import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Radio, Wifi, Users, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Sync() {
  const navigate = useNavigate();

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

      {/* Content */}
      <div className="px-4 py-8">
        <div className="text-center py-16">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-600/20 to-teal-600/20 flex items-center justify-center mx-auto mb-6">
            <Users className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Coming Soon!</h2>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8">
            Sync sessions will let you listen to music together with friends in real-time.
          </p>
          
          <div className="space-y-4 max-w-sm mx-auto">
            <div className="bg-card rounded-xl p-4 flex items-center gap-4">
              <Wifi className="w-8 h-8 text-primary" />
              <div className="text-left">
                <p className="font-medium text-foreground">Real-time Sync</p>
                <p className="text-sm text-muted-foreground">Everyone hears the same song at the same time</p>
              </div>
            </div>
            
            <div className="bg-card rounded-xl p-4 flex items-center gap-4">
              <Share2 className="w-8 h-8 text-primary" />
              <div className="text-left">
                <p className="font-medium text-foreground">Share Control</p>
                <p className="text-sm text-muted-foreground">Anyone in the session can add songs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
