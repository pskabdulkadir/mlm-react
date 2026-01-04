export interface CareerLevel {
  id: string;
  name: string;
  displayName: string;
  description: string;
  minInvestment: number;
  minDirectReferrals: number;
  personalSalesPoints: number;
  teamSalesPoints: number;
  commissionRate: number;
  order: number;
  isActive: boolean;
  level: number;
  passiveIncomeRate: number;
  bonus: number;
  requirements: {
    personalSalesPoints: number;
    teamSalesPoints: number;
    directReferrals: number;
    minimumMonthlyPoints: number;
  };
  benefits: {
    directSalesCommission: number;
    teamBonusRate: number;
    monthlyBonus: number;
    rankBonus: number;
  };
}

export interface PointsSystem {
  personalSalesPoints: number;
  teamSalesPoints: number;
  directReferrals: number;
  minimumMonthlyPoints: number;
  registrationPoints: number;
  totalPoints: number;
  monthlyPoints: number;
  lastPointUpdate?: Date;
}

export interface Wallet {
  balance: number;
  totalEarnings: number;
  sponsorBonus: number;
  careerBonus: number;
  passiveIncome: number;
  leadershipBonus: number;
}

export type WalletTxType = 'deposit' | 'withdrawal' | 'transfer' | 'commission' | 'bonus' | 'fee' | 'refund';

export interface User {
  id: string;
  name: string;
  fullName: string;
  email: string;
  password: string;
  referralCode: string;
  sponsorId?: string;
  isActive: boolean;

  // Standard membership field
  membershipType: string;

  // Extended fields for compatibility
  phone: string;
  role: string;
  membershipStartDate?: Date;
  registrationDate?: Date;

  // Deprecated: use membershipType instead
  package?: string;
  pointsSystem: PointsSystem;
  careerLevel: CareerLevel;
  cloneStoreEnabled?: boolean;
  cloneStoreName?: string;
  cloneStoreDescription?: string;
  cloneStoreTheme?: string;
  daysSinceLastActivity?: number;
  wallet: Wallet;
  kycStatus?: string;
  twoFactorEnabled?: boolean;
  memberId?: string;
  lastActivityDate?: Date;
  monthlyActivityStreak?: number;
  yearlyRenewalDate?: Date;
  nextRenewalWarning?: Date;
  monthlyActivityStatus?: string;
  totalInvestment: number;
  directReferrals: number;
  totalTeamSize: number;
  monthlySalesVolume?: number;
  annualSalesVolume?: number;
  lastLoginDate?: Date;
  lastPaymentDate?: Date;
  receiptFile?: string;
  receiptUploadedAt?: Date;
  receiptVerified?: boolean;
  membershipEndDate?: Date;
  leftChild?: string;
  rightChild?: string;
}

export interface MembershipPackage {
  id: string;
  name: string;
  price: number;
  description: string;
  duration: number;
  durationDays: number;
  type: string;
  features?: string[];
  currency: string;
  bonusPercentage: number;
  commissionRate: number;
}

export interface Transaction {
    id: string;
    userId: string;
    type: string;
    amount: number;
    description: string;
    status: string;
    date: Date;
    referenceId?: string;
}

export interface PendingPlacement {
    id: string;
    userId: string;
    sponsorId: string;
    position: 'left' | 'right';
    date: Date;
}

// Monoline types
export interface MonolineCommissionStructure {
  productPrice: number;
  directSponsorBonus: { percentage: number; amount: number };
  depthCommissions: {
    level1: { percentage: number; amount: number };
    level2: { percentage: number; amount: number };
    level3: { percentage: number; amount: number };
    level4: { percentage: number; amount: number };
    level5: { percentage: number; amount: number };
    level6: { percentage: number; amount: number };
    level7: { percentage: number; amount: number };
    totalPercentage: number;
    totalAmount: number;
  };
  passiveIncomePool: { percentage: number; amount: number; distribution: string };
  companyFund: { percentage: number; amount: number };
}

export interface MonolineMLMSettings {
  isEnabled: boolean;
  productPrice: number;
  commissionStructure: MonolineCommissionStructure;
  membershipRequirements: any;
  passiveIncomeSettings: any;
  activityRequirements: any;
  levelRequirements: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MonolineCommissionTransaction {
  id?: string;
  userId: string;
  amount: number;
  type: string;
  reference?: string;
  description?: string;
  recipientId?: string;
  createdAt: Date;
  status?: 'pending' | 'processed' | 'inactive' | 'failed';
  processedAt?: Date;
  saleId?: string;
  commissionType?: string;
  level?: number;
}

export interface PassiveIncomeDistribution {
    id: string;
    totalPool: number;
    activeMembers: number;
    amountPerMember: number;
    distributionDate: Date;
    recipients: any[];
}

export const MEMBERSHIP_PACKAGES: MembershipPackage[] = [
  {
    id: "basic",
    name: "Basic",
    price: 100,
    description: "Basic Membership",
    duration: 1,
    durationDays: 30,
    type: "basic",
    currency: "USD",
    bonusPercentage: 5,
    commissionRate: 5
  }
];

export function getCareerLevel(input: number | { totalInvestment?: number; teamSize?: number; directReferrals?: number }): CareerLevel {
  const totalInvestment = typeof input === 'number' ? input : input.totalInvestment || 0;
  const level = totalInvestment >= 10000 ? 5 : totalInvestment >= 5000 ? 4 : totalInvestment >= 2000 ? 3 : totalInvestment >= 500 ? 2 : 1;
  return {
    id: String(level),
    name: level === 1 ? "Nefs-i Emmare" : `Seviye ${level}`,
    displayName: level === 1 ? "Nefs-i Emmare" : `Seviye ${level}`,
    description: "Otomatik belirlenmiş kariyer seviyesi",
    minInvestment: level === 1 ? 0 : (level - 1) * 1000,
    minDirectReferrals: 0,
    personalSalesPoints: 0,
    teamSalesPoints: 0,
    commissionRate: level === 1 ? 2 : 2 + level,
    order: level,
    isActive: true,
    level,
    passiveIncomeRate: 0,
    bonus: 0,
    requirements: {
      personalSalesPoints: 0,
      teamSalesPoints: 0,
      directReferrals: 0,
      minimumMonthlyPoints: 0,
    },
    benefits: {
      directSalesCommission: 0,
      teamBonusRate: 0,
      monthlyBonus: 0,
      rankBonus: 0,
    },
  };
}

export type Role = 'admin' | 'member' | 'leader' | 'visitor' | 'user';

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  originalPrice?: number;
  category?: string;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
}

export interface ProductPurchase {
  id: string;
  productId: string;
  userId?: string;
  buyerId?: string;
  buyerEmail?: string;
  amount: number;
  purchaseAmount?: number;
  referralCode?: string;
  sponsorId?: string;
  status?: string;
  paymentMethod?: string;
  shippingAddress?: ShippingAddress | any;
  purchaseDate?: Date;
  commissionDistributed?: boolean;
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  addressType?: 'home' | 'work' | 'other';
}

export interface ProductCommission {
  id: string;
  purchaseId: string;
  amount: number;
  recipientId: string;
}

export interface LiveBroadcast {
  id: string;
  title: string;
  startAt?: Date;
  endAt?: Date | null;
  endTime?: Date | null;
  isActive?: boolean;
  status?: 'active' | 'inactive' | 'scheduled';
  streamUrl?: string;
  adminId?: string;
  startTime?: Date;
  description?: string;
  platform?: string;
  viewerCount?: number;
  createdAt?: Date;
  lastUpdated?: Date;
}

export type CurrencyType = 'TRY' | 'USD' | 'EUR' | 'BTC' | 'ETH';
export type WalletTransactionType = 'deposit' | 'withdrawal' | 'commission' | 'transfer';
export type PaymentMethodType = 'bank' | 'crypto' | 'pos' | 'manual';

// small helper exported to satisfy some imports; real implementation belongs to service layer
export function calculateCommissions(amount: number) {
  return { total: amount, breakdown: [] };
}
