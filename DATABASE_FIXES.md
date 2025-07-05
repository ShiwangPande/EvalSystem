# Database Fixes and Setup Instructions

## 🔧 **Issues Fixed**

### 1. **Foreign Key Constraint Violation**
- **Problem**: Users created in Clerk weren't being created in our database
- **Solution**: Added `ensureUser()` utility function and automatic user creation

### 2. **Missing User Records**
- **Problem**: Submissions failed because `studentId` didn't exist in users table
- **Solution**: Added user creation on dashboard load and API endpoints

### 3. **Empty Database**
- **Problem**: No default categories or criteria existed
- **Solution**: Created seed script with default data

## 🚀 **Setup Instructions**

### Step 1: Update Database Schema
```bash
npx prisma generate
npx prisma db push
```

### Step 2: Install Dependencies
```bash
pnpm install
```

### Step 3: Seed Database with Default Data
```bash
pnpm run db:seed
```

### Step 4: Set Up Environment Variables
Add these to your `.env.local`:
```env
# Database
DATABASE_URL="your_postgresql_connection_string"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
CLERK_SECRET_KEY="your_clerk_secret_key"
CLERK_WEBHOOK_SECRET="your_clerk_webhook_secret"

# UploadThing
UPLOADTHING_SECRET="your_uploadthing_secret"
UPLOADTHING_APP_ID="your_uploadthing_app_id"
```

## 🔄 **How User Creation Works Now**

### Automatic User Creation:
1. **Dashboard Load**: When user visits dashboard, automatically creates user record
2. **API Calls**: All API endpoints ensure user exists before processing
3. **Clerk Webhook**: Backup webhook creates users when they sign up

### User Creation Flow:
```
User Signs Up → Clerk Webhook → Database User Created
     ↓
User Visits Dashboard → Auto-create if missing
     ↓
User Makes API Call → Ensure user exists
```

## 📊 **Default Data Created**

### Categories:
- Web Development
- Mobile Development  
- Data Science
- AI & Machine Learning
- Cybersecurity
- Other

### Criteria:
- Technical Implementation (weight: 30%)
- Code Quality (weight: 25%)
- Documentation (weight: 20%)
- UI/UX Design (weight: 15%)
- Innovation (weight: 10%)

## 🛠️ **Files Modified**

### Core Database:
- `lib/lib/db.ts` - Added `ensureUser()` utility
- `prisma/seed.ts` - Database seeding script

### API Endpoints:
- `app/api/submissions/route.ts` - Added user creation
- `app/api/evaluations/route.ts` - Added user creation
- `app/api/users/create/route.ts` - Manual user creation endpoint

### Frontend:
- `app/dashboard/page.tsx` - Auto-create user on load

## ✅ **Testing the Fix**

1. **Sign up** with a new Clerk account
2. **Visit dashboard** - should auto-create user
3. **Create submission** - should work without errors
4. **Check database** - user should exist in users table

## 🎯 **Expected Behavior**

- ✅ No more foreign key constraint errors
- ✅ Users automatically created in database
- ✅ Submissions can be created successfully
- ✅ Evaluations can be created successfully
- ✅ All features work as expected

## 🔍 **Troubleshooting**

### If you still get foreign key errors:
1. Check that the seed script ran successfully
2. Verify your database connection string
3. Ensure Clerk webhook is properly configured
4. Check browser console for any errors

### If users aren't being created:
1. Check the dashboard console for errors
2. Verify the `/api/users/create` endpoint works
3. Check Clerk webhook logs
4. Ensure environment variables are set correctly

The system should now work perfectly without any database errors! 🎉 