'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function ResetPasswordForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        // Verify user arrived via a valid reset link (they should have a session)
        const checkSession = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                toast.error('Invalid or expired reset link. Please request a new one.')
                router.push('/forgot-password')
            }
        }
        checkSession()
    }, [router])

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.target)
        const password = formData.get('password')?.toString()
        const confirmPassword = formData.get('confirm_password')?.toString()

        if (!password || password.length < 6) {
            toast.error('Password must be at least 6 characters long')
            setLoading(false)
            return
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match')
            setLoading(false)
            return
        }

        try {
            const supabase = createClient()
            const { error } = await supabase.auth.updateUser({ password })

            if (error) {
                toast.error(error.message)
            } else {
                setSuccess(true)
                toast.success('Password updated successfully!')
                // Sign out the user so they can log in with their new password
                await supabase.auth.signOut()
                setTimeout(() => {
                    router.push('/login?message=' + encodeURIComponent('Password reset successful. Please sign in with your new password.'))
                }, 2000)
            }
        } catch (err) {
            toast.error('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <Card className="w-full max-w-sm mx-auto shadow-none border-0 bg-transparent">
                <div className="mx-auto flex w-full flex-col justify-center items-center space-y-4 sm:w-[350px]">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                    <h1 className="text-2xl font-semibold tracking-tight text-center">
                        Password Updated!
                    </h1>
                    <p className="text-sm text-muted-foreground text-center">
                        Redirecting you to sign in...
                    </p>
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-sm mx-auto shadow-none border-0 bg-transparent">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Set a new password
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your new password below
                    </p>
                </div>
                <form onSubmit={handleSubmit} className='grid gap-6'>
                    <div className="grid gap-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter new password"
                            className="border-input"
                            required
                            minLength={6}
                            disabled={loading}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="confirm_password">Confirm Password</Label>
                        <Input
                            id="confirm_password"
                            name="confirm_password"
                            type="password"
                            placeholder="Confirm new password"
                            className="border-input"
                            required
                            minLength={6}
                            disabled={loading}
                        />
                    </div>
                    <Button className="w-full" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Password
                    </Button>
                </form>
            </div>
        </Card>
    )
}

export default function ResetPasswordPage() {
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
              &ldquo;A fresh start with a new password — you&apos;re almost there!&rdquo;
            </p>
            <footer className="text-sm">UniClub Support</footer>
          </blockquote>
        </div>
      </div>
      <div className="p-4 lg:p-8 h-full flex items-center justify-center">
        <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin" /></div>}>
            <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
