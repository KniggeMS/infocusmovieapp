"use client"

import Image from "next/image"
import Link from "next/link"
import { posterUrl } from "@/lib/tmdb"
import { Film } from "lucide-react"

interface MovieCardProps {
  tmdbId: number
  title: string
  posterPath: string | null
  subtitle?: string
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "w-24 h-36",
  md: "w-32 h-48",
  lg: "w-40 h-60",
}

export function MovieCard({
  tmdbId,
  title,
  posterPath,
  subtitle,
  size = "md",
}: MovieCardProps) {
  const url = posterUrl(posterPath, size === "sm" ? "w185" : "w342")

  return (
    <Link href={`/movie/${tmdbId}`} className="group flex flex-col gap-2">
      <div
        className={`${sizeClasses[size]} relative overflow-hidden rounded-lg bg-secondary transition-transform group-hover:scale-105`}
      >
        {url ? (
          <Image
            src={url || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover"
            sizes={size === "sm" ? "96px" : size === "md" ? "128px" : "160px"}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Film className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className={`${sizeClasses[size].split(" ")[0]}`}>
        <p className="truncate text-xs font-medium text-foreground">{title}</p>
        {subtitle && (
          <p className="truncate text-[10px] text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
    </Link>
  )
}
