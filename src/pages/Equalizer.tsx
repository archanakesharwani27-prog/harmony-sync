import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Sliders, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useEqualizer } from '@/contexts/EqualizerContext';

const presets = [
  { name: 'Flat', values: [0, 0, 0, 0, 0, 0] },
  { name: 'Rock', values: [5, 3, -1, -1, 3, 5] },
  { name: 'Pop', values: [-1, 2, 5, 5, 2, -1] },
  { name: 'Jazz', values: [3, 0, 2, 2, 0, 3] },
  { name: 'Classical', values: [4, 3, 0, 0, 3, 4] },
  { name: 'Bass Boost', values: [6, 4, 0, 0, 0, 0] },
];

const bands = ['60Hz', '230Hz', '910Hz', '3.6kHz', '14kHz', '16kHz'];

export default function Equalizer() {
  const navigate = useNavigate();
  const { values, activePreset, setValues, setActivePreset } = useEqualizer();

  const handleBandChange = (index: number, value: number[]) => {
    const newValues = [...values];
    newValues[index] = value[0];
    setValues(newValues);
    setActivePreset('Custom');
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setValues([...preset.values]);
    setActivePreset(preset.name);
  };

  const resetEqualizer = () => {
    setValues([0, 0, 0, 0, 0, 0]);
    setActivePreset('Flat');
  };

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Equalizer</h1>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={resetEqualizer}>
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      {/* Presets */}
      <div className="px-4 py-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Presets</h3>
        <div className="flex gap-2 flex-wrap">
          {presets.map((preset) => (
            <Button
              key={preset.name}
              variant={activePreset === preset.name ? 'default' : 'outline'}
              size="sm"
              onClick={() => applyPreset(preset)}
              className="rounded-full"
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      {/* EQ Bands */}
      <div className="px-4 py-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-6">Frequency Bands</h3>
        <div className="flex justify-between gap-4 h-64">
          {bands.map((band, index) => (
            <div key={band} className="flex flex-col items-center gap-4 flex-1">
              <span className="text-xs text-primary font-medium">
                {values[index] > 0 ? '+' : ''}{values[index]}dB
              </span>
              <div className="flex-1 w-full flex justify-center">
                <Slider
                  orientation="vertical"
                  value={[values[index]]}
                  min={-12}
                  max={12}
                  step={1}
                  onValueChange={(val) => handleBandChange(index, val)}
                  className="h-full"
                />
              </div>
              <span className="text-xs text-muted-foreground">{band}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className="px-4 py-4">
        <p className="text-xs text-muted-foreground text-center">
          Note: Equalizer settings are visual only. Full audio processing requires native app capabilities.
        </p>
      </div>
    </div>
  );
}
