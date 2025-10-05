export type BetterAuthProvider = {
  id: string;
  clientId: string;
  clientSecret: string;
};

export type BetterAuthConfig = {
  providers: BetterAuthProvider[];
  secret?: string | null;
  baseURL?: string | null;
};

export type BetterAuthInstance = {
  providers: Record<string, BetterAuthProvider>;
  secret?: string | null;
  baseURL?: string | null;
};

export function betterAuth({ providers, secret, baseURL }: BetterAuthConfig): BetterAuthInstance {
  const normalizedProviders = Object.fromEntries(
    providers.map((provider) => [provider.id, provider])
  );

  return {
    providers: normalizedProviders,
    secret: secret ?? null,
    baseURL: baseURL ?? null,
  };
}
