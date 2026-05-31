import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const type = formData.get('type') as string | null

  if (!file || !type || !['setter', 'closer'].includes(type)) {
    return NextResponse.json({ error: 'Fichier ou type invalide' }, { status: 400 })
  }
  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Seuls les fichiers PDF sont acceptés' }, { status: 400 })
  }

  const admin = createAdminClient()
  const storagePath = `${user.id}/sop-${type}.pdf`
  const buffer = await file.arrayBuffer()

  const { error: uploadError } = await admin.storage
    .from('sop-documents')
    .upload(storagePath, buffer, { contentType: 'application/pdf', upsert: true })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { error: dbError } = await admin.from('sop_documents').upsert(
    { infopreneur_id: user.id, type, file_name: file.name, storage_path: storagePath },
    { onConflict: 'infopreneur_id,type' }
  )

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
