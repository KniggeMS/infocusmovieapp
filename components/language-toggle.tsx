'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import { Languages } from 'lucide-react'

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2 text-sm"
    >
      <Languages className="h-4 w-4" />
      {language === 'en' ? 'DE' : 'EN'}
    </Button>
  )
}
