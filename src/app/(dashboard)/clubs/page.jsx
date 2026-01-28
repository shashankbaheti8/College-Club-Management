import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { GraduationCap, Users } from 'lucide-react'

export default async function ClubsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { isPlatformAdmin } = await import('@/lib/rbac')
    const isPlatform = user ? await isPlatformAdmin(user.id) : false
    
    // Fetch all clubs
    const { data: clubs, error } = await supabase
        .from('clubs')
        .select(`
            *,
            club_members (
                role,
                profiles:club_members_profiles_fkey (full_name)
            )
        `)
    
    if (error) {
        console.error("Clubs Fetch Error:", error)
    }
    
    // Get user's club memberships to show which clubs they've joined
    let userClubIds = []
    if (user) {
        const { data: memberships } = await supabase
            .from('club_members')
            .select('club_id')
            .eq('user_id', user.id)
        
        userClubIds = memberships?.map(m => m.club_id) || []
    }
    
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                   <h1 className="text-2xl font-bold tracking-tight">Clubs Directory</h1>
                   <p className="text-muted-foreground">Discover and join communities on campus.</p>
                </div>
                {isPlatform && (
                    <Link href="/clubs/create">
                        <Button>
                            Create Club
                        </Button>
                    </Link>
                )}
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-md border border-destructive/20 mb-6">
                    <h3 className="font-bold">Error Loading Clubs:</h3>
                    <p>{error.message}</p>
                    <p className="text-xs mt-2 text-muted-foreground">Detailed Code: {error.code}</p>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {clubs?.map((club) => {
                    const isMember = userClubIds.includes(club.id)
                    const admins = club.club_members?.filter(m => m.role === 'admin')
                                    const adminNames = admins?.map(a => a.profiles?.full_name).join(', ') || 'Club Admins'
                    
                    return (
                        <Card key={club.id} className="flex flex-col hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                                        {club.category || 'General'}
                                    </span>
                                    {isMember && (
                                        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10">
                                            Member
                                        </span>
                                    )}
                                </div>
                                <CardTitle className="text-xl line-clamp-1">{club.name}</CardTitle>
                                <CardDescription>By {adminNames}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col gap-4 pt-0">
                                <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                                    {club.description}
                                </p>
                                <div className="flex gap-2 pt-2">
                                    <Link href={`/clubs/${club.id}`} className="flex-1">
                                        <Button className="w-full" variant="outline" size="sm">
                                            View Details
                                        </Button>
                                    </Link>
                                    {/* Join button removed as per requirements */}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
                 {(!clubs || clubs.length === 0) && (
                    <div className="col-span-full py-12 text-center">
                        <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-2 text-sm font-semibold text-foreground">No clubs found</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Get started by creating a new club.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
