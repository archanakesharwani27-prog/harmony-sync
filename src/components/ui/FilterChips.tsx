import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FilterChip {
  id: string;
  label: string;
}

interface FilterChipsProps {
  chips: FilterChip[];
  activeChip: string;
  onChange: (chipId: string) => void;
}

export default function FilterChips({ chips, activeChip, onChange }: FilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2 -mx-1 px-1">
      {chips.map((chip) => (
        <motion.button
          key={chip.id}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(chip.id)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
            activeChip === chip.id
              ? "bg-foreground text-background"
              : "bg-surface text-foreground hover:bg-surface-hover"
          )}
        >
          {chip.label}
        </motion.button>
      ))}
    </div>
  );
}
