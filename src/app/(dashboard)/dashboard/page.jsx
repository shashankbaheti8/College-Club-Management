import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { isPlatformAdmin } from "@/lib/rbac"
import { PlatformAdminDashboard } from "@/components/dashboards/PlatformAdminDashboard"
import { ClubAdminDashboard } from "@/components/dashboards/ClubAdminDashboard"
import { MemberDashboard } from "@/components/dashboards/MemberDashboard"
import { ViewerDashboard } from "@/components/dashboards/ViewerDashboard"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // 1. Check Platform Admin (Highest Priority)
  const isPlatform = await isPlatformAdmin(user.id)

  if (isPlatform) {
    // Fetch global stats for platform admin
    const [clubsResult, membersResult, eventsResult, upcomingResult, announcementsResult] = await Promise.all([
      supabase.from('clubs').select('*', { count: 'exact', head: true }),
      supabase.from('club_members').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }).in('status', ['upcoming', 'ongoing']),
      supabase.from('events')
        .select(`*, clubs (name)`)
        .eq('status', 'upcoming')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(5),
      supabase.from('announcements')
        .select('*, profiles:announcements_created_by_fkey(full_name)')
        .is('club_id', null)
        .order('created_at', { ascending: false })
        .limit(5)
    ])

    const stats = {
      totalClubs: clubsResult.count || 0,
      totalMembers: membersResult.count || 0,
      activeEventCount: eventsResult.count || 0,
      upcomingEvents: upcomingResult.data || [],
      globalAnnouncements: announcementsResult.data || []
    }

    return <PlatformAdminDashboard stats={stats} />
  }

  // 2. Fetch User's Memberships
  const { data: memberships } = await supabase
    .from('club_members')
    .select(`
      *,
      clubs (
        id,
        name,
        description,
        category
      )
    `)
    .eq('user_id', user.id)

  const myMemberships = memberships || []

  // 3. Check Viewer (No memberships)
  if (myMemberships.length === 0) {
    return <ViewerDashboard user={user} />
  }

  // 4. Check Club Admin (If admin of ANY club)
  const isClubAdmin = myMemberships.some(m => m.role === 'admin')

  const clubIds = myMemberships.map(m => m.clubs.id)
  
  // Common stats for Member/ClubAdmin
  const [membersResult, eventsResult, upcomingResult] = await Promise.all([
    // Total members (meaningful for admins, maybe unnecessary for plain members but good for context)
    supabase.from('club_members').select('*', { count: 'exact', head: true }).in('club_id', clubIds),
    
    // Active events
    supabase.from('events').select('*', { count: 'exact', head: true }).in('club_id', clubIds).in('status', ['upcoming', 'ongoing']),
    
    // Upcoming events
    supabase.from('events')
      .select(`*, clubs (name)`)
      .in('club_id', clubIds)
      .eq('status', 'upcoming')
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true })
      .limit(5)
  ])

  const stats = {
    totalMembers: membersResult.count || 0,
    activeEventCount: eventsResult.count || 0,
    upcomingEvents: upcomingResult.data || []
  }

  if (isClubAdmin) {
    return <ClubAdminDashboard memberships={myMemberships} stats={stats} />
  }

  // 5. Default to Member Dashboard
  return <MemberDashboard memberships={myMemberships} stats={stats} />
}


