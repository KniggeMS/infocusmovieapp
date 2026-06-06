type FontConfig = { href: string; loaded: boolean };

const FONT_MAP: Record<string, FontConfig> = {
  minimal: {
    href: 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300..700&display=swap',
    loaded: false,
  },
  cinematic: {
    href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..700&family=DM+Sans:opsz,wght@9..40,300..700&display=swap',
    loaded: false,
  },
  modern: {
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300..700&display=swap',
    loaded: false,
  },
  editorial: {
    href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..700&family=DM+Sans:opsz,wght@9..40,300..700&display=swap',
    loaded: false,
  },
};

export function loadFontsForStyle(style: string): void {
  const config = FONT_MAP[style];
  if (!config || config.loaded) return;

  if (!document.querySelector('link[href="https://fonts.googleapis.com"]')) {
    const pc1 = document.createElement('link');
    pc1.rel = 'preconnect';
    pc1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(pc1);

    const pc2 = document.createElement('link');
    pc2.rel = 'preconnect';
    pc2.href = 'https://fonts.gstatic.com';
    pc2.crossOrigin = 'anonymous';
    document.head.appendChild(pc2);
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = config.href;
  document.head.appendChild(link);
  config.loaded = true;
}
