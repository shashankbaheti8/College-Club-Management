import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, MapPin } from "lucide-react"
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function EventsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let canCreateEvent = false
  let myClubIds = []
  let isPlatform = false

  if (user) {
      // Check platform admin
      const { isPlatformAdmin } = await import('@/lib/rbac')
      isPlatform = await isPlatformAdmin(user.id)

      // Fetch my clubs (admin or member)
      const { data: members } = await supabase
        .from('club_members')
        .select('club_id, role')
        .eq('user_id', user.id)
      
      if (members && members.length > 0) {
        myClubIds = members.map(m => m.club_id)
        // Check if admin of any club for create permission
        const adminClubs = members.filter(m => m.role === 'admin')
        canCreateEvent = adminClubs.length > 0
      }
  }
  
  // Build query
  let query = supabase
    .from('events')
    .select(`
        *,
        clubs (
            name
        )
    `)
    .order('date', { ascending: true })

  // Apply filter: If NOT platform admin AND has clubs, restrict to my clubs.
  // If user has NO clubs (Viewer), they see ALL events (per requirement).
  if (!isPlatform && myClubIds.length > 0) {
      query = query.in('club_id', myClubIds)
  }

  const { data: events, error } = await query

  return (
    <div className='space-y-6'>
         <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold md:text-2xl">Upcoming Events</h1>
            {canCreateEvent && (
                <Link href="/events/create">
                    <Button>Create Event</Button>
                </Link>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events?.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="bg-muted/50 pb-4">
                        <div className="flex justify-between items-start">
                             <div>
                                <CardTitle className="text-base">{event.title}</CardTitle>
                                <CardDescription className="flex items-center mt-1">
                                    <span className="font-medium text-primary">{event.clubs?.name}</span>
                                </CardDescription>
                             </div>
                             <div className="bg-background p-2 rounded-md text-center min-w-[3rem] shadow-sm">
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
                                {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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
            ))}

            {(!events || events.length === 0) && (
                <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border-dashed border-2 rounded-lg bg-muted/10">
                    <CalendarDays className="h-10 w-10 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No events found</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                        There are no upcoming events scheduled yet. Be the first to create one!
                    </p>
                </div>
            )}
          </div>
    </div>
  )
}
