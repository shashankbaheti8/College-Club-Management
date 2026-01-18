import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Zap, Crown } from "lucide-react"
import { getUserSubscription, getUsageStats } from '@/lib/subscriptionServer'
import { PLAN_LIMITS } from '@/lib/subscription'
import Link from "next/link"

export default async function SubscriptionSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const subscription = await getUserSubscription(user.id)
  const usage = await getUsageStats(user.id)

  const plans = [
    {
      name: 'Free',
      tier: 'free',
      price: '$0',
      icon: Check,
      features: [
        `${PLAN_LIMITS.free.clubs} club`,
        `${PLAN_LIMITS.free.activeEventsPerClub} active event per club`,
        `Up to ${PLAN_LIMITS.free.membersPerClub} members per club`,
        'Basic analytics',
        'Community support'
      ]
    },
    {
      name: 'Pro',
      tier: 'pro',
      price: '$9',
      icon: Zap,
      popular: true,
      features: [
        `Up to ${PLAN_LIMITS.pro.clubs} clubs`,
        'Unlimited active events',
        `Up to ${PLAN_LIMITS.pro.membersPerClub} members per club`,
        'Advanced analytics',
        'Priority support',
        'Custom branding'
      ]
    },
    {
      name: 'Enterprise',
      tier: 'enterprise',
      price: '$29',
      icon: Crown,
      features: [
        'Unlimited clubs',
        'Unlimited events',
        'Unlimited members',
        'Advanced analytics',
        'CSV exports',
        'Custom domain',
        'Dedicated support',
        'API access'
      ]
    }
  ]

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and usage</p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>You are currently on the {subscription.plan_tier} plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold capitalize">{subscription.plan_tier} Plan</h3>
              <p className="text-sm text-muted-foreground">
                {subscription.plan_tier === 'free' && 'Perfect for getting started'}
                {subscription.plan_tier === 'pro' && 'Great for growing communities'}
                {subscription.plan_tier === 'enterprise' && 'Built for large organizations'}
              </p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {plans.find(p => p.tier === subscription.plan_tier)?.price}/month
            </Badge>
          </div>

          {/* Usage Stats */}
          <div className="grid gap-4 md:grid-cols-3 pt-4 border-t">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Clubs</span>
                <span className="text-sm text-muted-foreground">
                  {usage.clubs.current} / {usage.clubs.limit}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min(100, usage.clubs.percentage)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Active Events</span>
                <span className="text-sm text-muted-foreground">
                  {usage.activeEvents.current} / {usage.activeEvents.limit === 999 ? '∞' : usage.activeEvents.limit}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min(100, usage.activeEvents.percentage)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Total Members</span>
                <span className="text-sm text-muted-foreground">
                  {usage.members.current} / {usage.members.limit >= 999999 ? '∞' : usage.members.limit}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min(100, usage.members.percentage)}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Available Plans</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const Icon = plan.icon
            const isCurrentPlan = plan.tier === subscription.plan_tier
            
            return (
              <Card 
                key={plan.tier} 
                className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''} ${isCurrentPlan ? 'bg-muted/50' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">Most Popular</Badge>
                  </div>
                )}
                
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4">
                    <Badge variant="outline" className="bg-background">Current Plan</Badge>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle>{plan.name}</CardTitle>
                  </div>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <form action={async () => {
                    'use server'
                    const supabase = await createClient()
                    const { data: { user } } = await supabase.auth.getUser()
                    
                    if (!user) return

                    await supabase
                      .from('subscriptions')
                      .update({ plan_tier: plan.tier, updated_at: new Date().toISOString() })
                      .eq('user_id', user.id)

                    redirect('/settings/subscription?upgraded=true')
                  }}>
                    <Button 
                      className="w-full" 
                      variant={isCurrentPlan ? 'outline' : plan.popular ? 'default' : 'secondary'}
                      disabled={isCurrentPlan}
                    >
                      {isCurrentPlan ? 'Current Plan' : 
                       subscription.plan_tier === 'free' ? 'Upgrade' : 
                       plan.tier === 'free' ? 'Downgrade' : 
                       'Change Plan'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Have questions about which plan is right for you? We're here to help!
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Contact Support</Button>
            <Button variant="outline" size="sm">View Documentation</Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        * This is a demo implementation. No actual payments are processed.
        Plan changes take effect immediately for demonstration purposes.
      </p>
    </div>
  )
}
