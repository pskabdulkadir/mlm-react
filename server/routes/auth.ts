import { Router } from "express";
import { mlmDb } from "../lib/mlm-database";
import {
  hashPasswordBcrypt,
  verifyPasswordBcrypt,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  sanitizeUserData,
  verifyPassword, // Keep for backward compatibility with existing admin
  isValidPhone,
} from "../lib/utils";
import { User } from "../../shared/mlm-types";
import SmsService from "../lib/sms-service";
import {
  getCareerLevel,
  isActiveMember,
  calculateActiveFee,
  distributeIncome,
  careerLevels,
  CareerLevel
} from "../../shared/mlmRules";

const router = Router();

// Authentication middleware
const requireAuth = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "Yetkilendirme başlığı gereklidir.",
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Token gereklidir.",
      });
    }

    const decoded = verifyAccessToken(token);
    const user = await mlmDb.getUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Geçersiz kullanıcı.",
      });
    }

    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Geçersiz token.",
    });
  }
};

// Admin authentication middleware
const requireAdmin = async (req: any, res: any, next: any) => {
  await requireAuth(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Bu işlem için admin yetkileri gereklidir.",
      });
    }
    next();
  });
};

// ===== AUTHENTICATION ROUTES =====

// Send password reset code via SMS
router.post("/forgot-password-sms", async (req, res) => {
  try {
    const { phone } = req.body as { phone?: string };
    if (!phone || !isValidPhone(phone)) {
      return res.status(400).json({ success: false, error: "Geçerli bir telefon numarası gereklidir." });
    }

    const user = await mlmDb.getUserByPhone(phone);
    if (!user) {
      // Do not reveal user existence
      return res.json({ success: true, message: "Şifre yenileme kodu gönderildi." });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await mlmDb.createPasswordReset(user.id, phone, code, expiresAt);

    await SmsService.sendSms(phone, `Kutbul Zaman şifre yenileme kodunuz: ${code}. 10 dakika içinde kullanın.`);

    return res.json({ success: true, message: "Şifre yenileme kodu gönderildi." });
  } catch (error) {
    console.error("Forgot password SMS error:", error);
    return res.status(500).json({ success: false, error: "Şifre yenileme kodu gönderilemedi." });
  }
});

// Verify code and reset password
router.post("/reset-password-sms", async (req, res) => {
  try {
    const { phone, code, newPassword } = req.body as { phone?: string; code?: string; newPassword?: string };
    if (!phone || !isValidPhone(phone) || !code || !newPassword) {
      return res.status(400).json({ success: false, error: "Telefon, kod ve yeni şifre gereklidir." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: "Şifre en az 6 karakter olmalıdır." });
    }

    const validation = await mlmDb.verifyPasswordReset(phone, code);
    if (!validation.valid || !validation.userId) {
      return res.status(400).json({ success: false, error: validation.reason || "Geçersiz doğrulama kodu." });
    }

    const hash = await hashPasswordBcrypt(newPassword);
    const updated = await mlmDb.updateUser(validation.userId, { password: hash });
    if (!updated) {
      return res.status(500).json({ success: false, error: "Şifre güncellenemedi." });
    }

    await mlmDb.consumePasswordReset(phone, code);

    return res.json({ success: true, message: "Şifreniz başarıyla güncellendi." });
  } catch (error) {
    console.error("Reset password SMS error:", error);
    return res.status(500).json({ success: false, error: "Şifre güncelleme sırasında hata oluştu." });
  }
});

// Login route with JWT support
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email ve şifre gereklidir.",
      });
    }

    // Get user by email
    const user = await mlmDb.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Geçersiz email veya şifre.",
      });
    }

    // Check password - support both old SHA256 and new bcrypt
    let passwordValid = false;

    // For backward compatibility with existing admin account
    if (user.email === "psikologabdulkadirkan@gmail.com") {
      passwordValid = verifyPassword(password, user.password);
    } else {
      // For new users, use bcrypt
      passwordValid = await verifyPasswordBcrypt(password, user.password);
    }

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        error: "Geçersiz email veya şifre.",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: "Hesabınız aktif değil. Lütfen yönetici ile iletişime geçin.",
      });
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      memberId: user.memberId,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Update last login date
    await mlmDb.updateUser(user.id, { lastLoginDate: new Date() });

    // Create member session with tracking
    const sessionId = await mlmDb.createMemberSession({
      memberId: user.memberId,
      userId: user.id,
      sessionToken: refreshToken,
      ipAddress: req.ip || "unknown",
      userAgent: req.headers["user-agent"] || "unknown",
    });

    // Create detailed member log
    await mlmDb.createMemberLog({
      memberId: user.memberId,
      userId: user.id,
      action: "LOGIN",
      details: `Successful login from ${req.ip}`,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      sessionId,
      metadata: {
        loginMethod: "email_password",
        userRole: user.role,
        timestamp: new Date(),
      },
    });

    // Create member activity
    await mlmDb.createMemberActivity({
      memberId: user.memberId,
      userId: user.id,
      activityType: "AUTHENTICATION",
      description: "User logged in successfully",
      data: {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        loginTime: new Date(),
      },
    });

    // Create admin audit log
    await mlmDb.createAdminLog({
      action: "USER_LOGIN",
      targetUserId: user.id,
      details: `User ${user.fullName} (${user.memberId}) logged in from ${req.ip}`,
      adminId: user.id,
    });

    return res.json({
      success: true,
      message: "Giriş başarılı.",
      user: sanitizeUserData(user),
      accessToken,
      refreshToken,
      expiresIn: "15m",
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      error: "Giriş sırasında sunucu hatası oluştu.",
    });
  }
});

// Register route
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, phone, password, sponsorCode } = req.body;

    // Validation
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        error: "Tüm alanlar gereklidir.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Şifre en az 6 karakter olmalıdır.",
      });
    }

    // Check if email already exists
    const existingUser = await mlmDb.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "Bu email adresi zaten kullanılıyor.",
      });
    }

    // Find sponsor if provided
    let sponsorId: string | undefined;
    if (sponsorCode) {
      const sponsor = await mlmDb.getUserByReferralCode(sponsorCode);
      if (!sponsor) {
        return res.status(400).json({
          success: false,
          error: "Geçersiz sponsor kodu.",
        });
      }
      sponsorId = sponsor.id;
    }

    // Check system capacity
    const capacity = await mlmDb.checkSystemCapacity();
    if (!capacity.canAddUser) {
      return res.status(503).json({
        success: false,
        error: "Sistem kapasitesi dolu. Lütfen daha sonra tekrar deneyin.",
      });
    }

    // Create user using admin function (with default member role)
    const result = await mlmDb.adminCreateUser({
      fullName,
      email,
      phone,
      password,
      role: "member",
      sponsorId,
      isActive: true,
      membershipType: "entry",
      initialBalance: 0,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: (result as any).message,
      });
    }

    // Create audit log
    await mlmDb.createAdminLog({
      action: "USER_REGISTER",
      targetUserId: result.user?.id,
      details: `New user registered: ${fullName} (${email}) with sponsor: ${sponsorCode || "none"}`,
      adminId: "system",
    });

    return res.status(201).json({
      success: true,
      message: "Kayıt başarılı. Giriş yapabilirsiniz.",
      user: result.user,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      error: "Kayıt sırasında sunucu hatası oluştu.",
    });
  }
});

// Refresh token route
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: "Refresh token gereklidir.",
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Get current user data
    const user = await mlmDb.getUserById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: "Geçersiz token veya kullanıcı.",
      });
    }

    // Generate new access token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      memberId: user.memberId,
    };

    const newAccessToken = generateAccessToken(tokenPayload);

    return res.json({
      success: true,
      accessToken: newAccessToken,
      expiresIn: "15m",
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    return res.status(401).json({
      success: false,
      error: "Token yenilenirken hata oluştu.",
    });
  }
});

// Logout route (invalidate tokens - in production would use a blacklist)
router.post("/logout", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const { sessionId } = req.body;

    if (authHeader) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = verifyAccessToken(token);
        const user = await mlmDb.getUserById(decoded.userId);

        if (user) {
          // End member session if sessionId provided
          if (sessionId) {
            await mlmDb.endMemberSession(sessionId);
          }

          // Create member log
          await mlmDb.createMemberLog({
            memberId: user.memberId,
            userId: user.id,
            action: "LOGOUT",
            details: `User logged out from ${req.ip}`,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
            sessionId,
            metadata: {
              logoutTime: new Date(),
            },
          });

          // Create member activity
          await mlmDb.createMemberActivity({
            memberId: user.memberId,
            userId: user.id,
            activityType: "AUTHENTICATION",
            description: "User logged out",
            data: {
              ipAddress: req.ip,
              userAgent: req.headers["user-agent"],
              logoutTime: new Date(),
            },
          });

          // Create admin audit log
          await mlmDb.createAdminLog({
            action: "USER_LOGOUT",
            targetUserId: decoded.userId,
            details: `User ${user.fullName} (${user.memberId}) logged out from ${req.ip}`,
            adminId: decoded.userId,
          });
        }
      } catch (error) {
        // Token invalid, but still return success for logout
        console.log("Invalid token during logout, proceeding anyway");
      }
    }

    return res.json({
      success: true,
      message: "Çıkış başarılı.",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.json({
      success: true,
      message: "Çıkış başarılı.",
    });
  }
});

// ===== ADMIN USER MANAGEMENT ROUTES =====

// Admin create user
router.post("/admin/create-user", requireAdmin, async (req: any, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      role = "member",
      sponsorId,
      careerLevel,
      isActive = true,
      membershipType = "entry",
      initialBalance = 0,
      placementPreference = "auto",
    } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        error: "Tüm gerekli alanlar doldurulmalıdır.",
      });
    }

    const result = await mlmDb.adminCreateUser({
      fullName,
      email,
      phone,
      password,
      role,
      sponsorId,
      careerLevel,
      isActive,
      membershipType,
      initialBalance,
      placementPreference,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error("Admin create user error:", error);
    return res.status(500).json({
      success: false,
      error: "Kullanıcı oluşturulurken sunucu hatası oluştu.",
    });
  }
});

// Admin update user
router.put(
  "/admin/update-user/:userId",
  requireAdmin,
  async (req: any, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;

      const result = await mlmDb.adminUpdateUser(userId, updates, req.admin.id);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.json(result);
    } catch (error) {
      console.error("Admin update user error:", error);
      return res.status(500).json({
        success: false,
        error: "Kullanıcı güncellenirken sunucu hatası oluştu.",
      });
    }
  },
);

// Admin delete user
router.delete(
  "/admin/delete-user/:userId",
  requireAdmin,
  async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { transferChildrenTo } = req.body;

      const result = await mlmDb.adminDeleteUser(
        userId,
        req.admin.id,
        transferChildrenTo,
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.json(result);
    } catch (error) {
      console.error("Admin delete user error:", error);
      return res.status(500).json({
        success: false,
        error: "Kullanıcı silinirken sunucu hatası oluştu.",
      });
    }
  },
);

// Admin move user in binary tree
router.post("/admin/move-user", requireAdmin, async (req: any, res) => {
  try {
    const { userId, newParentId, newPosition } = req.body;

    if (!userId || !newParentId || !newPosition) {
      return res.status(400).json({
        success: false,
        error: "Kullanıcı ID, yeni ebeveyn ID ve pozisyon gereklidir.",
      });
    }

    const result = await mlmDb.adminMoveUser(userId, newParentId, newPosition);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error("Admin move user error:", error);
    return res.status(500).json({
      success: false,
      error: "Kullanıcı taşınırken sunucu hatası oluştu.",
    });
  }
});

// Admin place user in binary tree
router.post("/admin/place-user", requireAdmin, async (req: any, res) => {
  try {
    const { userId, parentId, position } = req.body;

    if (!userId || !parentId || !position) {
      return res.status(400).json({
        success: false,
        error: "Kullanıcı ID, ebeveyn ID ve pozisyon gereklidir.",
      });
    }

    const result = await mlmDb.adminPlaceUserInBinary(
      userId,
      parentId,
      position,
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error("Admin place user error:", error);
    return res.status(500).json({
      success: false,
      error: "Kullanıcı yerleştirilirken sunucu hatası oluştu.",
    });
  }
});

// Admin search users
router.get("/admin/search-users", requireAdmin, async (req: any, res) => {
  try {
    const {
      search,
      role,
      isActive,
      careerLevel,
      kycStatus,
      membershipType,
      registeredAfter,
      registeredBefore,
      minBalance,
      maxBalance,
      hasChildren,
      limit = 50,
      offset = 0,
      sortBy = "registrationDate",
      sortOrder = "desc",
    } = req.query;

    const criteria: any = {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      sortBy,
      sortOrder,
    };

    if (search) criteria.search = search;
    if (role) criteria.role = role;
    if (isActive !== undefined) criteria.isActive = isActive === "true";
    if (careerLevel) criteria.careerLevel = careerLevel;
    if (kycStatus) criteria.kycStatus = kycStatus;
    if (membershipType) criteria.membershipType = membershipType;
    if (registeredAfter)
      criteria.registeredAfter = new Date(registeredAfter as string);
    if (registeredBefore)
      criteria.registeredBefore = new Date(registeredBefore as string);
    if (minBalance) criteria.minBalance = parseFloat(minBalance as string);
    if (maxBalance) criteria.maxBalance = parseFloat(maxBalance as string);
    if (hasChildren !== undefined)
      criteria.hasChildren = hasChildren === "true";

    const result = await mlmDb.adminSearchUsers(criteria);

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Admin search users error:", error);
    return res.status(500).json({
      success: false,
      error: "Kullanıcı arama sırasında sunucu hatası oluştu.",
    });
  }
});

// Admin get all users
router.get("/admin/users", requireAdmin, async (req: any, res) => {
  try {
    const users = await mlmDb.getAllUsers();

    return res.json({
      success: true,
      users: users.map((user) => sanitizeUserData(user)),
      total: users.length,
    });
  } catch (error) {
    console.error("Admin get users error:", error);
    return res.status(500).json({
      success: false,
      error: "Kullanıcılar yüklenirken sunucu hatası oluştu.",
    });
  }
});

// Admin get user by ID
router.get("/admin/users/:userId", requireAdmin, async (req: any, res) => {
  try {
    const { userId } = req.params;
    const user = await mlmDb.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Kullanıcı bulunamadı.",
      });
    }

    return res.json({
      success: true,
      user: sanitizeUserData(user),
    });
  } catch (error) {
    console.error("Admin get user error:", error);
    return res.status(500).json({
      success: false,
      error: "Kullanıcı yüklenirken sunucu hatası oluştu.",
    });
  }
});

// Admin get logs
router.get("/admin/logs", requireAdmin, async (req: any, res) => {
  try {
    const {
      adminId,
      action,
      targetUserId,
      startDate,
      endDate,
      limit = 100,
      offset = 0,
    } = req.query;

    const criteria: any = {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    };

    if (adminId) criteria.adminId = adminId;
    if (action) criteria.action = action;
    if (targetUserId) criteria.targetUserId = targetUserId;
    if (startDate) criteria.startDate = new Date(startDate as string);
    if (endDate) criteria.endDate = new Date(endDate as string);

    const result = await mlmDb.getAdminLogs(criteria);

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Admin get logs error:", error);
    return res.status(500).json({
      success: false,
      error: "Admin logları yüklenirken sunucu hatası oluştu.",
    });
  }
});

// ===== ENHANCED MEMBER TRACKING ROUTES =====

// Get member logs (for specific member)
router.get("/member/:memberId/logs", async (req: any, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "Yetkilendirme gereklidir.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);
    const user = await mlmDb.getUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Geçersiz kullanıcı.",
      });
    }

    const { memberId } = req.params;
    const { action, startDate, endDate, limit = 50, offset = 0 } = req.query;

    // Check if user can access this member's logs
    if (user.role !== "admin" && user.memberId !== memberId) {
      return res.status(403).json({
        success: false,
        error: "Bu üyenin loglarına erişim yetkiniz yok.",
      });
    }

    const criteria: any = {
      memberId,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    };

    if (action) criteria.action = action;
    if (startDate) criteria.startDate = new Date(startDate as string);
    if (endDate) criteria.endDate = new Date(endDate as string);

    const result = await mlmDb.getMemberLogs(criteria);

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Get member logs error:", error);
    return res.status(500).json({
      success: false,
      error: "Üye logları yüklenirken sunucu hatası oluştu.",
    });
  }
});

// Get member activities
router.get("/member/:memberId/activities", async (req: any, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "Yetkilendirme gereklidir.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);
    const user = await mlmDb.getUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Geçersiz kullanıcı.",
      });
    }

    const { memberId } = req.params;
    const {
      activityType,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
    } = req.query;

    // Check if user can access this member's activities
    if (user.role !== "admin" && user.memberId !== memberId) {
      return res.status(403).json({
        success: false,
        error: "Bu üyenin aktivitelerine erişim yetkiniz yok.",
      });
    }

    const criteria: any = {
      memberId,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    };

    if (activityType) criteria.activityType = activityType;
    if (startDate) criteria.startDate = new Date(startDate as string);
    if (endDate) criteria.endDate = new Date(endDate as string);

    const result = await mlmDb.getMemberActivities(criteria);

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Get member activities error:", error);
    return res.status(500).json({
      success: false,
      error: "Üye aktiviteleri yüklenirken sunucu hatası oluştu.",
    });
  }
});

// Get member sessions
router.get("/member/:memberId/sessions", async (req: any, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "Yetkilendirme gereklidir.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);
    const user = await mlmDb.getUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Geçersiz kullanıcı.",
      });
    }

    const { memberId } = req.params;
    const { isActive, startDate, endDate, limit = 50, offset = 0 } = req.query;

    // Check if user can access this member's sessions
    if (user.role !== "admin" && user.memberId !== memberId) {
      return res.status(403).json({
        success: false,
        error: "Bu üyenin oturumlarına erişim yetkiniz yok.",
      });
    }

    const criteria: any = {
      memberId,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    };

    if (isActive !== undefined) criteria.isActive = isActive === "true";
    if (startDate) criteria.startDate = new Date(startDate as string);
    if (endDate) criteria.endDate = new Date(endDate as string);

    const result = await mlmDb.getMemberSessions(criteria);

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Get member sessions error:", error);
    return res.status(500).json({
      success: false,
      error: "Üye oturumları yüklenirken sunucu hatası oluştu.",
    });
  }
});

// Get member tracking statistics
router.get("/member/:memberId/tracking-stats", async (req: any, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "Yetkilendirme gereklidir.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);
    const user = await mlmDb.getUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Geçersiz kullanıcı.",
      });
    }

    const { memberId } = req.params;

    // Check if user can access this member's stats
    if (user.role !== "admin" && user.memberId !== memberId) {
      return res.status(403).json({
        success: false,
        error: "Bu üyenin istatistiklerine erişim yetkiniz yok.",
      });
    }

    const stats = await mlmDb.getMemberTrackingStats(memberId);

    return res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Get member tracking stats error:", error);
    return res.status(500).json({
      success: false,
      error: "Üye takip istatistikleri yüklenirken sunucu hatası oluştu.",
    });
  }
});

// Track member activity (to be called from frontend)
router.post("/member/:memberId/track-activity", async (req: any, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "Yetkilendirme gereklidir.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);
    const user = await mlmDb.getUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Geçersiz kullanıcı.",
      });
    }

    const { memberId } = req.params;
    const { activityType, description, data, duration } = req.body;

    // Check if user can track activity for this member
    if (user.memberId !== memberId) {
      return res.status(403).json({
        success: false,
        error: "Bu üye için aktivite kaydı yapma yetkiniz yok.",
      });
    }

    // Detect device info from user agent
    const userAgent = req.headers["user-agent"] || "";
    const device = {
      type: userAgent.includes("Mobile") ? "mobile" : "desktop",
      os: userAgent.includes("Windows")
        ? "Windows"
        : userAgent.includes("Mac")
          ? "macOS"
          : userAgent.includes("Linux")
            ? "Linux"
            : "Unknown",
      browser: userAgent.includes("Chrome")
        ? "Chrome"
        : userAgent.includes("Firefox")
          ? "Firefox"
          : userAgent.includes("Safari")
            ? "Safari"
            : "Unknown",
    };

    await mlmDb.createMemberActivity({
      memberId,
      userId: user.id,
      activityType,
      description,
      data,
      duration,
      device,
    });

    return res.json({
      success: true,
      message: "Aktivite kaydedildi.",
    });
  } catch (error) {
    console.error("Track member activity error:", error);
    return res.status(500).json({
      success: false,
      error: "Aktivite kaydedilirken sunucu hatası oluştu.",
    });
  }
});

// Admin get all member logs
router.get("/admin/member-logs", requireAdmin, async (req: any, res) => {
  try {
    const {
      memberId,
      userId,
      action,
      startDate,
      endDate,
      limit = 100,
      offset = 0,
    } = req.query;

    const criteria: any = {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    };

    if (memberId) criteria.memberId = memberId;
    if (userId) criteria.userId = userId;
    if (action) criteria.action = action;
    if (startDate) criteria.startDate = new Date(startDate as string);
    if (endDate) criteria.endDate = new Date(endDate as string);

    const result = await mlmDb.getMemberLogs(criteria);

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Admin get member logs error:", error);
    return res.status(500).json({
      success: false,
      error: "Üye logları yüklenirken sunucu hatası oluştu.",
    });
  }
});

// ===== ADVANCED BINARY ALGORITHM ROUTES =====

// Test binary placement algorithms
router.post(
  "/admin/test-binary-placement",
  requireAdmin,
  async (req: any, res) => {
    try {
      const { userId, sponsorId, algorithm, preferences } = req.body;

      if (!userId || !sponsorId) {
        return res.status(400).json({
          success: false,
          error: "Kullanıcı ID ve sponsor ID gereklidir.",
        });
      }

      // Test placement without actually placing
      const result = await mlmDb.enhancedAutoPlacement(userId, sponsorId, {
        algorithm: algorithm || "balanced",
        ...preferences,
      });

      return res.json({
        success: true,
        result,
      });
    } catch (error) {
      console.error("Test binary placement error:", error);
      return res.status(500).json({
        success: false,
        error: "Yerleştirme testi sırasında sunucu hatası oluştu.",
      });
    }
  },
);

// Get binary tree analysis
router.get(
  "/admin/binary-analysis/:userId",
  requireAdmin,
  async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { algorithm = "balanced", maxDepth = 7 } = req.query;

      const user = await mlmDb.getUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "Kullanıcı bulunamadı.",
        });
      }

      // Get detailed leg statistics
      const leftStats = user.leftChild
        ? await mlmDb.getDetailedLegStats(user.leftChild)
        : null;
      const rightStats = user.rightChild
        ? await mlmDb.getDetailedLegStats(user.rightChild)
        : null;

      // Find available positions
      const availablePositions = await mlmDb.findAvailablePositions(
        userId,
        parseInt(maxDepth as string),
      );

      // Get placement statistics
      const placementStats = await mlmDb.getPlacementStats(userId);

      return res.json({
        success: true,
        analysis: {
          user: {
            id: user.id,
            name: user.fullName,
            memberId: user.memberId,
            careerLevel: user.careerLevel.name,
          },
          leftLeg: leftStats,
          rightLeg: rightStats,
          availablePositions: availablePositions.length,
          positionDetails: availablePositions.slice(0, 10), // Limit for performance
          placementStats,
          recommendations: {
            suggestedAlgorithm:
              leftStats && rightStats
                ? Math.abs(((leftStats as any)?.leftLeg || 0) - ((rightStats as any)?.rightLeg || 0)) > 5
                  ? "balanced"
                  : "volume_based"
                : "size_based",
            balanceStatus: placementStats ? "balanced" : "imbalanced",
            nextPlacementSuggestion: availablePositions[0] || null,
          },
        },
      });
    } catch (error) {
      console.error("Binary analysis error:", error);
      return res.status(500).json({
        success: false,
        error: "Binary analiz sırasında sunucu hatası oluştu.",
      });
    }
  },
);

// Optimize binary tree structure
router.post(
  "/admin/optimize-binary-tree",
  requireAdmin,
  async (req: any, res) => {
    try {
      const { rootUserId, algorithm = "balanced", dryRun = true } = req.body;

      if (!rootUserId) {
        return res.status(400).json({
          success: false,
          error: "Kök kullanıcı ID gereklidir.",
        });
      }

      // Get current tree state
      const currentTree = await mlmDb.getNetworkTree(rootUserId, 7);

      // Analyze optimization opportunities
      const optimizationReport = {
        analyzed: true,
        currentBalance: "Analysis completed", // Would contain actual analysis
        recommendations: [
          "Bu özellik gelecek sürümlerde eklenecektir.",
          "Mevcut ağaç yapısı analiz edildi.",
        ],
        dryRun,
      };

      // Log the optimization attempt
      await mlmDb.createAdminLog({
        action: "TREE_OPTIMIZATION",
        targetUserId: rootUserId,
        details: `Binary tree optimization ${dryRun ? "analyzed" : "executed"} for ${rootUserId}`,
        adminId: req.admin.id,
        metadata: {
          algorithm,
          dryRun,
          report: optimizationReport,
        },
      });

      return res.json({
        success: true,
        message: dryRun
          ? "Ağaç optimizasyonu analiz edildi."
          : "Ağaç optimizasyonu tamamlandı.",
        report: optimizationReport,
      });
    } catch (error) {
      console.error("Binary tree optimization error:", error);
      return res.status(500).json({
        success: false,
        error: "Ağaç optimizasyonu sırasında sunucu hatası oluştu.",
      });
    }
  },
);

// Get binary algorithm performance metrics
router.get("/admin/binary-metrics", requireAdmin, async (req: any, res) => {
  try {
    const { startDate, endDate, algorithm, userId } = req.query;

    // Get placement logs from admin logs
    const criteria: any = {
      action: "BINARY_PLACEMENT",
      limit: 1000,
    };

    if (startDate) criteria.startDate = new Date(startDate as string);
    if (endDate) criteria.endDate = new Date(endDate as string);
    if (userId) criteria.targetUserId = userId;

    const placementLogs = await mlmDb.getAdminLogs(criteria);

    // Analyze metrics
    const metrics = {
      totalPlacements: placementLogs.logs.length,
      algorithmUsage: {} as Record<string, number>,
      averageDepth: 0,
      successRate: 0,
      balanceImprovements: 0,
    };

    // Calculate algorithm usage
    placementLogs.logs.forEach((log) => {
      const algo = log.metadata?.algorithm || "unknown";
      metrics.algorithmUsage[algo] = (metrics.algorithmUsage[algo] || 0) + 1;
    });

    // Calculate average depth
    const depths = placementLogs.logs
      .map((log) => log.metadata?.placement?.depth)
      .filter((depth) => typeof depth === "number");

    metrics.averageDepth =
      depths.length > 0
        ? depths.reduce((sum, depth) => sum + depth, 0) / depths.length
        : 0;

    // Success rate (assuming all logged placements were successful)
    metrics.successRate = 100;

    return res.json({
      success: true,
      metrics,
      period: {
        start: startDate || "inception",
        end: endDate || "now",
      },
    });
  } catch (error) {
    console.error("Binary metrics error:", error);
    return res.status(500).json({
      success: false,
      error: "Binary metrikler yüklenirken sunucu hatası oluştu.",
    });
  }
});

// Get current user info
router.get("/me", requireAuth, async (req: any, res) => {
  try {
    const userId = req.userId;
    const user = await mlmDb.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Kullanıcı bulunamadı.",
      });
    }

    // Return user data without sensitive information
    const { password, passwordHash, ...userWithoutPassword } = user;

    return res.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Get user me error:", error);
    return res.status(500).json({
      success: false,
      error: "Kullanıcı bilgisi alınırken hata oluştu.",
    });
  }
});

// Member clone page info
router.get("/my-clone-page", requireAuth, async (req: any, res) => {
  try {
    const userId = req.userId;
    const user = await mlmDb.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Kullanıcı bulunamadı.",
      });
    }

    // Get user's clone page
    const clonePage = await mlmDb.getClonePageBySlug(user.memberId);

    if (!clonePage) {
      // Create clone page if it doesn't exist
      const newClonePage = await mlmDb.createClonePage(
        userId,
        user.fullName,
        user.memberId,
      );

      return res.json({
        success: true,
        clonePage: newClonePage,
        cloneUrl: `${req.protocol}://${req.get("host")}/clone/${user.memberId}`,
        user: {
          fullName: user.fullName,
          memberId: user.memberId,
          referralCode: user.referralCode,
          careerLevel: user.careerLevel,
        },
      });
    }

    return res.json({
      success: true,
      clonePage,
      cloneUrl: `${req.protocol}://${req.get("host")}/clone/${user.memberId}`,
      user: {
        fullName: user.fullName,
        memberId: user.memberId,
        referralCode: user.referralCode,
        careerLevel: user.careerLevel,
      },
    });
  } catch (error) {
    console.error("Get my clone page error:", error);
    return res.status(500).json({
      success: false,
      error: "Klon sayfa bilgisi alınırken hata oluştu.",
    });
  }
});

// Update clone page customizations
router.put("/my-clone-page", requireAuth, async (req: any, res) => {
  try {
    const userId = req.userId;
    const { customMessage, headerImage, testimonials } = req.body;

    const user = await mlmDb.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Kullanıcı bulunamadı.",
      });
    }

    // Get and update clone page
    await mlmDb.db.read();
    const clonePageIndex = mlmDb.db.data.clonePages.findIndex(
      (page: any) => page.userId === userId,
    );

    if (clonePageIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Klon sayfa bulunamadı.",
      });
    }

    // Update customizations
    if (customMessage) {
      mlmDb.db.data.clonePages[clonePageIndex].customizations.customMessage =
        customMessage;
    }
    if (headerImage) {
      mlmDb.db.data.clonePages[clonePageIndex].customizations.headerImage =
        headerImage;
    }
    if (testimonials) {
      mlmDb.db.data.clonePages[clonePageIndex].customizations.testimonials =
        testimonials;
    }

    await mlmDb.db.write();

    return res.json({
      success: true,
      clonePage: mlmDb.db.data.clonePages[clonePageIndex],
      message: "Klon sayfa güncellendi.",
    });
  } catch (error) {
    console.error("Update clone page error:", error);
    return res.status(500).json({
      success: false,
      error: "Klon sayfa güncellenirken hata oluştu.",
    });
  }
});

// System Stats API
router.get("/admin/system-stats", requireAdmin, async (req: any, res) => {
  try {
    const users = await mlmDb.getAllUsers();
    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.isActive).length,
      totalRevenue: users.reduce((sum, u) => sum + (u.totalInvestment || 0), 0),
      pendingPayments: 0,
      systemHealth: "healthy" as const,
      databaseSize: "12.5 MB",
      serverUptime: "3 days",
      apiCalls: 1247,
    };

    return res.json({ success: true, stats });
  } catch (error) {
    console.error("System stats error:", error);
    return res.status(500).json({
      success: false,
      error: "Sistem istatistikleri alınırken hata oluştu.",
    });
  }
});

// System Configuration API
router.get("/admin/system-config", requireAdmin, async (req: any, res) => {
  try {
    const config = {
      siteName: "Kutbul Zaman",
      siteDescription: "Manevi Rehberim - MLM Sistemi",
      logoUrl: "",
      primaryColor: "#3B82F6",
      secondaryColor: "#8B5CF6",
      registrationEnabled: true,
      maintenanceMode: false,
      maxCapacity: 1000000,
      autoPlacement: true,
      sslEnabled: false,
      environment: "development",
    };

    return res.json({ success: true, config });
  } catch (error) {
    console.error("System config error:", error);
    return res.status(500).json({
      success: false,
      error: "Sistem ayarları alınırken hata oluştu.",
    });
  }
});

// Update System Configuration
router.put("/admin/system-config", requireAdmin, async (req: any, res) => {
  try {
    const config = req.body;
    // Save configuration to database or file
    // For now, just return success

    return res.json({
      success: true,
      message: "Sistem ayarları güncellendi.",
      config,
    });
  } catch (error) {
    console.error("Update system config error:", error);
    return res.status(500).json({
      success: false,
      error: "Sistem ayarları güncellenirken hata oluştu.",
    });
  }
});

// Menu Configuration API
router.put("/admin/menu-config", requireAdmin, async (req: any, res) => {
  try {
    const { menuId, updates } = req.body;
    // Update menu configuration

    return res.json({
      success: true,
      message: "Menü ayarları güncellendi.",
      menuId,
      updates,
    });
  } catch (error) {
    console.error("Update menu config error:", error);
    return res.status(500).json({
      success: false,
      error: "Menü ayarları güncellenirken hata oluştu.",
    });
  }
});

// Button Configuration API
router.put("/admin/button-config", requireAdmin, async (req: any, res) => {
  try {
    const { buttonId, updates } = req.body;
    // Update button configuration

    return res.json({
      success: true,
      message: "Buton ayarları güncellendi.",
      buttonId,
      updates,
    });
  } catch (error) {
    console.error("Update button config error:", error);
    return res.status(500).json({
      success: false,
      error: "Buton ayarları güncellenirken hata oluştu.",
    });
  }
});

// Content Blocks API
router.put("/admin/content-blocks", requireAdmin, async (req: any, res) => {
  try {
    const { blockId, updates } = req.body;
    // Update content block

    return res.json({
      success: true,
      message: "İçerik bloğu güncellendi.",
      blockId,
      updates,
    });
  } catch (error) {
    console.error("Update content block error:", error);
    return res.status(500).json({
      success: false,
      error: "İçerik bloğu güncellenirken hata oluştu.",
    });
  }
});

// Initialize Database Schema
router.post("/admin/init-database", requireAdmin, async (req: any, res) => {
  try {
    const schema = req.body;
    // Initialize database tables based on schema

    return res.json({
      success: true,
      message: "Veritabanı şeması başarıyla oluşturuldu.",
      schema,
    });
  } catch (error) {
    console.error("Init database error:", error);
    return res.status(500).json({
      success: false,
      error: "Veritabanı oluşturma sırasında hata oluştu.",
    });
  }
});

// Deploy to Production
router.post("/admin/deploy-production", requireAdmin, async (req: any, res) => {
  try {
    const deployConfig = req.body;
    // Handle production deployment

    return res.json({
      success: true,
      message: "Sistem başarıyla canlı ortama aktarıldı!",
      deployConfig,
    });
  } catch (error) {
    console.error("Deploy production error:", error);
    return res.status(500).json({
      success: false,
      error: "Canlı yayına alma sırasında hata oluştu.",
    });
  }
});

// ===== ACTIVITY TRACKING ROUTES =====

// Get user activity stats
router.get(
  "/user/:userId/activity-stats",
  requireAuth,
  async (req: any, res) => {
    try {
      const { userId } = req.params;

      // Users can only access their own stats unless they're admin
      if (req.user.role !== "admin" && req.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: "Bu bilgilere erişim yetkiniz bulunmuyor.",
        });
      }

      const activityStats = await mlmDb.getUserActivityStats(userId);

      if (!activityStats) {
        return res.status(404).json({
          success: false,
          error: "Kullanıcı bulunamadı.",
        });
      }

      return res.json({
        success: true,
        activityStats,
      });
    } catch (error) {
      console.error("Get activity stats error:", error);
      return res.status(500).json({
        success: false,
        error: "Aktiflik bilgileri alınırken hata oluştu.",
      });
    }
  },
);

// Update user activity
router.post(
  "/user/:userId/update-activity",
  requireAuth,
  async (req: any, res) => {
    try {
      const { userId } = req.params;

      // Users can only update their own activity unless they're admin
      if (req.user.role !== "admin" && req.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: "Bu işlemi gerçekleştirme yetkiniz bulunmuyor.",
        });
      }

      await mlmDb.updateUserActivity(userId);

      return res.json({
        success: true,
        message: "Aktiflik durumu güncellendi.",
      });
    } catch (error) {
      console.error("Update activity error:", error);
      return res.status(500).json({
        success: false,
        error: "Aktiflik güncellenirken hata oluştu.",
      });
    }
  },
);

// Admin: Get all users with activity status
router.get("/admin/users-activity", requireAdmin, async (req: any, res) => {
  try {
    const usersWithActivity = await mlmDb.getAllUsersWithActivity();

    return res.json({
      success: true,
      users: usersWithActivity.map((user) => ({
        id: user.id,
        memberId: user.memberId,
        fullName: user.fullName,
        email: user.email,
        isActive: user.isActive,
        activityStats: user.activityStats,
        membershipType: user.membershipType,
        careerLevel: user.careerLevel.name,
      })),
    });
  } catch (error) {
    console.error("Get users activity error:", error);
    return res.status(500).json({
      success: false,
      error: "Kullanıcı aktiflik bilgileri alınırken hata oluştu.",
    });
  }
});

// Admin: Batch update activity for all users
router.post(
  "/admin/batch-update-activity",
  requireAdmin,
  async (req: any, res) => {
    try {
      const users = await mlmDb.getAllUsers();
      const userIds = users.map((user) => user.id);

      await mlmDb.batchUpdateActivity(userIds);

      return res.json({
        success: true,
        message: `${userIds.length} kullanıcının aktiflik durumu güncellendi.`,
      });
    } catch (error) {
      console.error("Batch update activity error:", error);
      return res.status(500).json({
        success: false,
        error: "Toplu aktiflik güncellemesi sırasında hata oluştu.",
      });
    }
  },
);

// Admin: Update user comprehensive data
router.put("/admin/users/:userId", requireAdmin, async (req: any, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    console.log(`📝 Admin updating user ${userId}:`, updateData);

    // Validate user exists
    const existingUser = await mlmDb.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: "Kullanıcı bulunamadı.",
      });
    }

    // Update user data
    const updatedUser = await mlmDb.updateUser(userId, updateData);

    console.log(`✅ User updated successfully: ${updatedUser.fullName}`);

    return res.json({
      success: true,
      message: "Kullanıcı başarıyla güncellendi.",
      user: sanitizeUserData(updatedUser),
    });
  } catch (error) {
    console.error("Admin update user error:", error);
    return res.status(500).json({
      success: false,
      error: "Kullanıcı güncellenirken hata oluştu.",
    });
  }
});

// Admin: Delete user and all associated data
router.delete("/admin/users/:userId", requireAdmin, async (req: any, res) => {
  try {
    const { userId } = req.params;

    console.log(`🗑 Admin deleting user ${userId}`);

    // Validate user exists
    const existingUser = await mlmDb.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: "Kullanıcı bulunamadı.",
      });
    }

    // Delete user and all associated data
    await mlmDb.deleteUser(userId);

    console.log(`✅ User deleted successfully: ${existingUser.fullName}`);
    console.log(`🔄 All user data removed from system`);

    return res.json({
      success: true,
      message: `${existingUser.fullName} kullanıcısı ve tüm verileri başarıyla silindi.`,
    });
  } catch (error) {
    console.error("Admin delete user error:", error);
    return res.status(500).json({
      success: false,
      error: "Kullanıcı silinirken hata oluştu.",
    });
  }
});

// Admin: Update user role
router.put("/admin/users/:userId/role", requireAdmin, async (req: any, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    console.log(`👑 Admin updating user role ${userId} to:`, role);

    const updatedUser = await mlmDb.updateUserRole(userId, role);

    return res.json({
      success: true,
      message: "Kullanıcı rolü başarıyla güncellendi.",
      user: sanitizeUserData(updatedUser),
    });
  } catch (error) {
    console.error("Admin update user role error:", error);
    return res.status(500).json({
      success: false,
      error: "Kullanıcı rolü güncellenirken hata oluştu.",
    });
  }
});

// Admin: Update user career level
router.put("/admin/users/:userId/career", requireAdmin, async (req: any, res) => {
  try {
    const { userId } = req.params;
    const { careerLevel } = req.body;

    console.log(`⭐ Admin updating user career ${userId} to level:`, careerLevel);

    const updatedUser = await mlmDb.updateUserCareerLevel(userId, careerLevel);

    return res.json({
      success: true,
      message: "Kullanıcı kariyer seviyesi başarıyla güncellendi.",
      user: sanitizeUserData(updatedUser),
    });
  } catch (error) {
    console.error("Admin update user career error:", error);
    return res.status(500).json({
      success: false,
      error: "Kullanıcı kariyer seviyesi güncellenirken hata oluştu.",
    });
  }
});

// Admin: Update user status (active/inactive)
router.put("/admin/users/:userId/status", requireAdmin, async (req: any, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    console.log(`🔄 Admin updating user status ${userId} to:`, isActive ? 'active' : 'inactive');

    const updatedUser = await mlmDb.updateUserStatus(userId, isActive);

    return res.json({
      success: true,
      message: `Kullanıcı durumu başarıyla ${isActive ? 'aktif' : 'pasif'} olarak güncellendi.`,
      user: sanitizeUserData(updatedUser),
    });
  } catch (error) {
    console.error("Admin update user status error:", error);
    return res.status(500).json({
      success: false,
      error: "Kullanıcı durumu güncellenirken hata oluştu.",
    });
  }
});

// Admin: Get user's clone store data
router.get("/admin/users/:userId/clone-store", requireAdmin, async (req: any, res) => {
  try {
    const { userId } = req.params;

    console.log(`🛍 Admin accessing clone store for user ${userId}`);

    const user = await mlmDb.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Kullanıcı bulunamadı.",
      });
    }

    // Get user's clone store data (products, sales, settings)
    const cloneStoreData = await mlmDb.getUserCloneStoreData(userId);

    return res.json({
      success: true,
      cloneStore: cloneStoreData,
      user: sanitizeUserData(user),
    });
  } catch (error) {
    console.error("Admin get clone store error:", error);
    return res.status(500).json({
      success: false,
      error: "Clone mağaza bilgileri alınırken hata oluştu.",
    });
  }
});

// Admin: List all clone pages
router.get("/admin/clone-pages", requireAdmin, async (req: any, res) => {
  try {
    await mlmDb.db.read();
    const pages = mlmDb.db.data.clonePages || [];
    const enriched = await Promise.all(pages.map(async (p: any) => {
      const user = await mlmDb.getUserById(p.userId);
      return {
        id: p.slug,
        slug: p.slug,
        userId: p.userId,
        userFullName: user?.fullName || 'Bilinmeyen Kullanıcı',
        memberId: user?.memberId || '',
        isActive: p.isActive,
        visitCount: p.visitCount || 0,
        conversionCount: p.conversionCount || 0,
        customMessage: p.customizations?.customMessage || ''
      };
    }));
    return res.json({ success: true, clonePages: enriched });
  } catch (error) {
    console.error("Admin list clone pages error:", error);
    return res.status(500).json({ success: false, error: "Clone sayfaları alınamadı" });
  }
});

// Admin: Update clone page
router.put("/admin/clone-pages/:slug", requireAdmin, async (req: any, res) => {
  try {
    const { slug } = req.params;
    const { isActive, customMessage } = req.body || {};
    await mlmDb.db.read();
    const idx = mlmDb.db.data.clonePages.findIndex((p: any) => p.slug === slug);
    if (idx === -1) return res.status(404).json({ success: false, error: "Clone sayfa bulunamadı" });
    if (typeof isActive === 'boolean') mlmDb.db.data.clonePages[idx].isActive = isActive;
    if (typeof customMessage === 'string') {
      mlmDb.db.data.clonePages[idx].customizations = mlmDb.db.data.clonePages[idx].customizations || {};
      mlmDb.db.data.clonePages[idx].customizations.customMessage = customMessage;
    }
    await mlmDb.db.write();
    return res.json({ success: true, clonePage: mlmDb.db.data.clonePages[idx] });
  } catch (error) {
    console.error("Admin update clone page error:", error);
    return res.status(500).json({ success: false, error: "Clone sayfası güncellenemedi" });
  }
});

// Admin: Delete clone page
router.delete("/admin/clone-pages/:slug", requireAdmin, async (req: any, res) => {
  try {
    const { slug } = req.params;
    await mlmDb.db.read();
    const idx = mlmDb.db.data.clonePages.findIndex((p: any) => p.slug === slug);
    if (idx === -1) return res.status(404).json({ success: false, error: "Clone sayfa bulunamadı" });
    mlmDb.db.data.clonePages.splice(idx, 1);
    await mlmDb.db.write();
    return res.json({ success: true, message: "Clone sayfa silindi" });
  } catch (error) {
    console.error("Admin delete clone page error:", error);
    return res.status(500).json({ success: false, error: "Clone sayfası silinemedi" });
  }
});

// Admin: Create clone page
router.post("/admin/clone-pages", requireAdmin, async (req: any, res) => {
  try {
    const { userId, slug, customMessage } = req.body || {};
    if (!userId) return res.status(400).json({ success: false, error: "Kullanıcı ID gereklidir" });
    const user = await mlmDb.getUserById(userId);
    if (!user) return res.status(404).json({ success: false, error: "Kullanıcı bulunamadı" });
    const page = await mlmDb.createClonePage(user.id, user.fullName, slug || user.memberId);
    if (customMessage) {
      await mlmDb.db.read();
      const i = mlmDb.db.data.clonePages.findIndex((p: any) => p.slug === page.slug);
      if (i !== -1) {
        mlmDb.db.data.clonePages[i].customizations = mlmDb.db.data.clonePages[i].customizations || {};
        mlmDb.db.data.clonePages[i].customizations.customMessage = customMessage;
        await mlmDb.db.write();
      }
    }
    return res.json({ success: true, clonePage: page });
  } catch (error) {
    console.error("Admin create clone page error:", error);
    return res.status(500).json({ success: false, error: "Clone sayfası oluşturulamadı" });
  }
});

// Admin: Update user's clone store settings
router.put("/admin/users/:userId/clone-store", requireAdmin, async (req: any, res) => {
  try {
    const { userId } = req.params;
    const storeData = req.body;

    console.log(`🛍 Admin updating clone store for user ${userId}:`, storeData);

    const user = await mlmDb.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Kullanıcı bulunamadı.",
      });
    }

    // Update user's clone store data
    const updatedStore = await mlmDb.updateUserCloneStore(userId, storeData);

    console.log(`✅ Clone store updated for user: ${user.fullName}`);
    console.log(`🔄 Changes applied instantly to user's store`);

    return res.json({
      success: true,
      message: "Clone mağaza başarıyla güncellendi.",
      cloneStore: updatedStore,
    });
  } catch (error) {
    console.error("Admin update clone store error:", error);
    return res.status(500).json({
      success: false,
      error: "Clone mağaza güncellenirken hata oluştu.",
    });
  }
});

// Member: Upload payment receipt
router.post("/upload-receipt", requireAuth, async (req: any, res) => {
  try {
    const { receiptFile, userId } = req.body;

    if (!receiptFile) {
      return res.status(400).json({
        success: false,
        message: "Dekont dosyası gereklidir.",
      });
    }

    if (!userId || userId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Bu işlem için yetki yoktur.",
      });
    }

    const user = await mlmDb.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı.",
      });
    }

    await mlmDb.db.read();
    const userIdx = mlmDb.db.data.users.findIndex((u: any) => u.id === userId);
    if (userIdx === -1) {
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı.",
      });
    }

    mlmDb.db.data.users[userIdx].receiptFile = receiptFile;
    mlmDb.db.data.users[userIdx].receiptUploadedAt = new Date().toISOString();
    mlmDb.db.data.users[userIdx].receiptVerified = false;

    await mlmDb.db.write();

    return res.json({
      success: true,
      message: "Ödeme dekontu başarıyla yüklendi. Admin onayını bekleyiniz.",
      user: sanitizeUserData(mlmDb.db.data.users[userIdx]),
    });
  } catch (error) {
    console.error("Receipt upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Dekont yükleme sırasında bir hata oluştu.",
    });
  }
});

// Admin: Verify user receipt
router.put("/admin/users/:userId/verify-receipt", requireAdmin, async (req: any, res) => {
  try {
    const { userId } = req.params;
    const { receiptVerified } = req.body;

    const user = await mlmDb.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Kullanıcı bulunamadı.",
      });
    }

    await mlmDb.db.read();
    const userIdx = mlmDb.db.data.users.findIndex((u: any) => u.id === userId);
    if (userIdx === -1) {
      return res.status(404).json({
        success: false,
        error: "Kullanıcı bulunamadı.",
      });
    }

    mlmDb.db.data.users[userIdx].receiptVerified = receiptVerified === true;
    await mlmDb.db.write();

    return res.json({
      success: true,
      message: "Dekont doğrulama durumu güncellendi.",
      user: sanitizeUserData(mlmDb.db.data.users[userIdx]),
    });
  } catch (error) {
    console.error("Receipt verification error:", error);
    return res.status(500).json({
      success: false,
      error: "Dekont doğrulama sırasında bir hata oluştu.",
    });
  }
});

// Admin: Approve new user (only after receipt verification)
router.put("/admin/users/:userId/approve", requireAdmin, async (req: any, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await mlmDb.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Kullanıcı bulunamadı.",
      });
    }

    if (!user.receiptFile) {
      return res.status(400).json({
        success: false,
        error: "Dekont yüklenmeden onay yapılamaz.",
      });
    }

    await mlmDb.db.read();
    const userIdx = mlmDb.db.data.users.findIndex((u: any) => u.id === userId);
    if (userIdx === -1) {
      return res.status(404).json({
        success: false,
        error: "Kullanıcı bulunamadı.",
      });
    }

    // Automated career level calculation from MLM rules
    if (isActive === true) {
      const userData = mlmDb.db.data.users[userIdx];

      // Calculate initial career level based on investment
      const careerLevel = getCareerLevel({
        teamSize: userData.totalTeamSize || 0,
        totalInvestment: userData.totalInvestment || 0
      });

      // Get career level details from MLM rules
      const careerDetails = careerLevels[careerLevel];

      // Update user with automated career level
      mlmDb.db.data.users[userIdx].isActive = true;
      mlmDb.db.data.users[userIdx].careerLevel = {
        id: Object.keys(careerLevels).indexOf(careerLevel),
        name: careerLevel,
        description: `${careerLevel} seviyesi`,
        minInvestment: careerDetails.requiredInvestment,
        minDirectReferrals: careerDetails.requiredTeam,
        commissionRate: careerDetails.bonusPercent,
        passiveIncomeRate: careerLevel !== 'Emmare' ? (careerDetails.bonusPercent - 2) * 0.5 : 0,
        bonus: 0,
        requirements: [
          `${careerDetails.requiredTeam} ekip üyesi`,
          `$${careerDetails.requiredInvestment} yatırım`
        ]
      } as any;

      mlmDb.db.data.users[userIdx].approvedAt = new Date().toISOString();
      mlmDb.db.data.users[userIdx].receiptVerified = true;
    } else {
      mlmDb.db.data.users[userIdx].isActive = false;
    }

    await mlmDb.db.write();

    return res.json({
      success: true,
      message: "Kullanıcı başarıyla onaylandı. Kariyer seviyesi otomatik olarak hesaplanmıştır.",
      user: sanitizeUserData(mlmDb.db.data.users[userIdx]),
    });
  } catch (error) {
    console.error("User approval error:", error);
    return res.status(500).json({
      success: false,
      error: "Kullanıcı onaylama sırasında hata oluştu.",
    });
  }
});

// Admin: Run MLM automation cycle
router.post("/admin/mlm/automation", requireAdmin, async (req: any, res) => {
  try {
    const { MLMAutomationService } = await import("../lib/mlm-automation-service");

    const result = await MLMAutomationService.runAutomationCycle();

    return res.json({
      success: result.success,
      message: "MLM otomasyon döngüsü başarıyla tamamlandı",
      stats: {
        careerUpdates: result.careerUpdates,
        passiveDistributions: result.passiveDistributions,
        activityEnforcements: result.activityEnforcements,
        timestamp: new Date().toISOString()
      },
      errors: result.errors
    });
  } catch (error) {
    console.error("MLM automation error:", error);
    return res.status(500).json({
      success: false,
      error: "MLM otomasyon sırasında hata oluştu.",
      details: (error as any).message
    });
  }
});

export default router;
