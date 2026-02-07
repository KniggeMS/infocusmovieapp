import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const params = await searchParams
  
  // If there's an auth code, redirect to callback to exchange it
  if (params.code) {
    redirect(`/auth/callback?code=${params.code}`)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/feed")
  } else {
    redirect("/auth/login")
  }
}
