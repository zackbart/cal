# ChurchHub Deployment Guide

**Date:** 2025-01-05  
**Status:** Phase 0 Setup Complete

## Overview
This guide covers deploying the ChurchHub Scheduler to production using Railway for hosting and Neon for the database.

## Architecture
- **Frontend:** Vercel (Next.js)
- **API:** Railway (Nest.js)
- **Workers:** Railway (BullMQ)
- **Database:** Neon (PostgreSQL)
- **Queue:** Upstash (Redis) - Optional

## Prerequisites

### 1. Cal.com Platform Setup
- [ ] Create Cal.com Platform app
- [ ] Configure OAuth redirect URIs
- [ ] Set up webhook endpoints
- [ ] Get client ID and secret

### 2. Database Setup (Neon)
1. Create Neon account at [neon.tech](https://neon.tech)
2. Create new project: `churchhub-prod`
3. Copy connection string
4. Note: Database schema will be auto-created on first API startup

### 3. Railway Setup
1. Create Railway account at [railway.app](https://railway.app)
2. Create new project: `churchhub`
3. Add services for API and Worker

## Deployment Steps

### 1. Database Setup
```bash
# Set environment variables
export DATABASE_URL="postgresql://username:password@host:5432/database"

# Run database setup (optional - auto-created on startup)
cd api
npm run db:setup
```

### 2. API Deployment (Railway)
1. Connect GitHub repository to Railway
2. Select `/api` directory as root
3. Set environment variables:
   ```
   DATABASE_URL=postgresql://...
   CAL_CLIENT_ID=your_cal_client_id
   CAL_CLIENT_SECRET=your_cal_client_secret
   CAL_API_URL=https://api.cal.com
   ENCRYPTION_KEY=your_32_character_key
   FRONTEND_URL=https://your-frontend.vercel.app
   NODE_ENV=production
   PORT=3001
   ```

### 3. Worker Deployment (Railway)
1. Add new service in Railway project
2. Select `/worker` directory as root
3. Set environment variables:
   ```
   DATABASE_URL=postgresql://...
   REDIS_URL=redis://...
   NODE_ENV=production
   ```

### 4. Frontend Deployment (Vercel)
1. Connect GitHub repository to Vercel
2. Set root directory to `/web`
3. Set environment variables:
   ```
   NEXT_PUBLIC_CAL_CLIENT_ID=your_cal_client_id
   NEXT_PUBLIC_API_URL=https://your-api.railway.app
   ```

### 5. Optional: Redis Setup (Upstash)
1. Create Upstash account at [upstash.com](https://upstash.com)
2. Create Redis database
3. Copy connection URL
4. Add to API and Worker environment variables

## Environment Variables Reference

### API Service
| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection string | ✅ |
| `CAL_CLIENT_ID` | Cal.com Platform client ID | ✅ |
| `CAL_CLIENT_SECRET` | Cal.com Platform client secret | ✅ |
| `CAL_API_URL` | Cal.com API base URL | ✅ |
| `ENCRYPTION_KEY` | 32-character encryption key | ✅ |
| `FRONTEND_URL` | Frontend URL for CORS | ✅ |
| `NODE_ENV` | Environment (production/development) | ✅ |
| `PORT` | Server port (default: 3001) | ❌ |
| `REDIS_URL` | Redis connection for workers | ❌ |

### Worker Service
| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection string | ✅ |
| `REDIS_URL` | Redis connection for job queue | ✅ |
| `NODE_ENV` | Environment (production/development) | ✅ |

### Frontend Service
| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_CAL_CLIENT_ID` | Cal.com Platform client ID | ✅ |
| `NEXT_PUBLIC_API_URL` | API base URL | ✅ |

## Security Considerations

### Encryption Key Generation
```bash
# Generate a secure 32-character encryption key
openssl rand -hex 16
```

### Environment Security
- Never commit `.env` files to version control
- Use Railway's environment variable management
- Rotate encryption keys regularly
- Enable database SSL connections

### CORS Configuration
- API is configured to accept requests from frontend URL only
- Update `FRONTEND_URL` when deploying to new domains

## Monitoring and Health Checks

### Health Endpoints
- API: `GET /health`
- Returns service status and timestamp

### Logs
- Railway provides built-in log aggregation
- Structured JSON logging for better searchability
- Monitor for webhook failures and token errors

## Database Management

### Schema Updates
- TypeORM auto-sync is disabled in production
- Use migrations for schema changes:
  ```bash
  npm run typeorm:migration:generate -- -n MigrationName
  npm run typeorm:migration:run
  ```

### Backup Strategy
- Neon provides automatic backups
- Configure retention policy based on requirements
- Test restore procedures regularly

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check `DATABASE_URL` format
   - Verify Neon database is running
   - Check SSL requirements

2. **Cal.com API Errors**
   - Verify client credentials
   - Check webhook URL accessibility
   - Review API rate limits

3. **Worker Jobs Not Processing**
   - Verify Redis connection
   - Check worker service logs
   - Ensure job queue is properly configured

### Debug Commands
```bash
# Check API health
curl https://your-api.railway.app/health

# View Railway logs
railway logs --service api
railway logs --service worker

# Database connection test
railway run --service api npm run db:setup
```

## Scaling Considerations

### Horizontal Scaling
- Railway auto-scales based on traffic
- Workers can be scaled independently
- Database connection pooling is handled by TypeORM

### Performance Optimization
- Enable Redis caching for frequently accessed data
- Implement database indexing for query optimization
- Use CDN for static assets (handled by Vercel)

## Cost Optimization
- Monitor Railway usage and set spending limits
- Use Neon's serverless scaling
- Optimize worker job frequency
- Implement efficient database queries

## Next Steps
1. Set up monitoring and alerting
2. Configure automated backups
3. Implement CI/CD pipelines
4. Set up staging environment
5. Create disaster recovery procedures
