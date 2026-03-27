@echo off
echo.
echo 🚀 Feeds and Rice POS - Database Setup
echo ========================================
echo.

REM Check if .env.local exists
if not exist .env.local (
    echo 📋 Creating .env.local from .env.example...
    copy .env.example .env.local
    echo ✅ Created .env.local
    echo.
    echo ⚠️  Please edit .env.local and add your DATABASE_URL
    echo.
    pause
)

REM Check if DATABASE_URL is set
findstr /M "DATABASE_URL" .env.local >nul
if errorlevel 1 (
    echo ❌ DATABASE_URL not configured in .env.local
    echo Please update DATABASE_URL with your PostgreSQL connection string
    pause
    exit /b 1
)

echo.
echo 📦 Installing dependencies...
call npm install

echo.
echo 🔄 Generating Prisma client...
call npm run prisma:generate

echo.
echo 📊 Running database migrations...
call npm run prisma:migrate

echo.
echo 🌱 Seeding database with initial data...
call npm run prisma:seed

echo.
echo ✅ Setup complete!
echo.
echo To start the development server, run:
echo   npm run dev
echo.
echo The app will be available at http://localhost:3000
pause
