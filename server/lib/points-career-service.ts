import { User, CareerLevel, Transaction, PointsSystem } from '../../shared/mlm-types';

export interface PointTransaction {
  id: string;
  userId: string;
  type: string;
  points: number;
  source: {
    type: string;
    sourceId?: string;
    description: string;
    amount?: number;
  };
  timestamp: Date;
}

export interface CareerProgress {
  currentLevel: CareerLevel;
  nextLevel?: CareerLevel;
  progress: any;
  canUpgrade: boolean;
  nextLevelRequirements?: string[];
}

export class PointsCareerService {
  // Default career levels configuration
  static getDefaultCareerLevels(): CareerLevel[] {
    return [
      {
        id: 'emmare',
        name: 'emmare',
        displayName: 'Temel Üye (Emmare)',
        description: 'Temel seviye üyelik',
        minInvestment: 0,
        minDirectReferrals: 0,
        personalSalesPoints: 0,
        teamSalesPoints: 0,
        commissionRate: 5,
        level: 1,
        passiveIncomeRate: 0,
        bonus: 0,
        requirements: {
          personalSalesPoints: 0,
          teamSalesPoints: 0,
          directReferrals: 0,
          minimumMonthlyPoints: 0
        },
        benefits: {
          directSalesCommission: 5, // %5
          teamBonusRate: 2, // %2
          monthlyBonus: 0,
          rankBonus: 0
        },
        order: 1,
        isActive: true
      },
      {
        id: 'silver',
        name: 'silver',
        displayName: 'Gümüş Üye',
        description: 'Gümüş seviye üyelik',
        minInvestment: 100,
        minDirectReferrals: 3,
        personalSalesPoints: 500,
        teamSalesPoints: 1000,
        commissionRate: 8,
        level: 2,
        passiveIncomeRate: 1,
        bonus: 100,
        requirements: {
          personalSalesPoints: 500,
          teamSalesPoints: 1000,
          directReferrals: 3,
          minimumMonthlyPoints: 100
        },
        benefits: {
          directSalesCommission: 8, // %8
          teamBonusRate: 4, // %4
          monthlyBonus: 50,
          rankBonus: 100
        },
        order: 2,
        isActive: true
      },
      {
        id: 'gold',
        name: 'gold',
        displayName: 'Altın Üye',
        description: 'Altın seviye üyelik',
        minInvestment: 500,
        minDirectReferrals: 5,
        personalSalesPoints: 1500,
        teamSalesPoints: 5000,
        commissionRate: 12,
        level: 3,
        passiveIncomeRate: 2,
        bonus: 300,
        requirements: {
          personalSalesPoints: 1500,
          teamSalesPoints: 5000,
          directReferrals: 5,
          minimumMonthlyPoints: 300
        },
        benefits: {
          directSalesCommission: 12, // %12
          teamBonusRate: 6, // %6
          monthlyBonus: 150,
          rankBonus: 300
        },
        order: 3,
        isActive: true
      },
      {
        id: 'platinum',
        name: 'platinum',
        displayName: 'Platin Üye',
        description: 'Platin seviye üyelik',
        minInvestment: 1000,
        minDirectReferrals: 10,
        personalSalesPoints: 3000,
        teamSalesPoints: 15000,
        commissionRate: 15,
        level: 4,
        passiveIncomeRate: 3,
        bonus: 750,
        requirements: {
          personalSalesPoints: 3000,
          teamSalesPoints: 15000,
          directReferrals: 10,
          minimumMonthlyPoints: 500
        },
        benefits: {
          directSalesCommission: 15, // %15
          teamBonusRate: 8, // %8
          monthlyBonus: 300,
          rankBonus: 750
        },
        order: 4,
        isActive: true
      },
      {
        id: 'diamond',
        name: 'diamond',
        displayName: 'Elmas Üye',
        description: 'Elmas seviye üyelik',
        minInvestment: 2000,
        minDirectReferrals: 15,
        personalSalesPoints: 5000,
        teamSalesPoints: 30000,
        commissionRate: 20,
        level: 5,
        passiveIncomeRate: 5,
        bonus: 1500,
        requirements: {
          personalSalesPoints: 5000,
          teamSalesPoints: 30000,
          directReferrals: 15,
          minimumMonthlyPoints: 800
        },
        benefits: {
          directSalesCommission: 20, // %20
          teamBonusRate: 10, // %10
          monthlyBonus: 500,
          rankBonus: 1500
        },
        order: 5,
        isActive: true
      }
    ];
  }

  // Calculate points for different activities (1 dollar = 1 point)
  static calculatePointsForSale(saleAmount: number, saleType: 'product' | 'membership'): number {
    // 1 dollar = 1 point for all sales
    return Math.floor(saleAmount);
  }

  static calculateTeamSalesPoints(saleAmount: number, level: number): number {
    // Base 1 dollar = 1 point, decreasing by level
    const levelMultipliers = [1.0, 0.5, 0.3, 0.2, 0.1];
    const multiplier = levelMultipliers[level - 1] || 0;
    return Math.floor(saleAmount * multiplier);
  }

  static getRegistrationPoints(): number {
    return 50; // Fixed 50 points for each direct registration
  }

  // Award points for a sale
  static async awardSalePoints(
    buyerUserId: string,
    saleAmount: number,
    saleType: 'product' | 'membership',
    allUsers: User[]
  ): Promise<{ transactions: PointTransaction[], updatedUsers: User[] }> {
    const transactions: PointTransaction[] = [];
    let updatedUsers = [...allUsers];

    const buyer = updatedUsers.find(u => u.id === buyerUserId);
    if (!buyer) {
      throw new Error('Buyer not found');
    }

    // 1. Award personal sales points to buyer
    const personalPoints = this.calculatePointsForSale(saleAmount, saleType);
    transactions.push({
      id: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: buyerUserId,
      type: 'personal_sales',
      points: personalPoints,
      source: {
        type: 'sale',
        description: `${saleType === 'membership' ? 'Üyelik paketi' : 'Ürün'} satışı: $${saleAmount}`,
        amount: saleAmount
      },
      timestamp: new Date()
    });

    // Update buyer's points
    updatedUsers = updatedUsers.map(u => {
      if (u.id === buyerUserId) {
        return {
          ...u,
          pointsSystem: {
            ...u.pointsSystem,
            personalSalesPoints: u.pointsSystem.personalSalesPoints + personalPoints,
            totalPoints: u.pointsSystem.totalPoints + personalPoints,
            monthlyPoints: u.pointsSystem.monthlyPoints + personalPoints,
            lastPointUpdate: new Date()
          }
        };
      }
      return u;
    });

    // 2. Award team sales points to upline
    const uplineChain = this.getUplineChain(buyer, updatedUsers, 5);
    uplineChain.forEach((uplineUser, index) => {
      const level = index + 1;
      const teamPoints = this.calculateTeamSalesPoints(saleAmount, level);
      
      if (teamPoints > 0) {
        transactions.push({
          id: `team_sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: uplineUser.id,
          type: 'team_sales',
          points: teamPoints,
          source: {
            type: 'sale',
            sourceId: buyerUserId,
            description: `${level}. seviye ekip satışı: $${saleAmount}`,
            amount: saleAmount
          },
          timestamp: new Date()
        });

        // Update upline user's points
        updatedUsers = updatedUsers.map(u => {
          if (u.id === uplineUser.id) {
            return {
              ...u,
              pointsSystem: {
                ...u.pointsSystem,
                teamSalesPoints: u.pointsSystem.teamSalesPoints + teamPoints,
                totalPoints: u.pointsSystem.totalPoints + teamPoints,
                monthlyPoints: u.pointsSystem.monthlyPoints + teamPoints,
                lastPointUpdate: new Date()
              }
            };
          }
          return u;
        });
      }
    });

    return { transactions, updatedUsers };
  }

  // Award points for registration
  static async awardRegistrationPoints(
    sponsorUserId: string,
    newUserId: string,
    allUsers: User[]
  ): Promise<{ transactions: PointTransaction[], updatedUsers: User[] }> {
    const transactions: PointTransaction[] = [];
    let updatedUsers = [...allUsers];

    const sponsor = updatedUsers.find(u => u.id === sponsorUserId);
    const newUser = updatedUsers.find(u => u.id === newUserId);
    
    if (!sponsor || !newUser) {
      throw new Error('Sponsor or new user not found');
    }

    const registrationPoints = this.getRegistrationPoints();

    transactions.push({
      id: `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: sponsorUserId,
      type: 'registration',
      points: registrationPoints,
      source: {
        type: 'registration',
        sourceId: newUserId,
        description: `Yeni üye kaydı: ${newUser.fullName}`,
      },
      timestamp: new Date()
    });

    // Update sponsor's points
    updatedUsers = updatedUsers.map(u => {
      if (u.id === sponsorUserId) {
        return {
          ...u,
          pointsSystem: {
            ...u.pointsSystem,
            registrationPoints: u.pointsSystem.registrationPoints + registrationPoints,
            totalPoints: u.pointsSystem.totalPoints + registrationPoints,
            monthlyPoints: u.pointsSystem.monthlyPoints + registrationPoints,
            lastPointUpdate: new Date()
          }
        };
      }
      return u;
    });

    return { transactions, updatedUsers };
  }

  // Check and update career levels
  static checkCareerLevelUpgrade(user: User, careerLevels: CareerLevel[]): {
    shouldUpgrade: boolean;
    newLevel?: CareerLevel;
    oldLevel: CareerLevel;
  } {
    const currentLevel = user.careerLevel;
    const sortedLevels = careerLevels.sort((a, b) => a.order - b.order);
    
    // Find next available level
    const currentLevelIndex = sortedLevels.findIndex(l => l.id === currentLevel.name);
    
    for (let i = currentLevelIndex + 1; i < sortedLevels.length; i++) {
      const nextLevel = sortedLevels[i];
      
      if (this.meetsRequirements(user, nextLevel)) {
        return {
          shouldUpgrade: true,
          newLevel: nextLevel,
          oldLevel: currentLevel
        };
      }
    }

    return {
      shouldUpgrade: false,
      oldLevel: currentLevel
    };
  }

  // Check if user meets requirements for a level
  static meetsRequirements(user: User, level: CareerLevel): boolean {
    const points = user.pointsSystem;
    const req = level.requirements;

    return (
      points.personalSalesPoints >= req.personalSalesPoints &&
      points.teamSalesPoints >= req.teamSalesPoints &&
      user.directReferrals >= req.directReferrals &&
      points.monthlyPoints >= req.minimumMonthlyPoints
    );
  }

  // Get career progress for a user
  static getCareerProgress(user: User, careerLevels: CareerLevel[]): CareerProgress {
    const currentLevel = careerLevels.find(l => l.name === user.careerLevel.name) || careerLevels[0];
    const sortedLevels = careerLevels.sort((a, b) => a.order - b.order);
    const currentIndex = sortedLevels.findIndex(l => l.id === currentLevel.id);
    const nextLevel = currentIndex < sortedLevels.length - 1 ? sortedLevels[currentIndex + 1] : undefined;

    const progress = {
      personalSalesPoints: {
        current: user.pointsSystem.personalSalesPoints,
        required: nextLevel?.requirements.personalSalesPoints || 0,
        percentage: nextLevel ? Math.min(100, (user.pointsSystem.personalSalesPoints / nextLevel.requirements.personalSalesPoints) * 100) : 100
      },
      teamSalesPoints: {
        current: user.pointsSystem.teamSalesPoints,
        required: nextLevel?.requirements.teamSalesPoints || 0,
        percentage: nextLevel ? Math.min(100, (user.pointsSystem.teamSalesPoints / nextLevel.requirements.teamSalesPoints) * 100) : 100
      },
      directReferrals: {
        current: user.directReferrals,
        required: nextLevel?.requirements.directReferrals || 0,
        percentage: nextLevel ? Math.min(100, (user.directReferrals / nextLevel.requirements.directReferrals) * 100) : 100
      },
      monthlyPoints: {
        current: user.pointsSystem.monthlyPoints,
        required: nextLevel?.requirements.minimumMonthlyPoints || 0,
        percentage: nextLevel ? Math.min(100, (user.pointsSystem.monthlyPoints / nextLevel.requirements.minimumMonthlyPoints) * 100) : 100
      }
    };

    const canUpgrade = nextLevel ? this.meetsRequirements(user, nextLevel) : false;

    return {
      currentLevel,
      nextLevel,
      progress,
      canUpgrade,
      nextLevelRequirements: nextLevel ? [
        `${nextLevel.requirements.personalSalesPoints} Kişisel Satış Puanı`,
        `${nextLevel.requirements.teamSalesPoints} Ekip Satış Puanı`,
        `${nextLevel.requirements.directReferrals} Doğrudan Referans`,
        `${nextLevel.requirements.minimumMonthlyPoints} Aylık Puan`
      ] : undefined
    };
  }

  // Calculate bonuses based on career level
  static calculateCareerBonuses(user: User, careerLevels: CareerLevel[]): {
    monthlyBonus: number;
    rankBonus: number;
    totalBonus: number;
  } {
    try {
      // Safely get user's career level
      const userCareerName = user.careerLevel?.name || user.careerLevel || 'emmare';
      const userLevel = careerLevels.find(l => l.name === userCareerName) || careerLevels[0];

      if (!userLevel) {
        return {
          monthlyBonus: 0,
          rankBonus: 0,
          totalBonus: 0
        };
      }

      const monthlyBonus = userLevel.benefits?.monthlyBonus || 0;
      const rankBonus = userLevel.benefits?.rankBonus || 0;

      return {
        monthlyBonus,
        rankBonus,
        totalBonus: monthlyBonus + rankBonus
      };
    } catch (error) {
      console.error('Error calculating career bonuses for user:', user.id, error);
      return {
        monthlyBonus: 0,
        rankBonus: 0,
        totalBonus: 0
      };
    }
  }

  // Reset monthly points (to be called at the beginning of each month)
  static resetMonthlyPoints(users: User[]): User[] {
    return users.map(user => ({
      ...user,
      pointsSystem: {
        ...user.pointsSystem,
        monthlyPoints: 0,
        lastPointUpdate: new Date()
      }
    }));
  }

  // Helper method to get upline chain
  private static getUplineChain(user: User, allUsers: User[], maxLevels: number): User[] {
    const chain: User[] = [];
    let currentUser = user;
    
    for (let i = 0; i < maxLevels; i++) {
      if (!currentUser.sponsorId) break;
      
      const sponsor = allUsers.find(u => u.id === currentUser.sponsorId);
      if (!sponsor) break;
      
      chain.push(sponsor);
      currentUser = sponsor;
    }
    
    return chain;
  }
}

export default PointsCareerService;
