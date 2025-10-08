export type VariantMap = Record<string, Record<string, string>>
export type VariantOptions = {
  variants?: VariantMap
  defaultVariants?: Record<string, string>
}

export type VariantProps<T> = {
  variant?: string
  size?: string
  className?: string
}

export function cva(base = "", options: VariantOptions = {}) {
  return function resolveClassNames(props: VariantProps<unknown> = {}) {
    const { variants = {}, defaultVariants = {} } = options
    const classes: string[] = [base]

    for (const key of Object.keys(variants)) {
      const variantValue = (props as Record<string, string | undefined>)[key] ?? defaultVariants[key]
      if (variantValue && variants[key]?.[variantValue]) {
        classes.push(variants[key][variantValue])
      }
    }

    if (props.className) {
      classes.push(props.className)
    }

    return classes.filter(Boolean).join(" ")
  }
}
