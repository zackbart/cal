# ChurchHub Security Analysis

**Version:** 1.0  
**Date:** 2025-01-27  
**Focus:** Cal.com Primary Authentication Security

## Overview

This document analyzes the security requirements and implementation strategy for ChurchHub's authentication flow, focusing on the integration between Cal.com primary authentication and the ChurchHub sidecar API.

---

## 1. Authentication Architecture

### 1.1 Current Flow
```
User → ChurchHub Signup → Cal.com User Creation → ChurchHub API → Cal.com API
```

### 1.2 Security Considerations
- **Token Management**: Secure storage and rotation of Cal.com access tokens
- **User Context**: Proper user identification across systems
- **Data Isolation**: Ensure pastors only access their own data
- **Audit Trail**: Complete logging of authentication events
- **ChurchHub Branding**: Maintain user perception of ChurchHub account

---

## 2. Cal.com Primary Authentication

### 2.1 ChurchHub Signup Flow
```typescript
// 1. User submits ChurchHub signup form
app.post('/auth/signup', async (req, res) => {
  const { email, name, password, churchName, bio, schedulingUsername } = req.body;
  
  try {
    // Create Cal.com user programmatically
    const calUser = await calApi.createUser({
      email,
      name,
      username: schedulingUsername || generateUsername(email),
      password,
      timezone: "America/New_York"
    });
    
    // Create ChurchHub user account
    const churchHubUser = await createChurchHubUser({
      calUserId: calUser.id,
      email,
      name,
      username: calUser.username,
      churchName,
      bio,
      role: 'pastor'
    });
    
    // Generate Cal.com access token
    const calTokens = await calApi.generateAccessToken(calUser.id);
    
    // Return ChurchHub-branded response
    res.json({
      message: "Welcome to ChurchHub! Your account is ready.",
      user: {
        id: churchHubUser.id,
        email: churchHubUser.email,
        name: churchHubUser.name,
        churchName: churchHubUser.churchName,
        role: churchHubUser.role,
        schedulingLink: `https://churchhub.com/book/${churchHubUser.username}`
      },
      accessToken: calTokens.accessToken,
      refreshToken: calTokens.refreshToken
    });
    
  } catch (error) {
    res.status(400).json({
      error: "Failed to create ChurchHub account",
      message: "Please try again or contact support"
    });
  }
});
```

### 2.2 Security Measures
- **Input Validation**: Validate all signup form data
- **Password Security**: Cal.com handles password security
- **User Verification**: Validate user identity before creating accounts
- **Session Management**: Secure session handling with proper expiration
- **ChurchHub Branding**: Maintain user perception of ChurchHub account

---

## 3. Cal.com Token Management

### 3.1 Token Generation
```typescript
async function generateCalTokens(user: User) {
  // User should already have Cal.com account from signup
  if (!user.calUserId) {
    throw new Error('User does not have Cal.com account');
  }
  
  // Generate access token for user
  const tokens = await calApi.generateAccessToken({
    userId: user.calUserId,
    scopes: ['read:bookings', 'write:bookings', 'read:availability', 'write:availability']
  });
  
  return tokens;
}
```

### 3.2 Token Refresh
```typescript
app.post('/auth/cal/refresh', async (req, res) => {
  const { refreshToken, userId } = req.body;
  
  // Validate user context
  const user = await validateUserContext(userId);
  if (!user) {
    return res.status(401).json({ error: 'Invalid user context' });
  }
  
  // Refresh Cal.com token
  const newTokens = await calApi.refreshAccessToken(refreshToken);
  
  // Update stored tokens
  await updateUserTokens(user.id, newTokens);
  
  res.json({
    accessToken: newTokens.accessToken,
    refreshToken: newTokens.refreshToken,
    expiresIn: newTokens.expiresIn
  });
});
```

### 3.3 Security Considerations
- **Token Storage**: Encrypt tokens at rest in database
- **Token Rotation**: Implement automatic token refresh
- **Scope Limitation**: Use minimal required scopes
- **Audit Logging**: Log all token operations
- **User Creation**: Secure programmatic user creation
- **ChurchHub Branding**: Maintain user perception

---

## 4. Data Isolation & Access Control

### 4.1 User Context Validation
```typescript
// Middleware to validate user context
export function validateUserContext(req: Request, res: Response, next: NextFunction) {
  const userId = req.user?.id;
  const userRole = req.user?.role;
  const resourceUserId = req.params.userId || req.body.userId;
  
  // Admin users can access any data
  if (userRole === 'admin') {
    return next();
  }
  
  // Regular users can only access their own data
  if (userId !== resourceUserId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  next();
}
```

### 4.2 Admin Access Control
```typescript
// Middleware to validate admin access
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const userRole = req.user?.role;
  
  if (userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  // Log admin access
  logAuditEvent(req.user.id, 'ADMIN_ACCESS', 'admin', 'admin', {
    endpoint: req.path,
    method: req.method
  });
  
  next();
}
```

### 4.3 Cal.com User Mapping
```typescript
// Ensure Cal.com operations are scoped to correct user
async function getCalUserContext(userId: string) {
  const user = await User.findById(userId);
  if (!user || !user.calUserId) {
    throw new Error('User not found or not connected to Cal.com');
  }
  
  return {
    calUserId: user.calUserId,
    calAccessToken: await decryptToken(user.calAccessToken),
    calUsername: user.calUsername
  };
}
```

---

## 5. Sensitive Data Protection

### 5.1 Encryption Strategy
```typescript
// Encrypt sensitive form responses
export async function encryptSensitiveData(data: any, userId: string): Promise<string> {
  const key = await getEncryptionKey(userId);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher('aes-256-gcm', key);
  cipher.setAAD(Buffer.from(userId));
  
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return JSON.stringify({
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  });
}

// Decrypt sensitive data
export async function decryptSensitiveData(encryptedData: string, userId: string): Promise<any> {
  const { encrypted, iv, authTag } = JSON.parse(encryptedData);
  const key = await getEncryptionKey(userId);
  
  const decipher = crypto.createDecipher('aes-256-gcm', key);
  decipher.setAAD(Buffer.from(userId));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return JSON.parse(decrypted);
}
```

### 5.2 Access Logging
```typescript
// Log all access to sensitive data
export async function logSensitiveDataAccess(
  userId: string,
  resourceType: string,
  resourceId: string,
  action: string
) {
  await AuditLog.create({
    userId,
    resourceType,
    resourceId,
    action,
    timestamp: new Date(),
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });
}
```

---

## 6. API Security

### 6.1 Request Validation
```typescript
// Validate all incoming requests
export function validateRequest(schema: Joi.Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message
      });
    }
    next();
  };
}
```

### 6.2 Rate Limiting
```typescript
// Implement rate limiting
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts',
  standardHeaders: true,
  legacyHeaders: false
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many API requests',
  standardHeaders: true,
  legacyHeaders: false
});
```

### 6.3 CORS Configuration
```typescript
// Configure CORS for security
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
```

---

## 7. Webhook Security

### 7.1 Webhook Verification
```typescript
// Verify Cal.com webhook signatures
export function verifyCalWebhook(req: Request, res: Response, next: NextFunction) {
  const signature = req.get('X-Cal-Signature');
  const payload = JSON.stringify(req.body);
  
  const expectedSignature = crypto
    .createHmac('sha256', process.env.CAL_WEBHOOK_SECRET!)
    .update(payload)
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid webhook signature' });
  }
  
  next();
}
```

### 7.2 Webhook Processing
```typescript
// Secure webhook processing
app.post('/webhooks/cal', verifyCalWebhook, async (req, res) => {
  try {
    const event = req.body;
    
    // Log webhook receipt
    await logWebhookEvent(event);
    
    // Process event based on type
    switch (event.type) {
      case 'BOOKING_CREATED':
        await handleBookingCreated(event.data);
        break;
      case 'BOOKING_UPDATED':
        await handleBookingUpdated(event.data);
        break;
      // ... other event types
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});
```

---

## 8. Database Security

### 8.1 Connection Security
```typescript
// Secure database connection
const dbConfig = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true,
    ca: process.env.DATABASE_CA_CERT
  },
  entities: [User, Booking, Form, AuditLog],
  synchronize: false, // Never use in production
  logging: process.env.NODE_ENV === 'development'
};
```

### 8.2 Query Security
```typescript
// Use parameterized queries to prevent SQL injection
export async function getBookingsByUser(userId: string, filters: any) {
  const query = `
    SELECT * FROM bookings 
    WHERE user_id = $1 
    AND created_at >= $2 
    AND created_at <= $3
  `;
  
  return await db.query(query, [userId, filters.startDate, filters.endDate]);
}
```

---

## 9. Monitoring & Alerting

### 9.1 Security Monitoring
```typescript
// Monitor for suspicious activity
export async function monitorSecurityEvents() {
  // Check for multiple failed login attempts
  const failedLogins = await AuditLog.find({
    action: 'LOGIN_FAILED',
    timestamp: { $gte: new Date(Date.now() - 15 * 60 * 1000) }
  });
  
  if (failedLogins.length > 5) {
    await sendSecurityAlert('Multiple failed login attempts detected');
  }
  
  // Check for unusual data access patterns
  const dataAccess = await AuditLog.find({
    action: 'SENSITIVE_DATA_ACCESS',
    timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
  });
  
  if (dataAccess.length > 100) {
    await sendSecurityAlert('Unusual data access pattern detected');
  }
}
```

### 9.2 Audit Trail
```typescript
// Comprehensive audit logging
export async function logAuditEvent(
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  metadata?: any
) {
  await AuditLog.create({
    userId,
    action,
    resourceType,
    resourceId,
    metadata,
    timestamp: new Date(),
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    sessionId: req.sessionID
  });
}
```

---

## 10. Compliance & Data Protection

### 10.1 GDPR Compliance
- **Data Minimization**: Only collect necessary data
- **Right to Erasure**: Implement data deletion endpoints
- **Data Portability**: Provide data export functionality
- **Consent Management**: Track user consent for data processing

### 10.2 Data Retention
```typescript
// Automated data retention
export async function enforceDataRetention() {
  // Delete old audit logs
  await AuditLog.deleteMany({
    timestamp: { $lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
  });
  
  // Archive old bookings
  await Booking.updateMany(
    { 
      endTime: { $lt: new Date(Date.now() - 7 * 365 * 24 * 60 * 60 * 1000) },
      status: 'completed'
    },
    { archived: true }
  );
}
```

---

## 11. Security Checklist

### 11.1 Authentication
- [ ] Implement proper state parameter validation
- [ ] Use secure token storage and rotation
- [ ] Implement proper session management
- [ ] Add rate limiting for auth endpoints
- [ ] Log all authentication events

### 11.2 Authorization
- [ ] Implement user context validation
- [ ] Ensure data isolation between users
- [ ] Use principle of least privilege
- [ ] Implement role-based access control (pastor, admin)
- [ ] Validate all user inputs
- [ ] Implement admin access controls
- [ ] Audit all admin actions

### 11.3 Data Protection
- [ ] Encrypt sensitive data at rest
- [ ] Use secure communication (HTTPS)
- [ ] Implement proper key management
- [ ] Add data access logging
- [ ] Implement data retention policies

### 11.4 Admin Security
- [ ] Implement admin role validation
- [ ] Audit all admin actions
- [ ] Restrict admin access to necessary functions
- [ ] Monitor admin user activity
- [ ] Implement admin session management

### 11.5 Monitoring
- [ ] Set up security event monitoring
- [ ] Implement audit logging
- [ ] Add performance monitoring
- [ ] Set up alerting for security events
- [ ] Regular security assessments

---

This security analysis provides a comprehensive framework for implementing secure authentication and data protection in ChurchHub, ensuring proper integration between Cal.com primary authentication and the ChurchHub sidecar API while maintaining the highest security standards for pastoral care applications.
