'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useUpcomingPayments(infopreneurId: string): number {
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const supabase = createClient()

    async function fetchTotal() {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString().split('T')[0]
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString().split('T')[0]

      const { data: clients } = await supabase
        .from('clients')
        .select('id')
        .eq('infopreneur_id', infopreneurId)

      const clientIds = (clients ?? []).map((c: { id: string }) => c.id)
      if (clientIds.length === 0) {
        setTotal(0)
        return
      }

      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .in('client_id', clientIds)
        .in('status', ['pending', 'a_relancer'])
        .gte('payment_date', startOfMonth)
        .lte('payment_date', endOfMonth)

      setTotal((payments ?? []).reduce((s, p) => s + Number(p.amount), 0))
    }

    fetchTotal()

    const channel = supabase
      .channel(`upcoming-payments-${infopreneurId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'payments' }, fetchTotal)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'payments' }, fetchTotal)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'payments' }, fetchTotal)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [infopreneurId])

  return total
}
