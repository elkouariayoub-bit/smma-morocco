"use client"

import React from "react"

type MotionNumeric = number | string

type MotionStyle = {
  opacity?: MotionNumeric
  x?: MotionNumeric
  y?: MotionNumeric
  scale?: MotionNumeric
} & React.CSSProperties

type Transition = {
  duration?: number
  delay?: number
  ease?: string
}

interface MotionProps extends React.HTMLAttributes<HTMLDivElement> {
  initial?: MotionStyle
  animate?: MotionStyle
  exit?: MotionStyle
  transition?: Transition
}

function toTransform(values: MotionStyle | undefined) {
  if (!values) return { style: undefined, rest: undefined }
  const { x, y, scale, ...rest } = values
  const transforms: string[] = []
  if (typeof x !== "undefined") transforms.push(`translateX(${typeof x === "number" ? `${x}px` : x})`)
  if (typeof y !== "undefined") transforms.push(`translateY(${typeof y === "number" ? `${y}px` : y})`)
  if (typeof scale !== "undefined") transforms.push(`scale(${scale})`)
  const style: React.CSSProperties = { ...rest }
  if (transforms.length) {
    style.transform = transforms.join(" ")
  }
  return { style, rest: rest as React.CSSProperties }
}

function mergeStyles(base: React.CSSProperties | undefined, animated?: MotionStyle, transition?: Transition) {
  const target = { ...(base ?? {}) }
  if (animated) {
    const { style } = toTransform(animated)
    Object.assign(target, style)
  }
  if (transition) {
    const duration = typeof transition.duration === "number" ? transition.duration : 0.45
    const delay = transition.delay ?? 0
    const ease = transition.ease ?? "cubic-bezier(0.22, 1, 0.36, 1)"
    target.transition = target.transition
      ? `${target.transition}, transform ${duration}s ${ease} ${delay}s, opacity ${duration}s ${ease} ${delay}s`
      : `transform ${duration}s ${ease} ${delay}s, opacity ${duration}s ${ease} ${delay}s`
  }
  return target
}

function createMotionComponent() {
  const MotionComponent = React.forwardRef<HTMLDivElement, MotionProps>((props, ref) => {
    const { initial, animate, exit, transition, style, children, ...rest } = props
    const [mounted, setMounted] = React.useState(false)
    const [leaving, setLeaving] = React.useState(false)

    React.useEffect(() => {
      setMounted(true)
      return () => {
        setLeaving(true)
      }
    }, [])

    const animatedStyle = React.useMemo(() => {
      if (!mounted && initial) {
        return mergeStyles(style, initial, transition)
      }
      if (leaving && exit) {
        return mergeStyles(style, exit, transition)
      }
      return mergeStyles(style, animate, transition)
    }, [style, initial, animate, exit, transition, mounted, leaving])

    return (
      <div ref={ref} style={animatedStyle} {...rest}>
        {children}
      </div>
    )
  })
  MotionComponent.displayName = "MotionDiv"
  return MotionComponent
}

export const motion = {
  div: createMotionComponent(),
}

interface AnimatePresenceProps {
  children: React.ReactNode
  mode?: 'wait' | 'sync' | 'popLayout'
}

export function AnimatePresence({ children }: AnimatePresenceProps) {
  return <>{children}</>
}

export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)
  React.useEffect(() => {
    if (typeof window === "undefined") return
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(query.matches)
    const listener = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches)
    query.addEventListener("change", listener)
    return () => query.removeEventListener("change", listener)
  }, [])
  return prefersReducedMotion
}

