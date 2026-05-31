import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { type } = await req.json()
  if (!type || !['setter', 'closer'].includes(type)) {
    return NextResponse.json({ error: 'Type invalide' }, { status: 400 })
  }

  const admin = createAdminClient()
  const storagePath = `${user.id}/sop-${type}.pdf`

  const { error: storageError } = await admin.storage
    .from('sop-documents')
    .remove([storagePath])

  if (storageError) return NextResponse.json({ error: storageError.message }, { status: 500 })

  const { error: dbError } = await admin
    .from('sop_documents')
    .delete()
    .eq('infopreneur_id', user.id)
    .eq('type', type)

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
