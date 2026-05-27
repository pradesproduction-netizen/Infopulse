import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const admin = createAdminClient()

  const { data: member } = await admin
    .from('team_members')
    .select('infopreneur_id')
    .eq('id', id)
    .single()

  if (!member) return Response.json({ error: 'Membre introuvable' }, { status: 404 })
  if (member.infopreneur_id !== user.id) return Response.json({ error: 'Non autorisé' }, { status: 403 })

  // Delete prospects first so realtime events fire and update client KPIs
  await admin.from('prospects').delete().eq('team_member_id', id)

  const { error } = await admin.from('team_members').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })

  revalidatePath('/dashboard/equipe', 'layout')
  revalidatePath('/dashboard', 'page')
  return Response.json({ success: true })
}
