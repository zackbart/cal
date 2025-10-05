import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import Link from "next/link";

export default function BookingCancelledPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto max-w-md px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Booking Cancelled</CardTitle>
            <CardDescription>
              Your meeting has been cancelled
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              If you need to reschedule, please use the booking link again.
            </p>
            <Link 
              href="/"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Return Home
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
