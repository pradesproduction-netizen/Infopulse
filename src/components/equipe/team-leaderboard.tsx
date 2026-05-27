'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TeamMember, Call } from '@/lib/types'

interface TeamLeaderboardProps {
  teamMembers: TeamMember[]
  calls: Call[]
}

const MEDALS = ['🥇', '🥈', '🥉']
const MEDAL_CLASSES = ['text-yellow-400', 'text-gray-300', 'text-amber-600']

function isThisMonth(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

function MemberAvatar({ name, role }: { name: string; role: string }) {
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  return (
    <div className={cn('h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0',
      role === 'closer' ? 'bg-violet-500' : 'bg-blue-500')}>
      {initials}
    </div>
  )
}

export function TeamLeaderboard({ teamMembers, calls }: TeamLeaderboardProps) {
  const thisMonthCalls = calls.filter((c) => isThisMonth(c.call_date))

  const setters = teamMembers.filter((m) => m.role === 'setter')
  const closers = teamMembers.filter((m) => m.role === 'closer')

  const setterRanking = setters
    .map((m) => ({
      member: m,
      messages: m.messages_sent ?? 0,
      followUps: m.follow_ups ?? 0,
      callsBooked: m.calls_booked ?? 0,
    }))
    .sort((a, b) => b.callsBooked - a.callsBooked || b.messages - a.messages)

  const closerRanking = closers
    .map((m) => {
      const mc = thisMonthCalls.filter((c) => c.team_member_id === m.id)
      const completed = mc.filter((c) => c.status === 'completed').length
      const noShow = mc.filter((c) => c.status === 'no_show').length
      const showUpRate = completed + noShow > 0 ? Math.round((completed / (completed + noShow)) * 100) : 0
      return { member: m, total: mc.length, showUpRate, signed: m.signed_clients ?? 0 }
    })
    .sort((a, b) => b.signed - a.signed || b.showUpRate - a.showUpRate)

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
                    {['Rang', 'Membre', 'Messages', 'Follow-ups', 'Calls bookés', 'Badge'].map((col) => (
                      <th key={col} className="text-left p-3 text-xs font-medium text-muted-foreground whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {setterRanking.map(({ member, messages, followUps, callsBooked }, i) => (
                    <tr key={member.id} className={cn('border-b border-white/5 last:border-0', i === 0 && callsBooked > 0 && 'bg-blue-500/[0.04]')}>
                      <td className="p-3">
                        <span className={cn('text-base', MEDAL_CLASSES[i] ?? 'text-muted-foreground')}>
                          {MEDALS[i] ?? `#${i + 1}`}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <MemberAvatar name={member.full_name} role={member.role} />
                          <span className="text-sm font-medium whitespace-nowrap">{member.full_name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm">{messages}</td>
                      <td className="p-3 text-sm">{followUps}</td>
                      <td className="p-3 text-sm">{callsBooked}</td>
                      <td className="p-3">
                        {i === 0 && callsBooked > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 whitespace-nowrap">
                            🏆 Top setter
                          </span>
                        )}
                      </td>
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
                    {['Rang', 'Membre', 'Appels', 'Show-up', 'Signés', 'Badge'].map((col) => (
                      <th key={col} className="text-left p-3 text-xs font-medium text-muted-foreground whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {closerRanking.map(({ member, total, showUpRate, signed }, i) => (
                    <tr key={member.id} className={cn('border-b border-white/5 last:border-0', i === 0 && signed > 0 && 'bg-yellow-500/[0.04]')}>
                      <td className="p-3">
                        <span className={cn('text-base', MEDAL_CLASSES[i] ?? 'text-muted-foreground')}>
                          {MEDALS[i] ?? `#${i + 1}`}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <MemberAvatar name={member.full_name} role={member.role} />
                          <span className="text-sm font-medium whitespace-nowrap">{member.full_name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm">{total}</td>
                      <td className="p-3 text-sm">{showUpRate}%</td>
                      <td className="p-3 text-sm">{signed}</td>
                      <td className="p-3">
                        {i === 0 && signed > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 whitespace-nowrap">
                            🏆 Top closer
                          </span>
                        )}
                      </td>
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
