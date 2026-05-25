'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Sparkles, Home, Users, BarChart3, Settings } from 'lucide-react'

const navigation = [
  {
    name: 'Aujourd\'hui',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Clients',
    href: '/dashboard/clients',
    icon: Users,
  },
  {
    name: 'Équipe',
    href: '/dashboard/equipe',
    icon: BarChart3,
  },
  {
    name: 'Compte',
    href: '/dashboard/compte',
    icon: Settings,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/5 bg-card/30 backdrop-blur-xl flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-violet-500" />
          <span className="text-xl font-bold tracking-tight">INFOPULSE</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
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

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <div className="rounded-lg bg-violet-500/5 border border-violet-500/10 p-3">
          <p className="text-xs text-violet-200/70">
            <strong className="text-violet-300">Plan Starter</strong>
            <br />
            Passe au plan Pro pour débloquer toutes les fonctionnalités.
          </p>
        </div>
      </div>
    </aside>
  )
}