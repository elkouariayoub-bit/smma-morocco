"use client"

import type { ReactNode } from "react"

import { motion, useReducedMotion } from "framer-motion"

interface FadeInProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  const prefersReducedMotion = useReducedMotion()

  const initial = prefersReducedMotion ? undefined : { opacity: 0, y: 18 }
  const animate = prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
  const transition = prefersReducedMotion
    ? undefined
    : { duration: 0.5, delay, ease: "cubic-bezier(0.22, 1, 0.36, 1)" }

  return (
    <motion.div initial={initial} animate={animate} transition={transition} className={className}>
      {children}
    </motion.div>
  )
}

