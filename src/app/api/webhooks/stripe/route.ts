import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.user_id
    const plan = session.metadata?.plan

    if (userId && plan) {
      const admin = createAdminClient()
      await admin
        .from('profiles')
        .update({ subscription_plan: plan })
        .eq('id', userId)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string
    const stripe2 = new Stripe(process.env.STRIPE_SECRET_KEY)
    const customer = await stripe2.customers.retrieve(customerId)
    if (customer.deleted) return Response.json({ received: true })
    const email = (customer as Stripe.Customer).email
    if (email) {
      const admin = createAdminClient()
      const { data: profile } = await admin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()
      if (profile) {
        await admin
          .from('profiles')
          .update({ subscription_plan: 'free' })
          .eq('id', profile.id)
      }
    }
  }

  return Response.json({ received: true })
}
