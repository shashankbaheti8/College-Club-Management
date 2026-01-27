import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-4 lg:px-6 h-14 flex items-center backdrop-blur-md bg-background/50 sticky top-0 z-50 border-b">
        <Link className="flex items-center justify-center" href="#">
          <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">UniClub</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/login">
            Login
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full bg-background z-[-1]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[80px]" />

          <div className="container px-4 md:px-6 relative z-10 mx-auto text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                  The Operating System for <br className="hidden sm:inline" />
                  <span className="text-primary">College Communities</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Manage members, track events, and boost engagement with a platform designed for the modern campus.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/signup">
                    <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20 transition-transform hover:scale-105">
                    Get Started
                    </Button>
                </Link>
                <Link href="/login">
                    <Button variant="outline" size="lg" className="h-12 px-8 text-base backdrop-blur-sm bg-background/50">
                    Sign In
                    </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
              <div className="grid gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <svg
                    className=" h-6 w-6"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold">Role-Based Access</h3>
                <p className="text-sm text-muted-foreground">
                  Granular permissions for Admins, Members, and Guests. Secure your community data.
                </p>
              </div>
              <div className="grid gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <svg
                    className=" h-6 w-6"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect height="18" rx="2" ry="2" width="18" x="3" y="4" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold">Event Management</h3>
                <p className="text-sm text-muted-foreground">
                  Create events, track attendance, and manage registrations effortlessly.
                </p>
              </div>
              <div className="grid gap-2">
                 <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <svg
                    className=" h-6 w-6"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold">Premium Design</h3>
                <p className="text-sm text-muted-foreground">
                    A beautiful, glassmorphic interface that students will love to use.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          &copy; 2026 UniClub. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
