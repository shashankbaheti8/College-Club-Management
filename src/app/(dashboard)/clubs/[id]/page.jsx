import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { isPlatformAdmin } from '@/lib/rbac'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Calendar, Settings, ArrowLeft, UserPlus, Trash2, CalendarDays, Building } from "lucide-react"
import { getEventStatus } from '@/lib/eventUtils'
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CreateAnnouncementModal from "@/components/CreateAnnouncementModal"
import InviteMemberModal from "@/components/InviteMemberModal"
import ConfirmButton from "@/components/ui/ConfirmButton"
import { deleteAnnouncement } from '@/app/(dashboard)/actions'
import { removeMember } from './settings/actions'

export default async function ClubDetailPage({ params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Fetch club details
  const { data: club, error } = await supabase
    .from('clubs')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !club) {
    notFound()
  }

    // Fetch all related data in parallel
    const results = await Promise.all([
    // Check membership
    supabase
      .from('club_members')
      .select('role')
      .eq('club_id', id)
      .eq('user_id', user.id)
      .maybeSingle(), // Use maybeSingle to avoid 406 if row doesn't exist

    // Fetch admins
    supabase
      .from('club_members')
      .select(`
        profiles:club_members_profiles_fkey (full_name)
      `)
      .eq('club_id', id)
      .eq('role', 'admin'),

    // Fetch members
    supabase
      .from('club_members')
      .select(`
        id,
        role,
        joined_at,
        profiles:club_members_profiles_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('club_id', id)
      .order('joined_at', { ascending: true }),

    // Fetch ALL events for this club
    supabase
      .from('events')
      .select('*')
      .eq('club_id', id)
      .order('date', { ascending: true }),

    // Fetch announcements
    supabase
      .from('announcements')
      .select(`
        *,
        profiles:announcements_created_by_fkey (full_name)
      `)
      .eq('club_id', id)
      .order('created_at', { ascending: false })
      .limit(5)
  ])

  const [
    { data: membership },
    { data: clubAdmins },
    { data: members },
    eventsResult,
    announcementsResult
  ] = results

  // Filter events based on visibility and user role
  const isPlatform = await isPlatformAdmin(user.id)
  const isMember = !!membership
  const isAdmin = membership?.role === 'admin' || isPlatform
  const canViewAnnouncements = isMember || isAdmin
  const canViewMembers = isMember || isAdmin

  const allClubEvents = (eventsResult.data || []).filter(e => {
    if (isPlatform || isMember) return true
    return e.visibility === 'public'
  })

  const upcomingEvents = allClubEvents.filter(e => getEventStatus(e.date) === 'upcoming')
  const ongoingEvents = allClubEvents.filter(e => getEventStatus(e.date) === 'ongoing')
  const completedEvents = allClubEvents.filter(e => getEventStatus(e.date) === 'completed').reverse()
  const announcements = announcementsResult.data


  // Debug Errors
  const errors = results.filter(r => r.error).map(r => r.error.message)
  if (errors.length > 0) {
      console.error("Club Details Fetch Errors:", errors)
  }

  // Define userRole specifically for the view
  const userRole = membership?.role

  return (
    <div className="space-y-6">
      {errors.length > 0 && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md border border-destructive/20">
              <h3 className="font-bold">Errors Loading Club Details:</h3>
              <ul className="list-disc pl-5">
                  {errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
          </div>
      )}
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/clubs">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{club.name}</h1>
              <Badge variant="outline" className="capitalize">{club.category}</Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Managed by {clubAdmins?.map(a => a.profiles?.full_name).join(', ') || 'Club Admins'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {/* Join Club removed as per requirements */}
          {isMember && !isAdmin && (
            <ConfirmButton
                title="Leave Club"
                description="Are you sure you want to leave this club?"
                actionLabel="Leave"
                variant="destructive"
                onConfirm={async () => {
                  'use server'
                  const supabase = await createClient()
                  const { data: { user } } = await supabase.auth.getUser()
                  
                  await supabase.from('club_members')
                    .delete()
                    .eq('club_id', id)
                    .eq('user_id', user.id)
                  
                  redirect(`/clubs?left=${id}`)
                }}
            >
                Leave Club
            </ConfirmButton>
          )}
          {/* Club Admin Only Actions */}
          {userRole === 'admin' && (
            <>
              <Link href={`/clubs/${id}/edit`}>
                <Button variant="outline">
                  Edit Club
                </Button>
              </Link>
              <Link href={`/clubs/${id}/settings`}>
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </Link>
            </>
          )}
           {/* Platform Admin Only Action */}
           {isPlatform && (
             <ConfirmButton
                title="Delete Club"
                description="Are you sure you want to delete this club? This action cannot be undone and will remove all members and events."
                actionLabel="Delete Club"
                variant="destructive"
                onConfirm={async () => {
                  'use server'
                  const supabase = await createClient()
                  
                  // Verify platform admin again on server action for safety
                  const { data: { user } } = await supabase.auth.getUser()
                  const { isPlatformAdmin } = await import('@/lib/rbac')
                  if (!await isPlatformAdmin(user.id)) return
    
                  await supabase.from('clubs').delete().eq('id', id)
                  redirect('/clubs')
                }}
             >
                Delete Club
             </ConfirmButton>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{userRole || 'Not a member'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {canViewMembers && <TabsTrigger value="members">Members</TabsTrigger>}
          <TabsTrigger value="events">Events</TabsTrigger>
          {canViewAnnouncements && <TabsTrigger value="announcements">Announcements</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {club.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Next events from this club</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingEvents && upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <Link 
                      key={event.id} 
                      href={`/events/${event.id}`}
                      className="flex items-start gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="bg-primary/10 p-2 rounded text-center min-w-[3rem]">
                        <div className="text-xs font-bold uppercase text-muted-foreground">
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                        <div className="text-lg font-bold">
                          {new Date(event.date).getDate()}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{event.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          {event.location && <span>📍 {event.location}</span>}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No upcoming events scheduled
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {canViewMembers && (
        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Club Members</CardTitle>
                  <CardDescription>{members?.length || 0} members</CardDescription>
                </div>
                {isAdmin && (
                  <InviteMemberModal clubId={id} />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {members
                  ?.slice()
                  .sort((a, b) => {
                    // Admin first
                    if (a.role === 'admin' && b.role !== 'admin') return -1
                    if (a.role !== 'admin' && b.role === 'admin') return 1
                    // Then alphabetically by name
                    return (a.profiles?.full_name || '').localeCompare(b.profiles?.full_name || '')
                  })
                  .map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.profiles?.avatar_url} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {member.profiles?.full_name?.substring(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{member.profiles?.full_name || 'Unknown'}</p>
                        {member.role === 'admin' && (
                          <Badge variant="default" className="text-xs">Admin</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-muted-foreground">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </div>
                      {isAdmin && member.role !== 'admin' && (
                        <ConfirmButton
                          title="Remove Member"
                          description="Are you sure you want to remove this member from the club?"
                          actionLabel="Remove"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:bg-destructive/10"
                          onConfirm={async () => {
                            'use server'
                            await removeMember(id, member.id)
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </ConfirmButton>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        )}

        <TabsContent value="events" className="space-y-4">
          <div className="flex items-center justify-between">
            <div />
            {isAdmin && (
              <Link href="/events/create">
                <Button size="sm">Create Event</Button>
              </Link>
            )}
          </div>

          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList>
              <TabsTrigger value="upcoming">
                Upcoming {upcomingEvents.length > 0 && <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">{upcomingEvents.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="ongoing">
                Ongoing {ongoingEvents.length > 0 && <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">{ongoingEvents.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed {completedEvents.length > 0 && <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">{completedEvents.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="all">
                All {allClubEvents.length > 0 && <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">{allClubEvents.length}</Badge>}
              </TabsTrigger>
            </TabsList>

            {[['upcoming', upcomingEvents], ['ongoing', ongoingEvents], ['completed', completedEvents], ['all', allClubEvents]].map(([key, list]) => (
              <TabsContent key={key} value={key} className="mt-4">
                {list.length > 0 ? (
                  <div className="space-y-3">
                    {list.map((event) => {
                      const status = getEventStatus(event.date)
                      return (
                        <Link
                          key={event.id}
                          href={`/events/${event.id}`}
                          className="flex items-start gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="bg-primary/10 p-2 rounded text-center min-w-[3rem]">
                            <div className="text-xs font-bold uppercase text-muted-foreground">
                              {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                            </div>
                            <div className="text-lg font-bold">
                              {new Date(event.date).getDate()}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col gap-1 pr-2">
                              <h4 className="font-semibold text-base leading-tight">{event.title}</h4>
                              
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                                <Building className="h-3.5 w-3.5 shrink-0" />
                                <span className="font-medium truncate">{club.name}</span>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">
                                {key === 'all' && (
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
                                )}
                                {event.visibility && (
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize text-muted-foreground">
                                    {event.visibility}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {event.description}
                            </p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span>{new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              {event.location && <span>📍 {event.location}</span>}
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No {key === 'all' ? '' : key} events
                  </p>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        {canViewAnnouncements && (
          <TabsContent value="announcements" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Announcements</CardTitle>
                  <CreateAnnouncementModal clubId={id} isAdmin={isAdmin} />
                </div>
              </CardHeader>
              <CardContent>
                {announcements && announcements.length > 0 ? (
                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <div key={announcement.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{announcement.title}</h4>
                            <span className="text-xs text-muted-foreground">
                              {new Date(announcement.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {isAdmin && (
                            <ConfirmButton
                              title="Delete Announcement"
                              description="Are you sure you want to delete this announcement? This cannot be undone."
                              actionLabel="Delete"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onConfirm={async () => {
                                'use server'
                                await deleteAnnouncement(announcement.id)
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </ConfirmButton>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {announcement.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          By {announcement.profiles?.full_name}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No announcements yet
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
