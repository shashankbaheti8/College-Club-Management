'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  canManageMembers,
  isPlatformAdmin,
  checkClubCapacity
} from '@/lib/rbac'

/**
 * Add member to club
 */
export async function addMember(clubId, userEmail) {
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

  // Find user by email
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', userEmail)
    .single()

  if (!profile) {
    throw new Error('User not found. They must sign up first.')
  }

  // Platform admins cannot be club members
  const isTargetPlatformAdmin = await isPlatformAdmin(profile.id)
  if (isTargetPlatformAdmin) {
    throw new Error('Platform admins cannot be added as club members.')
  }

  // Add member (always as 'member' — admin is set only at club creation)
  const { error } = await supabase
    .from('club_members')
    .insert({
      club_id: clubId,
      user_id: profile.id,
      role: 'member'
    })

  if (error) {
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

