const fs = require('fs').promises;
const path = require('path');

async function ensureSeeds() {
  const dbPath = path.join(process.cwd(), 'database.json');
  const raw = await fs.readFile(dbPath, 'utf-8');
  const json = JSON.parse(raw);
  json.users = json.users || [];

  function findById(id) { return json.users.find(u => u.id === id); }
  function findByEmail(email) { return json.users.find(u => u.email === email); }

  if (!findById('admin-001') && !findByEmail('psikologabdulkadirkan@gmail.com')) {
    const admin = {
      id: 'admin-001',
      fullName: 'Abdulkadir Kan',
      email: 'psikologabdulkadirkan@gmail.com',
      password: 'HASHED_PLACEHOLDER',
      role: 'admin',
      isActive: true,
      wallet: { balance: 0, totalEarnings: 0, sponsorBonus: 0, careerBonus: 0, passiveIncome: 0, leadershipBonus: 0 },
      careerLevel: { id: '1', name: 'Nefs-i Emmare' },
      referralCode: 'ADMIN001',
      sponsorId: null,
      memberId: 'ADMIN001',
      registrationDate: new Date().toISOString()
    };
    json.users.push(admin);
    console.log('Added admin');
  } else {
    console.log('Admin already present');
  }

  // ensure 10 sultans
  for (let i = 1; i <= 10; i++) {
    const id = `user-${i}`;
    const email = `sultan${i}@example.com`;
    if (!findById(id) && !findByEmail(email)) {
      json.users.push({
        id,
        fullName: `Sultan ${i}`,
        email,
        password: 'HASHED_PLACEHOLDER',
        role: 'user',
        isActive: true,
        wallet: { balance: 0, totalEarnings: 0 },
        careerLevel: { id: '1', name: 'Nefs-i Emmare' },
        referralCode: `SULTAN${i}`,
        sponsorId: i === 1 ? 'admin-001' : `user-${i-1}`,
        memberId: `MEM-${1000 + i}`,
        phone: `555000000${i}`,
        registrationDate: new Date().toISOString()
      });
      console.log('Added', id);
    }
  }

  await fs.writeFile(dbPath, JSON.stringify(json, null, 2));
  console.log('Seed complete. Total users:', json.users.length);
}

ensureSeeds().catch(err => { console.error(err); process.exit(1); });
