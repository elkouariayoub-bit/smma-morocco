'use client'

import * as React from 'react'

export const Slot = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement> & { asChild?: boolean }>(
  ({ children, className, ...props }, ref) => {
    if (!React.isValidElement(children)) {
      return React.createElement('span', { ref, className, ...props }, children)
    }

    return React.cloneElement(children, {
      ...props,
      ref,
      className: [children.props.className, className].filter(Boolean).join(' '),
    })
  },
)
Slot.displayName = 'Slot'

export default Slot
