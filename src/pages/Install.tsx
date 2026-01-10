import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, Smartphone, Check, Share, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

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
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Install App</h1>
              <p className="text-sm text-muted-foreground">Get the full experience</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-8">
        {isInstalled ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <Check className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">App Installed!</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Vibes Music is installed on your device. Find it on your home screen.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center py-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-6">
                <Smartphone className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Install Vibes Music</h2>
              <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                Install our app for the best experience with offline access and faster loading.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 max-w-sm mx-auto mb-8">
              <div className="bg-card rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Offline Access</p>
                  <p className="text-sm text-muted-foreground">Listen even without internet</p>
                </div>
              </div>
              <div className="bg-card rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Home Screen Access</p>
                  <p className="text-sm text-muted-foreground">Launch quickly from your home screen</p>
                </div>
              </div>
            </div>

            {/* Install Button or iOS Instructions */}
            <div className="max-w-sm mx-auto">
              {isIOS ? (
                <div className="bg-card rounded-xl p-6 space-y-4">
                  <h3 className="font-semibold text-foreground text-center">How to Install on iOS</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">1</div>
                      <div className="flex items-center gap-2">
                        <span className="text-foreground">Tap the</span>
                        <Share className="w-5 h-5 text-primary" />
                        <span className="text-foreground">Share button</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">2</div>
                      <div className="flex items-center gap-2">
                        <span className="text-foreground">Scroll and tap</span>
                        <Plus className="w-5 h-5 text-primary" />
                        <span className="text-foreground">"Add to Home Screen"</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">3</div>
                      <span className="text-foreground">Tap "Add" to install</span>
                    </div>
                  </div>
                </div>
              ) : deferredPrompt ? (
                <Button 
                  className="w-full h-14 text-lg gradient-primary"
                  onClick={handleInstall}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Install App
                </Button>
              ) : (
                <div className="bg-card rounded-xl p-6 text-center">
                  <p className="text-muted-foreground">
                    Open this page in Chrome or Edge browser to install the app, or use your browser menu to "Add to Home Screen".
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
