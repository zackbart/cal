"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Cal from "@calcom/embed-react";

interface BookingPageProps {
  params: {
    username: string;
  };
}

export default function BookingPage({ params }: BookingPageProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    async function initializePage() {
      try {
        // Direct access to params in Next.js 14
        setUsername(params.username);
        
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/tokens/cal/managed-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: params.username }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        setAccessToken(data.accessToken);
      } catch (err) {
        console.error('Error fetching access token:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    initializePage();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto mb-4"></div>
          <p className="text-fg-muted">Loading booking interface...</p>
        </div>
      </div>
    );
  }

  if (error || !accessToken) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-fg mb-4">Booking not available</h1>
          <p className="text-fg-muted mb-4">
            {error || 'Unable to load booking interface for this user.'}
          </p>
          <a 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-brand text-brand-foreground rounded-md hover:opacity-95 transition-opacity"
          >
            Return home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-md border border-border bg-bg-elevated p-6 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-fg">
              Schedule with {username}
            </h1>
            <p className="mt-2 text-fg-muted">
              Choose a time that works for you
            </p>
          </div>
          
          {/* Cal.com Booking Interface */}
          <div className="w-full">
            {accessToken && accessToken.startsWith('eyJ') ? (
              <div className="w-full">
                <Cal
                  calLink={`${username}`}
                  config={{
                    name: username,
                    email: `${username}@example.com`,
                    notes: "Booking via ChurchHub Scheduler"
                  }}
                  style={{
                    width: "100%",
                    height: "600px",
                    overflow: "scroll"
                  }}
                />
              </div>
            ) : (
              <div className="text-center p-8">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-brand text-2xl">📅</span>
                  </div>
                  <h3 className="text-xl font-semibold text-fg mb-2">
                    Booking interface unavailable
                  </h3>
                  <p className="text-fg-muted mb-4">
                    Unable to load the booking interface at this time. Please try again later.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
