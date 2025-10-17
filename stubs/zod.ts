export type ZodIssue = {
  path: (string | number)[];
  message: string;
};

type SafeParseSuccess<T> = { success: true; data: T };
type SafeParseError = { success: false; error: { issues: ZodIssue[] } };

abstract class ZodType<T> {
  abstract safeParse(data: unknown): SafeParseSuccess<T> | SafeParseError;

  parse(data: unknown): T {
    const result = this.safeParse(data);
    if (result.success) {
      return result.data;
    }
    const message = result.error.issues.map((issue) => issue.message).join(', ') || 'Invalid input';
    throw new Error(message);
  }
}

class ZodString extends ZodType<string> {
  private checks: ((value: string) => string | null)[] = [];

  min(length: number, message?: string) {
    this.checks.push((value) => (value.length < length ? message ?? `Must be at least ${length} characters` : null));
    return this;
  }

  max(length: number, message?: string) {
    this.checks.push((value) => (value.length > length ? message ?? `Must be at most ${length} characters` : null));
    return this;
  }

  regex(pattern: RegExp, message?: string) {
    this.checks.push((value) => (pattern.test(value) ? null : message ?? 'Invalid format'));
    return this;
  }

  email(message?: string) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.checks.push((value) => (pattern.test(value) ? null : message ?? 'Invalid email address'));
    return this;
  }

  safeParse(data: unknown): SafeParseSuccess<string> | SafeParseError {
    const issues: ZodIssue[] = [];
    if (typeof data !== 'string') {
      issues.push({ path: [], message: 'Expected string' });
    } else {
      for (const check of this.checks) {
        const failure = check(data);
        if (failure) {
          issues.push({ path: [], message: failure });
        }
      }
    }

    if (issues.length > 0) {
      return { success: false, error: { issues } };
    }

    return { success: true, data: data as string };
  }
}

class ZodObject<T extends Record<string, ZodType<any>>> extends ZodType<{ [K in keyof T]: InferType<T[K]> }> {
  constructor(private shape: T) {
    super();
  }

  safeParse(data: unknown): SafeParseSuccess<{ [K in keyof T]: InferType<T[K]> }> | SafeParseError {
    const issues: ZodIssue[] = [];
    if (typeof data !== 'object' || data === null) {
      issues.push({ path: [], message: 'Expected object' });
      return { success: false, error: { issues } };
    }

    const output: Record<string, unknown> = {};

    for (const key of Object.keys(this.shape)) {
      const schema = this.shape[key as keyof T];
      const value = (data as Record<string, unknown>)[key];
      const result = schema.safeParse(value);
      if (result.success) {
        output[key] = result.data;
      } else {
        for (const issue of result.error.issues) {
          issues.push({ path: [key, ...issue.path], message: issue.message });
        }
      }
    }

    if (issues.length > 0) {
      return { success: false, error: { issues } };
    }

    return { success: true, data: output as { [K in keyof T]: InferType<T[K]> } };
  }
}

class ZodEnum<T extends readonly [string, ...string[]]> extends ZodType<T[number]> {
  constructor(private readonly values: T) {
    super();
  }

  safeParse(data: unknown): SafeParseSuccess<T[number]> | SafeParseError {
    if (typeof data !== 'string') {
      return { success: false, error: { issues: [{ path: [], message: 'Expected string' }] } };
    }

    if (!this.values.includes(data)) {
      return {
        success: false,
        error: { issues: [{ path: [], message: `Expected one of: ${this.values.join(', ')}` }] },
      };
    }

    return { success: true, data: data as T[number] };
  }
}

type InferType<T> = T extends ZodType<infer U> ? U : never;

export const z = {
  string: () => new ZodString(),
  object: <T extends Record<string, ZodType<any>>>(shape: T) => new ZodObject(shape),
  enum: <T extends readonly [string, ...string[]]>(values: T) => new ZodEnum(values),
};

export type ZodTypeAny = ZodType<any>;

export namespace z {
  export type infer<T extends ZodTypeAny> = T extends ZodType<infer Output> ? Output : never;
}
