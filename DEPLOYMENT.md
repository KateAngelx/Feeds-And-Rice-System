# Database Migration Guide

This project has been successfully migrated from localStorage mock data to a PostgreSQL database with Prisma ORM.

## Local Development Setup

### 1. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Set Up PostgreSQL Database

**Option A: Using Docker**
```bash
docker run --name feedsandrice-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=feedsandrice \
  -p 5432:5432 \
  -d postgres:16
```

**Option B: Using PostgreSQL directly**
- Install PostgreSQL locally
- Create a database: `createdb feedsandrice`

### 3. Configure Environment Variables
```bash
cp .env.example .env.local
```

Update `.env.local` with your database connection string:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/feedsandrice?schema=public"
```

### 4. Run Migrations and Seed Database
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations (creates tables)
npm run prisma:migrate

# Seed database with initial data
npm run prisma:seed
```

### 5. Start Development Server
```bash
npm run dev
```

## Deployment to Vercel

### 1. Connect PostgreSQL Database
You can use one of these options:

**Option A: Vercel PostgreSQL** (Recommended)
- Go to your Vercel project settings
- Navigate to Storage → Postgres
- Create a new database
- The `DATABASE_URL` will be automatically set in environment variables

**Option B: External PostgreSQL** (e.g., Neon, AWS RDS)
- Get your connection string from your provider
- Add it as `DATABASE_URL` environment variable in Vercel project settings

### 2. Set Environment Variables in Vercel
1. Go to Project Settings → Environment Variables
2. Add `DATABASE_URL` with your production database connection string
3. Add `NODE_ENV` = `production`

### 3. Add Build Scripts
The `postinstall` script in `package.json` automatically runs `prisma generate` during deployment.

### 4. Run Migrations on Production (First Deploy Only)

After deploying to Vercel, run migrations in the production environment:

```bash
# Using Vercel CLI
vercel env pull

# Then run migrations
npm run prisma:migrate -- --skip-generate

# Optional: Seed production database (only do this once)
# npm run prisma:seed
```

Or manually via Vercel's Environment Setup:
- Use a Deployment Protection Bypass Token
- Connect to your production database manually

### 5. Database Migrations in CI/CD

To run migrations automatically during deployment, add this to your build script in `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "env": {
    "PRISMA_SKIP_ENGINE_CHECK": "@prisma/client"
  }
}
```

## API Endpoints

All data is now persisted to the PostgreSQL database through these RESTful API endpoints:

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create new product
- `GET /api/products/[id]` - Get product details
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Customers
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create new customer
- `GET /api/customers/[id]` - Get customer details with credit history
- `PUT /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer

### Transactions
- `GET /api/transactions` - List all transactions
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/[id]` - Get transaction details
- `PUT /api/transactions/[id]` - Update transaction
- `DELETE /api/transactions/[id]` - Delete transaction

### Credit Records
- `GET /api/credit-records` - List all credit records
- `POST /api/credit-records` - Create new credit record
- `GET /api/credit-records/[id]` - Get credit record details
- `DELETE /api/credit-records/[id]` - Delete credit record

### Store Settings
- `GET /api/store-settings` - Get store configuration
- `PUT /api/store-settings` - Update store configuration

## Database Schema

The Prisma schema includes the following models:

- **User**: Admin and cashier user accounts with password hashing
- **Product**: Inventory items (feeds and rice) with pricing and stock
- **Customer**: Client information with credit limit tracking
- **Transaction**: Sales and payment transactions
- **CreditRecord**: Credit purchase and payment history
- **StoreSettings**: Store configuration and metadata

## Security Considerations

### 1. Password Hashing
User passwords are hashed using bcryptjs before storage. Never store plain-text passwords.

### 2. Input Validation
All API endpoints validate incoming data using Zod schemas defined in `lib/validation.ts`.

### 3. Environment Variables
- Never commit `.env.local` or `.env.production.local`
- Always use Vercel's environment variable settings for sensitive data
- Use different credentials for development and production

### 4. SQL Injection Prevention
Prisma's parameterized queries automatically prevent SQL injection.

### 5. Future: API Authentication
Consider implementing:
- JWT tokens for API authentication
- Role-based access control (RBAC)
- API rate limiting
- HTTPS only (Vercel handles this automatically)

## Troubleshooting

### Migration Issues
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

### Connection Issues
- Verify DATABASE_URL is correct
- Check database is running
- Test connection: `npx prisma db push`
- View logs: `npx prisma studio`

### Deployment Issues
- Check Vercel build logs
- Verify all environment variables are set
- Ensure database is accessible from Vercel servers
- Run `npm run prisma:seed` manually after deployment if needed

## Performance Tips

1. **Connection Pooling**: Use a connection pool for serverless (PgBouncer, Neon)
2. **Query Optimization**: Use Prisma's `select` and `include` to fetch only needed data
3. **Indexing**: Add database indexes on frequently queried columns
4. **Caching**: Implement SWR caching in frontend hooks (already done)
5. **Pagination**: Add pagination to large data fetches

## Next Steps

1. Implement user authentication and authorization
2. Add API rate limiting
3. Set up database backups
4. Configure monitoring and logging
5. Add integration tests for API endpoints
6. Implement soft deletes for data retention
