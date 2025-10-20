"use client"

import * as React from "react"

type ItemRecord = {
  value: string
  label: React.ReactNode
  disabled?: boolean
}

type SelectContextValue = {
  value: string
  setValue: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  registerItem: (item: ItemRecord) => void
  unregisterItem: (value: string) => void
  items: ItemRecord[]
  placeholder?: string
  setPlaceholder: (value?: string) => void
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

function useSelectContext(component: string): SelectContextValue {
  const context = React.useContext<SelectContextValue | null>(SelectContext)
  if (!context) {
    throw new Error(`${component} must be used within <SelectPrimitive.Root />`)
  }
  return context
}

interface RootProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

export const Root = ({
  value,
  defaultValue = "",
  onValueChange,
  open,
  defaultOpen = false,
  onOpenChange,
  children,
}: RootProps) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const [items, setItems] = React.useState<ItemRecord[]>([])
  const [placeholder, setPlaceholder] = React.useState<string | undefined>(undefined)

  const isValueControlled = value !== undefined
  const isOpenControlled = open !== undefined

  const currentValue = isValueControlled ? (value as string) : internalValue
  const currentOpen = isOpenControlled ? !!open : internalOpen

  const setValue = React.useCallback(
    (next: string) => {
      if (!isValueControlled) {
        setInternalValue(next)
      }
      onValueChange?.(next)
    },
    [isValueControlled, onValueChange]
  )

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isOpenControlled) {
        setInternalOpen(next)
      }
      onOpenChange?.(next)
    },
    [isOpenControlled, onOpenChange]
  )

  const registerItem = React.useCallback((item: ItemRecord) => {
    setItems((prev) => {
      const existing = prev.find((it) => it.value === item.value)
      if (!existing) {
        return [...prev, item]
      }
      return prev.map((it) => (it.value === item.value ? item : it))
    })
  }, [])

  const unregisterItem = React.useCallback((itemValue: string) => {
    setItems((prev) => prev.filter((item) => item.value !== itemValue))
  }, [])

  return (
    <SelectContext.Provider
      value={{
        value: currentValue,
        setValue,
        open: currentOpen,
        setOpen,
        registerItem,
        unregisterItem,
        items,
        placeholder,
        setPlaceholder,
      }}
    >
      <div className="relative inline-flex w-full flex-col">{children}</div>
    </SelectContext.Provider>
  )
}

export const Group = ({ children, ...props }: { children?: React.ReactNode }) => (
  <div {...props}>{children}</div>
)

export const Value = ({ placeholder }: { placeholder?: string }) => {
  const { value, items, placeholder: storedPlaceholder, setPlaceholder } = useSelectContext(
    "SelectPrimitive.Value"
  )
  React.useEffect(() => {
    setPlaceholder(placeholder)
    return () => setPlaceholder(undefined)
  }, [placeholder, setPlaceholder])
  const selected = items.find((item) => item.value === value)
  return <span>{selected ? selected.label : storedPlaceholder ?? placeholder}</span>
}

const ItemContext = React.createContext<{ selected: boolean }>({ selected: false })

export const Trigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ children, ...props }, ref) => {
    const { open, setOpen } = useSelectContext("SelectPrimitive.Trigger")
    return (
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        data-state={open ? "open" : "closed"}
        onClick={() => setOpen(!open)}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Trigger.displayName = "SelectTrigger"

export const Icon = ({ asChild, children }: { asChild?: boolean; children?: React.ReactNode }) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { "aria-hidden": true })
  }
  return <span aria-hidden>{children}</span>
}

export const Portal = ({ children }: { children?: React.ReactNode }) => <>{children}</>

export const Content = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { position?: string }>(
  ({ children, style, ...props }, ref) => {
    const { open } = useSelectContext("SelectPrimitive.Content")
    if (!open) {
      return null
    }
    return (
      <div
        ref={ref}
        style={{ position: "absolute", top: "100%", left: 0, marginTop: 4, zIndex: 10, ...style }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Content.displayName = "SelectContent"

export const Viewport = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => (
    <div ref={ref} role="presentation" {...props}>
      {children}
    </div>
  )
)
Viewport.displayName = "SelectViewport"

export const Label = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => (
    <div ref={ref} {...props}>
      {children}
    </div>
  )
)
Label.displayName = "SelectLabel"

export const Separator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} role="separator" {...props} />
))
Separator.displayName = "SelectSeparator"

export const Item = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string; disabled?: boolean }
>(({ value, disabled, children, onClick, ...props }, ref) => {
  const { value: selectedValue, setValue, setOpen, registerItem, unregisterItem } = useSelectContext(
    "SelectPrimitive.Item"
  )

  React.useEffect(() => {
    registerItem({ value, label: children, disabled })
    return () => unregisterItem(value)
  }, [value, children, disabled, registerItem, unregisterItem])

  const selected = selectedValue === value

  return (
    <ItemContext.Provider value={{ selected }}>
      <div
        ref={ref}
        role="option"
        aria-selected={selected}
        data-state={selected ? "checked" : "unchecked"}
        data-disabled={disabled ? "" : undefined}
        tabIndex={disabled ? -1 : 0}
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
        {children}
      </div>
    </ItemContext.Provider>
  )
})
Item.displayName = "SelectItem"

export const ItemText = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ children, ...props }, ref) => (
    <span ref={ref} {...props}>
      {children}
    </span>
  )
)
ItemText.displayName = "SelectItemText"

export const ItemIndicator = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ children, ...props }, ref) => {
    const { selected } = React.useContext(ItemContext)
    if (!selected) {
      return null
    }
    return (
      <span ref={ref} {...props}>
        {children}
      </span>
    )
  }
)
ItemIndicator.displayName = "SelectItemIndicator"

export const ScrollUpButton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} {...props} />
))
ScrollUpButton.displayName = "SelectScrollUpButton"

export const ScrollDownButton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} {...props} />
))
ScrollDownButton.displayName = "SelectScrollDownButton"
