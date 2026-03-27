'use client'

import { useState, useCallback, useMemo } from 'react'
import type { Product, CartItem } from '@/lib/types'

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])
  const [discount, setDiscount] = useState<number>(0)

  const addItem = useCallback((product: Product, quantity: number = 1, priceType: 'retail' | 'wholesale' = 'retail') => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id && item.priceType === priceType)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.priceType === priceType
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prev, { product, quantity, priceType }]
    })
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number, priceType?: 'retail' | 'wholesale') => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => 
        !(item.product.id === productId && (priceType === undefined || item.priceType === priceType))
      ))
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.product.id === productId && (priceType === undefined || item.priceType === priceType)
            ? { ...item, quantity }
            : item
        )
      )
    }
  }, [])

  const updatePriceType = useCallback((productId: string, oldPriceType: 'retail' | 'wholesale', newPriceType: 'retail' | 'wholesale') => {
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.priceType === oldPriceType
          ? { ...item, priceType: newPriceType }
          : item
      )
    )
  }, [])

  const removeItem = useCallback((productId: string, priceType?: 'retail' | 'wholesale') => {
    setItems((prev) => prev.filter((item) => 
      !(item.product.id === productId && (priceType === undefined || item.priceType === priceType))
    ))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    setDiscount(0)
  }, [])

  const getItemPrice = useCallback((item: CartItem) => {
    return item.priceType === 'wholesale' ? item.product.wholesalePrice : item.product.retailPrice
  }, [])

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = item.priceType === 'wholesale' ? item.product.wholesalePrice : item.product.retailPrice
      return sum + price * item.quantity
    }, 0)
  }, [items])

  const total = useMemo(() => {
    return Math.max(0, subtotal - discount)
  }, [subtotal, discount])

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0)
  }, [items])

  return {
    items,
    discount,
    setDiscount,
    addItem,
    updateQuantity,
    updatePriceType,
    removeItem,
    clearCart,
    subtotal,
    total,
    itemCount,
    getItemPrice,
  }
}
