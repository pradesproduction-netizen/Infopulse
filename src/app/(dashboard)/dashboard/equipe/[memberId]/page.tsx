import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MemberProfileHeader } from '@/components/equipe/member-profile-header'
import { MemberKpiCards } from '@/components/equipe/member-kpi-cards'
import { MemberPipeline } from '@/components/equipe/member-pipeline'
import { MemberCallsList } from '@/components/equipe/member-calls-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart2 } from 'lucide-react'

interface PageProps {
  params: Promise<{ memberId: string }>
}

function PerformanceChart({ calls }: { calls: { call_date: string; status: string }[] }) {
  const now = new Date()
  const weeks = Array.from({ length: 4 }, (_, i) => {
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - (3 - i) * 7 - now.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    const count = calls.filter((c) => {
      const d = new Date(c.call_date)
      return d >= weekStart && d <= weekEnd
    }).length
    const completed = calls.filter((c) => {
      const d = new Date(c.call_date)
      return d >= weekStart && d <= weekEnd && c.status === 'completed'
    }).length
    return { label: `S${i + 1}`, count, completed }
  })

  const max = Math.max(...weeks.map((w) => w.count), 1)

  return (
    <Card className="border-white/10 bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-muted-foreground" />
          Performance sur 4 semaines
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-4 h-36">
          {weeks.map((week) => (
            <div key={week.label} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col items-center justify-end gap-0.5" style={{ height: '100px' }}>
                <div className="relative w-full flex flex-col justify-end" style={{ height: '100px' }}>
                  <div
                    className="w-full rounded-t-md bg-violet-500/30 relative"
                    style={{ height: `${(week.count / max) * 100}%`, minHeight: week.count > 0 ? '4px' : '0' }}
                  >
                    <div
                      className="absolute bottom-0 left-0 right-0 rounded-t-md bg-violet-500"
                      style={{ height: week.count > 0 ? `${(week.completed / week.count) * 100}%` : '0' }}
                    />
                  </div>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{week.label}</span>
              <span className="text-xs font-semibold">{week.count}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-violet-500 inline-block" />Complétés</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-violet-500/30 inline-block" />Total</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function MemberProfilePage({ params }: PageProps) {
  const { memberId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: member }, { data: calls }, { data: prospects }] = await Promise.all([
    supabase.from('team_members').select('*').eq('id', memberId).eq('infopreneur_id', user.id).single(),
    supabase.from('calls').select('*').eq('team_member_id', memberId).eq('infopreneur_id', user.id).order('call_date', { ascending: false }),
    supabase.from('prospects').select('*').eq('infopreneur_id', user.id).eq('team_member_id', memberId),
  ])

  if (!member) notFound()

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <MemberProfileHeader member={member} />
      <MemberKpiCards initialProspects={prospects ?? []} teamMemberId={memberId} />
      <PerformanceChart calls={(calls ?? []).map((c) => ({ call_date: c.call_date, status: c.status }))} />
      <MemberPipeline prospects={prospects ?? []} memberId={memberId} />
      <MemberCallsList calls={calls ?? []} />
    </div>
  )
}
