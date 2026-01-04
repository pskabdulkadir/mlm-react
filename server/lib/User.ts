import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // String ID desteği (örn: "admin-001")
  
  email: String,

  sponsorId: {
    type: String, // ObjectId yerine String kullanıyoruz
    ref: 'User',
    default: null
  },

  isActive: {
    type: Boolean,
    default: true
  },

  package: {
    type: String,
    enum: ['NONE', 'BASIC', 'PRO', 'ELITE'],
    default: 'NONE'
  },

  wallet: {
    balance: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    sponsorBonus: { type: Number, default: 0 },
    careerBonus: { type: Number, default: 0 },
    leadershipBonus: { type: Number, default: 0 },
    dailyEarnings: { type: Number, default: 0 },
    monthlyEarnings: { type: Number, default: 0 }
  }

}, { timestamps: true });

// Model zaten varsa onu kullan, yoksa oluştur
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;