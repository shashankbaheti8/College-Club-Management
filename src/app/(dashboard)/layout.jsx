import { Sidebar } from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({ children }) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  if (!authUser) {
    redirect('/login')
  }

  // Fetch user profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single()

  const user = {
    ...profile,
    email: authUser.email,
    id: authUser.id
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
         <div className="flex h-full max-h-screen flex-col gap-2">
             <Sidebar className="border-r-0" user={user} />
         </div>
      </div>
      <div className="flex flex-col">
        <Header user={user} />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

