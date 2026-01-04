import { generateId } from "./utils";

// Iyzico integration types
interface IyzicoConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
  locale: string;
  currency: string;
}

interface IyzicoPaymentRequest {
  conversationId: string;
  price: string;
  paidPrice: string;
  currency: string;
  basketId: string;
  paymentChannel: string;
  paymentGroup: string;
  buyer: {
    id: string;
    name: string;
    surname: string;
    email: string;
    gsmNumber: string;
    registrationDate: string;
    lastLoginDate: string;
    registrationAddress: string;
    city: string;
    country: string;
    zipCode: string;
    ip: string;
  };
  shippingAddress: {
    address: string;
    zipCode: string;
    contactName: string;
    city: string;
    country: string;
  };
  billingAddress: {
    address: string;
    zipCode: string;
    contactName: string;
    city: string;
    country: string;
  };
  basketItems: Array<{
    id: string;
    name: string;
    category1: string;
    category2?: string;
    itemType: string;
    price: string;
  }>;
}

interface IyzicoPaymentResponse {
  status: string;
  locale: string;
  systemTime: number;
  conversationId: string;
  paymentId?: string;
  paymentStatus?: string;
  fraudStatus?: number;
  merchantCommissionRate?: number;
  merchantCommissionRateAmount?: number;
  iyziCommissionRateAmount?: number;
  iyziCommissionFee?: number;
  cardType?: string;
  cardAssociation?: string;
  cardFamily?: string;
  binNumber?: string;
  lastFourDigits?: string;
  basketId?: string;
  currency?: string;
  price?: number;
  paidPrice?: number;
  errorCode?: string;
  errorMessage?: string;
  errorGroup?: string;
  threeDSHtmlContent?: string;
}

class IyzicoService {
  private config: IyzicoConfig;

  constructor() {
    this.config = {
      apiKey: process.env.IYZICO_API_KEY || "sandbox-api-key",
      secretKey: process.env.IYZICO_SECRET_KEY || "sandbox-secret-key",
      baseUrl: process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com",
      locale: "tr",
      currency: "TRY"
    };
  }

  // Create payment request
  async createPayment(paymentData: {
    productId: string;
    productName: string;
    productPrice: number;
    shippingCost: number;
    totalAmount: number;
    buyerEmail: string;
    shippingAddress: any;
    userIp: string;
  }): Promise<{
    success: boolean;
    paymentId?: string;
    htmlContent?: string;
    errorMessage?: string;
    conversationId: string;
  }> {
    try {
      const conversationId = generateId();
      const basketId = generateId();

      // Parse buyer name
      const nameParts = paymentData.shippingAddress.fullName.split(" ");
      const name = nameParts[0] || "Ad";
      const surname = nameParts.slice(1).join(" ") || "Soyad";

      // Prepare Iyzico request
      const iyzicoRequest: IyzicoPaymentRequest = {
        conversationId,
        price: paymentData.totalAmount.toFixed(2),
        paidPrice: paymentData.totalAmount.toFixed(2),
        currency: this.config.currency,
        basketId,
        paymentChannel: "WEB",
        paymentGroup: "PRODUCT",
        buyer: {
          id: generateId(),
          name,
          surname,
          email: paymentData.buyerEmail,
          gsmNumber: paymentData.shippingAddress.phone.replace(/[^0-9]/g, ""),
          registrationDate: new Date().toISOString().split('T')[0],
          lastLoginDate: new Date().toISOString().split('T')[0],
          registrationAddress: paymentData.shippingAddress.address,
          city: paymentData.shippingAddress.city,
          country: paymentData.shippingAddress.country,
          zipCode: paymentData.shippingAddress.zipCode,
          ip: paymentData.userIp
        },
        shippingAddress: {
          address: paymentData.shippingAddress.address,
          zipCode: paymentData.shippingAddress.zipCode,
          contactName: paymentData.shippingAddress.fullName,
          city: paymentData.shippingAddress.city,
          country: paymentData.shippingAddress.country
        },
        billingAddress: {
          address: paymentData.shippingAddress.address,
          zipCode: paymentData.shippingAddress.zipCode,
          contactName: paymentData.shippingAddress.fullName,
          city: paymentData.shippingAddress.city,
          country: paymentData.shippingAddress.country
        },
        basketItems: [
          {
            id: paymentData.productId,
            name: paymentData.productName,
            category1: "Aksesuar",
            category2: "Güneş Gözlüğü",
            itemType: "PHYSICAL",
            price: paymentData.productPrice.toFixed(2)
          }
        ]
      };

      // Add shipping as separate item if there's a cost
      if (paymentData.shippingCost > 0) {
        iyzicoRequest.basketItems.push({
          id: "shipping",
          name: "Kargo Ücreti",
          category1: "Hizmet",
          itemType: "PHYSICAL",
          price: paymentData.shippingCost.toFixed(2)
        });
      }

      // In a real implementation, you would make an actual API call to Iyzico
      // For demo purposes, we'll simulate the response
      const simulatedResponse = await this.simulateIyzicoPayment(iyzicoRequest);

      if (simulatedResponse.status === "success") {
        return {
          success: true,
          paymentId: simulatedResponse.paymentId,
          htmlContent: simulatedResponse.threeDSHtmlContent,
          conversationId
        };
      } else {
        return {
          success: false,
          errorMessage: simulatedResponse.errorMessage || "Ödeme işlemi başarısız",
          conversationId
        };
      }
    } catch (error) {
      console.error("Iyzico payment error:", error);
      return {
        success: false,
        errorMessage: "Ödeme sistemi hatası",
        conversationId: generateId()
      };
    }
  }

  // Simulate Iyzico payment for demo
  private async simulateIyzicoPayment(request: IyzicoPaymentRequest): Promise<IyzicoPaymentResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate successful payment (90% success rate)
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      return {
        status: "success",
        locale: "tr",
        systemTime: Date.now(),
        conversationId: request.conversationId,
        paymentId: generateId(),
        paymentStatus: "SUCCESS",
        fraudStatus: 1,
        merchantCommissionRate: 2.9,
        merchantCommissionRateAmount: parseFloat(request.price) * 0.029,
        iyziCommissionRateAmount: parseFloat(request.price) * 0.025,
        iyziCommissionFee: 0.25,
        cardType: "CREDIT_CARD",
        cardAssociation: "VISA",
        cardFamily: "Bonus",
        binNumber: "454671",
        lastFourDigits: "0001",
        basketId: request.basketId,
        currency: request.currency,
        price: parseFloat(request.price),
        paidPrice: parseFloat(request.paidPrice),
        // Simulated 3DS HTML content
        threeDSHtmlContent: `
          <div style="text-align: center; padding: 40px; font-family: Arial, sans-serif;">
            <h2 style="color: #28a745;">✅ Ödeme Başarılı!</h2>
            <p>Ödemeniz başarıyla tamamlanmıştır.</p>
            <p><strong>Ödeme ID:</strong> ${generateId()}</p>
            <p><strong>Tutar:</strong> ${request.price} ${request.currency}</p>
            <button onclick="window.close()" style="
              background: #007bff; 
              color: white; 
              border: none; 
              padding: 10px 20px; 
              border-radius: 5px; 
              cursor: pointer;
              margin-top: 20px;
            ">Devam Et</button>
          </div>
        `
      };
    } else {
      return {
        status: "failure",
        locale: "tr",
        systemTime: Date.now(),
        conversationId: request.conversationId,
        errorCode: "10051",
        errorMessage: "Kartınız e-ticaret işlemlerine kapalıdır",
        errorGroup: "NOT_SUFFICIENT_FUNDS"
      };
    }
  }

  // Verify payment status
  async verifyPayment(paymentId: string, conversationId: string): Promise<{
    success: boolean;
    status: string;
    errorMessage?: string;
  }> {
    try {
      // In real implementation, make API call to Iyzico to verify payment
      // For demo, we'll simulate verification
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        success: true,
        status: "SUCCESS"
      };
    } catch (error) {
      console.error("Payment verification error:", error);
      return {
        success: false,
        status: "FAILURE",
        errorMessage: "Ödeme doğrulama hatası"
      };
    }
  }

  // Get payment details
  async getPaymentDetails(paymentId: string): Promise<any> {
    try {
      // Simulate getting payment details
      return {
        paymentId,
        status: "SUCCESS",
        paidPrice: 100.00,
        currency: "TRY",
        paymentDate: new Date().toISOString(),
        cardLastFourDigits: "0001",
        cardAssociation: "VISA"
      };
    } catch (error) {
      console.error("Get payment details error:", error);
      return null;
    }
  }
}

export const iyzicoService = new IyzicoService();
