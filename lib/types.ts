// User & Authentication
export interface User {
  id: string
  username: string
  password: string
  role: 'admin' | 'cashier'
  name: string
  createdAt: string
}

// Product/Inventory
export interface Product {
  id: string
  name: string
  category: 'feeds' | 'rice'
  retailPrice: number
  wholesalePrice: number
  capitalPrice: number
  stock: number
  unit: string // kg, sack, piece
  lowStockThreshold: number
  isApproved: boolean
  createdBy: string
  approvedBy?: string
  createdAt: string
  updatedAt: string
}

// Customer (for credit tracking)
export interface Customer {
  id: string
  name: string
  phone?: string
  address?: string
  creditBalance: number
  createdAt: string
}

// Transaction
export interface Transaction {
  id: string
  items: TransactionItem[]
  subtotal: number
  discount: number
  total: number
  paymentMethod: 'cash' | 'credit'
  amountPaid: number
  change: number
  customerId?: string
  customerName?: string
  cashierId: string
  cashierName: string
  createdAt: string
}

export interface TransactionItem {
  productId: string
  productName: string
  quantity: number
  unit: string
  price: number
  priceType: 'retail' | 'wholesale'
  subtotal: number
}

// Credit Record
export interface CreditRecord {
  id: string
  customerId: string
  customerName: string
  transactionId?: string
  amount: number
  type: 'credit' | 'payment'
  notes?: string
  createdAt: string
  recordedBy: string
}

// Cart Item
export interface CartItem {
  product: Product
  quantity: number
  priceType: 'retail' | 'wholesale'
}

// Store Settings
export interface StoreSettings {
  name: string
  address: string
  phone: string
  receiptFooter: string
}
