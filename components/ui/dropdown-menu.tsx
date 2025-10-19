"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type DropdownContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLElement | null>
  contentRef: React.RefObject<HTMLDivElement | null>
}

const DropdownMenuContext = React.createContext<DropdownContextValue | null>(null)

function useDropdownContext(component: string): DropdownContextValue {
  const context = React.useContext(DropdownMenuContext)
  if (!context) {
    throw new Error(`${component} must be used within <DropdownMenu>`) 
  }
  return context
}

type DropdownMenuProps = {
  children: React.ReactNode
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLElement | null>(null)
  const contentRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (!open) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        triggerRef.current?.contains(target) ||
        contentRef.current?.contains(target)
      ) {
        return
      }
      setOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  const value = React.useMemo<DropdownContextValue>(
    () => ({ open, setOpen, triggerRef, contentRef }),
    [open],
  )

  return (
    <DropdownMenuContext.Provider value={value}>
      <div className="relative inline-flex">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

type DropdownMenuTriggerProps = {
  children: React.ReactNode
  asChild?: boolean
}

function mergeHandlers<
  Event extends React.SyntheticEvent,
  Handler extends ((event: Event) => void) | undefined,
>(existing: Handler, next: (event: Event) => void) {
  return (event: Event) => {
    existing?.(event)
    if (!event.defaultPrevented) {
      next(event)
    }
  }
}

export function DropdownMenuTrigger({ children, asChild }: DropdownMenuTriggerProps) {
  const { open, setOpen, triggerRef } = useDropdownContext("DropdownMenuTrigger")

  if (asChild) {
    if (!React.isValidElement(children)) {
      throw new Error("DropdownMenuTrigger with `asChild` expects a single React element child")
    }
    const child = children as React.ReactElement
    const mergedRef = (node: HTMLElement | null) => {
      triggerRef.current = node
      const { ref } = child as unknown as { ref?: React.Ref<HTMLElement | null> }
      if (typeof ref === "function") {
        ref(node)
      } else if (ref && typeof ref === "object") {
        ;(ref as React.MutableRefObject<HTMLElement | null>).current = node
      }
    }
    return React.cloneElement(child, {
      ref: mergedRef,
      onClick: mergeHandlers(child.props.onClick, () => setOpen(!open)),
      "aria-haspopup": "menu",
      "aria-expanded": open,
    })
  }

  return (
    <button
      type="button"
      ref={(node) => {
        triggerRef.current = node
      }}
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      className="inline-flex items-center justify-center rounded-md border bg-background px-3 py-2 text-sm"
    >
      {children}
    </button>
  )
}

type DropdownMenuContentProps = {
  align?: "start" | "end" | "center"
  className?: string
  children: React.ReactNode
}

export function DropdownMenuContent({
  align = "start",
  className,
  children,
}: DropdownMenuContentProps) {
  const { open, contentRef } = useDropdownContext("DropdownMenuContent")
  if (!open) {
    return null
  }

  const alignmentClass =
    align === "end"
      ? "right-0"
      : align === "center"
      ? "left-1/2 -translate-x-1/2"
      : "left-0"

  return (
    <div
      ref={contentRef}
      role="menu"
      className={cn(
        "absolute z-50 mt-2 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md focus:outline-none",
        alignmentClass,
        className,
      )}
    >
      {children}
    </div>
  )
}

type DropdownMenuItemProps = {
  children: React.ReactNode
  onSelect?: () => void
  disabled?: boolean
}

export function DropdownMenuItem({ children, onSelect, disabled }: DropdownMenuItemProps) {
  const { setOpen } = useDropdownContext("DropdownMenuItem")

  const handleClick = () => {
    if (disabled) {
      return
    }
    onSelect?.()
    setOpen(false)
  }

  return (
    <button
      type="button"
      role="menuitem"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm transition-colors",
        "hover:bg-muted focus:bg-muted focus:outline-none",
        disabled && "cursor-not-allowed opacity-50 hover:bg-transparent",
      )}
    >
      {children}
    </button>
  )
}
