'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, Check, X, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from 'next/link'
import { toast } from 'sonner'

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetchNotifications()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  async function fetchNotifications() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    // Fetch recent notifications
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (data) {
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.read).length)
    }
    
    setLoading(false)
  }

  async function markAsRead(notificationId) {
    const supabase = createClient()
    
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
    
    // Update local state
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  async function markAllAsRead() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)
    
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
    toast.success('All notifications marked as read')
  }

  async function deleteNotification(notificationId) {
    const supabase = createClient()
    
    await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
    
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
    if (notifications.find(n => n.id === notificationId && !n.read)) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'event': return '📅'
      case 'club': return '👥'
      case 'announcement': return '📢'
      case 'member': return '👤'
      default: return '🔔'
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto p-0 text-xs text-primary hover:bg-transparent"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length > 0 ? (
          <ScrollArea className="h-[400px]">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-2 py-3 hover:bg-muted/50 transition-colors border-b last:border-0 ${
                  !notification.read ? 'bg-muted/30' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium leading-none mb-1">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.created_at).toRelativeString?.() || 
                           new Date(notification.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(notification.id)
                            }}
                            title="Mark as read"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                          title="Delete"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {notification.link && (
                      <Link 
                        href={notification.link}
                        className="text-xs text-primary hover:underline mt-1 inline-block"
                        onClick={() => {
                          setOpen(false)
                          if (!notification.read) {
                            markAsRead(notification.id)
                          }
                        }}
                      >
                        View →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No notifications</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Add this to Date prototype for relative time
if (typeof Date.prototype.toRelativeString !== 'function') {
  Date.prototype.toRelativeString = function() {
    const delta = Math.round((Date.now() - this.getTime()) / 1000)
    
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
}
