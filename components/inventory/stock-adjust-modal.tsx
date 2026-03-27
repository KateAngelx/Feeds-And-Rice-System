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
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/constants'
import type { Product } from '@/lib/types'
import { Plus, Minus } from 'lucide-react'

interface StockAdjustModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  onAdjust: (productId: string, quantity: number) => void
}

export function StockAdjustModal({ isOpen, onClose, product, onAdjust }: StockAdjustModalProps) {
  const [quantity, setQuantity] = useState(0)
  const [adjustType, setAdjustType] = useState<'add' | 'remove'>('add')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!product || quantity <= 0) return

    const adjustAmount = adjustType === 'add' ? quantity : -quantity
    onAdjust(product.id, adjustAmount)
    setQuantity(0)
    setAdjustType('add')
    onClose()
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setQuantity(0)
      setAdjustType('add')
      onClose()
    }
  }

  if (!product) return null

  const newStock = adjustType === 'add' 
    ? product.stock + quantity 
    : Math.max(0, product.stock - quantity)

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/30 p-4">
          <h4 className="font-medium">{product.name}</h4>
          <p className="text-sm text-muted-foreground">
            Current Stock: {product.stock} {product.unit}
          </p>
          <p className="text-sm text-muted-foreground">
            Price: {formatCurrency(product.price)}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Tabs value={adjustType} onValueChange={(v) => setAdjustType(v as 'add' | 'remove')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="add" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Stock
                </TabsTrigger>
                <TabsTrigger value="remove" className="flex items-center gap-2">
                  <Minus className="h-4 w-4" />
                  Remove Stock
                </TabsTrigger>
              </TabsList>

              <TabsContent value="add">
                <Field>
                  <FieldLabel>Quantity to Add</FieldLabel>
                  <Input
                    type="number"
                    min="1"
                    value={quantity || ''}
                    onChange={(e) => setQuantity(Number(e.target.value) || 0)}
                    placeholder={`Enter quantity in ${product.unit}`}
                  />
                </Field>
              </TabsContent>

              <TabsContent value="remove">
                <Field>
                  <FieldLabel>Quantity to Remove</FieldLabel>
                  <Input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity || ''}
                    onChange={(e) => setQuantity(Number(e.target.value) || 0)}
                    placeholder={`Enter quantity in ${product.unit}`}
                  />
                </Field>
              </TabsContent>
            </Tabs>

            {quantity > 0 && (
              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">New Stock:</span>
                  <span className="font-semibold">
                    {newStock} {product.unit}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
                disabled={quantity <= 0}
              >
                Confirm Adjustment
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
