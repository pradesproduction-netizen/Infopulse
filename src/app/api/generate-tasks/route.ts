import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Non autorisé' }, { status: 401 })

  const { infopreneur_id } = await request.json()
  if (infopreneur_id !== user.id) {
    return Response.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const today = new Date().toISOString().split('T')[0]

  // Fetch clients owned by this user
  const { data: clients } = await supabase
    .from('clients')
    .select('id, full_name, status')
    .eq('infopreneur_id', user.id)

  const clientIds = (clients ?? []).map((c) => c.id)

  // Fetch related data
  const [
    { data: overduePayments },
    { data: todayCalls },
    { data: pendingContracts },
    { data: followUpProspects },
  ] = await Promise.all([
    clientIds.length > 0
      ? supabase.from('payments').select('client_id').eq('status', 'overdue').in('client_id', clientIds)
      : Promise.resolve({ data: [] }),

    clientIds.length > 0
      ? supabase
          .from('calls')
          .select('id, date, client_id')
          .eq('status', 'scheduled')
          .in('client_id', clientIds)
          .gte('date', `${today}T00:00:00.000Z`)
          .lte('date', `${today}T23:59:59.999Z`)
      : Promise.resolve({ data: [] }),

    clientIds.length > 0
      ? supabase.from('contracts').select('id, client_id').eq('status', 'sent').in('client_id', clientIds)
      : Promise.resolve({ data: [] }),

    supabase
      .from('prospects')
      .select('id, full_name')
      .eq('infopreneur_id', user.id)
      .eq('pipeline_stage', 'follow_up'),
  ])

  const clientById = Object.fromEntries((clients ?? []).map((c) => [c.id, c]))

  // Real column names from daily_tasks schema:
  // id, infopreneur_id, task_type, description, related_client_id,
  // related_prospect_id, is_completed, priority, generated_at, completed_at
  type TaskRow = {
    infopreneur_id: string
    task_type: string
    description: string
    priority: string
    related_client_id: string | null
    is_completed: boolean
  }

  const tasks: TaskRow[] = []

  // Overdue payments → high
  for (const p of (overduePayments ?? []).slice(0, 2)) {
    const name = clientById[p.client_id]?.full_name ?? 'un client'
    tasks.push({
      infopreneur_id: user.id,
      task_type: 'reminder',
      description: `Relancer ${name} pour paiement en retard`,
      priority: 'high',
      related_client_id: p.client_id,
      is_completed: false,
    })
  }

  // Calls today → high
  for (const c of (todayCalls ?? []).slice(0, 2)) {
    const name = clientById[c.client_id]?.full_name ?? 'un client'
    const time = new Date(c.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    tasks.push({
      infopreneur_id: user.id,
      task_type: 'call',
      description: `Appel avec ${name} à ${time}`,
      priority: 'high',
      related_client_id: c.client_id,
      is_completed: false,
    })
  }

  // Pending contracts → medium
  for (const c of (pendingContracts ?? []).slice(0, 1)) {
    const name = clientById[c.client_id]?.full_name ?? 'un client'
    tasks.push({
      infopreneur_id: user.id,
      task_type: 'contract',
      description: `Relancer ${name} pour signer le contrat`,
      priority: 'medium',
      related_client_id: c.client_id,
      is_completed: false,
    })
  }

  // Onboarding clients → normal
  for (const c of (clients ?? []).filter((c) => c.status === 'onboarding').slice(0, 2)) {
    tasks.push({
      infopreneur_id: user.id,
      task_type: 'review',
      description: `Vérifier l'avancement de ${c.full_name}`,
      priority: 'normal',
      related_client_id: c.id,
      is_completed: false,
    })
  }

  // Follow-up prospects → normal
  if ((followUpProspects ?? []).length > 0) {
    tasks.push({
      infopreneur_id: user.id,
      task_type: 'followup',
      description: `Follow-up : ${followUpProspects![0].full_name}`,
      priority: 'normal',
      related_client_id: null,
      is_completed: false,
    })
  }

  // Generic tasks to reach minimum 5
  const generics: TaskRow[] = [
    { infopreneur_id: user.id, task_type: 'call', description: 'Préparer les appels de la semaine', priority: 'normal', related_client_id: null, is_completed: false },
    { infopreneur_id: user.id, task_type: 'followup', description: 'Mettre à jour le pipeline prospects', priority: 'normal', related_client_id: null, is_completed: false },
    { infopreneur_id: user.id, task_type: 'review', description: "Analyser les performances de l'équipe", priority: 'normal', related_client_id: null, is_completed: false },
  ]
  for (const g of generics) {
    if (tasks.length >= 5) break
    tasks.push(g)
  }

  // Delete today's existing tasks (generated_at is a timestamptz defaulting to now())
  await supabase
    .from('daily_tasks')
    .delete()
    .eq('infopreneur_id', user.id)
    .gte('generated_at', `${today}T00:00:00.000Z`)
    .lte('generated_at', `${today}T23:59:59.999Z`)

  const { data: inserted, error } = await supabase
    .from('daily_tasks')
    .insert(tasks)
    .select()

  if (error) {
    console.error('[generate-tasks] INSERT error:', error.message, '| code:', error.code)
    return Response.json({
      tasks: tasks.map((t, i) => ({ ...t, id: `temp-${i}` })),
      persisted: false,
      dbError: error.message,
    })
  }

  revalidatePath('/dashboard')

  return Response.json({ tasks: inserted ?? [], persisted: true })
}
