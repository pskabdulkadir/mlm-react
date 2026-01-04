import express from 'express';
import mongoose from 'mongoose';
import { User } from '../lib/User';
import { Wallet } from '../lib/wallet';
import { WalletTransaction } from '../lib/WalletTransaction';
import { calculateCommissionByAdmin } from '../lib/admin-commission-service';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * POST /api/test-e2e/run
 * Runs a full E2E test:
 * 1. Creates a sponsor chain (GrandSponsor -> Sponsor -> User)
 * 2. Simulates a package purchase by User
 * 3. Calculates commissions
 * 4. Returns the wallet states of all involved users
 */
router.post('/run', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const prefix = `test-${Date.now()}`;

    // 1. Create Users
    const grandSponsorId = `${prefix}-grand`;
    const sponsorId = `${prefix}-sponsor`;
    const userId = `${prefix}-user`;

    // Grand Sponsor (ELITE Package - High limits)
    await User.create([{
      _id: grandSponsorId,
      email: `${grandSponsorId}@test.com`,
      package: 'ELITE',
      isActive: true,
      wallet: { balance: 0, totalEarnings: 0, dailyEarnings: 0, monthlyEarnings: 0 }
    }], { session });

    // Sponsor (BASIC Package - Low limits to test capping)
    await User.create([{
      _id: sponsorId,
      email: `${sponsorId}@test.com`,
      sponsorId: grandSponsorId,
      package: 'BASIC', // Daily limit: 200
      isActive: true,
      wallet: { balance: 0, totalEarnings: 0, dailyEarnings: 0, monthlyEarnings: 0 }
    }], { session });

    // User (Purchaser)
    await User.create([{
      _id: userId,
      email: `${userId}@test.com`,
      sponsorId: sponsorId,
      package: 'NONE',
      isActive: true,
      wallet: { balance: 0, totalEarnings: 0, dailyEarnings: 0, monthlyEarnings: 0 }
    }], { session });

    await session.commitTransaction();
    session.endSession();

    // 2. Simulate Purchase & Calculate Commission
    // User buys a package worth $5000
    // Sponsor (Level 1) gets 10% = $500. But BASIC daily limit is $200. Expect $200 PAID, $300 HELD.
    // Grand Sponsor (Level 2) gets 5% = $250. ELITE limit is high. Expect $250 PAID.
    
    const purchaseAmount = 5000;
    const packageId = 'pkg-elite-test';

    const result = await calculateCommissionByAdmin(
      userId,
      packageId,
      purchaseAmount,
      'system-test'
    );

    // 3. Fetch Results
    const sponsorWallet = await User.findById(sponsorId);
    const grandSponsorWallet = await User.findById(grandSponsorId);
    
    const sponsorTx = await WalletTransaction.find({ userId: sponsorId });
    const grandSponsorTx = await WalletTransaction.find({ userId: grandSponsorId });

    res.json({
      success: true,
      scenario: "User buys $5000 package. Sponsor (BASIC) should be capped at $200. GrandSponsor (ELITE) should get full $250.",
      results: {
        distribution: result,
        sponsor: {
          id: sponsorId,
          package: 'BASIC',
          wallet: sponsorWallet?.wallet,
          transactions: sponsorTx
        },
        grandSponsor: {
          id: grandSponsorId,
          package: 'ELITE',
          wallet: grandSponsorWallet?.wallet,
          transactions: grandSponsorTx
        }
      }
    });

  } catch (error: any) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    console.error("E2E Test failed:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;