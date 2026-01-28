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
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { checkSubscriptionLimit } from '@/app/(dashboard)/actions'

const CLUB_CATEGORIES = [
  'Technology',
  'Sports',
  'Arts',
  'Music',
  'Academic',
  'Social',
  'Professional',
  'Community Service',
  'Other'
]

export default function CreateClubPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [checkingLimit, setCheckingLimit] = useState(true)
  const [limitInfo, setLimitInfo] = useState(null)
  const [users, setUsers] = useState([])
  const [selectedAdminId, setSelectedAdminId] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: ''
  })

  useEffect(() => {
    checkLimit()
    fetchUsers()
  }, [])

  async function fetchUsers() {
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('is_platform_admin', false)
      .order('full_name')

    if (data) setUsers(data)
  }

  async function checkLimit() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    try {
      // Check if user is platform admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_platform_admin')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      // Only platform admins can create clubs
      if (!profile?.is_platform_admin) {
        toast.error('Only platform administrators can create clubs.')
        router.push('/clubs')
        return
      }

      const limit = await checkSubscriptionLimit('clubs')
      setLimitInfo(limit)
      
      if (!limit.allowed) {
        toast.error(`Club creation limit reached! You can create up to ${limit.limit} clubs.`)
      }
    } catch (error) {
      console.error('Error checking limit:', error)
      toast.error('Failed to check subscription limit')
      router.push('/clubs')
    } finally {
      setCheckingLimit(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!limitInfo?.allowed) {
      toast.error('You have reached your club creation limit. Please upgrade your plan.')
      return
    }

    if (!selectedAdminId) {
      toast.error('Please assign a student as the Club Admin.')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('You must be logged in to create a club')
        router.push('/login')
        return
      }

      const adminIdToAssign = selectedAdminId

      // Rule of 3 Check: Check if target admin manages >= 3 clubs
      const { count: adminClubCount, error: countError } = await supabase
        .from('club_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', adminIdToAssign)
        .eq('role', 'admin')

      if (countError) throw countError

      if (adminClubCount >= 3) {
        toast.error('A user can only be an admin of 3 clubs. Please select another user.')
        setLoading(false)
        return
      }

      // Create the club
      const { data: club, error: clubError } = await supabase
        .from('clubs')
        .insert({
          name: formData.name,
          description: formData.description,
          category: formData.category
        })
        .select()
        .single()

      if (clubError) throw clubError

      // Automatically add selected user as admin member
      const { error: memberError } = await supabase
        .from('club_members')
        .insert({
          club_id: club.id,
          user_id: adminIdToAssign,
          role: 'admin'
        })

      if (memberError) {
        console.error('Error adding admin member:', memberError)
        // If assignment fails, rollback club creation
        await supabase.from('clubs').delete().eq('id', club.id)
        throw new Error('Failed to assign admin. Club creation cancelled.')
      }

      toast.success('Club created successfully!')
      router.push(`/clubs/${club.id}`)
    } catch (error) {
      console.error('Error creating club:', error)
      toast.error(error.message || 'Failed to create club')
    } finally {
      setLoading(false)
    }
  }

  if (checkingLimit) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clubs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create a New Club</h1>
          <p className="text-sm text-muted-foreground">
            Start building your community on campus
          </p>
        </div>
      </div>

      {limitInfo && !limitInfo.allowed && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Club Creation Limit Reached</CardTitle>
            <CardDescription className="space-y-3">
              <p>
                You've created {limitInfo.current} of {limitInfo.limit} allowed clubs.
              </p>
              <div className="flex gap-2 pt-2">
                <Link href="/clubs" className="flex-1">
                  <Button className="w-full" variant="outline">
                    View My Clubs
                  </Button>
                </Link>
              </div>
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Club Information</CardTitle>
          <CardDescription>
            Fill in the details about your club
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Club Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Photography Club, Coding Society"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={!limitInfo?.allowed}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin">Assign Club Admin *</Label>
              <Select
                value={selectedAdminId}
                onValueChange={setSelectedAdminId}
                disabled={!limitInfo?.allowed}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a Admin" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || user.email || 'Unnamed User'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select the user who will be the admin of this club (Max 3 clubs per admin). Platform Admins are excluded.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                required
                disabled={!limitInfo?.allowed}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CLUB_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Tell people what your club is about..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                required
                disabled={!limitInfo?.allowed}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length} characters
              </p>
            </div>

            <div className="flex gap-4">
              <Link href="/clubs" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={loading || !limitInfo?.allowed}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Club
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

