"use client"

import { useCallback, useMemo, useRef, useState } from "react"

export type SubmitHandler<T extends Record<string, any>> = (values: T, event?: unknown) => void | Promise<void>

export type RegisterOptions<T extends Record<string, any> = Record<string, any>> = {
  required?: string | boolean
  minLength?: { value: number; message: string }
  pattern?: { value: RegExp; message: string }
}

export type FieldError = {
  type: string
  message?: string
}

export type FieldErrors<TFieldValues extends Record<string, any>> = Partial<
  Record<keyof TFieldValues | "root", FieldError | undefined>
>

export type UseFormProps<TFieldValues extends Record<string, any>> = {
  defaultValues?: Partial<TFieldValues>
  mode?: "onSubmit" | "onChange" | "onBlur"
}

type InternalRegisterOptions = RegisterOptions<Record<string, any>>

type RegisteredField = {
  options: InternalRegisterOptions
}

export type UseFormReturn<TFieldValues extends Record<string, any>> = {
  register: (
    name: keyof TFieldValues & string,
    options?: RegisterOptions<TFieldValues>
  ) => {
    name: string
    value: TFieldValues[keyof TFieldValues] | string
    onChange: (event: { target: { value: any } } | any) => void
    onBlur: () => void
  }
  handleSubmit: (
    onValid: SubmitHandler<TFieldValues>
  ) => (event?: { preventDefault?: () => void }) => Promise<void>
  watch: <K extends keyof TFieldValues>(name?: K) => any
  setError: (name: keyof TFieldValues | "root", error: FieldError) => void
  clearErrors: (name?: keyof TFieldValues | "root") => void
  reset: (values?: Partial<TFieldValues>) => void
  formState: {
    errors: FieldErrors<TFieldValues>
    isValid: boolean
    isSubmitting: boolean
    isSubmitted: boolean
  }
}

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === "string") return value.trim().length === 0
  return false
}

export function useForm<TFieldValues extends Record<string, any>>(
  props: UseFormProps<TFieldValues> = {}
): UseFormReturn<TFieldValues> {
  const mode = props.mode ?? "onSubmit"
  const validatorsRef = useRef<Record<string, RegisteredField>>({})
  const [values, setValues] = useState<TFieldValues>((props.defaultValues || {}) as TFieldValues)
  const [errors, setErrors] = useState<FieldErrors<TFieldValues>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const validateField = useCallback(
    (name: string, value: unknown): FieldError | undefined => {
      const rules = validatorsRef.current[name]?.options
      if (!rules) return undefined

      if (rules.required) {
        if (isEmpty(value)) {
          const message = typeof rules.required === "string" ? rules.required : "This field is required"
          return { type: "required", message }
        }
      }

      if (rules.minLength && typeof value === "string") {
        if (value.length < rules.minLength.value) {
          return { type: "minLength", message: rules.minLength.message }
        }
      }

      if (rules.pattern && typeof value === "string") {
        if (!rules.pattern.value.test(value)) {
          return { type: "pattern", message: rules.pattern.message }
        }
      }

      return undefined
    },
    []
  )

  const runValidation = useCallback(
    (nextValues: TFieldValues): FieldErrors<TFieldValues> => {
      const nextErrors: FieldErrors<TFieldValues> = {}

      for (const name of Object.keys(validatorsRef.current)) {
        const error = validateField(name, (nextValues as Record<string, unknown>)[name])
        if (error) {
          nextErrors[name as keyof TFieldValues] = error
        }
      }

      if (errors.root) {
        nextErrors.root = errors.root
      }

      return nextErrors
    },
    [errors.root, validateField]
  )

  const updateValue = useCallback(
    (name: string, value: unknown) => {
      setValues((prev) => {
        const next = { ...prev, [name]: value }

        setErrors((prevErrors) => {
          const nextErrors = { ...prevErrors }
          const fieldError =
            mode === "onChange" || mode === "onBlur" ? validateField(name, value) : prevErrors[name as keyof TFieldValues]

          if (fieldError) {
            nextErrors[name as keyof TFieldValues] = fieldError
          } else {
            delete nextErrors[name as keyof TFieldValues]
          }

          return nextErrors
        })

        return next
      })
    },
    [mode, validateField]
  )

  const register = useCallback(
    (name: keyof TFieldValues & string, options?: RegisterOptions<TFieldValues>) => {
      validatorsRef.current[name] = { options: options || {} }
      return {
        name,
        value: ((values as Record<string, unknown>)[name] ?? "") as TFieldValues[keyof TFieldValues] | string,
        onChange: (event: { target?: { value: any } } | any) => {
          const value = event?.target ? event.target.value : event
          updateValue(name, value)
        },
        onBlur: () => {
          if (mode === "onBlur") {
            const currentValue = (values as Record<string, unknown>)[name]
            const error = validateField(name, currentValue)
            setErrors((prevErrors) => {
              const nextErrors = { ...prevErrors }
              if (error) {
                nextErrors[name as keyof TFieldValues] = error
              } else {
                delete nextErrors[name as keyof TFieldValues]
              }
              return nextErrors
            })
          }
        },
      }
    },
    [mode, updateValue, validateField, values]
  )

  const handleSubmit = useCallback(
    (onValid: SubmitHandler<TFieldValues>) =>
      async (event?: { preventDefault?: () => void }) => {
        event?.preventDefault?.()
        setIsSubmitting(true)
        const validationErrors = runValidation(values)

        if (Object.keys(validationErrors).some((key) => key !== "root")) {
          setErrors(validationErrors)
          setIsSubmitting(false)
          setIsSubmitted(true)
          return
        }

        try {
          await onValid(values)
        } finally {
          setIsSubmitting(false)
          setIsSubmitted(true)
        }
      },
    [runValidation, values]
  )

  const setError = useCallback((name: keyof TFieldValues | "root", error: FieldError) => {
    setErrors((prev) => ({ ...prev, [name]: error }))
  }, [])

  const clearErrors = useCallback((name?: keyof TFieldValues | "root") => {
    if (!name) {
      setErrors({})
      return
    }

    setErrors((prev) => {
      if (!(name in prev)) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }, [])

  const reset = useCallback((nextValues?: Partial<TFieldValues>) => {
    setValues((nextValues || {}) as TFieldValues)
    setErrors({})
    setIsSubmitted(false)
  }, [])

  const isValid = useMemo(() => {
    const fieldErrors = { ...errors }
    delete fieldErrors.root
    if (Object.keys(fieldErrors).length > 0) {
      return false
    }

    for (const [name, { options }] of Object.entries(validatorsRef.current)) {
      if (options.required && isEmpty((values as Record<string, unknown>)[name])) {
        return false
      }
    }

    return true
  }, [errors, values])

  const watch = useCallback(<K extends keyof TFieldValues>(name?: K) => {
    if (typeof name === "undefined") {
      return values as TFieldValues
    }

    return (values as Record<string, unknown>)[name as string]
  }, [values])

  return {
    register,
    handleSubmit,
    watch: watch as any,
    setError,
    clearErrors,
    reset,
    formState: {
      errors,
      isValid,
      isSubmitting,
      isSubmitted,
    },
  }
}
