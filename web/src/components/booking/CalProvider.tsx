"use client";

import { ReactNode } from "react";
import { CalProvider as CalComProvider } from "@calcom/atoms";
import { useAuth } from "@/lib/auth";

interface CalProviderProps {
  children: ReactNode;
}

export function CalProvider({ children }: CalProviderProps) {
  const { user, accessToken } = useAuth();

  if (!user?.calUserId || !accessToken) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-fg mb-2">
            Cal.com Integration Required
          </h3>
          <p className="text-fg-muted">
            Please connect your Cal.com account to enable booking features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <CalComProvider
      clientId={process.env.NEXT_PUBLIC_CAL_CLIENT_ID!}
      options={{
        apiUrl: process.env.NEXT_PUBLIC_CAL_API_URL || "https://api.cal.com/v2",
        refreshUrl: "/api/auth/cal-refresh",
      }}
      accessToken={accessToken}
    >
      {children}
    </CalComProvider>
  );
}
