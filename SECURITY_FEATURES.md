# Security Features & Role-Based Access Control

## Overview

This application implements a comprehensive role-based access control (RBAC) system with multiple security layers to ensure proper data access and user management.

## User Roles

### 1. **ADMIN** (Administrator)
- **Full system access** - Can manage all aspects of the application
- **User Management** - Can create, edit, and delete users
- **Role Assignment** - Can promote users to admin, evaluator, or student roles
- **Criteria Management** - Can create and manage evaluation criteria
- **System Configuration** - Can access all admin features

### 2. **EVALUATOR** (Teacher/Instructor)
- **Evaluation Access** - Can view and evaluate student submissions
- **Limited Management** - Cannot manage users or system settings
- **Submission Review** - Can access submission details and evaluation forms
- **Scoring** - Can provide scores and feedback on submissions

### 3. **STUDENT** (Default Role)
- **Read-Only Access** - Can only view their own submissions and evaluations
- **No Management** - Cannot access any administrative features
- **Submission Creation** - Can create new submissions
- **Limited Navigation** - Only sees student-relevant menu items

## Security Implementation

### Frontend Protection

#### Route Guards
- **AdminGuard** - Protects admin-only pages (`/users`, `/criteria`, `/admin/*`)
- **EvaluatorGuard** - Protects evaluator pages (`/evaluations`)
- **Role-based Navigation** - Menu items dynamically show based on user role

#### Component Protection
```tsx
// Admin-only component
<AdminGuard>
  <AdminComponent />
</AdminGuard>

// Evaluator-only component  
<EvaluatorGuard>
  <EvaluatorComponent />
</EvaluatorGuard>
```

### Backend Protection

#### API Route Security
All API routes check user roles before processing requests:

```typescript
// Example: Users API
if (user.role !== 'ADMIN') {
  return new Response('Forbidden', { status: 403 })
}
```

#### Database Level Security
- User roles stored in database
- Role checks performed on every request
- No direct database access without authentication

## Initial Admin Setup

### Environment Configuration
Add initial admin users to `.env.local`:

```env
# Initial Admin Configuration
INITIAL_ADMIN_IDS="user_2zSsXcOz5ZAKmZcDBnpVJaiAZ6L,user_another_admin_id"
```

### How It Works
1. When a user first logs in, the system checks if their Clerk ID is in `INITIAL_ADMIN_IDS`
2. If found, they are automatically assigned the `ADMIN` role
3. If not found, they get the default `STUDENT` role
4. Only existing admins can promote other users to admin

### Adding New Admins
1. **Via Environment**: Add Clerk user ID to `INITIAL_ADMIN_IDS`
2. **Via UI**: Existing admin can promote users through the Users page
3. **Via API**: Use the promote-admin endpoint (admin only)

## Access Control Matrix

| Feature | Admin | Evaluator | Student |
|---------|-------|-----------|---------|
| View Dashboard | ✅ | ✅ | ✅ |
| Manage Users | ✅ | ❌ | ❌ |
| Manage Criteria | ✅ | ❌ | ❌ |
| View All Submissions | ✅ | ✅ | ❌ |
| View Own Submissions | ✅ | ✅ | ✅ |
| Create Submissions | ✅ | ❌ | ✅ |
| Evaluate Submissions | ✅ | ✅ | ❌ |
| View All Evaluations | ✅ | ✅ | ❌ |
| View Own Evaluations | ✅ | ❌ | ✅ |
| System Settings | ✅ | ❌ | ❌ |

## Security Best Practices

### 1. **Principle of Least Privilege**
- Users only get access to what they need
- Default role is `STUDENT` (most restrictive)
- Admin privileges must be explicitly granted

### 2. **Multi-Layer Protection**
- Frontend guards prevent UI access
- Backend API checks prevent unauthorized requests
- Database constraints ensure data integrity

### 3. **Audit Trail**
- All role changes are logged
- User actions can be tracked
- System maintains user history

### 4. **Secure Defaults**
- New users start as students
- Admin access requires explicit promotion
- No automatic privilege escalation

## Troubleshooting

### Common Issues

1. **403 Forbidden Errors**
   - Check user role in database
   - Verify API route permissions
   - Ensure proper authentication

2. **Missing Admin Access**
   - Add user ID to `INITIAL_ADMIN_IDS`
   - Have existing admin promote user
   - Check Clerk authentication

3. **Navigation Issues**
   - Clear browser cache
   - Check user role loading
   - Verify navigation component logic

### Development Mode
- Temporary "Promote to Admin" button available on Users page
- Only works in development environment
- Use for testing admin features

## API Security Endpoints

### Protected Routes
- `/api/users/*` - Admin only
- `/api/criteria/*` - Admin only  
- `/api/evaluations/*` - Evaluator/Admin
- `/api/submissions/*` - Role-based access

### Public Routes
- `/api/webhook/clerk` - Clerk webhook
- `/api/uploadthing/*` - File upload (authenticated)

## Future Enhancements

1. **Audit Logging** - Track all user actions
2. **Session Management** - Enhanced session security
3. **Two-Factor Authentication** - Additional security layer
4. **Role Hierarchies** - More granular permissions
5. **API Rate Limiting** - Prevent abuse 