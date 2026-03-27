'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/constants'
import type { Transaction } from '@/lib/types'
import { Search, Eye, Calendar } from 'lucide-react'

interface TransactionListProps {
  transactions: Transaction[]
  onViewDetail: (transaction: Transaction) => void
}

export function TransactionList({ transactions, onViewDetail }: TransactionListProps) {
  const [search, setSearch] = useState('')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')

  const filteredTransactions = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())

    return transactions.filter((transaction) => {
      // Search filter
      const searchMatch =
        transaction.id.toLowerCase().includes(search.toLowerCase()) ||
        transaction.cashierName.toLowerCase().includes(search.toLowerCase()) ||
        transaction.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        transaction.items.some((item) =>
          item.productName.toLowerCase().includes(search.toLowerCase())
        )

      // Payment method filter
      const paymentMatch =
        paymentFilter === 'all' || transaction.paymentMethod === paymentFilter

      // Date filter
      const transactionDate = new Date(transaction.createdAt)
      let dateMatch = true
      if (dateFilter === 'today') {
        dateMatch = transactionDate >= today
      } else if (dateFilter === 'week') {
        dateMatch = transactionDate >= weekAgo
      } else if (dateFilter === 'month') {
        dateMatch = transactionDate >= monthAgo
      }

      return searchMatch && paymentMatch && dateMatch
    })
  }, [transactions, search, paymentFilter, dateFilter])

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="credit">Credit</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-mono text-sm">
                    {transaction.id.split('-')[0]}
                  </TableCell>
                  <TableCell>
                    {new Date(transaction.createdAt).toLocaleString('en-PH', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px]">
                      <span className="text-sm">
                        {transaction.items.length} item(s)
                      </span>
                      <p className="truncate text-xs text-muted-foreground">
                        {transaction.items.map((i) => i.productName).join(', ')}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        transaction.paymentMethod === 'cash'
                          ? 'border-emerald-300 text-emerald-600'
                          : 'border-amber-300 text-amber-600'
                      }
                    >
                      {transaction.paymentMethod === 'cash' ? 'Cash' : 'Credit'}
                    </Badge>
                    {transaction.customerName && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {transaction.customerName}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(transaction.total)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onViewDetail(transaction)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
