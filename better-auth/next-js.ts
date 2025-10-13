import { NextResponse, type NextRequest } from 'next/server';

import type { BetterAuthInstance } from './index';

type AuthFactory =
  | BetterAuthInstance
  | (() => BetterAuthInstance | Promise<BetterAuthInstance>);

const resolveInstance = async (auth: AuthFactory): Promise<BetterAuthInstance> =>
  typeof auth === 'function'
    ? await (auth as () => BetterAuthInstance | Promise<BetterAuthInstance>)()
    : auth;

export function toNextJsHandler(auth: AuthFactory) {
  const handler = async (_request: NextRequest) => {
    try {
      const instance = await resolveInstance(auth);
      const providers = Object.keys(instance.providers);

      return NextResponse.json(
        {
          status: 'ready',
          providers,
          baseURL: instance.baseURL ?? null,
        },
        { status: 200 }
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to initialize Better Auth.';

      const statusCode = (() => {
        if (error && typeof error === 'object' && 'statusCode' in error) {
          const candidate = Number((error as { statusCode?: unknown }).statusCode);
          if (Number.isFinite(candidate) && candidate >= 400 && candidate < 600) {
            return candidate;
          }
        }
        return 500;
      })();

      return NextResponse.json({ error: message }, { status: statusCode });
    }
  };

  return {
    GET: handler,
    POST: handler,
  };
}
