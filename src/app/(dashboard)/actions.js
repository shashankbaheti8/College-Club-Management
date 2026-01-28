'use server'

import { createClient } from '@/lib/supabase/server'
import { checkLimit as checkLimitServer } from '@/lib/subscriptionServer'
import { revalidatePath } from 'next/cache'
import { isPlatformAdmin, isClubAdmin, canManageMembers, checkClubCapacity } from '@/lib/rbac'

/**
 * Server action to check subscription limits
 */
export async function checkSubscriptionLimit(resourceType, contextId = null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { allowed: false, error: 'Not authenticated' }
  }

  return await checkLimitServer(user.id, resourceType, contextId)
}

/**
 * Server action to delete an announcement
 */
export async function deleteAnnouncement(announcementId) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Fetch announcement to check ownership
  const { data: announcement, error: fetchError } = await supabase
    .from('announcements')
    .select('club_id')
    .eq('id', announcementId)
    .single()

  if (fetchError || !announcement) {
    throw new Error('Announcement not found')
  }

  // RBAC Check
  let canDelete = false
  if (announcement.club_id) {
    // Club Announcement: Club Admin or Platform Admin
    const isClub = await isClubAdmin(user.id, announcement.club_id)
    const isPlatform = await isPlatformAdmin(user.id)
    canDelete = isClub || isPlatform
  } else {
    // Global Announcement: Platform Admin only
    canDelete = await isPlatformAdmin(user.id)
  }

  if (!canDelete) {
    throw new Error('Insufficient permissions')
  }

  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', announcementId)

  if (error) {
    throw new Error('Failed to delete announcement')
  }

  revalidatePath('/announcements')
  revalidatePath('/clubs/[id]') 
  revalidatePath('/dashboard')
}

export async function inviteMember(clubId, email) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Permission check
  const canManage = await canManageMembers(user.id, clubId)
  if (!canManage) throw new Error('Insufficient permissions')

  // Capacity check
  const { allowed, error: capError } = await checkClubCapacity(clubId)
  if (!allowed || capError) throw new Error('Club capacity reached')

  // Find user
  const { data: targetUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email.trim())
    .single()

  if (!targetUser) throw new Error('User not found')

  // Check existing membership
  const { data: existing } = await supabase
    .from('club_members')
    .select('id')
    .eq('club_id', clubId)
    .eq('user_id', targetUser.id)
    .single()

  if (existing) throw new Error('User is already a member')

  // Add member
  const { error } = await supabase
    .from('club_members')
    .insert({
      club_id: clubId,
      user_id: targetUser.id,
      role: 'member'
    })

  if (error) throw new Error('Failed to add member')

  revalidatePath(`/clubs/${clubId}`)
}

export async function removeMember(memberId) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Fetch membership to get club_id
  const { data: membership } = await supabase
    .from('club_members')
    .select('club_id, user_id, role')
    .eq('id', memberId)
    .single()

  if (!membership) throw new Error('Membership not found')

  // Permission check
  const canManage = await canManageMembers(user.id, membership.club_id)
  if (!canManage) throw new Error('Insufficient permissions')

  const { error } = await supabase
    .from('club_members')
    .delete()
    .eq('id', memberId)

  if (error) {
    throw new Error('Failed to remove member')
  }

  revalidatePath(`/clubs/${membership.club_id}`)
}