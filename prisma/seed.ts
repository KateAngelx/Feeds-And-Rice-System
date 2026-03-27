import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data in correct order (reverse of dependencies)
  await prisma.creditRecord.deleteMany();
  await prisma.transactionItem.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.storeSettings.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleared existing data");

  // Hash passwords
  const adminPassword = await bcryptjs.hash("admin123", 10);
  const cashierPassword = await bcryptjs.hash("cashier123", 10);

  // Create users
  const adminUser = await prisma.user.create({
    data: {
      username: "admin",
      password: adminPassword,
      name: "Administrator",
      role: "admin",
    },
  });

  const cashierUser = await prisma.user.create({
    data: {
      username: "cashier",
      password: cashierPassword,
      name: "Juan Dela Cruz",
      role: "cashier",
    },
  });

  console.log("✅ Users created");

  // Create products
  const products = await prisma.product.createMany({
    data: [
      // Pig Feeds
      {
        name: "Hog Grower Feeds",
        category: "feeds",
        retailPrice: 135000,
        wholesalePrice: 125000,
        capitalPrice: 110000,
        stock: 50,
        unit: "sack",
        lowStockThreshold: 10,
        isApproved: true,
        createdBy: adminUser.id,
        approvedBy: adminUser.id,
      },
      {
        name: "Hog Finisher Feeds",
        category: "feeds",
        retailPrice: 140000,
        wholesalePrice: 130000,
        capitalPrice: 115000,
        stock: 45,
        unit: "sack",
        lowStockThreshold: 10,
        isApproved: true,
        createdBy: adminUser.id,
        approvedBy: adminUser.id,
      },
      {
        name: "Piglet Starter Feeds",
        category: "feeds",
        retailPrice: 150000,
        wholesalePrice: 140000,
        capitalPrice: 125000,
        stock: 30,
        unit: "sack",
        lowStockThreshold: 8,
        isApproved: true,
        createdBy: adminUser.id,
        approvedBy: adminUser.id,
      },
      {
        name: "Sow and Weaner Feeds",
        category: "feeds",
        retailPrice: 145000,
        wholesalePrice: 135000,
        capitalPrice: 120000,
        stock: 35,
        unit: "sack",
        lowStockThreshold: 10,
        isApproved: true,
        createdBy: adminUser.id,
        approvedBy: adminUser.id,
      },
      {
        name: "Hog Fattener Feeds",
        category: "feeds",
        retailPrice: 138000,
        wholesalePrice: 128000,
        capitalPrice: 113000,
        stock: 40,
        unit: "sack",
        lowStockThreshold: 10,
        isApproved: true,
        createdBy: adminUser.id,
        approvedBy: adminUser.id,
      },
      // Rice
      {
        name: "Sinandomeng Rice",
        category: "rice",
        retailPrice: 5500,
        wholesalePrice: 220000,
        capitalPrice: 200000,
        stock: 40,
        unit: "kg",
        lowStockThreshold: 50,
        isApproved: true,
        createdBy: adminUser.id,
        approvedBy: adminUser.id,
      },
      {
        name: "Jasmine Rice",
        category: "rice",
        retailPrice: 6200,
        wholesalePrice: 250000,
        capitalPrice: 230000,
        stock: 35,
        unit: "kg",
        lowStockThreshold: 50,
        isApproved: true,
        createdBy: adminUser.id,
        approvedBy: adminUser.id,
      },
      {
        name: "Dinorado Rice",
        category: "rice",
        retailPrice: 7000,
        wholesalePrice: 280000,
        capitalPrice: 260000,
        stock: 25,
        unit: "kg",
        lowStockThreshold: 30,
        isApproved: true,
        createdBy: adminUser.id,
        approvedBy: adminUser.id,
      },
      {
        name: "NFA Rice",
        category: "rice",
        retailPrice: 4500,
        wholesalePrice: 180000,
        capitalPrice: 165000,
        stock: 60,
        unit: "kg",
        lowStockThreshold: 100,
        isApproved: true,
        createdBy: adminUser.id,
        approvedBy: adminUser.id,
      },
      {
        name: "Red Rice",
        category: "rice",
        retailPrice: 8000,
        wholesalePrice: 320000,
        capitalPrice: 300000,
        stock: 15,
        unit: "kg",
        lowStockThreshold: 20,
        isApproved: true,
        createdBy: adminUser.id,
        approvedBy: adminUser.id,
      },
    ],
  });

  console.log(`✅ ${products.count} products created`);

  // Create customers
  const customers = await prisma.customer.createMany({
    data: [
      {
        name: "Maria Santos",
        phone: "0918-234-5678",
        address: "Purok 1, Brgy. San Jose",
        creditBalance: 250000,
      },
      {
        name: "Pedro Reyes",
        phone: "0927-345-6789",
        address: "Purok 3, Brgy. Centro",
        creditBalance: 500000,
      },
      {
        name: "Jose Garcia",
        phone: "0935-456-7890",
        address: "Sitio Maligaya, Brgy. Norte",
        creditBalance: 0,
      },
      {
        name: "Ana Mendoza",
        phone: "0917-567-8901",
        address: "Purok 5, Brgy. Sur",
        creditBalance: 150000,
      },
      {
        name: "Ricardo Cruz",
        phone: "0926-678-9012",
        address: "Sitio Bagong Silang",
        creditBalance: 350000,
      },
    ],
  });

  console.log(`✅ ${customers.count} customers created`);

  // Create store settings
  await prisma.storeSettings.create({
    data: {
      name: "Mendoza's Feeds and Rice Store",
      address: "Pinagbirayan Malaki, Paracale, Camarines Norte",
      phone: "09457845126",
      receiptFooter: "Thank you for your business!",
    },
  });

  console.log("✅ Store settings created");

  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
