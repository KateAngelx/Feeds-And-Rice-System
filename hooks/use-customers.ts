'use client'

import useSWR from 'swr'
import { useCallback, useMemo } from 'react'

interface Customer {
  id: string
  name: string
  phone?: string
  address?: string
  creditBalance: number
  createdAt: string
  updatedAt: string
}

interface CreditRecord {
  id: string
  customerId: string
  customerName: string
  transactionId?: string
  amount: number
  type: string // 'credit' or 'payment'
  notes?: string
  createdAt: string
  recordedBy: string
}

const fetcher = (url: string) => 
  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      return res.json()
    })
    .catch(err => {
      console.error('[v0] Fetch error:', err)
      return []
    })

export function useCustomers() {
  const { data: rawCustomers, mutate: refreshCustomers, isLoading } = useSWR<Customer[]>(
    '/api/customers',
    fetcher,
    { revalidateOnFocus: false }
  )

  // Ensure customers is always an array
  const customers = useMemo(() => {
    if (Array.isArray(rawCustomers)) return rawCustomers
    return []
  }, [rawCustomers])

  const addCustomer = useCallback(async (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer),
      })
      const newCustomer = await response.json()
      await refreshCustomers()
      return newCustomer
    } catch (error) {
      console.error('Error adding customer:', error)
      throw error
    }
  }, [refreshCustomers])

  const updateCustomer = useCallback(async (id: string, updates: Partial<Customer>) => {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const updated = await response.json()
      await refreshCustomers()
      return updated
    } catch (error) {
      console.error('Error updating customer:', error)
      throw error
    }
  }, [refreshCustomers])

  const deleteCustomer = useCallback(async (id: string) => {
    try {
      await fetch(`/api/customers/${id}`, { method: 'DELETE' })
      await refreshCustomers()
    } catch (error) {
      console.error('Error deleting customer:', error)
      throw error
    }
  }, [refreshCustomers])

  const getCustomer = useCallback((id: string) => {
    return customers.find(c => c.id === id)
  }, [customers])

  const recordCreditTransaction = useCallback(async (customerId: string, customerName: string, amount: number, type: 'credit' | 'payment', userId: string, notes?: string) => {
    try {
      const response = await fetch('/api/credit-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          customerName,
          amount,
          type,
          notes,
          recordedBy: userId,
        }),
      })
      const record = await response.json()
      await refreshCustomers()
      return record
    } catch (error) {
      console.error('Error recording credit transaction:', error)
      throw error
    }
  }, [refreshCustomers])

  const getCustomersWithCredit = useCallback(() => {
    return customers.filter(c => c.creditBalance > 0)
  }, [customers])

  return {
    customers,
    refreshCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomer,
    recordCreditTransaction,
    getCustomersWithCredit,
    isLoaded: !isLoading,
  }
}
