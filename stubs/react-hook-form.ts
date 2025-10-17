'use client';

import { useCallback, useMemo, useState } from 'react';

type FieldError = { message: string };

type FieldErrors<T extends Record<string, any>> = Partial<{ [K in keyof T]: FieldError }>;

type ResolverResult<T extends Record<string, any>> = {
  values: T;
  errors: FieldErrors<T>;
};

type Resolver<T extends Record<string, any>> = (values: T) => ResolverResult<T>;

type RegisterReturn = {
  name: string;
  value: any;
  onChange: (event: { target: { value: any } } | any) => void;
};

type UseFormOptions<T extends Record<string, any>> = {
  resolver?: Resolver<T>;
  defaultValues: T;
  mode?: 'onChange' | 'onSubmit';
};

type SubmitHandler<T extends Record<string, any>> = (values: T) => void | Promise<void>;

export function useForm<T extends Record<string, any>>({
  resolver,
  defaultValues,
  mode = 'onSubmit',
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(defaultValues);
  const [errors, setErrors] = useState<FieldErrors<T>>({});

  const runResolver = useCallback(
    (currentValues: T) => {
      if (!resolver) {
        setErrors({});
        return { values: currentValues, errors: {} as FieldErrors<T> };
      }

      const result = resolver(currentValues);
      setErrors(result.errors ?? ({} as FieldErrors<T>));
      return result;
    },
    [resolver],
  );

  const register = useCallback(
    (name: keyof T & string): RegisterReturn => ({
      name,
      value: values[name],
      onChange: (event) => {
        const nextValue = event?.target?.value ?? event;
        setValues((prev) => {
          const updated = { ...prev, [name]: nextValue };
          if (mode === 'onChange') {
            runResolver(updated as T);
          }
          return updated as T;
        });
      },
    }),
    [mode, runResolver, values],
  );

  const handleSubmit = useCallback(
    (handler: SubmitHandler<T>) =>
      async (event?: { preventDefault?: () => void }) => {
        event?.preventDefault?.();
        const { values: resolvedValues, errors: resolvedErrors } = runResolver(values);
        const hasErrors = Object.keys(resolvedErrors ?? {}).length > 0;
        if (hasErrors) {
          return;
        }
        await handler(resolvedValues);
      },
    [runResolver, values],
  );

  const reset = useCallback(() => {
    setValues(defaultValues);
    setErrors({});
  }, [defaultValues]);

  const setValue = useCallback(
    (name: keyof T & string, value: any, options?: { shouldValidate?: boolean }) => {
      setValues((prev) => {
        const updated = { ...prev, [name]: value } as T;
        if (options?.shouldValidate) {
          runResolver(updated);
        }
        return updated;
      });
    },
    [runResolver],
  );

  const watch = useCallback(
    (name: keyof T & string) => values[name],
    [values],
  );

  const formState = useMemo(
    () => ({
      errors,
    }),
    [errors],
  );

  return {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState,
  };
}

export type { FieldError, FieldErrors, Resolver };
