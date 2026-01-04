import { Router } from "express";
import { iyzicoService } from "../lib/iyzico-service";
import { mlmDb } from "../lib/mlm-database";
import { generateId } from "../lib/utils";

const router = Router();

// Create payment with Iyzico
router.post("/create-payment", async (req, res) => {
  try {
    const {
      productId,
      buyerEmail,
      shippingAddress,
      shippingOption,
      totalAmount,
      shippingCost,
      referralCode
    } = req.body;

    if (!productId || !buyerEmail || !shippingAddress || !totalAmount) {
      return res.status(400).json({
        success: false,
        error: "Gerekli alanlar eksik."
      });
    }

    // Get product details
    const product = await mlmDb.getProductById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Ürün bulunamadı."
      });
    }

    // Get user IP
    const userIp = req.ip || req.connection.remoteAddress || "127.0.0.1";

    // Create payment with Iyzico
    const paymentResult = await iyzicoService.createPayment({
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      shippingCost: shippingCost || 0,
      totalAmount: Number(totalAmount),
      buyerEmail,
      shippingAddress,
      userIp
    });

    if (paymentResult.success) {
      // Create purchase record in pending status
      const purchaseResult = await mlmDb.createProductPurchase({
        productId,
        buyerEmail,
        referralCode,
        shippingAddress,
        paymentMethod: "iyzico",
        totalAmount: Number(totalAmount),
        shippingCost: shippingCost || 0,
        paymentId: paymentResult.paymentId,
        conversationId: paymentResult.conversationId,
        status: "pending"
      });

      return res.json({
        success: true,
        paymentId: paymentResult.paymentId,
        htmlContent: paymentResult.htmlContent,
        conversationId: paymentResult.conversationId,
        purchaseId: purchaseResult.purchase?.id,
        message: "Ödeme oluşturuldu, 3DS doğrulaması gerekiyor."
      });
    } else {
      return res.status(400).json({
        success: false,
        error: paymentResult.errorMessage
      });
    }
  } catch (error) {
    console.error("Create payment error:", error);
    return res.status(500).json({
      success: false,
      error: "Ödeme oluşturulurken hata oluştu."
    });
  }
});

// Verify payment and complete purchase
router.post("/verify-payment", async (req, res) => {
  try {
    const { paymentId, conversationId, purchaseId } = req.body;

    if (!paymentId || !conversationId) {
      return res.status(400).json({
        success: false,
        error: "Payment ID ve conversation ID gereklidir."
      });
    }

    // Verify payment with Iyzico
    const verificationResult = await iyzicoService.verifyPayment(paymentId, conversationId);

    if (verificationResult.success && verificationResult.status === "SUCCESS") {
      // Update purchase status to completed
      if (purchaseId) {
        // Get purchase details
        const purchase = await mlmDb.getProductPurchaseById(purchaseId);
        if (purchase) {
          // Update purchase status
          await mlmDb.updateProductPurchase(purchaseId, {
            status: "completed",
            paymentVerifiedAt: new Date()
          });

          // Distribute commissions
          await mlmDb.distributeProductCommissions(purchaseId);

          // Get payment details for receipt
          const paymentDetails = await iyzicoService.getPaymentDetails(paymentId);

          return res.json({
            success: true,
            message: "Ödeme başarıyla doğrulandı ve komisyonlar dağıtıldı.",
            purchase,
            paymentDetails
          });
        }
      }

      return res.json({
        success: true,
        message: "Ödeme başarıyla doğrulandı."
      });
    } else {
      return res.status(400).json({
        success: false,
        error: verificationResult.errorMessage || "Ödeme doğrulaması başarısız."
      });
    }
  } catch (error) {
    console.error("Verify payment error:", error);
    return res.status(500).json({
      success: false,
      error: "Ödeme doğrulanırken hata oluştu."
    });
  }
});

// Get payment status
router.get("/payment-status/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const paymentDetails = await iyzicoService.getPaymentDetails(paymentId);
    
    if (paymentDetails) {
      return res.json({
        success: true,
        paymentDetails
      });
    } else {
      return res.status(404).json({
        success: false,
        error: "Ödeme bulunamadı."
      });
    }
  } catch (error) {
    console.error("Get payment status error:", error);
    return res.status(500).json({
      success: false,
      error: "Ödeme durumu alınırken hata oluştu."
    });
  }
});

// Webhook for Iyzico notifications
router.post("/iyzico-webhook", async (req, res) => {
  try {
    // Handle Iyzico webhook notifications
    const { paymentId, status, conversationId } = req.body;
    
    console.log("Iyzico webhook received:", { paymentId, status, conversationId });
    
    // Update payment status based on webhook
    if (status === "SUCCESS") {
      // Find and update related purchase
      // Implementation depends on your database structure
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Iyzico webhook error:", error);
    return res.status(500).json({ success: false });
  }
});

export default router;
