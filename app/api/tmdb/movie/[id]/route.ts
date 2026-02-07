import { NextRequest, NextResponse } from "next/server"
import { getMovie } from "@/lib/tmdb"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const data = await getMovie(Number(id))
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Film nicht gefunden" }, { status: 500 })
  }
}
