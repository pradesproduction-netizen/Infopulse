'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DailyKpiModal } from './daily-kpi-modal'

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTH_LABELS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

interface DailyKpiCalendarProps {
  teamMemberId: string
  role: 'closer' | 'setter'
  initialFilledDates: string[]
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getMonthGrid(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDow = (firstDay.getDay() + 6) % 7 // Mon=0 … Sun=6

  const cells: (Date | null)[] = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)

  const weeks: (Date | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

export function DailyKpiCalendar({ teamMemberId, role, initialFilledDates }: DailyKpiCalendarProps) {
  const [filledDates, setFilledDates] = useState<Set<string>>(new Set(initialFilledDates))
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const now = new Date()
  const todayStr = toDateStr(now)
  const year = now.getFullYear()
  const month = now.getMonth()
  const weeks = getMonthGrid(year, month)

  const handleSaved = useCallback((date: string) => {
    setFilledDates((prev) => new Set([...prev, date]))
    setSelectedDate(null)
  }, [])

  const handleCleared = useCallback((date: string) => {
    setFilledDates((prev) => {
      const next = new Set(prev)
      next.delete(date)
      return next
    })
    setSelectedDate(null)
  }, [])

  return (
    <>
      <Card className="border-white/10 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="h-5 w-5 text-violet-400" />
            KPI du mois — {MONTH_LABELS[month]} {year}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px]">
              <thead>
                <tr>
                  {DAY_LABELS.map((d) => (
                    <th key={d} className="text-center text-xs text-muted-foreground font-medium pb-3 w-[14.28%]">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeks.map((week, wi) => (
                  <tr key={wi}>
                    {week.map((day, di) => {
                      if (!day) return <td key={di} className="p-1" />
                      const dateStr = toDateStr(day)
                      const isFilled = filledDates.has(dateStr)
                      const isToday = dateStr === todayStr
                      const isFuture = dateStr > todayStr

                      return (
                        <td key={di} className="p-1 text-center">
                          <button
                            onClick={() => !isFuture && setSelectedDate(dateStr)}
                            disabled={isFuture}
                            className={cn(
                              'h-9 w-9 rounded-full text-sm font-medium transition-all mx-auto flex items-center justify-center',
                              isFilled && 'bg-green-500/20 text-green-300 hover:bg-green-500/30',
                              !isFilled && !isFuture && 'bg-red-500/20 text-red-300 hover:bg-red-500/30',
                              isFuture && 'text-muted-foreground/30 cursor-not-allowed',
                              isToday && 'ring-2 ring-white/60 ring-offset-1 ring-offset-background',
                            )}
                          >
                            {day.getDate()}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-6 mt-4 pt-3 border-t border-white/10">
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full bg-green-400 inline-block" />
              Rempli
            </span>
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400 inline-block" />
              Manquant
            </span>
          </div>
        </CardContent>
      </Card>

      {selectedDate && (
        <DailyKpiModal
          date={selectedDate}
          teamMemberId={teamMemberId}
          role={role}
          isFilled={filledDates.has(selectedDate)}
          onClose={() => setSelectedDate(null)}
          onSaved={handleSaved}
          onCleared={handleCleared}
        />
      )}
    </>
  )
}
