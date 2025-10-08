import Link from 'next/link'
import { ArrowRight, BarChart3, ShieldCheck, Users, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FadeIn } from '@/components/fade-in'

const features = [
  {
    icon: Sparkles,
    title: 'AI-powered content',
    description: 'Generate scroll-stopping posts in seconds with captions that match your brand voice.',
  },
  {
    icon: BarChart3,
    title: 'Unified analytics',
    description: 'Track performance across every channel and understand what resonates with your audience.',
  },
  {
    icon: Users,
    title: 'Client collaboration',
    description: 'Share live previews, gather approvals, and keep stakeholders aligned in one workspace.',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise-grade security',
    description: 'Single sign-on, audit trails, and encrypted storage keep your campaigns protected.',
  },
]

export default function Page() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_55%)]" />
      <header className="relative z-10 border-b border-white/10">
        <div className="container mx-auto flex items-center justify-between px-6 py-6">
          <div className="text-lg font-semibold tracking-tight">SMMA Morocco</div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" className="border-white/20 bg-transparent text-slate-50 hover:bg-white/10">
                Sign in
              </Button>
            </Link>
            <Link href="/login">
              <Button className="gap-2 bg-blue-600 hover:bg-blue-500">
                Sign up
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="container mx-auto flex flex-col items-center gap-12 px-6 pb-24 pt-20 text-center md:pb-32 md:pt-28">
          <FadeIn>
            <span className="rounded-full border border-white/10 px-4 py-1 text-sm font-medium uppercase tracking-wider text-white/80">
              Social media mastery for Moroccan brands
            </span>
          </FadeIn>
          <FadeIn delay={0.06}>
            <div className="max-w-3xl space-y-6">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
                Grow every client faster with the social OS built for agencies
              </h1>
              <p className="text-lg text-slate-200">
                Plan campaigns, generate AI-powered content, and deliver crystal-clear reports—all from a single dashboard.
                SMMA Morocco gives your team the tools to launch stronger stories and win new retainers.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.12}>
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <Link href="/login" className="w-full sm:w-auto">
                <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-500">
                  Get started for free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full border-white/20 bg-transparent text-slate-50 hover:bg-white/10"
                >
                  Sign in to your workspace
                </Button>
              </Link>
            </div>
          </FadeIn>
          <FadeIn delay={0.18}>
            <div className="grid w-full max-w-4xl grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur md:grid-cols-3">
              <div className="space-y-1 text-left">
                <p className="text-3xl font-semibold">+62%</p>
                <p className="text-sm text-slate-200">Average uplift in engagement after 3 months</p>
              </div>
              <div className="space-y-1 text-left">
                <p className="text-3xl font-semibold">12hrs</p>
                <p className="text-sm text-slate-200">Saved per week on content production</p>
              </div>
              <div className="space-y-1 text-left md:border-l md:border-white/10 md:pl-6">
                <p className="text-3xl font-semibold">24/7</p>
                <p className="text-sm text-slate-200">Local support with bilingual strategists</p>
              </div>
            </div>
          </FadeIn>
        </section>

        <section className="relative border-y border-white/10 bg-slate-900/70 py-20">
          <div className="container mx-auto px-6">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight">A platform your clients will love</h2>
              <p className="mt-4 text-lg text-slate-200">
                From ideation to publishing and analytics, SMMA Morocco keeps every part of your agency workflow in sync.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <FadeIn key={feature.title} delay={0.08 * index}>
                  <Card className="border-white/10 bg-slate-900/60 text-left">
                    <CardHeader className="flex flex-row items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                        <feature.icon className="h-5 w-5 text-blue-400" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-slate-50">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-200">{feature.description}</p>
                    </CardContent>
                  </Card>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto grid gap-10 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold tracking-tight">Launch campaigns with clarity</h2>
            <p className="text-lg text-slate-200">
              Collaborate on editorial calendars, review content in context, and publish to every channel with a single
              click. Our AI copilots draft copy, hashtags, and visuals while your team fine-tunes the strategy.
            </p>
            <ul className="space-y-4 text-left text-slate-200">
              {[
                'Centralize briefs, approvals, and feedback loops',
                'Automate reporting with live dashboards',
                'White-label the experience for every client',
              ].map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/15 text-sm font-semibold text-blue-400">
                    •
                  </span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <Link href="/login">
                <Button className="gap-2 bg-blue-600 hover:bg-blue-500">
                  Create your account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="border-white/20 bg-transparent text-slate-50 hover:bg-white/10">
                  Book a demo
                </Button>
              </Link>
            </div>
          </div>
          <FadeIn delay={0.2}>
            <Card className="border-white/10 bg-white/5 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-50">Why agencies trust SMMA Morocco</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-left text-slate-100">
                <p>
                  “Our content pipeline went from chaos to clarity. Every client knows what’s scheduled, and we’re closing
                  new retainers with a sharper story.”
                </p>
                <div>
                  <p className="font-semibold">Salma Haddad</p>
                  <p className="text-sm text-slate-300">Founder, Atlas Creative</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
                  <p className="text-sm text-slate-200">
                    180+ agencies streamline their social presence with SMMA Morocco. Ready to join them?
                  </p>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-slate-950/80 py-10">
        <div className="container mx-auto flex flex-col gap-4 px-6 text-center text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SMMA Morocco. All rights reserved.</p>
          <div className="flex justify-center gap-6">
            <Link href="/login" className="hover:text-slate-200">Sign in</Link>
            <Link href="/login" className="hover:text-slate-200">Create account</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
