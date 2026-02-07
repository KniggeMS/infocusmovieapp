import { NextResponse } from "next/server"
import { getTrending } from "@/lib/tmdb"

export async function GET() {
  try {
    const data = await getTrending()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Trends konnten nicht geladen werden" }, { status: 500 })
  }
}
