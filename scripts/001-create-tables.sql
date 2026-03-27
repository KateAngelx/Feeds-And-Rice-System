-- Create tables for Feeds and Rice POS System
-- Run this script to initialize the database schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'cashier',
    name TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    "retailPrice" INTEGER NOT NULL,
    "wholesalePrice" INTEGER NOT NULL,
    "capitalPrice" INTEGER NOT NULL,
    stock INTEGER NOT NULL,
    unit TEXT NOT NULL,
    "lowStockThreshold" INTEGER NOT NULL,
    "isApproved" BOOLEAN DEFAULT false,
    "createdBy" TEXT NOT NULL REFERENCES users(id),
    "approvedBy" TEXT REFERENCES users(id) ON DELETE SET NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    "creditBalance" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    subtotal INTEGER NOT NULL,
    discount INTEGER DEFAULT 0,
    total INTEGER NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "amountPaid" INTEGER NOT NULL,
    change INTEGER DEFAULT 0,
    "customerId" TEXT REFERENCES customers(id) ON DELETE SET NULL,
    "customerName" TEXT,
    "cashierId" TEXT NOT NULL REFERENCES users(id),
    "cashierName" TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Transaction items table
CREATE TABLE IF NOT EXISTS transaction_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "productId" TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    "productName" TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit TEXT NOT NULL,
    price INTEGER NOT NULL,
    "priceType" TEXT NOT NULL,
    subtotal INTEGER NOT NULL,
    "transactionId" TEXT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Credit records table
CREATE TABLE IF NOT EXISTS credit_records (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "customerId" TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    "customerName" TEXT NOT NULL,
    "transactionId" TEXT REFERENCES transactions(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL,
    notes TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "recordedBy" TEXT NOT NULL REFERENCES users(id)
);

-- Store settings table
CREATE TABLE IF NOT EXISTS store_settings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    "receiptFooter" TEXT,
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_approved ON products("isApproved");
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions("customerId");
CREATE INDEX IF NOT EXISTS idx_transactions_cashier ON transactions("cashierId");
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions("createdAt");
CREATE INDEX IF NOT EXISTS idx_credit_records_customer ON credit_records("customerId");
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction ON transaction_items("transactionId");
