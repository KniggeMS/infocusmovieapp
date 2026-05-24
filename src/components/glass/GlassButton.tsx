import { type ReactNode, type ButtonHTMLAttributes } from 'react';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  pill?: boolean;
  accent?: boolean;
}

export function GlassButton({ children, className = '', pill, accent, ...props }: GlassButtonProps) {
  return (
    <button
      {...props}
      className={`glass-button ${pill ? 'glass-pill' : 'rounded-xl'} font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${accent ? 'bg-accent-color/20 border-accent-color/30 text-accent-color' : ''} ${className}`}
    >
      {children}
    </button>
  );
}
