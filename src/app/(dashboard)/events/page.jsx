import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, MapPin, Building } from "lucide-react"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { isPlatformAdmin } from '@/lib/rbac'
import { getEventStatus } from '@/lib/eventUtils'

function EventCard({ event, isCoordinator }) {
  const status = getEventStatus(event.date)

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader className="bg-muted/50 pb-4">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1.5 pr-2">
              <CardTitle className="text-lg font-bold leading-tight">{event.title}</CardTitle>
              
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                <Building className="h-4 w-4 shrink-0" />
                <span className="font-medium truncate">{event.clubs?.name}</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant={status === 'upcoming' ? 'outline' : status === 'ongoing' ? 'default' : 'secondary'}
                  className={`text-[10px] px-1.5 py-0 ${
                    status === 'upcoming' ? 'border-green-500 text-green-600' :
                    status === 'ongoing' ? 'bg-blue-500 animate-pulse' :
                    'text-muted-foreground'
                  }`}
                >
                  {status === 'upcoming' ? 'Upcoming' : status === 'ongoing' ? 'Ongoing' : 'Completed'}
                </Badge>
                {event.visibility && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize text-muted-foreground">
                    {event.visibility}
                  </Badge>
                )}
                {isCoordinator && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500 text-amber-600 bg-amber-500/10">
                    Coordinator
                  </Badge>
                )}
              </div>
            </div>
            <div className="bg-background border p-2.5 rounded-lg text-center min-w-[3.5rem] shrink-0 shadow-sm mt-0.5">
              <span className="block text-xs font-bold uppercase text-muted-foreground">
                {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
              </span>
              <span className="block text-xl font-bold">
                {new Date(event.date).getDate()}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-4">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {event.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            {event.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {event.location}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function EmptyState({ message }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border-dashed border-2 rounded-lg bg-muted/10">
      <CalendarDays className="h-10 w-10 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No events found</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm">{message}</p>
    </div>
  )
}

function EventGrid({ events, coordinatorIds }) {
  if (!events?.length) return <EmptyState message="No events in this category yet." />
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} isCoordinator={coordinatorIds.has(event.id)} />
      ))}
    </div>
  )
}

export default async function EventsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let canCreateEvent = false
  let isPlatform = false
  const myCoordinatorEventIds = new Set()
  let myClubIds = []

  if (user) {
    isPlatform = await isPlatformAdmin(user.id)

    const { data: members } = await supabase
      .from('club_members')
      .select('club_id, role')
      .eq('user_id', user.id)

    if (members?.length > 0) {
      myClubIds = members.map(m => m.club_id)
      const adminClubs = members.filter(m => m.role === 'admin')
      canCreateEvent = adminClubs.length > 0
    }

    // Fetch events where this user is a coordinator
    const { data: coordEntries } = await supabase
      .from('event_coordinators')
      .select('event_id')
      .eq('user_id', user.id)

    coordEntries?.forEach(c => myCoordinatorEventIds.add(c.event_id))
  }

  // Fetch ALL events
  const { data: allEvents } = await supabase
    .from('events')
    .select(`*, clubs (name)`)
    .order('date', { ascending: true })

  // Filter out private events if user is not a member (and not platform admin)
  const events = allEvents?.filter(e => {
    if (isPlatform) return true
    if (e.visibility === 'public') return true
    // If it's private, user MUST be a member of the club
    return myClubIds.includes(e.club_id)
  }) || []

  // Categorize events by dynamic status
  const upcoming = events.filter(e => getEventStatus(e.date) === 'upcoming')

  const ongoing = events?.filter(e => getEventStatus(e.date) === 'ongoing') || []
  const completed = events?.filter(e => getEventStatus(e.date) === 'completed').reverse() || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Events</h1>
        {canCreateEvent && (
          <Link href="/events/create">
            <Button>Create Event</Button>
          </Link>
        )}
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming {upcoming.length > 0 && <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">{upcoming.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="ongoing">
            Ongoing {ongoing.length > 0 && <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">{ongoing.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed {completed.length > 0 && <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">{completed.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="all">
            All {events?.length > 0 && <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">{events.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          <EventGrid events={upcoming} coordinatorIds={myCoordinatorEventIds} />
        </TabsContent>

        <TabsContent value="ongoing" className="mt-4">
          <EventGrid events={ongoing} coordinatorIds={myCoordinatorEventIds} />
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <EventGrid events={completed} coordinatorIds={myCoordinatorEventIds} />
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <EventGrid events={events} coordinatorIds={myCoordinatorEventIds} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
