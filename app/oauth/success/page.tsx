"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle, AlertCircle } from "lucide-react"

export default function OAuthSuccessPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const mcpConfigured = searchParams.get('mcp_configured')
  const error = searchParams.get('error')

  useEffect(() => {
    if (mcpConfigured === 'true') {
      setStatus('success')
    } else if (error) {
      setStatus('error')
    }
  }, [mcpConfigured, error])

  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <div className="w-full max-w-md glass-card p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin h-8 w-8 text-muted-foreground" />
              <h1 className="text-xl font-semibold text-foreground">
                OAuth Konfiguration wird verarbeitet...
              </h1>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 text-green-500" />
              <h1 className="text-xl font-semibold text-foreground">
                MCP OAuth erfolgreich konfiguriert!
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Der Supabase MCP Server ist jetzt bereit.
              </p>
              <button
                onClick={() => router.push('/diary')}
                className="glass-button mt-4 w-full"
              >
                Zur App
              </button>
            </>
          )}
          
          {status === 'error' && (
            <>
              <AlertCircle className="h-12 w-12 text-destructive" />
              <h1 className="text-xl font-semibold text-foreground">
                OAuth Konfiguration fehlgeschlagen
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Fehler: {error || 'Unbekannter Fehler'}
              </p>
              <button
                onClick={() => router.push('/auth/login')}
                className="glass-button mt-4 w-full"
              >
                Zurück zum Login
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
