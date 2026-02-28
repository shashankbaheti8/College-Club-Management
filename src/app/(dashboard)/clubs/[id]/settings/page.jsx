'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, UserPlus, UserMinus, Shield } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { updateMemberRole, removeMember } from './actions'

export default function ClubSettingsPage({ params }) {
  const router = useRouter()
  const unwrappedParams = use(params)
  const clubId = unwrappedParams.id
  
  const [loading, setLoading] = useState(true)
  const [club, setClub] = useState(null)
  const [members, setMembers] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)

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

    // Fetch club details
    const { data: clubData } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', clubId)
      .single()

    if (!clubData) {
      router.push('/clubs')
      return
    }

    // Check if user is admin
    const { data: membership } = await supabase
      .from('club_members')
      .select('role')
      .eq('club_id', clubId)
      .eq('user_id', user.id)
      .single()

    if (membership?.role !== 'admin') {
      router.push(`/clubs/${clubId}`)
      toast.error('Only admins can access club settings')
      return
    }

    setIsAdmin(true)
    setClub(clubData)

    // Fetch members
    const { data: membersData } = await supabase
      .from('club_members')
      .select(`
        *,
        profiles (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('club_id', clubId)
      .order('joined_at', { ascending: false })

    setMembers(membersData || [])
    setLoading(false)
  }

  async function handleRoleChange(memberId, newRole) {
    try {
      await updateMemberRole(clubId, memberId, newRole)
      toast.success('Member role updated!')
      fetchClubData()
    } catch (error) {
      toast.error(error.message || 'Failed to update role')
    }
  }

  async function handleRemoveMember(memberId) {
    if (!confirm('Are you sure you want to remove this member?')) {
      return
    }

    try {
      await removeMember(clubId, memberId)
      toast.success('Member removed from club')
      fetchClubData()
    } catch (error) {
      toast.error(error.message || 'Failed to remove member')
    }
  }

  // handleInvite removed - functionality moved to Club Details page

  if (loading) {
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
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/clubs/${clubId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Club Settings</h1>
          <p className="text-sm text-muted-foreground">{club?.name}</p>
        </div>
      </div>

      {/* Invite Members form removed - moved to Club Details */}

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Members ({members.length})</CardTitle>
          <CardDescription>
            Manage roles and remove members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-4 p-4 rounded-lg border">
                <Avatar>
                  <AvatarImage src={member.profiles?.avatar_url} />
                  <AvatarFallback>
                    {member.profiles?.full_name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <p className="font-medium">{member.profiles?.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Joined {new Date(member.joined_at).toLocaleDateString()}
                  </p>
                </div>

                <Select
                  value={member.role}
                  onValueChange={(newRole) => handleRoleChange(member.id, newRole)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Admin
                      </div>
                    </SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>

                {member.role !== 'admin' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    <UserMinus className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
