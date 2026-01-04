import { Router } from "express";
import { mlmDb } from "../lib/mlm-database";
import { generateId } from "../lib/utils";

const router = Router();

// Get all active products
router.get("/", async (req, res) => {
  try {
    const products = await mlmDb.getAllProducts();
    
    return res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);
    return res.status(500).json({
      success: false,
      error: "Ürünler alınırken hata oluştu.",
    });
  }
});

// Get single product
router.get("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await mlmDb.getProductById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Ürün bulunamadı.",
      });
    }

    return res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);
    return res.status(500).json({
      success: false,
      error: "Ürün bilgileri alınırken hata oluştu.",
    });
  }
});

// Create product purchase
router.post("/purchase", async (req, res) => {
  try {
    const {
      productId,
      buyerId,
      buyerEmail,
      referralCode,
      shippingAddress,
      paymentMethod = "credit_card",
    } = req.body;

    if (!productId || !buyerEmail || !shippingAddress) {
      return res.status(400).json({
        success: false,
        error: "Gerekli alanlar eksik.",
      });
    }

    // Validate shipping address
    const requiredFields = ['fullName', 'address', 'city', 'state', 'zipCode', 'country', 'phone'];
    for (const field of requiredFields) {
      if (!shippingAddress[field]) {
        return res.status(400).json({
          success: false,
          error: `Teslimat adresi ${field} alanı gereklidir.`,
        });
      }
    }

    const result = await mlmDb.createProductPurchase({
      productId,
      buyerId,
      buyerEmail,
      referralCode,
      shippingAddress,
      paymentMethod,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error("Create purchase error:", error);
    return res.status(500).json({
      success: false,
      error: "Satın alma işlemi sırasında hata oluştu.",
    });
  }
});

// Get product sales statistics (admin only)
router.get("/admin/stats", async (req, res) => {
  try {
    // Note: In production, add admin authentication middleware
    const stats = await mlmDb.getProductSalesStats();
    
    return res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Get product stats error:", error);
    return res.status(500).json({
      success: false,
      error: "İstatistikler alınırken hata oluştu.",
    });
  }
});

// Get user's product purchases
router.get("/user/:userId/purchases", async (req, res) => {
  try {
    const { userId } = req.params;
    const purchases = await mlmDb.getUserProductPurchases(userId);
    
    // Enrich with product details
    const enrichedPurchases = await Promise.all(
      purchases.map(async (purchase) => {
        const product = await mlmDb.getProductById(purchase.productId);
        return {
          ...purchase,
          product,
        };
      })
    );

    return res.json({
      success: true,
      purchases: enrichedPurchases,
    });
  } catch (error) {
    console.error("Get user purchases error:", error);
    return res.status(500).json({
      success: false,
      error: "Kullanıcı satın almaları alınırken hata oluştu.",
    });
  }
});

// ===== ADMIN PRODUCT MANAGEMENT =====

// Get all products for admin (including inactive)
router.get("/admin/products", async (req, res) => {
  try {
    const products = await mlmDb.adminGetAllProducts();

    return res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get admin products error:", error);
    return res.status(500).json({
      success: false,
      error: "Ürünler alınırken hata oluştu.",
    });
  }
});

// Create new product (admin only)
router.post("/admin/products", async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      image,
      category,
      features,
      inStock = true,
      autoIntegratePOS = true,
    } = req.body;

    if (!name || !description || !price || !image || !category) {
      return res.status(400).json({
        success: false,
        error: "Gerekli alanlar eksik.",
      });
    }

    const result = await mlmDb.adminCreateProduct({
      name,
      description,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      image,
      category,
      features: Array.isArray(features) ? features : [features],
      inStock: Boolean(inStock),
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Automatic POS Integration
    let posIntegration = { success: false, message: "POS entegrasyonu devre dışı" };

    if (autoIntegratePOS && result.product) {
      try {
        posIntegration = await integrateToPOS(result.product);
      } catch (error) {
        console.error("POS integration error:", error);
        posIntegration = {
          success: false,
          message: "POS entegrasyonu başarısız: " + error.message
        };
      }
    }

    return res.json({
      ...result,
      posIntegration,
      message: (result as any).message + (posIntegration.success ? " POS entegrasyonu tamamlandı." : " POS entegrasyonu başarısız.")
    });
  } catch (error) {
    console.error("Create product error:", error);
    return res.status(500).json({
      success: false,
      error: "Ürün oluşturulurken hata oluştu.",
    });
  }
});

// POS Integration Function
async function integrateToPOS(product: any): Promise<{ success: boolean; message: string; posProductId?: string }> {
  try {
    // Simulate POS integration with Iyzico virtual POS
    // In real implementation, this would create a product in Iyzico's system

    const posProductData = {
      name: product.name,
      description: product.description,
      price: product.price,
      currency: "TRY",
      category: product.category,
      image: product.image,
      externalId: product.id,
      // Additional POS-specific fields
      vatRate: 18, // 18% KDV
      stockQuantity: product.inStock ? 1000 : 0,
      isActive: product.isActive,
    };

    // Simulate API call to POS system
    const posResponse = await simulatePOSIntegration(posProductData);

    if (posResponse.success) {
      // Store POS integration info in product metadata
      await mlmDb.adminUpdateProduct(product.id, {
        metadata: {
          ...product.metadata,
          posIntegration: {
            integrated: true,
            posProductId: posResponse.posProductId,
            integrationDate: new Date(),
            vatRate: 18,
          }
        }
      });

      return {
        success: true,
        message: "POS entegrasyonu başarılı",
        posProductId: posResponse.posProductId
      };
    } else {
      return {
        success: false,
        message: posResponse.message || "POS entegrasyonu başarısız"
      };
    }
  } catch (error) {
    console.error("POS integration error:", error);
    return {
      success: false,
      message: "POS entegrasyon hatası: " + error.message
    };
  }
}

// Simulate POS Integration (replace with actual Iyzico integration)
async function simulatePOSIntegration(productData: any): Promise<{ success: boolean; posProductId?: string; message?: string }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Simulate successful integration
  const posProductId = "POS_" + Date.now();

  return {
    success: true,
    posProductId,
    message: "Ürün POS sistemine başarıyla entegre edildi"
  };
}

// Update product (admin only)
router.put("/admin/products/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const updates = req.body;

    // Convert price fields to numbers if they exist
    if (updates.price) updates.price = Number(updates.price);
    if (updates.originalPrice) updates.originalPrice = Number(updates.originalPrice);
    if (updates.inStock !== undefined) updates.inStock = Boolean(updates.inStock);

    const result = await mlmDb.adminUpdateProduct(productId, updates);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error("Update product error:", error);
    return res.status(500).json({
      success: false,
      error: "Ürün güncellenirken hata oluştu.",
    });
  }
});

// Delete product (admin only)
router.delete("/admin/products/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const result = await mlmDb.adminDeleteProduct(productId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error("Delete product error:", error);
    return res.status(500).json({
      success: false,
      error: "Ürün silinirken hata oluştu.",
    });
  }
});

export default router;
