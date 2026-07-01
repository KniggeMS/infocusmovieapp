import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface TrailerOverlayProps {
  title: string;
  overview: string | null;
  trailerKey: string;
  onClose: () => void;
  isVisible: boolean;
}

/**
 * TrailerOverlay - Ein immersives Glasmorphism-Overlay für den Video-Player.
 * Nutzt die Theme-Tokens der CineLog App für nahtlose Integration.
 */
export const TrailerOverlay: React.FC<TrailerOverlayProps> = ({ 
  title, 
  overview, 
  trailerKey,
  onClose, 
  isVisible 
}) => {
  if (!isVisible) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
      animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
      exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
      className="fixed inset-0 z-[100] flex flex-col justify-end bg-black/60 p-6 md:p-12"
    >
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all active:scale-90"
        aria-label="Schließen"
      >
        <X size={24} />
      </button>

      {/* Video Container (Background) */}
      <div className=\"absolute inset-0 -z-10\">
        <iframe
          className=\"w-full h-full\"
          src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=0&controls=0&showinfo=0&rel=0&modestbranding=1`}
          title={title}
          allow=\"autoplay; encrypted-media\"
          allowFullScreen
        ></iframe>
        <div className=\"absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent\" />
      </div>

      {/* Content Card */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: \"spring\", stiffness: 100 }}
        className=\"max-w-2xl bg-[var(--bg-card)] border border-[var(--border-color)] backdrop-blur-xl p-8 rounded-3xl shadow-2xl\"
      >
        <div className=\"flex items-center gap-3 mb-4\">
          <span className=\"px-3 py-1 bg-red-600 text-[10px] font-bold text-white uppercase tracking-widest rounded-full\">
            Cinema Mode
          </span>
          <span className=\"text-[var(--text-muted)] text-sm font-medium italic\">
            Powered by CineLog AI
          </span>
        </div>

        <h1 className=\"text-4xl md:text-5xl font-black text-[var(--text-main)] mb-4 tracking-tight\">
          {title}
        </h1>
        
        <p className=\"text-lg text-[var(--text-muted)] leading-relaxed mb-8 line-clamp-3 md:line-clamp-none\">
          {overview}
        </p>

        <div className=\"flex flex-wrap gap-4\">
          <button 
            onClick={onClose}
            className=\"px-8 py-4 bg-[var(--accent-glow)] text-white font-bold rounded-2xl hover:scale-105 transition-transform active:scale-95 shadow-lg\"
          >
            Video fortsetzen
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
