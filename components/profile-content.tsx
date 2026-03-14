"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { BookOpen, Bookmark, ListIcon, LogOut, Film } from "lucide-react"
import { ThemeSelector } from "@/components/theme-selector"

interface ProfileContentProps {
  profile: { display_name: string; avatar_url: string | null; theme?: string } | null
  email: string
  stats: {
    diary: number
    watchlist: number
    lists: number
  }
}

export function ProfileContent({
  profile,
  email,
  stats,
}: ProfileContentProps) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const initials = profile?.display_name
    ? profile.display_name.slice(0, 2).toUpperCase()
    : "?"

  return (
    <main className="mx-auto max-w-lg">
      <header className="glass-header px-4 py-3">
        <h1 className="font-heading text-xl font-bold text-foreground">
          Profil
        </h1>
      </header>

      <div className="px-4 pt-8">
        {/* Avatar & Name */}
        <div className="flex flex-col items-center gap-3">
          <div className="glass-avatar flex h-20 w-20 items-center justify-center">
            <span className="font-heading text-2xl font-bold text-primary">
              {initials}
            </span>
          </div>
          <div className="text-center">
            <h2 className="font-heading text-xl font-bold text-foreground">
              {profile?.display_name || "Film-Fan"}
            </h2>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          <StatCard icon={BookOpen} label="Gesehen" value={stats.diary} />
          <StatCard icon={Bookmark} label="Watchlist" value={stats.watchlist} />
          <StatCard icon={ListIcon} label="Listen" value={stats.lists} />
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={handleLogout}
            className="glass-button flex items-center justify-center gap-2 py-3.5 text-sm font-medium text-destructive transition-all hover:bg-destructive/10"
            type="button"
          >
            <LogOut className="h-4 w-4" />
            Abmelden
          </button>
        </div>

        {/* App info */}
        <div className="mt-12 flex flex-col items-center gap-1 text-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Film className="h-4 w-4" />
            <span className="text-xs font-medium">InFocus</span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Familienfilm-Tagebuch
          </p>
        </div>
      </div>

      {/* Theme Selector */}
      <div className="mt-8">
        <ThemeSelector currentTheme={profile?.theme} />
      </div>

      <div className="h-8" />
    </main>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen
  label: string
  value: number
}) {
  return (
    <div className="glass-card flex flex-col items-center gap-1 py-4">
      <Icon className="h-5 w-5 text-primary" />
      <span className="font-heading text-xl font-bold text-foreground">
        {value}
      </span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  )
}
