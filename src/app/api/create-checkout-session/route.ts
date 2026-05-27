import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const PRICE_IDS: Record<string, Record<string, string>> = {
  starter: {
    monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY ?? 'price_starter_monthly_placeholder',
    annual:  process.env.STRIPE_PRICE_STARTER_ANNUAL  ?? 'price_starter_annual_placeholder',
  },
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? 'price_pro_monthly_placeholder',
    annual:  process.env.STRIPE_PRICE_PRO_ANNUAL  ?? 'price_pro_annual_placeholder',
  },
}

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return Response.json({ error: 'Stripe non configuré. Ajoutez STRIPE_SECRET_KEY dans .env.local' }, { status: 503 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Non autorisé' }, { status: 401 })

  const { plan, billing, firstName, lastName, country } = await request.json() as {
    plan: string
    billing: 'monthly' | 'annual'
    firstName?: string
    lastName?: string
    country?: string
  }

  const planPrices = PRICE_IDS[plan]
  if (!planPrices) return Response.json({ error: 'Plan inconnu' }, { status: 400 })

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
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
