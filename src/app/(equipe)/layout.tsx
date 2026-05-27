import { getAuthenticatedTeamMember } from '@/lib/get-team-member'
import { EquipeSidebar } from '@/components/espace-equipe/equipe-sidebar'
import { Toaster } from '@/components/ui/sonner'

export default async function EquipeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const member = await getAuthenticatedTeamMember()

  return (
    <div className="min-h-screen bg-background flex">
      <EquipeSidebar memberName={member.full_name} memberRole={member.role} />
      <main className="flex-1 ml-60 overflow-auto">
        {children}
      </main>
      <Toaster position="bottom-right" />
    </div>
  )
}
