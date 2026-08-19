'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function ForgotPasswordForm() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')
    const message = searchParams.get('message')
    const router = useRouter()

    const [loading, setLoading] = useState(false)
    const toastShownRef = React.useRef(false)

    useEffect(() => {
        // Check if user is already logged in
        const checkAuth = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                router.push('/dashboard')
            }
        }
        checkAuth()
    }, [router])

    useEffect(() => {
        if (error && !toastShownRef.current) {
            toast.error(error)
            toastShownRef.current = true
            router.replace('/forgot-password')
        }
        if (message && !toastShownRef.current) {
            toast.success(message)
            toastShownRef.current = true
            router.replace('/forgot-password')
        }
        if (!error && !message) {
            toastShownRef.current = false
        }
    }, [error, message, router])

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.target)
        const email = formData.get('email')?.toString().trim()

        if (!email) {
            toast.error('Please enter your email address')
            setLoading(false)
            return
        }

        try {
            const supabase = createClient()
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
            })

            if (error) {
                toast.error(error.message)
            } else {
                toast.success('If an account exists with this email, you will receive a reset link shortly.')
            }
        } catch (err) {
            toast.error('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-sm mx-auto shadow-none border-0 bg-transparent">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Forgot your password?
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your email and we&apos;ll send you a reset link
                    </p>
                </div>
                <form onSubmit={handleSubmit} className='grid gap-6'>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            placeholder="name@example.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            className="border-input"
                            required
                            disabled={loading}
                        />
                    </div>
                    <Button className="w-full" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Reset Link
                    </Button>
                </form>

                <p className="px-8 text-center text-sm text-muted-foreground">
                    <Link href="/login" className="hover:text-zinc-700 underline underline-offset-4 inline-flex items-center gap-1">
                        <ArrowLeft className="h-3 w-3" />
                        Back to Sign In
                    </Link>
                </p>
            </div>
        </Card>
    )
}

export default function ForgotPasswordPage() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-background md:grid md:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col p-10 text-primary-foreground lg:flex">
        <div className="absolute inset-0 bg-primary" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          UniClub
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Don&apos;t worry, it happens to the best of us. Let&apos;s get you back in!&rdquo;
            </p>
            <footer className="text-sm">UniClub Support</footer>
          </blockquote>
        </div>
      </div>
      <div className="p-4 lg:p-8 h-full flex items-center justify-center">
        <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin" /></div>}>
            <ForgotPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
