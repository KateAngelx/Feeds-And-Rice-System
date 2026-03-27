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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { formatCurrency, CATEGORIES } from '@/lib/constants'
import type { Product } from '@/lib/types'
import { Search, Plus, MoreHorizontal, Pencil, Trash2, PackagePlus, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'

interface ProductListProps {
  products: Product[]
  onAdd: () => void
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
  onAdjustStock: (product: Product) => void
  onApprove?: (productId: string) => void
  onReject?: (productId: string) => void
  userRole: 'admin' | 'cashier'
}

export function ProductList({
  products,
  onAdd,
  onEdit,
  onDelete,
  onAdjustStock,
  onApprove,
  onReject,
  userRole,
}: ProductListProps) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)
  const [activeTab, setActiveTab] = useState<string>('approved')

  const approvedProducts = useMemo(() => products.filter(p => p.isApproved), [products])
  const pendingProducts = useMemo(() => products.filter(p => !p.isApproved), [products])

  const filteredProducts = useMemo(() => {
    const sourceProducts = activeTab === 'approved' ? approvedProducts : pendingProducts
    return sourceProducts.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [approvedProducts, pendingProducts, activeTab, search, categoryFilter])

  const handleDelete = () => {
    if (deleteProduct) {
      onDelete(deleteProduct.id)
      setDeleteProduct(null)
    }
  }

  const renderProductTable = (productList: Product[], showApprovalActions = false) => (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Capital</TableHead>
            <TableHead className="text-right">Wholesale</TableHead>
            <TableHead className="text-right">Retail</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                No products found
              </TableCell>
            </TableRow>
          ) : (
            productList.map((product) => {
              const isLowStock = product.stock <= product.lowStockThreshold
              const isOutOfStock = product.stock === 0

              return (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(
                        'capitalize',
                        product.category === 'feeds' && 'bg-emerald-100 text-emerald-700',
                        product.category === 'rice' && 'bg-amber-100 text-amber-700'
                      )}
                    >
                      {product.category === 'feeds' ? 'Pig Feeds' : 'Rice'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(product.capitalPrice)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(product.wholesalePrice)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(product.retailPrice)}
                  </TableCell>
                  <TableCell className="text-right">
                    {product.stock} {product.unit}
                  </TableCell>
                  <TableCell className="text-center">
                    {!product.isApproved ? (
                      <Badge variant="outline" className="border-amber-300 text-amber-600">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending
                      </Badge>
                    ) : isOutOfStock ? (
                      <Badge variant="destructive">Out of Stock</Badge>
                    ) : isLowStock ? (
                      <Badge variant="outline" className="border-amber-300 text-amber-600">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Low Stock
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-emerald-300 text-emerald-600">
                        In Stock
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {showApprovalActions && userRole === 'admin' ? (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          onClick={() => onApprove?.(product.id)}
                          title="Approve"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => onReject?.(product.id)}
                          title="Reject"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(product)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {product.isApproved && (
                            <DropdownMenuItem onClick={() => onAdjustStock(product)}>
                              <PackagePlus className="mr-2 h-4 w-4" />
                              Adjust Stock
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => setDeleteProduct(product)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onAdd} className="bg-emerald-600 text-white hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Tabs for Admin to see pending approvals */}
      {userRole === 'admin' ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="approved">
              Approved Products ({approvedProducts.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              Pending Approval ({pendingProducts.length})
              {pendingProducts.length > 0 && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-500" />
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="approved" className="mt-4">
            {renderProductTable(filteredProducts, false)}
          </TabsContent>
          <TabsContent value="pending" className="mt-4">
            {renderProductTable(filteredProducts, true)}
          </TabsContent>
        </Tabs>
      ) : (
        renderProductTable(filteredProducts, false)
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteProduct?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
