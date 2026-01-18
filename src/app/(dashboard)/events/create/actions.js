'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

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

  const { data, error } = await supabase
    .from('events')
    .insert([
      { 
          title, 
          description, 
          date,
          location,
          club_id 
      },
    ])
    .select()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/events')
  revalidatePath('/dashboard')
  redirect('/events')
}
