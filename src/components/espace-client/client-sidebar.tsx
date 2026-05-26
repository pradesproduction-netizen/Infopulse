'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, TrendingUp, CreditCard, FileText, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ClientSidebarProps {
  coachName: string
}

const NAV = [
  { href: '/espace-client', label: 'Accueil', icon: Home, short: 'Accueil' },
  { href: '/espace-client/progression', label: 'Ma progression', icon: TrendingUp, short: 'Progression' },
  { href: '/espace-client/paiements', label: 'Mes paiements', icon: CreditCard, short: 'Paiements' },
  { href: '/espace-client/documents', label: 'Mes documents', icon: FileText, short: 'Documents' },
  { href: '/espace-client/support', label: 'Support', icon: HelpCircle, short: 'Support' },
]

export function ClientSidebar({ coachName }: ClientSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-56 flex-col border-r border-white/10 bg-card/40 backdrop-blur-sm z-40">
        <div className="p-5 border-b border-white/10">
          <p className="font-bold text-lg tracking-tight">
            INFO<span className="text-violet-400">PULSE</span>
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Espace client</p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all',
                  active
                    ? 'bg-violet-500/20 text-violet-300'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-0.5">
          <p className="text-xs font-medium text-foreground truncate">{coachName}</p>
          <p className="text-xs text-muted-foreground">Propulsé par INFOPULSE</p>
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-card/95 backdrop-blur-md border-t border-white/10">
        <div className="flex items-center justify-around px-1 py-2">
          {NAV.map(({ href, short, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors min-w-0',
                  active ? 'text-violet-400' : 'text-muted-foreground'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-[9px] font-medium truncate">{short}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
