import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">C</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">ChurchHub</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
                Documentation
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-foreground mb-6">
            Ministry-Focused Scheduling
          </h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Eliminate back-and-forth coordination between pastors and congregants with 
            context-aware scheduling, built-in privacy features, and secure pastoral care tools.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/book/demo"
              className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Try Demo Booking
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-8 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-accent transition-colors"
            >
              Access Dashboard
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="p-6 rounded-lg border border-border bg-card">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-primary text-xl">📅</span>
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                Cal.com Integration
              </h3>
              <p className="text-muted-foreground text-sm">
                Uses Cal.com Platform + Atoms for seamless booking without forking the codebase.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-primary text-xl">🔒</span>
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                Sensitive Mode
              </h3>
              <p className="text-muted-foreground text-sm">
                Anonymous booking, encryption, and redaction for confidential pastoral care.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-primary text-xl">📋</span>
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                Custom Questionnaires
              </h3>
              <p className="text-muted-foreground text-sm">
                Unlimited questions with branching logic for comprehensive intake forms.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">C</span>
              </div>
              <span className="text-muted-foreground">ChurchHub Scheduler</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link href="/docs" className="hover:text-foreground transition-colors">
                Documentation
              </Link>
              <Link href="/dashboard" className="hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <span>Phase 1 Complete</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
