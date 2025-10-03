// services/geminiService.ts (client-safe fetch wrapper)
export async function generateCaption(topic: string): Promise<string> {
  const res = await fetch('/api/ai/caption', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic }),
  });

  const data = await res.json();
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || `Caption generation failed (HTTP ${res.status})`);
  }
  return data.result as string;
}
