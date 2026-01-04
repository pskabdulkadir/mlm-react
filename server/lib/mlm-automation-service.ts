import { User } from '../../shared/mlm-types';
import {
  getCareerLevel,
  calculateSponsorBonus,
  calculatePassiveIncome,
  careerLevels,
  isActiveMember,
  calculateActiveFee,
  distributeIncome,
  CareerLevel,
  passiveRates
} from '../../shared/mlmRules';
import { mlmDb } from './mlm-database';

export class MLMAutomationService {
  /**
   * Automatically update user career levels based on current metrics
   */
  static async updateUserCareerLevels(users: User[]): Promise<User[]> {
    const updatedUsers: User[] = [];
    
    for (const user of users) {
      if (!user.isActive) continue;
      
      const newCareerLevel = getCareerLevel({
        teamSize: user.totalTeamSize || 0,
        totalInvestment: user.totalInvestment || 0
      });
      
      const currentLevel = (user.careerLevel as any)?.name || 'Emmare';
      
      if (newCareerLevel !== currentLevel) {
        // Career level changed - update and log
        const careerDetails = careerLevels[newCareerLevel];
        
        user.careerLevel = {
          id: Object.keys(careerLevels).indexOf(newCareerLevel),
          name: newCareerLevel,
          description: `${newCareerLevel} seviyesi`,
          minInvestment: careerDetails.requiredInvestment,
          minDirectReferrals: careerDetails.requiredTeam,
          commissionRate: careerDetails.bonusPercent,
          passiveIncomeRate: passiveRates[newCareerLevel] || 0,
          bonus: careerDetails.bonusPercent * 10, // Promotion bonus
          requirements: [
            `${careerDetails.requiredTeam} ekip üyesi`,
            `$${careerDetails.requiredInvestment} yatırım`
          ]
        } as any;
        
        updatedUsers.push(user);
      }
    }
    
    return updatedUsers;
  }

  /**
   * Calculate and distribute passive income based on MLM rules
   */
  static async distributePassiveIncome(users: User[]): Promise<{
    distributions: Array<{ userId: string; amount: number; reason: string }>;
    totalDistributed: number;
  }> {
    const distributions: Array<{ userId: string; amount: number; reason: string }> = [];
    let totalDistributed = 0;

    // Group users by sponsor to calculate passive income from downline
    const sponsorMap = new Map<string, User[]>();
    
    for (const user of users) {
      if (user.sponsorId && user.isActive) {
        if (!sponsorMap.has(user.sponsorId)) {
          sponsorMap.set(user.sponsorId, []);
        }
        sponsorMap.get(user.sponsorId)!.push(user);
      }
    }

    // Calculate passive income for each sponsor
    for (const [sponsorId, downlineUsers] of sponsorMap.entries()) {
      const sponsor = users.find(u => u.id === sponsorId);
      if (!sponsor || !sponsor.isActive) continue;

      const sponsorCareer = (sponsor.careerLevel as any)?.name as CareerLevel || 'Emmare';
      
      // Sum total investment of downline
      const totalDownlineInvestment = downlineUsers.reduce((sum, u) => sum + (u.totalInvestment || 0), 0);
      
      if (totalDownlineInvestment > 0) {
        const passiveAmount = calculatePassiveIncome({
          career: sponsorCareer
        }, totalDownlineInvestment);

        if (passiveAmount > 0) {
          distributions.push({
            userId: sponsorId,
            amount: passiveAmount,
            reason: `Passive income from ${downlineUsers.length} downline members (${sponsorCareer})`
          });
          totalDistributed += passiveAmount;
        }
      }
    }

    return { distributions, totalDistributed };
  }

  /**
   * Check and enforce activity requirements
   */
  static async enforceActivityRequirements(users: User[]): Promise<{
    deactivatedUsers: string[];
    warningUsers: string[];
  }> {
    const deactivatedUsers: string[] = [];
    const warningUsers: string[] = [];
    const now = new Date();

    for (const user of users) {
      if (!user.isActive || !user.membershipEndDate) continue;

      const membershipEnd = new Date(user.membershipEndDate);
      const daysUntilExpiry = Math.floor((membershipEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Deactivate if membership expired
      if (daysUntilExpiry <= 0) {
        deactivatedUsers.push(user.id);
      }
      // Warn if expiring soon
      else if (daysUntilExpiry <= 7) {
        warningUsers.push(user.id);
      }
    }

    return { deactivatedUsers, warningUsers };
  }

  /**
   * Calculate commission from a transaction and distribute to network
   */
  static async calculateNetworkCommissions(
    transactionAmount: number,
    buyerId: string,
    users: User[]
  ): Promise<{
    commissions: Array<{ userId: string; amount: number; level: number; type: string }>;
    totalDistributed: number;
  }> {
    const commissions: Array<{ userId: string; amount: number; level: number; type: string }> = [];
    let totalDistributed = 0;

    const buyer = users.find(u => u.id === buyerId);
    if (!buyer) return { commissions, totalDistributed };

    // Walk up the sponsor chain
    let currentUser = buyer;
    let level = 1;
    const maxLevels = 7;

    while (currentUser.sponsorId && level <= maxLevels) {
      const sponsor = users.find(u => u.id === currentUser.sponsorId);
      if (!sponsor || !sponsor.isActive) break;

      const sponsorCareer = (sponsor.careerLevel as any)?.name as CareerLevel || 'Emmare';
      
      // Calculate commission based on career level
      const commissionAmount = calculateSponsorBonus(
        { isActive: sponsor.isActive, career: sponsorCareer },
        transactionAmount
      );

      if (commissionAmount > 0) {
        commissions.push({
          userId: sponsor.id,
          amount: commissionAmount,
          level: level,
          type: level === 1 ? 'sponsor_bonus' : 'career_commission'
        });
        totalDistributed += commissionAmount;
      }

      currentUser = sponsor;
      level++;
    }

    return { commissions, totalDistributed };
  }

  /**
   * Run complete MLM automation cycle
   */
  static async runAutomationCycle(): Promise<{
    success: boolean;
    careerUpdates: number;
    passiveDistributions: number;
    activityEnforcements: number;
    errors: string[];
  }> {
    const errors: string[] = [];

    try {
      const db = await mlmDb;
      await db.db.read();

      const users = db.db.data.users as User[];

      // 1. Update career levels
      let careerUpdates = 0;
      const updatedCareerUsers = await this.updateUserCareerLevels(users);
      for (const user of updatedCareerUsers) {
        const idx = users.findIndex(u => u.id === user.id);
        if (idx !== -1) {
          users[idx] = user;
          careerUpdates++;
        }
      }

      // 2. Enforce activity requirements
      let activityEnforcements = 0;
      const activityCheck = await this.enforceActivityRequirements(users);
      for (const userId of activityCheck.deactivatedUsers) {
        const idx = users.findIndex(u => u.id === userId);
        if (idx !== -1) {
          users[idx].isActive = false;
          users[idx].monthlyActivityStatus = 'inactive';
          activityEnforcements++;
        }
      }

      // 3. Distribute passive income
      let passiveDistributions = 0;
      const passiveIncome = await this.distributePassiveIncome(users);
      for (const dist of passiveIncome.distributions) {
        const user = users.find(u => u.id === dist.userId);
        if (user) {
          user.wallet.passiveIncome = (user.wallet.passiveIncome || 0) + dist.amount;
          user.wallet.totalEarnings = (user.wallet.totalEarnings || 0) + dist.amount;
          passiveDistributions++;
        }
      }

      // Save updates
      await db.db.write();

      return {
        success: true,
        careerUpdates,
        passiveDistributions,
        activityEnforcements,
        errors
      };
    } catch (error) {
      errors.push((error as any).message || 'Unknown error');
      return {
        success: false,
        careerUpdates: 0,
        passiveDistributions: 0,
        activityEnforcements: 0,
        errors
      };
    }
  }
}
