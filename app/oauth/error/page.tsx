"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"

export default function OAuthErrorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error') || 'Unbekannter Fehler'

  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <div className="w-full max-w-md glass-card p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h1 className="text-xl font-semibold text-foreground">
            OAuth Konfiguration fehlgeschlagen
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Fehler: {error}
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Bitte überprüfe deine MCP Konfiguration und versuche es erneut.
          </p>
          <button
            onClick={() => router.push('/auth/login')}
            className="glass-button mt-4 w-full"
          >
            Zurück zum Login
          </button>
        </div>
      </div>
    </main>
  )
}
