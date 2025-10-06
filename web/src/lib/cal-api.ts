import { useAuth } from "./auth";

export interface CalUser {
  id: number;
  username: string;
  email: string;
  name: string;
  timeZone: string;
  locale: string;
  avatar?: string;
  bio?: string;
  weekStart: string;
  startTime: number;
  endTime: number;
  bufferTime: number;
  createdDate: string;
  updatedAt: string;
}

export interface CalEventType {
  id: number;
  title: string;
  slug: string;
  description?: string;
  length: number;
  locations: Array<{
    type: string;
    displayLocationPublicly?: boolean;
    address?: string;
    link?: string;
  }>;
  schedulingType: string;
  recurringEvent?: {
    freq: number;
    count: number;
    interval: number;
  };
  requiresConfirmation: boolean;
  disableGuests: boolean;
  hideCalendarNotes: boolean;
  minimumBookingNotice: number;
  beforeEventBuffer: number;
  afterEventBuffer: number;
  seatsPerTimeSlot?: number;
  seatsShowAttendees?: boolean;
  price: number;
  currency: string;
  paymentOptions: string[];
  metadata: Record<string, any>;
}

export interface CalBooking {
  id: number;
  uid: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  attendees: Array<{
    email: string;
    name: string;
    timeZone: string;
    locale: string;
  }>;
  user: CalUser;
  eventType: CalEventType;
  status: "ACCEPTED" | "PENDING" | "CANCELLED" | "REJECTED";
  responses: Record<string, any>;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CalWebhookEvent {
  type: "BOOKING_CREATED" | "BOOKING_UPDATED" | "BOOKING_CANCELLED" | "BOOKING_RESCHEDULED";
  data: CalBooking;
  triggerEvent: string;
  createdAt: string;
}

class CalApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_CAL_API_URL || "https://api.cal.com/v2";
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // User Management
  async createUser(userData: {
    email: string;
    name: string;
    username: string;
    password: string;
    timeZone?: string;
    locale?: string;
  }): Promise<CalUser> {
    return this.request<CalUser>("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async getUser(userId: number): Promise<CalUser> {
    return this.request<CalUser>(`/users/${userId}`);
  }

  async getCurrentUser(): Promise<CalUser> {
    return this.request<CalUser>("/me");
  }

  async updateUser(userId: number, userData: Partial<CalUser>): Promise<CalUser> {
    return this.request<CalUser>(`/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(userData),
    });
  }

  // Event Types
  async getEventTypes(userId: number): Promise<CalEventType[]> {
    return this.request<CalEventType[]>(`/users/${userId}/event-types`);
  }

  async createEventType(userId: number, eventTypeData: Partial<CalEventType>): Promise<CalEventType> {
    return this.request<CalEventType>(`/users/${userId}/event-types`, {
      method: "POST",
      body: JSON.stringify(eventTypeData),
    });
  }

  async updateEventType(eventTypeId: number, eventTypeData: Partial<CalEventType>): Promise<CalEventType> {
    return this.request<CalEventType>(`/event-types/${eventTypeId}`, {
      method: "PATCH",
      body: JSON.stringify(eventTypeData),
    });
  }

  // Bookings
  async getBookings(userId: number, params?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ bookings: CalBooking[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/users/${userId}/bookings${queryString ? `?${queryString}` : ""}`;
    
    return this.request<{ bookings: CalBooking[]; total: number }>(endpoint);
  }

  async getBooking(bookingId: number): Promise<CalBooking> {
    return this.request<CalBooking>(`/bookings/${bookingId}`);
  }

  async updateBooking(bookingId: number, bookingData: Partial<CalBooking>): Promise<CalBooking> {
    return this.request<CalBooking>(`/bookings/${bookingId}`, {
      method: "PATCH",
      body: JSON.stringify(bookingData),
    });
  }

  async cancelBooking(bookingId: number, reason?: string): Promise<CalBooking> {
    return this.request<CalBooking>(`/bookings/${bookingId}`, {
      method: "DELETE",
      body: JSON.stringify({ reason }),
    });
  }

  // Availability
  async getAvailability(userId: number, params?: {
    dateFrom: string;
    dateTo: string;
    eventTypeId?: number;
  }): Promise<{
    busy: Array<{
      start: string;
      end: string;
    }>;
    workingHours: Array<{
      days: number[];
      startTime: number;
      endTime: number;
    }>;
    dateOverrides: Array<{
      date: string;
      startTime: number;
      endTime: number;
    }>;
  }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/users/${userId}/availability${queryString ? `?${queryString}` : ""}`;
    
    return this.request(endpoint);
  }

  // OAuth
  async generateAccessToken(userId: number, scopes: string[] = []): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    return this.request<{
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    }>(`/users/${userId}/access-tokens`, {
      method: "POST",
      body: JSON.stringify({ scopes }),
    });
  }

  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    return this.request<{
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    }>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  }

  // Webhooks
  async createWebhook(userId: number, webhookData: {
    subscriberUrl: string;
    eventTriggers: string[];
    active: boolean;
  }): Promise<{
    id: string;
    subscriberUrl: string;
    eventTriggers: string[];
    active: boolean;
    createdAt: string;
  }> {
    return this.request(`/users/${userId}/webhooks`, {
      method: "POST",
      body: JSON.stringify(webhookData),
    });
  }

  async getWebhooks(userId: number): Promise<Array<{
    id: string;
    subscriberUrl: string;
    eventTriggers: string[];
    active: boolean;
    createdAt: string;
  }>> {
    return this.request(`/users/${userId}/webhooks`);
  }
}

// Export singleton instance
export const calApi = new CalApiClient();

// Hook for using Cal.com API with authentication
export function useCalApi() {
  const { accessToken } = useAuth();

  // Set access token when it changes
  if (accessToken) {
    calApi.setAccessToken(accessToken);
  }

  return calApi;
}

// Utility functions
export function formatCalDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString();
}

export function parseCalDate(dateString: string): Date {
  return new Date(dateString);
}

export function getCalEventTypeSlug(eventType: CalEventType): string {
  return eventType.slug || eventType.title.toLowerCase().replace(/\s+/g, "-");
}

export function isCalBookingUpcoming(booking: CalBooking): boolean {
  return new Date(booking.startTime) > new Date();
}

export function isCalBookingPast(booking: CalBooking): boolean {
  return new Date(booking.endTime) < new Date();
}

export function getCalBookingDuration(booking: CalBooking): number {
  const start = new Date(booking.startTime);
  const end = new Date(booking.endTime);
  return (end.getTime() - start.getTime()) / (1000 * 60); // minutes
}
