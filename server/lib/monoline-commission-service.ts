import mongoose from 'mongoose';
import { User as IUser, MonolineMLMSettings, MonolineCommissionStructure, MonolineCommissionTransaction, PassiveIncomeDistribution } from '../../shared/mlm-types';
import { UserModel as User } from './models';
import { applyWalletTransactions } from './wallet-transaction.service';
import {
  MONOLINE_LEVEL_COMMISSIONS,
  MAX_MONOLINE_LEVEL
} from './commission';

type SponsorLevel = {
  userId: string;
  level: number;
};

export class MonolineCommissionService {

  // Zinciri yukarı doğru tarar ve sponsorları listeler
  static async getMonolineUpline(
  userId: string,
  session?: mongoose.ClientSession
): Promise<SponsorLevel[]> {

  const sponsors: SponsorLevel[] = [];

  let currentUser = await User.findById(userId).session(session || null);
  let level = 1;

  while (
    currentUser?.sponsorId &&
    level <= MAX_MONOLINE_LEVEL
  ) {
    const sponsor = await User.findById(currentUser.sponsorId).session(session || null);
    if (!sponsor) break;

    sponsors.push({
      userId: sponsor._id.toString(),
      level
    });

    currentUser = sponsor;
    level++;
  }

  return sponsors;
}

  // Admin servisi için alias fonksiyon (Net isimlendirme)
  static async getMonolineChain(
  userId: string,
  levels: number = 5
): Promise<SponsorLevel[]> {
  // Mevcut mantığı kullan, ancak seviye sınırını parametreye göre ayarla
  // Not: getMonolineUpline şu an MAX_MONOLINE_LEVEL sabitini kullanıyor.
  // Eğer dinamik seviye gerekirse getMonolineUpline güncellenebilir.
  return MonolineCommissionService.getMonolineUpline(userId);
}

  // Komisyonu hesaplar ve cüzdanlara dağıtır
  static async distributeMonolineCommission(
  sourceUserId: string,
  baseAmount: number,
  reference?: string,
  session?: mongoose.ClientSession
) {
  const upline = await MonolineCommissionService.getMonolineUpline(sourceUserId, session);
  const transactions = [];

  for (const sponsor of upline) {

    const levelConfig = MONOLINE_LEVEL_COMMISSIONS
      .find(l => l.level === sponsor.level);

    if (!levelConfig) continue;

    const sponsorUser = await User.findById(sponsor.userId).session(session || null);
    if (!sponsorUser) continue;

    // ❌ PASİF / ÜYELİKSİZ KULLANICI ALAMAZ
    if (!sponsorUser.isActive || sponsorUser.membershipType === 'NONE' || sponsorUser.membershipType === 'free') {
      continue;
    }

    const commissionAmount =
      (baseAmount * levelConfig.percent) / 100;

    if (commissionAmount <= 0) continue;

    transactions.push({
      userId: sponsor.userId,
      amount: commissionAmount,
      type: 'CAREER', // Monoline kazancı kariyer/level kazancıdır
      reference: reference || `MONO-${Date.now()}`,
      description: `Seviye ${sponsor.level} monoline komisyonu`
    });
  }

  // Toplu işlem uygula (Transaction güvenliği ile)
  if (transactions.length > 0) {
    await applyWalletTransactions(transactions);
  }
}

  // STUB METHODS to fix build errors. Logic needs to be implemented.

  static getDefaultMonolineSettings(): MonolineMLMSettings {
    console.warn("STUB: MonolineCommissionService.getDefaultMonolineSettings called");
    return {
      isEnabled: true,
      productPrice: 20,
      commissionStructure: this.getDefaultCommissionStructure(),
      membershipRequirements: {
        initialPurchase: { minimumAmount: 100, minimumUnits: 5 },
        monthlyActivity: { minimumAmount: 20, minimumUnits: 1 },
        annualActivity: { minimumAmount: 200, minimumUnits: 10 },
      },
      passiveIncomeSettings: {
        minimumActiveMembers: 10,
        distributionFrequency: 'monthly',
        lastDistribution: new Date(),
        totalPoolAmount: 0,
      },
      activityRequirements: {
        monthly: { amount: 20, units: 1 },
        annual: { amount: 200, units: 10 },
        initial: { amount: 100, units: 5 },
      },
      levelRequirements: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static getDefaultCommissionStructure(): MonolineCommissionStructure {
    console.warn("STUB: MonolineCommissionService.getDefaultCommissionStructure called");
    return {
      productPrice: 20,
      directSponsorBonus: { percentage: 15, amount: 3 },
      depthCommissions: {
        level1: { percentage: 12.5, amount: 2.5 },
        level2: { percentage: 7.5, amount: 1.5 },
        level3: { percentage: 5.0, amount: 1.0 },
        level4: { percentage: 3.5, amount: 0.7 },
        level5: { percentage: 2.5, amount: 0.5 },
        level6: { percentage: 2.0, amount: 0.4 },
        level7: { percentage: 1.5, amount: 0.3 },
        totalPercentage: 39.5,
        totalAmount: 7.9
      },
      passiveIncomePool: { percentage: 0.5, amount: 0.1, distribution: 'equal_among_active' },
      companyFund: { percentage: 45, amount: 9 }
    };
  }

  static async calculateMonolineCommissions(
    buyerId: string,
    productPrice: number,
    allUsers: IUser[],
    commissionStructure?: MonolineCommissionStructure
  ): Promise<{ transactions: MonolineCommissionTransaction[], totalDistributed: number, passivePoolAmount: number, companyFundAmount: number }> {
    const structure = commissionStructure || MonolineCommissionService.getDefaultCommissionStructure();

    const transactions: MonolineCommissionTransaction[] = [];
    let totalDistributed = 0;

    // Direct sponsor bonus
    const buyer = allUsers.find(u => u.id === buyerId);
    if (buyer && buyer.sponsorId) {
      const sponsor = allUsers.find(u => u.id === buyer.sponsorId);
      if (sponsor && sponsor.isActive && sponsor.membershipType !== 'NONE' && sponsor.membershipType !== 'free') {
        const amt = Math.round((productPrice * (structure.directSponsorBonus.percentage / 100)) * 100) / 100;
        if (amt > 0) {
          transactions.push({ id: `mct-${Date.now()}-${Math.random().toString(36).slice(2,8)}`, userId: sponsor.id, recipientId: sponsor.id, amount: amt, type: 'direct', reference: `DIRECT-${Date.now()}`, description: 'Direct sponsor bonus', createdAt: new Date(), status: 'pending' });
          totalDistributed += amt;
        }
      }
    }

    // Depth commissions from buyer upline
    const depth = structure.depthCommissions;
    const levelKeys: Array<keyof typeof depth> = ['level1','level2','level3','level4','level5','level6','level7'] as any;

    // Build upline list from allUsers
    const upline: IUser[] = [];
    let cur = buyer;
    for (let i = 0; i < levelKeys.length && cur; i++) {
      if (!(cur as any).sponsorId) break;
      const sup = allUsers.find(u => u.id === (cur as any).sponsorId);
      if (!sup) break;
      upline.push(sup);
      cur = sup;
    }

    for (let i = 0; i < upline.length; i++) {
      const lvlKey = levelKeys[i];
      const cfg = (depth as any)[lvlKey];
      if (!cfg) continue;
      const recipient = upline[i];
      if (!recipient || !recipient.isActive || recipient.membershipType === 'NONE' || recipient.membershipType === 'free') continue;
      const amt = Math.round((productPrice * (cfg.percentage / 100)) * 100) / 100;
      if (amt <= 0) continue;
      transactions.push({ id: `mct-${Date.now()}-${Math.random().toString(36).slice(2,8)}`, userId: recipient.id, recipientId: recipient.id, amount: amt, type: 'depth', reference: `DEPTH-${i+1}-${Date.now()}`, description: `Depth level ${i+1} commission`, createdAt: new Date(), status: 'pending', level: i+1 });
      totalDistributed += amt;
    }

    // Passive income pool and company fund
    const passivePoolAmount = Math.round((productPrice * (structure.passiveIncomePool.percentage / 100)) * 100) / 100;
    const companyFundAmount = Math.round((productPrice * (structure.companyFund.percentage / 100)) * 100) / 100;

    return { transactions, totalDistributed, passivePoolAmount, companyFundAmount };
  }

  static async processCommissionTransaction(transaction: MonolineCommissionTransaction, recipient: IUser): Promise<IUser> {
    // Apply to recipient locally (caller should persist/update DB)
    recipient.wallet = recipient.wallet || { balance: 0, totalEarnings: 0, sponsorBonus: 0, careerBonus: 0, passiveIncome: 0, leadershipBonus: 0 };
    recipient.wallet.balance = (recipient.wallet.balance || 0) + transaction.amount;
    recipient.wallet.totalEarnings = (recipient.wallet.totalEarnings || 0) + transaction.amount;
    return recipient;
  }

  static calculatePassiveIncomeDistribution(poolAmount: number, activeUsers: IUser[]): PassiveIncomeDistribution {
    console.warn("STUB: MonolineCommissionService.calculatePassiveIncomeDistribution called");
    const amountPerMember = activeUsers.length > 0 ? poolAmount / activeUsers.length : 0;
    return {
      id: new mongoose.Types.ObjectId().toString(),
      totalPool: poolAmount,
      activeMembers: activeUsers.length,
      amountPerMember,
      distributionDate: new Date(),
      recipients: activeUsers.map(u => ({ userId: u.id, memberId: u.memberId, amount: amountPerMember, status: 'pending' })),
    };
  }

  static getMonolineNetworkStats(allUsers: IUser[]): any {
    const totalMembers = allUsers.length;
    const activeMembers = allUsers.filter(u => u.isActive).length;
    const totalSales = (allUsers as any[]).reduce((sum, u) => sum + ((u.totalInvestment || 0)), 0);
    return { totalMembers, activeMembers, totalSales };
  }

  static async simulateSalesTransaction(buyerId: string, productUnits: number, allUsers: IUser[]): Promise<any> {
    const productPrice = MonolineCommissionService.getDefaultCommissionStructure().productPrice || 0;
    const unitPrice = productUnits > 0 ? productPrice * productUnits : productPrice;
    const calc = await MonolineCommissionService.calculateMonolineCommissions(buyerId, unitPrice, allUsers);
    const results: any[] = [];
    for (const tx of calc.transactions) {
      const recipient = allUsers.find(u => u.id === tx.recipientId);
      if (recipient) {
        const updated = await MonolineCommissionService.processCommissionTransaction(tx, recipient);
        results.push({ recipientId: recipient.id, amount: tx.amount });
      }
    }
    return { message: 'Simulation complete', distributed: calc.totalDistributed, passivePool: calc.passivePoolAmount, companyFund: calc.companyFundAmount, details: results };
  }

  static validateInitialMembership(purchaseAmount: number): any {
    console.warn("STUB: MonolineCommissionService.validateInitialMembership called");
    return { isValid: purchaseAmount >= 100 };
  }

  static checkUserActivity(user: IUser, sales: { monthlySales: number, annualSales: number }): any {
    console.warn("STUB: MonolineCommissionService.checkUserActivity called");
    return { isActive: true };
  }
}
