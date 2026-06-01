import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const admin = createAdminClient()

  // Fetch client for authorization and cascade lookup
  const { data: client } = await admin
    .from('clients')
    .select('id, infopreneur_id, full_name, email')
    .eq('id', id)
    .single()

  if (!client) return Response.json({ error: 'Client introuvable' }, { status: 404 })
  // Compare as strings to avoid type coercion issues
  if (String(client.infopreneur_id) !== String(user.id)) {
    console.error('[delete-client] Auth mismatch:', client.infopreneur_id, 'vs', user.id)
    return Response.json({ error: 'Non autorisé' }, { status: 403 })
  }

  // Find matching prospect: signes + same email (primary), fallback to same full_name
  let prospect: { id: string; full_name: string } | null = null

  if (client.email) {
    const { data } = await admin
      .from('prospects')
      .select('id, full_name')
      .eq('infopreneur_id', client.infopreneur_id)
      .eq('pipeline_stage', 'signes')
      .eq('email', client.email)
      .maybeSingle()
    prospect = data
  }

  if (!prospect) {
    const { data } = await admin
      .from('prospects')
      .select('id, full_name')
      .eq('infopreneur_id', client.infopreneur_id)
      .eq('pipeline_stage', 'signes')
      .eq('full_name', client.full_name)
      .maybeSingle()
    prospect = data
  }

  // Cascade-delete prospect if found
  let prospect_deleted = false
  let prospect_name: string | undefined
  if (prospect) {
    await admin.from('prospects').delete().eq('id', prospect.id)
    prospect_deleted = true
    prospect_name = prospect.full_name as string
    revalidatePath('/dashboard/equipe', 'layout')
    revalidatePath('/espace-equipe/pipeline', 'page')
  }

  // Explicitly delete payments so realtime channels (use-payment-alerts, use-upcoming-payments) fire
  await admin.from('payments').delete().eq('client_id', id)

  // Delete the client
  const { error } = await admin.from('clients').delete().eq('id', id)
  if (error) {
    console.error('[delete-client] DELETE error:', error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }

  revalidatePath('/dashboard', 'page')
  revalidatePath('/dashboard/clients', 'page')
  return Response.json({ success: true, prospect_deleted, prospect_name, client_name: client.full_name })
}
