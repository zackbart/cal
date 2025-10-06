# ChurchHub Database Schema

**Version:** 1.0  
**Date:** 2025-01-27  
**Purpose:** Single source of truth for ChurchHub database schema and data relationships

## Overview

This document defines the complete database schema for ChurchHub, built on Neon PostgreSQL. The schema supports pastoral scheduling, form management, AI-powered summaries, and comprehensive security features.

---

## Core Entities

### 1. Users Table (`users`)

**Purpose:** Central user management for ChurchHub accounts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| `name` | VARCHAR(255) | NOT NULL | User's full name |
| `churchName` | VARCHAR(255) | NOT NULL | Name of user's church |
| `bio` | TEXT | NULLABLE | User biography/description |
| `role` | ENUM | NOT NULL | 'pastor' or 'admin' |
| `calUserId` | VARCHAR(255) | UNIQUE, NOT NULL | Cal.com user ID for integration |
| `schedulingUsername` | VARCHAR(255) | UNIQUE, NOT NULL | Cal.com scheduling username |
| `schedulingLink` | VARCHAR(500) | NOT NULL | Public scheduling link |
| `isActive` | BOOLEAN | DEFAULT true | Account status |
| `lastLoginAt` | TIMESTAMP | NULLABLE | Last login timestamp |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Account creation time |
| `updatedAt` | TIMESTAMP | DEFAULT NOW() | Last update time |

**Relationships:**
- One-to-many with `bookings`
- One-to-many with `forms`
- One-to-many with `audit_logs`

**Indexes:**
- `idx_users_email` on `email`
- `idx_users_cal_user_id` on `calUserId`
- `idx_users_scheduling_username` on `schedulingUsername`

---

### 2. Bookings Table (`bookings`)

**Purpose:** Store all booking information with Cal.com integration

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique booking identifier |
| `calBookingId` | INTEGER | UNIQUE, NOT NULL | Cal.com booking ID |
| `calBookingUid` | VARCHAR(255) | UNIQUE, NULLABLE | Cal.com booking UID |
| `userId` | UUID | FOREIGN KEY, NOT NULL | Reference to users table |
| `eventTypeId` | INTEGER | NOT NULL | Cal.com event type ID |
| `eventTypeTitle` | VARCHAR(255) | NULLABLE | Cal.com event type title |
| `eventTypeSlug` | VARCHAR(255) | NULLABLE | Cal.com event type slug |
| `title` | VARCHAR(255) | NOT NULL | Booking title |
| `description` | TEXT | NULLABLE | Booking description |
| `startTime` | TIMESTAMP | NOT NULL | Booking start time |
| `endTime` | TIMESTAMP | NOT NULL | Booking end time |
| `timeZone` | VARCHAR(50) | NULLABLE | Booking timezone |
| `duration` | INTEGER | NOT NULL | Duration in minutes |
| `location` | VARCHAR(500) | NULLABLE | Meeting location |
| `attendees` | JSONB | NULLABLE | Array of attendee objects |
| `attendeeEmails` | JSONB | NULLABLE | Extracted attendee emails |
| `attendeeNames` | JSONB | NULLABLE | Extracted attendee names |
| `sensitivity` | ENUM | DEFAULT 'Medium' | 'High', 'Medium', 'Low' |
| `isAnonymous` | BOOLEAN | DEFAULT false | Anonymous booking flag |
| `providerIds` | JSONB | NULLABLE | Calendar provider event IDs |
| `encryptedIntakeData` | TEXT | NULLABLE | AES-GCM encrypted intake data |
| `redactedDescription` | TEXT | NULLABLE | Redacted description for external calendars |
| `metadata` | JSONB | NULLABLE | Additional booking metadata |
| `status` | ENUM | DEFAULT 'pending' | Booking status |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Booking creation time |
| `updatedAt` | TIMESTAMP | DEFAULT NOW() | Last update time |

**Relationships:**
- Many-to-one with `users`
- One-to-many with `form_responses`
- One-to-many with `context_summaries`
- One-to-many with `audit_logs`

**Indexes:**
- `idx_bookings_user_id` on `userId`
- `idx_bookings_cal_booking_id` on `calBookingId`
- `idx_bookings_start_time` on `startTime`
- `idx_bookings_status` on `status`
- `idx_bookings_sensitivity` on `sensitivity`

---

### 3. Forms Table (`forms`)

**Purpose:** Store custom questionnaire configurations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique form identifier |
| `userId` | UUID | FOREIGN KEY, NOT NULL | Reference to users table |
| `name` | VARCHAR(255) | NOT NULL | Form name |
| `description` | TEXT | NULLABLE | Form description |
| `eventTypeId` | INTEGER | NOT NULL | Cal.com event type ID |
| `isActive` | BOOLEAN | DEFAULT true | Form status |
| `schema` | JSONB | NOT NULL | Form field definitions |
| `conditionalLogic` | JSONB | NULLABLE | Conditional logic rules |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Form creation time |
| `updatedAt` | TIMESTAMP | DEFAULT NOW() | Last update time |

**Relationships:**
- Many-to-one with `users`
- One-to-many with `form_responses`

**Indexes:**
- `idx_forms_user_id` on `userId`
- `idx_forms_event_type_id` on `eventTypeId`
- `idx_forms_is_active` on `isActive`

---

### 4. Form Responses Table (`form_responses`)

**Purpose:** Store encrypted form response data

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique response identifier |
| `formId` | UUID | FOREIGN KEY, NOT NULL | Reference to forms table |
| `bookingId` | UUID | FOREIGN KEY, NOT NULL | Reference to bookings table |
| `encryptedData` | TEXT | NOT NULL | AES-GCM encrypted response data |
| `metadata` | JSONB | NULLABLE | Response metadata |
| `redactedData` | JSONB | NULLABLE | Non-sensitive data for analytics |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Response creation time |

**Relationships:**
- Many-to-one with `forms`
- Many-to-one with `bookings`

**Indexes:**
- `idx_form_responses_form_id` on `formId`
- `idx_form_responses_booking_id` on `bookingId`
- `idx_form_responses_created_at` on `createdAt`

---

### 5. Context Summaries Table (`context_summaries`)

**Purpose:** Store AI-generated booking summaries

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique summary identifier |
| `bookingId` | UUID | FOREIGN KEY, NOT NULL | Reference to bookings table |
| `encryptedSummary` | TEXT | NOT NULL | AES-GCM encrypted summary data |
| `metadata` | JSONB | NOT NULL | Summary metadata |
| `expiresAt` | TIMESTAMP | NULLABLE | Retention policy expiration |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Summary creation time |

**Metadata Structure:**
```json
{
  "topic": "string",
  "participants": ["string"],
  "sensitivity": "High|Medium|Low",
  "location": "string",
  "when": "ISO 8601 datetime",
  "duration": "number (minutes)",
  "plainText": "string (1-2 sentences)",
  "generatedAt": "ISO 8601 datetime",
  "method": "rule-based|ai-generated"
}
```

**Relationships:**
- Many-to-one with `bookings`

**Indexes:**
- `idx_context_summaries_booking_id` on `bookingId`
- `idx_context_summaries_expires_at` on `expiresAt`

---

### 6. Audit Logs Table (`audit_logs`)

**Purpose:** Track all system access and changes for security

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique log identifier |
| `userId` | UUID | FOREIGN KEY, NULLABLE | Reference to users table |
| `bookingId` | UUID | FOREIGN KEY, NULLABLE | Reference to bookings table |
| `action` | VARCHAR(100) | NOT NULL | Action performed |
| `resource` | VARCHAR(100) | NOT NULL | Resource accessed |
| `resourceId` | VARCHAR(255) | NULLABLE | Resource identifier |
| `ipAddress` | INET | NULLABLE | User IP address |
| `userAgent` | TEXT | NULLABLE | User agent string |
| `metadata` | JSONB | NULLABLE | Additional log data |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Log creation time |

**Relationships:**
- Many-to-one with `users` (nullable)
- Many-to-one with `bookings` (nullable)

**Indexes:**
- `idx_audit_logs_user_id` on `userId`
- `idx_audit_logs_booking_id` on `bookingId`
- `idx_audit_logs_action` on `action`
- `idx_audit_logs_created_at` on `createdAt`

---

## Calendar Integration Tables

### 7. Calendar Connections Table (`calendar_connections`)

**Purpose:** Store calendar provider connections

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique connection identifier |
| `userId` | UUID | FOREIGN KEY, NOT NULL | Reference to users table |
| `provider` | ENUM | NOT NULL | 'google', 'microsoft', 'apple' |
| `providerUserId` | VARCHAR(255) | NOT NULL | Provider user ID |
| `accessToken` | TEXT | NOT NULL | Encrypted access token |
| `refreshToken` | TEXT | NULLABLE | Encrypted refresh token |
| `tokenExpiresAt` | TIMESTAMP | NULLABLE | Token expiration time |
| `isActive` | BOOLEAN | DEFAULT true | Connection status |
| `lastSyncAt` | TIMESTAMP | NULLABLE | Last sync timestamp |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Connection creation time |
| `updatedAt` | TIMESTAMP | DEFAULT NOW() | Last update time |

**Relationships:**
- Many-to-one with `users`

**Indexes:**
- `idx_calendar_connections_user_id` on `userId`
- `idx_calendar_connections_provider` on `provider`
- `idx_calendar_connections_is_active` on `isActive`

---

## AI Configuration Tables

### 8. AI Configurations Table (`ai_configurations`)

**Purpose:** Store AI service configuration settings

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique config identifier |
| `userId` | UUID | FOREIGN KEY, NULLABLE | User-specific config (nullable for global) |
| `provider` | ENUM | NOT NULL | 'openai', 'anthropic', 'local' |
| `model` | VARCHAR(100) | NOT NULL | AI model identifier |
| `maxTokens` | INTEGER | DEFAULT 1000 | Maximum tokens per request |
| `temperature` | DECIMAL(3,2) | DEFAULT 0.7 | AI response creativity |
| `promptTemplate` | TEXT | NOT NULL | Prompt template for summaries |
| `piiDetection` | BOOLEAN | DEFAULT true | Enable PII detection |
| `retentionDays` | INTEGER | DEFAULT 90 | Summary retention period |
| `isActive` | BOOLEAN | DEFAULT true | Configuration status |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Config creation time |
| `updatedAt` | TIMESTAMP | DEFAULT NOW() | Last update time |

**Relationships:**
- Many-to-one with `users` (nullable for global configs)

**Indexes:**
- `idx_ai_configurations_user_id` on `userId`
- `idx_ai_configurations_provider` on `provider`
- `idx_ai_configurations_is_active` on `isActive`

---

## Policy Management Tables

### 7. Scheduling Policies Table (`scheduling_policies`)

**Purpose:** Store user scheduling policies and constraints

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique policy identifier |
| `userId` | UUID | FOREIGN KEY, NOT NULL | Reference to users table |
| `maxMeetingsPerDay` | INTEGER | DEFAULT 8 | Maximum meetings per day |
| `maxMeetingsPerWeek` | INTEGER | DEFAULT 40 | Maximum meetings per week |
| `bufferTimeMinutes` | INTEGER | DEFAULT 15 | Buffer time between meetings |
| `quietHours` | JSONB | NULLABLE | Quiet hours configuration |
| `workingHours` | JSONB | NULLABLE | Working hours configuration |
| `isActive` | BOOLEAN | DEFAULT true | Policy status |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Policy creation time |
| `updatedAt` | TIMESTAMP | DEFAULT NOW() | Last update time |

**Quiet Hours Structure:**
```json
{
  "start": "22:00",
  "end": "08:00",
  "timezone": "America/New_York",
  "enabled": true
}
```

**Working Hours Structure:**
```json
{
  "start": "09:00",
  "end": "17:00",
  "timezone": "America/New_York",
  "days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
  "enabled": true
}
```

**Relationships:**
- Many-to-one with `users`

**Indexes:**
- `idx_scheduling_policies_user_id` on `userId`
- `idx_scheduling_policies_is_active` on `isActive`

---

## Worker Management Tables

### 8. Worker Jobs Table (`worker_jobs`)

**Purpose:** Track background job execution and status

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique job identifier |
| `jobType` | ENUM | NOT NULL | 'generate-summary', 'send-reminder', 'jit-validate', 'purge-sensitive' |
| `status` | ENUM | DEFAULT 'pending' | 'pending', 'processing', 'completed', 'failed' |
| `payload` | JSONB | NOT NULL | Job payload data |
| `result` | JSONB | NULLABLE | Job execution result |
| `error` | TEXT | NULLABLE | Error message if failed |
| `attempts` | INTEGER | DEFAULT 0 | Number of execution attempts |
| `maxAttempts` | INTEGER | DEFAULT 3 | Maximum retry attempts |
| `scheduledFor` | TIMESTAMP | NULLABLE | Scheduled execution time |
| `startedAt` | TIMESTAMP | NULLABLE | Job start time |
| `completedAt` | TIMESTAMP | NULLABLE | Job completion time |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Job creation time |

**Relationships:**
- None (standalone job tracking)

**Indexes:**
- `idx_worker_jobs_job_type` on `jobType`
- `idx_worker_jobs_status` on `status`
- `idx_worker_jobs_scheduled_for` on `scheduledFor`
- `idx_worker_jobs_created_at` on `createdAt`

---

## System Tables

### 9. System Settings Table (`system_settings`)

**Purpose:** Store global system configuration

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique setting identifier |
| `key` | VARCHAR(100) | UNIQUE, NOT NULL | Setting key |
| `value` | JSONB | NOT NULL | Setting value |
| `description` | TEXT | NULLABLE | Setting description |
| `isEncrypted` | BOOLEAN | DEFAULT false | Value encryption flag |
| `updatedBy` | UUID | FOREIGN KEY, NULLABLE | Reference to users table |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Setting creation time |
| `updatedAt` | TIMESTAMP | DEFAULT NOW() | Last update time |

**Relationships:**
- Many-to-one with `users` (for updatedBy)

**Indexes:**
- `idx_system_settings_key` on `key`
- `idx_system_settings_updated_by` on `updatedBy`

---

## Data Relationships

### Entity Relationship Diagram

```
users (1) ──→ (many) bookings
users (1) ──→ (many) forms
users (1) ──→ (many) calendar_connections
users (1) ──→ (many) ai_configurations
users (1) ──→ (many) audit_logs

bookings (1) ──→ (many) form_responses
bookings (1) ──→ (many) context_summaries
bookings (1) ──→ (many) audit_logs

forms (1) ──→ (many) form_responses
```

---

## Data Security & Encryption

### Encryption Strategy

**AES-256-GCM Encryption Applied To:**
- `form_responses.encryptedData` - All form response data
- `context_summaries.encryptedSummary` - AI-generated summaries
- `calendar_connections.accessToken` - OAuth access tokens
- `calendar_connections.refreshToken` - OAuth refresh tokens
- `system_settings.value` - When `isEncrypted = true`

**Encryption Key Management:**
- Single `ENCRYPTION_KEY` environment variable
- 32-character random key for AES-256-GCM
- Key rotation support via `ENCRYPTION_KEY_ROTATION_INTERVAL`

### Data Retention Policies

**Automatic Cleanup:**
- `context_summaries` - Expired based on `expiresAt` timestamp
- `audit_logs` - Configurable retention period
- `form_responses` - Based on booking completion status

**Retention Configuration:**
- Default: 90 days for AI summaries
- Configurable per user via `ai_configurations.retentionDays`
- System-wide settings in `system_settings`

---

## Performance Optimization

### Indexing Strategy

**Primary Indexes:**
- All foreign key columns
- Frequently queried columns (email, status, timestamps)
- Composite indexes for common query patterns

**Query Optimization:**
- JSONB indexes for metadata queries
- Partial indexes for active records
- Covering indexes for dashboard queries

### Partitioning Strategy

**Time-based Partitioning:**
- `audit_logs` - Monthly partitions by `createdAt`
- `bookings` - Monthly partitions by `startTime`
- `context_summaries` - Monthly partitions by `createdAt`

---

## Backup & Recovery

### Backup Strategy

**Full Backups:**
- Daily full database backups
- Point-in-time recovery capability
- Cross-region backup replication

**Incremental Backups:**
- Continuous WAL archiving
- Hourly incremental backups
- 30-day retention policy

### Disaster Recovery

**Recovery Time Objective (RTO):** 4 hours  
**Recovery Point Objective (RPO):** 1 hour

**Recovery Procedures:**
1. Restore from latest full backup
2. Apply WAL archives to point-in-time
3. Verify data integrity
4. Update application configuration

---

## Monitoring & Maintenance

### Health Monitoring

**Database Metrics:**
- Connection pool utilization
- Query performance metrics
- Storage usage and growth
- Index usage statistics

**Alerting Thresholds:**
- Connection pool > 80% utilization
- Query response time > 5 seconds
- Storage usage > 85% capacity
- Failed connection attempts > 10/minute

### Maintenance Tasks

**Regular Maintenance:**
- Weekly VACUUM and ANALYZE
- Monthly index maintenance
- Quarterly statistics updates
- Annual capacity planning review

**Automated Tasks:**
- Daily backup verification
- Weekly performance report generation
- Monthly security audit
- Quarterly disaster recovery testing

---

This database schema provides a comprehensive foundation for ChurchHub, supporting all core features while maintaining security, performance, and scalability requirements.
