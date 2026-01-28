'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  canManageMembers,
  checkAdminRoleCap,
  checkClubCapacity
} from '@/lib/rbac'

/**
 * Add member to club
 */
export async function addMember(clubId, userEmail, role = 'member') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Check permission
  const canManage = await canManageMembers(user.id, clubId)
  if (!canManage) {
    throw new Error('Not authorized to manage members')
  }

  // Check club capacity
  const capacityCheck = await checkClubCapacity(clubId)
  if (!capacityCheck.allowed) {
    throw new Error(`Club capacity reached (${capacityCheck.current}/${capacityCheck.limit} members)`)
  }

  // Find user by email (first check profiles, then auth.users)
  let targetUserId = null
  
  // Try to find in profiles first
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', userEmail)
    .single()

  if (profile) {
    targetUserId = profile.id
  } else {
    // If not in profiles, the user might not have signed up yet
    throw new Error('User not found. They must sign up first.')
  }

  // If adding as admin, check admin role cap
  if (role === 'admin') {
    const adminCheck = await checkAdminRoleCap(targetUserId)
    if (!adminCheck.allowed) {
      throw new Error(`User has reached admin limit (${adminCheck.current}/${adminCheck.limit} clubs)`)
    }
  }

  // Add member (triggers will validate)
  const { error } = await supabase
    .from('club_members')
    .insert({
      club_id: clubId,
      user_id: targetUserId,
      role
    })

  if (error) {
    // Handle database trigger errors
    if (error.message.includes('admin roles')) {
      throw new Error('User has reached the maximum limit of 3 club admin roles')
    }
    if (error.message.includes('capacity reached')) {
      throw new Error('Club capacity reached. Cannot add more members')
    }
    throw new Error(error.message)
  }

  revalidatePath(`/clubs/${clubId}/settings`)
  revalidatePath(`/clubs/${clubId}`)
  return { success: true }
}

/**
 * Remove member from club
 */
export async function removeMember(clubId, memberId) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const canManage = await canManageMembers(user.id, clubId)
  if (!canManage) {
    throw new Error('Not authorized to manage members')
  }

  const { error } = await supabase
    .from('club_members')
    .delete()
    .eq('id', memberId)
    .eq('club_id', clubId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/clubs/${clubId}/settings`)
  revalidatePath(`/clubs/${clubId}`)
  return { success: true }
}

/**
 * Promote member to admin (or demote admin to member)
 */
export async function updateMemberRole(clubId, memberId, newRole) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const canManage = await canManageMembers(user.id, clubId)
  if (!canManage) {
    throw new Error('Not authorized to manage members')
  }

  // If promoting to admin, check admin role cap
  if (newRole === 'admin') {
    const { data: member } = await supabase
      .from('club_members')
      .select('user_id')
      .eq('id', memberId)
      .single()

    if (member) {
      const adminCheck = await checkAdminRoleCap(member.user_id)
      if (!adminCheck.allowed) {
        throw new Error(`User has reached admin limit (${adminCheck.current}/${adminCheck.limit} clubs)`)
      }
    }
  }

  const { error } = await supabase
    .from('club_members')
    .update({ role: newRole })
    .eq('id', memberId)
    .eq('club_id', clubId)

  if (error) {
    if (error.message.includes('admin roles')) {
      throw new Error('User has reached the maximum limit of 3 club admin roles')
    }
    throw new Error(error.message)
  }

  revalidatePath(`/clubs/${clubId}/settings`)
  revalidatePath(`/clubs/${clubId}`)
  return { success: true }
}
