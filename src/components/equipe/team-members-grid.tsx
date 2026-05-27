'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { Pencil, Trash2, Power, Loader2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { TeamMember, Call } from '@/lib/types'

interface TeamMembersGridProps {
  teamMembers: TeamMember[]
  calls: Call[]
}

function isThisMonth(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

interface EditModalProps {
  member: TeamMember
  open: boolean
  onClose: () => void
}

function EditMemberModal({ member, open, onClose }: EditModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: member.full_name,
    email: member.email,
    phone: member.phone ?? '',
    role: member.role,
    messages_sent: member.messages_sent != null ? String(member.messages_sent) : '',
    follow_ups: member.follow_ups != null ? String(member.follow_ups) : '',
    calls_booked: member.calls_booked != null ? String(member.calls_booked) : '',
    signed_clients: member.signed_clients != null ? String(member.signed_clients) : '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    await supabase.from('team_members').update({
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      role: form.role,
      messages_sent: form.messages_sent !== '' ? parseInt(form.messages_sent) : null,
      follow_ups: form.follow_ups !== '' ? parseInt(form.follow_ups) : null,
      calls_booked: form.calls_booked !== '' ? parseInt(form.calls_booked) : null,
      signed_clients: form.signed_clients !== '' ? parseInt(form.signed_clients) : null,
    }).eq('id', member.id)
    setLoading(false)
    onClose()
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Modifier le membre</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="edit_full_name">Nom complet *</Label>
            <Input id="edit_full_name" value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} required disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_email">Email *</Label>
            <Input id="edit_email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_phone">Téléphone</Label>
            <Input id="edit_phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_role">Rôle *</Label>
            <Select value={form.role} onValueChange={(v: 'closer' | 'setter') => setForm((f) => ({ ...f, role: v }))}>
              <SelectTrigger id="edit_role" disabled={loading}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="closer">Closer</SelectItem>
                <SelectItem value="setter">Setter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.role === 'setter' && (
            <div className="space-y-3 pt-1 border-t border-white/10">
              <p className="text-xs text-muted-foreground font-medium pt-1">Stats Setter (ce mois)</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit_messages_sent" className="text-xs">Messages</Label>
                  <Input id="edit_messages_sent" type="number" min="0" value={form.messages_sent} onChange={(e) => setForm((f) => ({ ...f, messages_sent: e.target.value }))} disabled={loading} placeholder="0" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit_follow_ups" className="text-xs">Follow-ups</Label>
                  <Input id="edit_follow_ups" type="number" min="0" value={form.follow_ups} onChange={(e) => setForm((f) => ({ ...f, follow_ups: e.target.value }))} disabled={loading} placeholder="0" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit_calls_booked" className="text-xs">Calls bookés</Label>
                  <Input id="edit_calls_booked" type="number" min="0" value={form.calls_booked} onChange={(e) => setForm((f) => ({ ...f, calls_booked: e.target.value }))} disabled={loading} placeholder="0" />
                </div>
              </div>
            </div>
          )}

          {form.role === 'closer' && (
            <div className="space-y-3 pt-1 border-t border-white/10">
              <p className="text-xs text-muted-foreground font-medium pt-1">Stats Closer (ce mois)</p>
              <div className="space-y-1.5">
                <Label htmlFor="edit_signed_clients" className="text-xs">Clients signés</Label>
                <Input id="edit_signed_clients" type="number" min="0" value={form.signed_clients} onChange={(e) => setForm((f) => ({ ...f, signed_clients: e.target.value }))} disabled={loading} placeholder="0" />
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Annuler</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface MemberCardProps {
  member: TeamMember
  calls: Call[]
}

function MemberCard({ member, calls }: MemberCardProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [toggleLoading, setToggleLoading] = useState(false)

  const thisMonthCalls = calls.filter((c) => c.team_member_id === member.id && isThisMonth(c.call_date))
  const completed = thisMonthCalls.filter((c) => c.status === 'completed').length
  const noShow = thisMonthCalls.filter((c) => c.status === 'no_show').length
  const showUpRate = completed + noShow > 0 ? Math.round((completed / (completed + noShow)) * 100) : 0

  const initials = member.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  async function handleToggle() {
    setToggleLoading(true)
    const supabase = createClient()
    await supabase.from('team_members').update({ active: !member.active }).eq('id', member.id)
    setToggleLoading(false)
    router.refresh()
  }

  async function handleDelete() {
    setDeleteLoading(true)
    const res = await fetch(`/api/delete-member/${member.id}`, { method: 'DELETE' })
    setDeleteLoading(false)
    setDeleteOpen(false)
    if (res.ok) router.refresh()
  }

  const kpis = member.role === 'setter'
    ? [
        { label: 'Messages', value: member.messages_sent ?? 0 },
        { label: 'Follow-ups', value: member.follow_ups ?? 0 },
        { label: 'Calls bookés', value: member.calls_booked ?? 0 },
      ]
    : [
        { label: 'Appels', value: thisMonthCalls.length },
        { label: 'Show-up', value: `${showUpRate}%` },
        { label: 'Signés', value: member.signed_clients ?? 0 },
      ]

  return (
    <>
      <Card className={cn('border-white/10 bg-card/50 transition-opacity', !member.active && 'opacity-60')}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={cn('h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0', member.role === 'closer' ? 'bg-violet-500' : 'bg-blue-500')}>
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm leading-tight truncate">{member.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleToggle} disabled={toggleLoading} title={member.active ? 'Désactiver' : 'Activer'}>
                <Power className={cn('h-3.5 w-3.5', member.active ? 'text-green-400' : 'text-muted-foreground')} />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditOpen(true)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className={cn('text-xs', member.role === 'closer' ? 'bg-violet-500/10 text-violet-300 border-violet-500/30' : 'bg-blue-500/10 text-blue-300 border-blue-500/30')}>
              {member.role === 'closer' ? 'Closer' : 'Setter'}
            </Badge>
            {!member.active && (
              <Badge variant="outline" className="text-xs bg-gray-500/10 text-gray-400 border-gray-500/30">Inactif</Badge>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center mb-3">
            {kpis.map(({ label, value }) => (
              <div key={label} className="bg-white/5 rounded-lg p-2">
                <p className="text-base font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          <Link
            href={`/dashboard/equipe/${member.id}`}
            className="flex items-center justify-center gap-1.5 w-full text-xs text-violet-400 hover:text-violet-300 transition-colors py-1.5 rounded-lg hover:bg-violet-500/10 border border-violet-500/20"
          >
            Voir le profil
            <ArrowRight className="h-3 w-3" />
          </Link>
        </CardContent>
      </Card>

      <EditMemberModal member={member} open={editOpen} onClose={() => setEditOpen(false)} />
      <AlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Supprimer ce membre ?"
        description={`${member.full_name} sera définitivement supprimé de l'équipe.`}
        onConfirm={handleDelete}
        confirmLabel="Supprimer"
        loading={deleteLoading}
      />
    </>
  )
}

export function TeamMembersGrid({ teamMembers, calls }: TeamMembersGridProps) {
  const setters = teamMembers.filter((m) => m.role === 'setter')
  const closers = teamMembers.filter((m) => m.role === 'closer')

  if (teamMembers.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-4">Membres de l&apos;équipe</h2>
        <p className="text-sm text-muted-foreground text-center py-8">Aucun membre pour l&apos;instant.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {setters.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <h2 className="text-base font-semibold">Setters</h2>
            <span className="text-xs text-muted-foreground">{setters.length} membre{setters.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {setters.map((member) => (
              <MemberCard key={member.id} member={member} calls={calls} />
            ))}
          </div>
        </div>
      )}

      {closers.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 w-2 rounded-full bg-violet-500" />
            <h2 className="text-base font-semibold">Closers</h2>
            <span className="text-xs text-muted-foreground">{closers.length} membre{closers.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {closers.map((member) => (
              <MemberCard key={member.id} member={member} calls={calls} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
