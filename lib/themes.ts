// Theme System für InFocus Movie App
export interface Theme {
  id: string
  name: string
  description: string
  colors: {
    // Base colors
    background: string
    foreground: string
    muted: string
    mutedForeground: string
    popover: string
    popoverForeground: string
    card: string
    cardForeground: string
    border: string
    input: string
    
    // Primary colors
    primary: string
    primaryForeground: string
    secondary: string
    secondaryForeground: string
    accent: string
    accentForeground: string
    destructive: string
    destructiveForeground: string
    
    // Glass effect colors
    glassBackground: string
    glassBorder: string
    glassShadow: string
  }
  css: string
}

export const themes: Theme[] = [
  // 1. Apple Frosted Glass - Hell
  {
    id: 'apple-frosted-light',
    name: 'Apple Frosted Glass',
    description: 'Klassisches Apple Design mit Glas-Effekten (Hell)',
    colors: {
      background: '#f2f2f7',
      foreground: '#1c1c1e',
      muted: '#f2f2f7',
      mutedForeground: '#8e8e93',
      popover: '#ffffff',
      popoverForeground: '#1c1c1e',
      card: 'rgba(255, 255, 255, 0.72)',
      cardForeground: '#1c1c1e',
      border: 'rgba(0, 0, 0, 0.1)',
      input: 'rgba(255, 255, 255, 0.8)',
      primary: '#007aff',
      primaryForeground: '#ffffff',
      secondary: 'rgba(120, 120, 128, 0.12)',
      secondaryForeground: '#1c1c1e',
      accent: '#5856d6',
      accentForeground: '#ffffff',
      destructive: '#ff3b30',
      destructiveForeground: '#ffffff',
      glassBackground: 'rgba(255, 255, 255, 0.8)',
      glassBorder: 'rgba(255, 255, 255, 0.18)',
      glassShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
    },
    css: `
      :root {
        --background: 242 242 247;
        --foreground: 28 28 30;
        --muted: 242 242 247;
        --muted-foreground: 142 142 147;
        --popover: 255 255 255;
        --popover-foreground: 28 28 30;
        --card: 255 255 255;
        --card-foreground: 28 28 30;
        --border: 0 0 0 / 0.1;
        --input: 255 255 255;
        --primary: 0 122 255;
        --primary-foreground: 255 255 255;
        --secondary: 120 120 128 / 0.12;
        --secondary-foreground: 28 28 30;
        --accent: 88 86 214;
        --accent-foreground: 255 255 255;
        --destructive: 255 59 48;
        --destructive-foreground: 255 255 255;
        --glass-bg: rgba(255, 255, 255, 0.8);
        --glass-border: rgba(255, 255, 255, 0.18);
        --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      }
    `
  },

  // 2. Apple Frosted Glass - Dunkel
  {
    id: 'apple-frosted-dark',
    name: 'Apple Frosted Glass Dark',
    description: 'Klassisches Apple Design mit Glas-Effekten (Dunkel)',
    colors: {
      background: '#000000',
      foreground: '#ffffff',
      muted: '#1c1c1e',
      mutedForeground: '#98989f',
      popover: '#2c2c2e',
      popoverForeground: '#ffffff',
      card: 'rgba(44, 44, 46, 0.72)',
      cardForeground: '#ffffff',
      border: 'rgba(255, 255, 255, 0.1)',
      input: 'rgba(44, 44, 46, 0.8)',
      primary: '#0a84ff',
      primaryForeground: '#ffffff',
      secondary: 'rgba(120, 120, 128, 0.16)',
      secondaryForeground: '#ffffff',
      accent: '#5e5ce6',
      accentForeground: '#ffffff',
      destructive: '#ff453a',
      destructiveForeground: '#ffffff',
      glassBackground: 'rgba(44, 44, 46, 0.8)',
      glassBorder: 'rgba(255, 255, 255, 0.12)',
      glassShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    },
    css: `
      :root {
        --background: 0 0 0;
        --foreground: 255 255 255;
        --muted: 28 28 30;
        --muted-foreground: 152 152 159;
        --popover: 44 44 46;
        --popover-foreground: 255 255 255;
        --card: 44 44 46;
        --card-foreground: 255 255 255;
        --border: 255 255 255 / 0.1;
        --input: 44 44 46;
        --primary: 10 132 255;
        --primary-foreground: 255 255 255;
        --secondary: 120 120 128 / 0.16;
        --secondary-foreground: 255 255 255;
        --accent: 94 92 230;
        --accent-foreground: 255 255 255;
        --destructive: 255 69 58;
        --destructive-foreground: 255 255 255;
        --glass-bg: rgba(44, 44, 46, 0.8);
        --glass-border: rgba(255, 255, 255, 0.12);
        --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      }
    `
  },

  // 3. Cinema Noir - Dunkel
  {
    id: 'cinema-noir',
    name: 'Cinema Noir',
    description: 'Elegantes dunkles Kino-Theme mit tiefen Farben',
    colors: {
      background: '#0a0a0a',
      foreground: '#e8e8e8',
      muted: '#1a1a1a',
      mutedForeground: '#888888',
      popover: '#2a2a2a',
      popoverForeground: '#e8e8e8',
      card: 'rgba(42, 42, 42, 0.8)',
      cardForeground: '#e8e8e8',
      border: 'rgba(255, 215, 0, 0.2)',
      input: 'rgba(42, 42, 42, 0.9)',
      primary: '#ffd700',
      primaryForeground: '#0a0a0a',
      secondary: 'rgba(255, 215, 0, 0.1)',
      secondaryForeground: '#ffd700',
      accent: '#ff6b6b',
      accentForeground: '#0a0a0a',
      destructive: '#ff4444',
      destructiveForeground: '#ffffff',
      glassBackground: 'rgba(20, 20, 20, 0.85)',
      glassBorder: 'rgba(255, 215, 0, 0.15)',
      glassShadow: '0 8px 32px rgba(255, 215, 0, 0.1)'
    },
    css: `
      :root {
        --background: 10 10 10;
        --foreground: 232 232 232;
        --muted: 26 26 26;
        --muted-foreground: 136 136 136;
        --popover: 42 42 42;
        --popover-foreground: 232 232 232;
        --card: 42 42 42;
        --card-foreground: 232 232 232;
        --border: 255 215 0 / 0.2;
        --input: 42 42 42;
        --primary: 255 215 0;
        --primary-foreground: 10 10 10;
        --secondary: 255 215 0 / 0.1;
        --secondary-foreground: 255 215 0;
        --accent: 255 107 107;
        --accent-foreground: 10 10 10;
        --destructive: 255 68 68;
        --destructive-foreground: 255 255 255;
        --glass-bg: rgba(20, 20, 20, 0.85);
        --glass-border: rgba(255, 215, 0, 0.15);
        --glass-shadow: 0 8px 32px rgba(255, 215, 0, 0.1);
      }
    `
  },

  // 4. Ocean Blue - Hell
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    description: 'Marines Hellblau-Theme mit sanften Übergängen',
    colors: {
      background: '#f0f9ff',
      foreground: '#0c4a6e',
      muted: '#e0f2fe',
      mutedForeground: '#64748b',
      popover: '#ffffff',
      popoverForeground: '#0c4a6e',
      card: '#ffffff',
      cardForeground: '#0c4a6e',
      border: 'rgba(59, 130, 246, 0.2)',
      input: '#f0f9ff',
      primary: '#0ea5e9',
      primaryForeground: '#ffffff',
      secondary: 'rgba(14, 165, 233, 0.1)',
      secondaryForeground: '#0c4a6e',
      accent: '#06b6d4',
      accentForeground: '#ffffff',
      destructive: '#f43f5e',
      destructiveForeground: '#ffffff',
      glassBackground: 'rgba(255, 255, 255, 0.85)',
      glassBorder: 'rgba(59, 130, 246, 0.15)',
      glassShadow: '0 8px 32px rgba(14, 165, 233, 0.15)'
    },
    css: `
      :root {
        --background: 240 249 255;
        --foreground: 12 74 110;
        --muted: 224 242 254;
        --muted-foreground: 100 116 139;
        --popover: 255 255 255;
        --popover-foreground: 12 74 110;
        --card: 255 255 255;
        --card-foreground: 12 74 110;
        --border: 59 130 246 / 0.2;
        --input: 240 249 255;
        --primary: 14 165 233;
        --primary-foreground: 255 255 255;
        --secondary: 14 165 233 / 0.1;
        --secondary-foreground: 12 74 110;
        --accent: 6 182 212;
        --accent-foreground: 255 255 255;
        --destructive: 244 63 94;
        --destructive-foreground: 255 255 255;
        --glass-bg: rgba(255, 255, 255, 0.85);
        --glass-border: rgba(59, 130, 246, 0.15);
        --glass-shadow: 0 8px 32px rgba(14, 165, 233, 0.15);
      }
    `
  },

  // 5. Sunset Purple - Dunkel
  {
    id: 'sunset-purple',
    name: 'Sunset Purple',
    description: 'Warmes lila Theme mit Sonnenuntergang-Farben',
    colors: {
      background: '#1a001a',
      foreground: '#f3e8ff',
      muted: '#2d1b2d',
      mutedForeground: '#a78bfa',
      popover: '#3d2d3d',
      popoverForeground: '#f3e8ff',
      card: 'rgba(61, 45, 61, 0.8)',
      cardForeground: '#f3e8ff',
      border: 'rgba(167, 139, 250, 0.3)',
      input: 'rgba(61, 45, 61, 0.9)',
      primary: '#a78bfa',
      primaryForeground: '#1a001a',
      secondary: 'rgba(167, 139, 250, 0.15)',
      secondaryForeground: '#f3e8ff',
      accent: '#f472b6',
      accentForeground: '#1a001a',
      destructive: '#f87171',
      destructiveForeground: '#ffffff',
      glassBackground: 'rgba(45, 27, 45, 0.85)',
      glassBorder: 'rgba(167, 139, 250, 0.2)',
      glassShadow: '0 8px 32px rgba(167, 139, 250, 0.2)'
    },
    css: `
      :root {
        --background: 26 0 26;
        --foreground: 243 232 255;
        --muted: 45 27 45;
        --muted-foreground: 167 139 250;
        --popover: 61 45 61;
        --popover-foreground: 243 232 255;
        --card: 61 45 61;
        --card-foreground: 243 232 255;
        --border: 167 139 250 / 0.3;
        --input: 61 45 61;
        --primary: 167 139 250;
        --primary-foreground: 26 0 26;
        --secondary: 167 139 250 / 0.15;
        --secondary-foreground: 243 232 255;
        --accent: 244 114 182;
        --accent-foreground: 26 0 26;
        --destructive: 248 113 113;
        --destructive-foreground: 255 255 255;
        --glass-bg: rgba(45, 27, 45, 0.85);
        --glass-border: rgba(167, 139, 250, 0.2);
        --glass-shadow: 0 8px 32px rgba(167, 139, 250, 0.2);
      }
    `
  },

  // 6. Forest Green - Hell
  {
    id: 'forest-green',
    name: 'Forest Green',
    description: 'Natürliches grün Theme mit Waldfarben',
    colors: {
      background: '#f0fdf4',
      foreground: '#14532d',
      muted: '#dcfce7',
      mutedForeground: '#64748b',
      popover: '#ffffff',
      popoverForeground: '#14532d',
      card: '#ffffff',
      cardForeground: '#14532d',
      border: 'rgba(34, 197, 94, 0.3)',
      input: '#f0fdf4',
      primary: '#22c55e',
      primaryForeground: '#ffffff',
      secondary: 'rgba(34, 197, 94, 0.1)',
      secondaryForeground: '#14532d',
      accent: '#84cc16',
      accentForeground: '#ffffff',
      destructive: '#ef4444',
      destructiveForeground: '#ffffff',
      glassBackground: 'rgba(255, 255, 255, 0.85)',
      glassBorder: 'rgba(34, 197, 94, 0.2)',
      glassShadow: '0 8px 32px rgba(34, 197, 94, 0.1)'
    },
    css: `
      :root {
        --background: 240 253 244;
        --foreground: 20 83 45;
        --muted: 220 252 231;
        --muted-foreground: 100 116 139;
        --popover: 255 255 255;
        --popover-foreground: 20 83 45;
        --card: 255 255 255;
        --card-foreground: 20 83 45;
        --border: 34 197 94 / 0.3;
        --input: 240 253 244;
        --primary: 34 197 94;
        --primary-foreground: 255 255 255;
        --secondary: 34 197 94 / 0.1;
        --secondary-foreground: 20 83 45;
        --accent: 132 204 22;
        --accent-foreground: 255 255 255;
        --destructive: 239 68 68;
        --destructive-foreground: 255 255 255;
        --glass-bg: rgba(255, 255, 255, 0.85);
        --glass-border: rgba(34 197, 94, 0.2);
        --glass-shadow: 0 8px 32px rgba(34 197, 94, 0.1);
      }
    `
  }
]

export function getTheme(id: string): Theme | undefined {
  return themes.find(theme => theme.id === id)
}

export function applyTheme(theme: Theme) {
  // Remove existing theme styles
  const existingStyle = document.getElementById('theme-styles')
  if (existingStyle) {
    existingStyle.remove()
  }
  
  // Add new theme styles with proper CSS custom properties
  const styleElement = document.createElement('style')
  styleElement.id = 'theme-styles'
  styleElement.textContent = theme.css + `
    /* Additional theme fixes */
    .glass-card {
      background: var(--glass-bg) !important;
      border: 1px solid var(--glass-border) !important;
      box-shadow: var(--glass-shadow) !important;
    }
    
    .glass-header {
      background: var(--glass-bg) !important;
      border: 1px solid var(--glass-border) !important;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }
    
    .glass-button {
      background: var(--glass-bg) !important;
      border: 1px solid var(--glass-border) !important;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }
    
    .glass-avatar {
      background: var(--glass-bg) !important;
      border: 1px solid var(--glass-border) !important;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }
    
    .glass-tag {
      background: var(--glass-bg) !important;
      border: 1px solid var(--glass-border) !important;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }
    
    .glass-input {
      background: var(--glass-bg) !important;
      border: 1px solid var(--glass-border) !important;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }
  `
  document.head.appendChild(styleElement)
  
  // Update data attribute on body
  document.body.setAttribute('data-theme', theme.id)
}
