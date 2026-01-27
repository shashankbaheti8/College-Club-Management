import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function toRelativeString(date) {
  if (!date) return ''
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const delta = Math.round((Date.now() - dateObj.getTime()) / 1000)
  
  const minute = 60
  const hour = minute * 60
  const day = hour * 24
  
  if (delta < 30) return 'just now'
  if (delta < minute) return delta + ' seconds ago'
  if (delta < 2 * minute) return 'a minute ago'
  if (delta < hour) return Math.floor(delta / minute) + ' minutes ago'
  if (Math.floor(delta / hour) == 1) return '1 hour ago'
  if (delta < day) return Math.floor(delta / hour) + ' hours ago'
  if (delta < day * 2) return 'yesterday'
  return Math.floor(delta / day) + ' days ago'
}
