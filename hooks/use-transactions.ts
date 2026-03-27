'use client'

import useSWR from 'swr'
import { useCallback, useMemo } from 'react'

interface TransactionItem {
  productId: string
  productName: string
  quantity: number
  unit: string
  price: number
  priceType: 'retail' | 'wholesale'
  subtotal: number
}

interface Transaction {
  id: string
  items: TransactionItem[]
  subtotal: number
  discount: number
  total: number
  paymentMethod: 'cash' | 'credit'
  amountPaid: number
  change: number
  customerId?: string
  customerName?: string
  cashierId: string
  cashierName: string
  createdAt: string
  updatedAt: string
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

export function useTransactions() {
  const { data: rawTransactions, mutate: refreshTransactions, isLoading } = useSWR<Transaction[]>(
    '/api/transactions',
    fetcher,
    { revalidateOnFocus: false }
  )

  // Ensure transactions is always an array
  const transactions = useMemo(() => {
    if (Array.isArray(rawTransactions)) return rawTransactions
    return []
  }, [rawTransactions])

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      })
      const newTransaction = await response.json()
      await refreshTransactions()
      return newTransaction
    } catch (error) {
      console.error('Error adding transaction:', error)
      throw error
    }
  }, [refreshTransactions])

  const getTransaction = useCallback((id: string) => {
    return transactions.find(t => t.id === id)
  }, [transactions])

  const getTransactionsByDate = useCallback((startDate: Date, endDate: Date) => {
    return transactions.filter(t => {
      const date = new Date(t.createdAt)
      return date >= startDate && date <= endDate
    })
  }, [transactions])

  const getTransactionsByCustomer = useCallback((customerId: string) => {
    return transactions.filter(t => t.customerId === customerId)
  }, [transactions])

  const getTodayTransactions = useCallback(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return getTransactionsByDate(today, tomorrow)
  }, [getTransactionsByDate])

  const getTodaySales = useCallback(() => {
    const todayTx = getTodayTransactions()
    return todayTx.reduce((sum, t) => sum + t.total, 0)
  }, [getTodayTransactions])

  const getCashSales = useCallback(() => {
    return transactions.filter(t => t.paymentMethod === 'cash')
  }, [transactions])

  const getCreditSales = useCallback(() => {
    return transactions.filter(t => t.paymentMethod === 'credit')
  }, [transactions])

  return {
    transactions,
    refreshTransactions,
    addTransaction,
    getTransaction,
    getTransactionsByDate,
    getTransactionsByCustomer,
    getTodayTransactions,
    getTodaySales,
    getCashSales,
    getCreditSales,
    isLoaded: !isLoading,
  }
}
