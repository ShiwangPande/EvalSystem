# Criteria Evaluation System

A modern, full-stack evaluation platform built with Next.js, TypeScript, Tailwind CSS, and Clerk authentication. Perfect for academic assessments, competitions, and project reviews.

## 🚀 Features

- **🔐 Authentication**: Secure user authentication with Clerk (social login, email/password)
- **👥 User Roles**: Role-based access control (Admin/User)
- **📝 CRUD Operations**: Full Create, Read, Update, Delete functionality for submissions
- **🎨 Modern UI**: Beautiful, responsive design with dark mode support
- **📊 Real-time Data**: Dynamic data fetching and state management
- **🔍 Search & Filter**: Advanced search and filtering capabilities
- **📱 Mobile Responsive**: Optimized for all device sizes

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Authentication**: Clerk
- **Database**: PostgreSQL with Prisma ORM
- **State Management**: React hooks with custom data fetching
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- PostgreSQL database
- Clerk account for authentication

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd my-app
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/evaluation_system"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
```

### 4. Set up Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Copy your publishable key and secret key
4. Set up webhook endpoint: `https://your-domain.com/api/webhook/clerk`
5. Configure user roles in Clerk metadata

### 5. Set up database

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed database
npx prisma db seed
```

### 6. Start development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
my-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── submissions/   # Submissions CRUD API
│   │   └── webhook/       # Clerk webhook handler
│   ├── admin/             # Admin panel pages
│   ├── dashboard/         # User dashboard
│   ├── submissions/       # Submission management
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── navigation.tsx    # Main navigation
│   └── theme-toggle.tsx  # Dark mode toggle
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and database
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

## 🔧 API Endpoints

### Submissions
- `GET /api/submissions` - Fetch all submissions
- `POST /api/submissions` - Create new submission
- `GET /api/submissions/[id]` - Fetch single submission
- `PUT /api/submissions/[id]` - Update submission
- `DELETE /api/submissions/[id]` - Delete submission

### Webhooks
- `POST /api/webhook/clerk` - Clerk user sync webhook

## 🎨 Customization

### Adding New Components

1. Create component in `components/ui/` for reusable UI elements
2. Use shadcn/ui CLI for new components: `npx shadcn@latest add [component]`

### Styling

- Global styles: `app/globals.css`
- Component styles: Use Tailwind CSS classes
- Theme customization: `postcss.config.mjs`

### Database Schema

Edit `prisma/schema.prisma` and run:
```bash
npx prisma db push
npx prisma generate
```

## 🔐 Authentication & Authorization

### User Roles

- **Admin**: Full access to all features including admin panel
- **User**: Can create submissions and view their own data

### Role Management

Roles are managed through Clerk's public metadata:
- Set `publicMetadata.role = "admin"` for admin users
- Default role is "user"

### Protected Routes

- `/dashboard` - Requires authentication
- `/admin` - Requires admin role
- `/submissions` - Requires authentication

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

```env
DATABASE_URL=your_production_database_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.
#   E v a l S y s t e m  
 