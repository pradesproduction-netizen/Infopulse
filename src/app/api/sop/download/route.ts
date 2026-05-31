import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  if (!type || !['setter', 'closer'].includes(type)) {
    return NextResponse.json({ error: 'Type invalide' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Determine infopreneur_id: team_member → use their coach, otherwise the user is the infopreneur
  let infopreneurId = user.id
  const { data: teamMember } = await admin
    .from('team_members')
    .select('infopreneur_id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (teamMember) infopreneurId = teamMember.infopreneur_id

  const { data: sop } = await admin
    .from('sop_documents')
    .select('storage_path')
    .eq('infopreneur_id', infopreneurId)
    .eq('type', type)
    .maybeSingle()

  if (!sop) return NextResponse.json({ error: 'Document introuvable' }, { status: 404 })

  const { data: signedData, error: signError } = await admin.storage
    .from('sop-documents')
    .createSignedUrl(sop.storage_path, 3600)

  if (signError || !signedData) {
    return NextResponse.json({ error: 'Impossible de générer le lien' }, { status: 500 })
  }

  return NextResponse.json({ url: signedData.signedUrl })
}
