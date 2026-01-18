'use client'

import { useState, useEffect, use } from 'react'
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

export default function EditEventPage({ params }) {
  const router = useRouter()
  const unwrappedParams = use(params)
  const eventId = unwrappedParams.id
  
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
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
    fetchEventData()
  }, [eventId])

  async function fetchEventData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    // Fetch event data
    const { data: event, error } = await supabase
      .from('events')
      .select('*, clubs(admin_id)')
      .eq('id', eventId)
      .single()

    if (error || !event) {
      toast.error('Event not found')
      router.push('/events')
      return
    }

    // Check if user is admin of the club
    if (event.clubs.admin_id !== user.id) {
      toast.error('Only club admins can edit events')
      router.push(`/events/${eventId}`)
      return
    }

    setIsAdmin(true)

    // Parse date and time from ISO string
    const eventDate = new Date(event.date)
    const dateStr = eventDate.toISOString().split('T')[0]
    const timeStr = eventDate.toTimeString().slice(0, 5)

    setFormData({
      title: event.title || '',
      description: event.description || '',
      date: dateStr,
      time: timeStr,
      location: event.location || '',
      club_id: event.club_id,
      visibility: event.visibility || 'public',
      max_attendees: event.max_attendees ? String(event.max_attendees) : ''
    })

    setLoadingData(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      
      // Combine date and time
      const eventDateTime = new Date(`${formData.date}T${formData.time}`)

      // Update the event
      const { error } = await supabase
        .from('events')
        .update({
          title: formData.title,
          description: formData.description,
          date: eventDateTime.toISOString(),
          location: formData.location || null,
          visibility: formData.visibility,
          max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null
        })
        .eq('id', eventId)

      if (error) throw error

      toast.success('Event updated successfully!')
      router.push(`/events/${eventId}`)
    } catch (error) {
      console.error('Error updating event:', error)
      toast.error(error.message || 'Failed to update event')
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

  if (!isAdmin) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/events/${eventId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Event</h1>
          <p className="text-sm text-muted-foreground">
            Update event details
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>
            Modify the information about your event
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Photography Workshop, Hackathon 2026"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility *</Label>
                <Select
                  value={formData.visibility}
                  onValueChange={(value) => setFormData({ ...formData, visibility: value })}
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Link href={`/events/${eventId}`} className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Calendar className="mr-2 h-4 w-4" />
                Update Event
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
