"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalProvider } from "@/components/booking/CalProvider";
import { ChurchHubBooker } from "@/components/booking/ChurchHubBooker";
import { useCalApi } from "@/lib/cal-api";
import { CalUser, CalEventType } from "@/lib/cal-api";
import { Calendar, MapPin, Clock, User, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EventTypeBookingPage() {
  const params = useParams();
  const username = params.username as string;
  const eventTypeSlug = params.eventType as string;
  const [pastor, setPastor] = useState<CalUser | null>(null);
  const [eventType, setEventType] = useState<CalEventType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const calApi = useCalApi();

  useEffect(() => {
    const fetchEventTypeData = async () => {
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
          const foundEventType = eventTypesData.find(et => et.slug === eventTypeSlug);
          
          if (!foundEventType) {
            throw new Error("Event type not found");
          }
          
          setEventType(foundEventType);
        }
      } catch (error) {
        console.error("Error fetching event type data:", error);
        setError(error instanceof Error ? error.message : "Failed to load event type");
      } finally {
        setIsLoading(false);
      }
    };

    if (username && eventTypeSlug) {
      fetchEventTypeData();
    }
  }, [username, eventTypeSlug, calApi]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Loading Event Details</h1>
          <p className="text-fg-muted">Please wait while we load the booking information...</p>
        </div>
      </div>
    );
  }

  if (error || !pastor || !eventType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-danger">Event Not Found</CardTitle>
            <CardDescription>
              The event type you're looking for doesn't exist or isn't available for booking.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-fg-muted">
              {error || "This event type could not be found."}
            </p>
            <div className="space-y-2">
              <Link 
                href={`/book/${username}`}
                className="inline-flex items-center px-4 py-2 bg-brand text-brand-foreground rounded-md hover:opacity-95"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                View All Events
              </Link>
              <div>
                <a 
                  href="/" 
                  className="text-sm text-fg-muted hover:text-fg"
                >
                  Return to ChurchHub
                </a>
              </div>
            </div>
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
            <Link 
              href={`/book/${username}`}
              className="text-sm text-fg-muted hover:text-fg"
            >
              <ArrowLeft className="inline h-4 w-4 mr-1" />
              All Events
            </Link>
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
          {/* Event Details */}
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
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-fg mb-2">{eventType.title}</h3>
                  {eventType.description && (
                    <p className="text-sm text-fg-muted mb-4">{eventType.description}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-fg-muted" />
                    <div>
                      <div className="text-sm font-medium text-fg">Duration</div>
                      <div className="text-sm text-fg-muted">{eventType.length} minutes</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-fg-muted" />
                    <div>
                      <div className="text-sm font-medium text-fg">Scheduling Type</div>
                      <div className="text-sm text-fg-muted capitalize">
                        {eventType.schedulingType.replace(/_/g, " ")}
                      </div>
                    </div>
                  </div>

                  {eventType.locations && eventType.locations.length > 0 && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-fg-muted" />
                      <div>
                        <div className="text-sm font-medium text-fg">Location</div>
                        <div className="text-sm text-fg-muted">
                          {eventType.locations[0].type === "integrations:google:meet" && "Google Meet"}
                          {eventType.locations[0].type === "integrations:zoom" && "Zoom"}
                          {eventType.locations[0].type === "integrations:teams" && "Microsoft Teams"}
                          {eventType.locations[0].type === "inPerson" && "In Person"}
                          {eventType.locations[0].type === "phone" && "Phone Call"}
                          {eventType.locations[0].address && ` • ${eventType.locations[0].address}`}
                        </div>
                      </div>
                    </div>
                  )}

                  {eventType.requiresConfirmation && (
                    <div className="p-3 bg-warning/10 border border-warning/20 rounded-md">
                      <div className="text-sm font-medium text-warning">Confirmation Required</div>
                      <div className="text-xs text-warning/80">
                        This appointment requires confirmation from the pastor
                      </div>
                    </div>
                  )}

                  {eventType.minimumBookingNotice > 0 && (
                    <div className="p-3 bg-accent/10 border border-accent/20 rounded-md">
                      <div className="text-sm font-medium text-accent">Advance Notice Required</div>
                      <div className="text-xs text-accent/80">
                        Book at least {eventType.minimumBookingNotice} hours in advance
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Widget */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Book {eventType.title}</CardTitle>
                <CardDescription>
                  Choose a time that works for you to meet with {pastor.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CalProvider>
                  <ChurchHubBooker 
                    username={pastor.username}
                    eventSlug={eventType.slug}
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
