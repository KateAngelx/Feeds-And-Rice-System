'use client'

import { POSTerminal } from '@/components/pos/pos-terminal'
import { useProducts } from '@/hooks/use-products'
import { useTransactions } from '@/hooks/use-transactions'
import { formatCurrency } from '@/lib/constants'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, ShoppingBag, AlertTriangle } from 'lucide-react'

export default function DashboardPage() {
  const { products, getLowStockProducts } = useProducts()
  const { getTodaySales, getTodayTransactions } = useTransactions()

  const todaySales = getTodaySales()
  const todayTransactions = getTodayTransactions()
  const lowStockProducts = getLowStockProducts()

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Today&apos;s Sales</p>
              <p className="text-lg font-bold text-emerald-600">{formatCurrency(todaySales)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Transactions</p>
              <p className="text-lg font-bold">{todayTransactions.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <ShoppingBag className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Products</p>
              <p className="text-lg font-bold">{products.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Low Stock</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold">{lowStockProducts.length}</p>
                {lowStockProducts.length > 0 && (
                  <Badge variant="outline" className="border-amber-300 text-amber-600">
                    Alert
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* POS Terminal */}
      <POSTerminal />
    </div>
  )
}
