'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, Calendar } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { checkSubscriptionLimit } from '@/app/(dashboard)/actions'

export default function CreateEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [myAdminClubs, setMyAdminClubs] = useState([])
  const [limitInfo, setLimitInfo] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    club_id: '',
    visibility: 'public',
    max_attendees: ''
  })

  useEffect(() => {
    fetchMyClubs()
  }, [])

  async function fetchMyClubs() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    // Fetch clubs where user is admin
    const { data: clubs } = await supabase
      .from('clubs')
      .select('*')
      .eq('admin_id', user.id)

    setMyAdminClubs(clubs || [])

    // Check event creation limits
    const limit = await checkSubscriptionLimit('activeEvents')
    setLimitInfo(limit)
    setLoadingData(false)

    if (!limit.allowed) {
      toast.error(`Event creation limit reached! You can create up to ${limit.limit} active events on your ${limit.planTier} plan.`)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!limitInfo?.allowed) {
      toast.error('You have reached your active event creation limit. Please upgrade your plan.')
      return
    }

    if (!formData.club_id) {
      toast.error('Please select a club')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      
      // Combine date and time
      const eventDateTime = new Date(`${formData.date}T${formData.time}`)

      // Create the event
      const { data: event, error } = await supabase
        .from('events')
        .insert({
          title: formData.title,
          description: formData.description,
          date: eventDateTime.toISOString(),
          location: formData.location || null,
          club_id: formData.club_id,
          visibility: formData.visibility,
          max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
          status: 'upcoming'
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Event created successfully!')
      router.push(`/events/${event.id}`)
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error(error.message || 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/events">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create a New Event</h1>
          <p className="text-sm text-muted-foreground">
            Schedule an event for your club members
          </p>
        </div>
      </div>

      {myAdminClubs.length === 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader>
            <CardTitle>No Clubs Found</CardTitle>
            <CardDescription>
              You need to be an admin of a club to create events.
              <Link href="/clubs/create" className="block mt-2 text-primary hover:underline">
                Create a club first →
              </Link>
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {limitInfo && !limitInfo.allowed && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Event Creation Limit Reached</CardTitle>
            <CardDescription className="space-y-3">
              <p>
                You have {limitInfo.current} active events out of {limitInfo.limit} allowed on your <span className="font-semibold capitalize">{limitInfo.planTier}</span> plan.
              </p>
              <div className="flex gap-2 pt-2">
                <Link href="/settings/subscription" className="flex-1">
                  <Button className="w-full" variant="default">
                    Upgrade Plan
                  </Button>
                </Link>
                <Link href="/events" className="flex-1">
                  <Button className="w-full" variant="outline">
                    View My Events
                  </Button>
                </Link>
              </div>
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>
            Fill in the information about your event
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="club_id">Select Club *</Label>
              <Select
                value={formData.club_id}
                onValueChange={(value) => setFormData({ ...formData, club_id: value })}
                disabled={myAdminClubs.length === 0 || !limitInfo?.allowed}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a club" />
                </SelectTrigger>
                <SelectContent>
                  {myAdminClubs.map((club) => (
                    <SelectItem key={club.id} value={club.id}>
                      {club.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Photography Workshop, Hackathon 2026"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={myAdminClubs.length === 0 || !limitInfo?.allowed}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  disabled={myAdminClubs.length === 0 || !limitInfo?.allowed}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                  disabled={myAdminClubs.length === 0 || !limitInfo?.allowed}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Room 101, Main Building"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                disabled={myAdminClubs.length === 0 || !limitInfo?.allowed}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Tell attendees what this event is about..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
                disabled={myAdminClubs.length === 0 || !limitInfo?.allowed}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility *</Label>
                <Select
                  value={formData.visibility}
                  onValueChange={(value) => setFormData({ ...formData, visibility: value })}
                  disabled={myAdminClubs.length === 0 || !limitInfo?.allowed}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private (Club Members Only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_attendees">Max Attendees (Optional)</Label>
                <Input
                  id="max_attendees"
                  type="number"
                  placeholder="Unlimited"
                  value={formData.max_attendees}
                  onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
                  min="1"
                  disabled={myAdminClubs.length === 0 || !limitInfo?.allowed}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Link href="/events" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={loading || myAdminClubs.length === 0 || !limitInfo?.allowed}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Calendar className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
