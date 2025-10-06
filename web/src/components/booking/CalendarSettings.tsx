"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalProvider } from "./CalProvider";
import { useAuth } from "@/lib/auth";
import { useCalApi } from "@/lib/cal-api";
import { CalEventType } from "@/lib/cal-api";
import { Calendar, Plus, Settings, Clock, MapPin } from "lucide-react";

export function CalendarSettings() {
  const { user } = useAuth();
  const calApi = useCalApi();
  const [eventTypes, setEventTypes] = useState<CalEventType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventTypes = async () => {
      if (!user?.calUserId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const eventTypesData = await calApi.getEventTypes(user.calUserId);
        setEventTypes(eventTypesData);
      } catch (error) {
        console.error("Error fetching event types:", error);
        setError(error instanceof Error ? error.message : "Failed to load event types");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventTypes();
  }, [user?.calUserId, calApi]);

  const handleCreateEventType = () => {
    // Open Cal.com event type creation in new tab
    window.open(`https://cal.com/${user?.calUsername}/event-types/new`, "_blank");
  };

  const handleManageEventType = (eventTypeId: number) => {
    // Open Cal.com event type management in new tab
    window.open(`https://cal.com/${user?.calUsername}/event-types/${eventTypeId}`, "_blank");
  };

  if (!user?.calUserId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendar Settings
          </CardTitle>
          <CardDescription>
            Connect your Cal.com account to manage your event types and availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-fg-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-fg mb-2">
              Cal.com Integration Required
            </h3>
            <p className="text-fg-muted mb-4">
              Connect your Cal.com account to manage your event types and availability settings.
            </p>
            <Button onClick={() => window.location.href = "/dashboard/settings"}>
              Connect Cal.com Account
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Event Types
          </CardTitle>
          <CardDescription>
            Manage your available appointment types and their settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-danger mb-4">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Your Event Types</h3>
                <Button onClick={handleCreateEventType} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Event Type
                </Button>
              </div>

              {eventTypes.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-fg-muted mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-fg mb-2">
                    No Event Types Yet
                  </h3>
                  <p className="text-fg-muted mb-4">
                    Create your first event type to start accepting bookings
                  </p>
                  <Button onClick={handleCreateEventType}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Event Type
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {eventTypes.map((eventType) => (
                    <Card key={eventType.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{eventType.title}</CardTitle>
                            <CardDescription className="text-sm">
                              {eventType.description || "No description"}
                            </CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleManageEventType(eventType.id)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-fg-muted">
                            <Clock className="h-4 w-4" />
                            <span>{eventType.length} minutes</span>
                          </div>
                          
                          {eventType.locations && eventType.locations.length > 0 && (
                            <div className="flex items-center gap-2 text-fg-muted">
                              <MapPin className="h-4 w-4" />
                              <span>
                                {eventType.locations[0].type === "integrations:google:meet" && "Google Meet"}
                                {eventType.locations[0].type === "integrations:zoom" && "Zoom"}
                                {eventType.locations[0].type === "integrations:teams" && "Microsoft Teams"}
                                {eventType.locations[0].type === "inPerson" && "In Person"}
                                {eventType.locations[0].type === "phone" && "Phone Call"}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-fg-muted">
                            <span className="capitalize">
                              {eventType.schedulingType.replace(/_/g, " ")}
                            </span>
                          </div>

                          {eventType.requiresConfirmation && (
                            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-warning/10 text-warning">
                              Requires Confirmation
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common calendar management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Button
              variant="outline"
              onClick={() => window.open(`https://cal.com/${user.calUsername}`, "_blank")}
              className="justify-start"
            >
              <Calendar className="mr-2 h-4 w-4" />
              View Public Profile
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(`https://cal.com/${user.calUsername}/availability`, "_blank")}
              className="justify-start"
            >
              <Clock className="mr-2 h-4 w-4" />
              Manage Availability
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(`https://cal.com/${user.calUsername}/event-types`, "_blank")}
              className="justify-start"
            >
              <Settings className="mr-2 h-4 w-4" />
              Advanced Settings
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(`https://cal.com/${user.calUsername}/bookings`, "_blank")}
              className="justify-start"
            >
              <Calendar className="mr-2 h-4 w-4" />
              View All Bookings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
