'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp, Kanban } from 'lucide-react'

interface NotifItem {
  id: string
  message: string
}

interface NotificationBannerProps {
  notifications: NotifItem[]
}

export function NotificationBanner({ notifications: initial }: NotificationBannerProps) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState(initial)
  const [markedRead, setMarkedRead] = useState(false)

  if (items.length === 0) return null

  async function handleToggle() {
    if (!open && !markedRead) {
      setMarkedRead(true)
      await fetch('/api/notifications/mark-read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_ids: items.map((n) => n.id) }),
      })
    }
    setOpen((v) => !v)
  }

  return (
    <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 overflow-hidden">
      <button
        onClick={handleToggle}
        className="w-full px-4 py-3 flex items-center gap-3 text-left"
      >
        <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
          {!markedRead && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
          )}
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500" />
        </span>
        <span className="text-sm font-medium text-violet-300 flex-1">
          {items.length} R1 booké{items.length !== 1 ? 's' : ''} aujourd&apos;hui
        </span>
        {open ? <ChevronUp className="h-4 w-4 text-violet-400" /> : <ChevronDown className="h-4 w-4 text-violet-400" />}
      </button>
      {open && (
        <div className="border-t border-violet-500/20 px-4 py-2 space-y-1">
          {items.map((n) => (
            <Link
              key={n.id}
              href="/espace-equipe/pipeline"
              className="flex items-center gap-2 text-sm text-violet-200 hover:text-white py-1 transition-colors"
            >
              <Kanban className="h-3.5 w-3.5 text-violet-400 flex-shrink-0" />
              {n.message}
            </Link>
          ))}
          <div className="pt-1 pb-0.5">
            <button
              onClick={() => setItems([])}
              className="text-xs text-violet-400/60 hover:text-violet-400 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
