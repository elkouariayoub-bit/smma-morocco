export type SafeParseSuccess<T> = { success: true; data: T }
export type SafeParseFailure = { success: false; error: ZodError }
export type SafeParseReturnType<T> = SafeParseSuccess<T> | SafeParseFailure

export type ZodIssue = { path: (string | number)[]; message: string }

export class ZodError extends Error {
  issues: ZodIssue[]

  constructor(issues: ZodIssue[]) {
    super(issues[0]?.message ?? 'Invalid input')
    this.issues = issues
  }
}

abstract class BaseSchema<T> {
  abstract _parse(value: unknown, path: (string | number)[]): SafeParseReturnType<T>

  parse(value: unknown): T {
    const result = this._parse(value, [])
    if (!result.success) {
      throw result.error
    }
    return result.data
  }

  safeParse(value: unknown): SafeParseReturnType<T> {
    return this._parse(value, [])
  }

  optional(): OptionalSchema<T> {
    return new OptionalSchema(this)
  }

  default(defaultValue: T): DefaultSchema<T> {
    return new DefaultSchema(this, defaultValue)
  }
}

class OptionalSchema<T> extends BaseSchema<T | undefined> {
  constructor(private inner: BaseSchema<T>) {
    super()
  }

  _parse(value: unknown, path: (string | number)[]): SafeParseReturnType<T | undefined> {
    if (value === undefined || value === null) {
      return { success: true, data: undefined }
    }
    return this.inner._parse(value, path)
  }
}

class DefaultSchema<T> extends BaseSchema<T> {
  constructor(private inner: BaseSchema<T>, private defaultValue: T) {
    super()
  }

  _parse(value: unknown, path: (string | number)[]): SafeParseReturnType<T> {
    if (value === undefined || value === null || value === '') {
      return { success: true, data: this.defaultValue }
    }
    return this.inner._parse(value, path)
  }
}

class StringSchema extends BaseSchema<string> {
  private minLength: number | null = null
  private maxLength: number | null = null
  private pattern: RegExp | null = null
  private patternMessage = 'Invalid format'
  private trimValue = false

  min(length: number, message = `Must be at least ${length} characters long`): this {
    this.minLength = length
    return this
  }

  max(length: number, message = `Must be at most ${length} characters long`): this {
    this.maxLength = length
    return this
  }

  trim(): this {
    this.trimValue = true
    return this
  }

  regex(pattern: RegExp, message = 'Invalid format'): this {
    this.pattern = pattern
    this.patternMessage = message
    return this
  }

  _parse(value: unknown, path: (string | number)[]): SafeParseReturnType<string> {
    if (typeof value !== 'string') {
      return {
        success: false,
        error: new ZodError([{ path, message: 'Expected string' }]),
      }
    }

    let result = this.trimValue ? value.trim() : value

    if (this.minLength !== null && result.length < this.minLength) {
      return {
        success: false,
        error: new ZodError([{ path, message: `Must be at least ${this.minLength} characters long` }]),
      }
    }

    if (this.maxLength !== null && result.length > this.maxLength) {
      return {
        success: false,
        error: new ZodError([{ path, message: `Must be at most ${this.maxLength} characters long` }]),
      }
    }

    if (this.pattern && !this.pattern.test(result)) {
      return {
        success: false,
        error: new ZodError([{ path, message: this.patternMessage }]),
      }
    }

    return { success: true, data: result }
  }
}

class EnumSchema<T extends [string, ...string[]]> extends BaseSchema<T[number]> {
  constructor(private values: T) {
    super()
  }

  _parse(value: unknown, path: (string | number)[]): SafeParseReturnType<T[number]> {
    if (typeof value !== 'string' || !this.values.includes(value)) {
      return {
        success: false,
        error: new ZodError([{ path, message: `Expected one of: ${this.values.join(', ')}` }]),
      }
    }

    return { success: true, data: value as T[number] }
  }
}

class NumberSchema extends BaseSchema<number> {
  private minValue: number | null = null
  private maxValue: number | null = null
  private isInt = false

  min(value: number): this {
    this.minValue = value
    return this
  }

  max(value: number): this {
    this.maxValue = value
    return this
  }

  int(): this {
    this.isInt = true
    return this
  }

  _parse(value: unknown, path: (string | number)[]): SafeParseReturnType<number> {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return { success: false, error: new ZodError([{ path, message: 'Expected number' }]) }
    }

    if (this.isInt && !Number.isInteger(value)) {
      return { success: false, error: new ZodError([{ path, message: 'Expected integer' }]) }
    }

    if (this.minValue !== null && value < this.minValue) {
      return { success: false, error: new ZodError([{ path, message: `Must be greater than or equal to ${this.minValue}` }]) }
    }

    if (this.maxValue !== null && value > this.maxValue) {
      return { success: false, error: new ZodError([{ path, message: `Must be less than or equal to ${this.maxValue}` }]) }
    }

    return { success: true, data: value }
  }
}

class BooleanSchema extends BaseSchema<boolean> {
  _parse(value: unknown, path: (string | number)[]): SafeParseReturnType<boolean> {
    if (typeof value !== 'boolean') {
      return { success: false, error: new ZodError([{ path, message: 'Expected boolean' }]) }
    }
    return { success: true, data: value }
  }
}

class ObjectSchema<T extends Record<string, BaseSchema<any>>> extends BaseSchema<{ [K in keyof T]: ReturnType<T[K]['parse']> }> {
  constructor(private shape: T) {
    super()
  }

  _parse(value: unknown, path: (string | number)[]): SafeParseReturnType<{ [K in keyof T]: ReturnType<T[K]['parse']> }> {
    if (typeof value !== 'object' || value === null) {
      return { success: false, error: new ZodError([{ path, message: 'Expected object' }]) }
    }

    const result: Record<string, unknown> = {}
    for (const key of Object.keys(this.shape)) {
      const schema = this.shape[key]
      const nextPath = [...path, key]
      const inputValue = (value as Record<string, unknown>)[key]
      const parsed = schema._parse(inputValue, nextPath)
      if (!parsed.success) {
        return parsed
      }
      result[key] = parsed.data
    }

    return { success: true, data: result as { [K in keyof T]: ReturnType<T[K]['parse']> } }
  }
}

class CoerceNumberSchema extends BaseSchema<number> {
  private inner = new NumberSchema()

  min(value: number) {
    this.inner.min(value)
    return this
  }

  max(value: number) {
    this.inner.max(value)
    return this
  }

  int() {
    this.inner.int()
    return this
  }

  _parse(value: unknown, path: (string | number)[]): SafeParseReturnType<number> {
    const coerced = typeof value === 'string' && value !== '' ? Number(value) : Number(value)
    return this.inner._parse(coerced, path)
  }
}

export const z = {
  string: () => new StringSchema(),
  enum: <T extends [string, ...string[]]>(values: T) => new EnumSchema(values),
  number: () => new NumberSchema(),
  boolean: () => new BooleanSchema(),
  object: <T extends Record<string, BaseSchema<any>>>(shape: T) => new ObjectSchema(shape),
  coerce: {
    number: () => new CoerceNumberSchema(),
  },
}

export type infer<T> = T extends BaseSchema<infer U> ? U : never
