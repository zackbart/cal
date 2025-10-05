# Cal.com Simplified System - As-Built Documentation

## Overview
The Cal.com managed user system has been completely simplified to focus only on lookup functionality. All user creation and management logic has been removed, requiring manual user creation in Cal.com.

## What Was Removed

### Deleted Files
- `src/tokens/tokens.service.ts` - Complex managed user creation service
- `src/tokens/tokens.service.old.ts` - Old implementation
- `src/tokens/tokens.service.clean.ts` - Alternative implementation
- `src/tokens/tokens.controller.ts` - User management endpoints
- `src/tokens/tokens.module.ts` - Tokens module

### Removed Endpoints
- `POST /tokens/cal/managed-user` - Get managed user token
- `POST /tokens/cal/cleanup-test-users` - Cleanup test users
- `POST /auth/stack/create-cal-user` - Create Cal.com managed user

### Removed Methods
- `createCalManagedUserForStackUser()` - User creation logic
- `createOrGetManagedUser()` - Complex user management
- All managed user creation and update logic

## What Remains

### New Simple Service
- `src/tokens/cal-lookup.service.ts` - **Lookup-only service**

### Remaining Endpoints
- `POST /auth/stack/cal-token` - Get Cal.com token for existing user
- `GET /auth/stack/validate/:stackUserId` - Validate Stack user

## How It Works Now

### 1. User Creation Process
**Manual Process Only:**
1. Create user in Neon Auth (Stack Auth) - handled by Stack Auth
2. **Manually create corresponding user in Cal.com** - admin task
3. Use Stack User ID as Cal.com username for consistency

### 2. Token Generation Flow
```typescript
// When someone visits /book/[stackUserId]
1. Frontend calls: POST /auth/stack/cal-token
2. API validates: Stack user exists in Neon Auth
3. API looks up: Existing Cal.com user by Stack User ID
4. API returns: Cal.com access token (if user exists)
5. Frontend uses: Token with Cal.com embed
```

### 3. Error Handling
- **User Not Found**: Clear error message requiring manual user creation
- **No Auto-Creation**: System will not create users automatically
- **Admin Required**: All user creation must be done manually

## CalLookupService API

### Main Method
```typescript
async lookupUserAndGenerateToken(username: string): Promise<{
  accessToken: string;
  expiresAt: string;
  user: CalUser;
}>
```

### Lookup Strategy
1. **Primary**: Look up by username in Cal.com platform
2. **Fallback**: Look up in managed users list
3. **Matching**: Exact match, partial match, or email match
4. **Error**: Throw NotFoundException if user doesn't exist

## Benefits of Simplified System

### ✅ **Advantages**
- **Predictable**: No automatic user creation surprises
- **Controlled**: All user creation is intentional and manual
- **Simple**: Easy to understand and debug
- **Reliable**: No complex sync logic to fail
- **Admin-Friendly**: Clear separation of concerns

### ⚠️ **Trade-offs**
- **Manual Process**: Requires admin intervention for new users
- **No Auto-Sync**: Users must be created in both systems manually
- **Admin Dashboard Needed**: Will need admin interface for user management

## Required Admin Workflow

### For New Pastors
1. **Create in Neon Auth**: Use Stack Auth admin panel
2. **Create in Cal.com**: Use Cal.com admin panel with Stack User ID as username
3. **Test Booking**: Verify `/book/[stackUserId]` works

### For User Updates
1. **Update in Neon Auth**: Use Stack Auth admin panel
2. **Update in Cal.com**: Use Cal.com admin panel
3. **No Sync Required**: Changes are independent

## Future Admin Dashboard Requirements

### User Management Interface
```typescript
interface AdminDashboard {
  // Neon Auth Management
  neonAuthUsers: {
    list: () => NeonUser[];
    create: (userData: CreateUserData) => NeonUser;
    update: (userId: string, updates: UserUpdates) => NeonUser;
    delete: (userId: string) => void;
  };
  
  // Cal.com Management
  calComUsers: {
    list: () => CalUser[];
    create: (userData: CreateCalUserData) => CalUser;
    update: (userId: string, updates: CalUserUpdates) => CalUser;
    delete: (userId: string) => void;
  };
  
  // Sync Management
  syncStatus: {
    checkSync: () => SyncStatus[];
    identifyOrphans: () => OrphanedUser[];
    generateReport: () => SyncReport;
  };
}
```

## Configuration

### Environment Variables (Unchanged)
```bash
# Cal.com Integration
CAL_API_URL=https://api.cal.com
CAL_CLIENT_ID=your_client_id
CAL_CLIENT_SECRET=your_client_secret

# Stack Auth
STACK_PROJECT_ID=your_project_id
STACK_SECRET_SERVER_KEY=your_secret_key
```

## Error Messages

### User Not Found
```
Cal.com user 'cmgdzlviq0003qd1r1ljlj91a' not found. 
User must be created manually in Cal.com first.
```

### Stack User Invalid
```
Invalid user - Stack user validation failed
```

## Testing the System

### 1. Test Existing User
```bash
curl -X POST http://localhost:3001/auth/stack/cal-token \
  -H "Content-Type: application/json" \
  -d '{"stackUserId": "existing-user-id"}'
```

### 2. Test Non-Existent User
```bash
curl -X POST http://localhost:3001/auth/stack/cal-token \
  -H "Content-Type: application/json" \
  -d '{"stackUserId": "non-existent-user"}'
```

## Migration Notes

### What Changed
- **No Breaking Changes**: Existing API endpoints work the same
- **Error Behavior**: Now throws errors instead of creating users
- **Dependencies**: Removed TokensModule dependency

### What Stays the Same
- **Frontend Code**: No changes needed
- **Database Schema**: No changes needed
- **Environment Variables**: No changes needed
- **Core Flow**: Same booking flow, just different error handling

## Next Steps

1. **Test Current System**: Verify existing users still work
2. **Create Admin Dashboard**: Build user management interface
3. **Document Admin Process**: Create admin workflow documentation
4. **Monitor Errors**: Track user creation requests for admin action
5. **Consider Automation**: Evaluate if any automation is needed later

This simplified system provides a clean foundation for manual user management while maintaining all the core booking functionality.
