import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'

const PRICE_IDS: Record<string, Record<string, string>> = {
  starter: {
    monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY ?? '',
    annual:  process.env.STRIPE_PRICE_STARTER_ANNUAL  ?? '',
  },
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? '',
    annual:  process.env.STRIPE_PRICE_PRO_ANNUAL  ?? '',
  },
}

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return Response.json({ error: 'Stripe non configuré. Ajoutez STRIPE_SECRET_KEY dans .env.local' }, { status: 503 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await request.json() as {
    plan: string
    billing?: 'monthly' | 'annual'
    firstName?: string
    lastName?: string
    country?: string
  }
  const { plan, billing = 'monthly', firstName, lastName, country } = body

  const planPrices = PRICE_IDS[plan]
  if (!planPrices) return Response.json({ error: 'Plan inconnu' }, { status: 400 })

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const admin = createAdminClient()

  // Check if user already has a Stripe customer with an active subscription → upgrade via proration
  const { data: profile } = await admin
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (profile?.stripe_customer_id) {
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id as string,
      status: 'active',
      limit: 1,
    })

    if (subscriptions.data.length) {
      const subscription = subscriptions.data[0]
      const itemId = subscription.items.data[0].id
      const targetPrice = planPrices[billing]

      await stripe.subscriptions.update(subscription.id, {
        items: [{ id: itemId, price: targetPrice }],
        proration_behavior: 'create_prorations',
      })

      await admin.from('profiles').update({ subscription_plan: plan }).eq('id', user.id)

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
      return Response.json({ url: `${appUrl}/dashboard/checkout/success` })
    }
  }

  // No existing subscription → create a Stripe Checkout Session
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: user.email,
    line_items: [{ price: planPrices[billing], quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${appUrl}/dashboard/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/dashboard/checkout/${plan}`,
    metadata: {
      user_id: user.id,
      plan,
      billing,
      customer_name: [firstName, lastName].filter(Boolean).join(' '),
      country: country ?? 'FR',
    },
  })

  return Response.json({ sessionId: session.id, url: session.url })
}
