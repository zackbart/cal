"use client";

import { Booker } from "@calcom/atoms";
import { useAuth } from "@/lib/auth";

interface ChurchHubBookerProps {
  username: string;
  eventSlug?: string;
  hideBranding?: boolean;
  className?: string;
}

export function ChurchHubBooker({ 
  username, 
  eventSlug, 
  hideBranding = true,
  className = ""
}: ChurchHubBookerProps) {
  const { user } = useAuth();

  return (
    <div className={`churchhub-booker ${className}`}>
      <Booker
        username={username}
        eventSlug={eventSlug}
        hideBranding={hideBranding}
        theme={{
          brandColor: "hsl(var(--brand))",
          lightColor: "hsl(var(--bg))",
          darkColor: "hsl(var(--fg))",
          lightestColor: "hsl(var(--bg-elevated))",
          mediumColor: "hsl(var(--fg-muted))",
          darkestColor: "hsl(var(--fg))",
          successColor: "hsl(var(--success))",
          warningColor: "hsl(var(--warning))",
          errorColor: "hsl(var(--danger))",
          infoColor: "hsl(var(--accent))",
          subtleColor: "hsl(var(--fg-subtle))",
          subtleBackground: "hsl(var(--bg-elevated))",
          borderColor: "hsl(var(--border))",
          borderRadius: "var(--radius-md)",
          fontFamily: "Inter, ui-sans-serif, system-ui",
        }}
        styles={{
          // Hide Cal.com branding
          ".cal-branding": {
            display: hideBranding ? "none" : "block",
          },
          // Custom ChurchHub styling
          ".cal-container": {
            fontFamily: "Inter, ui-sans-serif, system-ui",
            color: "hsl(var(--fg))",
            backgroundColor: "hsl(var(--bg))",
          },
          ".cal-header": {
            backgroundColor: "hsl(var(--bg-elevated))",
            borderBottom: "1px solid hsl(var(--border))",
          },
          ".cal-button": {
            backgroundColor: "hsl(var(--brand))",
            color: "hsl(var(--brand-foreground))",
            borderRadius: "var(--radius-md)",
            fontFamily: "Inter, ui-sans-serif, system-ui",
            fontWeight: "500",
            transition: "all 0.2s ease-in-out",
          },
          ".cal-button:hover": {
            opacity: "0.95",
          },
          ".cal-input": {
            backgroundColor: "hsl(var(--bg))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius-md)",
            color: "hsl(var(--fg))",
            fontFamily: "Inter, ui-sans-serif, system-ui",
          },
          ".cal-input:focus": {
            outline: "none",
            borderColor: "hsl(var(--ring))",
            boxShadow: "0 0 0 2px hsl(var(--ring) / 0.2)",
          },
          ".cal-card": {
            backgroundColor: "hsl(var(--bg-elevated))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-sm)",
          },
          ".cal-text-muted": {
            color: "hsl(var(--fg-muted))",
          },
          ".cal-text-subtle": {
            color: "hsl(var(--fg-subtle))",
          },
        }}
      />
    </div>
  );
}
