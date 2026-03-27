'use client'

import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Receipt } from '@/components/pos/receipt'
import { formatCurrency } from '@/lib/constants'
import type { Transaction } from '@/lib/types'
import { Printer } from 'lucide-react'

interface TransactionDetailProps {
  isOpen: boolean
  onClose: () => void
  transaction: Transaction | null
}

export function TransactionDetail({ isOpen, onClose, transaction }: TransactionDetailProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt-${transaction?.id || 'unknown'}`,
  })

  if (!transaction) return null

  const formattedDate = new Date(transaction.createdAt).toLocaleString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header Info */}
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Transaction ID</span>
              <span className="font-mono text-sm">{transaction.id.split('-')[0]}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Date</span>
              <span className="text-sm">{formattedDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cashier</span>
              <span className="text-sm">{transaction.cashierName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Payment Method</span>
              <Badge
                variant="outline"
                className={
                  transaction.paymentMethod === 'cash'
                    ? 'border-emerald-300 text-emerald-600'
                    : 'border-amber-300 text-amber-600'
                }
              >
                {transaction.paymentMethod === 'cash' ? 'Cash' : 'Credit (Utang)'}
              </Badge>
            </div>
            {transaction.customerName && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Customer</span>
                <span className="text-sm">{transaction.customerName}</span>
              </div>
            )}
          </div>

          {/* Items */}
          <div>
            <h4 className="mb-2 font-medium">Items</h4>
            <div className="space-y-2">
              {transaction.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{item.productName}</span>
                    <span className="ml-2 text-muted-foreground">
                      x {item.quantity} {item.unit}
                    </span>
                    {item.priceType && (
                      <Badge variant="outline" className="ml-2 text-xs capitalize">
                        {item.priceType}
                      </Badge>
                    )}
                  </div>
                  <span>{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(transaction.subtotal)}</span>
            </div>
            {transaction.discount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-destructive">-{formatCurrency(transaction.discount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-emerald-600">{formatCurrency(transaction.total)}</span>
            </div>
            {transaction.paymentMethod === 'cash' && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span>{formatCurrency(transaction.amountPaid)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Change</span>
                  <span>{formatCurrency(transaction.change)}</span>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Close
            </Button>
            <Button
              className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => handlePrint()}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Receipt
            </Button>
          </div>
        </div>

        {/* Hidden Receipt for Printing */}
        <div className="hidden">
          <Receipt ref={receiptRef} transaction={transaction} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
