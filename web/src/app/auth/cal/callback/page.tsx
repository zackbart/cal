"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function CalCallbackPage() {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setTokens } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state");

        if (!code) {
          throw new Error("No authorization code received");
        }

        // Send the code to the backend for processing
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/cal/callback`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code, state }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Authentication failed");
        }

        const { user, accessToken, refreshToken } = await response.json();

        // Update auth state
        setUser(user);
        setTokens(accessToken, refreshToken);

        // Redirect to dashboard
        router.push("/dashboard");
      } catch (error) {
        console.error("Cal.com callback error:", error);
        setError(error instanceof Error ? error.message : "Authentication failed");
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, router, setUser, setTokens]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-danger mb-4">Authentication Error</h1>
          <p className="text-fg-muted mb-6">{error}</p>
          <button
            onClick={() => router.push("/auth/login")}
            className="px-4 py-2 bg-brand text-brand-foreground rounded-md hover:opacity-95"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent mx-auto mb-4" />
        <h1 className="text-xl font-semibold mb-2">Completing Authentication</h1>
        <p className="text-fg-muted">Please wait while we set up your account...</p>
      </div>
    </div>
  );
}
