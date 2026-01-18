'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export async function login(formData) {
  const supabase = await createClient()

  // Type-casting here for convenience
  const email = String(formData.get('email')).trim()
  const password = String(formData.get('password'))

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData) {
  const supabase = await createClient()

  const email = String(formData.get('email')).trim()
  const password = String(formData.get('password'))
  const fullName = String(formData.get('full_name')).trim()

  // Server-side validation to prevent cryptic database errors
  if (!fullName || fullName.length < 3) {
      redirect('/signup?error=' + encodeURIComponent('Full name must be at least 3 characters long.'))
  }
  
  if (!password || password.length < 6) {
      redirect('/signup?error=' + encodeURIComponent('Password must be at least 6 characters long.'))
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
        data: {
          full_name: fullName,
        }
    }
  })

  if (error) {
    redirect('/signup?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')

  if (data.session) {
    redirect('/dashboard')
  }

  redirect('/login?message=Check email to continue sign in process')
}

export async function logout() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Error signing out:', error)
  }
  
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function updateProfile(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const fullName = String(formData.get('full_name')).trim()
  const bio = String(formData.get('bio')).trim()
  const website = String(formData.get('website')).trim()

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      bio: bio || null,
      website: website || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/settings/profile')
  return { success: true }
}
