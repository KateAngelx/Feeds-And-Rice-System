'use client'

import { useState, useMemo } from 'react'
import { TransactionList } from '@/components/history/transaction-list'
import { TransactionDetail } from '@/components/history/transaction-detail'
import { useTransactions } from '@/hooks/use-transactions'
import { Card, CardContent } from '@/components/ui/card'
import type { Transaction } from '@/lib/types'
import { Receipt, DollarSign, Wallet, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/constants'

export default function HistoryPage() {
  const { transactions, getTodaySales, getTodayTransactions } = useTransactions()
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  const todaySales = getTodaySales()
  const todayTransactions = getTodayTransactions()

  const stats = useMemo(() => {
    const totalSales = transactions.reduce((sum, t) => sum + t.total, 0)
    const cashSales = transactions
      .filter((t) => t.paymentMethod === 'cash')
      .reduce((sum, t) => sum + t.total, 0)
    const creditSales = transactions
      .filter((t) => t.paymentMethod === 'credit')
      .reduce((sum, t) => sum + t.total, 0)

    return {
      totalSales,
      cashSales,
      creditSales,
      totalTransactions: transactions.length,
    }
  }, [transactions])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sales History</h1>
        <p className="text-muted-foreground">View and manage past transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Today&apos;s Sales</p>
              <p className="text-lg font-bold text-emerald-600">{formatCurrency(todaySales)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Receipt className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Today&apos;s Transactions</p>
              <p className="text-lg font-bold">{todayTransactions.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Sales</p>
              <p className="text-lg font-bold">{formatCurrency(stats.totalSales)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <Wallet className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Credit Sales</p>
              <p className="text-lg font-bold text-amber-600">{formatCurrency(stats.creditSales)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 font-semibold">Sales Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  Cash Sales
                </span>
                <span className="font-medium">{formatCurrency(stats.cashSales)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  Credit Sales
                </span>
                <span className="font-medium">{formatCurrency(stats.creditSales)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(stats.totalSales)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 font-semibold">Transaction Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Transactions</span>
                <span className="font-medium">{stats.totalTransactions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cash Transactions</span>
                <span className="font-medium">
                  {transactions.filter((t) => t.paymentMethod === 'cash').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Credit Transactions</span>
                <span className="font-medium">
                  {transactions.filter((t) => t.paymentMethod === 'credit').length}
                </span>
              </div>
              {stats.totalTransactions > 0 && (
                <div className="border-t pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Average Transaction</span>
                    <span className="font-bold">
                      {formatCurrency(stats.totalSales / stats.totalTransactions)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction List */}
      <TransactionList
        transactions={transactions}
        onViewDetail={(transaction) => setSelectedTransaction(transaction)}
      />

      {/* Transaction Detail Modal */}
      <TransactionDetail
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
      />
    </div>
  )
}
