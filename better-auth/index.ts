export type BetterAuthProvider = {
  id: string;
  clientId: string;
  clientSecret: string;
};

export type BetterAuthConfig = {
  providers: BetterAuthProvider[];
};

export type BetterAuthInstance = {
  providers: Record<string, BetterAuthProvider>;
};

export function betterAuth(config: BetterAuthConfig): BetterAuthInstance {
  const providers = Object.fromEntries(
    config.providers.map((provider) => [provider.id, provider])
  );

  return { providers };
}
