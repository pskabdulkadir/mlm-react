const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_DIR = path.join(DATA_DIR, 'users');
const INDEX_DIR = path.join(DATA_DIR, 'index');
const BUCKET_COUNT = 1024;

function hashToBucket(id) {
  const h = crypto.createHash('sha1').update(id).digest();
  const n = h.readUInt32BE(0);
  return n % BUCKET_COUNT;
}

function userFilePath(id) {
  const bucket = hashToBucket(id);
  const dir = path.join(USERS_DIR, String(bucket));
  return { dir, file: path.join(dir, `${id}.json`) };
}

async function ensureDirs() {
  await fs.mkdir(USERS_DIR, { recursive: true });
  await fs.mkdir(INDEX_DIR, { recursive: true });
}

async function writeUserFile(id, data) {
  const { dir, file } = userFilePath(id);
  await fs.mkdir(dir, { recursive: true });
  const tmp = file + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, file);
}

async function generate(count) {
  await ensureDirs();
  const referral = {};
  const phone = {};
  const sponsor = {};

  // create admin
  const admin = {
    id: 'admin-001',
    fullName: 'Seed Admin',
    email: 'seed-admin@example.com',
    role: 'admin',
    isActive: true,
    wallet: { balance: 0, totalEarnings: 0 },
    referralCode: 'ADMIN001',
    sponsorId: null,
    memberId: 'ADMIN001'
  };
  await writeUserFile(admin.id, admin);
  referral[admin.referralCode] = admin.id;

  for (let i = 1; i <= count; i++) {
    const id = `sim-${i}`;
    const user = {
      id,
      fullName: `Sim User ${i}`,
      email: `sim${i}@example.com`,
      role: 'user',
      isActive: true,
      wallet: { balance: 0, totalEarnings: 0 },
      referralCode: `REF${i}`,
      sponsorId: i === 1 ? admin.id : `sim-${Math.max(1, Math.floor(i/2))}`,
      memberId: `MEM-${100000 + i}`
    };
    await writeUserFile(id, user);
    referral[user.referralCode] = id;
    phone[user.memberId] = id;
    sponsor[user.sponsorId] = sponsor[user.sponsorId] || [];
    sponsor[user.sponsorId].push(id);
    if (i % 1000 === 0) process.stdout.write(`.${i}`);
  }

  await fs.writeFile(path.join(INDEX_DIR, 'referral.json'), JSON.stringify(referral, null, 2));
  await fs.writeFile(path.join(INDEX_DIR, 'phone.json'), JSON.stringify(phone, null, 2));
  await fs.writeFile(path.join(INDEX_DIR, 'sponsor.json'), JSON.stringify(sponsor, null, 2));
  console.log('\nDone generating', count, 'users.');
}

const argv = process.argv.slice(2);
const count = parseInt(argv[0] || '10000', 10);
generate(count).catch(err => { console.error(err); process.exit(1); });
