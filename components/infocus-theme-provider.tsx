"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { themes, getTheme, applyTheme, type Theme } from "@/lib/themes"
import { createClient } from "@/lib/supabase/client"

interface ThemeContextType {
  currentTheme: string
  setTheme: (themeId: string) => Promise<void>
  themes: Theme[]
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

interface InFocusThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: string
}

export function InFocusThemeProvider({ children, defaultTheme = "apple-frosted-light" }: InFocusThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState(defaultTheme)
  const supabase = createClient()

  useEffect(() => {
    // Load theme from database on mount
    async function loadTheme() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('theme')
            .eq('id', user.id)
            .single()
          
          if (profile?.theme) {
            const theme = getTheme(profile.theme)
            if (theme) {
              setCurrentTheme(profile.theme)
              applyTheme(theme)
            }
          } else {
            // Apply default theme
            const theme = getTheme(currentTheme)
            if (theme) {
              applyTheme(theme)
            }
          }
        }
      } catch (error) {
        console.error('Failed to load theme:', error)
        // Apply default theme on error
        const theme = getTheme(currentTheme)
        if (theme) {
          applyTheme(theme)
        }
      }
    }

    loadTheme()
  }, [])

  async function setTheme(themeId: string) {
    const theme = getTheme(themeId)
    if (!theme) return

    try {
      // Apply theme immediately
      applyTheme(theme)
      setCurrentTheme(themeId)

      // Save to database
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('profiles')
          .update({ theme: themeId })
          .eq('id', user.id)
      }
    } catch (error) {
      console.error('Failed to set theme:', error)
    }
  }

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  )
}
