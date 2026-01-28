import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShieldAlert } from "lucide-react"

export function ViewerDashboard({ user }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome to UniClub Platform</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-muted-foreground" />
            <CardTitle>No Access</CardTitle>
          </div>
          <CardDescription>
            You are currently a viewer with no club memberships.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            To view club activities, events, and announcements, you must join a club. 
            Club memberships are managed by club administrators.
          </p>
          <div className="flex gap-4">
            <Link href="/clubs">
              <Button>Browse Clubs</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
