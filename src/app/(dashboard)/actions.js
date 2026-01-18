'use server'

import { createClient } from '@/lib/supabase/server'
import { checkLimit as checkLimitServer } from '@/lib/subscriptionServer'

/**
 * Server action to check subscription limits
 */
export async function checkSubscriptionLimit(resourceType) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { allowed: false, error: 'Not authenticated' }
  }

  return await checkLimitServer(user.id, resourceType)
}
