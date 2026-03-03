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
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Loader2, Calendar } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { checkSubscriptionLimit } from '@/app/(dashboard)/actions'
import { createEvent } from './actions'

export default function CreateEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [myAdminClubs, setMyAdminClubs] = useState([])
  const [limitInfo, setLimitInfo] = useState(null)
  const [clubMembers, setClubMembers] = useState([])
  const [selectedCoordinators, setSelectedCoordinators] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    club_id: '',
    visibility: 'public'
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
    const { data: memberships } = await supabase
      .from('club_members')
      .select('club_id, clubs(*)')
      .eq('user_id', user.id)
      .eq('role', 'admin')

    const clubs = memberships?.map(m => m.clubs) || []
    setMyAdminClubs(clubs)
    setLoadingData(false)
  }

  async function fetchClubMembers(clubId) {
    const supabase = createClient()

    // Step 1: Get member user_ids and roles
    const { data: memberRows, error: memErr } = await supabase
      .from('club_members')
      .select('user_id, role')
      .eq('club_id', clubId)
      .order('joined_at', { ascending: true })

    if (memErr || !memberRows?.length) {
      if (memErr) console.error('Error fetching club members:', memErr)
      setClubMembers([])
      setSelectedCoordinators([])
      return
    }

    // Step 2: Fetch profiles for those user_ids
    const userIds = memberRows.map(m => m.user_id)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', userIds)

    // Merge profiles into member rows
    const profileMap = {}
    profiles?.forEach(p => { profileMap[p.id] = p })

    const merged = memberRows.map(m => ({
      ...m,
      profiles: profileMap[m.user_id] || null,
    }))

    setClubMembers(merged)
    setSelectedCoordinators([])
  }

  const handleClubChange = async (clubId) => {
    setFormData({ ...formData, club_id: clubId })
    
    // Check limit for this specific club
    const limit = await checkSubscriptionLimit('activeEvents', clubId)
    setLimitInfo(limit)
    
    if (!limit.allowed) {
      toast.error(`This club has reached its event limit (${limit.current}/${limit.limit}).`)
    }

    // Fetch members for coordinator selection
    await fetchClubMembers(clubId)
  }

  const toggleCoordinator = (userId) => {
    setSelectedCoordinators(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId)
      }
      if (prev.length >= 2) {
        toast.error('Maximum 2 coordinators allowed')
        return prev
      }
      return [...prev, userId]
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (limitInfo && !limitInfo.allowed) {
      toast.error('This club has reached its active event limit.')
      return
    }

    if (!formData.club_id) {
      toast.error('Please select a club')
      return
    }

    if (selectedCoordinators.length === 0) {
      toast.error('Please select at least 1 event coordinator')
      return
    }

    setLoading(true)

    try {
      // Use server action via FormData
      const serverFormData = new FormData()
      serverFormData.set('title', formData.title)
      serverFormData.set('description', formData.description)
      serverFormData.set('date', formData.date)
      serverFormData.set('time', formData.time)
      serverFormData.set('location', formData.location)
      serverFormData.set('club_id', formData.club_id)
      serverFormData.set('visibility', formData.visibility)
      serverFormData.set('coordinator_ids', selectedCoordinators.join(','))

      await createEvent(serverFormData)
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error(error.message || 'Failed to create event')
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
            <CardTitle className="text-destructive">Club Event Limit Reached</CardTitle>
            <CardDescription className="space-y-3">
              <p>
                This club has {limitInfo.current} active events out of {limitInfo.limit} allowed.
              </p>
              <div className="flex gap-2 pt-2">
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
                onValueChange={handleClubChange}
                disabled={myAdminClubs.length === 0}
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

            {/* Coordinator Selection — always visible, disabled until club selected */}
            <div className="space-y-3">
              <div>
                <Label>Event Coordinators * <span className="text-muted-foreground font-normal">(min 1, max 2)</span></Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.club_id ? 'Select club members who will coordinate this event' : 'Select a club first to choose coordinators'}
                </p>
              </div>
              {clubMembers.length > 0 ? (
                <div className="border rounded-lg divide-y">
                  {clubMembers.map((member) => {
                    const isSelected = selectedCoordinators.includes(member.user_id)
                    return (
                      <label
                        key={member.user_id}
                        className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                          isSelected ? 'bg-primary/5' : ''
                        }`}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleCoordinator(member.user_id)}
                          disabled={!isSelected && selectedCoordinators.length >= 2}
                        />
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.profiles?.avatar_url} />
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {member.profiles?.full_name?.substring(0, 2).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{member.profiles?.full_name || 'Unknown'}</span>
                        {member.role === 'admin' && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">Admin</span>
                        )}
                      </label>
                    )
                  })}
                </div>
              ) : (
                <div className="border rounded-lg p-4 text-center text-sm text-muted-foreground opacity-60">
                  {formData.club_id ? 'No members found' : 'Select a club above to see available coordinators'}
                </div>
              )}
              {formData.club_id && selectedCoordinators.length === 0 && (
                <p className="text-xs text-destructive">Please select at least 1 coordinator</p>
              )}
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
                disabled={loading || myAdminClubs.length === 0 || !limitInfo?.allowed || selectedCoordinators.length === 0}
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
