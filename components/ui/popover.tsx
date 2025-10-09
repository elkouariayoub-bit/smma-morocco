"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"

type PopoverContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null)

function usePopoverContext(component: string) {
  const ctx = React.useContext(PopoverContext)
  if (!ctx) {
    throw new Error(`${component} must be used within <Popover>`) // ensures proper usage
  }
  return ctx
}

type PopoverProps = {
  children: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function Popover({ children, open, defaultOpen = false, onOpenChange }: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = typeof open === "boolean"
  const currentOpen = isControlled ? (open as boolean) : uncontrolledOpen

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(next)
      }
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange]
  )

  React.useEffect(() => {
    if (isControlled) {
      setUncontrolledOpen(open as boolean)
    }
  }, [isControlled, open])

  return <PopoverContext.Provider value={{ open: currentOpen, setOpen }}>{children}</PopoverContext.Provider>
}

type PopoverTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
  children: React.ReactNode
}

function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (node: T) => {
    refs.forEach((ref) => {
      if (!ref) return
      if (typeof ref === "function") {
        ref(node)
      } else {
        ;(ref as React.MutableRefObject<T | null>).current = node
      }
    })
  }
}

export const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ asChild = false, children, onClick, ...props }, ref) => {
    const { open, setOpen } = usePopoverContext("PopoverTrigger")

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event)
      if (!event.defaultPrevented) {
        setOpen(!open)
      }
    }

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement, {
        ...props,
        ref: mergeRefs(ref, (children as React.ReactElement & { ref?: React.Ref<HTMLButtonElement> }).ref),
        onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
          if (typeof (children as any).props?.onClick === "function") {
            ;(children as any).props.onClick(event)
          }
          if (!event.defaultPrevented) {
            setOpen(!open)
          }
        },
      })
    }

    return (
      <button
        type="button"
        {...props}
        ref={ref}
        onClick={handleClick}
      >
        {children}
      </button>
    )
  }
)
PopoverTrigger.displayName = "PopoverTrigger"

type PopoverContentProps = React.HTMLAttributes<HTMLDivElement> & {
  align?: "start" | "center" | "end"
  children: React.ReactNode
}

export const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, style, align: _align, children, ...props }, forwardedRef) => {
    const { open, setOpen } = usePopoverContext("PopoverContent")
    const localRef = React.useRef<HTMLDivElement | null>(null)
    const ref = mergeRefs(forwardedRef, localRef)

    React.useEffect(() => {
      if (!open) return

      const handleClick = (event: MouseEvent) => {
        if (!localRef.current) return
        if (localRef.current.contains(event.target as Node)) return
        setOpen(false)
      }

      const handleKey = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setOpen(false)
        }
      }

      document.addEventListener("mousedown", handleClick)
      document.addEventListener("keydown", handleKey)
      return () => {
        document.removeEventListener("mousedown", handleClick)
        document.removeEventListener("keydown", handleKey)
      }
    }, [open, setOpen])

    if (!open) return null

    const content = (
      <div
        {...props}
        ref={ref}
        style={style}
        className={cn(
          "z-50 min-w-[200px] rounded-md border bg-popover p-3 text-popover-foreground shadow-md outline-none",
          className
        )}
      >
        {children}
      </div>
    )

    return createPortal(content, document.body)
  }
)
PopoverContent.displayName = "PopoverContent"
