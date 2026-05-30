import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function getMemberAndVerify(user: { id: string; email?: string }, teamMemberId: string) {
  const admin = createAdminClient()
  const { data: member } = await admin
    .from('team_members')
    .select('id, infopreneur_id, email')
    .eq('id', teamMemberId)
    .single()
  if (!member) return null
  if (member.infopreneur_id !== user.id && member.email !== user.email) return null
  return member
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const teamMemberId = searchParams.get('team_member_id')
  const date = searchParams.get('date')
  if (!teamMemberId || !date) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  const member = await getMemberAndVerify(user, teamMemberId)
  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createAdminClient()
  const { data } = await admin
    .from('daily_kpis')
    .select('*')
    .eq('team_member_id', teamMemberId)
    .eq('date', date)
    .maybeSingle()

  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { team_member_id, date, ...fields } = body
  if (!team_member_id || !date) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  const member = await getMemberAndVerify(user, team_member_id)
  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('daily_kpis')
    .upsert(
      { team_member_id, infopreneur_id: member.infopreneur_id, date, ...fields },
      { onConflict: 'team_member_id,date' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const teamMemberId = searchParams.get('team_member_id')
  const date = searchParams.get('date')
  if (!teamMemberId || !date) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  const member = await getMemberAndVerify(user, teamMemberId)
  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createAdminClient()
  const { error } = await admin
    .from('daily_kpis')
    .delete()
    .eq('team_member_id', teamMemberId)
    .eq('date', date)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
