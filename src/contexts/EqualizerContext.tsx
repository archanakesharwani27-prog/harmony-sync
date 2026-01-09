import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface EqualizerContextType {
  values: number[];
  activePreset: string;
  setValues: (values: number[]) => void;
  setActivePreset: (preset: string) => void;
}

const EqualizerContext = createContext<EqualizerContextType | null>(null);

const STORAGE_KEY = 'melodia_equalizer';

export function EqualizerProvider({ children }: { children: React.ReactNode }) {
  const [values, setValuesState] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.values || [0, 0, 0, 0, 0, 0];
      }
      return [0, 0, 0, 0, 0, 0];
    } catch {
      return [0, 0, 0, 0, 0, 0];
    }
  });

  const [activePreset, setActivePresetState] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.activePreset || 'Flat';
      }
      return 'Flat';
    } catch {
      return 'Flat';
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ values, activePreset }));
  }, [values, activePreset]);

  const setValues = useCallback((newValues: number[]) => {
    setValuesState(newValues);
  }, []);

  const setActivePreset = useCallback((preset: string) => {
    setActivePresetState(preset);
  }, []);

  return (
    <EqualizerContext.Provider value={{ values, activePreset, setValues, setActivePreset }}>
      {children}
    </EqualizerContext.Provider>
  );
}

export function useEqualizer() {
  const context = useContext(EqualizerContext);
  if (!context) {
    throw new Error('useEqualizer must be used within an EqualizerProvider');
  }
  return context;
}
