import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export interface ClientCreationResult {
  client_created: boolean
  client_id?: string
  client_name?: string
}

export async function maybeCreateClient(
  prospect: {
    full_name: string | null | undefined
    email: string | null | undefined
    phone: string | null | undefined
    estimated_value: number | null | undefined
    infopreneur_id: string
    prospectId?: string | null
  },
  admin: ReturnType<typeof createAdminClient>
): Promise<ClientCreationResult> {
  const fullName = prospect.full_name?.trim()
  if (!fullName) return { client_created: false }
  // email is required for dedup — skip silently if absent
  if (!prospect.email) return { client_created: false }

  const { data: existing } = await admin
    .from('clients')
    .select('id')
    .eq('infopreneur_id', prospect.infopreneur_id)
    .eq('email', prospect.email)
    .maybeSingle()

  if (existing) return { client_created: false }

  const today = new Date().toISOString().split('T')[0]
  const { data: newClient } = await admin
    .from('clients')
    .insert({
      infopreneur_id: prospect.infopreneur_id,
      full_name: fullName,
      email: prospect.email,
      phone: prospect.phone ?? null,
      status: 'onboarding',
      total_amount: prospect.estimated_value ?? null,
      start_date: today,
    })
    .select('id')
    .single()

  if (!newClient) return { client_created: false }

  // Link the prospect to the newly created client
  if (prospect.prospectId) {
    await admin.from('prospects').update({ client_id: newClient.id as string }).eq('id', prospect.prospectId)
  }

  // Auto-create first payment if estimated_value is set
  if (prospect.estimated_value != null && prospect.estimated_value > 0) {
    await admin.from('payments').insert({
      client_id: newClient.id as string,
      amount: prospect.estimated_value,
      payment_date: today,
      status: 'paid',
      paid_at: null,
    })
  }

  revalidatePath('/dashboard/clients', 'page')
  return {
    client_created: true,
    client_id: newClient.id as string,
    client_name: fullName,
  }
}
