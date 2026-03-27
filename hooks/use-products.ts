'use client'

import useSWR from 'swr'
import { useCallback, useMemo } from 'react'

export interface Product {
  id: string
  name: string
  category: string
  retailPrice: number
  wholesalePrice: number
  capitalPrice: number
  stock: number
  unit: string
  lowStockThreshold: number
  isApproved: boolean
  createdBy: string
  approvedBy?: string
  createdAt: string
  updatedAt: string
}

const fetcher = (url: string) => 
  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      return res.json()
    })
    .catch(err => {
      console.error('[Inventory] Fetch error:', err)
      return []
    })

export function useProducts() {
  const { data: rawProducts, mutate: refreshProducts, isLoading } = useSWR<Product[]>(
    '/api/products',
    fetcher,
    { revalidateOnFocus: false }
  )

  // Ensure products is always an array
  const products = useMemo(() => {
    if (Array.isArray(rawProducts)) return rawProducts
    return []
  }, [rawProducts])

  const addProduct = useCallback(async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      })
      const newProduct = await response.json()
      await refreshProducts()
      return newProduct
    } catch (error) {
      console.error('Error adding product:', error)
      throw error
    }
  }, [refreshProducts])

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const updated = await response.json()
      await refreshProducts()
      return updated
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  }, [refreshProducts])

  const deleteProduct = useCallback(async (id: string) => {
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' })
      await refreshProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  }, [refreshProducts])

  const adjustStock = useCallback(async (id: string, quantity: number) => {
    const product = products.find(p => p.id === id)
    if (!product) return
    return updateProduct(id, { stock: Math.max(0, product.stock + quantity) })
  }, [products, updateProduct])

  // --- NEW FUNCTIONS TO FIX THE RUNTIME ERROR ---

  const getApprovedProducts = useCallback(() => {
    return products.filter(p => p.isApproved === true)
  }, [products])

  const getPendingProducts = useCallback(() => {
    return products.filter(p => p.isApproved === false)
  }, [products])

  const getLowStockProducts = useCallback(() => {
    return products.filter(p => p.stock < p.lowStockThreshold)
  }, [products])

  const approveProduct = useCallback(async (id: string, adminId: string) => {
    return updateProduct(id, { isApproved: true, approvedBy: adminId })
  }, [updateProduct])

  const rejectProduct = useCallback(async (id: string) => {
    // Usually rejection deletes the pending entry or marks it as 'rejected'
    return deleteProduct(id)
  }, [deleteProduct])

  // ----------------------------------------------

  const getProduct = useCallback((id: string) => {
    return products.find(p => p.id === id)
  }, [products])

  const getProductsByCategory = useCallback((category: string) => {
    return products.filter(p => p.category === category)
  }, [products])

  return {
    products,
    refreshProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    getProduct,
    getLowStockProducts,
    getProductsByCategory,
    getApprovedProducts,  // Added
    getPendingProducts,   // Added
    approveProduct,       // Added
    rejectProduct,        // Added
    isLoaded: !isLoading,
  }
}