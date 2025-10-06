import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
              <Link href="/" className="font-semibold text-xl">
                ChurchHub Cal
              </Link>
          <nav className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-fg sm:text-6xl">
            Ministry-Focused
            <span className="text-brand"> Scheduling</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-fg-muted max-w-2xl mx-auto">
            Eliminate back-and-forth emails and ensure every pastoral meeting is purpose-driven and context-aware. 
            Built specifically for pastors and ministry leaders.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg">
              <Link href="/auth/signup">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="mt-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-fg">Built for Pastoral Care</h2>
            <p className="mt-4 text-lg text-fg-muted">
              Everything you need to manage your ministry schedule with care and confidentiality
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  Custom Questionnaires
                </CardTitle>
                <CardDescription>
                  Create unlimited questions with conditional logic to gather the context you need for each meeting.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🔒</span>
                  Sensitive Mode
                </CardTitle>
                <CardDescription>
                  Handle confidential pastoral care with encrypted data storage and secure access controls.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🤖</span>
                  AI Summaries
                </CardTitle>
                <CardDescription>
                  Get AI-generated meeting summaries to help you prepare and follow up on pastoral conversations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">⏰</span>
                  Smart Scheduling
                </CardTitle>
                <CardDescription>
                  Set maximum meetings per day, buffer times, and working hours to protect your time and energy.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📅</span>
                  Calendar Integration
                </CardTitle>
                <CardDescription>
                  Sync with Google Calendar, Outlook, and Apple Calendar to avoid double-booking.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  Ministry Insights
                </CardTitle>
                <CardDescription>
                  Track your pastoral care patterns and get insights to improve your ministry effectiveness.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Transform Your Ministry Scheduling?</CardTitle>
              <CardDescription>
                Join pastors who are already using ChurchHub to streamline their pastoral care and focus on what matters most.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="w-full">
                <Link href="/auth/signup">Start Your Free Account</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 mt-24">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-fg-muted">
                <p>&copy; 2025 ChurchHub Cal. Built with care for ministry leaders.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

