'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, ChevronLeft, ChevronRight, Trash2, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { AddProspectModal } from './add-prospect-modal'
import { EditProspectModal } from './edit-prospect-modal'
import Link from 'next/link'
import type { Prospect } from '@/lib/types'

interface ProspectsPipelineProps {
  prospects: Prospect[]
  memberId?: string
  noAdd?: boolean
  closers?: { id: string; full_name: string }[]
  tallyBaseUrl?: string | null
}

const COLUMNS: {
  stage: Prospect['pipeline_stage']
  label: string
  borderColor: string
  headerClass: string
  badgeClass: string
}[] = [
  { stage: 'nouveau_lead', label: 'Nouveau lead', borderColor: 'border-slate-500/30', headerClass: 'bg-slate-500/10 text-slate-300', badgeClass: 'bg-slate-500/10 text-slate-300 border-slate-500/30' },
  { stage: 'set_en_cours', label: 'Set en cours', borderColor: 'border-blue-500/30', headerClass: 'bg-blue-500/10 text-blue-300', badgeClass: 'bg-blue-500/10 text-blue-300 border-blue-500/30' },
  { stage: 'r1_booke', label: 'R1 booké', borderColor: 'border-violet-500/30', headerClass: 'bg-violet-500/10 text-violet-300', badgeClass: 'bg-violet-500/10 text-violet-300 border-violet-500/30' },
  { stage: 'r1_noshow', label: 'R1 no-show', borderColor: 'border-orange-500/30', headerClass: 'bg-orange-500/10 text-orange-300', badgeClass: 'bg-orange-500/10 text-orange-300 border-orange-500/30' },
  { stage: 'r2_booke', label: 'R2 booké', borderColor: 'border-indigo-500/30', headerClass: 'bg-indigo-500/10 text-indigo-300', badgeClass: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' },
  { stage: 'r2_show', label: 'R2 show', borderColor: 'border-cyan-500/30', headerClass: 'bg-cyan-500/10 text-cyan-300', badgeClass: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' },
  { stage: 'follow_up', label: 'Follow-up', borderColor: 'border-sky-500/30', headerClass: 'bg-sky-500/10 text-sky-300', badgeClass: 'bg-sky-500/10 text-sky-300 border-sky-500/30' },
  { stage: 'signes', label: 'Signés', borderColor: 'border-green-500/30', headerClass: 'bg-green-500/10 text-green-300', badgeClass: 'bg-green-500/10 text-green-300 border-green-500/30' },
  { stage: 'perdu', label: 'Perdu', borderColor: 'border-red-500/30', headerClass: 'bg-red-500/10 text-red-300', badgeClass: 'bg-red-500/10 text-red-300 border-red-500/30' },
]

const STAGE_ORDER = COLUMNS.map((c) => c.stage)

function getAdjacentStages(stage: Prospect['pipeline_stage']) {
  const idx = STAGE_ORDER.indexOf(stage)
  return {
    prev: idx > 0 ? STAGE_ORDER[idx - 1] : null,
    next: idx < STAGE_ORDER.length - 1 ? STAGE_ORDER[idx + 1] : null,
  }
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" strokeWidth="0" />
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

// Shared card content — used in both kanban and drag overlay
function ProspectCardContent({ prospect, badgeClass, closerName }: { prospect: Prospect; badgeClass: string; closerName?: string | null }) {
  const initials = prospect.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  const hasSocial = prospect.instagram_url || prospect.linkedin_url
  const r1Label = prospect.rdv_r1_date
    ? `R1 : ${new Date(prospect.rdv_r1_date + 'T00:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}`
    : null
  const closerFirst = closerName ? closerName.split(' ')[0] : null
  return (
    <CardContent className="p-3">
      <div className="flex items-start gap-2">
        <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{prospect.full_name}</p>
          {prospect.estimated_value && (
            <p className="text-xs text-muted-foreground">{prospect.estimated_value.toLocaleString('fr-FR')} €</p>
          )}
          {(r1Label || closerFirst) && (
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {r1Label && <span className="text-[10px] text-sky-400">{r1Label}</span>}
              {closerFirst && <span className="text-[10px] text-violet-400">→ {closerFirst}</span>}
            </div>
          )}
        </div>
      </div>
      {(prospect.source || hasSocial) && (
        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
          {prospect.source && (
            <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', badgeClass)}>
              {prospect.source}
            </Badge>
          )}
          {hasSocial && (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {prospect.instagram_url && (
                <a
                  href={prospect.instagram_url.startsWith('http') ? prospect.instagram_url : `https://${prospect.instagram_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-5 w-5 flex items-center justify-center rounded text-pink-400 hover:text-pink-300 hover:bg-pink-500/15 transition-colors"
                  title="Instagram"
                >
                  <InstagramIcon className="h-3.5 w-3.5" />
                </a>
              )}
              {prospect.linkedin_url && (
                <a
                  href={prospect.linkedin_url.startsWith('http') ? prospect.linkedin_url : `https://${prospect.linkedin_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-5 w-5 flex items-center justify-center rounded text-blue-400 hover:text-blue-300 hover:bg-blue-500/15 transition-colors"
                  title="LinkedIn"
                >
                  <LinkedInIcon className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Client actif badge + link — only in Gagné column */}
      {prospect.client_id && prospect.pipeline_stage === 'signes' && (
        <div
          className="mt-2 flex items-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Badge className="bg-green-500/15 text-green-300 border-green-500/30 text-[10px] px-1.5 py-0">
            Client actif
          </Badge>
          <Link
            href={`/dashboard/clients/${prospect.client_id}`}
            className="flex items-center gap-0.5 text-[10px] text-violet-400 hover:text-violet-300 transition-colors"
          >
            Voir le profil
            <ExternalLink className="h-2.5 w-2.5" />
          </Link>
        </div>
      )}
    </CardContent>
  )
}

// Draggable card with click-to-edit, stage arrows, and delete
function DraggableCard({
  prospect,
  badgeClass,
  closerName,
  onEdit,
  onStageChange,
  onDelete,
}: {
  prospect: Prospect
  badgeClass: string
  closerName?: string | null
  onEdit: () => void
  onStageChange: (stage: Prospect['pipeline_stage']) => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: prospect.id })
  const style = { transform: CSS.Translate.toString(transform) }
  const { prev, next } = getAdjacentStages(prospect.pipeline_stage)

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && 'opacity-30')}>
      <Card
        className="border-white/10 bg-card/80 shadow-sm cursor-pointer hover:border-white/30 transition-colors group relative"
        onClick={onEdit}
        {...attributes}
        {...listeners}
      >
        <ProspectCardContent prospect={prospect} badgeClass={badgeClass} closerName={closerName} />
        {/* Trash — top right, revealed on hover */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute top-2 right-2 h-5 w-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 hover:bg-red-500/15 transition-all"
          title="Supprimer"
        >
          <Trash2 className="h-3 w-3" />
        </button>
        {/* Stage navigation arrows — bottom right, revealed on hover */}
        <div
          className="absolute bottom-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          {prev && (
            <button
              onClick={(e) => { e.stopPropagation(); onStageChange(prev) }}
              onPointerDown={(e) => e.stopPropagation()}
              className="h-5 w-5 rounded flex items-center justify-center bg-white/10 hover:bg-white/25 text-muted-foreground hover:text-foreground transition-colors"
              title={prev}
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
          )}
          {next && (
            <button
              onClick={(e) => { e.stopPropagation(); onStageChange(next) }}
              onPointerDown={(e) => e.stopPropagation()}
              className="h-5 w-5 rounded flex items-center justify-center bg-white/10 hover:bg-white/25 text-muted-foreground hover:text-foreground transition-colors"
              title={next}
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </Card>
    </div>
  )
}

// Droppable column
function DroppableColumn({
  col,
  prospects,
  onEdit,
  onStageChange,
  onDelete,
  memberId,
  noAdd,
  closerMap,
  closers,
  tallyBaseUrl,
}: {
  col: typeof COLUMNS[number]
  prospects: Prospect[]
  onEdit: (p: Prospect) => void
  onStageChange: (id: string, stage: Prospect['pipeline_stage']) => void
  onDelete: (p: Prospect) => void
  memberId?: string
  noAdd?: boolean
  closerMap: Map<string, string>
  closers: { id: string; full_name: string }[]
  tallyBaseUrl?: string | null
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.stage })

  return (
    <div className={cn(
      'w-52 flex-shrink-0 rounded-xl border bg-card/30 flex flex-col transition-colors',
      col.borderColor,
      isOver && 'bg-card/60 ring-1 ring-white/20'
    )}>
      <div className={cn('rounded-t-xl px-3 py-2 flex items-center justify-between', col.headerClass)}>
        <span className="text-xs font-semibold">{col.label}</span>
        <span className="text-xs font-bold opacity-70">{prospects.length}</span>
      </div>
      <div ref={setNodeRef} className="flex-1 p-2 space-y-2 min-h-[100px]">
        {prospects.map((p) => (
          <DraggableCard
            key={p.id}
            prospect={p}
            badgeClass={col.badgeClass}
            closerName={p.assigned_closer_id ? (closerMap.get(p.assigned_closer_id) ?? null) : null}
            onEdit={() => onEdit(p)}
            onStageChange={(stage) => onStageChange(p.id, stage)}
            onDelete={() => onDelete(p)}
          />
        ))}
      </div>
      {!noAdd && (
        <div className="px-2 pb-2">
          <AddProspectModal defaultStage={col.stage} assignedTo={memberId} closers={closers} tallyBaseUrl={tallyBaseUrl} />
        </div>
      )}
    </div>
  )
}

export function ProspectsPipeline({ prospects: initialProspects, memberId, noAdd, closers = [], tallyBaseUrl }: ProspectsPipelineProps) {
  const router = useRouter()
  const [prospects, setProspects] = useState<Prospect[]>(initialProspects)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null)
  const [deletingProspect, setDeletingProspect] = useState<Prospect | null>(null)

  const closerMap = new Map(closers.map((c) => [c.id, c.full_name]))

  // Sync server-fetched props into local state after router.refresh()
  useEffect(() => {
    setProspects(initialProspects)
  }, [initialProspects])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const updateStage = useCallback(async (id: string, newStage: Prospect['pipeline_stage']) => {
    setProspects((prev) => prev.map((p) => p.id === id ? { ...p, pipeline_stage: newStage } : p))
    try {
      const res = await fetch(`/api/update-prospect/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipeline_stage: newStage }),
      })
      if (!res.ok) { router.refresh(); return }
      if (newStage === 'signes') {
        const data = await res.json()
        const clientId = data.client_id as string | undefined
        if (clientId) {
          toast.success(`${data.client_name ?? ''} ajouté automatiquement dans Clients`, {
            action: {
              label: 'Voir le profil →',
              onClick: () => router.push(`/dashboard/clients/${clientId}`),
            },
            duration: 6000,
          })
        }
      }
    } catch {
      router.refresh()
    }
  }, [router])

  async function handleDelete() {
    if (!deletingProspect) return
    const id = deletingProspect.id
    setProspects((prev) => prev.filter((p) => p.id !== id))
    setDeletingProspect(null)
    try {
      const res = await fetch(`/api/update-prospect/${id}`, { method: 'DELETE' })
      if (!res.ok) { router.refresh(); return }
      const data = await res.json()
      if (data.client_deleted) {
        toast.success(`${data.client_name} supprimé des clients`, { duration: 4000 })
      }
    } catch {
      router.refresh()
    }
  }

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string)
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    if (!over) return
    const newStage = over.id as Prospect['pipeline_stage']
    const prospect = prospects.find((p) => p.id === active.id)
    if (!prospect || prospect.pipeline_stage === newStage) return
    updateStage(active.id as string, newStage)
  }

  const activeProspect = activeId ? prospects.find((p) => p.id === activeId) : null
  const activeCol = activeProspect ? COLUMNS.find((c) => c.stage === activeProspect.pipeline_stage) : null

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-muted-foreground" />
        Pipeline prospects
        <span className="text-sm font-normal text-muted-foreground">({prospects.length})</span>
      </h2>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {COLUMNS.map((col) => (
              <DroppableColumn
                key={col.stage}
                col={col}
                prospects={prospects.filter((p) => p.pipeline_stage === col.stage)}
                onEdit={setEditingProspect}
                onStageChange={updateStage}
                onDelete={setDeletingProspect}
                memberId={memberId}
                noAdd={noAdd}
                closerMap={closerMap}
                closers={closers}
                tallyBaseUrl={tallyBaseUrl}
              />
            ))}
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeProspect && activeCol ? (
            <Card className="w-52 border-white/30 bg-card shadow-2xl rotate-1 opacity-95 pointer-events-none">
              <ProspectCardContent
                prospect={activeProspect}
                badgeClass={activeCol.badgeClass}
                closerName={activeProspect.assigned_closer_id ? (closerMap.get(activeProspect.assigned_closer_id) ?? null) : null}
              />
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      {editingProspect && (
        <EditProspectModal
          prospect={editingProspect}
          open={true}
          onClose={() => setEditingProspect(null)}
          onSaved={(updated) => {
            setProspects((prev) => prev.map((p) => p.id === updated.id ? updated : p))
            setEditingProspect(null)
          }}
          closers={closers}
          tallyBaseUrl={tallyBaseUrl}
        />
      )}

      <AlertDialog
        open={!!deletingProspect}
        onOpenChange={(v) => { if (!v) setDeletingProspect(null) }}
        title={`Supprimer ${deletingProspect?.full_name ?? ''} ?`}
        description="Cette action est irréversible."
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
      />
    </div>
  )
}
