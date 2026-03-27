'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { formatCurrency, CATEGORIES } from '@/lib/constants'
import type { Product } from '@/lib/types'
import { Search, Package, AlertTriangle, Scale } from 'lucide-react'

interface ProductGridProps {
  products: Product[]
  onSelectProduct: (product: Product, quantity: number, priceType: 'retail' | 'wholesale') => void
  userRole?: 'admin' | 'cashier'
}

export function ProductGrid({ products, onSelectProduct, userRole = 'cashier' }: ProductGridProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState<string>('1')
  const [priceType, setPriceType] = useState<'retail' | 'wholesale'>('retail')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Only show approved products (cashiers can only sell approved products)
  const approvedProducts = useMemo(() => {
    return products.filter((p) => p.isApproved)
  }, [products])

  const filteredProducts = useMemo(() => {
    return approvedProducts.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = !selectedCategory || product.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [approvedProducts, search, selectedCategory])

  const handleProductClick = (product: Product) => {
    if (product.stock === 0) return
    setSelectedProduct(product)
    setQuantity('1')
    setPriceType('retail')
    setIsDialogOpen(true)
  }

  const handleAddToCart = () => {
    if (!selectedProduct) return
    const qty = parseFloat(quantity) || 0
    if (qty <= 0 || qty > selectedProduct.stock) return
    onSelectProduct(selectedProduct, qty, priceType)
    setIsDialogOpen(false)
    setSelectedProduct(null)
    setQuantity('1')
  }

  const getDisplayPrice = (product: Product) => {
    return product.retailPrice
  }

  return (
    <div className="flex h-full flex-col">
      {/* Search and Filter */}
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className={cn(
              selectedCategory === null && 'bg-emerald-600 hover:bg-emerald-700 text-white'
            )}
          >
            All
          </Button>
          {CATEGORIES.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
              className={cn(
                selectedCategory === category.value && 'bg-emerald-600 hover:bg-emerald-700 text-white'
              )}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-auto">
        {filteredProducts.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-muted-foreground">
            <Package className="mb-2 h-8 w-8" />
            <p>No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => {
              const isLowStock = product.stock <= product.lowStockThreshold
              const isOutOfStock = product.stock === 0

              return (
                <Card
                  key={product.id}
                  className={cn(
                    'relative cursor-pointer p-3 transition-all hover:shadow-md',
                    isOutOfStock && 'opacity-50 cursor-not-allowed',
                    !isOutOfStock && 'hover:border-emerald-300'
                  )}
                  onClick={() => handleProductClick(product)}
                >
                  {isLowStock && !isOutOfStock && (
                    <div className="absolute -right-1 -top-1">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </div>
                  )}
                  <div className="mb-2">
                    <Badge
                      variant="secondary"
                      className={cn(
                        'text-xs capitalize',
                        product.category === 'feeds' && 'bg-emerald-100 text-emerald-700',
                        product.category === 'rice' && 'bg-amber-100 text-amber-700'
                      )}
                    >
                      {product.category === 'feeds' ? 'Pig Feeds' : 'Rice'}
                    </Badge>
                  </div>
                  <h3 className="mb-1 line-clamp-2 text-sm font-medium">{product.name}</h3>
                  <div className="space-y-0.5">
                    <p className="text-lg font-bold text-emerald-600">
                      {formatCurrency(getDisplayPrice(product))}
                      <span className="text-xs font-normal text-muted-foreground">/{product.unit}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Wholesale: {formatCurrency(product.wholesalePrice)}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Stock: {product.stock} {product.unit}
                    {isOutOfStock && <span className="ml-1 text-destructive">(Out)</span>}
                  </p>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Add to Cart Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add to Cart</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{selectedProduct.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Available stock: {selectedProduct.stock} {selectedProduct.unit}
                </p>
              </div>

              {/* Price Type Selection */}
              <div className="space-y-2">
                <Label>Price Type</Label>
                <RadioGroup
                  value={priceType}
                  onValueChange={(value) => setPriceType(value as 'retail' | 'wholesale')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="retail" id="retail" />
                    <Label htmlFor="retail" className="cursor-pointer">
                      Retail ({formatCurrency(selectedProduct.retailPrice)}/{selectedProduct.unit})
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="wholesale" id="wholesale" />
                    <Label htmlFor="wholesale" className="cursor-pointer">
                      Wholesale ({formatCurrency(selectedProduct.wholesalePrice)}/{selectedProduct.unit})
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Quantity Input */}
              <div className="space-y-2">
                <Label htmlFor="quantity" className="flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  Quantity ({selectedProduct.unit})
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0.1"
                  max={selectedProduct.stock}
                  step={selectedProduct.unit === 'kg' ? '0.1' : '1'}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder={`Enter ${selectedProduct.unit}`}
                />
                {selectedProduct.unit === 'kg' && (
                  <p className="text-xs text-muted-foreground">
                    You can enter decimal values for kilos (e.g., 2.5 kg)
                  </p>
                )}
              </div>

              {/* Total Preview */}
              <div className="rounded-lg bg-muted p-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unit Price:</span>
                  <span>
                    {formatCurrency(priceType === 'wholesale' ? selectedProduct.wholesalePrice : selectedProduct.retailPrice)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-emerald-600">
                  <span>Total:</span>
                  <span>
                    {formatCurrency(
                      (parseFloat(quantity) || 0) *
                        (priceType === 'wholesale' ? selectedProduct.wholesalePrice : selectedProduct.retailPrice)
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddToCart}
              disabled={!quantity || parseFloat(quantity) <= 0 || parseFloat(quantity) > (selectedProduct?.stock || 0)}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Add to Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
