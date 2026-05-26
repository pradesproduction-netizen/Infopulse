import { createClient } from '@/lib/supabase/server'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

interface ChatContext {
  overdueClients: string[]
  onboardingClients: string[]
  followUpProspects: string[]
  teamCount: number
  pendingContracts: string[]
  todayCallClients: string[]
}

function buildResponse(userMessage: string, ctx: ChatContext): string {
  const msg = userMessage.toLowerCase()

  if (msg.includes('priorité') || msg.includes('priorites') || msg.includes("aujourd'hui") || msg.includes('aujourd hui') || msg.includes('tâche') || msg.includes('tache')) {
    const parts: string[] = []
    if (ctx.overdueClients.length > 0) parts.push(`① Relancer ${ctx.overdueClients[0]} pour paiement en retard`)
    if (ctx.todayCallClients.length > 0) parts.push(`② Préparer l'appel avec ${ctx.todayCallClients[0]}`)
    if (ctx.onboardingClients.length > 0) parts.push(`③ Vérifier l'avancement de ${ctx.onboardingClients[0]}`)
    if (parts.length === 0) parts.push('① Mettre à jour ton pipeline prospects', '② Préparer tes appels de la semaine', '③ Analyser tes performances du mois')
    return `Tes priorités du jour :\n${parts.join('\n')}\n\nCommence par ce qui génère du cash en premier.`
  }

  if (msg.includes('paiement') || msg.includes('retard') || msg.includes('relance') || msg.includes('facture')) {
    if (ctx.overdueClients.length > 0) {
      const names = ctx.overdueClients.slice(0, 3).join(', ')
      return `Clients avec paiement en retard : ${names}.\n\nUn message direct avec le montant exact + une date limite convertit 7 relances sur 10. Exemple : \"Bonjour [Prénom], ton versement était prévu le [date]. Tu peux régler ici : [lien]. Besoin d'un étalement ?\" Court, factuel, sans agressivité.`
    }
    return "Aucun paiement en retard détecté — belle gestion de ta tréso ! Pour éviter les retards, configure des rappels automatiques 3 jours avant l'échéance."
  }

  if (msg.includes('client') || msg.includes('portefeuille') || msg.includes('onboarding')) {
    if (ctx.onboardingClients.length > 0) {
      const names = ctx.onboardingClients.slice(0, 3).join(', ')
      return `Clients en onboarding actuellement : ${names}.\n\nCheck-in hebdomadaire obligatoire pour ces clients — un client qui progresse visiblement est un client qui renouvelle et qui te recommande. As-tu des étapes de progression définies pour chacun ?`
    }
    return "Pour maximiser la valeur client : check-in hebdomadaire pour les clients en onboarding, revue mensuelle pour les actifs. As-tu des étapes de progression définies ?"
  }

  if (msg.includes('équipe') || msg.includes('equipe') || msg.includes('closer') || msg.includes('setter') || msg.includes('commercial')) {
    const teamInfo = ctx.teamCount > 0 ? `Ton équipe compte ${ctx.teamCount} membre${ctx.teamCount > 1 ? 's' : ''}.` : ''
    return `${teamInfo}${teamInfo ? ' ' : ''}Pour booster ton équipe : débriefe chaque appel perdu (pas pour punir, pour apprendre). Les meilleurs closers ont 3 choses en commun : ils qualifient vite, ils écoutent plus qu'ils ne parlent, et ils font un suivi systématique.`
  }

  if (msg.includes('objectif') || msg.includes('ca') || msg.includes('chiffre') || msg.includes('kpi') || msg.includes('performance') || msg.includes('résultat') || msg.includes('resultat')) {
    return "Pour tes KPI : concentre-toi sur le taux de closing en priorité — c'est le levier le plus actionnable à court terme. Si ton show-up rate baisse, c'est un signal de qualification à revoir. Ton CA découle de ces deux métriques. Tu veux qu'on analyse une de ces métriques en particulier ?"
  }

  if (msg.includes('prospect') || msg.includes('pipeline') || msg.includes('lead') || msg.includes('rdv') || msg.includes('rendez-vous')) {
    if (ctx.followUpProspects.length > 0) {
      const names = ctx.followUpProspects.slice(0, 3).join(', ')
      return `Prospects en attente de follow-up : ${names}.\n\nUn pipeline sain, c'est 3× ton objectif CA en valeur estimée. Ces prospects sont tes relances prioritaires aujourd'hui.`
    }
    return "Un pipeline sain, c'est 3× ton objectif CA en valeur estimée. Vérifie quels prospects sont au stade \"proposition envoyée\" depuis plus de 5 jours — ce sont tes relances prioritaires."
  }

  if (msg.includes('contrat') || msg.includes('signer') || msg.includes('document')) {
    if (ctx.pendingContracts.length > 0) {
      const names = ctx.pendingContracts.slice(0, 3).join(', ')
      return `Contrats en attente de signature : ${names}.\n\nRègle 48h : si un contrat envoyé n'est pas signé en 48h, relance par appel (pas message). Les taux de signature par téléphone sont 3× supérieurs.`
    }
    return "Aucun contrat en attente — bien. Pour les prochains : envoie toujours avec une date d'expiration (72h max) pour créer l'urgence."
  }

  if (msg.includes('bonjour') || msg.includes('salut') || msg.includes('hello') || msg.includes('allo')) {
    return "Bonjour ! Prêt à booster ta journée. Que veux-tu analyser : tes clients, ton équipe, tes paiements en retard, ou tes objectifs du mois ?"
  }

  return "Bonne question. Commence ta journée par les 3 tâches qui ont le plus d'impact sur ton CA — relances paiements, appels planifiés, et suivi des clients en onboarding."
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { userMessage } = await request.json()

  const ctx: ChatContext = {
    overdueClients: [],
    onboardingClients: [],
    followUpProspects: [],
    teamCount: 0,
    pendingContracts: [],
    todayCallClients: [],
  }

  if (user) {
    const today = new Date().toISOString().split('T')[0]

    const [
      { data: clients },
      { data: prospects },
      { data: teamMembers },
    ] = await Promise.all([
      supabase.from('clients').select('id, full_name, status').eq('infopreneur_id', user.id),
      supabase.from('prospects').select('full_name, pipeline_stage').eq('infopreneur_id', user.id).eq('pipeline_stage', 'Follow-up'),
      supabase.from('team_members').select('id').eq('infopreneur_id', user.id).eq('is_active', true),
    ])

    const clientIds = (clients ?? []).map((c) => c.id)

    ctx.onboardingClients = (clients ?? []).filter((c) => c.status === 'onboarding').map((c) => c.full_name)
    ctx.followUpProspects = (prospects ?? []).map((p) => p.full_name)
    ctx.teamCount = (teamMembers ?? []).length

    if (clientIds.length > 0) {
      const [
        { data: overduePayments },
        { data: pendingContracts },
        { data: todayCalls },
      ] = await Promise.all([
        supabase.from('payments').select('client_id').eq('status', 'overdue').in('client_id', clientIds),
        supabase.from('contracts').select('client_id').eq('status', 'sent').in('client_id', clientIds),
        supabase.from('calls').select('client_id').eq('status', 'scheduled').in('client_id', clientIds)
          .gte('date', `${today}T00:00:00.000Z`).lte('date', `${today}T23:59:59.999Z`),
      ])

      const clientMap = Object.fromEntries((clients ?? []).map((c) => [c.id, c.full_name]))
      ctx.overdueClients = [...new Set((overduePayments ?? []).map((p) => clientMap[p.client_id]).filter(Boolean))]
      ctx.pendingContracts = [...new Set((pendingContracts ?? []).map((c) => clientMap[c.client_id]).filter(Boolean))]
      ctx.todayCallClients = [...new Set((todayCalls ?? []).map((c) => clientMap[c.client_id]).filter(Boolean))]
    }
  }

  await delay(600)

  return Response.json({ response: buildResponse(userMessage ?? '', ctx) })
}
