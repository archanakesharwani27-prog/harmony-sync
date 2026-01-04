import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Moon,
  Sun,
  Palette,
  Volume2,
  Wifi,
  Download,
  Bell,
  Shield,
  HelpCircle,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/contexts/ThemeContext';

const accentColors = [
  { name: 'Orange', color: '#ff5722' },
  { name: 'Blue', color: '#2196f3' },
  { name: 'Green', color: '#4caf50' },
  { name: 'Purple', color: '#9c27b0' },
  { name: 'Pink', color: '#e91e63' },
  { name: 'Cyan', color: '#00bcd4' },
  { name: 'Red', color: '#f44336' },
  { name: 'Amber', color: '#ffc107' },
];

export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme, accentColor, setAccentColor } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-32"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="md:hidden"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
        </div>
      </div>

      <div className="px-6 md:px-8 py-6 max-w-2xl mx-auto space-y-8">
        {/* Appearance */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Appearance</h2>
          <div className="bg-card rounded-xl overflow-hidden divide-y divide-border">
            {/* Theme */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Sun className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium text-foreground">Theme</p>
                  <p className="text-sm text-muted-foreground">
                    {theme === 'dark' ? 'Dark mode' : 'Light mode'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={theme === 'light' ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setTheme('light')}
                >
                  Light
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                >
                  Dark
                </Button>
              </div>
            </div>

            {/* Accent Color */}
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <Palette className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Accent Color</p>
                  <p className="text-sm text-muted-foreground">
                    Choose your primary color
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {accentColors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setAccentColor(c.color)}
                    className={`w-10 h-10 rounded-full transition-all ${
                      accentColor === c.color
                        ? 'ring-2 ring-offset-2 ring-offset-card ring-foreground scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.color }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Audio */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Audio</h2>
          <div className="bg-card rounded-xl overflow-hidden divide-y divide-border">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <Volume2 className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Audio Quality</p>
                  <p className="text-sm text-muted-foreground">
                    Higher quality uses more data
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm">
                  Low
                </Button>
                <Button variant="default" size="sm">
                  Normal
                </Button>
                <Button variant="secondary" size="sm">
                  High
                </Button>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wifi className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Stream over WiFi only</p>
                  <p className="text-sm text-muted-foreground">Save mobile data</p>
                </div>
              </div>
              <Switch />
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Download over WiFi only</p>
                  <p className="text-sm text-muted-foreground">Save mobile data</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Notifications</h2>
          <div className="bg-card rounded-xl overflow-hidden divide-y divide-border">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Get notified about new releases</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </section>

        {/* About */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">About</h2>
          <div className="bg-card rounded-xl overflow-hidden divide-y divide-border">
            <button className="w-full p-4 flex items-center gap-3 text-left hover:bg-surface-hover transition-colors">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Privacy Policy</span>
            </button>
            <button className="w-full p-4 flex items-center gap-3 text-left hover:bg-surface-hover transition-colors">
              <HelpCircle className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Help & Support</span>
            </button>
            <div className="p-4 flex items-center gap-3">
              <Info className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Version</p>
                <p className="text-sm text-muted-foreground">1.0.0</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
