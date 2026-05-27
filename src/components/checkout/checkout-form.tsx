'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Shield, ShieldCheck, Lock, Tag, Building2, CheckCircle2, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import Link from 'next/link'

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

const PLAN_DATA = {
  starter: { name: 'Starter', monthly: 29, annual: 290, annualPerMonth: 24 },
  pro:     { name: 'Pro',     monthly: 97, annual: 970, annualPerMonth: 81 },
} as const

type ValidPlan = keyof typeof PLAN_DATA

const PROMO_CODES: Record<string, number> = {
  LAUNCH20:   20,
  BIENVENUE:  10,
  INFOPULSE:  15,
}

const COUNTRIES = [
  { code: 'FR', label: 'France' },
  { code: 'BE', label: 'Belgique' },
  { code: 'CH', label: 'Suisse' },
  { code: 'LU', label: 'Luxembourg' },
  { code: 'MC', label: 'Monaco' },
  { code: 'CA', label: 'Canada' },
  { code: 'MA', label: 'Maroc' },
  { code: 'SN', label: 'Sénégal' },
  { code: 'CI', label: "Côte d'Ivoire" },
  { code: 'OTHER', label: 'Autre pays' },
]

const CARD_STYLE = {
  style: {
    base: {
      color: '#f4f4f5',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '14px',
      fontSmoothing: 'antialiased',
      '::placeholder': { color: '#52525b' },
    },
    invalid: { color: '#f87171', iconColor: '#f87171' },
  },
}

interface CheckoutFormProps {
  plan: ValidPlan
  userEmail: string
  defaultFirstName: string
  defaultLastName: string
}

function CheckoutInner({ plan, userEmail, defaultFirstName, defaultLastName }: CheckoutFormProps) {
  const router = useRouter()
  const stripe = useStripe()
  useElements()

  const planData = PLAN_DATA[plan]

  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const [promoInput, setPromoInput] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [firstName, setFirstName] = useState(defaultFirstName)
  const [lastName, setLastName] = useState(defaultLastName)
  const [country, setCountry] = useState('FR')
  const [isBusiness, setIsBusiness] = useState(false)
  const [siret, setSiret] = useState('')
  const [loading, setLoading] = useState(false)

  const basePrice = billing === 'monthly' ? planData.monthly : planData.annual
  const annualSaving = billing === 'annual'
    ? planData.monthly * 12 - planData.annual
    : 0
  const promoAmount = promoDiscount > 0 ? Math.round(basePrice * promoDiscount / 100) : 0
  const total = basePrice - promoAmount

  function applyPromo() {
    const code = promoInput.trim().toUpperCase()
    if (!code) return
    const pct = PROMO_CODES[code]
    if (pct) {
      setPromoCode(code)
      setPromoDiscount(pct)
      toast.success(`Code "${code}" appliqué — ${pct}% de réduction`)
    } else {
      toast.error('Code promo invalide')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Prénom et nom requis')
      return
    }
    setLoading(true)

    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, billing, firstName, lastName, country }),
      })
      const data = await res.json() as { url?: string; error?: string }

      if (!res.ok || !data.url) {
        toast.error(data.error ?? 'Erreur lors de la création de la session')
        setLoading(false)
        return
      }

      // Redirect to Stripe Checkout
      void stripe // stripe instance available for future embedded checkout
      window.location.href = data.url
    } catch {
      toast.error('Une erreur est survenue')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl">
      {/* Back link */}
      <Link
        href="/dashboard/compte"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour à mon compte
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── LEFT — Résumé commande ── */}
        <div className="rounded-xl border border-white/10 bg-card/60 p-6 space-y-5">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Votre commande</p>
            <h1 className="text-xl font-bold">Plan {planData.name} INFOPULSE</h1>
          </div>

          {/* Guarantee */}
          <div className="flex items-center gap-2.5 rounded-lg bg-green-500/10 border border-green-500/20 px-3.5 py-2.5">
            <ShieldCheck className="h-4 w-4 text-green-400 flex-shrink-0" />
            <p className="text-sm text-green-300 font-medium">7 jours satisfait ou remboursé</p>
          </div>

          {/* Billing toggle */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Fréquence de facturation</p>
            <div className="flex rounded-lg border border-white/10 p-1 gap-1 bg-white/[0.02]">
              <button
                type="button"
                onClick={() => setBilling('monthly')}
                className={cn(
                  'flex-1 rounded-md py-1.5 text-sm font-medium transition-all',
                  billing === 'monthly'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-white'
                )}
              >
                Mensuel
              </button>
              <button
                type="button"
                onClick={() => setBilling('annual')}
                className={cn(
                  'flex-1 rounded-md py-1.5 text-sm font-medium transition-all flex items-center justify-center gap-1.5',
                  billing === 'annual'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-white'
                )}
              >
                Annuel
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-[10px] px-1.5 py-0">
                  -20%
                </Badge>
              </button>
            </div>
            {billing === 'annual' && (
              <p className="text-xs text-green-400 mt-1.5">
                Économie de {annualSaving} € par rapport au mensuel
              </p>
            )}
          </div>

          {/* Promo code */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Code promo</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="ex: LAUNCH20"
                  className="pl-8 bg-white/[0.03] border-white/10 text-sm h-9"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyPromo() } }}
                  disabled={promoDiscount > 0}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 border-white/10 hover:border-violet-500/50 hover:text-violet-400"
                onClick={applyPromo}
                disabled={promoDiscount > 0}
              >
                {promoDiscount > 0 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                ) : 'Appliquer'}
              </Button>
            </div>
          </div>

          <Separator className="bg-white/8" />

          {/* Price breakdown */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Sous-total</span>
              <span>{basePrice} €{billing === 'annual' ? ' / an' : ' / mois'}</span>
            </div>
            {promoDiscount > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Réduction ({promoCode} -{promoDiscount}%)</span>
                <span>-{promoAmount} €</span>
              </div>
            )}
            {billing === 'annual' && (
              <div className="flex justify-between text-muted-foreground">
                <span>Soit {planData.annualPerMonth} € / mois</span>
                <span className="text-green-400">-20% vs mensuel</span>
              </div>
            )}
          </div>

          <div className="rounded-lg bg-white/[0.04] border border-white/10 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total dû aujourd&apos;hui</p>
              <p className="text-2xl font-bold mt-0.5">{total} €</p>
            </div>
            {billing === 'annual' && (
              <Badge variant="outline" className="bg-green-500/10 text-green-300 border-green-500/30">
                Annuel
              </Badge>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 h-11 text-base font-semibold"
          >
            {loading ? 'Redirection...' : `Souscrire — ${total} €`}
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>Commande sécurisée · Powered by Stripe</span>
          </div>
        </div>

        {/* ── RIGHT — Informations paiement ── */}
        <div className="rounded-xl border border-white/10 bg-card/60 p-6 space-y-5">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Informations de facturation</p>
            <p className="text-sm text-muted-foreground">{userEmail}</p>
          </div>

          {/* Name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Prénom</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jean"
                className="bg-white/[0.03] border-white/10 h-9 text-sm"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Nom</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Dupont"
                className="bg-white/[0.03] border-white/10 h-9 text-sm"
                required
              />
            </div>
          </div>

          {/* Business toggle */}
          <div>
            <button
              type="button"
              onClick={() => setIsBusiness(!isBusiness)}
              className={cn(
                'flex items-center gap-2.5 w-full rounded-lg border px-3.5 py-2.5 transition-colors text-sm',
                isBusiness
                  ? 'border-violet-500/40 bg-violet-500/[0.06] text-violet-300'
                  : 'border-white/10 bg-white/[0.02] text-muted-foreground hover:border-white/20 hover:text-white'
              )}
            >
              <Building2 className="h-4 w-4 flex-shrink-0" />
              <span>J&apos;achète en tant qu&apos;entreprise</span>
              <div className={cn(
                'ml-auto h-4 w-7 rounded-full transition-colors relative',
                isBusiness ? 'bg-violet-600' : 'bg-white/10'
              )}>
                <div className={cn(
                  'absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform',
                  isBusiness ? 'translate-x-3.5' : 'translate-x-0.5'
                )} />
              </div>
            </button>

            {isBusiness && (
              <div className="mt-3 space-y-1.5">
                <Label className="text-xs text-muted-foreground">SIRET / Numéro TVA</Label>
                <Input
                  value={siret}
                  onChange={(e) => setSiret(e.target.value)}
                  placeholder="FR 00 000 000 000 ou 123 456 789 00012"
                  className="bg-white/[0.03] border-white/10 h-9 text-sm"
                />
              </div>
            )}
          </div>

          {/* Country */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Pays</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="bg-white/[0.03] border-white/10 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Card element */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Numéro de carte</Label>
            <div className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2.5">
              {stripePromise ? (
                <CardElement options={CARD_STYLE} />
              ) : (
                <p className="text-xs text-muted-foreground py-1">
                  Saisissez vos informations carte sur la page Stripe sécurisée
                </p>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Le paiement est finalisé sur la page sécurisée Stripe.
            </p>
          </div>

          {/* Security */}
          <div className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/[0.02] px-3.5 py-3">
            <Shield className="h-4 w-4 text-violet-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium">Paiement 100% sécurisé</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Chiffrement SSL 256 bits · Certifié PCI DSS · Powered by Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

export function CheckoutForm(props: CheckoutFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutInner {...props} />
    </Elements>
  )
}
