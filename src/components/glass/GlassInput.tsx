import { type InputHTMLAttributes, type ReactNode } from 'react';

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  className?: string;
}

export function GlassInput({ icon, className = '', ...props }: GlassInputProps) {
  return (
    <div className={`glass-input rounded-xl px-4 py-3 flex items-center gap-3 transition-all ${className}`}>
      {icon && <span className="text-app-text-muted shrink-0">{icon}</span>}
      <input
        {...props}
        className="bg-transparent border-none outline-none w-full text-app-text placeholder-app-text-muted text-sm"
      />
    </div>
  );
}
