import express, { Router, Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import { User, Product, ProductPurchase, ProductCommission } from "../../shared/mlm-types";
import { mlmDb } from "../lib/mlm-database";

const router = Router();

// Helper function to read data
const readData = async (fileName: string) => {
  try {
    const filePath = path.join(process.cwd(), "data", fileName);
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${fileName}:`, error);
    return null;
  }
};

// Helper function to write data
const writeData = async (fileName: string, data: any) => {
  try {
    const filePath = path.join(process.cwd(), "data", fileName);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${fileName}:`, error);
    return false;
  }
};

// Clone products sayfası verilerini getir
router.get("/:memberId", async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    
    // Üye bilgilerini bul
    const member = await mlmDb.getUserByMemberId(memberId);
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    // Admin tarafından eklenen aktif ürünleri getir
    const products: Product[] = await mlmDb.getAllProducts();

    // Clone sayfa istatistiklerini getir (mevcut sistemde temel simülasyon)
    const cloneStats = {
      visits: Math.floor(Math.random() * 500) + 50,
      purchases: Math.floor(Math.random() * 50) + 5,
      totalCommissions: Math.floor(Math.random() * 500) + 50,
    };

    res.json({
      member: {
        id: member.id,
        memberId: member.memberId,
        fullName: member.fullName,
        referralCode: member.referralCode,
        careerLevel: member.careerLevel,
      },
      products,
      cloneStats,
    });

  } catch (error) {
    console.error("Error fetching clone product data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Clone sayfa ziyareti kaydet
router.post("/:memberId/visit", async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    
    // Ziyaret sayısını artır (basit demo implementasyonu)
    console.log(`Clone page visit tracked for member: ${memberId}`);
    
    res.json({ success: true, message: "Visit tracked" });
  } catch (error) {
    console.error("Error tracking visit:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Clone sayfa üzerinden ürün satın alma
router.post("/purchase", async (req: Request, res: Response) => {
  try {
    const {
      productId,
      buyerEmail,
      referralCode,
      sponsorId,
      purchaseAmount,
      shippingAddress,
      clonePageMemberId,
      cloneCommissionRate,
      cloneCommissionAmount,
    } = req.body;

    // Sipariş ID'si oluştur
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Sipariş bilgilerini oluştur
    const purchase: Partial<ProductPurchase> = {
      id: orderId,
      productId,
      buyerId: "guest", // Misafir alışveriş
      buyerEmail,
      referralCode,
      sponsorId,
      purchaseAmount,
      status: "pending",
      paymentMethod: "credit_card",
      shippingAddress,
      purchaseDate: new Date(),
      commissionDistributed: false,
    };

    // MLM verilerini oku
    const mlmData = await readData("mlm-db.json");
    if (mlmData) {
      // Sponsor üyeyi bul
      const sponsorMember = mlmData.users.find((user: User) => user.id === sponsorId);
      
      if (sponsorMember) {
        // %15 komisyonu sponsor üyenin cüzdanına ekle
        sponsorMember.wallet.balance += cloneCommissionAmount;
        sponsorMember.wallet.totalEarnings += cloneCommissionAmount;
        sponsorMember.wallet.sponsorBonus += cloneCommissionAmount;

        // Transaction kaydı ekle
        const transaction = {
          id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId: sponsorId,
          type: "commission",
          amount: cloneCommissionAmount,
          description: `Clone ürün sayfası komisyonu - ${productId}`,
          status: "completed",
          date: new Date().toISOString(),
          referenceId: orderId,
          adminNote: `Clone page commission (${cloneCommissionRate * 100}%)`,
        };

        if (!mlmData.transactions) {
          mlmData.transactions = [];
        }
        mlmData.transactions.push(transaction);

        // Müşteri takip kaydı ekle
        if (!mlmData.cloneCustomers) {
          mlmData.cloneCustomers = [];
        }
        
        mlmData.cloneCustomers.push({
          id: `CUST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sponsorId,
          buyerEmail,
          orderId,
          productId,
          purchaseAmount,
          commissionAmount: cloneCommissionAmount,
          purchaseDate: new Date().toISOString(),
          source: "clone_product_page",
        });

        // Veriyi kaydet
        await writeData("mlm-db.json", mlmData);
      }
    }

    // Sipariş başarılı response
    res.json({
      success: true,
      orderId,
      message: "Purchase completed successfully",
      commission: {
        sponsorId,
        amount: cloneCommissionAmount,
        rate: cloneCommissionRate,
      },
    });

  } catch (error) {
    console.error("Error processing purchase:", error);
    res.status(500).json({ error: "Purchase failed" });
  }
});

// Üyenin clone sayfa istatistiklerini getir
router.get("/:memberId/stats", async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    
    const mlmData = await readData("mlm-db.json");
    if (!mlmData) {
      return res.status(500).json({ error: "Database not accessible" });
    }

    const member = mlmData.users.find((user: User) => user.memberId === memberId);
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    // Clone müşterilerini filtrele
    const cloneCustomers = mlmData.cloneCustomers?.filter(
      (customer: any) => customer.sponsorId === member.id
    ) || [];

    // İstatistikleri hesapla
    const stats = {
      totalVisits: Math.floor(Math.random() * 1000) + 100,
      totalPurchases: cloneCustomers.length,
      totalCommissions: cloneCustomers.reduce((sum: number, customer: any) => sum + customer.commissionAmount, 0),
      customers: cloneCustomers.map((customer: any) => ({
        id: customer.id,
        buyerEmail: customer.buyerEmail,
        orderId: customer.orderId,
        purchaseAmount: customer.purchaseAmount,
        commissionAmount: customer.commissionAmount,
        purchaseDate: customer.purchaseDate,
      })),
    };

    res.json(stats);

  } catch (error) {
    console.error("Error fetching clone stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
