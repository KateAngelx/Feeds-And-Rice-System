'use client'

import { forwardRef } from 'react'
import { formatCurrency, DEFAULT_STORE_SETTINGS } from '@/lib/constants'
import type { Transaction, StoreSettings } from '@/lib/types'

interface ReceiptProps {
  transaction: Transaction
  storeSettings?: StoreSettings
}

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(
  ({ transaction, storeSettings = DEFAULT_STORE_SETTINGS }, ref) => {
    const formattedDate = new Date(transaction.createdAt).toLocaleString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    return (
      <div
        ref={ref}
        className="w-[300px] bg-white p-4 font-mono text-xs"
        style={{ fontFamily: 'monospace' }}
      >
        {/* Header */}
        <div className="mb-4 text-center">
          <h1 className="text-lg font-bold">{storeSettings.name}</h1>
          <p className="text-gray-600">{storeSettings.address}</p>
          <p className="text-gray-600">Tel: {storeSettings.phone}</p>
        </div>

        <div className="mb-2 border-t border-b border-dashed border-gray-400 py-2">
          <div className="flex justify-between">
            <span>Transaction #:</span>
            <span>{transaction.id.split('-')[0]}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{formattedDate}</span>
          </div>
          <div className="flex justify-between">
            <span>Cashier:</span>
            <span>{transaction.cashierName}</span>
          </div>
          {transaction.customerName && (
            <div className="flex justify-between">
              <span>Customer:</span>
              <span>{transaction.customerName}</span>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="mb-2">
          <div className="mb-1 flex justify-between font-bold">
            <span>Item</span>
            <span>Amount</span>
          </div>
          <div className="border-b border-dashed border-gray-400 pb-2">
            {transaction.items.map((item, index) => (
              <div key={index} className="mb-1">
                <div className="flex justify-between">
                  <span className="flex-1 truncate">{item.productName}</span>
                  <span>{formatCurrency(item.subtotal)}</span>
                </div>
                <div className="text-gray-500">
                  {item.quantity} {item.unit} x {formatCurrency(item.price)}
                  {item.priceType && (
                    <span className="ml-1">({item.priceType})</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="mb-2 space-y-1">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(transaction.subtotal)}</span>
          </div>
          {transaction.discount > 0 && (
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>-{formatCurrency(transaction.discount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-dashed border-gray-400 pt-1 text-sm font-bold">
            <span>TOTAL:</span>
            <span>{formatCurrency(transaction.total)}</span>
          </div>
        </div>

        {/* Payment Info */}
        <div className="mb-4 border-t border-dashed border-gray-400 pt-2">
          <div className="flex justify-between">
            <span>Payment:</span>
            <span className="uppercase">{transaction.paymentMethod}</span>
          </div>
          {transaction.paymentMethod === 'cash' && (
            <>
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <span>{formatCurrency(transaction.amountPaid)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Change:</span>
                <span>{formatCurrency(transaction.change)}</span>
              </div>
            </>
          )}
          {transaction.paymentMethod === 'credit' && (
            <div className="mt-1 text-center text-gray-600">
              *** CREDIT SALE (UTANG) ***
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-dashed border-gray-400 pt-2 text-center">
          <p className="text-gray-600">{storeSettings.receiptFooter}</p>
          <p className="mt-2 text-gray-400">
            {new Date().toLocaleString('en-PH')}
          </p>
        </div>
      </div>
    )
  }
)

Receipt.displayName = 'Receipt'
