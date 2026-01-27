import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CalendarDays, TrendingUp } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Fetch user's club memberships
  const { data: myMemberships } = await supabase
    .from('club_members')
    .select(`
      *,
      clubs (
        id,
        name,
        description,
        member_count
      )
    `)
    .eq('user_id', user.id)

  const myClubs = myMemberships || []
  const clubIds = myClubs.map(m => m.clubs.id)

  // Fetch all dashboard stats in parallel (only if user has clubs)
  let totalMembers = 0
  let activeEventCount = 0
  let upcomingEvents = []
  let myRegistrations = 0

  if (clubIds.length > 0) {
    const [membersResult, eventsResult, upcomingResult, registrationsResult] = await Promise.all([
      // Count total members across all my clubs
      supabase
        .from('club_members')
        .select('*', { count: 'exact', head: true })
        .in('club_id', clubIds),
      
      // Count active events
      supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .in('club_id', clubIds)
        .in('status', ['upcoming', 'ongoing']),
      
      // Fetch upcoming events
      supabase
        .from('events')
        .select(`
          *,
          clubs (name),
          event_registrations!left (
            user_id,
            status
          )
        `)
        .in('club_id', clubIds)
        .eq('status', 'upcoming')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(5),
      
      // Count my event registrations
      supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'registered')
    ])

    totalMembers = membersResult.count || 0
    activeEventCount = eventsResult.count || 0
    upcomingEvents = upcomingResult.data || []
    myRegistrations = registrationsResult.count || 0
  }

  return (
    <div className='flex flex-col gap-6'>
         <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back! Here's your overview.</p>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
             <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20 backdrop-blur-sm hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    My Clubs
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{myClubs.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {myClubs.filter(m => m.role === 'admin').length} as admin
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20 backdrop-blur-sm hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Members
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalMembers}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all your clubs
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20 backdrop-blur-sm hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Events
                  </CardTitle>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeEventCount}</div>
                  <p className="text-xs text-muted-foreground">
                    Upcoming & ongoing
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-pink-500/10 to-transparent border-pink-500/20 backdrop-blur-sm hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">My Registrations</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{myRegistrations}</div>
                  <p className="text-xs text-muted-foreground">
                    Events you're attending
                  </p>
                </CardContent>
              </Card>
          </div>
          
          <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="grid gap-2">
                  <CardTitle>Upcoming Events</CardTitle>
                  <CardDescription>
                    Next events from your clubs
                  </CardDescription>
                </div>
                <Link href="/events">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </CardHeader>
              <CardContent>
                 {upcomingEvents.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => {
                      const isRegistered = event.event_registrations?.some(
                        reg => reg.user_id === user.id && reg.status === 'registered'
                      )
                      
                      return (
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
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="font-semibold truncate">{event.title}</h4>
                                  <p className="text-sm text-muted-foreground">{event.clubs?.name}</p>
                                </div>
                                {isRegistered && (
                                  <span className="text-xs px-2 py-1 bg-green-500/10 text-green-600 rounded-full whitespace-nowrap">
                                    Registered
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                              {event.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>{new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              {event.location && <span>📍 {event.location}</span>}
                            </div>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                 ) : (
                  <div className="flex flex-col gap-4 text-sm text-muted-foreground text-center py-10">
                    <CalendarDays className="h-10 w-10 mx-auto text-muted-foreground/50" />
                    <div>
                      <p className="font-medium mb-1">No upcoming events</p>
                      <p className="text-xs">Join a club or create an event to get started</p>
                    </div>
                  </div>
                 )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>My Clubs</CardTitle>
                <CardDescription>Clubs you're part of</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                 {myClubs.length > 0 ? (
                   myClubs.slice(0, 5).map((membership) => (
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
                   ))
                 ) : (
                  <div className="text-center py-6">
                    <Users className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">You haven't joined any clubs yet</p>
                    <Link href="/clubs">
                      <Button size="sm">Browse Clubs</Button>
                    </Link>
                  </div>
                 )}
                 {myClubs.length > 5 && (
                   <Link href="/clubs">
                     <Button variant="ghost" size="sm" className="w-full">
                       View All ({myClubs.length})
                     </Button>
                   </Link>
                 )}
              </CardContent>
            </Card>
          </div>
    </div>
  )
}

