# API Implementation Audit

## Overview
The ChurchHub Sidecar API is a NestJS-based backend service that provides authentication, booking management, and Cal.com integration for pastoral care scheduling. The API serves as a bridge between the web frontend and Cal.com's platform.

## Architecture

### Framework & Dependencies
- **Framework**: NestJS v11.1.6
- **Database**: PostgreSQL with TypeORM v0.3.27
- **Authentication**: JWT with Passport.js
- **Validation**: class-validator & class-transformer
- **Runtime**: Node.js with TypeScript

### Core Modules

#### 1. App Module (`src/app.module.ts`)
- **Configuration**: Global ConfigModule with environment variables
- **Database**: Conditional TypeORM setup (only loads if DATABASE_URL provided)
- **CORS**: Enabled for frontend communication
- **Validation**: Global validation pipe with whitelist/forbidNonWhitelisted

#### 2. Authentication Module (`src/auth/`)
**Components:**
- `AuthController`: Handles login/logout/refresh endpoints
- `AuthService`: Core authentication logic with pastor validation
- `StackAuthController`: Stack Auth integration endpoints
- `StackAuthService`: Stack Auth user validation and Cal.com token generation
- `JwtStrategy`: JWT token validation strategy
- `JwtAuthGuard`: Route protection with public route support

**Key Features:**
- Dual authentication system (traditional JWT + Stack Auth)
- HTTP-only cookies for secure token storage
- 7-day access token, 30-day refresh token
- Pastor validation against Cal.com managed users

#### 3. Tokens Module (`src/tokens/`)
**Components:**
- `TokensController`: Cal.com managed user token endpoints
- `TokensService`: Cal.com API integration and managed user management

**Key Features:**
- Cal.com OAuth client credentials flow
- Managed user lookup and token generation
- Username matching with partial/fuzzy logic
- Client access token management

#### 4. Bookings Module (`src/bookings/`)
**Components:**
- `BookingsController`: Booking management endpoints (minimal implementation)
- `BookingsService`: Booking business logic (placeholder)

**Status**: Minimal implementation with TODO placeholders

#### 5. Forms Module (`src/forms/`)
**Components:**
- `FormsController`: Form creation and response endpoints
- `FormsService`: Form management logic (placeholder)

**Status**: Basic structure with TODO placeholders

#### 6. Webhooks Module (`src/webhooks/`)
**Components:**
- `WebhooksController`: Cal.com webhook endpoints
- `WebhooksService`: Comprehensive booking webhook processing

**Key Features:**
- Handles `booking.created` and `booking.updated` events
- User record creation/updates
- Booking data synchronization
- Audit logging for all operations
- TODO: JIT validation, policy enforcement, context summaries

#### 7. Health Module (`src/health/`)
**Components:**
- `HealthController`: Basic health check endpoint

## Database Entities

### Core Entities

#### User Entity (`src/entities/user.entity.ts`)
```typescript
- id: UUID (Primary Key)
- calUserId: number (Cal.com user ID)
- username: string (Cal.com username)
- email: string
- displayName: string
- isActive: boolean
- preferences: JSONB
- Relations: bookings, forms, policies
```

#### Booking Entity (`src/entities/booking.entity.ts`)
```typescript
- id: UUID (Primary Key)
- calBookingId: number (Cal.com booking ID)
- calBookingUid: string (Cal.com booking UID)
- userId: string (Foreign Key)
- eventTypeId: number
- eventTypeTitle: string
- eventTypeSlug: string
- title: string
- description: text
- startTime: timestamp
- endTime: timestamp
- timeZone: string
- duration: number (minutes)
- location: string
- attendees: JSONB array
- attendeeEmails: JSONB array
- attendeeNames: JSONB array
- sensitivity: enum (High/Medium/Low)
- isAnonymous: boolean
- providerIds: JSONB
- encryptedIntake: text (AES-GCM encrypted)
- redactedDescription: text
- metadata: JSONB
- status: enum (pending/confirmed/cancelled/completed/ACCEPTED/PENDING/CANCELLED/REJECTED)
- Relations: user, formResponses, contextSummaries, auditLogs
```

#### Form Entity (`src/entities/form.entity.ts`)
```typescript
- id: UUID (Primary Key)
- userId: string (Foreign Key)
- name: string
- description: text
- schema: JSONB (complex form definition with fields, branching logic)
- status: enum (active/inactive/archived)
- isDefault: boolean
- settings: JSONB (permissions, limits, expiration)
- Relations: user, responses
```

#### Form Response Entity (`src/entities/form-response.entity.ts`)
```typescript
- id: UUID (Primary Key)
- formId: string (Foreign Key)
- bookingId: string (Foreign Key)
- responses: JSONB (encrypted form data)
- submittedAt: timestamp
- Relations: form, booking
```

#### Policy Entity (`src/entities/policy.entity.ts`)
```typescript
- id: UUID (Primary Key)
- userId: string (Foreign Key)
- name: string
- description: text
- rules: JSONB (scheduling rules, limits, restrictions)
- status: enum (active/inactive)
- conditions: JSONB (event types, sensitivity, locations)
- Relations: user
```

#### Context Summary Entity (`src/entities/context-summary.entity.ts`)
```typescript
- id: UUID (Primary Key)
- bookingId: string (Foreign Key)
- summary: text (encrypted AI-generated summary)
- topic: string
- sensitivity: enum (High/Medium/Low)
- generatedAt: timestamp
- Relations: booking
```

#### Audit Log Entity (`src/entities/audit-log.entity.ts`)
```typescript
- id: UUID (Primary Key)
- action: string
- entityType: string
- entityId: string
- userId: string
- bookingId: string (Foreign Key, nullable)
- metadata: JSONB
- timestamp: timestamp
- Relations: booking
```

#### Pastor Entity (`src/entities/pastor.entity.ts`)
```typescript
- id: UUID (Primary Key)
- username: string
- email: string
- displayName: string
- isActive: boolean
- Relations: (standalone entity)
```

## API Endpoints

### Authentication Endpoints
- `POST /auth/login` - Pastor login with JWT tokens
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout and clear cookies
- `GET /auth/me` - Get current pastor info
- `GET /auth/verify` - Verify token validity

### Stack Auth Endpoints
- `POST /auth/stack/cal-token` - Get Cal.com token for Stack user
- `POST /auth/stack/create-cal-user` - Create Cal.com managed user for Stack user
- `GET /auth/stack/validate/:stackUserId` - Validate Stack user

### Cal.com Integration Endpoints
- `POST /tokens/cal/managed-user` - Get managed user token
- `POST /tokens/cal/cleanup-test-users` - Cleanup test users

### Webhook Endpoints
- `POST /webhooks/cal` - Cal.com webhook handler

### Form Endpoints
- `POST /forms` - Create form (TODO)
- `POST /forms/:id/respond` - Submit form response (TODO)

### Health Endpoints
- `GET /health` - Health check

## Configuration

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://...

# Cal.com Integration
CAL_API_URL=https://api.cal.com
CAL_CLIENT_ID=your_client_id
CAL_CLIENT_SECRET=your_client_secret

# Authentication
JWT_SECRET=your_jwt_secret

# Stack Auth
STACK_PROJECT_ID=your_project_id
STACK_SECRET_SERVER_KEY=your_secret_key

# Server
PORT=3001
NODE_ENV=development|production
FRONTEND_URL=http://localhost:3000
```

## Security Features

### Authentication Security
- HTTP-only cookies for token storage
- Secure cookie settings in production
- JWT token validation with expiration
- Pastor existence verification on each request
- Stack Auth integration for external user validation

### Data Protection
- AES-GCM encryption for sensitive intake data
- Redacted descriptions for external calendar events
- Sensitivity levels (High/Medium/Low) for data classification
- Anonymous booking support
- Audit logging for all operations

### API Security
- CORS configuration for frontend
- Global validation pipe with whitelist
- Route protection with JWT guards
- Public route support for health checks

## Implementation Status

### ✅ Completed Features
- Basic NestJS application structure
- JWT authentication system
- Stack Auth integration
- Cal.com managed user token generation
- Database entities and relationships
- Webhook processing for booking events
- Health check endpoint
- CORS and security configuration

### 🚧 In Progress / TODO
- Form creation and response handling
- Booking management endpoints
- JIT slot validation
- AI context summary generation
- Policy enforcement
- Reminder system
- Data purging and retention
- Comprehensive error handling
- API documentation (Swagger)
- Unit and integration tests

### 🔄 Integration Points
- **Cal.com API**: Managed user management, webhook processing
- **Stack Auth**: User validation and authentication
- **PostgreSQL**: Data persistence with TypeORM
- **Redis**: Background job queue (planned)
- **Frontend**: CORS-enabled API communication

## Deployment Configuration

### Railway Configuration (`railway.json`)
- Node.js runtime
- Build command: `npm run build`
- Start command: `npm run start:prod`
- Environment variable support

### Docker Support
- Dockerfile for containerized deployment
- Multi-stage build for production optimization

## Development Scripts
- `npm run start:dev` - Development server with hot reload
- `npm run build` - Production build
- `npm run start:prod` - Production server
- `npm run db:setup` - Database setup script
- `npm run db:reset` - Database reset script

## Key Strengths
1. **Modular Architecture**: Clean separation of concerns with NestJS modules
2. **Dual Authentication**: Support for both traditional JWT and Stack Auth
3. **Comprehensive Data Model**: Rich entity relationships for pastoral care
4. **Security-First**: Encryption, audit logging, and data protection
5. **Cal.com Integration**: Seamless managed user and webhook handling
6. **Extensible Design**: Ready for AI summaries, policies, and advanced features

## Areas for Improvement
1. **Form System**: Complete form creation and response handling
2. **Booking Management**: Implement booking CRUD operations
3. **Background Jobs**: Complete worker implementation
4. **Testing**: Add comprehensive test coverage
5. **Documentation**: API documentation and OpenAPI specs
6. **Error Handling**: Standardized error responses and logging
7. **Performance**: Database indexing and query optimization
8. **Monitoring**: Health checks, metrics, and observability
