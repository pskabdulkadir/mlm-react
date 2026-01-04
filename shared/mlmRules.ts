export type CareerLevel =
  | 'Emmare'
  | 'Levvame'
  | 'Mülhime'
  | 'Mutmainne'
  | 'Râziye'
  | 'Mardiyye'
  | 'Safiye';

export const ACTIVE_FEES = {
  monthly: 20,
  yearly: 200 * 0.85, // %15 indirimli
};

export function isActiveMember(activeUntil: Date): boolean {
  return activeUntil && activeUntil > new Date();
}

export function calculateActiveFee(type: 'monthly' | 'yearly'): number {
  return ACTIVE_FEES[type] || 0;
}

export function distributeIncome(amount: number) {
  return {
    bonusPool: amount * 0.4,
    systemFund: amount * 0.6,
  };
}

export const careerLevels: Record<CareerLevel, {
  requiredTeam: number;
  requiredInvestment: number;
  bonusPercent: number;
}> = {
  Emmare:     { requiredTeam: 0,  requiredInvestment: 0,     bonusPercent: 2 },
  Levvame:    { requiredTeam: 2,  requiredInvestment: 500,   bonusPercent: 3 },
  Mülhime:    { requiredTeam: 4,  requiredInvestment: 1500,  bonusPercent: 4 },
  Mutmainne:  { requiredTeam: 10, requiredInvestment: 3000,  bonusPercent: 5 },
  Râziye:    { requiredTeam: 2,  requiredInvestment: 5000,  bonusPercent: 6 },
  Mardiyye:   { requiredTeam: 50, requiredInvestment: 10000, bonusPercent: 8 },
  Safiye:     { requiredTeam: 3,  requiredInvestment: 25000, bonusPercent: 12 },
};

export function getCareerLevel(user: {
  teamSize: number;
  totalInvestment: number;
}): CareerLevel {
  const levels = Object.entries(careerLevels);
  for (let i = levels.length - 1; i >= 0; i--) {
    const [level, req] = levels[i];
    if (user.teamSize >= req.requiredTeam && user.totalInvestment >= req.requiredInvestment) {
      return level as CareerLevel;
    }
  }
  return 'Emmare';
}

export function calculateSponsorBonus(sponsor: {
  isActive: boolean;
  career: CareerLevel;
}, amount: number): number {
  if (!sponsor.isActive) return 0;
  const base = amount * 0.10;
  const extra = sponsor.career === 'Safiye' ? base * 0.25 : 0;
  return base + extra;
}

export const passiveRates: Record<CareerLevel, number> = {
  Emmare: 0,
  Levvame: 0.5,
  Mülhime: 1,
  Mutmainne: 1.5,
  Râziye: 2,
  Mardiyye: 3,
  Safiye: 4,
};

export function calculatePassiveIncome(upline: {
  career: CareerLevel;
}, downlineInvestment: number): number {
  const rate = passiveRates[upline.career] || 0;
  return downlineInvestment * (rate / 100);
}

// Automation helpers for system processing
export function shouldUpdateCareerLevel(user: {
  teamSize: number;
  totalInvestment: number;
  currentCareer: CareerLevel;
}): boolean {
  const newLevel = getCareerLevel({ teamSize: user.teamSize, totalInvestment: user.totalInvestment });
  return newLevel !== user.currentCareer;
}

export function calculateCommissionFromInvestment(investment: number, careerLevel: CareerLevel): number {
  const bonusPercent = careerLevels[careerLevel]?.bonusPercent || 0;
  return investment * (bonusPercent / 100);
}

export function calculateMonthlyActiveRequirement(): number {
  return ACTIVE_FEES.monthly;
}

export function calculateYearlyActiveRequirement(): number {
  return ACTIVE_FEES.yearly;
}

export function isQualifiedForPassiveIncome(careerLevel: CareerLevel): boolean {
  return passiveRates[careerLevel] > 0;
}

export function getNextCareerLevelRequirements(currentLevel: CareerLevel): {
  requiredTeam: number;
  requiredInvestment: number;
  bonusPercent: number;
} | null {
  const levels: CareerLevel[] = ['Emmare', 'Levvame', 'Mülhime', 'Mutmainne', 'Râziye', 'Mardiyye', 'Safiye'];
  const currentIndex = levels.indexOf(currentLevel);

  if (currentIndex === -1 || currentIndex >= levels.length - 1) {
    return null;
  }

  const nextLevel = levels[currentIndex + 1];
  return careerLevels[nextLevel];
}
