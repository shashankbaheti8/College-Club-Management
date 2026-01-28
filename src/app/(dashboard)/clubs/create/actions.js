'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { isPlatformAdmin } from '@/lib/rbac'

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

  // NOTE: Platform admin creates club but is NOT added as member
  // Club admins are added separately via member management

  revalidatePath('/clubs')
  redirect(`/clubs/${data.id}`)
}
