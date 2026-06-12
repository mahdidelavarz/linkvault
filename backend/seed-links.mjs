// Run: node seed-links.mjs
// Creates 30 test links for the given account.

const BASE = 'http://localhost:5000/api';
const USERNAME = 'osis';
const PASSWORD = '13771220Mh.';

const LINKS = Array.from({ length: 30 }, (_, i) => ({
  title: `Test Link ${i + 1}`,
  url: `https://example.com/page-${i + 1}`,
  description: `Auto-generated link number ${i + 1} for pagination testing`,
  isFavorite: i % 5 === 0,
}));

async function main() {
  // 1. Login
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
  });

  if (!loginRes.ok) {
    const err = await loginRes.json();
    console.error('Login failed:', err.message);
    process.exit(1);
  }

  const loginData = await loginRes.json();
  const token = loginData.token ?? loginData.accessToken;
  console.log('Logged in successfully.');

  // 2. Create links
  let created = 0;
  for (const link of LINKS) {
    const res = await fetch(`${BASE}/links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(link),
    });
    if (res.ok) {
      created++;
      process.stdout.write(`\rCreated ${created}/${LINKS.length}`);
    } else {
      const err = await res.json();
      console.error(`\nFailed on link ${created + 1}:`, err.message);
    }
  }

  console.log(`\nDone — ${created} links created.`);
}

main();
