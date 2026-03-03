'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { canCreateEvent } from '@/lib/rbac'
import { checkLimit } from '@/lib/subscriptionServer'

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
  const time = formData.get('time')
  const location = formData.get('location')
  const club_id = formData.get('club_id')
  const visibility = formData.get('visibility') || 'public'
  const coordinatorIdsRaw = formData.get('coordinator_ids')

  if (!title || !description || !date || !time || !club_id) {
    throw new Error('All required fields must be filled')
  }

  // Parse and validate coordinator IDs
  const coordinatorIds = coordinatorIdsRaw ? coordinatorIdsRaw.split(',').filter(Boolean) : []
  if (coordinatorIds.length === 0) {
    throw new Error('At least 1 event coordinator is required')
  }
  if (coordinatorIds.length > 2) {
    throw new Error('Maximum 2 event coordinators allowed')
  }

  // Validate coordinators are members of the club
  const { data: validMembers } = await supabase
    .from('club_members')
    .select('user_id')
    .eq('club_id', club_id)
    .in('user_id', coordinatorIds)

  if (!validMembers || validMembers.length !== coordinatorIds.length) {
    throw new Error('All coordinators must be members of the selected club')
  }

  // Check permission: must be admin of this club
  const canCreate = await canCreateEvent(user.id, club_id)
  if (!canCreate) {
    throw new Error('Only club administrators can create events')
  }

  // Check subscription limit for active events
  const limitCheck = await checkLimit(user.id, 'activeEvents', club_id)
  if (!limitCheck.allowed) {
    throw new Error(`Active event limit reached for this club (${limitCheck.current}/${limitCheck.limit})`)
  }

  // Combine date and time
  const eventDateTime = new Date(`${date}T${time}`)
  
  if (eventDateTime < new Date()) {
    throw new Error('Event date and time cannot be in the past')
  }

  const { data, error } = await supabase
    .from('events')
    .insert({
      title, 
      description, 
      date: eventDateTime.toISOString(),
      location: location || null,
      club_id,
      visibility,
      status: 'upcoming'
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  // Insert coordinators
  const coordinatorRows = coordinatorIds.map(userId => ({
    event_id: data.id,
    user_id: userId,
  }))

  const { error: coordError } = await supabase
    .from('event_coordinators')
    .insert(coordinatorRows)

  if (coordError) {
    // Rollback event if coordinator insert fails
    await supabase.from('events').delete().eq('id', data.id)
    throw new Error('Failed to assign coordinators. Event creation cancelled.')
  }

  revalidatePath('/events')
  revalidatePath(`/clubs/${club_id}`)
  redirect(`/events/${data.id}`)
}
