import { NextResponse, type NextRequest } from 'next/server';

import type { BetterAuthInstance } from './index';

type AuthFactory = BetterAuthInstance | (() => BetterAuthInstance);

const resolveInstance = (auth: AuthFactory): BetterAuthInstance =>
  typeof auth === 'function' ? (auth as () => BetterAuthInstance)() : auth;

export function toNextJsHandler(auth: AuthFactory) {
  const handler = async (_request: NextRequest) => {
    try {
      const instance = resolveInstance(auth);
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

      return NextResponse.json({ error: message }, { status: 500 });
    }
  };

  return {
    GET: handler,
    POST: handler,
  };
}
