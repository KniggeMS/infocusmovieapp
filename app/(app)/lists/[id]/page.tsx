import { createClient } from "@/lib/supabase/server"
import { ListDetailContent } from "@/components/list-detail-content"
import { redirect } from "next/navigation"

export default async function ListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: list } = await supabase
    .from("lists")
    .select("*")
    .eq("id", id)
    .single()

  if (!list) redirect("/diary")

  const { data: items } = await supabase
    .from("list_items")
    .select("*")
    .eq("list_id", id)
    .order("added_at", { ascending: false })

  return <ListDetailContent list={list} items={items || []} />
}
