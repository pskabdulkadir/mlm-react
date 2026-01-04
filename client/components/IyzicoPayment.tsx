import React, { useState } from "react";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  CreditCard,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface IyzicoPaymentProps {
  product: any;
  totalAmount: number;
  shippingCost: number;
  buyerEmail: string;
  shippingAddress: any;
  shippingOption: any;
  referralCode: string;
  onSuccess: (purchaseData: any) => void;
  onError: (error: string) => void;
}

const IyzicoPayment: React.FC<IyzicoPaymentProps> = ({
  product,
  totalAmount,
  shippingCost,
  buyerEmail,
  shippingAddress,
  shippingOption,
  referralCode,
  onSuccess,
  onError,
}) => {
  const [processing, setProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentHtml, setPaymentHtml] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [purchaseId, setPurchaseId] = useState("");

  const initiatePayment = async () => {
    try {
      setProcessing(true);

      // Validate required fields
      if (!buyerEmail || !shippingAddress.fullName || !shippingAddress.address) {
        onError("Lütfen tüm gerekli alanları doldurun.");
        return;
      }

      const response = await fetch("/api/payments/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          buyerEmail,
          shippingAddress,
          shippingOption,
          totalAmount,
          shippingCost,
          referralCode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPaymentId(data.paymentId);
        setConversationId(data.conversationId);
        setPurchaseId(data.purchaseId);
        setPaymentHtml(data.htmlContent);
        setShowPaymentModal(true);
      } else {
        onError(data.error || "Ödeme başlatılamadı.");
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      onError("Ödeme sistemi hatası.");
    } finally {
      setProcessing(false);
    }
  };

  const verifyPayment = async () => {
    try {
      setProcessing(true);

      const response = await fetch("/api/payments/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentId,
          conversationId,
          purchaseId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess({
          purchase: data.purchase,
          paymentDetails: data.paymentDetails,
          message: data.message,
        });
        setShowPaymentModal(false);
      } else {
        onError(data.error || "Ödeme doğrulaması başarısız.");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      onError("Ödeme doğrulama hatası.");
    } finally {
      setProcessing(false);
    }
  };

  const calculateIyzicoFee = () => {
    // Iyzico fee calculation (approximate)
    const feeRate = 0.029; // 2.9%
    const fixedFee = 0.25; // Fixed fee
    return (totalAmount * feeRate + fixedFee).toFixed(2);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Iyzico Payment Option */}
        <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Güvenli Kart Ödemesi</h3>
              <p className="text-sm text-gray-600">Iyzico güvencesi ile ödeme yapın</p>
            </div>
          </div>

          {/* Security Features */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="text-sm">SSL Güvenlik</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="text-sm">3D Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm">PCI DSS Uyumlu</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm">Anında Onay</span>
            </div>
          </div>

          {/* Supported Cards */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Desteklenen kartlar:</p>
            <div className="flex gap-2">
              <img src="https://img.icons8.com/color/32/visa.png" alt="Visa" />
              <img src="https://img.icons8.com/color/32/mastercard.png" alt="Mastercard" />
              <img src="https://img.icons8.com/color/32/amex.png" alt="American Express" />
              <img src="https://img.icons8.com/color/32/troy.png" alt="Troy" />
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-lg p-3 mb-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Ürün tutarı:</span>
                <span>${product.price}</span>
              </div>
              <div className="flex justify-between">
                <span>Kargo:</span>
                <span>${shippingCost}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>İşlem ücreti (tahmini):</span>
                <span>${calculateIyzicoFee()}</span>
              </div>
              <hr />
              <div className="flex justify-between font-semibold">
                <span>Toplam:</span>
                <span>${totalAmount}</span>
              </div>
            </div>
          </div>

          <Button
            onClick={initiatePayment}
            disabled={processing}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {processing ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                İşlem Yapılıyor...
              </div>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Güvenli Ödeme Yap (${totalAmount})
              </>
            )}
          </Button>
        </div>

        {/* Info Alert */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Bilgi:</strong> Ödemeniz Iyzico güvencesi altında işleme alınacaktır. 
            Kart bilgileriniz hiçbir şekilde sistemimizde saklanmaz.
          </AlertDescription>
        </Alert>
      </div>

      {/* 3D Secure Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Güvenli Ödeme</DialogTitle>
            <DialogDescription>
              Ödemenizi tamamlamak için aşağıdaki adımları takip edin.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {paymentHtml && (
              <div className="border rounded-lg p-4">
                <div
                  dangerouslySetInnerHTML={{ __html: paymentHtml }}
                  className="text-center"
                />
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={verifyPayment}
                disabled={processing}
                className="flex-1"
              >
                {processing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Doğrulanıyor...
                  </div>
                ) : (
                  "Ödemeyi Doğrula"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPaymentModal(false)}
                disabled={processing}
              >
                İptal
              </Button>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Ödeme işlemi başarıyla tamamlandıktan sonra "Ödemeyi Doğrula" butonuna tıklayın.
              </AlertDescription>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default IyzicoPayment;
