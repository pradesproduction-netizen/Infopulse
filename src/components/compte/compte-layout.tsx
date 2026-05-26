'use client'

import { useState } from 'react'
import { User, CreditCard, Target, Plug, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ElementType } from 'react'
import { ProfileSection } from './profile-section'
import { SubscriptionSection } from './subscription-section'
import { ObjectivesSection } from './objectives-section'
import { IntegrationsSection } from './integrations-section'
import { SecuritySection } from './security-section'
import type { Profile, Objective } from '@/lib/types'

type Tab = 'profil' | 'abonnement' | 'objectifs' | 'integrations' | 'securite'

interface CompteLayoutProps {
  profile: Profile | null
  objective: Objective | null
  userEmail: string
  userId: string
}

const TABS: { id: Tab; label: string; icon: ElementType }[] = [
  { id: 'profil', label: 'Profil', icon: User },
  { id: 'abonnement', label: 'Abonnement', icon: CreditCard },
  { id: 'objectifs', label: 'Objectifs', icon: Target },
  { id: 'integrations', label: 'Intégrations', icon: Plug },
  { id: 'securite', label: 'Sécurité', icon: Shield },
]

export function CompteLayout({ profile, objective, userEmail, userId }: CompteLayoutProps) {
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
        {activeTab === 'abonnement' && <SubscriptionSection />}
        {activeTab === 'objectifs' && <ObjectivesSection objective={objective} userId={userId} />}
        {activeTab === 'integrations' && <IntegrationsSection />}
        {activeTab === 'securite' && <SecuritySection userEmail={userEmail} />}
      </div>
    </div>
  )
}
