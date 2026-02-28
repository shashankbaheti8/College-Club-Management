'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { isPlatformAdmin, checkAdminRoleCap } from '@/lib/rbac'
import { checkLimit } from '@/lib/subscriptionServer'

export async function createClub(formData) {
  const supabase = await createClient()

  // Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // CRITICAL: Check platform admin permission
  const isAdmin = await isPlatformAdmin(user.id)
  if (!isAdmin) {
    throw new Error('Only platform administrators can create clubs')
  }

  const name = formData.get('name')
  const description = formData.get('description')
  const category = formData.get('category')
  const adminUserId = formData.get('admin_user_id')

  if (!name || !description || !category || !adminUserId) {
    throw new Error('All fields are required')
  }

  // Check subscription limit
  const limitCheck = await checkLimit(user.id, 'clubs')
  if (!limitCheck.allowed) {
    throw new Error(`Club creation limit reached (${limitCheck.current}/${limitCheck.limit})`)
  }

  // Rule of 3 check: can this user be admin of another club?
  const adminCapCheck = await checkAdminRoleCap(adminUserId)
  if (!adminCapCheck.allowed) {
    throw new Error(`Selected user has reached admin limit (${adminCapCheck.current}/${adminCapCheck.limit} clubs)`)
  }

  // Create the club
  const { data, error } = await supabase
    .from('clubs')
    .insert({
      name, 
      description, 
      category
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  // Add selected user as admin member
  const { error: memberError } = await supabase
    .from('club_members')
    .insert({
      club_id: data.id,
      user_id: adminUserId,
      role: 'admin'
    })

  if (memberError) {
    // Rollback club creation if admin assignment fails
    await supabase.from('clubs').delete().eq('id', data.id)
    throw new Error('Failed to assign admin. Club creation cancelled.')
  }

  revalidatePath('/clubs')
  redirect(`/clubs/${data.id}`)
}
