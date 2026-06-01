import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Non autorisé' }, { status: 401 })

  const { notification_ids } = await request.json()
  if (!Array.isArray(notification_ids) || notification_ids.length === 0) {
    return Response.json({ success: true })
  }

  const admin = createAdminClient()

  // Find this user's team_member id for authorization
  let { data: member } = await admin
    .from('team_members')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!member) {
    const { data: byEmail } = await admin
      .from('team_members')
      .select('id')
      .eq('email', user.email ?? '')
      .maybeSingle()
    member = byEmail
  }

  if (!member) return Response.json({ error: 'Non autorisé' }, { status: 403 })

  await admin
    .from('notifications')
    .update({ read: true })
    .eq('team_member_id', member.id)
    .in('id', notification_ids)

  return Response.json({ success: true })
}
