import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, CalendarDays, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function PlatformAdminDashboard({ stats }) {
  const { totalClubs, totalMembers, activeEventCount, upcomingEvents, globalAnnouncements } = stats

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold md:text-2xl">Platform Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Global system overview
            <span className="ml-2 text-xs px-2 py-1 bg-red-500/10 text-red-500 rounded-full">Platform Admin</span>
          </p>
        </div>
        <div className="flex gap-2">
             <Link href="/clubs/create">
                <Button>Create Club</Button>
            </Link>
            <Link href="/announcements/create">
                <Button variant="outline">Global Announcement</Button>
            </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-red-500/5 border-red-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clubs</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClubs}</div>
            <p className="text-xs text-muted-foreground">Active clubs on platform</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
            <p className="text-xs text-muted-foreground">Across all clubs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEventCount}</div>
            <p className="text-xs text-muted-foreground">System-wide events</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
            <CardTitle>Global Announcements</CardTitle>
            <CardDescription>Recent system-wide updates</CardDescription>
        </CardHeader>
        <CardContent>
            {globalAnnouncements && globalAnnouncements.length > 0 ? (
                <div className="space-y-4">
                {globalAnnouncements.map((announcement) => (
                    <div key={announcement.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{announcement.title}</h4>
                        <span className="text-xs text-muted-foreground">
                            {new Date(announcement.created_at).toLocaleDateString()}
                        </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                        {announcement.content}
                        </p>
                    </div>
                ))}
                
                <div className="pt-2">
                    <Link href="/announcements">
                        <Button variant="outline" size="sm" className="w-full">View All Announcements</Button>
                    </Link>
                </div>
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">No global announcements.</p>
            )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>System Upcoming Events</CardTitle>
            <CardDescription>Next events across all clubs</CardDescription>
        </CardHeader>
        <CardContent>
            {upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                {upcomingEvents.map((event) => (
                    <Link key={event.id} href={`/events/${event.id}`}>
                    <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="bg-primary/10 p-3 rounded-lg text-center min-w-[3.5rem]">
                        <div className="text-xs font-bold uppercase text-muted-foreground">
                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                        <div className="text-xl font-bold">
                            {new Date(event.date).getDate()}
                        </div>
                        </div>
                        <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">{event.clubs?.name}</p>
                        </div>
                    </div>
                    </Link>
                ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">No upcoming events in system.</p>
            )}
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
