"use client"

import { Star } from "lucide-react"

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: "sm" | "md" | "lg"
  interactive?: boolean
  onChange?: (rating: number) => void
}

const sizes = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-7 w-7",
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onChange,
}: StarRatingProps) {
  // Convert 1-10 scale to 1-5 for display
  const displayRating = maxRating === 5 ? rating / 2 : rating

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => {
        const starValue = i + 1
        const filled = displayRating >= starValue
        const halfFilled = !filled && displayRating >= starValue - 0.5

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(starValue * 2)}
            className={`${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}`}
            aria-label={`${starValue} von 5 Sternen`}
          >
            <Star
              className={`${sizes[size]} ${
                filled
                  ? "fill-primary text-primary"
                  : halfFilled
                    ? "fill-primary/50 text-primary"
                    : "fill-none text-muted-foreground/40"
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}
