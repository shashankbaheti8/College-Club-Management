import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, CalendarDays, Settings } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold truncate">{event.title}</h4>
                              {event.visibility && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize text-muted-foreground">
                                  {event.visibility}
                                </Badge>
                              )}
                              {stats.coordinatedEventIds?.has(event.id) && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500 text-amber-600 bg-amber-500/10">
                                  Coordinator
                                </Badge>
                              )}
                            </div>
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

        {stats.coordinatedEvents && stats.coordinatedEvents.length > 0 && (
            <Card className="col-span-1 md:col-span-2">
              <CardHeader className="bg-primary/5 rounded-t-xl border-b border-primary/10">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  <CardTitle>Events You Coordinate</CardTitle>
                </div>
                <CardDescription>Events where you are an assigned coordinator</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {stats.coordinatedEvents.map((event) => (
                    <Link key={`coord-${event.id}`} href={`/events/${event.id}`}>
                      <div className="flex items-start gap-4 p-4 border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer relative overflow-hidden h-full">
                        <div className="absolute top-0 right-0 py-1 px-3 bg-primary text-primary-foreground text-[10px] font-bold rounded-bl-lg">
                            COORDINATOR
                        </div>
                        <div className="bg-background border shadow-sm p-3 rounded-lg text-center min-w-[3.5rem] mt-2">
                          <div className="text-xs font-bold uppercase text-muted-foreground">
                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                          <div className="text-xl font-bold text-primary">
                            {new Date(event.date).getDate()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 mt-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold truncate pr-16">{event.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">{event.clubs?.name}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
        )}
      </div>
    </div>
  )
}
