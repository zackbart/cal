"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CalendarSettings } from "@/components/booking/CalendarSettings";
import { CalOAuthHandler } from "@/components/auth/CalOAuthHandler";

export default function AvailabilityPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold text-fg">Availability & Calendar</h1>
            <p className="text-fg-muted">
              Manage your event types, availability, and calendar settings
            </p>
          </div>

          {/* Cal.com Integration Status */}
          <CalOAuthHandler />

          {/* Calendar Settings */}
          <CalendarSettings />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
