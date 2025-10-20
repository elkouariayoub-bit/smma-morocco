"use client"

import { useEffect, useMemo, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"

import { useDateRange } from "@/app/providers/date-range"
import type { Post } from "@/lib/posts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const LEVEL_CLASSES = [
  "bg-muted/40",
  "bg-emerald-500/20",
  "bg-emerald-500/40",
  "bg-emerald-500/60",
  "bg-emerald-500/80",
]

type ActivityDay = { date: string; count: number }

type ActivityResponse = { data?: unknown }

type PostsResponse = { data?: unknown }

function formatPlatform(platform: Post["platform"]) {
  if (platform === "x") return "X"
  return platform.charAt(0).toUpperCase() + platform.slice(1)
}

function enumerateDays(startISO: string, endISO: string) {
  const start = new Date(`${startISO}T00:00:00`)
  const end = new Date(`${endISO}T00:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return []
  }

  const days: string[] = []
  for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    days.push(new Date(cursor).toISOString().slice(0, 10))
  }
  return days
}

function levelClass(count: number) {
  if (count <= 0) return LEVEL_CLASSES[0]
  if (count === 1) return LEVEL_CLASSES[1]
  if (count <= 3) return LEVEL_CLASSES[2]
  if (count <= 5) return LEVEL_CLASSES[3]
  return LEVEL_CLASSES[4]
}

export default function PostingHeatmap() {
  const { range } = useDateRange()
  const [activity, setActivity] = useState<ActivityDay[]>([])
  const [activityStatus, setActivityStatus] = useState<"idle" | "loading" | "error">("idle")
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [postsStatus, setPostsStatus] = useState<"idle" | "loading" | "error">("idle")

  useEffect(() => {
    if (!range.start || !range.end) {
      setActivity([])
      setActivityStatus("idle")
      return
    }

    const controller = new AbortController()

    async function loadActivity() {
      setActivityStatus("loading")
      try {
        const params = new URLSearchParams({
          start: range.start,
          end: range.end,
        })
        const response = await fetch(`/api/posts/activity?${params.toString()}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Failed to load activity: ${response.status}`)
        }

        const body = (await response.json()) as ActivityResponse
        const next = Array.isArray(body.data) ? (body.data as ActivityDay[]) : []
        setActivity(next)
        setActivityStatus("idle")
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }
        console.error(error)
        setActivity([])
        setActivityStatus("error")
      }
    }

    loadActivity()

    return () => {
      controller.abort()
    }
  }, [range.end, range.start])

  const daysInRange = useMemo(() => {
    if (!range.start || !range.end) {
      return []
    }
    return enumerateDays(range.start, range.end)
  }, [range.end, range.start])

  const counts = useMemo<ActivityDay[]>(() => {
    if (daysInRange.length === 0) {
      return []
    }
    const lookup = new Map(activity.map((entry) => [entry.date, entry.count]))
    return daysInRange.map((date) => ({ date, count: lookup.get(date) ?? 0 }))
  }, [activity, daysInRange])

  const closeDialog = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      setSelectedDate(null)
      setPosts([])
      setPostsStatus("idle")
    }
  }

  const openDay = async (date: string) => {
    setSelectedDate(date)
    setPosts([])
    setPostsStatus("loading")
    setOpen(true)

    try {
      const params = new URLSearchParams({ date })
      const response = await fetch(`/api/posts/by-day?${params.toString()}`)
      if (!response.ok) {
        throw new Error(`Failed to load posts for ${date}`)
      }
      const body = (await response.json()) as PostsResponse
      const nextPosts = Array.isArray(body.data) ? (body.data as Post[]) : []
      setPosts(nextPosts)
      setPostsStatus("idle")
    } catch (error) {
      console.error(error)
      setPosts([])
      setPostsStatus("error")
    }
  }

  return (
    <Card className="bg-card/60 backdrop-blur">
      <CardHeader>
        <CardTitle>Posting Calendar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!range.start || !range.end ? (
          <p className="text-sm text-muted-foreground">Select a date range to view posting activity.</p>
        ) : activityStatus === "loading" && counts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Loading activity…</p>
        ) : activityStatus === "error" ? (
          <p className="text-sm text-destructive">Failed to load posting activity. Please try again later.</p>
        ) : counts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity recorded for the selected range.</p>
        ) : (
          <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Posting activity heatmap">
            {counts.map((entry) => (
              <button
                key={entry.date}
                type="button"
                onClick={() => openDay(entry.date)}
                className={`h-8 rounded transition hover:ring-2 hover:ring-emerald-500 ${levelClass(entry.count)}`}
                title={`${entry.date}: ${entry.count} post${entry.count === 1 ? "" : "s"}`}
              >
                <span className="sr-only">
                  {entry.date}: {entry.count} post{entry.count === 1 ? "" : "s"}
                </span>
              </button>
            ))}
          </div>
        )}

        <Dialog.Root open={open} onOpenChange={closeDialog}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
            <Dialog.Content className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto bg-background p-4 shadow-lg focus:outline-none">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold">
                  {selectedDate ? `Posts on ${selectedDate}` : "Posts"}
                </h3>
                <Dialog.Close asChild>
                  <Button variant="ghost">Close</Button>
                </Dialog.Close>
              </div>
              {postsStatus === "loading" ? (
                <p className="text-sm text-muted-foreground">Loading posts…</p>
              ) : postsStatus === "error" ? (
                <p className="text-sm text-destructive">Failed to load posts for this day.</p>
              ) : posts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No posts for this day.</p>
              ) : (
                <ul className="space-y-3">
                  {posts.map((post) => (
                    <li key={post.id} className="flex items-center gap-3 rounded border p-2">
                      <img
                        alt={post.caption}
                        className="h-12 w-16 rounded object-cover"
                        height={48}
                        src={post.thumbnail}
                        width={64}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="line-clamp-1 text-sm">{post.caption}</div>
                        <div className="text-xs text-muted-foreground">{formatPlatform(post.platform)}</div>
                      </div>
                      <div className="text-sm font-medium">{post.engagement.toLocaleString()}</div>
                    </li>
                  ))}
                </ul>
              )}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </CardContent>
    </Card>
  )
}
