import { WalletTransaction } from './WalletTransaction';
import { PACKAGE_LIMITS } from './earning-limits';

export async function checkEarningLimit(
  user: any,
  incomingAmount: number
): Promise<'PAID' | 'HELD'> {

  // Paket yoksa veya tanımsızsa ödeme yapma
  if (!user.package || user.package === 'NONE') {
    return 'HELD';
  }

  // @ts-ignore - PACKAGE_LIMITS tip tanımlaması basit tutulduğu için
  const limits = PACKAGE_LIMITS[user.package];
  if (!limits) return 'HELD';

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(
    startOfDay.getFullYear(),
    startOfDay.getMonth(),
    1
  );

  // Günlük ve aylık toplam kazançları hesapla (Sadece PAID olanlar)
  const [daily, monthly] = await Promise.all([
    WalletTransaction.aggregate([
      { $match: { userId: user._id, status: 'PAID', createdAt: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    WalletTransaction.aggregate([
      { $match: { userId: user._id, status: 'PAID', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
  ]);

  const dailyTotal = daily[0]?.total || 0;
  const monthlyTotal = monthly[0]?.total || 0;

  if (dailyTotal + incomingAmount > limits.daily) return 'HELD';
  if (monthlyTotal + incomingAmount > limits.monthly) return 'HELD';

  return 'PAID';
}