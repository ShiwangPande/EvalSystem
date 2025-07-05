# 🚀 Vercel Deployment Guide

## 📋 Prerequisites

1. **GitHub Repository**: Your code must be pushed to a GitHub repository
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Database**: Set up a production PostgreSQL database (recommended: Supabase, Neon, or Railway)
4. **Clerk Account**: Set up authentication at [clerk.com](https://clerk.com)
5. **UploadThing Account**: Set up file uploads at [uploadthing.com](https://uploadthing.com)

## 🔧 Step-by-Step Deployment

### 1. **Prepare Your Database**

Set up a production PostgreSQL database:

**Option A: Supabase (Recommended)**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your database URL from Settings → Database
4. Run migrations: `npx prisma migrate deploy`

**Option B: Neon**
1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Get your database URL
4. Run migrations: `npx prisma migrate deploy`

### 2. **Configure Clerk Authentication**

1. Go to [clerk.com](https://clerk.com)
2. Create a new application
3. Get your publishable key and secret key
4. Configure your domain in Clerk dashboard

### 3. **Configure UploadThing**

1. Go to [uploadthing.com](https://uploadthing.com)
2. Create a new application
3. Get your app ID and secret
4. Configure your domain in UploadThing dashboard

### 4. **Deploy to Vercel**

#### Method 1: GitHub Import (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"

2. **Import from GitHub**
   - Click "Import Git Repository"
   - Select your GitHub repository
   - Vercel will automatically detect it's a Next.js project

3. **Configure Project Settings**
   - **Framework Preset**: Next.js (should be auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (should be auto-detected)
   - **Output Directory**: `.next` (should be auto-detected)
   - **Install Command**: `npm install` (should be auto-detected)

4. **Set Environment Variables**
   Click "Environment Variables" and add:

   ```env
   # Database
   DATABASE_URL="your-production-database-url"
   
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
   CLERK_SECRET_KEY="sk_live_..."
   
   # UploadThing
   UPLOADTHING_SECRET="sk_live_..."
   UPLOADTHING_APP_ID="your-app-id"
   
   # Next.js
   NEXTAUTH_SECRET="your-random-secret-key"
   NEXTAUTH_URL="https://your-domain.vercel.app"
   ```

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application
   - First deployment may take 5-10 minutes

#### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 5. **Post-Deployment Setup**

1. **Database Migration**
   ```bash
   # Run in Vercel dashboard terminal or locally with production DATABASE_URL
   npx prisma migrate deploy
   npx prisma generate
   ```

2. **Seed Database (if needed)**
   ```bash
   npm run db:seed
   ```

3. **Configure Custom Domain (Optional)**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

## 🔧 Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:port/db` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | `pk_live_...` |
| `CLERK_SECRET_KEY` | Clerk secret key | `sk_live_...` |
| `UPLOADTHING_SECRET` | UploadThing secret | `sk_live_...` |
| `UPLOADTHING_APP_ID` | UploadThing app ID | `your-app-id` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXTAUTH_SECRET` | NextAuth secret | Auto-generated |
| `NEXTAUTH_URL` | Your app URL | Auto-detected |

## 🚨 Common Issues & Solutions

### 1. **Build Failures**

**Issue**: Prisma client generation fails
**Solution**: Add build command override in Vercel:
```bash
npm run build && npx prisma generate
```

**Issue**: TypeScript errors
**Solution**: Ensure all types are properly defined and run `npm run lint` locally

### 2. **Database Connection Issues**

**Issue**: Cannot connect to database
**Solution**: 
- Check DATABASE_URL format
- Ensure database allows external connections
- Verify SSL settings

### 3. **Authentication Issues**

**Issue**: Clerk not working
**Solution**:
- Verify domain is configured in Clerk dashboard
- Check environment variables are correct
- Ensure Clerk keys are for production environment

### 4. **File Upload Issues**

**Issue**: UploadThing not working
**Solution**:
- Verify domain is configured in UploadThing dashboard
- Check environment variables
- Ensure proper CORS configuration

## 📊 Monitoring & Maintenance

### 1. **Vercel Analytics**
- Enable Vercel Analytics in project settings
- Monitor performance and errors

### 2. **Database Monitoring**
- Set up database monitoring (Supabase/Neon provide this)
- Monitor connection pool usage

### 3. **Error Tracking**
- Consider adding Sentry for error tracking
- Monitor Vercel function logs

## 🔄 Continuous Deployment

Once deployed, Vercel will automatically:
- Deploy on every push to main branch
- Create preview deployments for pull requests
- Roll back to previous version if deployment fails

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test locally with production environment variables
4. Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs) 