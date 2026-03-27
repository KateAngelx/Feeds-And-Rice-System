'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { ProductList } from '@/components/inventory/product-list'
import { ProductForm } from '@/components/inventory/product-form'
import { StockAdjustModal } from '@/components/inventory/stock-adjust-modal'
import { useProducts } from '@/hooks/use-products'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/lib/types'
import { Package, AlertTriangle, Boxes, TrendingUp, Clock } from 'lucide-react'
import { formatCurrency } from '@/lib/constants'

export default function InventoryPage() {
  const { user } = useAuth()
  const { 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    adjustStock, 
    approveProduct,
    rejectProduct,
    getLowStockProducts,
    getApprovedProducts,
    getPendingProducts,
  } = useProducts()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null)

  // Use useMemo to ensure stats stay in sync with the current product state
   const lowStockProducts = getLowStockProducts()
  const approvedProducts = getApprovedProducts()
  const pendingProducts = getPendingProducts()

  const totalValue = approvedProducts.reduce((sum, p) => sum + p.capitalPrice * p.stock, 0)
  const totalItems = approvedProducts.reduce((sum, p) => sum + p.stock, 0)


  const handleAdd = () => {
    setEditingProduct(null)
    setIsFormOpen(true)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsFormOpen(true)
  }

  const handleSubmit = async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, data)
        toast.success('Product updated', {
          description: `${data.name} has been updated.`,
        })
      } else {
        // FIX: Ensure isApproved is set correctly based on role
        const isApproved = user?.role === 'admin'
        
        // Ensure we await the actual database creation
        await addProduct({
          ...data,
          isApproved,
          createdBy: user?.id || 'system'
        })

        toast.success(isApproved ? 'Product added to inventory' : 'Product submitted for admin review')
      }
      setIsFormOpen(false)
      setEditingProduct(null)
    } catch (error: any) {
      toast.error('Failed to save product', {
        description: error.message || 'Check your database connection.'
      })
    }
  }

  const handleDelete = async (productId: string) => {
    try {
      await deleteProduct(productId)
      toast.success('Product removed from inventory')
    } catch (error) {
      toast.error('Failed to delete product')
    }
  }

  const handleApprove = async (productId: string) => {
    if (!user) return
    try {
      await approveProduct(productId, user.id)
      toast.success('Product approved and live')
    } catch (error) {
      toast.error('Approval failed')
    }
  }

  const handleReject = async (productId: string) => {
    try {
      await rejectProduct(productId)
      toast.success('Product rejected and removed')
    } catch (error) {
      toast.error('Rejection failed')
    }
  }

  const handleAdjustStock = async (productId: string, quantity: number) => {
    try {
      await adjustStock(productId, quantity)
      toast.success('Stock levels adjusted')
    } catch (error) {
      toast.error('Failed to adjust stock')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Manage your products and stock levels</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="bg-emerald-100 flex h-10 w-10 items-center justify-center rounded-lg">
              <Package className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Products</p>
              <p className="text-lg font-bold">{approvedProducts.length}</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Total Stock */}
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="bg-blue-100 flex h-10 w-10 items-center justify-center rounded-lg">
              <Boxes className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Items</p>
              <p className="text-lg font-bold">{totalItems.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Capital Value */}
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="bg-purple-100 flex h-10 w-10 items-center justify-center rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Capital Value</p>
              <p className="text-lg font-bold">{formatCurrency(totalValue)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="bg-amber-100 flex h-10 w-10 items-center justify-center rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Low Stock</p>
              <p className="text-lg font-bold text-amber-600">{lowStockProducts.length}</p>
            </div>
          </CardContent>
        </Card>

        {user?.role === 'admin' && (
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="bg-orange-100 flex h-10 w-10 items-center justify-center rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-lg font-bold text-orange-600">{pendingProducts.length}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Low Stock Alert Banner */}
      {lowStockProducts.length > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-semibold">Low Stock Alert</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {lowStockProducts.map((p) => (
                <Badge key={p.id} variant="outline" className="border-amber-300 bg-white text-amber-700">
                  {p.name}: {p.stock} left
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <ProductList
        products={products} 
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdjustStock={(product) => setAdjustingProduct(product)}
        onApprove={handleApprove}
        onReject={handleReject}
        userRole={user?.role || 'cashier'}
      />

      <ProductForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingProduct(null)
        }}
        onSubmit={handleSubmit}
        product={editingProduct}
        currentUserId={user?.id || ''}
        userRole={user?.role || 'cashier'}
      />

      <StockAdjustModal
        isOpen={!!adjustingProduct}
        onClose={() => setAdjustingProduct(null)}
        product={adjustingProduct}
        onAdjust={handleAdjustStock}
      />
    </div>
  )
}