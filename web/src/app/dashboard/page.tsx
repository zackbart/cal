import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your scheduling and pastoral care
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Meetings</CardTitle>
              <CardDescription>
                Your next scheduled appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-sm text-muted-foreground">
                +2 from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Forms</CardTitle>
              <CardDescription>
                Manage intake questionnaires
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-sm text-muted-foreground">
                Active forms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Policies</CardTitle>
              <CardDescription>
                Scheduling rules and limits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-sm text-muted-foreground">
                Active policy
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest booking and form submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-2 w-2 rounded-full bg-success"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New booking: Counseling session</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-2 w-2 rounded-full bg-accent"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Form submission: Ministry planning</p>
                    <p className="text-xs text-muted-foreground">4 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
