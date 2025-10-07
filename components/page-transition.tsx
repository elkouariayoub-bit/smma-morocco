"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

interface PageTransitionProps {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()

  const initial = prefersReducedMotion ? undefined : { opacity: 0, y: 12 }
  const animate = prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
  const exit = prefersReducedMotion ? undefined : { opacity: 0, y: -12 }
  const transition = prefersReducedMotion
    ? undefined
    : {
        duration: 0.45,
        ease: "cubic-bezier(0.22, 1, 0.36, 1)",
      }

  return (
    <AnimatePresence mode="wait">
      <motion.div key={pathname} initial={initial} animate={animate} exit={exit} transition={transition}>
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

