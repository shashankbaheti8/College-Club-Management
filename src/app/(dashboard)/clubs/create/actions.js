'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createClub(formData) {
  const supabase = await createClient()

  // Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
      redirect('/login')
  }

  const name = formData.get('name')
  const description = formData.get('description')
  const category = formData.get('category')

  const { data, error } = await supabase
    .from('clubs')
    .insert([
      { 
          name, 
          description, 
          category,
          admin_id: user.id 
      },
    ])
    .select()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
