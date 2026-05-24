import { type ReactNode } from 'react';

interface GlassSectionProps {
  title: string;
  children?: ReactNode;
  className?: string;
  icon?: ReactNode;
}

export function GlassSection({ title, children, className = '', icon }: GlassSectionProps) {
  return (
    <section className={className}>
      <div className="flex items-center gap-2 mb-3 px-1">
        {icon && <span className="text-app-text-muted">{icon}</span>}
        <h4 className="text-xs font-bold text-app-text-muted uppercase tracking-wider">{title}</h4>
      </div>
      {children}
    </section>
  );
}
