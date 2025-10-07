"use client"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Facebook, Instagram, TrendingUp, XIcon, Plus, Users, Eye, Heart, MessageCircle, ArrowUp } from "lucide-react"

const platformStats = [
  {
    platform: "Facebook",
    icon: Facebook,
    followers: "45.2K",
    engagement: "3.8%",
    posts: 127,
    color: "text-blue-500",
  },
  {
    platform: "Instagram",
    icon: Instagram,
    followers: "67.9K",
    engagement: "5.1%",
    posts: 203,
    color: "text-pink-500",
  },
  {
    platform: "X",
    icon: XIcon,
    followers: "32.4K",
    engagement: "2.9%",
    posts: 89,
    color: "text-gray-900",
  },
]

const posts = [
  {
    id: 1,
    platform: "Instagram",
    likes: "12.4K",
    comments: "342",
    accent: "from-pink-500/20 via-purple-500/20 to-orange-500/20 border-pink-200/50",
  },
  {
    id: 2,
    platform: "TikTok",
    likes: "45.8K",
    comments: "1.2K",
    accent: "from-slate-900/15 via-slate-800/10 to-slate-900/20 border-slate-200/60",
  },
  {
    id: 3,
    platform: "Facebook",
    likes: "9.1K",
    comments: "210",
    accent: "from-blue-500/20 via-sky-500/20 to-indigo-500/20 border-blue-200/60",
  },
]

export function DashboardContent() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Hero */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-xl sm:text-2xl">Welcome back 👋</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Here’s a snapshot of your social performance</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2"><TrendingUp className="h-4 w-4" /> View Analytics</Button>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-sm font-semibold">Audience Growth</span>
            </div>
            <p className="mt-2 text-3xl font-bold">+2.4K</p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <ArrowUp className="h-3 w-3" /> 5.2% vs last week
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="text-sm font-semibold">Engagement</span>
            </div>
            <p className="mt-2 text-3xl font-bold">+14.7K</p>
            <p className="text-xs text-muted-foreground mt-1">Likes, comments, shares</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Action */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-1">Publish or Schedule a Post</h3>
            <p className="text-sm text-muted-foreground">Create and schedule content across all platforms</p>
          </div>
          <Link href="/composer">
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto" aria-label="Create Post">
              <Plus className="h-4 w-4" />
              Create Post
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Numbers */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Performance Metrics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Total Amount Spent in Ads</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">$4,210</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Total Revenue from Ads</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">$12,430</p></CardContent>
          </Card>
        </div>
      </div>

      {/* Platform Overview */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Platform Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {platformStats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.platform}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">{stat.platform}</span>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{stat.followers}</p>
                    <p className="text-xs text-muted-foreground">Followers</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    <span>{stat.engagement} engagement • {stat.posts} posts</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Recent Posts */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Posts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {posts.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <div
                className={`h-40 w-full bg-gradient-to-br ${p.accent} border-b`}
                aria-hidden="true"
              />
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{p.platform}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Heart className="h-4 w-4" /> {p.likes}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" /> {p.comments}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
