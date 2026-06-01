import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { maybeCreateClient } from '@/lib/auto-create-client'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Non autorisé' }, { status: 401 })

  const admin = createAdminClient()

  // If the caller is a team member, use their infopreneur_id (not their own auth id)
  const { data: memberRows } = await admin
    .from('team_members')
    .select('infopreneur_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)

  let infopreneurId: string
  if (memberRows && memberRows.length > 0) {
    // Caller is a team member — must have a valid infopreneur_id
    const resolved = memberRows[0]?.infopreneur_id
    if (!resolved) {
      return Response.json({ error: 'Compte membre non lié à un infopreneur. Contactez votre administrateur.' }, { status: 400 })
    }
    infopreneurId = resolved
  } else {
    // Caller is an infopreneur
    infopreneurId = user.id
  }

  const { full_name, email, phone, source, estimated_value, pipeline_stage, instagram_url, linkedin_url, team_member_id, assigned_closer_id, rdv_r1_date, rdv_r2_date, tally_link } = await request.json()

  if (!full_name?.trim() || !pipeline_stage) {
    return Response.json({ error: 'Données manquantes' }, { status: 400 })
  }

  const row = {
    infopreneur_id: infopreneurId,
    full_name: full_name.trim(),
    email: email?.trim() || null,
    phone: phone?.trim() || null,
    source: source || null,
    estimated_value: estimated_value ? Number(estimated_value) : null,
    pipeline_stage,
    instagram_url: instagram_url?.trim() || null,
    linkedin_url: linkedin_url?.trim() || null,
    team_member_id: team_member_id || null,
    assigned_closer_id: assigned_closer_id || null,
    rdv_r1_date: rdv_r1_date || null,
    rdv_r2_date: rdv_r2_date || null,
    tally_link: tally_link || null,
  }

  // Use admin client so team members can insert under their infopreneur's account
  const { data: inserted, error } = await admin.from('prospects').insert(row).select('id').single()

  if (error) {
    console.error('[add-prospect] INSERT error:', error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }

  revalidatePath('/dashboard/equipe', 'layout')
  revalidatePath('/dashboard', 'page')
  revalidatePath('/espace-equipe', 'layout')
  revalidatePath('/espace-equipe/pipeline', 'page')

  // Auto-create client when prospect is directly added to 'signes'
  if (pipeline_stage === 'signes') {
    const clientResult = await maybeCreateClient(
      {
        full_name: row.full_name,
        email: row.email,
        phone: row.phone,
        estimated_value: row.estimated_value,
        infopreneur_id: infopreneurId,
        prospectId: inserted?.id ?? null,
      },
      admin
    )
    return Response.json({ success: true, ...clientResult })
  }

  return Response.json({ success: true, client_created: false })
}
