# ChurchHub Frontend Implementation Plan

**Version:** 1.0  
**Date:** 2025-01-27  
**Integration:** Cal.com Atoms + Cal.com Primary Auth + ChurchHub Sidecar API

## Overview

This plan outlines the frontend implementation for ChurchHub Scheduler, focusing on four main user-facing areas with Cal.com Atoms integration for scheduling functionality and Cal.com primary authentication.

---

## 1. Page Structure & Routes

### 1.1 Public Routes
```
/ (home page)
├── /book/[username] (public booking page)
└── /book/[username]/[eventType] (specific booking flow)
```

### 1.2 Protected Routes (Dashboard)
```
/dashboard
├── /dashboard/overview (main dashboard)
├── /dashboard/bookings (booking management)
├── /dashboard/forms (questionnaire builder)
├── /dashboard/availability (calendar settings)
├── /dashboard/settings (account & integrations)
└── /dashboard/admin (admin panel - admin users only)
    ├── /dashboard/admin/users (user management)
    ├── /dashboard/admin/system (system settings)
    └── /dashboard/admin/audit (audit logs)
```

### 1.3 Auth Routes
```
/auth/signup (ChurchHub signup form)
/auth/login (ChurchHub login)
/auth/cal/callback (Cal.com OAuth callback)
/auth/logout
```

---

## 2. Page Specifications

### 2.1 Home Page (`/`)
**Purpose:** Main landing page with ChurchHub signup access

**Components:**
- Hero section with value proposition
- Feature highlights (questionnaires, sensitive mode, pastoral focus)
- "Get Started" / "Sign Up" CTA button
- Footer with basic info

**Functionality:**
- Public access (no auth required)
- Signup button redirects to ChurchHub signup form
- Responsive design following ChurchHub style guide
- SEO optimized

**Data Requirements:**
- Static content only
- No API calls needed

---

### 2.2 Public Booking Page (`/book/[username]`)
**Purpose:** Public-facing booking interface for specific pastors

**Components:**
- Pastor profile header (name, photo, bio, church name)
- Available booking types (counseling, planning, outreach)
- Cal.com Booker component integration
- ChurchHub branding throughout

**Functionality:**
- Public access (no auth required)
- Dynamic routing based on pastor username
- Cal.com Atoms integration for booking flow
- Responsive mobile-first design
- ChurchHub branding (no Cal.com branding visible)

**Data Requirements:**
- Pastor profile data (name, bio, photo, church name)
- Available event types and durations
- Calendar availability (handled by Cal.com)

**Cal.com Integration:**
```tsx
<CalProvider
  clientId={process.env.NEXT_PUBLIC_CAL_CLIENT_ID}
  options={{
    apiUrl: "https://api.cal.com/v2",
    refreshUrl: "/api/auth/cal-refresh"
  }}
  accessToken={pastorAccessToken}
>
  <Booker
    username={pastorUsername}
    eventSlug={eventType}
    hideBranding={true}
    // Custom ChurchHub styling
    theme={{
      brandColor: "#2563EB",
      lightColor: "#F8FAFC",
      darkColor: "#0F172A"
    }}
  />
</CalProvider>
```

---

### 2.3 Booking Flow (`/book/[username]/[eventType]`)
**Purpose:** Specific booking flow for a particular event type

**Components:**
- Event type details
- Cal.com Booker with pre-selected event type
- Custom questionnaire (ChurchHub sidecar integration)
- Confirmation flow

**Functionality:**
- Pre-configured for specific event type
- Custom questionnaire integration
- Sensitive mode handling
- Booking confirmation

**Data Requirements:**
- Event type configuration
- Custom questionnaire schema
- Pastor availability

---

### 2.4 Dashboard Overview (`/dashboard`)
**Purpose:** Main dashboard for pastors to manage their scheduling

**Components:**
- Welcome header with pastor name
- Quick stats (upcoming meetings, total bookings, etc.)
- Recent bookings list
- Quick actions (create new form, view availability)
- Navigation sidebar

**Functionality:**
- Protected route (Cal.com authentication required)
- Real-time data updates
- Quick access to all dashboard features
- Responsive layout

**Data Requirements:**
- Pastor profile data
- Booking statistics
- Recent bookings list
- Calendar integration status

---

### 2.5 Bookings Management (`/dashboard/bookings`)
**Purpose:** View and manage all bookings with AI-generated summaries

**Components:**
- Bookings table with filtering/sorting
- Booking detail modal/sidebar
- AI-generated summary cards
- Sensitive content indicators (🔒)
- Export functionality
- Search and filter controls

**Functionality:**
- View all bookings (past, present, future)
- Filter by date, type, sensitivity level
- View booking details with encrypted sensitive data
- Display AI-generated meeting summaries
- Export booking data (with redaction)
- Bulk actions (reschedule, cancel)
- Regenerate AI summaries

**Data Requirements:**
- Complete bookings list
- Booking details with encrypted sensitive fields
- Pastor's calendar events
- Form responses
- AI-generated context summaries

**AI Integration:**
- Display AI summaries in booking cards
- Show summary generation status
- Allow manual summary regeneration
- Highlight key pastoral insights

**Security Considerations:**
- Sensitive data decryption only on demand
- Audit logging for data access
- Automatic redaction for exports
- AI summary encryption

---

### 2.6 Forms Builder (`/dashboard/forms`)
**Purpose:** Create and manage custom questionnaires

**Components:**
- Form builder interface
- Question type selector
- Conditional logic builder
- Preview mode
- Form templates library

**Functionality:**
- Drag-and-drop form builder
- Multiple question types (text, select, radio, etc.)
- Conditional logic (show/hide questions)
- Form preview and testing
- Template management

**Data Requirements:**
- Form schemas and configurations
- Question types and validation rules
- Form templates
- Usage analytics

---

### 2.7 Availability Settings (`/dashboard/availability`)
**Purpose:** Manage calendar availability and event types

**Components:**
- Cal.com Calendar Settings integration
- Availability matrix
- Event type configuration
- Buffer time settings
- Working hours configuration

**Functionality:**
- Cal.com Atoms integration for calendar management
- Custom availability rules
- Event type creation and editing
- Buffer time configuration
- Multi-calendar sync status

**Cal.com Integration:**
```tsx
<CalendarSettings
  username={pastorUsername}
  onUpdate={handleAvailabilityUpdate}
/>
```

---

### 2.8 Account Settings (`/dashboard/settings`)
**Purpose:** Manage account information and integrations

**Components:**
- Profile information form
- Calendar integration status
- Security settings
- Notification preferences
- Account deletion

**Functionality:**
- Update profile information
- Connect/disconnect calendars (Google, Outlook, Apple)
- Change password/security settings
- Notification preferences
- Data export/deletion

**Data Requirements:**
- Pastor profile data
- Calendar integration status
- Notification preferences
- Security settings

---

### 2.9 Admin Panel (`/dashboard/admin`)
**Purpose:** System administration for admin users

**Components:**
- Admin navigation sidebar
- User management interface
- System settings panel
- Audit log viewer
- Admin dashboard overview

**Functionality:**
- View all users in the system
- Create new user accounts
- Edit user information and roles
- Manage user permissions
- View system audit logs
- Configure system-wide settings
- Monitor system health

**Data Requirements:**
- All user data (admin access)
- System configuration
- Audit logs
- System metrics

**Access Control:**
- Admin role required
- Audit logging for all admin actions
- Sensitive data access logging

---

### 2.10 User Management (`/dashboard/admin/users`)
**Purpose:** Manage all users in the system

**Components:**
- Users table with filtering/sorting
- User creation form
- User edit modal
- Role assignment interface
- User status management

**Functionality:**
- View all users with pagination
- Create new pastor accounts
- Edit user profiles and settings
- Assign/revoke admin roles
- Enable/disable user accounts
- Reset user passwords
- View user activity

**Data Requirements:**
- Complete user list
- User profile data
- Role assignments
- User activity logs

---

### 2.11 System Settings (`/dashboard/admin/system`)
**Purpose:** Configure system-wide settings

**Components:**
- System configuration form
- Feature flags interface
- Integration settings
- Security configuration
- System monitoring dashboard

**Functionality:**
- Configure system-wide settings
- Enable/disable features
- Manage integrations
- Configure security policies
- Monitor system performance
- View system logs

**Data Requirements:**
- System configuration
- Feature flags
- Integration status
- System metrics

---

### 2.12 Audit Logs (`/dashboard/admin/audit`)
**Purpose:** View system audit logs for compliance

**Components:**
- Audit log table with filtering
- Log detail viewer
- Export functionality
- Search and filter controls

**Functionality:**
- View all audit logs
- Filter by user, action, date
- Export audit logs
- Search log entries
- View detailed log information

**Data Requirements:**
- Complete audit log data
- User information
- Action details
- Timestamps and metadata

---

## 3. Authentication Flow

### 3.1 ChurchHub Signup Flow
```tsx
// Signup form component
export default function SignupPage() {
  const handleSignup = async (formData) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        name: formData.name,
        password: formData.password,
        churchName: formData.churchName,
        bio: formData.bio,
        schedulingUsername: formData.schedulingUsername
      })
    });
    
    const { user, accessToken } = await response.json();
    // Store tokens and redirect to dashboard
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md mx-auto pt-16">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8">Join ChurchHub</h1>
          <form onSubmit={handleSignup}>
            {/* ChurchHub signup form fields */}
          </form>
        </div>
      </div>
    </div>
  );
}
```

### 3.2 Cal.com OAuth Integration
```tsx
// Cal.com OAuth handler
export default function CalCallback() {
  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      if (code) {
        const response = await fetch('/api/auth/cal/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, state })
        });
        
        const { user, accessToken } = await response.json();
        // Store tokens and redirect to dashboard
      }
    };
    
    handleCallback();
  }, []);
  
  return <LoadingSpinner />;
}
```

### 3.3 Protected Route Wrapper
```tsx
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <LoadingSpinner />;
  if (!user) return <LoginPage />;
  
  return <>{children}</>;
}
```

### 3.4 Cal.com Token Management
- Store Cal.com access tokens securely
- Implement token refresh mechanism
- Handle token expiration gracefully
- Maintain ChurchHub user context

---

## 4. Component Architecture

### 4.1 Layout Components
- `AppLayout` - Main app wrapper with navigation
- `DashboardLayout` - Dashboard-specific layout with sidebar
- `PublicLayout` - Public pages layout
- `AuthLayout` - Authentication pages layout

### 4.2 Feature Components
- `BookingTable` - Bookings management table
- `FormBuilder` - Questionnaire builder interface
- `SensitiveDataViewer` - Secure sensitive data display
- `CalendarIntegration` - Calendar connection management
- `AdminUserTable` - Admin user management interface
- `UserCreationForm` - Create new user accounts
- `AuditLogViewer` - System audit log display
- `ChurchHubSignupForm` - ChurchHub-branded signup form
- `CalOAuthHandler` - Cal.com OAuth callback handler
- `AISummaryCard` - AI-generated booking summary display
- `SummaryGenerator` - AI summary generation interface
- `PastoralInsights` - Key insights and recommendations

### 4.3 UI Components (shadcn/ui)
- All components following ChurchHub style guide
- Custom variants for pastoral context
- Accessibility-first implementation
- Dark mode support

---

## 5. State Management

### 5.1 Global State (Zustand)
- User authentication state
- Pastor profile data
- Calendar integration status
- Notification preferences

### 5.2 Local State (React Query)
- Bookings data with caching
- Form configurations
- Calendar availability
- Real-time updates

---

## 6. Security Implementation

### 6.1 Data Protection
- Sensitive data encryption/decryption
- Secure token storage
- Audit logging for data access
- Automatic session timeout

### 6.2 Access Control
- Role-based access control (pastor, admin)
- Route protection with role checking
- API endpoint security
- Admin-only access controls
- Cross-origin request handling
- Cal.com token validation
- ChurchHub user context validation

---

## 7. Performance Considerations

### 7.1 Optimization
- Code splitting by route
- Lazy loading for heavy components
- Image optimization
- API response caching

### 7.2 Monitoring
- Error tracking (Sentry)
- Performance monitoring
- User analytics
- API response times

---

## 8. Implementation Phases

### Phase 1: Foundation
- [ ] Project setup with Next.js 14
- [ ] Cal.com primary authentication integration
- [ ] ChurchHub signup and login forms
- [ ] Basic routing and layouts
- [ ] Design system implementation

### Phase 2: Core Features
- [ ] Dashboard overview page
- [ ] Bookings management
- [ ] Basic Cal.com integration
- [ ] Public booking page

### Phase 3: Advanced Features
- [ ] Forms builder
- [ ] Availability settings
- [ ] Sensitive data handling
- [ ] Calendar integrations
- [ ] Admin panel
- [ ] User management

### Phase 4: Polish & Security
- [ ] Security hardening
- [ ] Performance optimization
- [ ] Error handling
- [ ] Testing and QA

---

## 9. Dependencies

### 9.1 Core Dependencies
```json
{
  "next": "14.2.33",
  "react": "18.3.1",
  "react-dom": "18.3.1",
  "@calcom/atoms": "latest",
  "@tanstack/react-query": "^5.0.0",
  "zustand": "^4.0.0",
  "zod": "^3.0.0",
  "react-hook-form": "^7.0.0"
}
```

### 9.2 UI Dependencies
```json
{
  "@radix-ui/react-*": "latest",
  "tailwindcss": "^4.0.0",
  "lucide-react": "^0.400.0",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.0.0"
}
```

---

## 10. Environment Variables

```env
# Cal.com (Primary Auth)
NEXT_PUBLIC_CAL_CLIENT_ID=
CAL_CLIENT_SECRET=
CAL_API_URL=https://api.cal.com/v2
CAL_REDIRECT_URI=https://churchhub.com/auth/cal/callback

# ChurchHub API
NEXT_PUBLIC_API_URL=
API_SECRET_KEY=

# Database
DATABASE_URL=
```

---

This plan provides a comprehensive roadmap for implementing the ChurchHub frontend with Cal.com primary authentication, ChurchHub branding, and security considerations for pastoral care applications.
