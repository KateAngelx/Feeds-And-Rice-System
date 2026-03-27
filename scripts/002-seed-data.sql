-- Seed data for Feeds and Rice POS System
-- Run this script after 001-create-tables.sql

-- Clear existing data (in reverse order of dependencies)
DELETE FROM credit_records;
DELETE FROM transaction_items;
DELETE FROM transactions;
DELETE FROM products;
DELETE FROM customers;
DELETE FROM store_settings;
DELETE FROM users;

-- Create admin user (password: admin123)
INSERT INTO users (id, username, password, name, role, "createdAt", "updatedAt")
VALUES (
    'admin-user-001',
    'admin',
    '$2a$10$rQoKNXbWLjrV/qK7KX8KPeY6WRCxV.KdLq6E8.6HwW5nqQbKXwCMO',
    'Administrator',
    'admin',
    NOW(),
    NOW()
);

-- Create cashier user (password: cashier123)
INSERT INTO users (id, username, password, name, role, "createdAt", "updatedAt")
VALUES (
    'cashier-user-001',
    'cashier',
    '$2a$10$K8rQoKNXbWLjrV/qK7KX8KPeY6WRCxV.KdLq6E8.6HwW5nqQbKXw',
    'Juan Dela Cruz',
    'cashier',
    NOW(),
    NOW()
);

-- Create products (prices in centavos)
INSERT INTO products (name, category, "retailPrice", "wholesalePrice", "capitalPrice", stock, unit, "lowStockThreshold", "isApproved", "createdBy", "approvedBy", "createdAt", "updatedAt")
VALUES
    ('Hog Grower Feeds', 'feeds', 135000, 125000, 110000, 50, 'sack', 10, true, 'admin-user-001', 'admin-user-001', NOW(), NOW()),
    ('Hog Finisher Feeds', 'feeds', 140000, 130000, 115000, 45, 'sack', 10, true, 'admin-user-001', 'admin-user-001', NOW(), NOW()),
    ('Piglet Starter Feeds', 'feeds', 150000, 140000, 125000, 30, 'sack', 8, true, 'admin-user-001', 'admin-user-001', NOW(), NOW()),
    ('Sow and Weaner Feeds', 'feeds', 145000, 135000, 120000, 35, 'sack', 10, true, 'admin-user-001', 'admin-user-001', NOW(), NOW()),
    ('Hog Fattener Feeds', 'feeds', 138000, 128000, 113000, 40, 'sack', 10, true, 'admin-user-001', 'admin-user-001', NOW(), NOW()),
    ('Sinandomeng Rice', 'rice', 5500, 220000, 200000, 40, 'kg', 50, true, 'admin-user-001', 'admin-user-001', NOW(), NOW()),
    ('Jasmine Rice', 'rice', 6200, 250000, 230000, 35, 'kg', 50, true, 'admin-user-001', 'admin-user-001', NOW(), NOW()),
    ('Dinorado Rice', 'rice', 7000, 280000, 260000, 25, 'kg', 30, true, 'admin-user-001', 'admin-user-001', NOW(), NOW()),
    ('NFA Rice', 'rice', 4500, 180000, 165000, 60, 'kg', 100, true, 'admin-user-001', 'admin-user-001', NOW(), NOW()),
    ('Red Rice', 'rice', 8000, 320000, 300000, 15, 'kg', 20, true, 'admin-user-001', 'admin-user-001', NOW(), NOW());

-- Create customers (credit balance in centavos)
INSERT INTO customers (name, phone, address, "creditBalance", "createdAt", "updatedAt")
VALUES
    ('Maria Santos', '0918-234-5678', 'Purok 1, Brgy. San Jose', 250000, NOW(), NOW()),
    ('Pedro Reyes', '0927-345-6789', 'Purok 3, Brgy. Centro', 500000, NOW(), NOW()),
    ('Jose Garcia', '0935-456-7890', 'Sitio Maligaya, Brgy. Norte', 0, NOW(), NOW()),
    ('Ana Mendoza', '0917-567-8901', 'Purok 5, Brgy. Sur', 150000, NOW(), NOW()),
    ('Ricardo Cruz', '0926-678-9012', 'Sitio Bagong Silang', 350000, NOW(), NOW());

-- Create store settings
INSERT INTO store_settings (name, address, phone, "receiptFooter", "updatedAt")
VALUES (
    'Mendoza''s Feeds and Rice Store',
    'Pinagbirayan Malaki, Paracale, Camarines Norte',
    '09457845126',
    'Thank you for your business!',
    NOW()
);
