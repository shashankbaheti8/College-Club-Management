
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Megaphone, PlusCircle, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { isPlatformAdmin } from '@/lib/rbac'
import ConfirmButton from '@/components/ui/ConfirmButton'
import { deleteAnnouncement } from '@/app/(dashboard)/actions'

export default async function AnnouncementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const isPlatform = user ? await isPlatformAdmin(user.id) : false

  // Fetch only GLOBAL announcements (club_id is null)
  const { data: announcements } = await supabase
    .from('announcements')
    .select(`
        *,
        profiles:announcements_created_by_fkey (full_name)
    `)
    .is('club_id', null)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
               <h1 className="text-2xl font-bold tracking-tight">Global Announcements</h1>
               <p className="text-muted-foreground">System-wide updates and news.</p>
            </div>
            {isPlatform && (
                <Link href="/announcements/create">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Announcement
                    </Button>
                </Link>
            )}
        </div>

        <div className="grid gap-4">
            {announcements?.map((announcement) => (
                 <Card key={announcement.id}>
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-lg font-semibold">{announcement.title}</CardTitle>
                                <span className="text-xs text-muted-foreground block">
                                    {new Date(announcement.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            {isPlatform && (
                                <ConfirmButton
                                    title="Delete Announcement"
                                    description="Are you sure you want to delete this global announcement? This cannot be undone."
                                    actionLabel="Delete"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onConfirm={async () => {
                                        'use server'
                                        await deleteAnnouncement(announcement.id)
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </ConfirmButton>
                            )}
                        </div>
                        <CardDescription>
                            Posted by {announcement.profiles?.full_name}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {announcement.content}
                        </p>
                    </CardContent>
                 </Card>
            ))}
            
            {(!announcements || announcements.length === 0) && (
                <div className="py-12 text-center border rounded-lg bg-muted/20 border-dashed">
                    <Megaphone className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-sm font-semibold text-foreground">No announcements</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Check back later for system updates.</p>
                </div>
            )}
        </div>
    </div>
  )
}
