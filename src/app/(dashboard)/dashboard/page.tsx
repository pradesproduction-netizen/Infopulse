import { StatsCards } from '@/components/dashboard/stats-cards'
import { DailyTasks } from '@/components/dashboard/daily-tasks'
import { WeeklyRecap } from '@/components/dashboard/weekly-recap'
import { AIChatBubble } from '@/components/dashboard/ai-chat-bubble'

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <StatsCards />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyTasks />
        <WeeklyRecap />
      </div>
      <AIChatBubble />
    </div>
  )
}