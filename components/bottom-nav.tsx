"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, PlusCircle, BookOpen, User } from "lucide-react"

const navItems = [
  { href: "/feed", label: "Feed", icon: Home },
  { href: "/search", label: "Suche", icon: Search },
  { href: "/log", label: "Loggen", icon: PlusCircle },
  { href: "/diary", label: "Tagebuch", icon: BookOpen },
  { href: "/profile", label: "Profil", icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon
          const isLogButton = item.href === "/log"

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1 transition-colors ${
                isLogButton
                  ? "text-primary"
                  : isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon
                className={`${isLogButton ? "h-7 w-7" : "h-5 w-5"}`}
                strokeWidth={isActive || isLogButton ? 2.5 : 1.5}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
