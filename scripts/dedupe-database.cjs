const fs = require('fs').promises;
const path = require('path');

async function dedupe() {
  const dbPath = path.join(process.cwd(), 'database.json');
  const raw = await fs.readFile(dbPath, 'utf-8');
  const json = JSON.parse(raw);
  const users = json.users || [];
  const map = new Map();
  for (const u of users) {
    if (!u || !u.id) continue;
    map.set(u.id, u); // keep last occurrence
  }
  const deduped = Array.from(map.values());
  json.users = deduped;
  await fs.writeFile(dbPath, JSON.stringify(json, null, 2));
  console.log('Deduped users:', users.length, '->', deduped.length);
}

dedupe().catch(err => { console.error(err); process.exit(1); });
