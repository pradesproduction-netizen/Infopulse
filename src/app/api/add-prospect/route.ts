import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { maybeCreateClient } from '@/lib/auto-create-client'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Non autorisé' }, { status: 401 })

  const { full_name, email, phone, source, estimated_value, pipeline_stage, instagram_url, linkedin_url, team_member_id } = await request.json()

  if (!full_name?.trim() || !pipeline_stage) {
    return Response.json({ error: 'Données manquantes' }, { status: 400 })
  }

  const row = {
    infopreneur_id: user.id,
    full_name: full_name.trim(),
    email: email?.trim() || null,
    phone: phone?.trim() || null,
    source: source || null,
    estimated_value: estimated_value ? Number(estimated_value) : null,
    pipeline_stage,
    instagram_url: instagram_url?.trim() || null,
    linkedin_url: linkedin_url?.trim() || null,
    team_member_id: team_member_id || null,
  }

  const { data: inserted, error } = await supabase.from('prospects').insert(row).select('id').single()

  if (error) {
    console.error('[add-prospect] INSERT error:', error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }

  revalidatePath('/dashboard/equipe', 'layout')
  revalidatePath('/dashboard', 'page')

  // Auto-create client when prospect is directly added to 'Gagné'
  if (pipeline_stage === 'Gagné') {
    const admin = createAdminClient()
    const clientResult = await maybeCreateClient(
      {
        full_name: row.full_name,
        email: row.email,
        phone: row.phone,
        estimated_value: row.estimated_value,
        infopreneur_id: user.id,
        prospectId: inserted?.id ?? null,
      },
      admin
    )
    return Response.json({ success: true, ...clientResult })
  }

  return Response.json({ success: true, client_created: false })
}
