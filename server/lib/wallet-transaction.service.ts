import mongoose from 'mongoose';
import { WalletTransaction } from './WalletTransaction';
import { checkEarningLimit } from './earning-checker';
import { User } from './User';

export async function applyWalletTransactions(
  transactions: {
    userId: string;
    amount: number;
    type: string;
    reference: string;
    description?: string;
  }[]
) {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const tx of transactions) {
      const user = await User.findById(tx.userId).session(session);
      if (!user) continue;

      // Limit kontrolü yap
      const status = await checkEarningLimit(user, tx.amount);

      // İşlem kaydını oluştur (Ledger)
      await WalletTransaction.create([{
        userId: user._id,
        amount: tx.amount,
        type: tx.type,
        reference: tx.reference,
        description: tx.description,
        status
      }], { session });

      // Eğer limit aşılmadıysa cüzdanı güncelle
      if (status === 'PAID') {
        user.wallet.balance += tx.amount;
        user.wallet.totalEarnings += tx.amount;
        // Bonus tipine göre alt kırılımları da güncellemek iyi olabilir
        await user.save({ session });
      }
    }

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}