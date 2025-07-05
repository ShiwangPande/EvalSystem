import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in',
  '/sign-up',
  '/api/webhook/clerk',
  '/api/uploadthing(.*)',
  '/api/admin/check-user',
  '/api/admin/promote',
  '/fix-admin',
  '/admin-setup',
  '/test-admin',
]);

// Define admin routes that require admin privileges
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
]);

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/submissions(.*)',
  '/evaluations(.*)',
  '/criteria(.*)',
  '/users(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const url = new URL(req.url);
  const pathname = url.pathname;
  
  // Log the request for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] ${req.method} ${pathname}`);
  }
  
  // Check if it's a public route
  if (isPublicRoute(req)) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Middleware] Public route: ${pathname}`);
    }
    return;
  }

  // Get session once
  const session = await auth();
  
  // Check authentication for protected routes
  if (!session.userId) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Middleware] Unauthenticated access to: ${pathname}, redirecting to /sign-in`);
    }
    return Response.redirect(new URL('/sign-in', req.url));
  }

  // Log successful authentication
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] Authenticated access to: ${pathname} by user: ${session.userId}`);
  }

  // For admin routes, we'll let the page handle the role check
  // This avoids the immutable error from complex middleware operations
  if (isAdminRoute(req)) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Middleware] Admin route accessed: ${pathname}`);
    }
    // The admin pages will handle role checking themselves
    return;
  }

  // For protected routes, authentication is sufficient
  if (isProtectedRoute(req)) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Middleware] Protected route accessed: ${pathname}`);
    }
    return;
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
