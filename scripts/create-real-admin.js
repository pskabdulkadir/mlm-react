#!/usr/bin/env node
/* Create real admin user and persist into sharded data store
   Usage: node scripts/create-real-admin.js
*/

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_DIR = path.join(DATA_DIR, 'users');
const INDEX_DIR = path.join(DATA_DIR, 'index');
const DB_FILE = path.join(process.cwd(), 'database.json');
const BUCKET_COUNT = 1024;

function hashToBucket(id) {
  const h = crypto.createHash('sha1').update(id).digest();
  const n = h.readUInt32BE(0);
  return n % BUCKET_COUNT;
}

function userFilePath(id) {
  const bucket = hashToBucket(id);
  const dir = path.join(USERS_DIR, String(bucket));
  const file = path.join(dir, `${id}.json`);
  return { dir, file };
}

async function loadJson(p) {
  try { const raw = await fs.readFile(p, 'utf8'); return JSON.parse(raw); } catch (e) { return null; }
}

async function ensureDirs() {
  await fs.mkdir(USERS_DIR, { recursive: true });
  await fs.mkdir(INDEX_DIR, { recursive: true });
}

async function writeJsonAtomic(p, data) {
  const tmp = p + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, p);
}

(async function main(){
  await ensureDirs();
  // User details (from the request)
  const fullName = 'Abdulkadir Kan';
  const email = 'psikologabdulkadirkan@gmail.com';
  const phone = '+90 542 578 37 48';
  const rawPassword = 'Abdulkadir1983';
  const id = 'admin-001';
  const memberId = 'ADMIN001';
  const referralCode = 'ADMIN001';

  // Load indices
  const referralIdx = (await loadJson(path.join(INDEX_DIR, 'referral.json'))) || {};
  const phoneIdx = (await loadJson(path.join(INDEX_DIR, 'phone.json'))) || {};
  const sponsorIdx = (await loadJson(path.join(INDEX_DIR, 'sponsor.json'))) || {};
  const emailIdx = (await loadJson(path.join(INDEX_DIR, 'email.json'))) || {};
  const memberIdIdx = (await loadJson(path.join(INDEX_DIR, 'memberId.json'))) || {};

  // Check if email or phone already exists in indices
  if (emailIdx[email.toLowerCase()]) {
    console.log('Email already exists in index:', emailIdx[email.toLowerCase()]);
    process.exit(1);
  }
  if (phoneIdx[phone]) {
    console.log('Phone already exists in index:', phoneIdx[phone]);
    process.exit(1);
  }

  // Hash password
  const hashed = await bcrypt.hash(String(rawPassword), 10);

  // Build user object
  const user = {
    id,
    fullName,
    email,
    phone,
    password: hashed,
    role: 'admin',
    isActive: true,
    wallet: { balance: 0, totalEarnings: 0, sponsorBonus: 0, careerBonus: 0, passiveIncome: 0, leadershipBonus: 0 },
    careerLevel: { id: '1', name: 'Nefs-i Emmare' },
    referralCode,
    sponsorId: null,
    memberId,
    registrationDate: new Date().toISOString()
  };

  // Write user file to shard
  const { dir, file } = userFilePath(id);
  await fs.mkdir(dir, { recursive: true });
  const tmp = file + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(user, null, 2));
  await fs.rename(tmp, file);
  console.log('User file written:', file);

  // Update indices
  referralIdx[referralCode] = id;
  phoneIdx[phone] = id;
  emailIdx[email.toLowerCase()] = id;
  memberIdIdx[memberId] = id;
  // sponsorIdx: admin has no sponsor

  await writeJsonAtomic(path.join(INDEX_DIR, 'referral.json'), referralIdx);
  await writeJsonAtomic(path.join(INDEX_DIR, 'phone.json'), phoneIdx);
  await writeJsonAtomic(path.join(INDEX_DIR, 'sponsor.json'), sponsorIdx);
  await writeJsonAtomic(path.join(INDEX_DIR, 'email.json'), emailIdx);
  await writeJsonAtomic(path.join(INDEX_DIR, 'memberId.json'), memberIdIdx);
  console.log('Indices updated.');

  // Update legacy database.json users array
  const db = (await loadJson(DB_FILE)) || { users: [] };
  db.users = db.users || [];
  const exists = db.users.find(u => (u.email || '').toLowerCase() === email.toLowerCase() || u.id === id);
  if (!exists) {
    db.users.push(user);
    await writeJsonAtomic(DB_FILE, db);
    console.log('database.json updated with new user.');
  } else {
    console.log('database.json already contains user entry.');
  }

  console.log('\n✅ Admin user created: ' + email + '   (password hidden)');
  console.log('You can now login with the provided credentials.');
})();
