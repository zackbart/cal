# Database, Authentication & Cal.com Integration Audit - Updated

## Overview
This document provides a comprehensive audit of the database schema, authentication systems, and Cal.com integration within the ChurchHub platform. **Updated after system simplification** - now using a lookup-only Cal.com integration approach with manual user creation. The system implements a sophisticated multi-layered architecture supporting pastoral care scheduling with privacy, security, and compliance considerations.

## Database Architecture

### Database Technology Stack
- **Database**: PostgreSQL
- **ORM**: TypeORM v0.3.27
- **Connection**: Conditional loading based on DATABASE_URL environment variable
- **Synchronization**: Auto-sync in development, manual in production
- **Logging**: Query logging in development mode

### Entity Relationship Model

#### Core Entity Relationships
```
User (1) ──→ (N) Booking
User (1) ──→ (N) Form  
User (1) ──→ (N) Policy
Booking (1) ──→ (N) FormResponse
Booking (1) ──→ (N) ContextSummary
Booking (1) ──→ (N) AuditLog
Form (1) ──→ (N) FormResponse
```

#### Entity Details

##### User Entity
**Purpose**: Represents Cal.com users (pastors) in the system
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cal_user_id INTEGER UNIQUE NOT NULL,  -- Cal.com user ID
  username VARCHAR NOT NULL,            -- Cal.com username
  email VARCHAR NOT NULL,               -- User email
  display_name VARCHAR,                 -- Display name
  is_active BOOLEAN DEFAULT true,       -- Account status
  preferences JSONB,                    -- User preferences
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Key Features:**
- 1:1 mapping with Cal.com users
- JSONB preferences for flexible configuration
- Soft delete capability with is_active flag

##### Booking Entity
**Purpose**: Central entity storing all booking information with privacy controls
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cal_booking_id INTEGER NOT NULL,     -- Cal.com booking ID
  cal_booking_uid VARCHAR,             -- Cal.com booking UID
  user_id UUID REFERENCES users(id),   -- Pastor who owns booking
  event_type_id INTEGER NOT NULL,      -- Cal.com event type ID
  event_type_title VARCHAR,            -- Event type name
  event_type_slug VARCHAR,             -- Event type slug
  title VARCHAR NOT NULL,              -- Booking title
  description TEXT,                    -- Booking description
  start_time TIMESTAMP NOT NULL,       -- Booking start
  end_time TIMESTAMP NOT NULL,         -- Booking end
  time_zone VARCHAR,                   -- Booking timezone
  duration INTEGER NOT NULL,           -- Duration in minutes
  location VARCHAR,                    -- Meeting location
  attendees JSONB,                     -- Attendee information
  attendee_emails JSONB,               -- Extracted emails
  attendee_names JSONB,                -- Extracted names
  sensitivity VARCHAR DEFAULT 'Medium' CHECK (sensitivity IN ('High', 'Medium', 'Low')),
  is_anonymous BOOLEAN DEFAULT false,  -- Anonymous booking flag
  provider_ids JSONB,                  -- External calendar provider IDs
  encrypted_intake TEXT,               -- AES-GCM encrypted intake data
  redacted_description TEXT,           -- Redacted description for external calendars
  metadata JSONB,                      -- Additional metadata
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'ACCEPTED', 'PENDING', 'CANCELLED', 'REJECTED')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Privacy & Security Features:**
- **Sensitivity Levels**: High/Medium/Low classification for data handling
- **Anonymous Bookings**: Support for confidential pastoral care
- **Encrypted Intake**: AES-GCM encryption for sensitive questionnaire data
- **Redacted Descriptions**: Safe descriptions for external calendar events
- **Audit Trail**: Complete audit logging for compliance

##### Form Entity
**Purpose**: Dynamic form definitions with branching logic
```sql
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),   -- Form owner
  name VARCHAR NOT NULL,               -- Form name
  description TEXT,                    -- Form description
  schema JSONB NOT NULL,               -- Form definition with fields and branching
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  is_default BOOLEAN DEFAULT false,    -- Default form flag
  settings JSONB,                      -- Form settings and permissions
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Schema Structure:**
```typescript
interface FormSchema {
  fields: Array<{
    id: string;
    type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'time' | 'email' | 'phone';
    label: string;
    required: boolean;
    placeholder?: string;
    options?: string[];
    validation?: Record<string, any>;
    conditional?: {
      field: string;
      operator: 'equals' | 'not_equals' | 'contains' | 'not_contains';
      value: any;
    };
  }>;
  branching: Array<{
    from: string;
    to: string;
    condition: {
      field: string;
      operator: 'equals' | 'not_equals' | 'contains' | 'not_contains';
      value: any;
    };
  }>;
}
```

##### Form Response Entity
**Purpose**: Encrypted storage of form submissions
```sql
CREATE TABLE form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id),   -- Associated form
  booking_id UUID REFERENCES bookings(id), -- Associated booking
  responses JSONB NOT NULL,            -- Encrypted form responses
  submitted_at TIMESTAMP DEFAULT NOW()
);
```

##### Policy Entity
**Purpose**: Scheduling rules and restrictions
```sql
CREATE TABLE policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),   -- Policy owner
  name VARCHAR NOT NULL,               -- Policy name
  description TEXT,                    -- Policy description
  rules JSONB NOT NULL,                -- Policy rules
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  conditions JSONB,                    -- Policy conditions
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Rules Structure:**
```typescript
interface PolicyRules {
  maxMeetingsPerDay?: number;
  maxMeetingsPerWeek?: number;
  bufferTimeMinutes?: number;
  quietHours?: {
    start: string;    // HH:MM format
    end: string;      // HH:MM format
    timezone: string;
  };
  allowedDays?: number[];              // 0-6 (Sunday-Saturday)
  blockedDates?: string[];             // ISO date strings
  advanceBookingDays?: number;
  cancellationDeadlineHours?: number;
}
```

##### Context Summary Entity
**Purpose**: AI-generated meeting summaries
```sql
CREATE TABLE context_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id), -- Associated booking
  summary TEXT NOT NULL,               -- Encrypted AI summary
  topic VARCHAR,                       -- Meeting topic
  sensitivity VARCHAR DEFAULT 'Medium' CHECK (sensitivity IN ('High', 'Medium', 'Low')),
  generated_at TIMESTAMP DEFAULT NOW()
);
```

##### Audit Log Entity
**Purpose**: Complete audit trail for compliance
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR NOT NULL,             -- Action performed
  entity_type VARCHAR NOT NULL,        -- Entity type
  entity_id VARCHAR NOT NULL,          -- Entity ID
  user_id UUID NOT NULL,               -- User who performed action
  booking_id UUID REFERENCES bookings(id), -- Associated booking (nullable)
  metadata JSONB,                      -- Additional context
  timestamp TIMESTAMP DEFAULT NOW()
);
```

##### Pastor Entity
**Purpose**: Legacy pastor management (standalone)
```sql
CREATE TABLE pastors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR NOT NULL,           -- Pastor username
  email VARCHAR NOT NULL,              -- Pastor email
  display_name VARCHAR,                -- Display name
  is_active BOOLEAN DEFAULT true,      -- Account status
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Database Security Features

#### Encryption
- **AES-GCM Encryption**: For sensitive intake data and AI summaries
- **Field-Level Encryption**: Selective encryption based on sensitivity levels
- **Key Management**: Environment-based encryption keys

#### Data Classification
- **Sensitivity Levels**: High/Medium/Low classification system
- **Anonymous Bookings**: Support for confidential pastoral care
- **Redaction**: Safe data for external calendar integration

#### Audit & Compliance
- **Complete Audit Trail**: All operations logged with metadata
- **Data Retention**: Configurable retention policies
- **GDPR Compliance**: Data purging and anonymization capabilities

## Authentication Architecture

### Multi-Layer Authentication System

#### 1. Stack Auth Integration
**Purpose**: External authentication provider for user management

**Configuration:**
```typescript
// API Configuration
STACK_PROJECT_ID=your_project_id
STACK_SECRET_SERVER_KEY=your_secret_key

// Web Configuration  
NEXT_PUBLIC_STACK_PROJECT_ID=your_project_id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_client_key
STACK_SECRET_SERVER_KEY=your_secret_key
```

**Flow:**
1. **User Registration/Login**: Handled by Stack Auth
2. **Token Validation**: Server-side validation against Stack Auth API
3. **Cal.com Token Generation**: Creates Cal.com managed user tokens
4. **Session Management**: HTTP-only cookies for secure storage

**StackAuthService Features:**
- User validation against Stack Auth API
- Cal.com managed user creation
- Token generation and management
- Error handling and logging

#### 2. JWT Authentication System
**Purpose**: Internal authentication for API access

**Configuration:**
```typescript
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d  // Access token
REFRESH_EXPIRES_IN=30d  // Refresh token
```

**Features:**
- **Access Tokens**: 7-day expiration with secure HTTP-only cookies
- **Refresh Tokens**: 30-day expiration for token renewal
- **Pastor Validation**: Verifies pastor exists in Cal.com managed users
- **Multi-Extraction**: Supports Bearer tokens, query parameters, and cookies

**JwtStrategy Implementation:**
```typescript
// Token extraction from multiple sources
jwtFromRequest: ExtractJwt.fromExtractors([
  ExtractJwt.fromAuthHeaderAsBearerToken(),
  ExtractJwt.fromUrlQueryParameter('token'),
  (request) => request?.cookies?.accessToken
])

// Pastor validation on each request
async validate(payload: PastorPayload): Promise<PastorPayload> {
  const managedUser = await this.authService['tokensService'].getExistingManagedUser(payload.username);
  if (!managedUser) {
    throw new UnauthorizedException('Pastor no longer exists');
  }
  return payload;
}
```

#### 3. Cal.com Managed User System (Simplified)
**Purpose**: Integration with Cal.com platform for booking management using lookup-only approach

**CalLookupService Features:**
- **User Lookup Only**: No automatic user creation - manual setup required
- **Fuzzy Matching**: Username resolution with exact and partial matching
- **Token Generation**: Simple token generation for existing users
- **API Integration**: Direct Cal.com API communication
- **Error Handling**: Clear error messages when users don't exist

**Simplified Managed User Flow:**
1. **User Lookup**: Search existing Cal.com managed users by username/email
2. **Validation**: Verify user exists (created manually in Cal.com)
3. **Token Generation**: Generate access token for valid users
4. **Error Handling**: Clear error if user must be created manually

## Cal.com Integration Architecture

### Integration Components

#### 1. Cal.com API Integration
**Configuration:**
```typescript
CAL_API_URL=https://api.cal.com
CAL_CLIENT_ID=your_client_id
CAL_CLIENT_SECRET=your_client_secret
```

**API Endpoints Used:**
- `GET /v2/users/username/{username}` - Lookup user by username
- `GET /v2/oauth-clients/{clientId}/users` - List managed users (fallback)
- `POST /v2/oauth/token` - Client credentials flow
- Webhook endpoints for booking events

#### 2. Webhook Processing System
**WebhooksService Features:**
- **Booking Created**: Complete booking synchronization
- **Booking Updated**: Status and data updates
- **User Management**: Automatic user record creation
- **Audit Logging**: Complete audit trail for all operations

**Booking Processing Flow:**
1. **User Resolution**: Find or create user record
2. **Booking Creation**: Store booking with all metadata
3. **Audit Logging**: Log all operations for compliance
4. **Future Processing**: Schedule JIT validation and context summaries

#### 3. Cal.com Embed Integration
**Frontend Integration:**
```typescript
<Cal
  calLink={`${username}`}
  config={{
    name: username || 'User',
    email: `${username || 'user'}@example.com`,
    notes: `Reason: ${questionnaireData?.discussionTopic}
Sensitivity: ${questionnaireData?.sensitivity}
Attendees: ${questionnaireData?.attendees}
Location: ${questionnaireData?.location}
Preparation: ${questionnaireData?.preparation}`,
    location: questionnaireData?.location
  }}
/>
```

**Features:**
- **Dynamic Username**: Route-based user identification
- **Pre-filled Data**: Questionnaire data passed to booking form
- **Access Token**: Secure token-based authentication
- **Error Handling**: Graceful handling of authentication failures

### Data Flow Architecture

#### 1. User Authentication Flow
```
Stack Auth → API Validation → Cal.com Token → Frontend Access
     ↓              ↓              ↓              ↓
User Login → Server Validation → Token Generation → Booking Access
```

#### 2. Booking Creation Flow
```
Questionnaire → Cal.com Embed → Webhook → Database → Audit Log
      ↓              ↓            ↓          ↓          ↓
Form Data → Booking Interface → Event → Storage → Compliance
```

#### 3. Data Security Flow
```
Sensitive Data → Encryption → Database → Decryption → AI Processing
      ↓              ↓           ↓          ↓           ↓
Intake Forms → AES-GCM → Storage → Decrypt → Context Summary
```

## Security Implementation

### Data Protection
- **Field-Level Encryption**: AES-GCM for sensitive data
- **Sensitivity Classification**: High/Medium/Low data handling
- **Anonymous Bookings**: Confidential pastoral care support
- **Data Redaction**: Safe external calendar integration

### Authentication Security
- **Multi-Factor Authentication**: Stack Auth + JWT + Cal.com
- **Secure Token Storage**: HTTP-only cookies
- **Token Validation**: Real-time pastor verification
- **Session Management**: Automatic token refresh

### API Security
- **CORS Configuration**: Restricted to frontend domain
- **Input Validation**: Comprehensive validation with class-validator
- **Error Handling**: Secure error messages without sensitive data
- **Rate Limiting**: Protection against abuse (planned)

### Compliance Features
- **Audit Logging**: Complete operation audit trail
- **Data Retention**: Configurable retention policies
- **GDPR Compliance**: Data purging and anonymization
- **Privacy Controls**: User consent and data handling

## Background Processing Architecture

### Worker System (`/worker/`)
**Technology Stack:**
- **Queue System**: BullMQ with Redis
- **Job Processing**: TypeScript workers
- **Database**: Shared PostgreSQL connection
- **Concurrency**: Configurable worker concurrency

**Job Types:**
1. **JIT Validation**: Just-in-time slot validation
2. **Reminder System**: Email/SMS reminders
3. **AI Summaries**: Context summary generation
4. **Data Purging**: Sensitive data cleanup

**Worker Configuration:**
```typescript
const workers = [
  new Worker('jit-validate-slot', jitValidateSlot, { concurrency: 5 }),
  new Worker('send-reminder', sendReminder, { concurrency: 10 }),
  new Worker('generate-summary', generateSummary, { concurrency: 3 }),
  new Worker('purge-sensitive', purgeSensitive, { concurrency: 1 }),
];
```

## Implementation Status

### ✅ Completed Features
- **Database Schema**: Complete entity model with relationships
- **Authentication**: Multi-layer authentication system with Stack Auth
- **Cal.com Integration**: Simplified lookup-only managed user system
- **Data Security**: Encryption and sensitivity classification
- **Audit System**: Complete audit trail implementation
- **API Integration**: Cal.com API and webhook handling
- **Simplified Architecture**: Reduced complexity with manual user creation

### 🚧 In Progress / TODO
- **Background Jobs**: Complete worker implementation
- **AI Integration**: Context summary generation
- **Policy Enforcement**: Scheduling rule implementation
- **Data Purging**: Automated retention management
- **Performance**: Database indexing and optimization
- **Monitoring**: Health checks and observability

### 🔄 Integration Points
- **Stack Auth**: User authentication and management
- **Cal.com Platform**: Booking management and webhooks (lookup-only)
- **PostgreSQL**: Data persistence and relationships
- **Redis**: Background job queue (planned)
- **AI Services**: Context summary generation (planned)

## Key Strengths

1. **Comprehensive Data Model**: Rich entity relationships for pastoral care
2. **Multi-Layer Security**: Encryption, authentication, and audit trails
3. **Privacy-First Design**: Anonymous bookings and data classification
4. **Simplified Cal.com Integration**: Lookup-only approach reduces complexity
5. **Compliance Ready**: GDPR and audit requirements
6. **Extensible Architecture**: Ready for AI and advanced features
7. **Background Processing**: Scalable job processing system
8. **Manual User Control**: Explicit user creation process for better control

## Areas for Improvement

1. **Database Optimization**: Indexing and query optimization
2. **Background Jobs**: Complete worker implementation
3. **AI Integration**: Context summary and analysis
4. **Policy Engine**: Advanced scheduling rules
5. **Monitoring**: Health checks and observability
6. **Performance**: Caching and optimization strategies
7. **Testing**: Comprehensive test coverage
8. **Documentation**: API documentation and schemas

## Deployment Considerations

### Environment Configuration
- **Database**: PostgreSQL with connection pooling
- **Redis**: For background job processing
- **Environment Variables**: Secure configuration management
- **SSL/TLS**: Encrypted connections for all services

### Scaling Considerations
- **Database**: Read replicas and connection pooling
- **Workers**: Horizontal scaling of background jobs
- **API**: Load balancing and rate limiting
- **Caching**: Redis for session and data caching

### Security Considerations
- **Encryption**: End-to-end encryption for sensitive data
- **Access Control**: Role-based access control
- **Audit**: Complete audit trail for compliance
- **Backup**: Encrypted backups with retention policies

## Simplified Cal.com Integration Benefits

### System Simplification
The recent simplification of the Cal.com integration provides several key benefits:

#### 1. **Reduced Complexity**
- **No Automatic User Creation**: Eliminates complex user synchronization logic
- **Clear Error Messages**: Users get explicit feedback when Cal.com users don't exist
- **Simplified Codebase**: Removed complex user management and creation logic
- **Easier Debugging**: Clear separation between lookup and creation processes

#### 2. **Better Control**
- **Manual User Creation**: Administrators have full control over user creation
- **Explicit Setup Process**: Clear process for setting up new pastors
- **No Race Conditions**: Eliminates potential race conditions in user creation
- **Predictable Behavior**: System behavior is more predictable and testable

#### 3. **Improved Reliability**
- **Fewer API Calls**: Reduced dependency on Cal.com API for user creation
- **Better Error Handling**: Clear error messages when users don't exist
- **Reduced Failure Points**: Fewer potential points of failure in the system
- **Easier Testing**: Simpler system is easier to test and validate

#### 4. **Maintenance Benefits**
- **Easier Updates**: Simpler codebase is easier to maintain and update
- **Clear Documentation**: Easier to document and understand the system
- **Reduced Dependencies**: Fewer complex dependencies to manage
- **Better Monitoring**: Simpler system is easier to monitor and debug

### User Setup Process
The new simplified process for setting up a pastor:

1. **Create Stack Auth User**: User registers/logs in through Stack Auth
2. **Get Stack User ID**: System provides the Stack User ID (e.g., `cmgdzlviq0003qd1r1ljlj91a`)
3. **Create Cal.com User**: Administrator manually creates Cal.com managed user with Stack User ID as username
4. **Test Integration**: System can now lookup and authenticate the user

This process ensures that both systems are properly synchronized and reduces the complexity of the integration.
