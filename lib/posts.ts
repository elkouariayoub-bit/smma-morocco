export type Post = {
  id: string;
  platform: "instagram" | "tiktok" | "facebook" | "x";
  date: string; // YYYY-MM-DD
  caption: string;
  thumbnail: string; // URL
  engagement: number; // likes+comments+shares
};

export async function getTopPosts(opts: { start: string; end: string; limit?: number }): Promise<Post[]> {
  const { start, end, limit = 50 } = opts;
  // TODO: Replace with real data source. Mock for now:
  const dayMs = 86400000;
  const s = new Date(start + "T00:00:00").getTime();
  const e = new Date(end + "T00:00:00").getTime();
  const posts: Post[] = [];
  for (let t = s; t <= e; t += dayMs) {
    for (let i = 0; i < 3; i++) {
      const id = `${t}-${i}`;
      posts.push({
        id,
        platform: (["instagram", "tiktok", "facebook", "x"] as const)[(i + t) % 4],
        date: new Date(t).toISOString().slice(0, 10),
        caption: `Post ${i + 1} on ${new Date(t).toDateString()}`,
        thumbnail: `https://picsum.photos/seed/${id}/96/64`,
        engagement: Math.round(50 + ((t / 1e7) % 100) + i * 20),
      });
    }
  }
  return posts.sort((a, b) => b.engagement - a.engagement).slice(0, limit);
}
