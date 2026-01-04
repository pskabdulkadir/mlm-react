import { mlmDb } from "../mlm-database";

const DEFAULT_INTERVAL = parseInt(process.env.PASSIVE_DISTRIBUTION_INTERVAL_MS || "60000", 10); // 60s default for testing
const BATCH_SIZE = parseInt(process.env.PASSIVE_DISTRIBUTION_BATCH_SIZE || "1000", 10);

export function startPassiveDistribution() {
  console.log('📆 Passive distribution scheduler starting. Interval(ms):', DEFAULT_INTERVAL);
  setInterval(async () => {
    try {
      const db = await mlmDb;
      await db.db.read();
      const pool = db.db.data.passiveIncomePool?.totalAmount || 0;
      if (!pool || pool <= 0) return;

      const userIds = db.userIds || Object.values(db.indices?.referral || {});
      if (!userIds || userIds.length === 0) return;

      const count = Math.min(userIds.length, BATCH_SIZE);
      const perUser = Math.floor((pool / count) * 100) / 100; // round to cents
      if (perUser <= 0) return;

      const transactions: any[] = [];
      for (let i = 0; i < count; i++) {
        transactions.push({ recipientId: userIds[i], amount: perUser, type: 'passive', description: 'Passive pool distribution' });
      }

      const totalDistributed = perUser * transactions.length;
      // Create commission/wallet transactions
      const res = await db.createMonolineCommissionTransactions(transactions);

      // Deduct from pool
      db.db.data.passiveIncomePool.totalAmount = Math.max(0, (db.db.data.passiveIncomePool.totalAmount || 0) - totalDistributed);
      db.db.data.passiveIncomePool.lastUpdated = new Date();
      await db.db.write();

      console.log(`Passive distribution: distributed ${totalDistributed} to ${transactions.length} users. Result:`, res);
    } catch (e) {
      console.error('Passive distribution error:', e);
    }
  }, DEFAULT_INTERVAL);
}
