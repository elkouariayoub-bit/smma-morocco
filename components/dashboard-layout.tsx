"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { BarChart3, HelpCircle, Home, LogOut, Menu, Settings, XIcon } from "lucide-react"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col border-r">
        <div className="h-16 flex items-center px-4 border-b">
          <div className="font-semibold">SMMA Dashboard</div>
        </div>
        <ScrollArea className="flex-1">
          <nav className="p-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start gap-2"><Home className="h-4 w-4" /> Home</Button>
            <Button variant="ghost" className="w-full justify-start gap-2"><BarChart3 className="h-4 w-4" /> Analytics</Button>
            <Button variant="ghost" className="w-full justify-start gap-2"><Settings className="h-4 w-4" /> Settings</Button>
            <Button variant="ghost" className="w-full justify-start gap-2"><HelpCircle className="h-4 w-4" /> Help</Button>
          </nav>
        </ScrollArea>
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full justify-center gap-2"><LogOut className="h-4 w-4" /> Sign out</Button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden h-14 flex items-center justify-between px-4 border-b">
        <div className="font-semibold">SMMA Dashboard</div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Open menu"><Menu className="h-5 w-5" /></Button>
          </SheetTrigger>
          <SheetContent>
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold">Menu</div>
              <XIcon className="h-5 w-5" />
            </div>
            <nav className="flex flex-col gap-2">
              <Button variant="ghost" className="justify-start gap-2"><Home className="h-4 w-4" /> Home</Button>
              <Button variant="ghost" className="justify-start gap-2"><BarChart3 className="h-4 w-4" /> Analytics</Button>
              <Button variant="ghost" className="justify-start gap-2"><Settings className="h-4 w-4" /> Settings</Button>
              <Button variant="ghost" className="justify-start gap-2"><HelpCircle className="h-4 w-4" /> Help</Button>
            </nav>
          </SheetContent>
        </Sheet>
      </header>

      {/* Main */}
      <main className="min-h-screen">{children}</main>
    </div>
  )
}
