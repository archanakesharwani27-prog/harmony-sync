import React from 'react';
import { motion } from 'framer-motion';

interface ArtistCardProps {
  name: string;
  image: string;
  label?: string;
  onClick?: () => void;
}

export default function ArtistCard({ name, image, label, onClick }: ArtistCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative flex-shrink-0 w-36 cursor-pointer group"
    >
      {/* Artist Image */}
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-b from-yellow-400 to-yellow-600 mb-3">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
        
        {/* Label Overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          {label && (
            <p className="text-[10px] text-white/80 uppercase tracking-wider mb-1">
              {label}
            </p>
          )}
          <h4 className="font-bold text-white text-sm uppercase tracking-wide">
            {name}
          </h4>
        </div>
      </div>

      {/* Below Image */}
      <p className="text-xs text-muted-foreground truncate">Featuring {name}</p>
    </motion.div>
  );
}
