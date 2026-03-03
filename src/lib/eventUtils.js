/**
 * Compute event status dynamically from its date.
 *   - Future date → 'upcoming'
 *   - Today → 'ongoing'
 *   - Past date → 'completed'
 */
export function getEventStatus(eventDate) {
  const now = new Date()
  const date = new Date(eventDate)

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const eventDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (eventDay > today) return 'upcoming'
  if (eventDay.getTime() === today.getTime()) return 'ongoing'
  return 'completed'
}
