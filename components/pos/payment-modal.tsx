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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/constants'
import type { Customer, CartItem } from '@/lib/types'
import { Banknote, CreditCard, Wallet } from 'lucide-react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  subtotal: number
  discount: number
  total: number
  customers: Customer[]
  onComplete: (
    paymentMethod: 'cash' | 'credit',
    amountPaid: number,
    customerId?: string
  ) => void
  getItemPrice: (item: CartItem) => number
}

const quickAmounts = [50, 100, 200, 500, 1000, 2000, 5000]

export function PaymentModal({
  isOpen,
  onClose,
  items,
  subtotal,
  discount,
  total,
  customers,
  onComplete,
  getItemPrice,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit'>('cash')
  const [amountPaid, setAmountPaid] = useState<number>(total)
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')

  const change = amountPaid - total

  const handleComplete = () => {
    if (paymentMethod === 'cash' && amountPaid < total) {
      return
    }
    if (paymentMethod === 'credit' && !selectedCustomer) {
      return
    }
    onComplete(
      paymentMethod,
      paymentMethod === 'cash' ? amountPaid : 0,
      paymentMethod === 'credit' ? selectedCustomer : undefined
    )
    // Reset
    setAmountPaid(total)
    setSelectedCustomer('')
    setPaymentMethod('cash')
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
      setAmountPaid(total)
      setSelectedCustomer('')
      setPaymentMethod('cash')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Payment</DialogTitle>
        </DialogHeader>

        {/* Order Summary */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <h4 className="mb-2 text-sm font-medium">Order Summary</h4>
          <div className="max-h-32 space-y-1 overflow-auto text-sm">
            {items.map((item, index) => {
              const price = getItemPrice(item)
              return (
                <div key={`${item.product.id}-${item.priceType}-${index}`} className="flex justify-between">
                  <span className="text-muted-foreground">
                    {item.product.name} x {item.quantity} ({item.priceType})
                  </span>
                  <span>{formatCurrency(price * item.quantity)}</span>
                </div>
              )
            })}
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-destructive">-{formatCurrency(discount)}</span>
            </div>
          )}
          <div className="mt-2 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-emerald-600">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Payment Method Tabs */}
        <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'cash' | 'credit')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cash" className="flex items-center gap-2">
              <Banknote className="h-4 w-4" />
              Cash
            </TabsTrigger>
            <TabsTrigger value="credit" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Credit (Utang)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cash" className="space-y-4">
            <Field>
              <FieldLabel>Amount Received</FieldLabel>
              <Input
                type="number"
                min={0}
                value={amountPaid || ''}
                onChange={(e) => setAmountPaid(Number(e.target.value) || 0)}
                className="text-right text-lg font-semibold"
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmountPaid(amount)}
                  className="flex-1"
                >
                  {formatCurrency(amount)}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setAmountPaid(total)}
            >
              Exact Amount ({formatCurrency(total)})
            </Button>
            {amountPaid >= total && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center">
                <p className="text-sm text-emerald-700">Change</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(change)}
                </p>
              </div>
            )}
            {amountPaid < total && amountPaid > 0 && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
                <p className="text-sm text-destructive">Insufficient Amount</p>
                <p className="text-lg font-semibold text-destructive">
                  Need {formatCurrency(total - amountPaid)} more
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="credit" className="space-y-4">
            <Field>
              <FieldLabel>Select Customer</FieldLabel>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      <div className="flex items-center justify-between">
                        <span>{customer.name}</span>
                        {customer.creditBalance > 0 && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (Current: {formatCurrency(customer.creditBalance)})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            {selectedCustomer && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700">
                    Credit Sale (Utang)
                  </span>
                </div>
                <p className="mt-1 text-sm text-amber-600">
                  {formatCurrency(total)} will be added to customer&apos;s credit balance.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={handleComplete}
            disabled={
              (paymentMethod === 'cash' && amountPaid < total) ||
              (paymentMethod === 'credit' && !selectedCustomer)
            }
          >
            Complete Sale
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
