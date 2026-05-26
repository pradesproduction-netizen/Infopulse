'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText, Upload, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Contract } from '@/lib/types'

const statusConfig = {
  draft: { label: 'Brouillon', className: 'bg-gray-500/10 text-gray-300 border-gray-500/30' },
  sent: { label: 'Envoyé', className: 'bg-blue-500/10 text-blue-300 border-blue-500/30' },
  signed: { label: 'Signé', className: 'bg-green-500/10 text-green-300 border-green-500/30' },
  cancelled: { label: 'Annulé', className: 'bg-red-500/10 text-red-300 border-red-500/30' },
}

export function ContractsTab({ contracts }: { contracts: Contract[]; clientId: string }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Contrats</h3>
        <Button variant="outline" size="sm" className="border-white/10 gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Nouveau contrat
        </Button>
      </div>

      {contracts.length === 0 ? (
        <Card className="border-white/10 bg-card/50 p-12">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Aucun contrat pour ce client.</p>
            <Button variant="outline" size="sm" className="border-white/10 gap-1.5 mt-2">
              <Upload className="h-3.5 w-3.5" />
              Uploader un PDF
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {contracts.map((contract) => (
            <Card
              key={contract.id}
              className="border-white/10 bg-card/50 p-4 hover:border-white/20 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{contract.name}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                    {contract.amount && (
                      <span>{Number(contract.amount).toLocaleString('fr-FR')} €</span>
                    )}
                    {contract.duration && <span>{contract.duration}</span>}
                    <span>
                      {new Date(contract.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge
                    variant="outline"
                    className={cn('text-xs', statusConfig[contract.status].className)}
                  >
                    {statusConfig[contract.status].label}
                  </Badge>
                  {contract.file_url && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a
                        href={contract.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Ouvrir le contrat"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
