"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

interface SelectContextValue {
  value?: string
  setValue: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  items: Map<string, React.ReactNode>
  registerItem: (value: string, label: React.ReactNode) => void
  unregisterItem: (value: string) => void
  placeholder?: string
  setPlaceholder: (value?: string) => void
  disabled: boolean
  triggerRef: React.MutableRefObject<HTMLButtonElement | null>
  setTriggerRect: (rect: DOMRect | null) => void
  triggerRect: DOMRect | null
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

function useSelectContext(component: string): SelectContextValue {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error(`${component} must be used within <Select />`)
  }
  return context
}

interface SelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  disabled?: boolean
}

function Select({ value, defaultValue, onValueChange, children, disabled = false }: SelectProps) {
  const [internalValue, setInternalValue] = React.useState<string | undefined>(defaultValue)
  const [open, setOpen] = React.useState(false)
  const itemsRef = React.useRef(new Map<string, React.ReactNode>())
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)
  const [triggerRect, setTriggerRect] = React.useState<DOMRect | null>(null)
  const [placeholder, setPlaceholder] = React.useState<string | undefined>(undefined)

  const selectedValue = value ?? internalValue

  const setValue = React.useCallback(
    (next: string) => {
      if (value === undefined) {
        setInternalValue(next)
      }
      onValueChange?.(next)
    },
    [value, onValueChange]
  )

  const registerItem = React.useCallback((itemValue: string, label: React.ReactNode) => {
    itemsRef.current.set(itemValue, label)
  }, [])

  const unregisterItem = React.useCallback((itemValue: string) => {
    itemsRef.current.delete(itemValue)
  }, [])

  const contextValue = React.useMemo<SelectContextValue>(
    () => ({
      value: selectedValue,
      setValue,
      open,
      setOpen,
      items: itemsRef.current,
      registerItem,
      unregisterItem,
      placeholder,
      setPlaceholder,
      disabled,
      triggerRef,
      setTriggerRect,
      triggerRect,
    }),
    [disabled, open, placeholder, registerItem, selectedValue, setValue, triggerRect, unregisterItem]
  )

  return (
    <SelectContext.Provider value={contextValue}>
      <div className="relative inline-flex w-full flex-col">{children}</div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, disabled, ...props }, ref) => {
  const context = useSelectContext("SelectTrigger")
  const { open, setOpen, triggerRef, setTriggerRect } = context
  const mergedDisabled = disabled ?? context.disabled

  const setRefs = React.useCallback(
    (node: HTMLButtonElement | null) => {
      triggerRef.current = node
      if (typeof ref === "function") {
        ref(node)
      } else if (ref) {
        ;(ref as React.MutableRefObject<HTMLButtonElement | null>).current = node
      }
      setTriggerRect(node ? node.getBoundingClientRect() : null)
    },
    [ref, setTriggerRect, triggerRef]
  )

  React.useLayoutEffect(() => {
    const node = triggerRef.current
    if (!node) return
    function handleResize() {
      const current = triggerRef.current
      if (!current) return
      setTriggerRect(current.getBoundingClientRect())
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [setTriggerRect, triggerRef])

  return (
    <button
      type="button"
      ref={setRefs}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      data-state={open ? "open" : "closed"}
      aria-haspopup="listbox"
      aria-expanded={open}
      onClick={() => !mergedDisabled && setOpen(!open)}
      disabled={mergedDisabled}
      {...props}
    >
      {children}
      <ChevronDown className="ml-2 h-4 w-4 opacity-50" aria-hidden />
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder, className }: { placeholder?: string; className?: string }) => {
  const { value, items, setPlaceholder } = useSelectContext("SelectValue")
  React.useEffect(() => {
    setPlaceholder(placeholder)
    return () => setPlaceholder(undefined)
  }, [placeholder, setPlaceholder])
  const label = value ? items.get(value) : undefined
  return <span className={cn("truncate", className)}>{label ?? placeholder}</span>
}

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { position?: "item-aligned" | "popper" }
>(({ className, children, position = "popper", style, ...props }, ref) => {
  const { open, setOpen, triggerRef, triggerRect } = useSelectContext("SelectContent")
  const contentRef = React.useRef<HTMLDivElement | null>(null)

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      contentRef.current = node
      if (typeof ref === "function") {
        ref(node)
      } else if (ref) {
        ;(ref as React.MutableRefObject<HTMLDivElement | null>).current = node
      }
    },
    [ref]
  )

  React.useEffect(() => {
    if (!open) return
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node
      if (contentRef.current?.contains(target)) return
      if (triggerRef.current?.contains(target)) return
      setOpen(false)
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }
    window.addEventListener("pointerdown", handlePointerDown)
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, setOpen, triggerRef])

  if (!open) {
    return null
  }

  const width = triggerRect?.width ?? undefined

  return (
    <div
      ref={setRefs}
      role="listbox"
      className={cn(
        "relative z-50 mt-1 max-h-64 min-w-[8rem] overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md focus:outline-none",
        position === "popper" && "absolute w-full",
        className
      )}
      style={{
        width: position === "popper" ? width : undefined,
        ...style,
        top: position === "popper" ? "100%" : undefined,
        left: position === "popper" ? 0 : undefined,
      }}
      {...props}
    >
      {children}
    </div>
  )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string; disabled?: boolean }
>(({ className, children, value, disabled, onClick, ...props }, ref) => {
  const { value: selectedValue, setValue, registerItem, unregisterItem, setOpen } =
    useSelectContext("SelectItem")

  React.useEffect(() => {
    registerItem(value, children)
    return () => unregisterItem(value)
  }, [children, registerItem, unregisterItem, value])

  const isSelected = selectedValue === value

  return (
    <div
      ref={ref}
      role="option"
      tabIndex={disabled ? -1 : 0}
      aria-selected={isSelected}
      data-state={isSelected ? "checked" : "unchecked"}
      data-disabled={disabled ? "" : undefined}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      onClick={(event) => {
        if (disabled) return
        setValue(value)
        setOpen(false)
        onClick?.(event)
      }}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && !disabled) {
          event.preventDefault()
          setValue(value)
          setOpen(false)
        }
      }}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected ? <Check className="h-4 w-4" /> : null}
      </span>
      <span>{children}</span>
    </div>
  )
})
SelectItem.displayName = "SelectItem"

const SelectLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-2 py-1.5 text-sm font-semibold", className)} {...props} />
  )
)
SelectLabel.displayName = "SelectLabel"

const SelectSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} role="separator" className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
  )
)
SelectSeparator.displayName = "SelectSeparator"

const SelectGroup = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={className} {...props} />
)
SelectGroup.displayName = "SelectGroup"

const SelectScrollUpButton = () => null
const SelectScrollDownButton = () => null

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
