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
            Pastoral Care
            <span className="text-brand"> Made Simple</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-fg-muted max-w-xl mx-auto">
            Schedule meaningful meetings with the context you need.
          </p>
          <div className="mt-10">
            <Button asChild size="lg">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  Custom Questions
                </CardTitle>
                <CardDescription>
                  Get the context you need before each meeting.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🔒</span>
                  Secure & Private
                </CardTitle>
                <CardDescription>
                  Keep sensitive conversations confidential.
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
                  Never lose track of important details.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <Button asChild size="lg">
            <Link href="/auth/signup">Start Your Free Account</Link>
          </Button>
        </div>
      </main>

    </div>
  );
}

