import { createClient } from './supabase/server'

/**
 * RBAC Utility Functions for UniClub Platform
 * These functions provide server-side authorization checks
 */

/**
 * Check if user is a platform admin
 * @param {string} userId - User ID to check
 * @returns {Promise<boolean>}
 */
export async function isPlatformAdmin(userId) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('is_platform_admin')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error checking platform admin status:', error)
    return false
  }
  
  return data?.is_platform_admin === true
}

/**
 * Check if user is admin of a specific club
 * @param {string} userId - User ID to check
 * @param {string} clubId - Club ID to check
 * @returns {Promise<boolean>}
 */
export async function isClubAdmin(userId, clubId) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('club_members')
    .select('role')
    .eq('user_id', userId)
    .eq('club_id', clubId)
    .eq('role', 'admin')
    .single()
  
  if (error) {
    return false
  }
  
  return !!data
}

/**
 * Check if user is member of a specific club (admin or member)
 * @param {string} userId - User ID to check
 * @param {string} clubId - Club ID to check
 * @returns {Promise<boolean>}
 */
export async function isClubMember(userId, clubId) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('club_members')
    .select('id')
    .eq('user_id', userId)
    .eq('club_id', clubId)
    .single()
  
  if (error) {
    return false
  }
  
  return !!data
}

/**
 * Get user's role in a specific club
 * @param {string} userId - User ID to check
 * @param {string} clubId - Club ID to check
 * @returns {Promise<'admin'|'member'|null>}
 */
export async function getUserRole(userId, clubId) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('club_members')
    .select('role')
    .eq('user_id', userId)
    .eq('club_id', clubId)
    .single()
  
  if (error) {
    return null
  }
  
  return data?.role || null
}

/**
 * Check if user can create clubs
 * @param {string} userId - User ID to check
 * @returns {Promise<boolean>}
 */
export async function canCreateClub(userId) {
  return await isPlatformAdmin(userId)
}

/**
 * Check if user can manage a specific club
 * @param {string} userId - User ID to check
 * @param {string} clubId - Club ID to check
 * @returns {Promise<boolean>}
 */
export async function canManageClub(userId, clubId) {
  const isAdmin = await isPlatformAdmin(userId)
  if (isAdmin) return true
  
  return await isClubAdmin(userId, clubId)
}

/**
 * Check if user can create events for a club
 * @param {string} userId - User ID to check
 * @param {string} clubId - Club ID to check
 * @returns {Promise<boolean>}
 */
export async function canCreateEvent(userId, clubId) {
  return await isClubAdmin(userId, clubId)
}

/**
 * Check if user can create announcement for a club or globally
 * @param {string} userId - User ID to check
 * @param {string|null} clubId - Club ID to check (null for global)
 * @returns {Promise<boolean>}
 */
export async function canCreateAnnouncement(userId, clubId = null) {
  if (clubId === null) {
    // Global announcement - must be platform admin
    return await isPlatformAdmin(userId)
  } else {
    // Club announcement - must be club admin
    return await isClubAdmin(userId, clubId)
  }
}

/**
 * Check if user can manage members of a club
 * @param {string} userId - User ID to check
 * @param {string} clubId - Club ID to check
 * @returns {Promise<boolean>}
 */
export async function canManageMembers(userId, clubId) {
  const isAdmin = await isPlatformAdmin(userId)
  if (isAdmin) return true
  
  return await isClubAdmin(userId, clubId)
}

/**
 * Check if adding user as admin would violate admin role cap
 * @param {string} userId - User ID to check
 * @returns {Promise<{allowed: boolean, current: number, limit: number}>}
 */
export async function checkAdminRoleCap(userId) {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('club_members')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('role', 'admin')
  
  if (error) {
    console.error('Error checking admin role cap:', error)
  }
  
  return {
    allowed: (count || 0) < 3,
    current: count || 0,
    limit: 3
  }
}

/**
 * Check if adding member to club would violate capacity cap
 * @param {string} clubId - Club ID to check
 * @returns {Promise<{allowed: boolean, current: number, limit: number}>}
 */
export async function checkClubCapacity(clubId) {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('club_members')
    .select('*', { count: 'exact', head: true })
    .eq('club_id', clubId)
  
  if (error) {
    console.error('Error checking club capacity:', error)
  }
  
  return {
    allowed: (count || 0) < 25,
    current: count || 0,
    limit: 25
  }
}
