'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field'
import { CATEGORIES, UNITS } from '@/lib/constants'
import type { Product } from '@/lib/types'

interface ProductFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void
  product?: Product | null
  currentUserId: string
  userRole: 'admin' | 'cashier'
}

export function ProductForm({ isOpen, onClose, onSubmit, product, currentUserId, userRole }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'feeds' as Product['category'],
    retailPrice: 0,
    wholesalePrice: 0,
    capitalPrice: 0,
    stock: 0,
    unit: 'sack',
    lowStockThreshold: 10,
    isApproved: false,
    createdBy: '',
    approvedBy: undefined as string | undefined,
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        retailPrice: product.retailPrice,
        wholesalePrice: product.wholesalePrice,
        capitalPrice: product.capitalPrice,
        stock: product.stock,
        unit: product.unit,
        lowStockThreshold: product.lowStockThreshold,
        isApproved: product.isApproved,
        createdBy: product.createdBy,
        approvedBy: product.approvedBy,
      })
    } else {
      setFormData({
        name: '',
        category: 'feeds',
        retailPrice: 0,
        wholesalePrice: 0,
        capitalPrice: 0,
        stock: 0,
        unit: 'sack',
        lowStockThreshold: 10,
        // If admin, auto-approve. If cashier, needs approval
        isApproved: userRole === 'admin',
        createdBy: currentUserId,
        approvedBy: userRole === 'admin' ? currentUserId : undefined,
      })
    }
  }, [product, isOpen, currentUserId, userRole])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Product Name</FieldLabel>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter product name"
                required
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="category">Category</FieldLabel>
                <Select
                  value={formData.category}
                  onValueChange={(value: Product['category']) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="unit">Unit</FieldLabel>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, unit: value }))}
                >
                  <SelectTrigger id="unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Field>
                <FieldLabel htmlFor="capitalPrice">Capital (PHP)</FieldLabel>
                <Input
                  id="capitalPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.capitalPrice || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, capitalPrice: Number(e.target.value) || 0 }))
                  }
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="wholesalePrice">Wholesale (PHP)</FieldLabel>
                <Input
                  id="wholesalePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.wholesalePrice || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, wholesalePrice: Number(e.target.value) || 0 }))
                  }
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="retailPrice">Retail (PHP)</FieldLabel>
                <Input
                  id="retailPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.retailPrice || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, retailPrice: Number(e.target.value) || 0 }))
                  }
                  required
                />
              </Field>
            </div>

            {/* Profit calculation display */}
            {(formData.capitalPrice > 0 && (formData.retailPrice > 0 || formData.wholesalePrice > 0)) && (
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="font-medium mb-1">Profit Calculation:</p>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                  <span>Retail Profit:</span>
                  <span className={formData.retailPrice - formData.capitalPrice >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                    PHP {(formData.retailPrice - formData.capitalPrice).toFixed(2)}
                  </span>
                  <span>Wholesale Profit:</span>
                  <span className={formData.wholesalePrice - formData.capitalPrice >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                    PHP {(formData.wholesalePrice - formData.capitalPrice).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="stock">Current Stock</FieldLabel>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.stock || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, stock: Number(e.target.value) || 0 }))
                  }
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="threshold">Low Stock Alert</FieldLabel>
                <Input
                  id="threshold"
                  type="number"
                  min="0"
                  value={formData.lowStockThreshold || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lowStockThreshold: Number(e.target.value) || 0,
                    }))
                  }
                />
              </Field>
            </div>

            {userRole === 'cashier' && !product && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                Note: Products added by cashiers require admin approval before they can be sold.
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700">
                {product ? 'Update Product' : 'Add Product'}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
