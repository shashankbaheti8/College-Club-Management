import { createClient } from './supabase/server'
import { APP_LIMITS } from './subscription'

/**
 * Check if user has reached their limit for a resource (SERVER ONLY)
 */
export async function checkLimit(userId, resourceType) {
  const supabase = await createClient()
  const limits = APP_LIMITS
  
  let currentCount = 0
  
  switch (resourceType) {
    case 'clubs':
      // Count clubs where user is admin
      const { count: clubCount } = await supabase
        .from('club_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('role', 'admin')
      
      currentCount = clubCount || 0
      return {
        allowed: currentCount < limits.clubs,
        current: currentCount,
        limit: limits.clubs
      }
    
    case 'activeEvents':
      // Count active events across all user's clubs
      const { data: adminMemberships } = await supabase
        .from('club_members')
        .select('club_id')
        .eq('user_id', userId)
        .eq('role', 'admin') 
      
      if (!adminMemberships || adminMemberships.length === 0) {
        return { allowed: true, current: 0, limit: limits.activeEventsPerClub }
      }
      
      const clubIds = adminMemberships.map(m => m.club_id)
      const { count: eventCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .in('club_id', clubIds)
        .in('status', ['upcoming', 'ongoing'])
      
      currentCount = eventCount || 0
      return {
        allowed: currentCount < limits.activeEventsPerClub,
        current: currentCount,
        limit: limits.activeEventsPerClub
      }
    
    default:
      return { allowed: true, current: 0, limit: 999 }
  }
}

/**
 * Get usage statistics for user (SERVER ONLY)
 */
export async function getUsageStats(userId) {
  const supabase = await createClient()
  
  // Get club count
  const { count: clubCount } = await supabase
    .from('club_members')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('role', 'admin')
  
  // Get active events count
  const { data: adminMemberships } = await supabase
    .from('club_members')
    .select('club_id')
    .eq('user_id', userId)
    .eq('role', 'admin')
  
  let activeEventCount = 0
  
  if (adminMemberships && adminMemberships.length > 0) {
    const clubIds = adminMemberships.map(m => m.club_id)
    const { count } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .in('club_id', clubIds)
      .in('status', ['upcoming', 'ongoing'])
    
    activeEventCount = count || 0
  }
  
  // Get total members across all clubs
  let totalMembers = 0
  if (adminMemberships && adminMemberships.length > 0) {
    const clubIds = adminMemberships.map(m => m.club_id)
    const { count } = await supabase
      .from('club_members')
      .select('*', { count: 'exact', head: true })
      .in('club_id', clubIds)
    
    totalMembers = count || 0
  }
  
  return {
    clubs: {
      current: clubCount || 0,
      limit: APP_LIMITS.clubs,
      percentage: ((clubCount || 0) / APP_LIMITS.clubs) * 100
    },
    activeEvents: {
      current: activeEventCount,
      limit: APP_LIMITS.activeEventsPerClub,
      percentage: ((activeEventCount) / APP_LIMITS.activeEventsPerClub) * 100
    },
    members: {
      current: totalMembers,
      limit: APP_LIMITS.membersPerClub,
      percentage: ((totalMembers) / APP_LIMITS.membersPerClub) * 100
    }
  }
}
