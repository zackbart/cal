# ChurchHub Cal

A ministry-focused scheduling tool that combines Cal.com's platform with custom pastoral care features.

## Overview

ChurchHub Scheduler eliminates back-and-forth coordination between pastors and congregants while providing context-aware scheduling with built-in privacy and security features.

### Key Features

- **Cal.com Integration**: Uses Cal.com Platform + Atoms (no fork required)
- **Custom Questionnaires**: Unlimited questions with branching logic
- **Sensitive Mode**: Anonymous booking, encryption, and redaction
- **Policy Enforcement**: Meeting caps, buffers, and quiet hours
- **Context Summaries**: AI-generated neutral meeting summaries
- **Security**: AES-GCM encryption, audit logs, and RBAC

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Sidecar API   │    │   Workers       │
│   (Next.js)     │◄──►│   (Nest.js)     │◄──►│   (BullMQ)      │
│   Vercel        │    │   Railway       │    │   Railway       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Cal.com       │    │   Database      │    │   Redis         │
│   Platform      │    │   (Neon)        │    │   (Upstash)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Project Structure

```
/cal/
├── web/                    # Next.js frontend
│   ├── src/app/           # App router pages
│   ├── src/components/    # React components
│   └── package.json
├── api/                   # Nest.js API
│   ├── src/
│   │   ├── entities/      # Database entities
│   │   ├── modules/       # Feature modules
│   │   └── main.ts
│   └── package.json
├── worker/                # Background workers
│   ├── src/jobs/         # Worker job handlers
│   └── package.json
├── docs/                  # Project documentation
├── devlog/               # Development logs
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database (Neon recommended)
- Cal.com Platform account
- Railway account (for deployment)

### Local Development

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd cal
   
   # Install frontend dependencies
   cd web && npm install
   
   # Install API dependencies
   cd ../api && npm install
   
   # Install worker dependencies
   cd ../worker && npm install
   ```

2. **Set up environment variables**
   ```bash
   # Copy example files
   cp web/env.example web/.env.local
   cp api/env.example api/.env
   cp worker/env.example worker/.env
   
   # Edit with your values
   ```

3. **Set up database**
   ```bash
   cd api
   npm run db:setup
   ```

4. **Start development servers**
   ```bash
   # Terminal 1: API
   cd api && npm run start:dev
   
   # Terminal 2: Frontend
   cd web && npm run dev
   
   # Terminal 3: Workers (optional)
   cd worker && npm run start:dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:3001
   - Health check: http://localhost:3001/health

## Environment Variables

### Frontend (`web/.env.local`)
```env
NEXT_PUBLIC_CAL_CLIENT_ID=your_cal_client_id
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### API (`api/.env`)
```env
DATABASE_URL=postgresql://username:password@localhost:5432/churchhub
CAL_CLIENT_ID=your_cal_client_id
CAL_CLIENT_SECRET=your_cal_client_secret
CAL_API_URL=https://api.cal.com
ENCRYPTION_KEY=your_32_character_encryption_key
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
PORT=3001
```

### Worker (`worker/.env`)
```env
DATABASE_URL=postgresql://username:password@localhost:5432/churchhub
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

## Development Phases

### Phase 0: Setup ✅
- [x] Repository structure
- [x] Next.js frontend with ChurchHub design system
- [x] Nest.js API with health checks
- [x] BullMQ workers for background jobs
- [x] Database schema and entities
- [x] Railway deployment configuration

### Phase 1: Cal Atoms Integration (In Progress)
- [ ] Cal.com Platform OAuth setup
- [ ] Managed user token generation
- [ ] Webhook handlers for booking events
- [ ] Basic booking flow with Cal Atoms

### Phase 2: Questionnaires & Sensitive Mode
- [ ] Questionnaire builder with branching logic
- [ ] Form response encryption
- [ ] Anonymous booking support
- [ ] Secure notes interface

### Phase 3: Policy Enforcement
- [ ] Meeting caps and buffer enforcement
- [ ] Quiet hours configuration
- [ ] Inline validation before booking

### Phase 4: Reminders & Notifications
- [ ] Email/SMS reminder system
- [ ] Background job processing
- [ ] Notification preferences

### Phase 5: Context Summaries
- [ ] AI-powered meeting summaries
- [ ] Rule-based fallback system
- [ ] Privacy-compliant data handling

### Phase 6: Beta & Hardening
- [ ] End-to-end testing
- [ ] Security audit
- [ ] Performance optimization
- [ ] Production deployment

## API Endpoints

### Health
- `GET /health` - Service health check

### Webhooks
- `POST /webhooks/cal/booking.created` - Handle new bookings
- `POST /webhooks/cal/booking.updated` - Handle booking updates

### Tokens
- `POST /tokens/cal/managed-user` - Generate Cal.com access tokens

### Forms
- `POST /forms` - Create questionnaire
- `POST /forms/:id/respond` - Submit form response

### Bookings
- `GET /bookings/:id/secure-notes` - Access secure notes (RBAC)

## Database Schema

### Core Entities
- **Users**: Cal.com user mapping and preferences
- **Bookings**: Meeting records with encryption
- **Forms**: Questionnaire definitions with branching
- **FormResponses**: Encrypted intake data
- **Policies**: Scheduling rules and limits
- **ContextSummaries**: AI-generated meeting summaries
- **AuditLogs**: Security and access tracking

## Security Features

- **Encryption**: AES-GCM for sensitive data
- **Access Control**: Role-based permissions
- **Audit Logging**: All sensitive operations tracked
- **Data Retention**: Configurable purging policies
- **Privacy**: Anonymous booking support
- **Redaction**: External calendar event sanitization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- Documentation: `/docs` directory
- Development logs: `/devlog` directory
- Issues: GitHub Issues

## Roadmap

See the [Development Plan](docs/02-development-plan.md) for detailed roadmap and milestones.
