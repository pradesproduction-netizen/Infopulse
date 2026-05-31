'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TeamMember } from '@/lib/types'

interface DailyKpiRecord {
  team_member_id: string
  role: string
  r1_showup: number | null
  r1_noshow: number | null
  r2_showup: number | null
  r2_noshow: number | null
  signe: number | null
  ca_contracte: number | null
  ca_collecte: number | null
  messages_envoyes: number | null
  reponses_recues: number | null
  followup: number | null
  calls_bookes: number | null
}

interface TeamLeaderboardProps {
  teamMembers: TeamMember[]
  dailyKpis?: DailyKpiRecord[]
}

const MEDALS = ['🥇', '🥈', '🥉']

function MemberAvatar({ name, role }: { name: string; role: string }) {
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  return (
    <div className={cn('h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0',
      role === 'closer' ? 'bg-violet-500' : 'bg-blue-500')}>
      {initials}
    </div>
  )
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn('p-3 text-sm whitespace-nowrap', className)}>{children}</td>
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left p-3 text-xs font-medium text-muted-foreground whitespace-nowrap">{children}</th>
}

export function TeamLeaderboard({ teamMembers, dailyKpis = [] }: TeamLeaderboardProps) {
  const setters = teamMembers.filter((m) => m.role === 'setter')
  const closers = teamMembers.filter((m) => m.role === 'closer')

  const setterRanking = setters
    .map((m) => {
      const kpis = dailyKpis.filter((k) => k.team_member_id === m.id)
      const messages = kpis.reduce((s, k) => s + Number(k.messages_envoyes ?? 0), 0)
      const reponses = kpis.reduce((s, k) => s + Number(k.reponses_recues ?? 0), 0)
      const followup = kpis.reduce((s, k) => s + Number(k.followup ?? 0), 0)
      const callsBookes = kpis.reduce((s, k) => s + Number(k.calls_bookes ?? 0), 0)
      const tauxRep = messages > 0 ? Math.round((reponses / messages) * 100) : 0
      return { member: m, messages, reponses, tauxRep, followup, callsBookes }
    })
    .sort((a, b) => b.callsBookes - a.callsBookes)

  const closerRanking = closers
    .map((m) => {
      const kpis = dailyKpis.filter((k) => k.team_member_id === m.id)
      const showup = kpis.reduce((s, k) => s + Number(k.r1_showup ?? 0) + Number(k.r2_showup ?? 0), 0)
      const noshow = kpis.reduce((s, k) => s + Number(k.r1_noshow ?? 0) + Number(k.r2_noshow ?? 0), 0)
      const signe = kpis.reduce((s, k) => s + Number(k.signe ?? 0), 0)
      const caContracte = kpis.reduce((s, k) => s + Number(k.ca_contracte ?? 0), 0)
      const caCollecte = kpis.reduce((s, k) => s + Number(k.ca_collecte ?? 0), 0)
      const totalCalls = showup + noshow
      const tauxClosing = totalCalls > 0 ? Math.round((signe / totalCalls) * 100) : 0
      return { member: m, showup, noshow, signe, caContracte, caCollecte, tauxClosing }
    })
    .sort((a, b) => b.caContracte - a.caContracte)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Setters */}
      <Card className="border-white/10 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-5 w-5 text-blue-400" />
            Leaderboard Setters
          </CardTitle>
        </CardHeader>
        <CardContent>
          {setters.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Aucun setter dans l&apos;équipe.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <Th>Rang</Th>
                    <Th>Membre</Th>
                    <Th>Messages envoyés</Th>
                    <Th>Taux de réponses</Th>
                    <Th>Follow-up</Th>
                    <Th>Calls bookés</Th>
                  </tr>
                </thead>
                <tbody>
                  {setterRanking.map(({ member, messages, reponses, tauxRep, followup, callsBookes }, i) => (
                    <tr key={member.id} className={cn('border-b border-white/5 last:border-0', i === 0 && 'bg-blue-500/[0.04]')}>
                      <Td>
                        <span className="text-base">{MEDALS[i] ?? `#${i + 1}`}</span>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          <MemberAvatar name={member.full_name} role={member.role} />
                          <span className="font-medium">{member.full_name}</span>
                        </div>
                      </Td>
                      <Td>{messages}</Td>
                      <Td>
                        <span>{tauxRep}%</span>
                        <span className="text-muted-foreground text-xs ml-1">({reponses}/{messages})</span>
                      </Td>
                      <Td>{followup}</Td>
                      <Td className="font-medium">{callsBookes}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Closers */}
      <Card className="border-white/10 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-5 w-5 text-violet-400" />
            Leaderboard Closers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {closers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Aucun closer dans l&apos;équipe.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <Th>Rang</Th>
                    <Th>Membre</Th>
                    <Th>Show-up</Th>
                    <Th>No-show</Th>
                    <Th>Signés</Th>
                    <Th>CA contracté</Th>
                    <Th>CA collecté</Th>
                    <Th>Taux de closing</Th>
                  </tr>
                </thead>
                <tbody>
                  {closerRanking.map(({ member, showup, noshow, signe, caContracte, caCollecte, tauxClosing }, i) => (
                    <tr key={member.id} className={cn('border-b border-white/5 last:border-0', i === 0 && 'bg-violet-500/[0.04]')}>
                      <Td>
                        <span className="text-base">{MEDALS[i] ?? `#${i + 1}`}</span>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          <MemberAvatar name={member.full_name} role={member.role} />
                          <span className="font-medium">{member.full_name}</span>
                        </div>
                      </Td>
                      <Td>{showup}</Td>
                      <Td>{noshow}</Td>
                      <Td>{signe}</Td>
                      <Td className="font-medium">
                        {caContracte > 0 ? `${caContracte.toLocaleString('fr-FR')} €` : '—'}
                      </Td>
                      <Td>
                        {caCollecte > 0 ? `${caCollecte.toLocaleString('fr-FR')} €` : '—'}
                      </Td>
                      <Td>{tauxClosing}%</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
