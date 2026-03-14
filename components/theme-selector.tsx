"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Palette, Check } from "lucide-react"

// Einfache Themes die garantiert funktionieren
const simpleThemes = {
  'apple-frosted-light': {
    background: 'rgb(242, 242, 247)',
    foreground: 'rgb(28, 28, 30)',
    glassBg: 'rgba(255, 255, 255, 0.85)',  // Mehr Deckkraft
    glassBorder: 'rgba(255, 255, 255, 0.25)',  // Deutlicherer Rand
    primary: 'rgb(0, 122, 255)'
  },
  'apple-frosted-dark': {
    background: 'rgb(0, 0, 0)',
    foreground: 'rgb(255, 255, 255)',
    glassBg: 'rgba(44, 44, 46, 0.8)',
    glassBorder: 'rgba(255, 255, 255, 0.12)',
    primary: 'rgb(10, 132, 255)'
  },
  'ocean-blue': {
    background: 'rgb(240, 249, 255)',
    foreground: 'rgb(15, 23, 42)',  // Dunklerer Text
    glassBg: 'rgba(255, 255, 255, 0.95)',  // Mehr Deckkraft
    glassBorder: 'rgba(59, 130, 246, 0.3)',  // Deutlicherer Rand
    primary: 'rgb(14, 165, 233)'
  },
  'forest-green': {
    background: 'rgb(240, 253, 244)',
    foreground: 'rgb(21, 63, 31)',  // Dunklerer Text
    glassBg: 'rgba(255, 255, 255, 0.95)',  // Mehr Deckkraft
    glassBorder: 'rgba(34, 197, 94, 0.3)',  // Deutlicherer Rand
    primary: 'rgb(34, 197, 94)'
  },
  'cinema-noir': {
    background: 'rgb(10, 10, 10)',
    foreground: 'rgb(232, 232, 232)',
    glassBg: 'rgba(20, 20, 20, 0.85)',
    glassBorder: 'rgba(255, 215, 0, 0.15)',
    primary: 'rgb(255, 215, 0)'
  },
  'sunset-purple': {
    background: 'rgb(26, 0, 26)',
    foreground: 'rgb(243, 232, 255)',
    glassBg: 'rgba(45, 27, 45, 0.85)',
    glassBorder: 'rgba(167, 139, 250, 0.2)',
    primary: 'rgb(167, 139, 250)'
  }
}

function applySimpleTheme(themeId: string) {
  const theme = simpleThemes[themeId as keyof typeof simpleThemes];
  if (!theme) return;

  // Entferne alte Styles
  const oldStyles = document.getElementById('simple-theme-styles');
  if (oldStyles) oldStyles.remove();

  // Erstelle neue Styles mit direkten Farben
  const styleElement = document.createElement('style');
  styleElement.id = 'simple-theme-styles';
  styleElement.textContent = `
    body {
      background-color: ${theme.background} !important;
      color: ${theme.foreground} !important;
    }
    
    .glass-card,
    .glass-header,
    .glass-button,
    .glass-avatar,
    .glass-tag,
    .glass-input {
      background: ${theme.glassBg} !important;
      border: 1px solid ${theme.glassBorder} !important;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      color: ${theme.foreground} !important;
    }
    
    .text-primary {
      color: ${theme.primary} !important;
    }
    
    .bg-primary {
      background-color: ${theme.primary} !important;
    }
    
    h1, h2, h3, h4, h5, h6 {
      color: ${theme.foreground} !important;
    }
    
    p, span, div {
      color: ${theme.foreground} !important;
    }
    
    .text-muted-foreground {
      color: ${theme.foreground}66 !important;
    }
    
    .text-foreground {
      color: ${theme.foreground} !important;
    }
  `;
  
  document.head.appendChild(styleElement);
  document.body.setAttribute('data-theme', themeId);
}

interface ThemeSelectorProps {
  currentTheme?: string
  onThemeChange?: (themeId: string) => void
}

export function ThemeSelector({ currentTheme = "apple-frosted-light", onThemeChange }: ThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme)
  const [applying, setApplying] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Apply theme on mount
    applySimpleTheme(selectedTheme)
  }, [selectedTheme])

  async function handleThemeChange(themeId: string) {
    setSelectedTheme(themeId)
    setApplying(true)
    
    try {
      applySimpleTheme(themeId)
      onThemeChange?.(themeId)
      
      // Save to database
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('profiles')
          .update({ theme: themeId })
          .eq('id', user.id)
      }
    } catch (error) {
      console.error('Failed to apply theme:', error)
    } finally {
      setApplying(false)
    }
  }

  // Theme Definitionen für UI
  const themeDefinitions = [
    {
      id: 'apple-frosted-light',
      name: 'Apple Frosted Glass',
      description: 'Klassisches Apple Design mit Glas-Effekten (Hell)',
      colors: { primary: 'rgb(0, 122, 255)', accent: 'rgb(88, 86, 214)', background: 'rgb(242, 242, 247)' }
    },
    {
      id: 'apple-frosted-dark',
      name: 'Apple Frosted Glass Dark',
      description: 'Klassisches Apple Design mit Glas-Effekten (Dunkel)',
      colors: { primary: 'rgb(10, 132, 255)', accent: 'rgb(94, 92, 230)', background: 'rgb(0, 0, 0)' }
    },
    {
      id: 'ocean-blue',
      name: 'Ocean Blue',
      description: 'Marines Hellblau-Theme mit sanften Übergängen',
      colors: { primary: 'rgb(14, 165, 233)', accent: 'rgb(6, 182, 212)', background: 'rgb(240, 249, 255)' }
    },
    {
      id: 'forest-green',
      name: 'Forest Green',
      description: 'Natürliches grün Theme mit Waldfarben',
      colors: { primary: 'rgb(34, 197, 94)', accent: 'rgb(132, 204, 22)', background: 'rgb(240, 253, 244)' }
    },
    {
      id: 'cinema-noir',
      name: 'Cinema Noir',
      description: 'Elegantes dunkles Kino-Theme mit tiefen Farben',
      colors: { primary: 'rgb(255, 215, 0)', accent: 'rgb(255, 107, 107)', background: 'rgb(10, 10, 10)' }
    },
    {
      id: 'sunset-purple',
      name: 'Sunset Purple',
      description: 'Warmes lila Theme mit Sonnenuntergang-Farben',
      colors: { primary: 'rgb(167, 139, 250)', accent: 'rgb(244, 114, 182)', background: 'rgb(26, 0, 26)' }
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Palette className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Theme auswählen</h3>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {themeDefinitions.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            isSelected={selectedTheme === theme.id}
            isApplying={applying && selectedTheme === theme.id}
            onSelect={() => handleThemeChange(theme.id)}
          />
        ))}
      </div>
    </div>
  )
}

interface ThemeCardProps {
  theme: {
    id: string
    name: string
    description: string
    colors: {
      primary: string
      accent: string
      background: string
    }
  }
  isSelected: boolean
  isApplying: boolean
  onSelect: () => void
}

function ThemeCard({ theme, isSelected, isApplying, onSelect }: ThemeCardProps) {
  return (
    <button
      onClick={onSelect}
      disabled={isApplying}
      className={`
        relative w-full rounded-lg border p-4 text-left transition-all
        ${isSelected 
          ? 'border-primary ring-2 ring-primary/20' 
          : 'border-border hover:border-primary/50'
        }
        ${isApplying ? 'opacity-50' : ''}
      `}
      style={{
        backgroundColor: theme.colors.background,
        borderColor: theme.colors.primary + '33',
        color: theme.colors.background === 'rgb(0, 0, 0)' || theme.colors.background === 'rgb(10, 10, 10)' || theme.colors.background === 'rgb(26, 0, 26)' ? '#ffffff' : '#000000'
      }}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="font-medium" style={{ color: theme.colors.background === 'rgb(0, 0, 0)' || theme.colors.background === 'rgb(10, 10, 10)' || theme.colors.background === 'rgb(26, 0, 26)' ? '#ffffff' : '#000000' }}>
            {theme.name}
          </h4>
          <p className="text-sm" style={{ color: theme.colors.background === 'rgb(0, 0, 0)' || theme.colors.background === 'rgb(10, 10, 10)' || theme.colors.background === 'rgb(26, 0, 26)' ? '#ffffff99' : '#00000099' }}>
            {theme.description}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Color preview */}
          <div className="flex gap-1">
            <div 
              className="h-4 w-4 rounded-full border"
              style={{ 
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.background === 'rgb(0, 0, 0)' || theme.colors.background === 'rgb(10, 10, 10)' || theme.colors.background === 'rgb(26, 0, 26)' ? '#ffffff33' : '#00000033'
              }}
            />
            <div 
              className="h-4 w-4 rounded-full border"
              style={{ 
                backgroundColor: theme.colors.accent,
                borderColor: theme.colors.background === 'rgb(0, 0, 0)' || theme.colors.background === 'rgb(10, 10, 10)' || theme.colors.background === 'rgb(26, 0, 26)' ? '#ffffff33' : '#00000033'
              }}
            />
            <div 
              className="h-4 w-4 rounded-full border"
              style={{ 
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.background === 'rgb(0, 0, 0)' || theme.colors.background === 'rgb(10, 10, 10)' || theme.colors.background === 'rgb(26, 0, 26)' ? '#ffffff33' : '#00000033'
              }}
            />
          </div>
          
          {isSelected && !isApplying && (
            <Check className="h-4 w-4" style={{ color: theme.colors.primary }} />
          )}
        </div>
      </div>
      
      {isApplying && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/50">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </button>
  )
}
