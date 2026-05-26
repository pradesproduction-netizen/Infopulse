'use client'

import { useProspects } from '@/hooks/use-prospects'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Prospect, TeamMember } from '@/lib/types'

interface TeamProspectsKpiProps {
  initialProspects: Prospect[]
  teamMembers: TeamMember[]
  infopreneurId: string
}

export function TeamProspectsKpi({ initialProspects, teamMembers, infopreneurId }: TeamProspectsKpiProps) {
  const prospects = useProspects(infopreneurId, initialProspects)

  const total = prospects.length

  const memberRows = teamMembers
    .filter((m) => m.active)
    .map((member) => ({
      member,
      count: prospects.filter((p) => p.team_member_id === member.id).length,
    }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Pipeline équipe</h2>
        <span className="text-2xl font-bold text-violet-300 ml-1">{total}</span>
        <span className="text-sm font-normal text-muted-foreground">
          prospect{total !== 1 ? 's' : ''} au total
        </span>
      </div>

      {memberRows.length > 0 && (
        <Card className="border-white/10 bg-card/50 overflow-hidden">
          <CardHeader className="pb-0 pt-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Prospects par membre</CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-white/5 bg-white/[0.02]">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Membre</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Prospects</th>
                </tr>
              </thead>
              <tbody>
                {memberRows.map(({ member, count }, idx) => (
                  <tr
                    key={member.id}
                    className={cn(
                      'hover:bg-white/[0.02] transition-colors',
                      idx !== memberRows.length - 1 && 'border-b border-white/5'
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-6 w-6 rounded-full bg-violet-500/20 flex items-center justify-center text-[10px] font-bold text-violet-300 flex-shrink-0">
                          {member.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <span className="font-medium truncate">{member.full_name}</span>
                        <span className="text-xs text-muted-foreground capitalize hidden sm:inline flex-shrink-0">
                          {member.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
