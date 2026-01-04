import cron from 'node-cron';
import mongoose from 'mongoose';
import { WalletTransaction } from '../WalletTransaction';
import { User } from '../User';

/**
 * Otomatik Reset İşlemleri
 * 1. Aylık Reset (Her ayın 1'i 00:00): Aylık limitleri sıfırlar, HELD kazançları serbest bırakır.
 * 2. Günlük Reset (Her gün 00:00): Günlük limitleri sıfırlar.
 */
export const monthlyResetJob = () => {
  
  // 📅 AYLIK RESET (Her ayın 1. günü saat 00:00)
  cron.schedule('0 0 1 * *', async () => {
    console.log('📅 Aylık reset job started');
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1️⃣ Kullanıcı bazlı aylık kazanç sayaçlarını sıfırla
      await User.updateMany({}, { $set: { 'wallet.monthlyEarnings': 0 } }).session(session);
      console.log('✅ Monthly earnings counters reset');

      // 2️⃣ HELD (Bekleyen) kazançları kontrol et ve serbest bırak
      const heldTx = await WalletTransaction.find({ status: 'HELD' }).session(session);
      
      for (const tx of heldTx) {
        const user = await User.findById(tx.userId).session(session);
        if (user) {
          // Cüzdan bakiyesine ekle (Limit kontrolü yapmadan, çünkü yeni ay başladı)
          user.wallet.balance += tx.amount;
          user.wallet.totalEarnings += tx.amount;
          
          // İlgili bonus tipine göre güncelle
          if (tx.type === 'SPONSOR') user.wallet.sponsorBonus += tx.amount;
          if (tx.type === 'CAREER') user.wallet.careerBonus += tx.amount;
          if (tx.type === 'LEADERSHIP') user.wallet.leadershipBonus += tx.amount;

          await user.save({ session });

          // Transaction durumunu güncelle
          tx.status = 'PAID';
          tx.description = (tx.description || '') + ' [Aylık Reset ile Serbest Bırakıldı]';
          await tx.save({ session });
          
          console.log(`Released HELD transaction: ${tx._id} for user ${user._id}`);
        }
      }

      await session.commitTransaction();
      console.log(`✅ Monthly reset completed. ${heldTx.length} transactions released.`);

    } catch (err) {
      await session.abortTransaction();
      console.error('❌ Monthly reset failed:', err);
    } finally {
      session.endSession();
    }
  });

  // 📅 GÜNLÜK RESET (Her gün saat 00:00)
  // Günlük limit sayaçlarını sıfırlar
  cron.schedule('0 0 * * *', async () => {
    console.log('📅 Günlük reset job started');
    try {
      await User.updateMany({}, { $set: { 'wallet.dailyEarnings': 0 } });
      console.log('✅ Daily earnings counters reset');
    } catch (err) {
      console.error('❌ Daily reset failed:', err);
    }
  });

  console.log('⏰ Cron jobs initialized: Monthly & Daily Reset');
};