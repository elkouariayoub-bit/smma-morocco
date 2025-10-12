'use client'

import * as React from 'react'

type DialogContextValue = {
  open: boolean
  setOpen: (value: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

export const Root: React.FC<{ children?: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }> = ({
  children,
  open: openProp,
  onOpenChange,
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const isControlled = typeof openProp === 'boolean'
  const open = isControlled ? Boolean(openProp) : uncontrolledOpen

  const setOpen = React.useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(value)
      }
      onOpenChange?.(value)
    },
    [isControlled, onOpenChange],
  )

  const value = React.useMemo<DialogContextValue>(() => ({ open, setOpen }), [open, setOpen])

  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>
}

function useDialogContext(component: string): DialogContextValue {
  const context = React.useContext(DialogContext)
  if (!context) {
    throw new Error(`${component} must be used within <Sheet>`)
  }
  return context
}

export const Trigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }>(
  ({ asChild, onClick, ...props }, ref) => {
    const { setOpen } = useDialogContext('SheetTrigger')

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event)
      if (!event.defaultPrevented) {
        setOpen(true)
      }
    }

    if (asChild && React.isValidElement(props.children)) {
      return React.cloneElement(props.children as React.ReactElement, {
        ref,
        onClick: handleClick,
      })
    }

    return <button type="button" ref={ref} onClick={handleClick} {...props} />
  },
)
Trigger.displayName = 'SheetTrigger'

export const Close = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }>(
  ({ asChild, onClick, ...props }, ref) => {
    const { setOpen } = useDialogContext('SheetClose')

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event)
      if (!event.defaultPrevented) {
        setOpen(false)
      }
    }

    if (asChild && React.isValidElement(props.children)) {
      return React.cloneElement(props.children as React.ReactElement, {
        ref,
        onClick: handleClick,
      })
    }

    return <button type="button" ref={ref} onClick={handleClick} {...props} />
  },
)
Close.displayName = 'SheetClose'

export const Portal: React.FC<{ children?: React.ReactNode }> = ({ children }) => <>{children}</>

export const Overlay: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props) => <div {...props} />

export const Content = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => {
  const { open, setOpen } = useDialogContext('SheetContent')
  if (!open) return null

  return (
    <div ref={ref} {...props}>
      {props.children}
      <button
        type="button"
        aria-label="Close"
        style={{ display: 'none' }}
        onClick={() => setOpen(false)}
      />
    </div>
  )
})
Content.displayName = 'SheetContent'
