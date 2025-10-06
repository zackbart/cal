"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalProvider } from "@/components/booking/CalProvider";
import { ChurchHubBooker } from "@/components/booking/ChurchHubBooker";
import { useCalApi } from "@/lib/cal-api";
import { CalUser, CalEventType } from "@/lib/cal-api";
import { Calendar, MapPin, Clock, User } from "lucide-react";

export default function PublicBookingPage() {
  const params = useParams();
  const username = params.username as string;
  const [pastor, setPastor] = useState<CalUser | null>(null);
  const [eventTypes, setEventTypes] = useState<CalEventType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const calApi = useCalApi();

  useEffect(() => {
    const fetchPastorData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch pastor profile from ChurchHub API
        const pastorResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pastors/${username}`);
        
        if (!pastorResponse.ok) {
          throw new Error("Pastor not found");
        }

        const pastorData = await pastorResponse.json();
        setPastor(pastorData);

        // Fetch Cal.com user data
        if (pastorData.calUserId) {
          const calUser = await calApi.getUser(pastorData.calUserId);
          setPastor(prev => prev ? { ...prev, ...calUser } : calUser);

          // Fetch event types
          const eventTypesData = await calApi.getEventTypes(pastorData.calUserId);
          setEventTypes(eventTypesData);
        }
      } catch (error) {
        console.error("Error fetching pastor data:", error);
        setError(error instanceof Error ? error.message : "Failed to load pastor profile");
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchPastorData();
    }
  }, [username, calApi]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Loading Pastor Profile</h1>
          <p className="text-fg-muted">Please wait while we load the booking information...</p>
        </div>
      </div>
    );
  }

  if (error || !pastor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-danger">Pastor Not Found</CardTitle>
            <CardDescription>
              The pastor you're looking for doesn't exist or isn't available for booking.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-fg-muted mb-4">
              {error || "This pastor profile could not be found."}
            </p>
            <a 
              href="/" 
              className="inline-flex items-center px-4 py-2 bg-brand text-brand-foreground rounded-md hover:opacity-95"
            >
              Return to ChurchHub
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="/" className="font-semibold text-xl">
            ChurchHub Cal
          </a>
          <nav className="flex items-center gap-3">
            <a 
              href="/" 
              className="text-sm text-fg-muted hover:text-fg"
            >
              Back to Home
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Pastor Profile */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-brand rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-brand-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{pastor.name}</CardTitle>
                    <CardDescription className="text-base">
                      {pastor.bio || "Pastor"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {pastor.bio && (
                  <div>
                    <h4 className="font-medium text-fg mb-2">About</h4>
                    <p className="text-sm text-fg-muted">{pastor.bio}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-fg-muted">
                    <Calendar className="h-4 w-4" />
                    <span>Available for appointments</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-fg-muted">
                    <Clock className="h-4 w-4" />
                    <span>Time zone: {pastor.timeZone}</span>
                  </div>
                </div>

                {eventTypes.length > 0 && (
                  <div>
                    <h4 className="font-medium text-fg mb-2">Available Services</h4>
                    <div className="space-y-2">
                      {eventTypes.map((eventType) => (
                        <div key={eventType.id} className="text-sm">
                          <div className="font-medium text-fg">{eventType.title}</div>
                          <div className="text-fg-muted">
                            {eventType.length} minutes
                            {eventType.description && ` • ${eventType.description}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Widget */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Schedule an Appointment</CardTitle>
                <CardDescription>
                  Choose a time that works for you to meet with {pastor.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CalProvider>
                  <ChurchHubBooker 
                    username={pastor.username}
                    hideBranding={true}
                  />
                </CalProvider>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 mt-16">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-fg-muted">
                <p>&copy; 2025 ChurchHub Cal. Built with care for ministry leaders.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
