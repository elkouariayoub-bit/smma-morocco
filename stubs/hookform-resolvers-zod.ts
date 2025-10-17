import type { Resolver } from './react-hook-form';
import type { ZodIssue, ZodTypeAny } from './zod';

function mapIssues(issues: ZodIssue[]) {
  const result: Record<string, { message: string }> = {};
  for (const issue of issues) {
    const [first] = issue.path;
    if (typeof first === 'string' && !result[first]) {
      result[first] = { message: issue.message };
    }
  }
  return result;
}

export function zodResolver<T extends Record<string, any>>(schema: ZodTypeAny): Resolver<T> {
  return (values) => {
    const parsed = schema.safeParse(values);
    if (parsed.success) {
      return { values: parsed.data as T, errors: {} };
    }

    return {
      values,
      errors: mapIssues(parsed.error.issues) as any,
    };
  };
}
