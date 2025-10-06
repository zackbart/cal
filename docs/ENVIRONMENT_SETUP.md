# Environment Setup Guide

This directory contains template environment files for the ChurchHub Cal project. These files are **safe to commit** as they contain only placeholder values.

## 📁 Environment Files

### `api.env` - Backend API Environment
- **Location**: Copy to `api/.env`
- **Purpose**: Configuration for the NestJS API server
- **Key Variables**: Database, Cal.com integration, AI services, security keys

### `worker.env` - Background Worker Environment  
- **Location**: Copy to `worker/.env`
- **Purpose**: Configuration for background job processing
- **Key Variables**: Database, Redis, AI services, API communication

### `frontend.env` - Frontend Environment
- **Location**: Copy to `web/.env.local`
- **Purpose**: Configuration for the Next.js frontend
- **Key Variables**: API URLs, Cal.com integration, authentication

## 🚀 Quick Setup

1. **Copy the template files**:
   ```bash
   # API
   cp docs/api.env api/.env
   
   # Worker  
   cp docs/worker.env worker/.env
   
   # Frontend
   cp docs/frontend.env web/.env.local
   ```

2. **Fill in the actual values**:
   - Replace all `your_dev_*` placeholders with real values
   - Generate secure keys for encryption and JWT secrets
   - Add your Cal.com API credentials
   - Configure your database connection

3. **Never commit the actual `.env` files**:
   - The `api/.env`, `worker/.env`, and `web/.env.local` files are gitignored
   - Only the template files in `docs/` should be committed

## 🔐 Security Notes

- ✅ **Safe to commit**: Files in `docs/` directory (templates only)
- ❌ **Never commit**: Files in `api/`, `worker/`, `web/` directories (contain real secrets)
- 🔑 **Generate strong keys**: Use cryptographically secure random strings
- 🌍 **Environment-specific**: Use different values for dev/staging/production

## 📋 Required Services

Before filling in the environment files, ensure you have:

- [ ] **Neon PostgreSQL** database
- [ ] **Railway Redis** instance  
- [ ] **Cal.com API** credentials
- [ ] **OpenAI API** key
- [ ] **Email service** (SendGrid, SMTP, etc.)
- [ ] **SMS service** (Twilio, etc.) - Optional

## 🛠️ Key Generation

Generate secure keys using:
```bash
# 32-character hex string
openssl rand -hex 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📞 Support

If you need help setting up any of these services, refer to the main documentation or contact the development team.
