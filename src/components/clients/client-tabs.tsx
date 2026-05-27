'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LayoutDashboard, CreditCard, FileText, Phone, StickyNote } from 'lucide-react'
import type { Client, CoachingStep, Payment, Contract, Call, ClientProgram, Program } from '@/lib/types'
import { OverviewTab } from './overview-tab'
import { PaymentsTab } from './payments-tab'
import { ContractsTab } from './contracts-tab'
import { SessionsTab } from './sessions-tab'
import { NotesTab } from './notes-tab'

interface ClientTabsProps {
  client: Client
  coachingSteps: CoachingStep[]
  payments: Payment[]
  contracts: Contract[]
  calls: Call[]
  clientPrograms: ClientProgram[]
  availablePrograms: Program[]
}

export function ClientTabs({
  client,
  coachingSteps,
  payments,
  contracts,
  calls,
  clientPrograms,
  availablePrograms,
}: ClientTabsProps) {
  const today = new Date().toISOString().split('T')[0]
  const hasOverdue = payments.some((p) => p.status !== 'paid' && p.payment_date < today)

  return (
    <Tabs defaultValue="overview" className="flex-col">
      <TabsList className="h-auto p-1 flex flex-wrap gap-0.5">
        <TabsTrigger value="overview" className="gap-2 text-xs sm:text-sm">
          <LayoutDashboard className="h-3.5 w-3.5" />
          Vue d&apos;ensemble
        </TabsTrigger>
        <TabsTrigger value="payments" className="gap-2 text-xs sm:text-sm">
          <CreditCard className="h-3.5 w-3.5" />
          Paiements
          {hasOverdue && <span className="h-1.5 w-1.5 rounded-full bg-red-400" />}
        </TabsTrigger>
        <TabsTrigger value="contracts" className="gap-2 text-xs sm:text-sm">
          <FileText className="h-3.5 w-3.5" />
          Contrats
        </TabsTrigger>
        <TabsTrigger value="sessions" className="gap-2 text-xs sm:text-sm">
          <Phone className="h-3.5 w-3.5" />
          Sessions
        </TabsTrigger>
        <TabsTrigger value="notes" className="gap-2 text-xs sm:text-sm">
          <StickyNote className="h-3.5 w-3.5" />
          Notes
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <OverviewTab
          client={client}
          coachingSteps={coachingSteps}
          clientPrograms={clientPrograms}
          availablePrograms={availablePrograms}
        />
      </TabsContent>
      <TabsContent value="payments" className="mt-6">
        <PaymentsTab payments={payments} clientId={client.id} />
      </TabsContent>
      <TabsContent value="contracts" className="mt-6">
        <ContractsTab contracts={contracts} clientId={client.id} />
      </TabsContent>
      <TabsContent value="sessions" className="mt-6">
        <SessionsTab calls={calls} clientId={client.id} />
      </TabsContent>
      <TabsContent value="notes" className="mt-6">
        <NotesTab clientId={client.id} initialNotes={client.notes} />
      </TabsContent>
    </Tabs>
  )
}
