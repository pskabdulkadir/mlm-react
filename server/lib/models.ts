import mongoose, { Schema, Document, Model } from "mongoose";
import { User as IUser, CareerLevel as ICareerLevel, MembershipPackage as IMembershipPackage, PointsSystem as IPointsSystem, Wallet as IWallet } from "../../shared/mlm-types";

// Document interfaces that extend the base interfaces with Mongoose's Document
interface IUserDocument extends Omit<IUser, 'id'>, Document {}
interface ICareerLevelDocument extends Omit<ICareerLevel, 'id'>, Document {}
interface IMembershipPackageDocument extends Omit<IMembershipPackage, 'id'>, Document {}

// --- CareerLevel ---
const CareerLevelSchema = new Schema<ICareerLevelDocument>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  displayName: { type: String, required: true },
  description: { type: String },
  minInvestment: { type: Number, default: 0 },
  minDirectReferrals: { type: Number, default: 0 },
  personalSalesPoints: { type: Number, default: 0 },
  teamSalesPoints: { type: Number, default: 0 },
  commissionRate: { type: Number, default: 0 },
  order: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  level: { type: Number, default: 1 },
  passiveIncomeRate: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },
  requirements: {
    personalSalesPoints: { type: Number, default: 0 },
    teamSalesPoints: { type: Number, default: 0 },
    directReferrals: { type: Number, default: 0 },
    minimumMonthlyPoints: { type: Number, default: 0 },
  },
  benefits: {
    directSalesCommission: { type: Number, default: 0 },
    teamBonusRate: { type: Number, default: 0 },
    monthlyBonus: { type: Number, default: 0 },
    rankBonus: { type: Number, default: 0 },
  },
});

// --- PointsSystem ---
const PointsSystemSchema = new Schema<IPointsSystem>({
  personalSalesPoints: { type: Number, default: 0 },
  teamSalesPoints: { type: Number, default: 0 },
  directReferrals: { type: Number, default: 0 },
  minimumMonthlyPoints: { type: Number, default: 0 },
  registrationPoints: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  monthlyPoints: { type: Number, default: 0 },
  lastPointUpdate: { type: Date },
});

// --- Wallet ---
const WalletSchema = new Schema<IWallet>({
    balance: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    sponsorBonus: { type: Number, default: 0 },
    careerBonus: { type: Number, default: 0 },
    passiveIncome: { type: Number, default: 0 },
    leadershipBonus: { type: Number, default: 0 },
});

// --- User ---
const UserSchema = new Schema<IUserDocument>({
  id: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user", "moderator"], default: "user" },
  membershipType: { type: String, enum: ["entry", "monthly", "yearly", "free"], default: "entry" },
  membershipStartDate: { type: Date, default: Date.now },
  pointsSystem: { type: PointsSystemSchema, default: {} },
  careerLevel: { type: CareerLevelSchema, required: true },
  cloneStoreEnabled: { type: Boolean, default: false },
  cloneStoreName: { type: String },
  cloneStoreDescription: { type: String },
  cloneStoreTheme: { type: String },
  leftChild: { type: String },
  rightChild: { type: String },
  sponsorId: { type: String },
  isActive: { type: Boolean, default: false },
  wallet: { type: WalletSchema, required: true },
  kycStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  twoFactorEnabled: { type: Boolean, default: false },
  memberId: { type: String },
  lastActivityDate: { type: Date },
  monthlyActivityStreak: { type: Number, default: 0 },
  yearlyRenewalDate: { type: Date },
  nextRenewalWarning: { type: Date },
  monthlyActivityStatus: { type: String, enum: ["active", "inactive", "warning"] },
  totalInvestment: { type: Number, default: 0 },
  directReferrals: { type: Number, default: 0 },
  totalTeamSize: { type: Number, default: 0 },
  monthlySalesVolume: { type: Number, default: 0 },
  annualSalesVolume: { type: Number, default: 0 },
  referralCode: { type: String, required: true },
  lastLoginDate: { type: Date },
  lastPaymentDate: { type: Date },
  receiptFile: { type: String },
  receiptUploadedAt: { type: Date },
  receiptVerified: { type: Boolean, default: false },
  membershipEndDate: { type: Date },
  registrationDate: { type: Date, default: Date.now },
  daysSinceLastActivity: { type: Number, default: 0 },
});

// --- MembershipPackage ---
const MembershipPackageSchema = new Schema<IMembershipPackage>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  duration: { type: Number, required: true },
  type: { type: String, enum: ["entry", "monthly", "yearly"], required: true },
  features: [{ type: String }],
  currency: { type: String, default: "USD" },
  bonusPercentage: { type: Number, default: 0 },
  commissionRate: { type: Number, default: 0 },
});

export const UserModel: Model<IUserDocument> = mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);
export const CareerLevelModel: Model<ICareerLevelDocument> =
  mongoose.models.CareerLevel || mongoose.model<ICareerLevelDocument>("CareerLevel", CareerLevelSchema);
export const MembershipPackageModel: Model<IMembershipPackageDocument> =
  mongoose.models.MembershipPackage || mongoose.model<IMembershipPackageDocument>("MembershipPackage", MembershipPackageSchema);