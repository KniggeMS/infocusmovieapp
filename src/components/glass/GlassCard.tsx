import { type ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  tinted?: boolean;
  onClick?: () => void;
  hover?: boolean;
}

export function GlassCard({ children, className = '', tinted, onClick, hover }: GlassCardProps) {
  const base = tinted ? 'glass-card-tinted' : 'glass-card';
  const hov = hover ? 'group hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 cursor-pointer' : '';
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl ${base} ${hov} ${className}`}
    >
      {children}
    </div>
  );
}
