"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'en' | 'de'

interface Translations {
  [key: string]: {
    [key: string]: string | Translations
  }
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  toggleLanguage: () => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Import translations
const translations: Record<Language, Translations> = {
  en: require('../locales/en.json'),
  de: require('../locales/de.json')
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('de')

  // Load saved language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'de')) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  // Translation function
  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = translations[language]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    return value || key
  }

  // Toggle between languages
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'de' : 'en')
  }

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t,
      toggleLanguage
    }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
