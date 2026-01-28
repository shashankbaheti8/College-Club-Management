import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, CalendarDays, Settings } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function ClubAdminDashboard({ memberships, stats }) {
  const adminClubs = memberships.filter(m => m.role === 'admin')
  const upcomingEvents = stats.upcomingEvents || []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold md:text-2xl">Club Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage your clubs and events</p>
        </div>
        <Link href="/events/create">
            <Button>Create Event</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Managed Clubs</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminClubs.length}</div>
            <p className="text-xs text-muted-foreground">Clubs you administer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">Across your clubs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEventCount}</div>
            <p className="text-xs text-muted-foreground">Upcoming & ongoing</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Your Clubs</CardTitle>
                <CardDescription>Clubs you manage (Admin) or joined (Member)</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                {memberships.map((membership) => (
                    <Link 
                        key={membership.clubs.id} 
                        href={`/clubs/${membership.clubs.id}`}
                        className="flex items-center gap-4 hover:bg-muted/50 p-2 rounded-lg transition-colors"
                    >
                         <div className="hidden h-9 w-9 sm:flex items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-sm">
                            {membership.clubs.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="grid gap-1 flex-1 min-w-0">
                          <p className="text-sm font-medium leading-none truncate">
                            {membership.clubs.name}
                          </p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {membership.role}
                          </p>
                        </div>
                        {membership.role === 'admin' && (
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                            Admin
                          </span>
                        )}
                    </Link>
                ))}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Events in your clubs</CardDescription>
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
                    <p className="text-sm text-muted-foreground">No upcoming events.</p>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
