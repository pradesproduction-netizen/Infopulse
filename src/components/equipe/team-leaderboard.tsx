'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

export function TeamLeaderboard({ teamMembers, calls }: TeamLeaderboardProps) {
  const thisMonthCalls = calls.filter((c) => isThisMonth(c.date))

  const ranking = teamMembers
    .map((member) => {
      const mc = thisMonthCalls.filter((c) => c.team_member_id === member.id)
      const completed = mc.filter((c) => c.status === 'completed').length
      const closed = mc.filter((c) => c.is_closed).length
      const ca = mc.reduce((sum, c) => sum + (c.amount_closed ?? 0), 0)
      const closingRate = completed > 0 ? Math.round((closed / completed) * 100) : 0
      return { member, total: mc.length, closingRate, ca }
    })
    .sort((a, b) => b.ca - a.ca || b.closingRate - a.closingRate || b.total - a.total)

  return (
    <Card className="border-white/10 bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          Leaderboard du mois
        </CardTitle>
      </CardHeader>
      <CardContent>
        {teamMembers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Aucun membre dans l&apos;équipe pour l&apos;instant. Ajoute ton premier closer ou setter.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {['Rang', 'Membre', 'Rôle', 'Appels', 'Closing', 'CA', 'Badge'].map((col) => (
                    <th key={col} className="text-left p-3 text-xs font-medium text-muted-foreground">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ranking.map(({ member, total, closingRate, ca }, i) => {
                  const initials = member.full_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)

                  return (
                    <tr
                      key={member.id}
                      className={cn(
                        'border-b border-white/5 last:border-0 transition-colors',
                        i === 0 && 'bg-yellow-500/[0.04]'
                      )}
                    >
                      <td className="p-3">
                        <span className={cn('text-base', MEDAL_CLASSES[i] ?? 'text-muted-foreground')}>
                          {MEDALS[i] ?? `#${i + 1}`}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              'h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0',
                              member.role === 'closer' ? 'bg-violet-500' : 'bg-blue-500'
                            )}
                          >
                            {initials}
                          </div>
                          <span className="text-sm font-medium whitespace-nowrap">{member.full_name}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs',
                            member.role === 'closer'
                              ? 'bg-violet-500/10 text-violet-300 border-violet-500/30'
                              : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                          )}
                        >
                          {member.role === 'closer' ? 'Closer' : 'Setter'}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">{total}</td>
                      <td className="p-3 text-sm">{closingRate}%</td>
                      <td className="p-3 text-sm font-medium">
                        {ca > 0 ? `${ca.toLocaleString('fr-FR')} €` : '—'}
                      </td>
                      <td className="p-3">
                        {i === 0 && total > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 whitespace-nowrap">
                            🏆 Top performer
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
