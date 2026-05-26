'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { Pencil, Trash2, Power, Loader2, Users } from 'lucide-react'
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
    }).eq('id', member.id)
    setLoading(false)
    onClose()
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le membre</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="edit_full_name">Nom complet *</Label>
            <Input
              id="edit_full_name"
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_email">Email *</Label>
            <Input
              id="edit_email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_phone">Téléphone</Label>
            <Input
              id="edit_phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_role">Rôle *</Label>
            <Select
              value={form.role}
              onValueChange={(v: 'closer' | 'setter') => setForm((f) => ({ ...f, role: v }))}
            >
              <SelectTrigger id="edit_role" disabled={loading}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="closer">Closer</SelectItem>
                <SelectItem value="setter">Setter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
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

  const thisMonthCalls = calls.filter((c) => c.team_member_id === member.id && isThisMonth(c.date))
  const completed = thisMonthCalls.filter((c) => c.status === 'completed').length
  const closed = thisMonthCalls.filter((c) => c.is_closed).length
  const closingRate = completed > 0 ? Math.round((closed / completed) * 100) : 0
  const ca = thisMonthCalls.reduce((sum, c) => sum + (c.amount_closed ?? 0), 0)

  const initials = member.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  async function handleToggle() {
    setToggleLoading(true)
    const supabase = createClient()
    await supabase.from('team_members').update({ is_active: !member.is_active }).eq('id', member.id)
    setToggleLoading(false)
    router.refresh()
  }

  async function handleDelete() {
    setDeleteLoading(true)
    const supabase = createClient()
    await supabase.from('team_members').delete().eq('id', member.id)
    setDeleteLoading(false)
    setDeleteOpen(false)
    router.refresh()
  }

  return (
    <>
      <Card className={cn('border-white/10 bg-card/50 transition-opacity', !member.is_active && 'opacity-60')}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0',
                  member.role === 'closer' ? 'bg-violet-500' : 'bg-blue-500'
                )}
              >
                {initials}
              </div>
              <div>
                <p className="font-medium text-sm leading-tight">{member.full_name}</p>
                <p className="text-xs text-muted-foreground">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={handleToggle}
                disabled={toggleLoading}
                title={member.is_active ? 'Désactiver' : 'Activer'}
              >
                <Power className={cn('h-3.5 w-3.5', member.is_active ? 'text-green-400' : 'text-muted-foreground')} />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditOpen(true)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 hover:text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                member.role === 'closer'
                  ? 'bg-violet-500/10 text-violet-300 border-violet-500/30'
                  : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
              )}
            >
              {member.role === 'closer' ? 'Closer' : 'Setter'}
            </Badge>
            {!member.is_active && (
              <Badge variant="outline" className="text-xs bg-gray-500/10 text-gray-400 border-gray-500/30">
                Inactif
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/5 rounded-lg p-2">
              <p className="text-base font-bold">{thisMonthCalls.length}</p>
              <p className="text-xs text-muted-foreground">Appels</p>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <p className="text-base font-bold">{closingRate}%</p>
              <p className="text-xs text-muted-foreground">Closing</p>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <p className="text-base font-bold truncate">{ca > 0 ? `${(ca / 1000).toFixed(0)}k` : '—'}</p>
              <p className="text-xs text-muted-foreground">CA €</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditMemberModal member={member} open={editOpen} onClose={() => setEditOpen(false)} />

      <AlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Supprimer ce membre ?"
        description={`${member.full_name} sera définitivement supprimé de l'équipe. Cette action est irréversible.`}
        onConfirm={handleDelete}
        confirmLabel="Supprimer"
        loading={deleteLoading}
      />
    </>
  )
}

export function TeamMembersGrid({ teamMembers, calls }: TeamMembersGridProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Users className="h-5 w-5 text-muted-foreground" />
        Membres de l&apos;équipe
      </h2>
      {teamMembers.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Aucun membre pour l&apos;instant.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {teamMembers.map((member) => (
            <MemberCard key={member.id} member={member} calls={calls} />
          ))}
        </div>
      )}
    </div>
  )
}
