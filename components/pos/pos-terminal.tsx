'use client'

import { useState, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { toast } from 'sonner'
import { ProductGrid } from './product-grid'
import { Cart } from './cart'
import { PaymentModal } from './payment-modal'
import { Receipt } from './receipt'
import { useAuth } from '@/hooks/use-auth'
import { useProducts } from '@/hooks/use-products'
import { useCustomers } from '@/hooks/use-customers'
import { useTransactions } from '@/hooks/use-transactions'
import { useCart } from '@/hooks/use-cart'
import type { Product, Transaction } from '@/lib/types'

export function POSTerminal() {
  const { user } = useAuth()
  const { products, adjustStock } = useProducts()
  const { customers, addCredit } = useCustomers()
  const { addTransaction } = useTransactions()
  const cart = useCart()

  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null)
  const receiptRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt-${lastTransaction?.id || 'new'}`,
  })

  const handleSelectProduct = (product: Product, quantity: number, priceType: 'retail' | 'wholesale') => {
    const existingItems = cart.items.filter((item) => item.product.id === product.id)
    const currentQty = existingItems.reduce((sum, item) => sum + item.quantity, 0)

    if (currentQty + quantity > product.stock) {
      toast.error('Cannot add more items', {
        description: `Only ${product.stock - currentQty} ${product.unit} available.`,
      })
      return
    }

    cart.addItem(product, quantity, priceType)
    toast.success('Added to cart', {
      description: `${quantity} ${product.unit} of ${product.name} (${priceType}) added.`,
    })
  }

  const handlePaymentComplete = (
    paymentMethod: 'cash' | 'credit',
    amountPaid: number,
    customerId?: string
  ) => {
    if (!user) return

    const customer = customerId ? customers.find((c) => c.id === customerId) : null

    // Create transaction items with price type
    const transactionItems = cart.items.map((item) => {
      const price = item.priceType === 'wholesale' ? item.product.wholesalePrice : item.product.retailPrice
      return {
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        unit: item.product.unit,
        price,
        priceType: item.priceType,
        subtotal: price * item.quantity,
      }
    })

    // Create transaction
    const transaction = addTransaction({
      items: transactionItems,
      subtotal: cart.subtotal,
      discount: cart.discount,
      total: cart.total,
      paymentMethod,
      amountPaid,
      change: paymentMethod === 'cash' ? amountPaid - cart.total : 0,
      customerId: customer?.id,
      customerName: customer?.name,
      cashierId: user.id,
      cashierName: user.name,
    })

    // Deduct inventory
    cart.items.forEach((item) => {
      adjustStock(item.product.id, -item.quantity)
    })

    // Add credit if credit sale
    if (paymentMethod === 'credit' && customerId) {
      addCredit(customerId, cart.total, transaction.id, user.name)
    }

    // Store transaction for receipt
    setLastTransaction(transaction)

    // Clear cart and close modal
    cart.clearCart()
    setIsPaymentOpen(false)

    // Show success and print option
    toast.success('Sale completed!', {
      description: `Transaction ${transaction.id.split('-')[0]} completed successfully.`,
      action: {
        label: 'Print Receipt',
        onClick: () => {
          setTimeout(() => handlePrint(), 100)
        },
      },
    })
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col gap-4 lg:flex-row">
      {/* Product Grid */}
      <div className="flex-1 overflow-hidden rounded-lg border bg-card p-4">
        <ProductGrid 
          products={products} 
          onSelectProduct={handleSelectProduct}
          userRole={user?.role}
        />
      </div>

      {/* Cart */}
      <div className="h-full w-full lg:w-96">
        <Cart
          items={cart.items}
          discount={cart.discount}
          subtotal={cart.subtotal}
          total={cart.total}
          onUpdateQuantity={cart.updateQuantity}
          onRemoveItem={cart.removeItem}
          onDiscountChange={cart.setDiscount}
          onCheckout={() => setIsPaymentOpen(true)}
          onClearCart={cart.clearCart}
          getItemPrice={cart.getItemPrice}
        />
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        items={cart.items}
        subtotal={cart.subtotal}
        discount={cart.discount}
        total={cart.total}
        customers={customers}
        onComplete={handlePaymentComplete}
        getItemPrice={cart.getItemPrice}
      />

      {/* Hidden Receipt for Printing */}
      <div className="hidden">
        {lastTransaction && (
          <Receipt ref={receiptRef} transaction={lastTransaction} />
        )}
      </div>
    </div>
  )
}
