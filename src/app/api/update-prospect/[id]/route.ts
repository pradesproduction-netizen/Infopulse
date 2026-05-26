import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

const ALLOWED_FIELDS = ['full_name', 'email', 'phone', 'source', 'estimated_value', 'pipeline_stage', 'instagram_url', 'linkedin_url', 'notes'] as const

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of ALLOWED_FIELDS) {
    if (key in body) updates[key] = body[key] ?? null
  }

  if ('full_name' in updates && !String(updates.full_name ?? '').trim()) {
    return Response.json({ error: 'Le nom est requis' }, { status: 400 })
  }
  if ('estimated_value' in updates && updates.estimated_value !== null) {
    updates.estimated_value = Number(updates.estimated_value)
  }

  // Infopreneur path — RLS handles authorization
  const { data } = await supabase
    .from('prospects')
    .update(updates)
    .eq('id', id)
    .eq('infopreneur_id', user.id)
    .select()
    .single()

  if (data) {
    revalidatePath('/dashboard/equipe', 'layout')
    revalidatePath('/dashboard', 'page')
    return Response.json({ success: true, prospect: data })
  }

  // Team member path — look up infopreneur_id via admin client
  const admin = createAdminClient()
  const { data: member } = await admin
    .from('team_members')
    .select('infopreneur_id')
    .eq('email', user.email ?? '')
    .single()

  if (!member) return Response.json({ error: 'Non autorisé' }, { status: 403 })

  const { data: updated, error } = await admin
    .from('prospects')
    .update(updates)
    .eq('id', id)
    .eq('infopreneur_id', member.infopreneur_id)
    .select()
    .single()

  if (error) {
    console.error('[update-prospect] UPDATE error:', error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }

  revalidatePath('/espace-equipe/pipeline', 'page')
  return Response.json({ success: true, prospect: updated })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params

  // Infopreneur path
  const { data } = await supabase
    .from('prospects')
    .delete()
    .eq('id', id)
    .eq('infopreneur_id', user.id)
    .select('id')
    .single()

  if (data) {
    revalidatePath('/dashboard/equipe', 'layout')
    revalidatePath('/dashboard', 'page')
    return Response.json({ success: true })
  }

  // Team member path
  const admin = createAdminClient()
  const { data: member } = await admin
    .from('team_members')
    .select('infopreneur_id')
    .eq('email', user.email ?? '')
    .single()

  if (!member) return Response.json({ error: 'Non autorisé' }, { status: 403 })

  const { error } = await admin
    .from('prospects')
    .delete()
    .eq('id', id)
    .eq('infopreneur_id', member.infopreneur_id)

  if (error) {
    console.error('[delete-prospect] DELETE error:', error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }

  revalidatePath('/espace-equipe/pipeline', 'page')
  return Response.json({ success: true })
}
