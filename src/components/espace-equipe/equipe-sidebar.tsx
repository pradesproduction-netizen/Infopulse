'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Sparkles, Home, Kanban, User, LogOut, Link as LinkIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface EquipeSidebarProps {
  memberName: string
  memberRole: 'closer' | 'setter'
}

export function EquipeSidebar({ memberName, memberRole }: EquipeSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const navigation = [
    { name: 'Mon espace', href: '/espace-equipe', icon: Home, exact: true },
    { name: 'Mon pipeline', href: '/espace-equipe/pipeline', icon: Kanban, exact: false },
    { name: 'Ressources', href: '/espace-equipe/ressources', icon: LinkIcon, exact: false },
    { name: 'Mon profil', href: '/espace-equipe/profil', icon: User, exact: false },
  ]

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 border-r border-white/5 bg-card/30 backdrop-blur-xl flex flex-col">
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-violet-500" />
          <span className="text-lg font-bold tracking-tight">INFOPULSE</span>
        </div>
      </div>

      <div className="px-4 py-4 border-b border-white/5">
        <p className="text-xs text-muted-foreground mb-0.5">Connecté en tant que</p>
        <p className="text-sm font-semibold truncate">{memberName}</p>
        <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20 capitalize">
          {memberRole}
        </span>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navigation.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-violet-500/10 text-violet-300 border border-violet-500/20'
                  : 'text-muted-foreground hover:text-white hover:bg-white/5'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Se déconnecter
        </button>
      </div>
    </aside>
  )
}
