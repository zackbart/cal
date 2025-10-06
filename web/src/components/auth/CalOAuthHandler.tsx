"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { calApi } from "@/lib/cal-api";

interface CalOAuthHandlerProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function CalOAuthHandler({ onSuccess, onError }: CalOAuthHandlerProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const initiateCalOAuth = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // Get Cal.com OAuth URL from backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/cal/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          redirectUri: `${window.location.origin}/auth/cal/callback`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to initiate Cal.com connection");
      }

      const { authUrl } = await response.json();

      // Redirect to Cal.com OAuth
      window.location.href = authUrl;
    } catch (error) {
      console.error("Cal.com OAuth initiation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to connect to Cal.com";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  const checkCalConnection = async () => {
    if (!user?.calUserId) return false;

    try {
      // Check if user has valid Cal.com connection
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/cal/status`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        return false;
      }

      const { connected } = await response.json();
      return connected;
    } catch (error) {
      console.error("Cal.com connection check error:", error);
      return false;
    }
  };

  const disconnectCal = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/cal/disconnect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to disconnect from Cal.com");
      }

      // Refresh user data to update connection status
      window.location.reload();
    } catch (error) {
      console.error("Cal.com disconnect error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to disconnect from Cal.com";
      setError(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cal.com Integration</CardTitle>
          <CardDescription>
            Please sign in to connect your Cal.com account
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cal.com Integration</CardTitle>
        <CardDescription>
          Connect your Cal.com account to enable scheduling features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-danger bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {user.calUserId ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full" />
              <span className="text-sm font-medium text-success">
                Connected to Cal.com
              </span>
            </div>
            
            <div className="text-sm text-fg-muted">
              <p>Username: <code className="bg-bg-elevated px-2 py-1 rounded">{user.calUsername}</code></p>
              <p>User ID: <code className="bg-bg-elevated px-2 py-1 rounded">{user.calUserId}</code></p>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => window.open(`https://cal.com/${user.calUsername}`, "_blank")}
              >
                View Cal.com Profile
              </Button>
              <Button
                variant="destructive"
                onClick={disconnectCal}
                loading={isConnecting}
                disabled={isConnecting}
              >
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-fg-muted rounded-full" />
              <span className="text-sm font-medium text-fg-muted">
                Not connected to Cal.com
              </span>
            </div>

            <div className="text-sm text-fg-muted">
              <p>Connect your Cal.com account to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Enable public booking pages</li>
                <li>Sync your calendar availability</li>
                <li>Manage event types and scheduling</li>
                <li>Receive booking notifications</li>
              </ul>
            </div>

            <Button
              onClick={initiateCalOAuth}
              loading={isConnecting}
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? "Connecting..." : "Connect Cal.com Account"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
