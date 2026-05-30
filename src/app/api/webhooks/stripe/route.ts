import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { resend } from '@/lib/resend'
import { BienvenueEmail } from '@/lib/emails/bienvenue-paiement'

function buildPriceToPlan(): Record<string, string> {
  return {
    [process.env.STRIPE_PRICE_STARTER_MONTHLY ?? '']: 'starter',
    [process.env.STRIPE_PRICE_STARTER_ANNUAL  ?? '']: 'starter',
    [process.env.STRIPE_PRICE_PRO_MONTHLY     ?? '']: 'pro',
    [process.env.STRIPE_PRICE_PRO_ANNUAL      ?? '']: 'pro',
  }
}

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return Response.json({ error: 'Stripe non configuré' }, { status: 503 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const body = await request.text()
  const sig = request.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return Response.json({ error: 'Signature webhook invalide' }, { status: 400 })
  }

  const admin = createAdminClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.user_id
    const plan = session.metadata?.plan
    const billing = (session.metadata?.billing ?? 'monthly') as 'monthly' | 'annual'
    const customerId = typeof session.customer === 'string' ? session.customer : null

    if (userId && plan) {
      await admin
        .from('profiles')
        .update({
          subscription_plan: plan,
          ...(customerId ? { stripe_customer_id: customerId } : {}),
        })
        .eq('id', userId)

      // Send welcome email
      if (session.customer_email && session.subscription) {
        try {
          const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string)
          const amount = plan === 'pro'
            ? (billing === 'annual' ? 970 : 97)
            : (billing === 'annual' ? 290 : 29)
          const periodEnd = stripeSubscription.items.data[0]?.current_period_end ?? 0
          const nextRenewal = periodEnd ? formatDate(periodEnd) : ''
          const customerName = session.metadata?.customer_name ?? ''
          const firstName = customerName.split(' ')[0] || 'là'
          const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

          await resend.emails.send({
            from: process.env.FROM_EMAIL ?? 'noreply@infopulse.fr',
            to: session.customer_email,
            subject: `Bienvenue sur INFOPULSE ${plan === 'pro' ? 'Pro' : 'Starter'} 🎉`,
            react: BienvenueEmail({
              firstName,
              plan,
              amount,
              billing,
              nextRenewalDate: nextRenewal,
              dashboardUrl: `${appUrl}/dashboard`,
            }),
          })
        } catch (err) {
          console.error('[webhook] bienvenue email error:', err)
        }
      }
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string
    const priceId = subscription.items.data[0]?.price.id
    const priceToPlan = buildPriceToPlan()
    const newPlan = priceId ? priceToPlan[priceId] : undefined

    if (newPlan && customerId) {
      await admin
        .from('profiles')
        .update({ subscription_plan: newPlan })
        .eq('stripe_customer_id', customerId)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string

    const { data: profileById } = await admin
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle()

    if (profileById) {
      await admin.from('profiles').update({ subscription_plan: 'free' }).eq('id', profileById.id)
    } else {
      const customer = await stripe.customers.retrieve(customerId)
      if (!customer.deleted) {
        const email = (customer as Stripe.Customer).email
        if (email) {
          const { data: profileByEmail } = await admin
            .from('profiles')
            .select('id')
            .eq('email', email)
            .maybeSingle()
          if (profileByEmail) {
            await admin.from('profiles').update({ subscription_plan: 'free' }).eq('id', profileByEmail.id)
          }
        }
      }
    }
  }

  return Response.json({ received: true })
}
