type SupportedProvider = 'google';

type SocialOptions = {
  provider: SupportedProvider;
  redirectTo?: string;
};

type SocialResponse = {
  redirect?: string;
};

const parseResponse = async (response: Response) => {
  try {
    return (await response.json()) as { success?: boolean; redirect?: string; error?: string };
  } catch (error) {
    return null;
  }
};

async function social({ provider, redirectTo }: SocialOptions): Promise<SocialResponse> {
  const response = await fetch('/auth/better', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ intent: 'oauth', provider, redirectTo }),
  });

  const data = await parseResponse(response);

  if (!response.ok || !data?.success) {
    const message = data?.error ?? 'Unable to start OAuth flow. Please try again.';
    throw new Error(message);
  }

  return { redirect: data.redirect };
}

export const signIn = {
  social,
};

export type SignInClient = typeof signIn;
