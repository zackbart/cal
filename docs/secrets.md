# ChurchHub Secrets Management

**Version:** 1.0  
**Date:** 2025-01-27  
**Purpose:** Document required secrets and their functions for ChurchHub implementation

## Overview

This document outlines all the secrets, API keys, and configuration values needed for ChurchHub, organized by provider, environment (frontend/backend), and priority (required/optional). This helps with setup and deployment planning.

---

## 1. Neon Database

### 1.1 Backend (Required)
| Secret | Function | Usage |
|--------|----------|-------|
| `DATABASE_URL` | Primary database connection string | TypeORM connection, includes host, port, database, username, password, SSL settings |
| `DATABASE_CA_CERT` | SSL certificate for secure connections | Database SSL verification in production |
| `DATABASE_SSL` | SSL connection requirement | Forces encrypted database connections |

### 1.2 Backend (Optional)
| Secret | Function | Usage |
|--------|----------|-------|
| `DATABASE_POOL_SIZE` | Connection pool configuration | Optimize database performance |
| `DATABASE_TIMEOUT` | Connection timeout settings | Handle connection issues gracefully |

---

## 2. Cal.com Primary Authentication

### 2.1 Frontend (Required)
| Secret | Function | Usage |
|--------|----------|-------|
| `NEXT_PUBLIC_CAL_CLIENT_ID` | Cal.com OAuth client ID | Cal.com OAuth flow initiation |
| `NEXT_PUBLIC_CAL_API_URL` | Cal.com API base URL | Cal.com API endpoint (usually https://api.cal.com/v2) |

### 2.2 Backend (Required)
| Secret | Function | Usage |
|--------|----------|-------|
| `CAL_CLIENT_SECRET` | Cal.com OAuth client secret | Server-side Cal.com API authentication |
| `CAL_CLIENT_ID` | Cal.com OAuth client ID | Server-side Cal.com API calls |
| `CAL_API_URL` | Cal.com API base URL | Backend Cal.com API integration |
| `CAL_REDIRECT_URI` | Cal.com OAuth callback URL | Server-side callback handling |

### 2.3 Backend (Optional)
| Secret | Function | Usage |
|--------|----------|-------|
| `CAL_SCOPE` | Cal.com API scope permissions | Define Cal.com API permissions |
| `CAL_WEBHOOK_SECRET` | Webhook signature verification | Verify incoming Cal.com webhooks |

---

## 3. Cal.com Platform Integration

### 3.1 Frontend (Required)
| Secret | Function | Usage |
|--------|----------|-------|
| `NEXT_PUBLIC_CAL_CLIENT_ID` | Cal.com OAuth client ID | Cal.com Atoms CalProvider configuration |
| `NEXT_PUBLIC_CAL_API_URL` | Cal.com API base URL | Cal.com Atoms API endpoint (usually https://api.cal.com/v2) |

### 3.2 Backend (Required)
| Secret | Function | Usage |
|--------|----------|-------|
| `CAL_CLIENT_SECRET` | Cal.com OAuth client secret | Server-side Cal.com API authentication |
| `CAL_CLIENT_ID` | Cal.com OAuth client ID | Server-side Cal.com API calls |
| `CAL_API_URL` | Cal.com API base URL | Backend Cal.com API integration |
| `CAL_WEBHOOK_SECRET` | Webhook signature verification | Verify incoming Cal.com webhooks |

### 3.3 Backend (Optional)
| Secret | Function | Usage |
|--------|----------|-------|
| `CAL_REFRESH_URL` | Token refresh endpoint | Custom token refresh handling |
| `CAL_SCOPE` | API scope permissions | Define Cal.com API permissions |

---

## 4. Calendar Integrations

### 4.1 Google Calendar (Optional)
| Secret | Function | Usage |
|--------|----------|-------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Google Calendar integration |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Server-side Google API authentication |
| `GOOGLE_REDIRECT_URI` | Google OAuth callback URL | Google Calendar connection flow |

### 4.2 Microsoft Outlook (Optional)
| Secret | Function | Usage |
|--------|----------|-------|
| `MICROSOFT_CLIENT_ID` | Microsoft OAuth client ID | Outlook Calendar integration |
| `MICROSOFT_CLIENT_SECRET` | Microsoft OAuth client secret | Server-side Microsoft Graph API authentication |
| `MICROSOFT_REDIRECT_URI` | Microsoft OAuth callback URL | Outlook Calendar connection flow |
| `MICROSOFT_TENANT_ID` | Azure AD tenant identifier | Microsoft Graph API tenant-specific calls |

### 4.3 Apple Calendar (Optional)
| Secret | Function | Usage |
|--------|----------|-------|
| `APPLE_CLIENT_ID` | Apple OAuth client ID | Apple Calendar integration |
| `APPLE_CLIENT_SECRET` | Apple OAuth client secret | Server-side Apple API authentication |
| `APPLE_REDIRECT_URI` | Apple OAuth callback URL | Apple Calendar connection flow |
| `APPLE_TEAM_ID` | Apple Developer Team ID | Apple API authentication |
| `APPLE_KEY_ID` | Apple API Key ID | Apple API authentication |
| `APPLE_PRIVATE_KEY` | Apple API private key | Apple API authentication |

---

## 5. AI Integration

### 5.1 Backend (Required)
| Secret | Function | Usage |
|--------|----------|-------|
| `OPENAI_API_KEY` | OpenAI API key | AI summary generation and analysis |
| `AI_PROVIDER` | AI service provider | 'openai', 'anthropic', or 'local' |
| `AI_MODEL` | AI model identifier | Model to use for summary generation |

### 5.2 Backend (Optional)
| Secret | Function | Usage |
|--------|----------|-------|
| `ANTHROPIC_API_KEY` | Anthropic API key | Alternative AI provider |
| `AI_MAX_TOKENS` | Maximum tokens per request | Control AI response length |
| `AI_TEMPERATURE` | AI response creativity | Control randomness (0.0-1.0) |
| `AI_PII_DETECTION` | PII detection flag | Enable/disable PII detection |

---

## 6. Encryption & Security

### 6.1 Backend (Required)
| Secret | Function | Usage |
|--------|----------|-------|
| `ENCRYPTION_KEY` | AES-256-GCM encryption key | Encrypt sensitive form responses and pastoral data |
| `ENCRYPTION_ALGORITHM` | Encryption algorithm specification | Define encryption method (aes-256-gcm) |
| `JWT_SECRET` | JWT signing secret | Sign and verify authentication tokens |
| `SESSION_SECRET` | Session encryption secret | Encrypt user sessions |

### 6.2 Backend (Optional)
| Secret | Function | Usage |
|--------|----------|-------|
| `ENCRYPTION_KEY_ROTATION_INTERVAL` | Key rotation schedule | Automatic encryption key rotation |
| `JWT_EXPIRES_IN` | JWT token expiration time | Control token lifetime |
| `SESSION_MAX_AGE` | Session maximum age | Control session lifetime |
| `API_SECRET_KEY` | API authentication secret | Secure API-to-API communication |
| `WEBHOOK_SECRET` | Webhook signature verification | Verify incoming webhooks |

---

## 7. Monitoring & Analytics

### 7.1 Frontend (Optional)
| Secret | Function | Usage |
|--------|----------|-------|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error tracking DSN | Frontend error monitoring and reporting |
| `NEXT_PUBLIC_ANALYTICS_ID` | Analytics service identifier | User behavior tracking and analytics |

### 7.2 Backend (Optional)
| Secret | Function | Usage |
|--------|----------|-------|
| `SENTRY_DSN` | Sentry error tracking DSN | Backend error monitoring and reporting |
| `LOG_LEVEL` | Logging verbosity level | Control log output (debug, info, warn, error) |
| `MONITORING_ENDPOINT` | Custom monitoring endpoint | Health check and monitoring integration |

---

## 8. Email & Notifications

### 8.1 Backend (Optional)
| Secret | Function | Usage |
|--------|----------|-------|
| `SMTP_HOST` | SMTP server hostname | Email delivery for notifications |
| `SMTP_PORT` | SMTP server port | Email delivery configuration |
| `SMTP_USER` | SMTP authentication username | Email server authentication |
| `SMTP_PASS` | SMTP authentication password | Email server authentication |
| `SMTP_FROM` | Default sender email address | Email notification sender |
| `TWILIO_ACCOUNT_SID` | Twilio account identifier | SMS notifications |
| `TWILIO_AUTH_TOKEN` | Twilio authentication token | SMS API authentication |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | SMS notification sender |

---

## 9. Background Workers

### 9.1 Backend (Required)
| Secret | Function | Usage |
|--------|----------|-------|
| `REDIS_URL` | Railway Redis connection string | BullMQ job queue and caching (Railway Redis plugin) |
| `WORKER_CONCURRENCY` | Worker concurrency level | Number of parallel job processors |

### 9.2 Backend (Optional)
| Secret | Function | Usage |
|--------|----------|-------|
| `WORKER_RETRY_ATTEMPTS` | Job retry attempts | Maximum retry attempts for failed jobs |
| `WORKER_RETRY_DELAY` | Retry delay in milliseconds | Delay between retry attempts |
| `WORKER_HEALTH_CHECK_INTERVAL` | Health check interval | Worker health monitoring frequency |

---

## 10. Rate Limiting & Caching

### 10.1 Backend (Optional)
| Secret | Function | Usage |
|--------|----------|-------|
| `REDIS_URL` | Redis connection string | Caching and rate limiting |
| `RATE_LIMIT_WINDOW` | Rate limiting time window | API rate limiting configuration |
| `RATE_LIMIT_MAX` | Maximum requests per window | API rate limiting configuration |
| `CACHE_TTL` | Cache time-to-live | Caching configuration |

---

## 11. Development & Testing

### 11.1 Frontend (Optional)
| Secret | Function | Usage |
|--------|----------|-------|
| `NEXT_PUBLIC_APP_ENV` | Application environment | Development, staging, production |
| `NEXT_PUBLIC_DEBUG` | Debug mode flag | Enable debug features |

### 11.2 Backend (Optional)
| Secret | Function | Usage |
|--------|----------|-------|
| `NODE_ENV` | Node.js environment | Development, staging, production |
| `DEBUG` | Debug mode flag | Enable debug logging |
| `TEST_DATABASE_URL` | Test database connection | Testing environment |
| `PORT` | Server port | Application server port (default: 3000) |
| `HOST` | Server host | Application server host (default: localhost) |

---

## 12. Environment-Specific Configuration

### 12.1 Development Environment (localhost)
| Secret | Function | Usage |
|--------|----------|-------|
| `NODE_ENV=development` | Development environment flag | Enable development features |
| `NEXT_PUBLIC_APP_ENV=development` | Frontend environment flag | Development-specific frontend config |
| `DATABASE_SSL=false` | Disable SSL for local development | Local database connections |
| `LOG_LEVEL=debug` | Debug logging level | Verbose logging for development |
| `CAL_REDIRECT_URI=http://localhost:3000/auth/cal/callback` | Local OAuth callback | Development OAuth flow |

### 12.2 Production Environment (zackb.art)
| Secret | Function | Usage |
|--------|----------|-------|
| `NODE_ENV=production` | Production environment flag | Enable production optimizations |
| `NEXT_PUBLIC_APP_ENV=production` | Frontend environment flag | Production-specific frontend config |
| `DATABASE_SSL=true` | Force SSL connections | Secure database connections |
| `LOG_LEVEL=info` | Production logging level | Appropriate log verbosity |
| `CAL_REDIRECT_URI=https://zackb.art/auth/cal/callback` | Production OAuth callback | Production OAuth flow |

### 12.3 Staging Environment (Optional)
| Secret | Function | Usage |
|--------|----------|-------|
| `NODE_ENV=staging` | Staging environment flag | Staging-specific configuration |
| `NEXT_PUBLIC_APP_ENV=staging` | Frontend environment flag | Staging-specific frontend config |
| `LOG_LEVEL=warn` | Staging logging level | Reduced log verbosity |
| `CAL_REDIRECT_URI=https://staging.zackb.art/auth/cal/callback` | Staging OAuth callback | Staging OAuth flow |

---

## 13. Secrets Management Best Practices

### 13.1 Storage
- **Never commit secrets to version control**
- Use environment variables for all secrets
- Consider using a secrets management service (AWS Secrets Manager, Azure Key Vault, etc.)
- Rotate secrets regularly

### 13.2 Access Control
- Limit access to secrets based on role
- Use different secrets for different environments
- Implement audit logging for secret access
- Use principle of least privilege

### 11.3 Security
- Encrypt secrets at rest
- Use secure transmission for secrets
- Implement secret rotation policies
- Monitor for secret exposure

---

## 14. Setup Checklist

### 14.1 Required for MVP
- [ ] Neon Database connection (dev: localhost, prod: zackb.art)
- [ ] Cal.com Primary authentication (dev: localhost:3000, prod: zackb.art)
- [ ] Cal.com Platform integration
- [ ] Basic encryption setup
- [ ] JWT configuration

### 14.2 Required for Production
- [ ] All MVP secrets
- [ ] SSL certificates
- [ ] Monitoring configuration
- [ ] Error tracking
- [ ] Security hardening

### 12.3 Optional Enhancements
- [ ] Calendar integrations
- [ ] Email notifications
- [ ] Advanced monitoring
- [ ] Analytics

---

## 15. Environment Variable Templates

### 15.1 Development Environment (localhost)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/churchhub_dev
DATABASE_CA_CERT=
DATABASE_SSL=false

# Cal.com (Primary Auth) - Development
NEXT_PUBLIC_CAL_CLIENT_ID=your_dev_cal_client_id
NEXT_PUBLIC_CAL_API_URL=https://api.cal.com/v2
CAL_CLIENT_SECRET=your_dev_cal_client_secret
CAL_CLIENT_ID=your_dev_cal_client_id
CAL_API_URL=https://api.cal.com/v2
CAL_REDIRECT_URI=http://localhost:3000/auth/cal/callback
CAL_WEBHOOK_SECRET=your_dev_webhook_secret

# AI Integration
OPENAI_API_KEY=your_dev_openai_api_key
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini

# Background Workers (Railway Redis)
REDIS_URL=redis://default:password@redis.railway.internal:6379
WORKER_CONCURRENCY=5

# Security
ENCRYPTION_KEY=your_dev_encryption_key_32_chars
ENCRYPTION_ALGORITHM=aes-256-gcm
JWT_SECRET=your_dev_jwt_secret
SESSION_SECRET=your_dev_session_secret
API_SECRET_KEY=your_dev_api_secret_key

# Monitoring (Optional)
SENTRY_DSN=your_dev_sentry_dsn
NEXT_PUBLIC_SENTRY_DSN=your_dev_sentry_dsn
LOG_LEVEL=debug

# Environment
NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development
```

### 15.2 Production Environment (zackb.art)

```env
# Database
DATABASE_URL=postgresql://user:password@prod-db-host:5432/churchhub_prod
DATABASE_CA_CERT=your_prod_ca_cert
DATABASE_SSL=true

# Cal.com (Primary Auth) - Production
NEXT_PUBLIC_CAL_CLIENT_ID=your_prod_cal_client_id
NEXT_PUBLIC_CAL_API_URL=https://api.cal.com/v2
CAL_CLIENT_SECRET=your_prod_cal_client_secret
CAL_CLIENT_ID=your_prod_cal_client_id
CAL_API_URL=https://api.cal.com/v2
CAL_REDIRECT_URI=https://zackb.art/auth/cal/callback
CAL_WEBHOOK_SECRET=your_prod_webhook_secret

# AI Integration
OPENAI_API_KEY=your_prod_openai_api_key
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini

# Background Workers (Railway Redis)
REDIS_URL=redis://default:password@redis.railway.internal:6379
WORKER_CONCURRENCY=10

# Security
ENCRYPTION_KEY=your_prod_encryption_key_32_chars
ENCRYPTION_ALGORITHM=aes-256-gcm
JWT_SECRET=your_prod_jwt_secret
SESSION_SECRET=your_prod_session_secret
API_SECRET_KEY=your_prod_api_secret_key

# Monitoring (Optional)
SENTRY_DSN=your_prod_sentry_dsn
NEXT_PUBLIC_SENTRY_DSN=your_prod_sentry_dsn
LOG_LEVEL=info

# Environment
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
```

---

This secrets management document provides a comprehensive overview of all the configuration values needed for ChurchHub, helping with setup, deployment, and security planning.
