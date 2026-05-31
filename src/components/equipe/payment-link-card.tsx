'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, ExternalLink, Check } from 'lucide-react'
import type { PaymentLink } from '@/lib/types'

export function PaymentLinkCard({ link }: { link: PaymentLink }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(link.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="border-white/10 bg-card/50 hover:border-white/20 transition-colors">
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{link.name}</p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{link.url}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button size="sm" variant="outline" className="border-white/10 gap-1.5" onClick={handleCopy}>
            {copied
              ? <><Check className="h-3.5 w-3.5 text-green-400" /> Copié</>
              : <><Copy className="h-3.5 w-3.5" /> Copier</>
            }
          </Button>
          <Button size="sm" variant="outline" className="border-white/10 gap-1.5" asChild>
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              Ouvrir
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
