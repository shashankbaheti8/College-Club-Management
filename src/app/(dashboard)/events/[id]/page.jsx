import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Clock, ArrowLeft, Users } from "lucide-react"
import Link from "next/link"
import { isPlatformAdmin } from '@/lib/rbac'
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
        category
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/clubs/${event.club_id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{event.title}</h1>
              <Badge variant={event.status === 'upcoming' ? 'default' : 'secondary'}>
                {event.status}
              </Badge>
            </div>
            <Link href={`/clubs/${event.club_id}`} className="text-muted-foreground mt-1 hover:underline block">
              Hosted by {event.clubs?.name}
            </Link>
          </div>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link href={`/events/${id}/edit`}>
              <Button variant="outline">Edit Event</Button>
            </Link>
            <ConfirmButton
                title="Delete Event"
                description="Are you sure set to delete this event?"
                actionLabel="Delete"
                variant="destructive"
                onConfirm={async () => {
                  'use server'
                  const supabase = await createClient()
                  const { data: { user } } = await supabase.auth.getUser()
                  if (!user) return

                  // RBAC re-check: must be platform admin or club admin
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
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About Event</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {event.description}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Time</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(event.date).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {event.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
             <CardContent className="pt-6">
                <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                        This event is managed by {event.clubs?.name}.
                        For questions, contact the club admins.
                    </p>
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
