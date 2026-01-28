
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isPlatformAdmin } from '@/lib/rbac'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function CreateAnnouncementPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const isPlatform = await isPlatformAdmin(user.id)
  
  if (!isPlatform) {
    redirect('/dashboard') // Only platform admins can create global announcements
  }

  async function createAnnouncement(formData) {
    'use server'
    
    const title = formData.get('title')
    const content = formData.get('content')
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser() // Re-fetch user in action context
    
    if (!title || !content) return

    await supabase.from('announcements').insert({
        title,
        content,
        created_by: user.id,
        club_id: null // Explicitly null for global
    })

    redirect('/announcements')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/announcements">
            <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
            </Button>
        </Link>
        <div>
            <h1 className="text-2xl font-bold">New Global Announcement</h1>
            <p className="text-muted-foreground">Broadcast a message to all users on the platform.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Announcement Details</CardTitle>
            <CardDescription>This will be visible to everyone.</CardDescription>
        </CardHeader>
        <CardContent>
            <form action={createAnnouncement} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" placeholder="e.g. System Maintenance Update" required />
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea 
                        id="content" 
                        name="content" 
                        placeholder="Write your announcement here..." 
                        className="min-h-[150px]"
                        required 
                    />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Link href="/announcements">
                        <Button variant="outline" type="button">Cancel</Button>
                    </Link>
                    <Button type="submit">Post Announcement</Button>
                </div>
            </form>
        </CardContent>
      </Card>
    </div>
  )
}
