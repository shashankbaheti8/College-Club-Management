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
          name, 
          description, 
          category
    ])
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  // Add creator as admin member
  const { error: memberError } = await supabase
    .from('club_members')
    .insert({
      club_id: data.id,
      user_id: user.id,
      role: 'admin'
    })

  if (memberError) {
    console.error('Error adding admin member:', memberError)
    // Note: We might want to rollback club creation here in a real transaction, 
    // but for now we log it.
  }

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
