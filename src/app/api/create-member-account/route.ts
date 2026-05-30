import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const TEMP_PASSWORD = 'Infopulse2024!'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, memberId, name } = await req.json()
  if (!email || !memberId) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  const admin = createAdminClient() // uses SUPABASE_SERVICE_ROLE_KEY

  // Verify this member belongs to the authenticated infopreneur
  const { data: member } = await admin
    .from('team_members')
    .select('id, infopreneur_id')
    .eq('id', memberId)
    .single()

  if (!member || member.infopreneur_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let authUserId: string | null = null

  // Step 1: create auth user (without user_metadata — causes DB error on this project)
  const { data: createData, error: createError } = await admin.auth.admin.createUser({
    email,
    password: TEMP_PASSWORD,
    email_confirm: true,
  })

  if (createError) {
    // User already exists — find them by email
    const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 })
    const existing = users.find((u) => u.email === email)
    if (existing) {
      authUserId = existing.id
    } else {
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }
  } else {
    authUserId = createData.user.id
  }

  // Step 2: force email confirmed + set user_metadata via updateUserById
  await admin.auth.admin.updateUserById(authUserId, {
    email_confirm: true,
    user_metadata: { full_name: name ?? '', role: 'team_member' },
  })

  // Step 3: link user_id to the team_members record
  await admin.from('team_members').update({ user_id: authUserId }).eq('id', memberId)

  return NextResponse.json({ success: true, userId: authUserId, tempPassword: TEMP_PASSWORD })
}
