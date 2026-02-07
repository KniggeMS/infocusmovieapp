import Link from "next/link"
import { AlertTriangle, ArrowLeft } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
        </div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Fehler bei der Anmeldung
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Etwas ist schiefgelaufen. Bitte versuche es erneut.
        </p>
        <Link
          href="/auth/login"
          className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Zur Anmeldeseite
        </Link>
      </div>
    </main>
  )
}
