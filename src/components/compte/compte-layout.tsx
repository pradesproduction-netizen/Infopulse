'use client'

import { useState } from 'react'
import { User, CreditCard, Target, Plug, Shield, BookOpen, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ElementType } from 'react'
import { ProfileSection } from './profile-section'
import { SubscriptionSection } from './subscription-section'
import { ObjectivesSection } from './objectives-section'
import { ProgramsSection } from './programs-section'
import { IntegrationsSection } from './integrations-section'
import { ResourcesSection } from './resources-section'
import { SecuritySection } from './security-section'
import type { Profile, Objective, Program } from '@/lib/types'

type Tab = 'profil' | 'abonnement' | 'objectifs' | 'programmes' | 'ressources' | 'integrations' | 'securite'

interface CompteLayoutProps {
  profile: Profile | null
  objective: Objective | null
  programs: Program[]
  userEmail: string
  userId: string
  subscriptionPlan?: string | null
}

const TABS: { id: Tab; label: string; icon: ElementType }[] = [
  { id: 'profil', label: 'Profil', icon: User },
  { id: 'abonnement', label: 'Abonnement', icon: CreditCard },
  { id: 'objectifs', label: 'Objectifs', icon: Target },
  { id: 'programmes', label: 'Programmes', icon: BookOpen },
  { id: 'ressources', label: 'Ressources', icon: FileText },
  { id: 'integrations', label: 'Intégrations', icon: Plug },
  { id: 'securite', label: 'Sécurité', icon: Shield },
]

export function CompteLayout({ profile, objective, programs, userEmail, userId, subscriptionPlan }: CompteLayoutProps) {
  const [activeTab, setActiveTab] = useState<Tab>('profil')

  return (
    <div className="flex gap-8 items-start">
      <nav className="w-52 flex-shrink-0 sticky top-6">
        <div className="space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left',
                activeTab === id
                  ? 'bg-violet-500/20 text-violet-300'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </div>
      </nav>

      <div className="flex-1 min-w-0">
        {activeTab === 'profil' && <ProfileSection profile={profile} userEmail={userEmail} />}
        {activeTab === 'abonnement' && <SubscriptionSection currentPlan={subscriptionPlan} />}
        {activeTab === 'objectifs' && <ObjectivesSection objective={objective} userId={userId} />}
        {activeTab === 'programmes' && <ProgramsSection programs={programs} subscriptionPlan={profile?.subscription_plan ?? null} />}
        {activeTab === 'ressources' && <ResourcesSection userId={userId} />}
        {activeTab === 'integrations' && <IntegrationsSection userId={userId} tallyBaseUrl={profile?.tally_base_url} />}
        {activeTab === 'securite' && <SecuritySection userEmail={userEmail} />}
      </div>
    </div>
  )
}
