import { createClient } from './supabase/server'

/**
 * Create a notification for a single user
 */
export async function createNotification(userId, type, title, message, link = null) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      link
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating notification:', error)
    return null
  }
  
  return data
}

/**
 * Notify all members of a club
 */
export async function notifyClubMembers(clubId, type, title, message, link = null, excludeUserId = null) {
  const supabase = await createClient()
  
  // Get all club members
  const { data: members, error: membersError } = await supabase
    .from('club_members')
    .select('user_id')
    .eq('club_id', clubId)
  
  if (membersError || !members) {
    console.error('Error fetching club members:', membersError)
    return []
  }
  
  // Filter out excluded user
  const userIds = members
    .map(m => m.user_id)
    .filter(id => id !== excludeUserId)
  
  // Create notifications for all members
  const notifications = userIds.map(userId => ({
    user_id: userId,
    type,
    title,
    message,
    link
  }))
  
  const { data, error } = await supabase
    .from('notifications')
    .insert(notifications)
    .select()
  
  if (error) {
    console.error('Error creating notifications:', error)
    return []
  }
  
  return data
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId, userId) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .eq('user_id', userId)
  
  if (error) {
    console.error('Error marking notification as read:', error)
    return false
  }
  
  return true
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false)
  
  if (error) {
    console.error('Error marking all notifications as read:', error)
    return false
  }
  
  return true
}

/**
 * Get user's notifications
 */
export async function getUserNotifications(userId, limit = 10, unreadOnly = false) {
  const supabase = await createClient()
  
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (unreadOnly) {
    query = query.eq('read', false)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
  
  return data
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(userId) {
  const supabase = await createClient()
  
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false)
  
  if (error) {
    console.error('Error fetching unread count:', error)
    return 0
  }
  
  return count || 0
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId, userId) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', userId)
  
  if (error) {
    console.error('Error deleting notification:', error)
    return false
  }
  
  return true
}
