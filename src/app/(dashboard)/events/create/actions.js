'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { canCreateEvent } from '@/lib/rbac'

export async function createEvent(formData) {
  const supabase = await createClient()

  // Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const title = formData.get('title')
  const description = formData.get('description')
  const date = formData.get('date')
  const location = formData.get('location')
  const club_id = formData.get('club_id')

  // Check permission: must be admin of this club
  const canCreate = await canCreateEvent(user.id, club_id)
  if (!canCreate) {
    throw new Error('Only club administrators can create events')
  }

  const { data, error } = await supabase
    .from('events')
    .insert({
      title, 
      description, 
      date,
      location,
      club_id,
      created_by: user.id
    })
    .select()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/events')
  revalidatePath(`/clubs/${club_id}`)
  redirect('/events')
}
