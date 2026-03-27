export const STORAGE_KEYS = {
  USERS: 'pos_users',
  CURRENT_USER: 'pos_current_user',
  PRODUCTS: 'pos_products',
  CUSTOMERS: 'pos_customers',
  TRANSACTIONS: 'pos_transactions',
  CREDIT_RECORDS: 'pos_credit_records',
  STORE_SETTINGS: 'pos_store_settings',
  INITIALIZED: 'pos_initialized',
} as const

export const CATEGORIES = [
  { value: 'feeds', label: 'Pig Feeds' },
  { value: 'rice', label: 'Rice' },
] as const

export const UNITS = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'sack', label: 'Sack' },
  { value: 'piece', label: 'Piece' },
  { value: 'bag', label: 'Bag' },
] as const

export const DEFAULT_STORE_SETTINGS = {
  name: "Mendoza's Feeds and Rice Store",
  address: 'Pinagbirayan Malaki, Paracale, Camarines Norte',
  phone: '09457845126',
  receiptFooter: 'Thank you for your purchase! Please come again.',
}

export const CURRENCY = {
  symbol: '₱',
  code: 'PHP',
}

export function formatCurrency(amount: number): string {
  return `${CURRENCY.symbol}${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}
