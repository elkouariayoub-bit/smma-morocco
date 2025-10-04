#!/usr/bin/env node
// scripts/post-test-scheduled-post.js
// Usage: node scripts/post-test-scheduled-post.js <user_id>
const userId = process.argv[2];
if (!userId) {
  console.error('Usage: node scripts/post-test-scheduled-post.js <user_id>');
  process.exit(1);
}

async function main() {
  const payload = {
    platform: 'instagram',
    caption: 'Test caption from E2E flow (script)',
    image_url: null,
    scheduled_at: '2025-10-05T12:00:00Z',
    user_id: userId,
  };

  try {
    const postRes = await fetch('http://localhost:3000/api/ai/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const postJson = await postRes.json().catch(() => null);
    console.log('POST response status:', postRes.status);
    console.log(JSON.stringify(postJson, null, 2));

    const getRes = await fetch('http://localhost:3000/api/ai/posts');
    const getJson = await getRes.json().catch(() => null);
    console.log('\nGET /api/ai/posts status:', getRes.status);
    console.log(JSON.stringify(getJson, null, 2));
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}

main();
