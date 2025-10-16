'use client'

import * as React from 'react'
import { Check, Crown, Sparkles, Zap } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type BillingCadence = 'monthly' | 'annual' | 'lifetime'

type Plan = {
  id: BillingCadence
  name: string
  price: string
  cadenceCopy: string
  savings?: string
  description: string
  cta: string
}

type Feature = {
  label: string
  availableOn?: BillingCadence[]
  isNew?: boolean
}

const plans: Plan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$49/mo',
    cadenceCopy: 'Billed monthly',
    description: 'Great for growing teams that want flexibility and predictable billing.',
    cta: 'Stay on monthly',
  },
  {
    id: 'annual',
    name: 'Annual',
    price: '$41/mo',
    cadenceCopy: 'Billed annually',
    savings: 'Save 15%',
    description: 'Unlock 12 months of access with priority support and additional seats.',
    cta: 'Switch to annual',
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '$1,499',
    cadenceCopy: 'One-time payment',
    savings: 'Best value',
    description: 'Secure perpetual access for your entire organization with lifetime updates.',
    cta: 'Upgrade to lifetime',
  },
]

const features: Feature[] = [
  { label: 'Dedicated Account Manager', availableOn: ['annual', 'lifetime'], isNew: true },
  { label: 'Community Access & Forum Participation' },
  { label: 'Advanced analytics dashboard', availableOn: ['monthly', 'annual', 'lifetime'] },
  { label: 'Automations & scheduled workflows', availableOn: ['annual', 'lifetime'] },
  { label: 'Unlimited workspace members', availableOn: ['lifetime'] },
]

const addOns = [
  {
    title: 'Priority onboarding',
    description: 'Kick-off workshop with our product specialists to get your team migrated in under a week.',
    price: '$899 one-time',
  },
  {
    title: 'Extra AI credits',
    description: 'Boost content generation with an extra 100k AI tokens added to your workspace each month.',
    price: '$29/mo',
  },
]

const faq = [
  {
    question: 'Can I change plans later?',
    answer:
      'Yes. Downgrading takes effect at your next renewal date. Upgrades apply immediately with a prorated charge.',
  },
  {
    question: 'Do you offer invoices?',
    answer:
      'All paid plans include downloadable invoices and billing contacts. We can also support purchase orders on annual agreements.',
  },
]

export default function PlansSettingsPage() {
  const [activePlan, setActivePlan] = React.useState<BillingCadence>('monthly')
  const [isProcessing, setIsProcessing] = React.useState(false)

  const selectedPlan = plans.find((plan) => plan.id === activePlan) ?? plans[0]

  async function handlePlanChange(nextPlan: BillingCadence) {
    if (nextPlan === activePlan) {
      toast.success('You are already on this plan')
      return
    }

    setIsProcessing(true)
    setActivePlan(nextPlan)
    try {
      // 🔗 Replace with your API call later
      // await fetch('/api/billing/plan', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ plan: nextPlan }),
      // })
      await new Promise((resolve) => setTimeout(resolve, 600))
      toast.success('Plan updated', {
        description: `${plans.find((plan) => plan.id === nextPlan)?.name ?? 'Plan'} is now active.`,
      })
    } catch (error: any) {
      toast.error(error?.message ?? 'Unable to change plans right now')
      setActivePlan(activePlan)
    } finally {
      setIsProcessing(false)
    }
  }

  function renderFeature(feature: Feature) {
    const enabled = feature.availableOn ? feature.availableOn.includes(selectedPlan.id) : true
    return (
      <div
        key={feature.label}
        className={cn(
          'flex items-center justify-between rounded-lg border bg-card/40 px-4 py-3 text-sm transition-colors',
          enabled ? 'border-transparent bg-muted/30 text-foreground' : 'opacity-60',
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full border',
              enabled
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-muted-foreground/20 text-muted-foreground',
            )}
          >
            <Check className="h-4 w-4" />
          </div>
          <span>{feature.label}</span>
        </div>
        <div className="flex items-center gap-2">
          {feature.isNew && <Badge variant="secondary" className="uppercase">New</Badge>}
          {feature.availableOn && feature.availableOn.length < plans.length && (
            <Badge variant="outline" className="text-xs">
              {feature.availableOn.map((id) => plans.find((plan) => plan.id === id)?.name).join(' · ')}
            </Badge>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Plans</h1>
        <p className="text-sm text-muted-foreground">
          Update account preferences and manage integrations.
        </p>
      </div>

      <Card className="overflow-hidden border-primary/10 bg-card/80 backdrop-blur">
        <CardHeader className="gap-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Crown className="h-4 w-4 text-primary" />
            Your subscriptions will begin today with a free 14-day trial.
          </div>
          <CardTitle className="text-xl">Choose the plan that fits your team</CardTitle>
          <CardDescription>
            Seamlessly upgrade or downgrade at any time. Billing is prorated instantly for team-wide changes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-3">
            {plans.map((plan) => {
              const isActive = plan.id === selectedPlan.id
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => handlePlanChange(plan.id)}
                  disabled={isProcessing}
                  className={cn(
                    'group relative flex min-w-[150px] flex-1 cursor-pointer flex-col rounded-lg border px-4 py-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed md:min-w-[180px]',
                    isActive
                      ? 'border-primary bg-primary/10 shadow-sm'
                      : 'border-border hover:border-primary/40 hover:bg-muted/40',
                  )}
                >
                  <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {plan.name}
                    {plan.savings && (
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {plan.savings}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-semibold">{plan.price}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{plan.cadenceCopy}</p>
                  <p className="mt-3 text-xs text-muted-foreground/80">{plan.description}</p>
                  {isActive && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-2 text-[11px] font-semibold text-primary">
                      Current plan
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          <Separator className="bg-border/60" />

          <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-inner">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Sparkles className="h-4 w-4" />
                  Overview
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{selectedPlan.description}</p>
                <ul className="mt-4 grid gap-3 text-sm">
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Flexible billing</div>
                      <p className="text-muted-foreground">
                        Billing adjusts automatically as teammates join or leave your organization.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Usage insights</div>
                      <p className="text-muted-foreground">
                        Export detailed usage analytics and seat reports for finance and leadership stakeholders.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">Features</h3>
                  <Badge variant="outline" className="text-[11px] uppercase">
                    Included
                  </Badge>
                </div>
                <div className="grid gap-3 md:grid-cols-2">{features.map((feature) => renderFeature(feature))}</div>
              </div>
            </div>

            <div className="space-y-4">
              <Card className="border-primary/10 bg-card/70">
                <CardHeader>
                  <CardTitle className="text-base">Plan details</CardTitle>
                  <CardDescription>
                    You are currently on the {selectedPlan.name.toLowerCase()} plan.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-medium">{selectedPlan.price}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Billing cadence</span>
                    <span className="font-medium">{selectedPlan.cadenceCopy}</span>
                  </div>
                  {selectedPlan.savings && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Savings</span>
                      <Badge variant="secondary" className="font-semibold">
                        {selectedPlan.savings}
                      </Badge>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Button className="w-full" disabled={isProcessing} onClick={() => handlePlanChange(selectedPlan.id)}>
                    {isProcessing ? 'Updating…' : selectedPlan.cta}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-primary"
                    onClick={() =>
                      toast.success('Chat with sales', {
                        description: 'We will connect you with an account specialist.',
                      })
                    }
                  >
                    Talk to sales
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-dashed">
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="text-base">Add-ons</CardTitle>
                    <CardDescription>Enhance your workspace with tailored services.</CardDescription>
                  </div>
                  <Zap className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  {addOns.map((addon) => (
                    <div key={addon.title} className="space-y-1 rounded-lg border border-dashed border-border/60 p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{addon.title}</span>
                        <Badge variant="outline" className="text-[11px] uppercase">
                          {addon.price}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{addon.description}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() =>
                          toast.success(`${addon.title} requested`, {
                            description: 'Our team will reach out within 1 business day.',
                          })
                        }
                      >
                        Request
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-primary/10 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-base">Have questions?</CardTitle>
                  <CardDescription>
                    Our support team is online 24/7 to help you pick the right subscription for your team.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  {faq.map((item) => (
                    <div key={item.question} className="space-y-1 rounded-lg border border-primary/10 bg-background/60 p-4">
                      <div className="font-medium">{item.question}</div>
                      <p className="text-muted-foreground">{item.answer}</p>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      toast.success('Schedule a call', {
                        description: 'Pick a time that works for you.',
                      })
                    }
                  >
                    Schedule a call
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

