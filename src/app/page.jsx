import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Users, Shield, Zap, Layout, Check, Trophy, Rocket, ArrowRight } from "lucide-react"

export default async function LandingPage() {
  // Fetch some featured clubs for display
  const supabase = await createClient()
  const { data: featuredClubs } = await supabase
    .from('clubs')
    .select('*')
    .limit(3)
    .order('created_at', { ascending: false })

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/10">
      {/* Navigation */}
      <header className="px-6 lg:px-10 h-16 flex items-center backdrop-blur-xl bg-background/70 sticky top-0 z-50 border-b border-white/5">
        <Link className="flex items-center justify-center gap-2" href="#">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">U</div>
          <span className="font-bold text-xl tracking-tight">UniClub</span>
        </Link>
        <nav className="ml-auto hidden md:flex gap-8">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#hierarchy">
            Hierarchy
          </Link>
        </nav>
        <div className="ml-auto md:ml-8 flex gap-4">
             <Link href="/login">
                <Button variant="ghost" size="sm">Log in</Button>
            </Link>
             <Link href="/signup">
                <Button size="sm">Get Started</Button>
            </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 md:pt-32 md:pb-48 overflow-hidden">
             {/* Background Patterns */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
            
            <div className="container px-4 md:px-6 mx-auto">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    <div className="flex-1 text-center lg:text-left space-y-6">
                        <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl xl:text-7xl">
                            Manage your club <br/>
                            <span className="text-primary">like a pro.</span>
                        </h1>
                        <p className="text-muted-foreground text-lg md:text-xl max-w-[600px] mx-auto lg:mx-0">
                            The all-in-one operating system for university communities. Events, members, and permissions—handled.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-4">
                            <Link href="/signup">
                                <Button size="lg" className="h-12 px-8 rounded-full text-base">Start for free</Button>
                            </Link>
                             <Link href="#features">
                                <Button variant="outline" size="lg" className="h-12 px-8 rounded-full text-base">
                                    How it works
                                </Button>
                            </Link>
                        </div>
                    </div>
                    
                    {/* Abstract Visual */}
                    <div className="flex-1 w-full max-w-[600px] lg:max-w-none relative perspective-[2000px]">
                         <div className="relative bg-card border shadow-2xl rounded-2xl p-6 rotate-y-[-10deg] rotate-x-[5deg] hover:rotate-0 transition-all duration-500 ease-out z-20">
                            <div className="flex items-center justify-between border-b pb-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-primary/20 rounded-lg flex items-center justify-center">
                                        <Trophy className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">Coding Club</div>
                                        <div className="text-xs text-muted-foreground">admin@uniclub.com</div>
                                    </div>
                                </div>
                                <div className="h-2 w-2 rounded-full bg-green-500"/>
                            </div>
                            <div className="space-y-3">
                                <div className="h-24 w-full bg-muted/50 rounded-lg animate-pulse" />
                                <div className="grid grid-cols-3 gap-3">
                                     <div className="h-20 bg-muted/50 rounded-lg" />
                                     <div className="h-20 bg-muted/50 rounded-lg" />
                                     <div className="h-20 bg-muted/50 rounded-lg" />
                                </div>
                            </div>
                         </div>
                         {/* Back Card */}
                          <div className="absolute top-0 left-0 w-full h-full bg-primary/5 rounded-2xl transform translate-x-4 translate-y-4 -z-10 rotate-y-[-10deg] rotate-x-[5deg]" />
                    </div>
                </div>
            </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="py-24 bg-muted/30">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Everything you need</h2>
                    <p className="text-muted-foreground text-lg">Powerful features wrapped in a simple, intuitive interface.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Big Card - RBAC */}
                    <div className="md:col-span-2 group relative overflow-hidden rounded-3xl border bg-background p-8 lg:p-12 hover:shadow-lg transition-all duration-300">
                         <div className="relative z-10 flex flex-col items-start h-full">
                            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
                                <Shield className="h-6 w-6" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Role-Based Security</h3>
                            <p className="text-muted-foreground max-w-md">Detailed permission sets for Platform Admins, Club Leads, Members, and Students. Data privacy first.</p>
                         </div>
                         <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Tall Card - Events */}
                    <div className="md:col-span-1 group relative overflow-hidden rounded-3xl border bg-background p-8 hover:shadow-lg transition-all duration-300">
                         <div className="relative z-10">
                            <div className="h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 text-blue-500">
                                <CalendarDays className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Events</h3>
                             <p className="text-muted-foreground text-sm">Create, manage, and verify event attendance effortlessly.</p>
                         </div>
                          <div className="mt-8 flex justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                             <CalendarDays className="h-32 w-32 text-muted" strokeWidth={0.5} />
                         </div>
                    </div>

                    {/* Wide Card - Design */}
                     <div className="md:col-span-3 group relative overflow-hidden rounded-3xl border bg-background p-8 lg:p-12 flex flex-col md:flex-row items-center gap-10 hover:shadow-lg transition-all duration-300">
                        <div className="flex-1 space-y-4 text-center md:text-left">
                             <div className="h-12 w-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 text-purple-500 mx-auto md:mx-0">
                                <Layout className="h-6 w-6" />
                            </div>
                            <h3 className="text-2xl font-bold">Premium Design</h3>
                            <p className="text-muted-foreground">Glassmorphic interfaces, dark mode support, and smooth animations that make managing your club a joy.</p>
                        </div>
                        <div className="flex-1 w-full relative h-[200px] md:h-[250px] bg-gradient-to-br from-muted/50 to-muted rounded-2xl border overflow-hidden p-6 group-hover:scale-[1.02] transition-transform">
                             <div className="w-full h-full bg-background rounded-lg shadow-sm border p-4">
                                <div className="space-y-2">
                                    <div className="h-2 w-1/2 bg-muted rounded" />
                                    <div className="h-2 w-full bg-muted rounded" />
                                    <div className="h-2 w-3/4 bg-muted rounded" />
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Hierarchy Section */}
        <section id="hierarchy" className="py-24">
             <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16">
                     <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">The Ecosystem</h2>
                     <p className="text-muted-foreground text-lg">Four roles, one seamless platform.</p>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { title: "Platform Admin", icon: Trophy, color: "text-orange-500", bg: "bg-orange-500/10", desc: "Oversees the entire campus instance." },
                        { title: "Club Admin", icon: Shield, color: "text-blue-500", bg: "bg-blue-500/10", desc: "Manages individual club operations." },
                        { title: "Member", icon: Users, color: "text-green-500", bg: "bg-green-500/10", desc: "Participates in exclusive club activities." },
                        { title: "Student", icon: Rocket, color: "text-gray-500", bg: "bg-gray-500/10", desc: "Explores public events and directories." }
                    ].map((role, i) => (
                        <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors">
                             <div className={`h-14 w-14 rounded-full ${role.bg} flex items-center justify-center mb-4`}>
                                <role.icon className={`h-7 w-7 ${role.color}`} />
                            </div>
                            <h3 className="font-bold text-lg mb-2">{role.title}</h3>
                            <p className="text-sm text-muted-foreground">{role.desc}</p>
                        </div>
                    ))}
                 </div>
             </div>
        </section>

        {/* Featured Clubs */}
         {featuredClubs && featuredClubs.length > 0 && (
             <section className="py-24 bg-background border-t">
                <div className="container px-4 md:px-6 mx-auto">
                     <div className="flex items-center justify-between mb-12">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-bold tracking-tight">Featured Communities</h2>
                            <p className="text-muted-foreground">Join the conversation.</p>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href="/login">View All</Link>
                        </Button>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                         {featuredClubs.map((club) => (
                             <Link key={club.id} href={`/clubs/${club.id}`} className="group block h-full">
                                <div className="h-full rounded-3xl border bg-card p-6 transition-all hover:shadow-xl hover:border-primary/20 flex flex-col">
                                    <div className="flex items-start justify-between mb-4">
                                         <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                                            {club.name.charAt(0)}
                                         </div>
                                         <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
                                            {club.category}
                                         </span>
                                    </div>
                                    <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">{club.name}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                                        {club.description}
                                    </p>
                                    <div className="flex items-center text-xs font-medium text-muted-foreground mt-auto">
                                        View community <ArrowRight className="ml-1 h-3 w-3" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        )}

         {/* Final CTA */}
         <section className="py-24 relative overflow-hidden">
             <div className="absolute inset-0 bg-primary/5 -z-10" />
             <div className="container px-4 text-center">
                 <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Ready to launch?</h2>
                 <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                     Join thousands of students building the future of their communities on UniClub.
                 </p>
                 <Link href="/signup">
                    <Button size="lg" className="h-14 px-10 rounded-full text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                        Get Started Now
                    </Button>
                 </Link>
             </div>
         </section>
      </main>
      
      <footer className="py-12 border-t bg-background">
          <div className="container px-4 mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                   <div className="h-6 w-6 bg-primary rounded flex items-center justify-center text-primary-foreground text-xs font-bold">U</div>
                   <span className="font-bold">UniClub</span>
              </div>
              <p className="text-muted-foreground text-sm">© 2026 UniClub Inc. All rights reserved.</p>
              <div className="flex gap-6">
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</Link>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</Link>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Twitter</Link>
              </div>
          </div>
      </footer>
    </div>
  )
}
