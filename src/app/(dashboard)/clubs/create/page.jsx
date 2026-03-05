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
import { ArrowLeft, Loader2, Check, ChevronsUpDown } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { checkSubscriptionLimit } from '@/app/(dashboard)/actions'
import { createClub } from './actions'
import { CLUB_CATEGORIES } from '@/lib/constants'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"

export default function CreateClubPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [checkingLimit, setCheckingLimit] = useState(true)
  const [limitInfo, setLimitInfo] = useState(null)
  
  // Combobox state
  const [openCombobox, setOpenCombobox] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedAdminId, setSelectedAdminId] = useState('')
  const [selectedAdminName, setSelectedAdminName] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: ''
  })

  useEffect(() => {
    checkLimit()
  }, [])

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2 || searchQuery.length === 0) {
        searchUsers(searchQuery)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  async function searchUsers(query) {
    setIsSearching(true)
    const supabase = createClient()
    
    let supabaseQuery = supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('is_platform_admin', false)
      .limit(20)

    if (query && query.trim() !== '') {
      supabaseQuery = supabaseQuery.or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
    } else {
        supabaseQuery = supabaseQuery.order('full_name')
    }

    const { data } = await supabaseQuery
    if (data) setUsers(data)
    setIsSearching(false)
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
      toast.error('You have reached your club creation limit.')
      return
    }

    if (!selectedAdminId) {
      toast.error('Please assign a student as the Club Admin.')
      return
    }

    setLoading(true)

    try {
      // Use server action via FormData
      const serverFormData = new FormData()
      serverFormData.set('name', formData.name)
      serverFormData.set('description', formData.description)
      serverFormData.set('category', formData.category)
      serverFormData.set('admin_user_id', selectedAdminId)
      
      await createClub(serverFormData)
    } catch (error) {
      console.error('Error creating club:', error)
      toast.error(error.message || 'Failed to create club')
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

            <div className="space-y-2 flex flex-col">
              <Label htmlFor="admin">Assign Club Admin *</Label>
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="w-full justify-between font-normal"
                    disabled={!limitInfo?.allowed}
                  >
                    {selectedAdminName || "Select an Admin..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput 
                      placeholder="Search users by name or email..." 
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      {isSearching ? (
                         <div className="p-4 flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                            <span className="text-sm text-muted-foreground">Searching...</span>
                         </div>
                      ) : (
                         <CommandEmpty>No users found.</CommandEmpty>
                      )}
                      
                      {!isSearching && users.length > 0 && (
                        <CommandGroup heading="Suggestions">
                          {users.map((user) => (
                            <CommandItem
                              key={user.id}
                              value={user.id}
                              onSelect={(currentValue) => {
                                setSelectedAdminId(currentValue)
                                setSelectedAdminName(user.full_name || user.email || 'Unnamed User')
                                setOpenCombobox(false)
                                setSearchQuery('') // Reset query after selection
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedAdminId === user.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span>{user.full_name || 'Unnamed User'}</span>
                                <span className="text-xs text-muted-foreground">{user.email}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                Search and select the user who will be the admin of this club (Max 3 clubs per admin). Platform Admins are excluded.
              </p>
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
