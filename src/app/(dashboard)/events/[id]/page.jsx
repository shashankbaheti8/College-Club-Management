import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, MapPin, Clock, ArrowLeft, Users, Building, Plus, Share2, MoreHorizontal, Link as LinkIcon } from "lucide-react"
import Link from "next/link"
import { isPlatformAdmin } from '@/lib/rbac'
import { getEventStatus } from '@/lib/eventUtils'
import ConfirmButton from "@/components/ui/ConfirmButton"

export default async function EventDetailPage({ params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch event details with club info
  const { data: event, error } = await supabase
    .from('events')
    .select(`
      *,
      clubs (
        id,
        name,
        category,
        description
      )
    `)
    .eq('id', id)
    .single()

  if (error || !event) {
    notFound()
  }

  // Check permissions
  // 1. Check if user is platform admin
  const isPlatform = await isPlatformAdmin(user.id)

  // 2. Check if user is club admin
  const { data: membership } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', event.club_id)
    .eq('user_id', user.id)
    .single()

  const isClubAdmin = membership?.role === 'admin'
  const canEdit = isPlatform || isClubAdmin

  // Fetch event coordinators
  const { data: coordinators } = await supabase
    .from('event_coordinators')
    .select(`
      user_id,
      profiles:user_id (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('event_id', id)
    
  const status = getEventStatus(event.date)
  const eventDate = new Date(event.date)

  return (
    <div className="space-y-8 pb-8">
      {/* Back Button */}
      <div>
        <Link href={`/events`}>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground -ml-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-muted border p-8 md:p-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between items-start md:items-center">
          <div className="space-y-4 max-w-2xl">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                {event.clubs?.name}
              </Badge>
              <Badge variant="outline" className="bg-background/80 backdrop-blur-sm capitalize">
                {event.visibility} Event
              </Badge>
              <Badge
                variant={status === 'upcoming' ? 'outline' : status === 'ongoing' ? 'default' : 'secondary'}
                className={`capitalize bg-background/80 ${
                  status === 'upcoming' ? 'border-green-500 text-green-600' :
                  status === 'ongoing' ? 'bg-blue-500 animate-pulse' :
                  'text-muted-foreground'
                }`}
              >
                {status}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{event.title}</h1>
            <p className="text-xl text-muted-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5" /> 
              {eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {canEdit && (
        <div className="flex gap-2 justify-end">
          <Link href={`/events/${id}/edit`}>
            <Button variant="outline">Edit Event Details</Button>
          </Link>
          <ConfirmButton
              title="Delete Event"
              description="Are you sure you want to delete this event? This action cannot be undone."
              actionLabel="Delete"
              variant="destructive"
              onConfirm={async () => {
                'use server'
                const supabase = await createClient()
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const isPlatform = await isPlatformAdmin(user.id)
                if (!isPlatform) {
                  const { data: mem } = await supabase
                    .from('club_members')
                    .select('role')
                    .eq('club_id', event.club_id)
                    .eq('user_id', user.id)
                    .eq('role', 'admin')
                    .single()
                  if (!mem) return
                }

                await supabase.from('events').delete().eq('id', id)
                redirect(`/clubs/${event.club_id}`)
              }}
          >
              Delete Event
          </ConfirmButton>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3 items-start">
        {/* Left Column (Description & Details) */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">About this event</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground">
                {event.description.split('\n').map((paragraph, idx) => (
                  <p key={idx} className={paragraph.trim() === '' ? 'h-4' : 'mb-4'}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Organizer Info (to fill up space and make design richer) */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Hosted by</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
               <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Building className="h-8 w-8 text-primary" />
               </div>
               <div>
                  <h3 className="font-bold text-lg">{event.clubs?.name}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mt-1 mb-3">
                    {event.clubs?.description || "A UniClub community."}
                  </p>
                  <Link href={`/clubs/${event.club_id}`}>
                    <Button variant="outline" size="sm">
                      Visit Club Page
                    </Button>
                  </Link>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6 lg:sticky lg:top-8">
          <Card className="shadow-sm border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Time & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <div className="bg-muted p-3 rounded-lg flex items-center justify-center w-12 h-12 shrink-0">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    {eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {event.location && (
                <div className="flex gap-4">
                  <div className="bg-muted p-3 rounded-lg flex items-center justify-center w-12 h-12 shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Location</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{event.location}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {coordinators && coordinators.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Event Coordinators</CardTitle>
                <CardDescription>Contact them for questions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {coordinators.map((coord) => (
                  <div key={coord.user_id} className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={coord.profiles?.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {coord.profiles?.full_name?.substring(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{coord.profiles?.full_name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">Coordinator</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
