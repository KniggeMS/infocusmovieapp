import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ekbpexbhuochrplzorce.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable__UII_iKx3pgvLQvc1xrN1w_qnwP6JOv" || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
  
  if (!url || !key) {
      console.error("Supabase config missing!", { url: !!url, key: !!key });
  }

  return createBrowserClient(
    url!,
    key!,
  )
}
