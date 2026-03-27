#!/bin/bash

echo "🚀 Feeds and Rice POS - Database Setup"
echo "========================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📋 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "✅ Created .env.local"
    echo ""
    echo "⚠️  Please edit .env.local and add your DATABASE_URL"
    echo ""
    read -p "Press enter once you've configured .env.local..."
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL=" .env.local || grep -q "DATABASE_URL=\"postgresql://user:password" .env.local; then
    echo "❌ DATABASE_URL not configured in .env.local"
    echo "Please update DATABASE_URL with your PostgreSQL connection string"
    exit 1
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔄 Generating Prisma client..."
npm run prisma:generate

echo ""
echo "📊 Running database migrations..."
npm run prisma:migrate

echo ""
echo "🌱 Seeding database with initial data..."
npm run prisma:seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "The app will be available at http://localhost:3000"
