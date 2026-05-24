interface GlassDividerProps {
  className?: string;
}

export function GlassDivider({ className = '' }: GlassDividerProps) {
  return <div className={`glass-divider my-4 ${className}`} />;
}
