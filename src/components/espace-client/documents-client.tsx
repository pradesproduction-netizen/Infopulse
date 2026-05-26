'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, ExternalLink, PenLine, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Contract } from '@/lib/types'

interface DocumentsClientProps {
  contracts: Contract[]
}

const statusConfig = {
  signed: {
    label: 'Signé ✅',
    badgeClass: 'bg-green-500/10 text-green-300 border-green-500/30',
  },
  sent: {
    label: 'En attente ⏳',
    badgeClass: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
  },
  draft: {
    label: 'Brouillon',
    badgeClass: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  },
  cancelled: {
    label: 'Annulé',
    badgeClass: 'bg-red-500/10 text-red-300 border-red-500/30',
  },
}

export function DocumentsClient({ contracts }: DocumentsClientProps) {
  return (
    <div className="p-6 space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Mes documents</h1>
        <p className="text-muted-foreground mt-1">Tes contrats et ressources partagées</p>
      </div>

      {/* Contracts */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          Contrats
        </h2>

        {contracts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            Aucun contrat disponible pour l&apos;instant.
          </p>
        ) : (
          <div className="space-y-3">
            {contracts.map((contract) => {
              const cfg = statusConfig[contract.status]
              return (
                <Card key={contract.id} className="border-white/10 bg-card/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">{contract.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(contract.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric', month: 'long', year: 'numeric',
                            })}
                            {contract.amount && ` · ${contract.amount.toLocaleString('fr-FR')} €`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={cn('text-xs', cfg.badgeClass)}>
                          {cfg.label}
                        </Badge>
                        {contract.file_url && (
                          <Button size="sm" variant="ghost" className="gap-1.5 h-8" asChild>
                            <a href={contract.file_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3.5 w-3.5" />
                              Voir
                            </a>
                          </Button>
                        )}
                        {contract.status === 'sent' && (
                          <Button size="sm" className="gap-1.5 h-8 bg-violet-600 hover:bg-violet-700">
                            <PenLine className="h-3.5 w-3.5" />
                            Signer
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Shared resources (placeholder) */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-muted-foreground" />
          Ressources partagées
        </h2>
        <Card className="border-dashed border-white/20 bg-card/30">
          <CardContent className="p-8 text-center">
            <FolderOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium">Aucune ressource partagée</p>
            <p className="text-xs text-muted-foreground mt-1">
              Ton coach peut partager des fichiers, liens et ressources ici.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
