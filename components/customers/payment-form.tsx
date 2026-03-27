'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field'
import { formatCurrency } from '@/lib/constants'
import type { Customer } from '@/lib/types'

interface PaymentFormProps {
  isOpen: boolean
  onClose: () => void
  customer: Customer | null
  onSubmit: (amount: number, notes: string) => void
}

const quickAmounts = [100, 500, 1000, 2000, 5000]

export function PaymentForm({ isOpen, onClose, customer, onSubmit }: PaymentFormProps) {
  const [amount, setAmount] = useState(0)
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customer || amount <= 0) return
    onSubmit(amount, notes)
    setAmount(0)
    setNotes('')
    onClose()
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setAmount(0)
      setNotes('')
      onClose()
    }
  }

  if (!customer) return null

  const remainingBalance = Math.max(0, customer.creditBalance - amount)

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/30 p-4">
          <h4 className="font-medium">{customer.name}</h4>
          <p className="text-sm text-muted-foreground">
            Current Balance: <span className="font-semibold text-amber-600">{formatCurrency(customer.creditBalance)}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel>Payment Amount</FieldLabel>
              <Input
                type="number"
                min="1"
                max={customer.creditBalance}
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                placeholder="Enter payment amount"
                className="text-lg"
              />
            </Field>

            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(Math.min(quickAmount, customer.creditBalance))}
                >
                  {formatCurrency(quickAmount)}
                </Button>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount(customer.creditBalance)}
              >
                Full ({formatCurrency(customer.creditBalance)})
              </Button>
            </div>

            <Field>
              <FieldLabel>Notes (Optional)</FieldLabel>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Partial payment via GCash"
                rows={2}
              />
            </Field>

            {amount > 0 && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-emerald-700">Remaining Balance:</span>
                  <span className="font-semibold text-emerald-700">
                    {formatCurrency(remainingBalance)}
                  </span>
                </div>
                {remainingBalance === 0 && (
                  <p className="mt-1 text-sm text-emerald-600">
                    This will fully settle the credit balance.
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
                disabled={amount <= 0 || amount > customer.creditBalance}
              >
                Record Payment
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
