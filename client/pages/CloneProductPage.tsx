import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Crown,
  ShoppingCart,
  Star,
  Heart,
  Shield,
  Award,
  Zap,
  CheckCircle,
  Share2,
  Copy,
  Eye,
  Package,
  TrendingUp,
  Users,
  Truck,
  CreditCard,
  ArrowLeft,
  ExternalLink,
  Gift,
  Target,
  MessageCircle,
  Phone,
  Mail,
  Info,
} from "lucide-react";
import { Product, ProductPurchase, ShippingAddress } from "@shared/mlm-types";

interface CloneProductPageData {
  member: {
    id: string;
    memberId: string;
    fullName: string;
    referralCode: string;
    careerLevel: {
      name: string;
      commissionRate: number;
    };
  };
  products: Product[];
  cloneStats: {
    visits: number;
    purchases: number;
    totalCommissions: number;
  };
}

export default function CloneProductPage() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState<CloneProductPageData | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Türkiye",
    phone: "",
    addressType: "home",
  });
  const [processingPurchase, setProcessingPurchase] = useState(false);

  useEffect(() => {
    if (memberId) {
      fetchCloneProductData(memberId);
      trackClonePageVisit(memberId);
    }
  }, [memberId]);

  const fetchCloneProductData = async (memberIdParam: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/clone-products/${memberIdParam}`);
      if (response.ok) {
        const data = await response.json();
        setPageData(data);
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Error fetching clone product data:", error);
      try {
        // Yedek: admin tarafından eklenen ürünleri ve üye bilgisini ayrı API'lerden yükle
        const [productsRes, cloneRes] = await Promise.all([
          fetch("/api/products"),
          fetch(`/api/clone/${memberIdParam}`)
        ]);

        if (productsRes.ok && cloneRes.ok) {
          const productsData = await productsRes.json();
          const cloneData = await cloneRes.json();

          setPageData({
            member: {
              id: cloneData.user?.id || cloneData.clonePage?.userId || "",
              memberId: cloneData.user?.memberId || memberIdParam,
              fullName: cloneData.user?.fullName || "",
              referralCode: cloneData.user?.memberId || "",
              careerLevel: cloneData.user?.careerLevel || { name: "", commissionRate: 0 },
            },
            products: productsData.products || [],
            cloneStats: {
              visits: 0,
              purchases: 0,
              totalCommissions: 0,
            },
          });
        } else {
          navigate("/");
        }
      } catch (e) {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const trackClonePageVisit = async (memberIdParam: string) => {
    try {
      await fetch(`/api/clone-products/${memberIdParam}/visit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error tracking visit:", error);
    }
  };

  const handleProductPurchase = async () => {
    if (!selectedProduct || !pageData) return;

    setProcessingPurchase(true);
    try {
      const purchaseData: Partial<ProductPurchase> = {
        productId: selectedProduct.id,
        buyerEmail: "guest@example.com", // Misafir alışveriş
        referralCode: pageData.member.referralCode,
        sponsorId: pageData.member.id,
        purchaseAmount: selectedProduct.price * selectedQuantity,
        status: "pending",
        paymentMethod: "credit_card",
        shippingAddress,
        commissionDistributed: false,
      };

      // Clone sayfa üzerinden %15 komisyon hesaplama
      const cloneCommission = purchaseData.purchaseAmount! * 0.15;
      
      const response = await fetch("/api/clone-products/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...purchaseData,
          clonePageMemberId: pageData.member.id,
          cloneCommissionRate: 0.15,
          cloneCommissionAmount: cloneCommission,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ Sipariş başarıyla oluşturuldu! 
        
🎯 ${pageData.member.fullName} üyesi ${cloneCommission.toFixed(2)}$ komisyon kazandı!
📦 Sipariş No: ${result.orderId}
🚚 Kargo bilgileri email ile gönderilecek`);
        
        setPurchaseDialogOpen(false);
        setSelectedProduct(null);
        
        // İstatistikleri güncelle
        if (pageData) {
          setPageData({
            ...pageData,
            cloneStats: {
              ...pageData.cloneStats,
              purchases: pageData.cloneStats.purchases + 1,
              totalCommissions: pageData.cloneStats.totalCommissions + cloneCommission,
            },
          });
        }
      } else {
        alert("❌ Sipariş oluşturulurken hata oluştu. Lütfen tekrar deneyin.");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      alert("❌ Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setProcessingPurchase(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Link kopyalandı!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-spiritual-purple rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-muted-foreground">Ürün sayfası yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Sayfa Bulunamadı</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Bu üyenin ürün sayfası bulunamadı.</p>
            <Button onClick={() => navigate("/")}>Ana Sayfaya Dön</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-spiritual-purple rounded-lg flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-spiritual-purple bg-clip-text text-transparent">
                  Kutbul Zaman
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Ürün Mağazası
              </Badge>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-spiritual-gold/20 via-transparent to-primary/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-spiritual-gold to-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <Badge className="mb-4">
                🛍️ {pageData.member.fullName} - Özel Ürün Mağazası
              </Badge>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-spiritual-gold via-primary to-spiritual-purple bg-clip-text text-transparent">
                Premium Manevi Ürünler
              </span>
            </h1>
            <p className="text-xl text-foreground/80 mb-6 max-w-3xl mx-auto">
              {pageData.member.fullName} sponsorluğunda alışveriş yapın ve özel komisyon avantajından yararlanın.
              Her alışverişinizde otomatik olarak %15 komisyon kazandırırsınız!
            </p>

            <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              <Card className="border-spiritual-gold/20 bg-spiritual-gold/5">
                <CardContent className="p-4 text-center">
                  <Crown className="w-6 h-6 text-spiritual-gold mx-auto mb-2" />
                  <p className="text-sm font-medium">Sponsor: {pageData.member.fullName}</p>
                  <p className="text-xs text-muted-foreground">{pageData.member.referralCode}</p>
                </CardContent>
              </Card>
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 text-center">
                  <Zap className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">%15 Otomatik Komisyon</p>
                  <p className="text-xs text-muted-foreground">Her alışverişte</p>
                </CardContent>
              </Card>
              <Card className="border-green-500/20 bg-green-500/5">
                <CardContent className="p-4 text-center">
                  <Package className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Anında İşlem</p>
                  <p className="text-xs text-muted-foreground">Sistem entegrasyonu</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <Eye className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                <p className="text-2xl font-bold">{pageData.cloneStats.visits}</p>
                <p className="text-sm text-muted-foreground">Sayfa Ziyareti</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <ShoppingCart className="w-8 h-8 mx-auto mb-3 text-green-600" />
                <p className="text-2xl font-bold">{pageData.cloneStats.purchases}</p>
                <p className="text-sm text-muted-foreground">Başarılı Alışveriş</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <TrendingUp className="w-8 h-8 mx-auto mb-3 text-spiritual-gold" />
                <p className="text-2xl font-bold">${pageData.cloneStats.totalCommissions.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Toplam Komisyon</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Premium Ürün Koleksiyonu
            </h2>
            <p className="text-foreground/80 max-w-2xl mx-auto">
              Manevi gelişim ve yaşam kalitenizi artıracak özenle seçilmiş ürünler
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pageData.products.map((product) => (
              <Card key={product.id} className="border-border/20 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all hover:shadow-xl">
                <CardHeader className="p-0">
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                    {product.originalPrice && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-spiritual-gold text-white px-2 py-1 rounded-full text-xs font-bold">
                      %15 Komisyon
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-3">
                    <Badge variant="outline" className="mb-2">{product.category}</Badge>
                    <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                    <p className="text-sm text-foreground/70 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-sm text-muted-foreground ml-2">
                        ({product.reviews})
                      </span>
                    </div>
                    <Badge variant={product.inStock ? "default" : "secondary"}>
                      {product.inStock ? "Stokta" : "Tükendi"}
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl font-bold text-primary">
                        ${product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-spiritual-gold font-medium">
                      Bu satıştan {pageData.member.fullName} ${(product.price * 0.15).toFixed(2)} kazanacak
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Dialog open={purchaseDialogOpen && selectedProduct?.id === product.id} onOpenChange={setPurchaseDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full bg-gradient-to-r from-spiritual-gold to-spiritual-gold/80 hover:from-spiritual-gold/90 hover:to-spiritual-gold/70"
                          disabled={!product.inStock}
                          onClick={() => setSelectedProduct(product)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {product.inStock ? "Satın Al" : "Stokta Yok"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Ürün Satın Al - {product.name}</DialogTitle>
                          <DialogDescription>
                            {pageData.member.fullName} sponsorluğunda güvenli alışveriş
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                          {/* Ürün Özeti */}
                          <Card className="border-spiritual-gold/20 bg-spiritual-gold/5">
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-4">
                                <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-lg" />
                                <div className="flex-1">
                                  <h4 className="font-bold">{product.name}</h4>
                                  <p className="text-2xl font-bold text-primary">${product.price}</p>
                                  <p className="text-sm text-spiritual-gold">
                                    🎯 {pageData.member.fullName} ${(product.price * 0.15 * selectedQuantity).toFixed(2)} komisyon kazanacak
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Adet Seçimi */}
                          <div>
                            <Label>Adet</Label>
                            <div className="flex items-center space-x-3 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                              >
                                -
                              </Button>
                              <span className="w-12 text-center font-bold">{selectedQuantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedQuantity(selectedQuantity + 1)}
                              >
                                +
                              </Button>
                            </div>
                          </div>

                          {/* Teslimat Bilgileri */}
                          <div className="space-y-4">
                            <h4 className="font-medium">Teslimat Bilgileri</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Ad Soyad *</Label>
                                <Input
                                  value={shippingAddress.fullName}
                                  onChange={(e) => setShippingAddress({...shippingAddress, fullName: e.target.value})}
                                  placeholder="Tam adınız"
                                />
                              </div>
                              <div>
                                <Label>Telefon *</Label>
                                <Input
                                  value={shippingAddress.phone}
                                  onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                                  placeholder="0555 123 45 67"
                                />
                              </div>
                            </div>
                            <div>
                              <Label>Adres *</Label>
                              <Textarea
                                value={shippingAddress.address}
                                onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                                placeholder="Mahalle, sokak, apartman no"
                                rows={3}
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label>İl *</Label>
                                <Input
                                  value={shippingAddress.city}
                                  onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                                  placeholder="İstanbul"
                                />
                              </div>
                              <div>
                                <Label>İlçe *</Label>
                                <Input
                                  value={shippingAddress.state}
                                  onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                                  placeholder="Kadıköy"
                                />
                              </div>
                              <div>
                                <Label>Posta Kodu</Label>
                                <Input
                                  value={shippingAddress.zipCode}
                                  onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                                  placeholder="34000"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Toplam ve Komisyon */}
                          <Card className="border-primary/20 bg-primary/5">
                            <CardContent className="p-4 space-y-2">
                              <div className="flex justify-between">
                                <span>Ürün Fiyatı:</span>
                                <span>${product.price}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Adet:</span>
                                <span>{selectedQuantity}</span>
                              </div>
                              <div className="flex justify-between font-bold text-lg">
                                <span>Toplam:</span>
                                <span>${(product.price * selectedQuantity).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-spiritual-gold font-medium">
                                <span>Sponsor Komisyonu (%15):</span>
                                <span>${(product.price * selectedQuantity * 0.15).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-blue-600 font-medium">
                                <span>Network Dağıtımı (%35):</span>
                                <span>${(product.price * selectedQuantity * 0.35).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-gray-500 text-sm">
                                <span>Sistem/Şirket (%50):</span>
                                <span>${(product.price * selectedQuantity * 0.50).toFixed(2)}</span>
                              </div>
                            </CardContent>
                          </Card>

                          <div className="flex space-x-3">
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => setPurchaseDialogOpen(false)}
                            >
                              İptal
                            </Button>
                            <Button 
                              className="flex-1 bg-gradient-to-r from-spiritual-gold to-primary"
                              onClick={handleProductPurchase}
                              disabled={processingPurchase || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city}
                            >
                              {processingPurchase ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                  İşleniyor...
                                </>
                              ) : (
                                <>
                                  <CreditCard className="w-4 h-4 mr-2" />
                                  Satın Al
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button variant="outline" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      Detayları Gör
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Commission Info Section */}
      <section className="py-12 bg-gradient-to-r from-spiritual-gold/10 to-primary/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-spiritual-gold/20 bg-spiritual-gold/5">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-spiritual-gold to-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">🎯 Özel Komisyon Sistemi</h3>
                <div className="bg-white/50 rounded-lg p-6 mb-6">
                  <p className="text-lg mb-4">
                    Bu sayfadan yapılan her alışverişte:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 text-left">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-spiritual-gold" />
                      <span><strong>%15</strong> otomatik sponsor komisyonu</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-spiritual-gold" />
                      <span><strong>Anında</strong> hesapta görünür</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-spiritual-gold" />
                      <span><strong>Müşteri takibi</strong> sisteme kaydedilir</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-spiritual-gold" />
                      <span><strong>MLM dağıtımı</strong> normal devam eder</span>
                    </div>
                  </div>
                </div>
                <p className="text-spiritual-gold font-bold text-lg">
                  Sponsor: {pageData.member.fullName} ({pageData.member.referralCode})
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Share Section */}
      <section className="py-12 bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Share2 className="w-5 h-5 mr-2 text-primary" />
                Bu Sayfayı Paylaş
              </CardTitle>
              <CardDescription>
                Arkadaşlarınızla paylaşın ve {pageData.member.fullName} üyesi komisyon kazansın
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-3 bg-muted rounded border text-sm font-mono">
                  {window.location.href}
                </div>
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(window.location.href)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    const text = `${pageData.member.fullName} sponsorluğunda özel ürün mağazasına göz atın! ${window.location.href}`;
                    window.open(`whatsapp://send?text=${encodeURIComponent(text)}`, "_blank");
                  }}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const text = `Kutbul Zaman özel ürün mağazası: ${window.location.href}`;
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    window.open(`mailto:?subject=Özel Ürün Mağazası&body=Merhaba, ${pageData.member.fullName} sponsorluğunda özel ürün mağazasına göz atın: ${window.location.href}`, "_blank");
                  }}
                >
                  <Mail className="w-4 h-4 mr-1" />
                  Email
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: "Kutbul Zaman Ürün Mağazası",
                        text: `${pageData.member.fullName} özel mağazası`,
                        url: window.location.href,
                      });
                    }
                  }}
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  Paylaş
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/40 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-spiritual-purple rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-spiritual-purple bg-clip-text text-transparent">
                Kutbul Zaman
              </span>
            </div>
            <p className="text-foreground/60 mb-6">
              Manevi değerlerle sürdürülebilir büyüme
            </p>
            <div className="text-sm text-foreground/50 space-y-2">
              <p>
                Bu ürün mağazası {pageData.member.fullName} tarafından paylaşılmaktadır.
              </p>
              <p>
                Sayfa ziyareti: {pageData.cloneStats.visits} | Başarılı alışveriş: {pageData.cloneStats.purchases}
              </p>
              <div className="bg-spiritual-gold/10 rounded-lg p-3 mt-4">
                <p className="text-spiritual-gold font-semibold text-sm">
                  🛍️ Bu sayfadan yapılan tüm alışverişlerde %15 otomatik komisyon sistemi aktiftir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
