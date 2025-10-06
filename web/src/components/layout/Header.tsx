"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;

  const loginHref = projectId
    ? `https://app.stack-auth.com/${projectId}/sign-in?redirect_uri=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin + '/dashboard' : '')}`
    : "/handler/sign-in";

  const signupHref = projectId
    ? `https://app.stack-auth.com/${projectId}/sign-up?redirect_uri=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin + '/dashboard' : '')}`
    : "/handler/sign-up";

  return (
    <header className="w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-semibold">
          ChurchHub
        </Link>
        <nav className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            {/* hosted sign-in */}
            <a href={loginHref}>Login</a>
          </Button>
          <Button asChild variant="outline" size="sm">
            {/* hosted sign-up */}
            <a href={signupHref}>Create account</a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
