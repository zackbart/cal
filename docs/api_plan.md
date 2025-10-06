# ChurchHub API Implementation Plan

**Version:** 1.0  
**Date:** 2025-01-27  
**Integration:** NestJS + Cal.com Primary Auth + ChurchHub Sidecar

## Overview

This plan outlines the API implementation for ChurchHub Scheduler, focusing on supporting the frontend requirements while maintaining security, scalability, and integration with Cal.com primary authentication.

---

## 1. API Architecture

### 1.1 Current Structure
```
/api
├── /auth (Cal.com primary authentication)
├── /bookings (booking management)
├── /forms (questionnaire builder)
├── /webhooks (Cal.com webhooks)
├── /health (system health)
└── /tokens (Cal.com token management)
```

### 1.2 Enhanced Structure
```
/api
├── /auth (Cal.com primary authentication)
│   ├── /auth/signup (ChurchHub signup)
│   ├── /auth/login (ChurchHub login)
│   ├── /auth/cal/callback (Cal.com OAuth callback)
│   └── /auth/cal/refresh (Cal.com token refresh)
├── /pastors (pastor profile management)
├── /bookings (booking CRUD + sensitive data)
├── /forms (questionnaire builder + templates)
├── /availability (calendar integration)
├── /webhooks (Cal.com + external integrations)
├── /analytics (usage statistics)
├── /health (system monitoring)
└── /admin (system administration)
    ├── /admin/users (user management)
    ├── /admin/system (system settings)
    └── /admin/audit (audit logs)
```

---

## 2. Authentication & Authorization

### 2.1 ChurchHub Signup
**Endpoint:** `POST /auth/signup`
**Purpose:** Create new ChurchHub account with Cal.com integration

**Request:**
```typescript
{
  email: string;
  name: string;
  password: string;
  churchName: string;
  bio?: string;
  schedulingUsername?: string;
}
```

**Response:**
```typescript
{
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    churchName: string;
    role: 'pastor' | 'admin';
    calUserId: string;
    schedulingLink: string;
  };
  accessToken: string;
  refreshToken: string;
}
```

### 2.2 ChurchHub Login
**Endpoint:** `POST /auth/login`
**Purpose:** Authenticate existing ChurchHub users

**Request:**
```typescript
{
  email: string;
  password: string;
}
```

**Response:**
```typescript
{
  user: {
    id: string;
    email: string;
    name: string;
    churchName: string;
    role: 'pastor' | 'admin';
    calUserId: string;
  };
  accessToken: string;
  refreshToken: string;
}
```

### 2.3 Cal.com OAuth Callback
**Endpoint:** `POST /auth/cal/callback`
**Purpose:** Handle Cal.com OAuth callbacks for existing users

**Request:**
```typescript
{
  code: string;
  state: string;
}
```

**Response:**
```typescript
{
  user: {
    id: string;
    email: string;
    name: string;
    churchName: string;
    role: 'pastor' | 'admin';
    calUserId: string;
  };
  accessToken: string;
  refreshToken: string;
}
```

### 2.4 Cal.com Token Management
**Endpoint:** `POST /auth/cal/refresh`
**Purpose:** Refresh expired Cal.com access tokens

**Request:**
```typescript
{
  refreshToken: string;
  userId: string;
}
```

**Response:**
```typescript
{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
```

### 2.5 JWT Middleware
- Validate Cal.com tokens
- Extract user context
- Handle token refresh
- Audit authentication events

---

## 3. Pastor Management

### 3.1 Pastor Profile
**Endpoint:** `GET /pastors/me`
**Purpose:** Get current pastor's profile and settings

**Response:**
```typescript
{
  id: string;
  email: string;
  name: string;
  bio?: string;
  churchName: string;
  calUserId: string;
  calUsername: string;
  role: 'pastor' | 'admin';
  isActive: boolean;
  schedulingLink: string;
  calendarIntegrations: {
    google: boolean;
    outlook: boolean;
    apple: boolean;
  };
  settings: {
    timezone: string;
    workingHours: WorkingHours;
    bufferTime: number;
    maxMeetingsPerDay: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

**Endpoint:** `PUT /pastors/me`
**Purpose:** Update pastor profile and settings

**Request:**
```typescript
{
  name?: string;
  bio?: string;
  churchName?: string;
  settings?: {
    timezone?: string;
    workingHours?: WorkingHours;
    bufferTime?: number;
    maxMeetingsPerDay?: number;
  };
}
```

### 3.2 Public Pastor Profile
**Endpoint:** `GET /pastors/[username]`
**Purpose:** Get public pastor profile for booking pages

**Response:**
```typescript
{
  id: string;
  name: string;
  bio?: string;
  churchName: string;
  calUsername: string;
  eventTypes: EventType[];
  isActive: boolean;
  schedulingLink: string;
}
```

---

## 4. Booking Management

### 4.1 Bookings List
**Endpoint:** `GET /bookings`
**Purpose:** Get pastor's bookings with filtering and pagination

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  status?: 'upcoming' | 'past' | 'cancelled';
  eventType?: string;
  includeSensitive?: boolean;
}
```

**Response:**
```typescript
{
  bookings: Booking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### 4.2 Booking Details
**Endpoint:** `GET /bookings/[id]`
**Purpose:** Get detailed booking information with sensitive data

**Response:**
```typescript
{
  id: string;
  calEventId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'completed' | 'cancelled';
  eventType: EventType;
  attendee: {
    name: string;
    email: string;
    phone?: string;
  };
  formResponses: FormResponse[];
  sensitiveData: {
    isSensitive: boolean;
    encryptedData?: string;
    accessLog: AuditLog[];
  };
  summary?: ContextSummary;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.3 Booking Statistics
**Endpoint:** `GET /bookings/stats`
**Purpose:** Get booking statistics for dashboard

**Response:**
```typescript
{
  totalBookings: number;
  upcomingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  bookingsByType: Record<string, number>;
  bookingsByMonth: Array<{
    month: string;
    count: number;
  }>;
  averageMeetingDuration: number;
}
```

---

## 5. Forms & Questionnaires

### 5.1 Forms List
**Endpoint:** `GET /forms`
**Purpose:** Get pastor's custom forms

**Response:**
```typescript
{
  forms: Form[];
  templates: FormTemplate[];
}
```

### 5.2 Form Details
**Endpoint:** `GET /forms/[id]`
**Purpose:** Get form configuration and schema

**Response:**
```typescript
{
  id: string;
  name: string;
  description?: string;
  eventTypeId: string;
  isActive: boolean;
  schema: FormSchema;
  conditionalLogic: ConditionalLogic[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 5.3 Form Builder
**Endpoint:** `POST /forms`
**Purpose:** Create new form

**Request:**
```typescript
{
  name: string;
  description?: string;
  eventTypeId: string;
  schema: FormSchema;
  conditionalLogic?: ConditionalLogic[];
}
```

**Endpoint:** `PUT /forms/[id]`
**Purpose:** Update existing form

**Endpoint:** `DELETE /forms/[id]`
**Purpose:** Delete form (soft delete)

### 5.4 Form Responses
**Endpoint:** `POST /forms/[id]/responses`
**Purpose:** Submit form response during booking

**Request:**
```typescript
{
  bookingId: string;
  responses: Record<string, any>;
  isSensitive: boolean;
}
```

**Endpoint:** `GET /forms/[id]/responses`
**Purpose:** Get form responses for a specific form

---

## 6. Calendar Integration

### 6.1 Calendar Status
**Endpoint:** `GET /availability/status`
**Purpose:** Get calendar integration status

**Response:**
```typescript
{
  google: {
    connected: boolean;
    lastSync?: Date;
    calendars: Calendar[];
  };
  outlook: {
    connected: boolean;
    lastSync?: Date;
    calendars: Calendar[];
  };
  apple: {
    connected: boolean;
    lastSync?: Date;
    calendars: Calendar[];
  };
}
```

### 6.2 Connect Calendar
**Endpoint:** `POST /availability/connect/[provider]`
**Purpose:** Initiate calendar connection

**Response:**
```typescript
{
  authUrl: string;
  state: string;
}
```

### 6.3 Calendar Callback
**Endpoint:** `POST /availability/callback/[provider]`
**Purpose:** Handle calendar connection callback

**Request:**
```typescript
{
  code: string;
  state: string;
}
```

### 6.4 Availability Settings
**Endpoint:** `GET /availability/settings`
**Purpose:** Get availability configuration

**Response:**
```typescript
{
  workingHours: WorkingHours;
  bufferTime: number;
  maxMeetingsPerDay: number;
  blockedTimes: BlockedTime[];
  recurringAvailability: RecurringAvailability[];
}
```

---

## 7. Webhooks & Integrations

### 7.1 Cal.com Webhooks
**Endpoint:** `POST /webhooks/cal`
**Purpose:** Handle Cal.com webhook events

**Events:**
- `BOOKING_CREATED` - New booking created
- `BOOKING_UPDATED` - Booking modified
- `BOOKING_CANCELLED` - Booking cancelled
- `BOOKING_RESCHEDULED` - Booking rescheduled

**Handler Logic:**
```typescript
async handleCalWebhook(event: CalWebhookEvent) {
  switch (event.type) {
    case 'BOOKING_CREATED':
      await this.createBooking(event.data);
      break;
    case 'BOOKING_UPDATED':
      await this.updateBooking(event.data);
      break;
    case 'BOOKING_CANCELLED':
      await this.cancelBooking(event.data);
      break;
  }
}
```

### 7.2 Form Response Webhook
**Endpoint:** `POST /webhooks/forms`
**Purpose:** Handle form submission during booking

### 7.3 Calendar Sync Webhooks
**Endpoint:** `POST /webhooks/calendar/[provider]`
**Purpose:** Handle calendar sync events

---

## 8. AI Integration & Summaries

### 8.1 AI Summary Generation
**Endpoint:** `POST /ai/summarize`
**Purpose:** Generate AI-powered booking summaries from form responses

**Request:**
```typescript
{
  bookingId: string;
  formResponses: FormResponse[];
  meetingType: string;
  sensitivity: 'High' | 'Medium' | 'Low';
}
```

**Response:**
```typescript
{
  summary: {
    id: string;
    bookingId: string;
    encryptedSummary: string;
    metadata: {
      topic: string;
      participants: string[];
      sensitivity: 'High' | 'Medium' | 'Low';
      location: string;
      when: string;
      duration: number;
      plainText: string;
      generatedAt: Date;
      method: 'rule-based' | 'ai-generated';
    };
    expiresAt: Date;
  };
}
```

### 8.2 AI Service Integration
**Endpoint:** `POST /ai/process-booking`
**Purpose:** Process booking data through AI pipeline

**AI Pipeline:**
1. **Data Extraction**: Extract form responses and booking details
2. **PII Sanitization**: Remove or mask sensitive personal information
3. **Context Analysis**: Analyze meeting context and pastoral needs
4. **Summary Generation**: Create concise, actionable summary
5. **Encryption**: Encrypt sensitive summary data
6. **Storage**: Store with retention policies

### 8.3 AI Configuration
**Endpoint:** `GET /ai/config`
**Purpose:** Get AI service configuration

**Response:**
```typescript
{
  provider: 'openai' | 'anthropic' | 'local';
  model: string;
  maxTokens: number;
  temperature: number;
  promptTemplate: string;
  piiDetection: boolean;
  retentionDays: number;
}
```

**Endpoint:** `PUT /ai/config`
**Purpose:** Update AI service configuration

### 8.4 AI Prompt Templates
**Pastoral Context Prompt:**
```
You are a pastoral care assistant. Analyze the following booking information and create a concise, actionable summary for a pastor preparing for a meeting.

Meeting Details:
- Type: {meetingType}
- Attendee: {attendeeName}
- Date/Time: {when}
- Duration: {duration} minutes
- Location: {location}

Form Responses:
{formResponses}

Create a summary that includes:
1. Main topic/concern (1-2 sentences)
2. Key points to address
3. Sensitivity level and appropriate approach
4. Suggested preparation or resources
5. Any urgent matters requiring immediate attention

Keep the summary factual, compassionate, and focused on pastoral care needs. Do not include personal details that aren't relevant to the meeting preparation.
```

---

## 9. Policy Enforcement

### 9.1 Scheduling Policies
**Endpoint:** `GET /policies`
**Purpose:** Get user's scheduling policies

**Response:**
```typescript
{
  policies: {
    maxMeetingsPerDay: number;
    maxMeetingsPerWeek: number;
    bufferTimeMinutes: number;
    quietHours: {
      start: string; // "22:00"
      end: string;   // "08:00"
      timezone: string;
    };
    workingHours: {
      start: string; // "09:00"
      end: string;   // "17:00"
      timezone: string;
      days: string[]; // ["monday", "tuesday", ...]
    };
  };
}
```

**Endpoint:** `PUT /policies`
**Purpose:** Update scheduling policies

### 9.2 Policy Validation
**Endpoint:** `POST /policies/validate`
**Purpose:** Validate booking against policies

**Request:**
```typescript
{
  startTime: string;
  endTime: string;
  meetingType: string;
}
```

**Response:**
```typescript
{
  isValid: boolean;
  violations: string[];
  suggestions: string[];
}
```

---

## 10. Admin Management

### 10.1 User Management
**Endpoint:** `GET /admin/users`
**Purpose:** Get all users in the system (admin only)

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  role?: 'pastor' | 'admin';
  isActive?: boolean;
  search?: string;
}
```

**Response:**
```typescript
{
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

**Endpoint:** `POST /admin/users`
**Purpose:** Create new user account (admin only)

**Request:**
```typescript
{
  email: string;
  name: string;
  role: 'pastor' | 'admin';
  bio?: string;
  timezone?: string;
}
```

**Endpoint:** `PUT /admin/users/[id]`
**Purpose:** Update user information (admin only)

**Request:**
```typescript
{
  name?: string;
  bio?: string;
  role?: 'pastor' | 'admin';
  isActive?: boolean;
  settings?: {
    timezone?: string;
    workingHours?: WorkingHours;
    bufferTime?: number;
    maxMeetingsPerDay?: number;
  };
}
```

**Endpoint:** `DELETE /admin/users/[id]`
**Purpose:** Delete user account (admin only)

### 8.2 System Settings
**Endpoint:** `GET /admin/system/settings`
**Purpose:** Get system-wide settings (admin only)

**Response:**
```typescript
{
  features: {
    calendarIntegrations: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    auditLogging: boolean;
  };
  security: {
    passwordPolicy: PasswordPolicy;
    sessionTimeout: number;
    maxLoginAttempts: number;
  };
  limits: {
    maxUsers: number;
    maxBookingsPerUser: number;
    dataRetentionDays: number;
  };
}
```

**Endpoint:** `PUT /admin/system/settings`
**Purpose:** Update system settings (admin only)

**Request:**
```typescript
{
  features?: {
    calendarIntegrations?: boolean;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    auditLogging?: boolean;
  };
  security?: {
    passwordPolicy?: PasswordPolicy;
    sessionTimeout?: number;
    maxLoginAttempts?: number;
  };
  limits?: {
    maxUsers?: number;
    maxBookingsPerUser?: number;
    dataRetentionDays?: number;
  };
}
```

### 8.3 Audit Logs
**Endpoint:** `GET /admin/audit/logs`
**Purpose:** Get system audit logs (admin only)

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
}
```

**Response:**
```typescript
{
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

**Endpoint:** `GET /admin/audit/logs/[id]`
**Purpose:** Get detailed audit log entry (admin only)

**Response:**
```typescript
{
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata: any;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}
```

---

## 9. Analytics & Reporting

### 9.1 Usage Analytics
**Endpoint:** `GET /analytics/usage`
**Purpose:** Get usage statistics

**Response:**
```typescript
{
  totalBookings: number;
  activeForms: number;
  calendarConnections: number;
  storageUsage: {
    used: number;
    limit: number;
  };
  lastActivity: Date;
}
```

### 9.2 Booking Reports
**Endpoint:** `GET /analytics/bookings`
**Purpose:** Get detailed booking analytics

**Query Parameters:**
```typescript
{
  startDate: string;
  endDate: string;
  groupBy: 'day' | 'week' | 'month';
  eventType?: string;
}
```

---

## 10. Security & Compliance

### 10.1 Sensitive Data Handling
**Encryption:**
- AES-GCM encryption for sensitive form responses
- Key rotation every 90 days
- Secure key storage in environment variables

**Access Control:**
- Role-based access control (RBAC)
- Audit logging for all sensitive data access
- Automatic data retention policies

### 10.2 Audit Logging
**Endpoint:** `GET /audit/logs`
**Purpose:** Get audit logs for compliance

**Response:**
```typescript
{
  logs: AuditLog[];
  pagination: Pagination;
}
```

**Audit Events:**
- Data access (viewing sensitive information)
- Data modification (updating forms, settings)
- Authentication events (login, logout, token refresh)
- Calendar integration events
- Webhook processing

### 10.3 Data Retention
**Policies:**
- Booking data: 7 years (legal requirement)
- Form responses: 3 years
- Audit logs: 1 year
- Temporary data: 30 days

**Implementation:**
- Automated cleanup jobs
- Soft delete with hard delete after retention period
- Data export before deletion

---

## 11. Error Handling & Monitoring

### 11.1 Error Responses
**Standard Error Format:**
```typescript
{
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: Date;
    requestId: string;
  }
}
```

**Error Codes:**
- `AUTH_REQUIRED` - Authentication required
- `AUTH_INVALID` - Invalid authentication
- `PERMISSION_DENIED` - Insufficient permissions
- `RESOURCE_NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Input validation failed
- `RATE_LIMIT_EXCEEDED` - Rate limit exceeded
- `CAL_INTEGRATION_ERROR` - Cal.com integration error
- `CALENDAR_SYNC_ERROR` - Calendar sync error

### 11.2 Health Checks
**Endpoint:** `GET /health`
**Purpose:** System health monitoring

**Response:**
```typescript
{
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    database: ServiceStatus;
    calApi: ServiceStatus;
    calendarIntegrations: ServiceStatus;
    encryption: ServiceStatus;
  };
  timestamp: Date;
}
```

---

## 12. Rate Limiting & Performance

### 12.1 Rate Limiting
- Authentication endpoints: 5 requests/minute
- Booking endpoints: 100 requests/minute
- Form endpoints: 50 requests/minute
- Webhook endpoints: 1000 requests/minute

### 12.2 Caching Strategy
- Pastor profiles: 5 minutes
- Form schemas: 1 hour
- Calendar status: 1 minute
- Booking statistics: 5 minutes

### 12.3 Database Optimization
- Indexed queries for bookings by date
- Pagination for large datasets
- Connection pooling
- Query optimization

---

## 13. Testing Strategy

### 13.1 Unit Tests
- Service layer testing
- Authentication logic
- Encryption/decryption functions
- Form validation

### 13.2 Integration Tests
- Cal.com API integration
- Calendar provider integration
- Webhook handling
- Database operations

### 13.3 E2E Tests
- Complete booking flow
- Form submission
- Calendar integration
- Authentication flow

---

## 14. Deployment & Environment

### 14.1 Environment Variables
```env
# Database
DATABASE_URL=
DATABASE_SSL=true

# Cal.com (Primary Auth)
CAL_CLIENT_ID=
CAL_CLIENT_SECRET=
CAL_API_URL=https://api.cal.com/v2
CAL_REDIRECT_URI=https://churchhub.com/auth/cal/callback

# Encryption
ENCRYPTION_KEY=
ENCRYPTION_ALGORITHM=aes-256-gcm

# Monitoring
SENTRY_DSN=
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

### 14.2 Database Migrations
- Automated migration system
- Version control for schema changes
- Rollback capabilities
- Data migration scripts

---

This API plan provides a comprehensive roadmap for implementing the ChurchHub backend that supports all frontend requirements while maintaining security, scalability, and proper integration with Cal.com primary authentication.
