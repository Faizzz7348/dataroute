# Vercel Deployment Guide

## Environment Variables Setup

⚠️ **IMPORTANT:** Set environment variables in Vercel Dashboard, NOT in code files!

### Step-by-Step:

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these three variables (for **Production**, **Preview**, and **Development**):

#### Required Variables:
```
DATABASE_URL
postgres://2735c59a6f6f1e22da9d8e47d1223222476db1ee5e136cef183a40a91dc76ea4:sk_p3tdRQir1MdSx5T-2WoGN@db.prisma.io:5432/postgres?sslmode=require

POSTGRES_URL  
postgres://2735c59a6f6f1e22da9d8e47d1223222476db1ee5e136cef183a40a91dc76ea4:sk_p3tdRQir1MdSx5T-2WoGN@db.prisma.io:5432/postgres?sslmode=require

PRISMA_DATABASE_URL
prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19wM3RkUlFpcjFNZFN4NVQtMldvR04iLCJhcGlfa2V5IjoiMDFLRlBIMTdDS0RTMkU0MUZKQ1daSDJKS0UiLCJ0ZW5hbnRfaWQiOiIyNzM1YzU5YTZmNmYxZTIyZGE5ZDhlNDdkMTIyMzIyMjQ3NmRiMWVlNWUxMzZjZWYxODNhNDBhOTFkYzc2ZWE0IiwiaW50ZXJuYWxfc2VjcmV0IjoiYmE4NGU1MjktOWYyNC00MTZmLWJlMzctNDlhNjI5NjY2OTdhIn0.4dMq4S602xsDbmWrgPViyJY1cLr84mtIqMPW6fqG9kM
```

## Deployment Steps

### Method 1: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

### Method 2: Deploy via Git
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click **Add New Project**
4. Import your GitHub repository
5. Vercel will auto-detect Next.js
6. Add environment variables in the project settings
7. Click **Deploy**

## After Deployment

### Push Database Schema:
```bash
# Set environment variable
export DATABASE_URL="your_database_url_here"

# Push schema to database
npx prisma db push

# Seed database (optional)
npm run db:seed
```

## Build Configuration

The build process automatically:
1. Installs dependencies (`npm install`)
2. Generates Prisma Client (`prisma generate` via postinstall)
3. Builds Next.js (`next build`)

## Notes

- Prisma Client is generated during build via `postinstall` script
- Database connection uses Prisma Accelerate for optimal performance
- Make sure all environment variables are set before deployment
- First deployment might take longer due to Prisma Client generation

## Troubleshooting

If build fails:
1. Check environment variables are correctly set
2. Ensure database is accessible
3. Check build logs for specific errors
4. Try redeploying after fixing issues
