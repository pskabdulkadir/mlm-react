const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_DIR = path.join(DATA_DIR, 'users');
const INDEX_DIR = path.join(DATA_DIR, 'index');
const DB_PATH = path.join(process.cwd(), 'database.json');

function hashToBucket(id) {
  const h = crypto.createHash('sha1').update(id).digest();
  const n = h.readUInt32BE(0);
  return n % 1024;
}

function userFilePath(id) {
  const bucket = hashToBucket(id);
  return path.join(USERS_DIR, String(bucket), `${id}.json`);
}

async function readUserFile(id) {
  try { const raw = await fs.readFile(userFilePath(id), 'utf-8'); return JSON.parse(raw); } catch (e) { return null; }
}

async function writeUserFile(id, data) {
  const p = userFilePath(id);
  await fs.mkdir(path.dirname(p), { recursive: true });
  const tmp = p + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, p);
}

async function simulate(buyerId, amount) {
  const dbRaw = await fs.readFile(DB_PATH, 'utf-8');
  const db = JSON.parse(dbRaw);

  // Build sponsor chain from legacy db
  const users = db.users || [];
  const byId = {};
  for (const u of users) byId[u.id] = u;

  const percentages = [0.10, 0.05, 0.03, 0.02, 0.01];
  const chain = [];
  let curr = byId[buyerId];
  for (let i = 0; i < 10 && curr; i++) {
    if (!curr.sponsorId) break;
    const sponsor = byId[curr.sponsorId] || (await readUserFile(curr.sponsorId));
    if (!sponsor) break;
    chain.push(sponsor);
    curr = sponsor;
  }

  const transactions = [];
  let distributed = 0;
  for (let i = 0; i < percentages.length; i++) {
    const recipient = chain[i];
    if (recipient) {
      const amt = Math.round(amount * percentages[i] * 100) / 100;
      distributed += amt;
      transactions.push({ recipientId: recipient.id, amount: amt, type: 'monoline', sourceUserId: buyerId, level: i+1, description: `Commission level ${i+1}` });
    }
  }

  const companyShare = Math.round((amount - distributed) * 100) / 100;
  if (companyShare > 0) {
    db.companyFund = db.companyFund || { totalAmount: 0, transactions: [] };
    db.companyFund.totalAmount = (db.companyFund.totalAmount || 0) + companyShare;
    db.companyFund.transactions = db.companyFund.transactions || [];
    db.companyFund.transactions.push({ id: `cf-${Date.now()}`, amount: companyShare, note: 'Residual commission', sourceUserId: buyerId, date: new Date() });
  }

  // persist commissions and wallet txs and user wallets
  db.monolineCommissions = db.monolineCommissions || [];
  db.walletTransactions = db.walletTransactions || [];

  for (const t of transactions) {
    const rec = { id: `mct-${Date.now()}-${Math.random().toString(36).slice(2,8)}`, ...t, createdAt: new Date(), status: 'completed' };
    db.monolineCommissions.push(rec);

    // Update user wallet (try sharded file first)
    let user = await readUserFile(t.recipientId);
    if (!user) user = byId[t.recipientId];
    if (user) {
      user.wallet = user.wallet || { balance: 0, totalEarnings: 0 };
      user.wallet.balance = (user.wallet.balance || 0) + t.amount;
      user.wallet.totalEarnings = (user.wallet.totalEarnings || 0) + t.amount;
      try { await writeUserFile(user.id, user); } catch (e) { /* ignore */ }

      db.walletTransactions.push({ id: `wtx-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, userId: user.id, amount: t.amount, type: 'commission', description: t.description, status: 'completed', date: new Date() });
    }
  }

  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
  console.log(`Simulated sale by ${buyerId} amount=${amount}. Distributed=${distributed}, companyShare=${companyShare}, transactions=${transactions.length}`);
}

const args = process.argv.slice(2);
const buyer = args[0] || 'user-1';
const amount = parseFloat(args[1] || '100');
simulate(buyer, amount).catch(err => { console.error(err); process.exit(1); });
