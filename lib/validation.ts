import { z } from 'zod'

export const ProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z.enum(['feeds', 'rice']),
  price: z.number().positive('Price must be positive'),
  stock: z.number().nonnegative('Stock cannot be negative'),
  sku: z.string().min(1, 'SKU is required'),
  image: z.string().optional(),
})

export const CustomerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  creditLimit: z.number().nonnegative('Credit limit cannot be negative'),
})

export const TransactionSchema = z.object({
  type: z.enum(['sale', 'return', 'payment']),
  amount: z.number().positive('Amount must be positive'),
  quantity: z.number().nonnegative().optional(),
  notes: z.string().optional(),
  customerId: z.string().optional(),
  productId: z.string().optional(),
})

export const CreditRecordSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['purchase', 'payment', 'adjustment']),
  description: z.string().optional(),
  customerId: z.string().min(1, 'Customer ID is required'),
})

export const StoreSettingsSchema = z.object({
  storeName: z.string().min(1, 'Store name is required'),
  storeAddress: z.string().optional(),
  phoneNumber: z.string().optional(),
  taxRate: z.number().nonnegative().max(100),
  currency: z.string().default('USD'),
})

export const validateRequest = <T>(schema: z.ZodSchema, data: unknown): T | null => {
  try {
    return schema.parse(data) as T
  } catch (error) {
    console.error('Validation error:', error)
    return null
  }
}
