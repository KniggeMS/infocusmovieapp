import { type ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface SheetModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export function SheetModal({ open, onClose, title, children, className = '' }: SheetModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
            className={`relative w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl glass-sheet max-h-[85vh] flex flex-col overflow-hidden ${className}`}
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <div className="w-6" />
              <h2 className="text-lg font-bold text-app-text">{title}</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full glass-button hover:brightness-125 transition-all"
              >
                <X className="w-4 h-4 text-app-text-muted" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
