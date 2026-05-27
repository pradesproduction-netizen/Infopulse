import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { maybeCreateClient, type ClientCreationResult } from '@/lib/auto-create-client'

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

  const admin = createAdminClient()
  const becomingGagne = updates.pipeline_stage === 'Gagné'

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

    let clientResult: ClientCreationResult = { client_created: false }
    if (becomingGagne) {
      clientResult = await maybeCreateClient(data as Parameters<typeof maybeCreateClient>[0], admin)
      if (clientResult.client_created) revalidatePath('/dashboard/clients', 'page')
    }

    return Response.json({ success: true, prospect: data, ...clientResult })
  }

  // Team member path — look up infopreneur_id via admin client
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

  let clientResult: ClientCreationResult = { client_created: false }
  if (becomingGagne) {
    clientResult = await maybeCreateClient(updated as Parameters<typeof maybeCreateClient>[0], admin)
    if (clientResult.client_created) revalidatePath('/dashboard/clients', 'page')
  }

  revalidatePath('/espace-equipe/pipeline', 'page')
  return Response.json({ success: true, prospect: updated, ...clientResult })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const admin = createAdminClient()

  // Look up the prospect's owner + stage/email for client cascade
  const { data: prospect } = await admin
    .from('prospects')
    .select('infopreneur_id, email, full_name, pipeline_stage')
    .eq('id', id)
    .single()

  if (!prospect) return Response.json({ error: 'Prospect introuvable' }, { status: 404 })

  // Authorize: user is the infopreneur owner
  const isOwner = prospect.infopreneur_id === user.id

  // Or user is a team member of that infopreneur
  if (!isOwner) {
    const { data: member } = await admin
      .from('team_members')
      .select('id')
      .eq('email', user.email ?? '')
      .eq('infopreneur_id', prospect.infopreneur_id)
      .single()

    if (!member) return Response.json({ error: 'Non autorisé' }, { status: 403 })
  }

  // If prospect was 'Gagné' and has an email, cascade-delete the matching client
  let client_deleted = false
  let client_name: string | undefined
  if (prospect.pipeline_stage === 'Gagné' && prospect.email) {
    const { data: existingClient } = await admin
      .from('clients')
      .select('id, full_name')
      .eq('infopreneur_id', prospect.infopreneur_id)
      .eq('email', prospect.email)
      .maybeSingle()

    if (existingClient) {
      await admin.from('clients').delete().eq('id', existingClient.id)
      client_deleted = true
      client_name = existingClient.full_name as string
      revalidatePath('/dashboard/clients', 'page')
    }
  }

  // Delete the prospect
  const { error } = await admin
    .from('prospects')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[delete-prospect] DELETE error:', error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }

  revalidatePath('/dashboard/equipe', 'layout')
  revalidatePath('/dashboard', 'page')
  revalidatePath('/espace-equipe/pipeline', 'page')
  return Response.json({ success: true, client_deleted, client_name })
}
