"use client"

import { useEffect, useMemo, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"

import { useDateRange } from "@/app/providers/date-range"
import type { Post } from "@/lib/posts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function formatPlatform(platform: Post["platform"]) {
  if (platform === "x") return "X"
  return platform.charAt(0).toUpperCase() + platform.slice(1)
}

export default function TopPosts() {
  const { range } = useDateRange()
  const [rows, setRows] = useState<Post[]>([])
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle")

  useEffect(() => {
    if (!range.start || !range.end) {
      return
    }

    const controller = new AbortController()

    async function load() {
      setStatus("loading")
      try {
        const params = new URLSearchParams({
          start: range.start,
          end: range.end,
          limit: "50",
        })
        const response = await fetch(`/api/posts/top?${params.toString()}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Failed to load posts: ${response.status}`)
        }

        const body = (await response.json()) as { data?: unknown }
        const nextRows = Array.isArray(body.data) ? (body.data as Post[]) : []

        setRows(nextRows)
        setStatus("idle")
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }
        console.error(error)
        setRows([])
        setStatus("error")
      }
    }

    load()

    return () => {
      controller.abort()
    }
  }, [range.end, range.start])

  const topFive = useMemo(() => rows.slice(0, 5), [rows])

  const showEmptyState = status === "idle" && topFive.length === 0

  return (
    <Card className="bg-card/60 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Top Posts</CardTitle>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <Button variant="outline" size="sm" disabled={rows.length === 0}>
              View all
            </Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
            <Dialog.Content className="fixed inset-y-0 right-0 z-50 w-full max-w-3xl overflow-y-auto bg-background p-4 shadow-lg focus:outline-none">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold">All Posts</h3>
                <Dialog.Close asChild>
                  <Button variant="ghost">Close</Button>
                </Dialog.Close>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr>
                      <th className="p-2">Post</th>
                      <th className="p-2">Platform</th>
                      <th className="p-2">Date</th>
                      <th className="p-2 text-right">Engagement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((post) => (
                      <tr key={post.id} className="border-t">
                        <td className="p-2">
                          <div className="flex items-center gap-3">
                            <img
                              alt={post.caption}
                              className="h-10 w-16 rounded object-cover"
                              height={40}
                              src={post.thumbnail}
                              width={64}
                            />
                            <span className="line-clamp-1">{post.caption}</span>
                          </div>
                        </td>
                        <td className="p-2">{formatPlatform(post.platform)}</td>
                        <td className="p-2 whitespace-nowrap">{post.date}</td>
                        <td className="p-2 text-right font-medium">{post.engagement.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </CardHeader>
      <CardContent className="space-y-3">
        {status === "loading" && rows.length === 0 ? (
          <div className="text-sm text-muted-foreground">Loading top posts…</div>
        ) : showEmptyState ? (
          <div className="text-sm text-muted-foreground">No posts in range.</div>
        ) : (
          topFive.map((post) => (
            <div key={post.id} className="flex items-center gap-3">
              <img
                alt={post.caption}
                className="h-10 w-16 rounded object-cover"
                height={40}
                src={post.thumbnail}
                width={64}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm">{post.caption}</div>
                <div className="text-xs text-muted-foreground">
                  {formatPlatform(post.platform)} • {post.date}
                </div>
              </div>
              <div className="text-sm font-medium">{post.engagement.toLocaleString()}</div>
            </div>
          ))
        )}
        {status === "error" && (
          <div className="text-sm text-destructive">Failed to load posts. Please try again later.</div>
        )}
      </CardContent>
    </Card>
  )
}
