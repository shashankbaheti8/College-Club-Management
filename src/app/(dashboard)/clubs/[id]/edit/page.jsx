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
import { ArrowLeft, Loader2, Building2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { CLUB_CATEGORIES } from '@/lib/constants'

export default function EditClubPage({ params }) {
  const router = useRouter()
  const unwrappedParams = use(params)
  const clubId = unwrappedParams.id
  
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: ''
  })

  useEffect(() => {
    fetchClubData()
  }, [clubId])

  async function fetchClubData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    // Fetch club data
    const { data: club, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', clubId)
      .single()

    if (error || !club) {
      toast.error('Club not found')
      router.push('/clubs')
      return
    }

    // Check if user is admin of the club
    const { data: member } = await supabase
      .from('club_members')
      .select('role')
      .eq('club_id', clubId)
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    if (!member) {
      toast.error('Only club admins can edit club details')
      router.push(`/clubs/${clubId}`)
      return
    }

    setIsAdmin(true)
    setFormData({
      name: club.name || '',
      description: club.description || '',
      category: club.category || ''
    })
    setLoadingData(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('clubs')
        .update({
          name: formData.name,
          description: formData.description,
          category: formData.category
        })
        .eq('id', clubId)

      if (error) throw error

      toast.success('Club updated successfully!')
      router.push(`/clubs/${clubId}`)
    } catch (error) {
      console.error('Error updating club:', error)
      toast.error(error.message || 'Failed to update club')
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
        <Link href={`/clubs/${clubId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Club</h1>
          <p className="text-sm text-muted-foreground">
            Update club information
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Club Information</CardTitle>
          <CardDescription>
            Modify the details about your club
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
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                disabled={loading}
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
                rows={4}
                required
                disabled={loading}
              />
            </div>

            <div className="flex gap-4">
              <Link href={`/clubs/${clubId}`} className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Building2 className="mr-2 h-4 w-4" />
                Update Club
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
