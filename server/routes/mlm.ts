import { RequestHandler } from "express";
import { mlmDb } from "../lib/mlm-database";
import {
  generateReferralCode,
  hashPassword,
  verifyPassword,
  calculateSpiritualNumber,
  calculateMembershipExpiry,
  generateAccessToken,
  generateRefreshToken,
} from "../lib/utils";
import {
  User,
  MEMBERSHIP_PACKAGES,
  calculateCommissions,
  getCareerLevel,
} from "../../shared/mlm-types";
import { WalletTransaction } from "../lib/WalletTransaction";
import { CommissionLog } from "../lib/CommissionLog";

// Authentication
export const register: RequestHandler = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      sponsorCode,
      membershipType = "entry",
    } = req.body;

    // Check if user already exists
    const existingUser = await mlmDb.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "Bu email zaten kullanımda" });
    }

    // Find sponsor and prepare for binary placement
    let sponsor: User | undefined;
    let sponsorId: string | undefined;

    if (sponsorCode) {
      sponsor = await mlmDb.getUserByReferralCode(sponsorCode);
      if (!sponsor) {
        return res.status(400).json({ error: "Geçersiz sponsor kodu" });
      }
      sponsorId = sponsor.id;
    } else {
      // Auto-placement: start from admin (root)
      const adminUser = await mlmDb.getUserByEmail(
        "psikologabdulkadirkan@gmail.com",
      );
      if (adminUser) {
        sponsorId = adminUser.id;
      }
    }

    // Create new user
    const referralCode = generateReferralCode(fullName);
    const hashedPassword = await hashPassword(password);

    const newUser: Omit<User, "id" | "registrationDate" | "memberId"> = {
      name: fullName,
      fullName,
      email,
      phone,
      password: hashedPassword,
      role: "user",
      sponsorId: sponsorId, // Direct sponsor assignment for monoline system
      referralCode,
      membershipType: "free", // Start as free, upgrade after payment
      isActive: false,
      pointsSystem: {
        personalSalesPoints: 0,
        teamSalesPoints: 0,
        directReferrals: 0,
        minimumMonthlyPoints: 0,
        registrationPoints: 0,
        totalPoints: 0,
        monthlyPoints: 0,
      },
      careerLevel: {
        id: "1",
        name: "Nefs-i Emmare",
        displayName: "Nefs-i Emmare",
        description: "Giriş seviyesi",
        minInvestment: 0,
        minDirectReferrals: 0,
        personalSalesPoints: 0,
        teamSalesPoints: 0,
        commissionRate: 2,
        order: 1,
        isActive: true,
        level: 1,
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
      },
      totalInvestment: 0,
      directReferrals: 0,
      totalTeamSize: 0,
      monthlySalesVolume: 0,
      annualSalesVolume: 0,
      wallet: {
        balance: 0,
        totalEarnings: 0,
        sponsorBonus: 0,
        careerBonus: 0,
        passiveIncome: 0,
        leadershipBonus: 0,
      },
      kycStatus: "pending",
    };

    const creationResult = await mlmDb.adminCreateUser(newUser);
    if (!creationResult.success || !creationResult.user) {
      return res.status(400).json({ error: (creationResult as any).message || "Kullanıcı oluşturulamadı." });
    }
    const user = creationResult.user;

    // Register monoline placement with sponsor
    if (sponsorId) {
      // Update sponsor's direct referrals count
      const sponsorUser = await mlmDb.getUserById(sponsorId);
      if (sponsorUser) {
        sponsorUser.directReferrals = (sponsorUser.directReferrals || 0) + 1;
        await mlmDb.updateUser(sponsorId, { directReferrals: sponsorUser.directReferrals });
      }
    }

    // Track conversion if user came through a clone page
    if (sponsor) {
      try {
        const db = await mlmDb;
        await db.db.read();
        const clonePageIndex = db.db.data.clonePages.findIndex(
          (page: any) => page.userId === sponsor.id,
        );

        if (clonePageIndex !== -1) {
          db.db.data.clonePages[clonePageIndex].conversionCount =
            (db.db.data.clonePages[clonePageIndex].conversionCount || 0) + 1;
          await db.db.write();
        }
      } catch (error) {
        console.error("Error tracking conversion:", error);
      }
    }

    res.json({
      success: true,
      message: "Kayıt başarılı. Lütfen üyelik paketinizi seçin.",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        referralCode: user.referralCode,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Kayıt sırasında hata oluştu" });
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    console.log("Login request received");

    // Check if request body exists and is properly parsed
    if (!req.body) {
      console.error("Request body is missing");
      return res.status(400).json({ error: "Request body is required" });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      console.error("Missing email or password");
      return res.status(400).json({ error: "Email ve şifre gereklidir" });
    }

    console.log("Looking up user:", email);
    const user = await mlmDb.getUserByEmail(email);
    if (!user) {
      console.log("User not found:", email);
      return res.status(401).json({ error: "Geçersiz email veya şifre" });
    }

    console.log("Verifying password for user:", user.id);
    
    if (!user.password) {
      console.error("User password hash is missing for:", user.id);
      return res.status(500).json({ error: "Kullanıcı verisi hatalı (Şifre bulunamadı)" });
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      console.log("Invalid password for user:", user.id);
      return res.status(401).json({ error: "Geçersiz email veya şifre" });
    }

    console.log("Login successful for user:", user.id);

    // Update last login
    try {
      await mlmDb.updateUser(user.id, { lastLoginDate: new Date() });
    } catch (updateError) {
      console.error("Error updating last login:", updateError);
      // Continue with login even if update fails
    }

    const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    res.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        membershipType: user.membershipType,
        isActive: user.isActive,
        referralCode: user.referralCode,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login error:", error);

    // Ensure we always return JSON
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: "Giriş sırasında hata oluştu: " + (error instanceof Error ? error.message : String(error)),
        details: error instanceof Error ? error.stack : undefined,
      });
    }
  }
};

// Membership Management
export const purchaseMembership: RequestHandler = async (req, res) => {
  try {
    const { userId, packageType, paymentMethod, bankReceipt } = req.body;

    const user = await mlmDb.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }

    const membershipPackage = MEMBERSHIP_PACKAGES.find(
      (pkg) => pkg.type === packageType,
    );
    if (!membershipPackage) {
      return res.status(400).json({ error: "Geçersiz paket türü" });
    }

    // Create payment request
    const paymentRequest = await mlmDb.createPaymentRequest({
      userId,
      type: "deposit",
      amount: membershipPackage.price,
      method: paymentMethod,
      status: "pending",
      receipt: bankReceipt,
    });

    res.json({
      success: true,
      message: "Ödeme talebi oluşturuldu. Admin onayı bekleniyor.",
      paymentRequest,
    });
  } catch (error) {
    console.error("Purchase membership error:", error);
    res.status(500).json({ error: "Üyelik satın alma sırasında hata oluştu" });
  }
};

export const activateMembership: RequestHandler = async (req, res) => {
  try {
    const { paymentRequestId, approved } = req.body;

    const paymentRequest = await mlmDb.updatePaymentRequest(paymentRequestId, {
      status: approved ? "approved" : "rejected",
    });

    if (!paymentRequest || !approved) {
      return res.json({ success: true, message: "Ödeme talebi reddedildi" });
    }

    const user = await mlmDb.getUserById(paymentRequest.userId);
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }

    // Find membership package
    const membershipPackage = MEMBERSHIP_PACKAGES.find(
      (pkg) => pkg.price === paymentRequest.amount,
    );
    if (!membershipPackage) {
      return res.status(400).json({ error: "Geçersiz paket" });
    }

    // Activate membership
    const startDate = new Date();
    const endDate =
      membershipPackage.type !== "entry"
        ? calculateMembershipExpiry(startDate, (membershipPackage as any).durationDays || (membershipPackage as any).duration || 30)
        : undefined;

    await mlmDb.updateUser(user.id, {
      membershipType: membershipPackage.type,
      membershipStartDate: startDate,
      membershipEndDate: endDate,
      isActive: true,
      totalInvestment: user.totalInvestment + paymentRequest.amount,
      lastPaymentDate: new Date(),
    });

    // Update career level
    const newCareerLevel = getCareerLevel(user.totalInvestment + paymentRequest.amount);
    await mlmDb.updateUser(user.id, { careerLevel: newCareerLevel });

    // Calculate and distribute commissions using Monoline MLM system
    try {
      const { MonolineCommissionService } = await import('../lib/monoline-commission-service');
      const allUsers = await mlmDb.getAllUsers();
      const commissionResult = await MonolineCommissionService.calculateMonolineCommissions(
        user.id,
        paymentRequest.amount,
        allUsers
      );

      // Store commission transactions persistently in database
      if (commissionResult.transactions.length > 0) {
        await mlmDb.createMonolineCommissionTransactions(commissionResult.transactions);
      }

      // Add to passive income pool
      if (commissionResult.passivePoolAmount > 0) {
        await mlmDb.addToPassiveIncomePool(commissionResult.passivePoolAmount);
      }

      // Add to company fund
      if (commissionResult.companyFundAmount > 0) {
        await mlmDb.addToCompanyFund(commissionResult.companyFundAmount);
        await mlmDb.createCompanyFundTransaction({
          amount: commissionResult.companyFundAmount,
          source: 'membership_activation',
          description: `Company fund from membership activation - User: ${user.fullName}, Amount: ${paymentRequest.amount}`,
          createdAt: new Date()
        });
      }

      console.log(`💰 Monoline commissions distributed for membership activation: $${commissionResult.totalDistributed}`);
    } catch (commissionError) {
      console.error('Error processing monoline commissions:', commissionError);
      // Fall back to old system if monoline fails
      await mlmDb.calculateAndDistributeCommissions(paymentRequest.amount, user.id);
    }

    // Create transaction record for membership payment
    await mlmDb.createTransaction({
      userId: user.id,
      type: "payment",
      amount: paymentRequest.amount,
      description: `${membershipPackage.name} üyelik ödemesi`,
      status: "completed",
    });

    res.json({
      success: true,
      message: "Üyelik başarıyla aktifleştirildi",
    });
  } catch (error) {
    console.error("Activate membership error:", error);
    res
      .status(500)
      .json({ error: "Üyelik aktifleştirme sırasında hata oluştu" });
  }
};

// Update Receipt File
export const updateReceipt: RequestHandler = async (req, res) => {
  try {
    const { userId, receiptFile } = req.body;

    if (!userId || !receiptFile) {
      return res.status(400).json({ error: "Kullanıcı ID ve dekont dosyası gereklidir" });
    }

    const user = await mlmDb.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }

    await mlmDb.updateUser(userId, {
      receiptFile: receiptFile,
      receiptUploadedAt: new Date(),
      receiptVerified: false,
    });

    res.json({
      success: true,
      message: "Ödeme dekontu başarıyla yüklendi. Admin onayı bekleniyor.",
    });
  } catch (error) {
    console.error("Update receipt error:", error);
    res
      .status(500)
      .json({ error: "Dekont yükleme sırasında hata oluştu" });
  }
};

// User Dashboard
export const getUserDashboard: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await mlmDb.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }

    // Get network statistics
    const directReferrals = await mlmDb.getDirectReferrals(userId);
    const totalTeamSize = await mlmDb.getTotalTeamSize(userId);
    const networkTree = await mlmDb.getNetworkTree(userId, 3); // 3 levels for dashboard

    // Update team statistics
    await mlmDb.updateUser(userId, {
      directReferrals: directReferrals.length,
      totalTeamSize,
    });

    res.json({
      user,
      networkStats: {
        directReferrals: directReferrals.length,
        totalTeamSize,
        networkTree,
      },
      directReferralsList: directReferrals,
    });
  } catch (error) {
    console.error("Get user dashboard error:", error);
    res.status(500).json({ error: "Dashboard verileri alınırken hata oluştu" });
  }
};

// Network Management
export const getNetworkTree: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { depth = 7 } = req.query;

    const networkTree = await mlmDb.getNetworkTree(
      userId,
      parseInt(depth as string),
    );

    res.json({ networkTree });
  } catch (error) {
    console.error("Get network tree error:", error);
    res.status(500).json({ error: "Network ağacı alınırken hata oluştu" });
  }
};

// Financial Operations
export const createWithdrawalRequest: RequestHandler = async (req, res) => {
  try {
    const { userId, amount, bankDetails } = req.body;

    const user = await mlmDb.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }

    if (user.wallet.balance < amount) {
      return res.status(400).json({ error: "Yetersiz bakiye" });
    }

    const withdrawalRequest = await mlmDb.createPaymentRequest({
      userId,
      type: "withdrawal",
      amount,
      method: "bank_transfer",
      status: "pending",
      bankDetails,
    });

    res.json({
      success: true,
      message: "Para çekme talebi oluşturuldu",
      withdrawalRequest,
    });
  } catch (error) {
    console.error("Withdrawal request error:", error);
    res.status(500).json({ error: "Para çekme talebi sırasında hata oluştu" });
  }
};

export const transferFunds: RequestHandler = async (req, res) => {
  try {
    const { fromUserId, toUserEmail, amount, note } = req.body;

    const fromUser = await mlmDb.getUserById(fromUserId);
    const toUser = await mlmDb.getUserByEmail(toUserEmail);

    if (!fromUser || !toUser) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }

    if (fromUser.wallet.balance < amount) {
      return res.status(400).json({ error: "Yetersiz bakiye" });
    }

    // Create transactions
    await mlmDb.createTransaction({
      userId: fromUserId,
      type: "transfer",
      amount: -amount,
      description: `Transfer to ${toUser.fullName}: ${note}`,
      status: "completed",
    });

    await mlmDb.createTransaction({
      userId: toUser.id,
      type: "transfer",
      amount: amount,
      description: `Transfer from ${fromUser.fullName}: ${note}`,
      status: "completed",
    });

    res.json({
      success: true,
      message: "Transfer başarıyla tamamlandı",
    });
  } catch (error) {
    console.error("Transfer funds error:", error);
    res.status(500).json({ error: "Transfer sırasında hata oluştu" });
  }
};

// Spiritual Calculations
export const calculateSpiritual: RequestHandler = async (req, res) => {
  try {
    const { name, motherName, birthDate } = req.body;

    const calculation = calculateSpiritualNumber(name, birthDate);

    res.json({
      success: true,
      calculation,
    });
  } catch (error) {
    console.error("Spiritual calculation error:", error);
    res.status(500).json({ error: "Manevi hesaplama sırasında hata oluştu" });
  }
};

// Clone Page Management
export const getClonePage: RequestHandler = async (req, res) => {
  try {
    const { slug } = req.params;

    const clonePage = await mlmDb.getClonePageBySlug(slug);
    if (!clonePage) {
      return res.status(404).json({ error: "Sayfa bulunamadı" });
    }

    const user = await mlmDb.getUserById(clonePage.userId);
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }

    // Increment visit count and save to database
    await mlmDb.db.read();
    const clonePageIndex = mlmDb.db.data.clonePages.findIndex(
      (page: any) => page.slug === slug,
    );

    if (clonePageIndex !== -1) {
      mlmDb.db.data.clonePages[clonePageIndex].visitCount =
        (mlmDb.db.data.clonePages[clonePageIndex].visitCount || 0) + 1;
      await mlmDb.db.write();

      // Return updated data
      clonePage.visitCount =
        mlmDb.db.data.clonePages[clonePageIndex].visitCount;
    }

    res.json({
      clonePage,
      user: {
        fullName: user.fullName,
        memberId: user.memberId,
        referralCode: user.referralCode,
        careerLevel: user.careerLevel,
      },
    });
  } catch (error) {
    console.error("Get clone page error:", error);
    res.status(500).json({ error: "Sayfa yüklenirken hata oluştu" });
  }
};

// Admin Operations
export const getAdminDashboard: RequestHandler = async (req, res) => {
  try {
    const users = await mlmDb.getAllUsers();
    const settings = await mlmDb.getSettings();

    // Yeni sistemden (MongoDB) istatistikleri çek
    const heldEarningsCount = await WalletTransaction.countDocuments({ status: 'HELD' }).exec().catch(() => 0);
    
    const heldEarningsTotal = await WalletTransaction.aggregate([
      { $match: { status: 'HELD' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).catch(() => []);

    const totalCommissions = await CommissionLog.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).catch(() => []);

    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.isActive).length,
      totalRevenue: users.reduce((sum, u) => sum + u.totalInvestment, 0),
      pendingPayments: 0, // Will be calculated from payment requests
      // Yeni eklenen istatistikler
      heldEarnings: {
        count: heldEarningsCount,
        amount: heldEarningsTotal[0]?.total || 0
      },
      totalDistributedCommissions: totalCommissions[0]?.total || 0,
      systemHealth: "active"
    };

    res.json({
      stats,
      recentUsers: users.slice(-10),
      settings,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    // Return fallback data instead of error
    res.json({
      stats: {
        totalUsers: 0,
        activeUsers: 0,
        totalRevenue: 0,
        pendingPayments: 0,
        heldEarnings: { count: 0, amount: 0 },
        totalDistributedCommissions: 0,
        systemHealth: "error"
      },
      recentUsers: [],
      settings: {
          systemSettings: {
          maxCapacity: 1000000,
          autoPlacement: true,
          registrationEnabled: true,
          maintenanceMode: false,
        },
        commissionSettings: {
          sponsorBonusRate: 10,
          careerBonusRate: 25,
          passiveIncomeRate: 5,
          systemFundRate: 60,
        },
      },
    });
  }
};

export const getAllUsers: RequestHandler = async (req, res) => {
  try {
    const users = await mlmDb.getAllUsers();
    res.json({ users });
  } catch (error) {
    console.error("Get all users error:", error);
    // Return empty array instead of error
    res.json({ users: [] });
  }
};

export const updateUserByAdmin: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    const updatedUser = await mlmDb.updateUser(userId, updates);
    if (!updatedUser) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }

    res.json({
      success: true,
      message: "Kullanıcı güncellendi",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res
      .status(500)
      .json({ error: "Kullanıcı güncelleme sırasında hata oluştu" });
  }
};

export const deleteUserByAdmin: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    const deleted = await mlmDb.deleteUser(userId);
    if (!deleted) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }

    res.json({
      success: true,
      message: "Kullanıcı silindi",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Kullanıcı silme sırasında hata oluştu" });
  }
};

export const updateSystemSettings: RequestHandler = async (req, res) => {
  try {
    const settings = req.body;

    await mlmDb.updateSettings(settings);

    res.json({
      success: true,
      message: "Sistem ayarları güncellendi",
    });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({ error: "Ayarlar güncellenirken hata oluştu" });
  }
};

// Binary Network Endpoints
export const getBinaryNetworkStats: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await mlmDb.getBinaryNetworkStats(userId);

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Get binary stats error:", error);
    res
      .status(500)
      .json({ error: "Binary istatistikleri alınırken hata oluştu" });
  }
};

export const getDetailedNetworkTree: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { depth = 7 } = req.query;

    const networkTree = await mlmDb.getNetworkTree(
      userId,
      parseInt(depth as string),
    );

    // Enhanced network tree with binary-specific data
    const enhancedTree = await enhanceNetworkTreeData(networkTree);

    res.json({
      success: true,
      networkTree: enhancedTree,
    });
  } catch (error) {
    console.error("Get detailed network tree error:", error);
    res
      .status(500)
      .json({ error: "Detaylı network ağacı alınırken hata oluştu" });
  }
};

// Helper function to enhance network tree with binary data
async function enhanceNetworkTreeData(tree: any): Promise<any> {
  if (!tree || !tree.user) return null;

  const user = tree.user;
  const binaryStats = await mlmDb.getBinaryNetworkStats(user.id);

  return {
    id: user.id,
    name: user.fullName,
    memberId: user.memberId,
    careerLevel: user.careerLevel.name,
    totalInvestment: user.totalInvestment,
    isActive: user.isActive,
    teamSize: tree.totalTeamSize || 0,
    teamVolume: binaryStats.leftVolume + binaryStats.rightVolume,
    leftChild:
      tree.children && tree.children[0]
        ? await enhanceNetworkTreeData(tree.children[0])
        : null,
    rightChild:
      tree.children && tree.children[1]
        ? await enhanceNetworkTreeData(tree.children[1])
        : null,
  };
}

export const activateBinarySystem: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.body;

    // Activate binary system for user
    const user = await mlmDb.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }

    // Update system settings to activate binary features
    const currentSettings = await mlmDb.getSettings();
    await mlmDb.updateSettings({
      ...currentSettings,
      systemSettings: {
        ...currentSettings.systemSettings,
        autoPlacement: true,
        maxCapacity: 100000,
      },
    });

    res.json({
      success: true,
      message: "Binary sistem aktifleştirildi",
      features: {
        autoPlacement: true,
        maxLevels: 7,
        maxCapacity: 1000000,
        commissionLevels: 7,
      },
    });
  } catch (error) {
    console.error("Activate binary system error:", error);
    res
      .status(500)
      .json({ error: "Binary sistem aktifleştirme sırasında hata oluştu" });
  }
};

export const calculateBinaryBonus: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await mlmDb.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }

    const stats = await mlmDb.getBinaryNetworkStats(userId);

    // Calculate binary bonus based on weaker leg
    const weakerLegVolume = Math.min(stats.leftVolume, stats.rightVolume);
    const binaryBonus = weakerLegVolume * 0.1; // 10% of weaker leg

    // Apply binary bonus if significant
    if (binaryBonus >= 10) {
      // Minimum $10 threshold
      await mlmDb.createTransaction({
        userId: user.id,
        type: "bonus",
        amount: binaryBonus,
        description: `Binary bonus - Zayıf bacak: $${weakerLegVolume}`,
        status: "completed",
      });

      // Update user wallet
      user.wallet.leadershipBonus += binaryBonus;
      user.wallet.balance += binaryBonus;
      await mlmDb.updateUser(user.id, { wallet: user.wallet });
    }

    res.json({
      success: true,
      binaryBonus,
      applied: binaryBonus >= 10,
      stats,
    });
  } catch (error) {
    console.error("Calculate binary bonus error:", error);
    res
      .status(500)
      .json({ error: "Binary bonus hesaplama sırasında hata oluştu" });
  }
};

// Performance Monitoring Endpoints
export const getPerformanceStatus: RequestHandler = async (req, res) => {
  try {
    const performanceStatus = await mlmDb.getPerformanceStatus();

    res.json({
      success: true,
      ...performanceStatus,
    });
  } catch (error) {
    console.error("Get performance status error:", error);
    res.status(500).json({ error: "Performans durumu alınırken hata oluştu" });
  }
};

export const optimizeSystem: RequestHandler = async (req, res) => {
  try {
    await mlmDb.optimizeForScale();

    res.json({
      success: true,
      message: "Sistem optimizasyonu tamamlandı",
    });
  } catch (error) {
    console.error("System optimization error:", error);
    res
      .status(500)
      .json({ error: "Sistem optimizasyonu sırasında hata oluştu" });
  }
};

export const checkCapacity: RequestHandler = async (req, res) => {
  try {
    const capacityStatus = await mlmDb.checkSystemCapacity();

    res.json({
      success: true,
      ...capacityStatus,
    });
  } catch (error) {
    console.error("Check capacity error:", error);
    res.status(500).json({ error: "Kapasite kontrolü sırasında hata oluştu" });
  }
};

// Batch Operations for Large Scale
export const batchProcessUsers: RequestHandler = async (req, res) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates)) {
      return res.status(400).json({ error: "Güncelleme listesi gerekli" });
    }

    const results = await mlmDb.batchUpdateUsers(updates);
    const successCount = results.filter((r) => r).length;

    res.json({
      success: true,
      message: `${successCount}/${updates.length} kullanıcı başarıyla güncellendi`,
      results,
    });
  } catch (error) {
    console.error("Batch process users error:", error);
    res.status(500).json({ error: "Toplu işlem sırasında hata oluştu" });
  }
};

// User Product Purchases
export const getUserProductPurchases: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "Kullanıcı ID gerekli" });
    }

    const purchases = await mlmDb.getUserProductPurchases(userId);
    const products = await mlmDb.getAllProducts();

    // Enrich purchases with product details
    const enrichedPurchases = purchases.map(purchase => {
      const product = products.find(p => p.id === purchase.productId);
      return {
        ...purchase,
        product: product || null
      };
    });

    res.json({
      success: true,
      purchases: enrichedPurchases
    });
  } catch (error) {
    console.error("Get user product purchases error:", error);
    res.status(500).json({ error: "Ürün alışverişleri yüklenemedi" });
  }
};
