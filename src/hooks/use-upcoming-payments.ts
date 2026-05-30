'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UpcomingPaymentsResult {
  total: number
  count: number
}

export function useUpcomingPayments(infopreneurId: string): UpcomingPaymentsResult {
  const [result, setResult] = useState<UpcomingPaymentsResult>({ total: 0, count: 0 })

  useEffect(() => {
    const supabase = createClient()

    async function fetchTotal() {
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString().split('T')[0]
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString().split('T')[0]

      console.log('infopreneurId:', infopreneurId)
      console.log('monthStart:', monthStart)
      console.log('monthEnd:', monthEnd)

      const { data, error } = await supabase
        .from('payments')
        .select('*, clients(full_name, id)')
        .eq('infopreneur_id', infopreneurId)
        .eq('status', 'pending')
        .gte('next_payment_date', monthStart)
        .lte('next_payment_date', monthEnd)
        .order('next_payment_date', { ascending: true })

      console.log('payments result:', data, error)

      const list = data ?? []
      setResult({
        total: list.reduce((s, p) => s + Number(p.amount), 0),
        count: list.length,
      })
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

  return result
}
