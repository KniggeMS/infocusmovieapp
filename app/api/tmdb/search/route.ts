import { NextRequest, NextResponse } from "next/server"
import { searchAll } from "@/lib/tmdb"

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")
  const page = request.nextUrl.searchParams.get("page") || "1"

  if (!query) {
    return NextResponse.json({ results: [] })
  }

  try {
    const data = await searchAll(query, Number(page))
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Suche fehlgeschlagen" }, { status: 500 })
  }
}
