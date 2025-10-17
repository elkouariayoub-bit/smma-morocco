'use client';

import { useMemo, type ReactNode } from 'react';
import { Check } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type Feature = string;

type Plan = {
  id: 'free' | 'standard' | 'business';
  name: string;
  price: string;
  sublabel?: string;
  highlight?: string;
  bulletsTop?: string[];
  features: Feature[];
};

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free Plan',
    price: '$0 / month',
    sublabel: 'For trying the product or solo creators',
    bulletsTop: ['1 owner seat (no team)', '2 social accounts'],
    features: [
      'Seats: 1 owner (no team)',
      'Posts / month: 20',
      'Schedules / queue: up to 10 scheduled posts',
      'Channels: 2 social accounts',
      'Basic editor: draft, publish, delete',
      'Basic analytics: last 7 days',
      'Roles available: owner only',
      'Support: community / email, 48–72h',
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '$29 / month + seats',
    sublabel: 'Includes 3 seats, then $5/extra seat',
    highlight: 'Best for growing teams',
    bulletsTop: ['3 seats included', 'Unlimited scheduling', '10 social accounts'],
    features: [
      'Seats: 3 included (owner + admin + editor)',
      'Posts / month: 300',
      'Schedules / queue: unlimited',
      'Channels: 10 social accounts',
      'Editor+: bulk upload, calendar view, drafts, approvals',
      'Analytics: 90-day insights, best time to post',
      'Integrations: Canva / Drive / Notion import',
      'Roles available: owner, admin, editor',
      'Permissions: team invite/remove, settings, publish',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    price: '$99 / month + seats',
    sublabel: 'Includes 5 seats, then $8/extra seat',
    highlight: 'Best value for agencies & brands',
    bulletsTop: [
      'Unlimited workspaces & scheduling',
      'Advanced analytics & approvals',
      'Priority support',
    ],
    features: [
      'Seats: 5 included (owner + multiple admins/editors)',
      'Workspaces: unlimited',
      'Posts / month: unlimited* (fair use)',
      'Schedules / queue: unlimited + automation rules',
      'Channels: unlimited social accounts',
      'Media storage: 200 GB (+$10 / 100 GB add-on)',
      'Advanced features: audience breakdown, UTM templates, link tracking, CSV export',
      'Analytics: 12-month, campaign & team performance',
      'Approvals: multi-step, role-based workflows',
      'Branding: fully removable + custom domain for public pages',
      'Security: SSO (Google), audit log (90 days)',
      'Support: priority (<4h), onboarding call',
      'SLA: 99.9% (best-effort)',
    ],
  },
];

function FeatureItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="text-sm">{children}</span>
    </li>
  );
}

export default function PlansPage() {
  const currentPlanId: Plan['id'] = 'free';

  const plans = useMemo(
    () => PLANS.map((plan) => ({ ...plan, isCurrent: plan.id === currentPlanId })),
    [currentPlanId]
  );

  const onSelect = (id: Plan['id']) => {
    console.log('select plan →', id);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Plans</h1>
        <p className="text-sm text-muted-foreground">
          Choose the plan that fits your team. You can upgrade or downgrade anytime.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{plan.name}</CardTitle>
                {plan.isCurrent ? (
                  <Badge variant="secondary">Current plan</Badge>
                ) : plan.highlight ? (
                  <Badge variant="outline">{plan.highlight}</Badge>
                ) : null}
              </div>
              <div className="text-2xl font-semibold">{plan.price}</div>
              {plan.sublabel && (
                <p className="text-xs text-muted-foreground">{plan.sublabel}</p>
              )}
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-5">
              {plan.bulletsTop && plan.bulletsTop.length > 0 && (
                <div className="rounded-md border p-3 text-sm">
                  <ul className="space-y-1.5">
                    {plan.bulletsTop.map((bullet, index) => (
                      <FeatureItem key={index}>{bullet}</FeatureItem>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-2">
                <div className="text-sm font-medium">Features</div>
                <Separator />
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <FeatureItem key={index}>{feature}</FeatureItem>
                  ))}
                </ul>
              </div>

              <div className="mt-auto pt-2">
                {plan.isCurrent ? (
                  <Button variant="outline" className="w-full" disabled>
                    You’re on this plan
                  </Button>
                ) : (
                  <Button className="w-full" onClick={() => onSelect(plan.id)}>
                    Select plan
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        * “Unlimited” usage is subject to fair use policies to ensure stability for all customers.
      </p>
    </div>
  );
}
