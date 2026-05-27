import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CheckoutForm } from '@/components/checkout/checkout-form'

const VALID_PLANS = ['starter', 'pro'] as const
type ValidPlan = typeof VALID_PLANS[number]

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ plan: string }>
}) {
  const { plan } = await params

  if (!VALID_PLANS.includes(plan as ValidPlan)) redirect('/dashboard/compte')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const nameParts = (profile?.full_name ?? '').split(' ')
  const firstName = nameParts[0] ?? ''
  const lastName = nameParts.slice(1).join(' ')

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <CheckoutForm
        plan={plan as ValidPlan}
        userEmail={user.email ?? ''}
        defaultFirstName={firstName}
        defaultLastName={lastName}
      />
    </div>
  )
}
