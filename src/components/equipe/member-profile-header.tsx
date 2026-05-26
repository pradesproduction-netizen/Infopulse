'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Power } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { TeamMember } from '@/lib/types'

interface MemberProfileHeaderProps {
  member: TeamMember
}

export function MemberProfileHeader({ member }: MemberProfileHeaderProps) {
  const router = useRouter()
  const [toggling, setToggling] = useState(false)

  const initials = member.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  async function handleToggle() {
    setToggling(true)
    const supabase = createClient()
    await supabase.from('team_members').update({ active: !member.active }).eq('id', member.id)
    setToggling(false)
    router.refresh()
  }

  return (
    <div className="flex items-start gap-6">
      <Link href="/dashboard/equipe">
        <Button variant="ghost" size="icon" className="mt-1 flex-shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </Link>

      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={cn(
          'h-16 w-16 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0',
          member.role === 'closer' ? 'bg-violet-500' : 'bg-blue-500'
        )}>
          {initials}
        </div>

        <div className="min-w-0">
          <h1 className="text-2xl font-bold truncate">{member.full_name}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant="outline" className={cn(
              'text-xs',
              member.role === 'closer'
                ? 'bg-violet-500/10 text-violet-300 border-violet-500/30'
                : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
            )}>
              {member.role === 'closer' ? 'Closer' : 'Setter'}
            </Badge>
            <Badge variant="outline" className={cn(
              'text-xs',
              member.active
                ? 'bg-green-500/10 text-green-300 border-green-500/30'
                : 'bg-gray-500/10 text-gray-400 border-gray-500/30'
            )}>
              {member.active ? 'Actif' : 'Inactif'}
            </Badge>
            <span className="text-sm text-muted-foreground">{member.email}</span>
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        disabled={toggling}
        className={cn(
          'gap-1.5 flex-shrink-0',
          member.active
            ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
            : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
        )}
      >
        <Power className="h-3.5 w-3.5" />
        {member.active ? 'Désactiver' : 'Activer'}
      </Button>
    </div>
  )
}
