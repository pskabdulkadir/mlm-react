import mongoose from 'mongoose';
import { UserModel } from './models'; // Use User model as Wallet
import { WalletTransaction } from './WalletTransaction';
import { WalletTxType } from '../../shared/mlm-types';

export async function creditWallet(
  userId: string,
  amount: number,
  type: WalletTxType,
  description?: string,
  reference?: string,
  existingSession?: mongoose.ClientSession
) {
  const session = existingSession || await mongoose.startSession();

  try {
    if (!existingSession) {
      session.startTransaction();
    }
    // Cüzdanı bul veya oluştur (Atomic işlem içinde)
    let user = await UserModel.findOne({ id: userId }).session(session || null);

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // Bakiyeyi güncelle
    user.wallet.balance += amount;
    if (amount > 0) {
      user.wallet.totalEarnings += amount;
    }
    await user.save({ session });

    // İşlem kaydını oluştur
    const tx = new WalletTransaction({
      userId,
      amount,
      type,
      description,
      reference
    });
    await tx.save({ session });

    if (!existingSession) {
      await session.commitTransaction();
    }
    return { success: true };

  } catch (err) {
    if (!existingSession) {
      await session.abortTransaction();
    }
    console.error('Wallet transaction failed:', err);
    throw err;
  } finally {
    if (!existingSession) {
      session.endSession();
    }
  }
}