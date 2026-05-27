import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Abonnement activé !</h1>
          <p className="text-muted-foreground mt-2">
            Bienvenue dans INFOPULSE. Ton abonnement est maintenant actif et toutes les
            fonctionnalités sont débloquées.
          </p>
        </div>
        <Button asChild className="bg-violet-600 hover:bg-violet-700 w-full">
          <Link href="/dashboard">Accéder au dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
