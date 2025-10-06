"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useCalApi } from "@/lib/cal-api";
import { CalBooking } from "@/lib/cal-api";
import { Calendar, Clock, User, MapPin, Filter, Search } from "lucide-react";
import { formatDateTime, isCalBookingUpcoming, isCalBookingPast } from "@/lib/cal-api";

export default function BookingsPage() {
  const { user } = useAuth();
  const calApi = useCalApi();
  const [bookings, setBookings] = useState<CalBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.calUserId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const bookingsData = await calApi.getBookings(user.calUserId, {
          limit: 50,
        });
        setBookings(bookingsData.bookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setError(error instanceof Error ? error.message : "Failed to load bookings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [user?.calUserId, calApi]);

  const filteredBookings = bookings.filter((booking) => {
    switch (filter) {
      case "upcoming":
        return isCalBookingUpcoming(booking);
      case "past":
        return isCalBookingPast(booking);
      default:
        return true;
    }
  });

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-success text-white";
      case "PENDING":
        return "bg-warning text-white";
      case "CANCELLED":
        return "bg-danger text-white";
      case "REJECTED":
        return "bg-fg-muted text-white";
      default:
        return "bg-fg-subtle text-white";
    }
  };

  if (!user?.calUserId) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-fg">Bookings</h1>
              <p className="text-fg-muted">
                Connect your Cal.com account to view and manage your bookings
              </p>
            </div>
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 text-fg-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-fg mb-2">
                  Cal.com Integration Required
                </h3>
                <p className="text-fg-muted mb-4">
                  Connect your Cal.com account to view and manage your bookings.
                </p>
                <Button onClick={() => window.location.href = "/dashboard/availability"}>
                  Connect Cal.com Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-fg">Bookings</h1>
              <p className="text-fg-muted">
                View and manage your pastoral appointments
              </p>
            </div>
            <Button
              onClick={() => window.open(`https://cal.com/${user.calUsername}/bookings`, "_blank")}
              variant="outline"
            >
              <Calendar className="h-4 w-4 mr-2" />
              View in Cal.com
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-fg-muted" />
                  <span className="text-sm font-medium">Filter:</span>
                </div>
                <div className="flex gap-2">
                  {[
                    { key: "all", label: "All Bookings" },
                    { key: "upcoming", label: "Upcoming" },
                    { key: "past", label: "Past" },
                  ].map(({ key, label }) => (
                    <Button
                      key={key}
                      variant={filter === key ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setFilter(key as any)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bookings List */}
          {isLoading ? (
            <Card>
              <CardContent className="py-8">
                <div className="flex items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-danger mb-4">{error}</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : filteredBookings.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Calendar className="h-12 w-12 text-fg-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-fg mb-2">
                  No Bookings Found
                </h3>
                <p className="text-fg-muted">
                  {filter === "all" 
                    ? "You don't have any bookings yet. Share your booking link to start receiving appointments."
                    : `No ${filter} bookings found.`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <Card key={booking.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-fg">
                            {booking.title}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBookingStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-fg-muted">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDateTime(booking.startTime)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-fg-muted">
                              <Clock className="h-4 w-4" />
                              <span>
                                {new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()}
                                {" "}minutes
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {booking.attendees.map((attendee, index) => (
                              <div key={index} className="flex items-center gap-2 text-fg-muted">
                                <User className="h-4 w-4" />
                                <span>{attendee.name} ({attendee.email})</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {booking.description && (
                          <div className="mt-3 p-3 bg-bg-elevated rounded-md">
                            <p className="text-sm text-fg-muted">{booking.description}</p>
                          </div>
                        )}

                        {booking.responses && Object.keys(booking.responses).length > 0 && (
                          <div className="mt-3 p-3 bg-bg-elevated rounded-md">
                            <h4 className="text-sm font-medium text-fg mb-2">Form Responses:</h4>
                            <div className="space-y-1 text-sm text-fg-muted">
                              {Object.entries(booking.responses).map(([key, value]) => (
                                <div key={key}>
                                  <span className="font-medium">{key}:</span> {String(value)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`https://cal.com/${user.calUsername}/bookings/${booking.id}`, "_blank")}
                        >
                          View Details
                        </Button>
                        {isCalBookingUpcoming(booking) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`https://cal.com/${user.calUsername}/bookings/${booking.id}/reschedule`, "_blank")}
                          >
                            Reschedule
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
