'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/constants'
import type { CartItem } from '@/lib/types'
import { Trash2, ShoppingCart, Edit2 } from 'lucide-react'

interface CartProps {
  items: CartItem[]
  discount: number
  subtotal: number
  total: number
  onUpdateQuantity: (productId: string, quantity: number, priceType?: 'retail' | 'wholesale') => void
  onRemoveItem: (productId: string, priceType?: 'retail' | 'wholesale') => void
  onDiscountChange: (discount: number) => void
  onCheckout: () => void
  onClearCart: () => void
  getItemPrice: (item: CartItem) => number
}

export function Cart({
  items,
  discount,
  subtotal,
  total,
  onUpdateQuantity,
  onRemoveItem,
  onDiscountChange,
  onCheckout,
  onClearCart,
  getItemPrice,
}: CartProps) {
  const [editingItem, setEditingItem] = useState<CartItem | null>(null)
  const [editQuantity, setEditQuantity] = useState('')

  const handleEditQuantity = (item: CartItem) => {
    setEditingItem(item)
    setEditQuantity(item.quantity.toString())
  }

  const handleSaveQuantity = () => {
    if (!editingItem) return
    const qty = parseFloat(editQuantity) || 0
    if (qty > 0 && qty <= editingItem.product.stock) {
      onUpdateQuantity(editingItem.product.id, qty, editingItem.priceType)
    }
    setEditingItem(null)
    setEditQuantity('')
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Cart
            {items.length > 0 && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-normal text-emerald-700">
                {items.length}
              </span>
            )}
          </CardTitle>
          {items.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearCart} className="text-muted-foreground hover:text-destructive">
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col overflow-hidden">
        {/* Cart Items */}
        <div className="flex-1 overflow-auto">
          {items.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center text-muted-foreground">
              <ShoppingCart className="mb-2 h-8 w-8" />
              <p className="text-sm">Cart is empty</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => {
                const price = getItemPrice(item)
                return (
                  <div key={`${item.product.id}-${item.priceType}-${index}`} className="rounded-lg border p-3">
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">{item.product.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="outline" 
                            className={item.priceType === 'wholesale' ? 'border-blue-500 text-blue-600' : 'border-emerald-500 text-emerald-600'}
                          >
                            {item.priceType === 'wholesale' ? 'Wholesale' : 'Retail'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatCurrency(price)} / {item.product.unit}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => onRemoveItem(item.product.id, item.priceType)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 gap-1 px-2"
                          onClick={() => handleEditQuantity(item)}
                        >
                          <Edit2 className="h-3 w-3" />
                          {item.quantity} {item.product.unit}
                        </Button>
                      </div>
                      <p className="font-semibold text-emerald-600">
                        {formatCurrency(price * item.quantity)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Totals */}
        {items.length > 0 && (
          <div className="mt-4 space-y-3">
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Discount</span>
              <div className="flex-1">
                <Input
                  type="number"
                  min="0"
                  max={subtotal}
                  value={discount || ''}
                  onChange={(e) => onDiscountChange(Number(e.target.value) || 0)}
                  placeholder="0.00"
                  className="h-8 text-right text-sm"
                />
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-emerald-600">{formatCurrency(total)}</span>
            </div>
            <Button
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
              size="lg"
              onClick={onCheckout}
            >
              Proceed to Payment
            </Button>
          </div>
        )}
      </CardContent>

      {/* Edit Quantity Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Edit Quantity</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div>
                <p className="font-medium">{editingItem.product.name}</p>
                <p className="text-sm text-muted-foreground">
                  Max: {editingItem.product.stock} {editingItem.product.unit}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Quantity ({editingItem.product.unit})</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  min="0.1"
                  max={editingItem.product.stock}
                  step={editingItem.product.unit === 'kg' ? '0.1' : '1'}
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveQuantity}
              disabled={
                !editQuantity ||
                parseFloat(editQuantity) <= 0 ||
                parseFloat(editQuantity) > (editingItem?.product.stock || 0)
              }
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
