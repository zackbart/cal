import { CalProvider, Booker } from "@calcom/atoms";
import { notFound } from "next/navigation";

interface BookingPageProps {
  params: {
    username: string;
  };
}

async function getAccessToken(username: string): Promise<string> {
  // TODO: Implement token fetching from sidecar API
  // This will call POST /tokens/cal/managed-user
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tokens/cal/managed-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch access token');
  }

  const data = await response.json();
  return data.accessToken;
}

export default async function BookingPage({ params }: BookingPageProps) {
  let accessToken: string;
  
  try {
    accessToken = await getAccessToken(params.username);
  } catch (error) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-lg border border-border bg-card p-6 shadow-md">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-card-foreground">
              Schedule with {params.username}
            </h1>
            <p className="mt-2 text-muted-foreground">
              Choose a time that works for you
            </p>
          </div>
          
          <CalProvider
            clientId={process.env.NEXT_PUBLIC_CAL_CLIENT_ID!}
            accessToken={accessToken}
          >
            <Booker
              username={params.username}
              eventSlug="default"
            />
          </CalProvider>
        </div>
      </div>
    </div>
  );
}
