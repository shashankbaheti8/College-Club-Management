import { createClient } from './supabase/server'
import { PLAN_LIMITS } from './subscription'

/**
 * Get user's subscription plan (SERVER ONLY)
 */
export async function getUserSubscription(userId) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error || !data) {
    // Return default free plan if no subscription found
    return {
      plan_tier: 'free',
      limits: PLAN_LIMITS.free
    }
  }
  
  return {
    ...data,
    limits: PLAN_LIMITS[data.plan_tier]
  }
}

/**
 * Check if user has reached their limit for a resource (SERVER ONLY)
 */
export async function checkLimit(userId, resourceType) {
  const supabase = await createClient()
  const subscription = await getUserSubscription(userId)
  const limits = subscription.limits
  
  let currentCount = 0
  
  switch (resourceType) {
    case 'clubs':
      // Count clubs where user is admin
      const { count: clubCount } = await supabase
        .from('clubs')
        .select('*', { count: 'exact', head: true })
        .eq('admin_id', userId)
      
      currentCount = clubCount || 0
      return {
        allowed: currentCount < limits.clubs,
        current: currentCount,
        limit: limits.clubs,
        planTier: subscription.plan_tier
      }
    
    case 'activeEvents':
      // Count active events across all user's clubs
      const { data: userClubs } = await supabase
        .from('clubs')
        .select('id')
        .eq('admin_id', userId)
      
      if (!userClubs || userClubs.length === 0) {
        return { allowed: true, current: 0, limit: limits.activeEventsPerClub, planTier: subscription.plan_tier }
      }
      
      const clubIds = userClubs.map(c => c.id)
      const { count: eventCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .in('club_id', clubIds)
        .in('status', ['upcoming', 'ongoing'])
      
      currentCount = eventCount || 0
      return {
        allowed: currentCount < limits.activeEventsPerClub,
        current: currentCount,
        limit: limits.activeEventsPerClub,
        planTier: subscription.plan_tier
      }
    
    default:
      return { allowed: true, current: 0, limit: 999, planTier: subscription.plan_tier }
  }
}

/**
 * Get usage statistics for user (SERVER ONLY)
 */
export async function getUsageStats(userId) {
  const supabase = await createClient()
  const subscription = await getUserSubscription(userId)
  
  // Get club count
  const { count: clubCount } = await supabase
    .from('clubs')
    .select('*', { count: 'exact', head: true })
    .eq('admin_id', userId)
  
  // Get active events count
  const { data: userClubs } = await supabase
    .from('clubs')
    .select('id')
    .eq('admin_id', userId)
  
  let activeEventCount = 0
  if (userClubs && userClubs.length > 0) {
    const clubIds = userClubs.map(c => c.id)
    const { count } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .in('club_id', clubIds)
      .in('status', ['upcoming', 'ongoing'])
    
    activeEventCount = count || 0
  }
  
  // Get total members across all clubs
  let totalMembers = 0
  if (userClubs && userClubs.length > 0) {
    const clubIds = userClubs.map(c => c.id)
    const { count } = await supabase
      .from('club_members')
      .select('*', { count: 'exact', head: true })
      .in('club_id', clubIds)
    
    totalMembers = count || 0
  }
  
  return {
    clubs: {
      current: clubCount || 0,
      limit: subscription.limits.clubs,
      percentage: ((clubCount || 0) / subscription.limits.clubs) * 100
    },
    activeEvents: {
      current: activeEventCount,
      limit: subscription.limits.activeEventsPerClub,
      percentage: ((activeEventCount) / subscription.limits.activeEventsPerClub) * 100
    },
    members: {
      current: totalMembers,
      limit: subscription.limits.membersPerClub,
      percentage: ((totalMembers) / subscription.limits.membersPerClub) * 100
    },
    planTier: subscription.plan_tier,
    features: subscription.limits.features
  }
}
