# Deployment & Testing Guide for Feedsandrice POS

## Quick Start - Local Development

### Prerequisites
- Node.js 18+ and npm/pnpm
- PostgreSQL 14+ (or use Docker)
- Git

### Setup Steps

```bash
# 1. Clone and install
git clone https://github.com/KateAngelx/feedsandrice.git
cd feedsandrice
npm install

# 2. Setup PostgreSQL with Docker (optional)
docker run --name feedsandrice-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=feedsandrice \
  -p 5432:5432 \
  -d postgres:16

# 3. Configure environment
cp .env.example .env.local

# Edit .env.local with your database URL:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/feedsandrice?schema=public"
# DATABASE_URL_UNPOOLED="postgresql://postgres:postgres@localhost:5432/feedsandrice?schema=public"

# 4. Initialize database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Create tables
npm run prisma:seed      # Populate sample data

# 5. Verify database (optional visual explorer)
npx prisma studio

# 6. Start development server
npm run dev
```

Visit `http://localhost:3000` to see your application.

---

## Testing Checklist

### Unit Tests - Database Layer

**Test 1: User Authentication**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# Expected Response (200):
# {
#   "id": "...",
#   "username": "admin",
#   "name": "Admin User",
#   "role": "admin",
#   "createdAt": "...",
#   "updatedAt": "..."
# }
```

**Test 2: Get All Products**
```bash
curl http://localhost:3000/api/products

# Expected Response (200): Array of products
# [
#   {
#     "id": "...",
#     "name": "Maize",
#     "category": "Grains",
#     "retailPrice": 500,
#     "wholesalePrice": 450,
#     "capitalPrice": 400,
#     "stock": 100,
#     ...
#   }
# ]
```

**Test 3: Filter Products by Category**
```bash
curl "http://localhost:3000/api/products?category=Grains"

# Expected Response (200): Only Grains category products
```

**Test 4: Get All Customers**
```bash
curl http://localhost:3000/api/customers

# Expected Response (200): Array of customers
```

**Test 5: Create Transaction**
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "cashierId": "user-id-from-auth",
    "cashierName": "Admin User",
    "items": [
      {
        "productId": "product-id",
        "productName": "Maize",
        "quantity": 5,
        "unit": "bag",
        "price": 500,
        "priceType": "retail",
        "subtotal": 2500
      }
    ],
    "subtotal": 2500,
    "discount": 0,
    "total": 2500,
    "paymentMethod": "cash",
    "amountPaid": 2500,
    "change": 0
  }'

# Expected Response (201): Transaction created
```

### Integration Tests - API Routes

**Test 6: Create Product (Admin)**
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rice",
    "category": "Grains",
    "retailPrice": 800,
    "wholesalePrice": 750,
    "capitalPrice": 700,
    "stock": 50,
    "unit": "bag",
    "createdBy": "admin-id"
  }'

# Expected Response (201): Product created
```

**Test 7: Update Product**
```bash
curl -X PATCH http://localhost:3000/api/products/[product-id] \
  -H "Content-Type: application/json" \
  -d '{
    "stock": 45,
    "retailPrice": 850
  }'

# Expected Response (200): Product updated
```

**Test 8: Get Store Settings**
```bash
curl http://localhost:3000/api/store-settings

# Expected Response (200): Store settings
```

**Test 9: Update Store Settings**
```bash
curl -X PATCH http://localhost:3000/api/store-settings \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Feed Store",
    "phone": "(555) 987-6543"
  }'

# Expected Response (200): Settings updated
```

**Test 10: Delete Customer**
```bash
curl -X DELETE http://localhost:3000/api/customers/[customer-id]

# Expected Response (200): Customer deleted
```

### Build & Type Checking

```bash
# Verify TypeScript compilation
npm run build

# Run linter
npm run lint

# Both should complete without errors
```

---

## Performance Benchmarks

### Database Query Performance
- Product retrieval: < 100ms
- Customer lookup: < 50ms
- Transaction creation: < 200ms (with nested items)
- Credit record update: < 100ms

### API Response Times (via curl)
- GET /api/products: < 150ms
- POST /api/transactions: < 300ms
- GET /api/store-settings: < 100ms

---

## Vercel Deployment

### Step 1: Prepare Repository
```bash
# Ensure all changes are committed
git add .
git commit -m "Production deployment"
git push origin nextjs-to-postgresql
```

### Step 2: Connect to Vercel
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Import Project"
3. Enter repository: `https://github.com/KateAngelx/feedsandrice`
4. Select branch: `nextjs-to-postgresql`
5. Click "Import"

### Step 3: Configure Environment Variables
In Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL=postgresql://user:password@host:port/feedsandrice?schema=public
DATABASE_URL_UNPOOLED=postgresql://user:password@host:port/feedsandrice?schema=public
NODE_ENV=production
```

**For Neon PostgreSQL (Recommended):**
1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string for DATABASE_URL
4. Append `?schema=public` if not present

### Step 4: Deploy
```bash
# Vercel auto-deploys on push, or manually trigger:
vercel deploy --prod
```

### Step 5: Run Migrations
After first deployment:

```bash
# SSH into Vercel deployment (or use Vercel Functions console)
npm run prisma:migrate:prod
npm run prisma:seed  # Optional: add sample data
```

---

## Production Monitoring

### Key Metrics to Track
1. **Response Times**: Monitor API endpoint performance
2. **Error Rates**: Track 500 errors, 400 validation errors
3. **Database Connections**: Ensure no connection pool exhaustion
4. **Memory Usage**: Monitor serverless function memory
5. **Request Volume**: Track peak usage patterns

### Error Tracking (Optional)
Setup Sentry for production error monitoring:

```bash
npm install @sentry/nextjs
```

Configure in `next.config.js` and `middleware.ts` for error tracking.

---

## Troubleshooting

### Common Issues

**Issue**: `DATABASE_URL not found`
```bash
# Solution: Ensure .env.local exists with DATABASE_URL
cp .env.example .env.local
# Edit with your database URL
```

**Issue**: `PrismaClientKnownRequestError: Foreign key constraint failed`
```bash
# Solution: Ensure seed data exists and IDs are valid
npm run prisma:seed
```

**Issue**: `TypeError: products.filter is not a function`
```bash
# Solution: Already fixed in hooks with memoized data validation
# If still occurs, check API response format is JSON array
curl http://localhost:3000/api/products | jq
```

**Issue**: Connection timeout on Vercel
```bash
# Solution: Ensure DATABASE_URL_UNPOOLED is configured
# Vercel functions require unpooled connection
```

---

## Best Practices for Production

1. **Never hardcode database URLs** - Always use environment variables
2. **Enable query logging in development only** - Set in `lib/db.ts`
3. **Implement request validation** - Use Zod schemas (already present)
4. **Rate limiting** - Consider @vercel/rate-limit for API routes
5. **CORS headers** - Configure in middleware for API security
6. **Database backups** - Enable automatic backups in Neon
7. **Monitor error logs** - Check Vercel deployment logs regularly
8. **Update dependencies** - Run `npm update` monthly
9. **SSL/TLS** - Enabled by default on Vercel
10. **Environment parity** - Keep .env.local in sync with production vars

---

## Success Indicators

Your deployment is successful when:
- ✅ Build completes without errors
- ✅ All API endpoints respond correctly
- ✅ Database operations complete < 500ms
- ✅ No TypeScript compilation errors
- ✅ All environment variables configured
- ✅ Application loads at your Vercel URL
- ✅ Authentication works (login/logout)
- ✅ Transactions can be created and retrieved
- ✅ Error handling returns proper status codes

---

## Support & Maintenance

### Regular Maintenance Tasks
- **Weekly**: Check error logs in Vercel dashboard
- **Monthly**: Update npm dependencies (`npm update`)
- **Quarterly**: Review and optimize slow queries
- **Annually**: Full security audit and penetration testing

### Need Help?
- Check [Vercel Docs](https://vercel.com/docs)
- Review [Prisma Docs](https://www.prisma.io/docs)
- Check [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- Open issue on [GitHub](https://github.com/KateAngelx/feedsandrice/issues)

---

**Last Updated**: March 27, 2026  
**Status**: Deployment Ready
