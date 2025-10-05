import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto max-w-md px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Authentication Error</CardTitle>
            <CardDescription>
              There was a problem with the authentication process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Please try again or contact support if the problem persists.
            </p>
            <div className="flex gap-2">
              <Link 
                href="/"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Go Home
              </Link>
              <Link 
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                Dashboard
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
