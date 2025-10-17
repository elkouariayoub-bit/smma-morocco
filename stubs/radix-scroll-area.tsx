"use client"

import * as React from "react"

export const Root = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => (
    <div ref={ref} {...props}>
      {children}
    </div>
  )
)
Root.displayName = "ScrollAreaRoot"

export const Viewport = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => (
    <div ref={ref} {...props}>
      {children}
    </div>
  )
)
Viewport.displayName = "ScrollAreaViewport"

export const Scrollbar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { orientation?: "vertical" | "horizontal" }
>(({ children, orientation = "vertical", ...props }, ref) => (
  <div ref={ref} data-orientation={orientation} {...props}>
    {children}
  </div>
))
Scrollbar.displayName = "ScrollAreaScrollbar"

export const Thumb = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} {...props} />
))
Thumb.displayName = "ScrollAreaThumb"

export const Corner = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} {...props} />
))
Corner.displayName = "ScrollAreaCorner"
