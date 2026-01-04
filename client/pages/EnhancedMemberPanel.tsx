import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Progress } from "../components/ui/progress";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Users,
  DollarSign,
  TrendingUp,
  Award,
  Share2,
  QrCode,
  Crown,
  Settings,
  Zap,
  Target,
  Activity,
  Sparkles,
  Network,
  BarChart3,
  Star,
  Gift,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ShoppingCart,
  Package,
  Eye,
  CreditCard,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
// BinaryNetworkTree removed - replaced with Monoline MLM system

interface MemberPanelProps {
  userId: string;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  memberId: string;
  referralCode: string;
  careerLevel: {
    name: string;
    description: string;
    commissionRate: number;
    passiveIncomeRate: number;
    bonus: number;
  };
  wallet: {
    balance: number;
    totalEarnings: number;
    sponsorBonus: number;
    careerBonus: number;
    passiveIncome: number;
    leadershipBonus: number;
  };
  totalInvestment: number;
  directReferrals: number;
  totalTeamSize: number;
  isActive: boolean;
}

interface ActivityStats {
  daysSinceLastActivity: number;
  monthlyActivityStatus: "active" | "inactive" | "warning";
  monthlyActivityStreak: number;
  daysUntilYearlyRenewal: number;
  daysUntilRenewalWarning: number;
  renewalStatus: "active" | "warning" | "expired";
}

interface MonolineStats {
  totalVolume: number;
  monolinePosition: number;
  networkDepth: number;
  directReferrals: number;
  passiveBonus: number;
  nextLevelBonus: number;
}

const EnhancedMemberPanel: React.FC<MemberPanelProps> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);
  const [monolineStats, setMonolineStats] = useState<MonolineStats | null>(null);
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(
    null,
  );
  const [cloneInfo, setCloneInfo] = useState({
    customMessage: "",
    visits: 0,
    conversions: 0,
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [customMessage, setCustomMessage] = useState("");
  const [monolineSystemActivated, setMonolineSystemActivated] = useState(false);
  const [products, setProducts] = useState([]);
  const [productPurchases, setProductPurchases] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadMemberData();
  }, [userId]);

  const loadMemberData = async () => {
    try {
      setLoading(true);
      const [
        dashboardResponse,
        monolineResponse,
        cloneResponse,
        teamResponse,
        transactionsResponse,
        activityResponse,
        productsResponse,
        purchasesResponse,
      ] = await Promise.all([
        fetch(`/api/user/${userId}/dashboard`),
        fetch(`/api/mlm/monoline-stats/${userId}`),
        fetch(`/api/user/${userId}/clone-info`),
        fetch(`/api/user/${userId}/team`),
        fetch(`/api/user/${userId}/transactions`),
        fetch(`/api/auth/user/${userId}/activity-stats`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }),
        fetch(`/api/products`),
        fetch(`/api/user/${userId}/product-purchases`),
      ]);

      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        setUser(dashboardData.user);
      }

      if (monolineResponse.ok) {
        const monolineData = await monolineResponse.json();
        setMonolineStats(monolineData.stats);
      }

      if (cloneResponse.ok) {
        const cloneData = await cloneResponse.json();
        setCloneInfo(cloneData);
        setCustomMessage(cloneData.customMessage);
      }

      if (teamResponse.ok) {
        const teamData = await teamResponse.json();
        setTeamMembers(teamData.team);
      }

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData.transactions || []);
      }

      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setActivityStats(activityData.activityStats);
      }

      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData.products || []);
      }

      if (purchasesResponse.ok) {
        const purchasesData = await purchasesResponse.json();
        setProductPurchases(purchasesData.purchases || []);
      }
    } catch (error) {
      console.error("Error loading member data:", error);
    } finally {
      setLoading(false);
    }
  };

  const activateMonolineSystem = async () => {
    try {
      const response = await fetch("/api/mlm/activate-monoline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setMonolineSystemActivated(true);
        await loadMemberData();
      }
    } catch (error) {
      console.error("Error activating monoline system:", error);
    }
  };

  const calculateMonolineBonus = async () => {
    try {
      const response = await fetch(`/api/mlm/calculate-monoline/${userId}`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.applied) {
          alert(`Monoline bonus uygulandı: $${data.monolineBonus}`);
          await loadMemberData();
        } else {
          alert("Monoline bonus henüz uygulanamadı (minimum $20 gerekli)");
        }
      }
    } catch (error) {
      console.error("Error calculating monoline bonus:", error);
    }
  };

  const generateQRCode = (text: string) => {
    const baseUrl = "https://api.qrserver.com/v1/create-qr-code/";
    const params = new URLSearchParams({
      size: "200x200",
      data: text,
      format: "png",
      bgcolor: "FFFFFF",
      color: "000000",
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const shareToSocial = (platform: string) => {
    const referralLink = `${window.location.origin}/clone/${user?.memberId}`;
    const message = `Kutbul Zaman - Manevi Rehberim sistemine katılın! ${customMessage}`;

    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(message)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(referralLink)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message + " " + referralLink)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(message)}`,
    };

    window.open(urls[platform as keyof typeof urls], "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Kullanıcı bilgileri yüklenemedi</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Hoş Geldiniz, {user.fullName}
          </h1>
          <p className="text-gray-600">
            Üye ID: {user.memberId} | {user.careerLevel.name}
          </p>
        </div>
        <Badge
          variant={user.isActive ? "default" : "secondary"}
          className="text-lg px-4 py-2"
        >
          {user.isActive ? "✓ Aktif Üye" : "⚠ Pasif Üye"}
        </Badge>
      </div>

      {/* Monoline System Activation Banner */}
      {!monolineSystemActivated && (
        <Alert className="border-purple-200 bg-purple-50">
          <Zap className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong>💎 Monoline MLM Sistemini Aktifleştirin!</strong>
              <p className="text-sm">
                7 seviyeye kadar komisyon, otomatik yerleştirme ve 100,000 kişi
                kapasitesi ile sisteminizi güçlendirin.
              </p>
            </div>
            <Button onClick={activateMonolineSystem} className="ml-4">
              <Network className="w-4 h-4 mr-2" />
              Aktifleştir
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="monoline" className="flex items-center gap-2">
            <Network className="w-4 h-4" />
            💎 Monoline MLM
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Ekip
          </TabsTrigger>
          <TabsTrigger value="earnings" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Kazançlar
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Ürünler
          </TabsTrigger>
          <TabsTrigger value="sharing" className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Paylaşım
          </TabsTrigger>
          <TabsTrigger value="spiritual" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Manevi
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Toplam Bakiye</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${user.wallet.balance.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Toplam Kazanç</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ${user.wallet.totalEarnings.toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Direkt Üyeler</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {user.directReferrals}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Toplam Ekip</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {user.totalTeamSize}
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Tracking Section */}
          {activityStats && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Aktiflik Durumu ve Yenileme Takibi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Monthly Activity Status */}
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      {activityStats.monthlyActivityStatus === "active" ? (
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                      ) : activityStats.monthlyActivityStatus === "warning" ? (
                        <AlertTriangle className="h-8 w-8 text-yellow-500" />
                      ) : (
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">Aylık Aktiflik</p>
                    <p
                      className={`text-lg font-bold ${
                        activityStats.monthlyActivityStatus === "active"
                          ? "text-green-600"
                          : activityStats.monthlyActivityStatus === "warning"
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {activityStats.monthlyActivityStatus === "active"
                        ? "Aktif"
                        : activityStats.monthlyActivityStatus === "warning"
                          ? "Uyarı"
                          : "Pasif"}
                    </p>
                    <p className="text-xs text-gray-400">
                      Son aktiflik: {activityStats.daysSinceLastActivity} gün
                      önce
                    </p>
                  </div>

                  {/* Activity Streak */}
                  <div className="text-center">
                    <Calendar className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Aktiflik Serisi</p>
                    <p className="text-xl font-bold text-purple-600">
                      {activityStats.monthlyActivityStreak} ay
                    </p>
                    <p className="text-xs text-gray-400">Kesintisiz aktif</p>
                  </div>

                  {/* Yearly Renewal Status */}
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      {activityStats.renewalStatus === "active" ? (
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                      ) : activityStats.renewalStatus === "warning" ? (
                        <AlertTriangle className="h-8 w-8 text-yellow-500" />
                      ) : (
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">Yıllık Yenileme</p>
                    <p
                      className={`text-lg font-bold ${
                        activityStats.renewalStatus === "active"
                          ? "text-green-600"
                          : activityStats.renewalStatus === "warning"
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {activityStats.daysUntilYearlyRenewal > 0
                        ? `${activityStats.daysUntilYearlyRenewal} gün kaldı`
                        : "Süresi doldu"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {activityStats.renewalStatus === "warning" &&
                        "Yakında yenileme gerekli"}
                      {activityStats.renewalStatus === "expired" &&
                        "Yenileme yapın"}
                      {activityStats.renewalStatus === "active" &&
                        "Aktif üyelik"}
                    </p>
                  </div>

                  {/* Quick Action */}
                  <div className="text-center">
                    <Button
                      onClick={async () => {
                        try {
                          const response = await fetch(
                            `/api/auth/user/${userId}/update-activity`,
                            {
                              method: "POST",
                              headers: {
                                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                              },
                            },
                          );
                          if (response.ok) {
                            await loadMemberData(); // Refresh data
                            alert("Aktiflik durumu güncellendi!");
                          }
                        } catch (error) {
                          console.error("Activity update error:", error);
                        }
                      }}
                      className="mb-2 w-full"
                      variant="outline"
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      Aktifliği Güncelle
                    </Button>
                    <p className="text-xs text-gray-500">
                      Son güncelleme ile aktiflik durumunuzu yenileyin
                    </p>
                  </div>
                </div>

                {/* Activity Progress Bar */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">
                      Aylık Aktiflik İlerlemesi
                    </span>
                    <span className="text-sm text-gray-500">
                      {Math.max(0, 30 - activityStats.daysSinceLastActivity)}/30
                      gün
                    </span>
                  </div>
                  <Progress
                    value={Math.max(
                      0,
                      ((30 - activityStats.daysSinceLastActivity) / 30) * 100,
                    )}
                    className="h-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    30 gün içinde aktif kalarak bonuslarınızı alın
                  </p>
                </div>

                {/* Renewal Alert */}
                {activityStats.renewalStatus !== "active" && (
                  <Alert
                    className={`mt-4 ${
                      activityStats.renewalStatus === "warning"
                        ? "border-yellow-200 bg-yellow-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {activityStats.renewalStatus === "warning" && (
                        <div>
                          <strong>Yenileme Uyarısı:</strong> Yıllık üyeliğinizin
                          yenilenmesine {activityStats.daysUntilYearlyRenewal}{" "}
                          gün kaldı. Kesintisiz hizmet almak için zamanında
                          yenileyiniz.
                        </div>
                      )}
                      {activityStats.renewalStatus === "expired" && (
                        <div>
                          <strong>Üyelik Süresi Doldu:</strong> Yıllık
                          üyeliğinizin süresi dolmuştur. Tüm özelliklerden
                          yararlanmak için üyeliğinizi yenileyin.
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Monoline Stats Quick View */}
          {monolineStats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="w-5 h-5 text-purple-600" />
                  💎 Monoline MLM Özeti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Monoline Pozisyon</p>
                    <p className="text-xl font-bold text-purple-600">
                      #{monolineStats.monolinePosition || Math.floor(Math.random() * 1000) + 1}
                    </p>
                    <p className="text-xs text-gray-400">
                      Tek hat sıralama
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Network Derinliği</p>
                    <p className="text-xl font-bold text-blue-600">
                      {monolineStats.networkDepth || 7} seviye
                    </p>
                    <p className="text-xs text-gray-400">
                      {monolineStats.directReferrals || 0} direkt referans
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Pasif Bonus</p>
                    <p className="text-xl font-bold text-green-600">
                      ${monolineStats.passiveBonus?.toLocaleString() || '0'}
                    </p>
                    <Button
                      size="sm"
                      onClick={calculateMonolineBonus}
                      className="mt-2"
                    >
                      <Gift className="w-4 h-4 mr-1" />
                      Hesapla
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Career Level Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-600" />
                Kariyer Seviyesi: {user.careerLevel.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">{user.careerLevel.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Komisyon Oranı</p>
                    <p className="text-lg font-semibold">
                      %{user.careerLevel.commissionRate}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pasif Gelir Oranı</p>
                    <p className="text-lg font-semibold">
                      %{user.careerLevel.passiveIncomeRate}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monoline MLM Tab */}
        <TabsContent value="monoline" className="space-y-6">
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">💎 Monoline MLM Network</h4>
              <div className="text-center space-y-2">
                <div className="text-lg font-bold text-purple-600">
                  Pozisyon #{monolineStats?.monolinePosition || Math.floor(Math.random() * 1000) + 1}
                </div>
                <div className="text-sm text-gray-600">
                  Tek hat MLM sisteminde sıralı yerleşim
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{monolineStats?.directReferrals || 0}</div>
                <div className="text-sm text-gray-600">Direkt Referanslar</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{monolineStats?.networkDepth || 7}</div>
                <div className="text-sm text-gray-600">Seviye Derinliği</div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ekip Üyeleri ({teamMembers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {teamMembers.length > 0 ? (
                <div className="grid gap-4">
                  {teamMembers.map((member: any) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-semibold">{member.fullName}</h4>
                        <p className="text-sm text-gray-500">
                          {member.memberId} | {member.careerLevel}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ${member.totalInvestment.toLocaleString()}
                        </p>
                        <Badge
                          variant={member.isActive ? "default" : "secondary"}
                        >
                          {member.isActive ? "Aktif" : "Pasif"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">
                  Henüz ekip üyeniz bulunmuyor
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          {/* Product Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Toplam Alışveriş</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${productPurchases.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                    </p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Aylık Alışveriş</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ${productPurchases
                        .filter(p => new Date(p.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
                        .reduce((sum, p) => sum + p.amount, 0)
                        .toLocaleString()}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Toplam Sipariş</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {productPurchases.length}
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Shop */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Hızlı Alışveriş
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.slice(0, 6).map((product) => (
                  <Card key={product.id} className="group hover:shadow-lg transition-all">
                    <div className="relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setSelectedProduct(product)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-sm mb-2">{product.name}</h4>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-primary">${product.price}</span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(product.rating)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(`/products?product=${product.id}&ref=${user.memberId}`, '_blank')}
                      >
                        Satın Al
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="text-center mt-6">
                <Button
                  variant="outline"
                  onClick={() => window.open(`/products?ref=${user.memberId}`, '_blank')}
                >
                  Tüm Ürünleri Görüntüle
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Purchases */}
          <Card>
            <CardHeader>
              <CardTitle>Son Alışverişlerim</CardTitle>
            </CardHeader>
            <CardContent>
              {productPurchases.length > 0 ? (
                <div className="space-y-3">
                  {productPurchases.slice(0, 5).map((purchase) => (
                    <div
                      key={purchase.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={purchase.product?.image || '/placeholder.svg'}
                          alt={purchase.product?.name || 'Ürün'}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <h4 className="font-medium">{purchase.product?.name || purchase.productName}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(purchase.createdAt).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${purchase.amount}</p>
                        <p className="text-xs text-green-600">
                          Komisyon: ${Math.round(purchase.amount * 0.4)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Henüz alışveriş yapılmamış</p>
                  <Button
                    onClick={() => window.open(`/products?ref=${user.memberId}`, '_blank')}
                  >
                    Alışverişe Başla
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Impact */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 text-center">🎯 Alışveriş Aktiflik Etkisi</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Bu Ayki Alışverişleriniz:</h4>
                  <p className="text-2xl font-bold text-green-600 mb-2">
                    ${productPurchases
                      .filter(p => new Date(p.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
                      .reduce((sum, p) => sum + p.amount, 0)
                      .toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    ✅ Aylık aktifliğinize katkıda bulundu
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Bu Yılki Alışverişleriniz:</h4>
                  <p className="text-2xl font-bold text-blue-600 mb-2">
                    ${productPurchases
                      .filter(p => new Date(p.createdAt) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000))
                      .reduce((sum, p) => sum + p.amount, 0)
                      .toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    ✅ Yıllık aktifliğinize katkıda bulundu
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Earnings Tab */}
        <TabsContent value="earnings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Sponsor Bonusu</p>
                  <p className="text-xl font-bold text-green-600">
                    ${user.wallet.sponsorBonus.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Kariyer Bonusu</p>
                  <p className="text-xl font-bold text-blue-600">
                    ${user.wallet.careerBonus.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Pasif Gelir</p>
                  <p className="text-xl font-bold text-purple-600">
                    ${user.wallet.passiveIncome.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Liderlik Bonusu</p>
                  <p className="text-xl font-bold text-orange-600">
                    ${user.wallet.leadershipBonus.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-green-600" />
                E-Cüzdan
              </CardTitle>
              <CardDescription>Bakiyenizi yönetin, para yatırma/çekme talebi oluşturun</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button onClick={() => navigate('/wallet')} className="bg-green-600 hover:bg-green-700">Detayları Gör</Button>
              <Button variant="outline" onClick={() => navigate('/wallet')}>Para Yatır</Button>
              <Button variant="outline" onClick={() => navigate('/wallet')}>Para Çek</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Son İşlemler</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="space-y-2">
                  {transactions.slice(0, 10).map((transaction: any) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div
                        className={`font-bold ${
                          transaction.amount > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        ${Math.abs(transaction.amount).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">
                  Henüz işlem geçmişiniz bulunmuyor
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sharing Tab */}
        <TabsContent value="sharing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Klon Sayfa Paylaşımı</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="custom-message">Özel Mesajınız</Label>
                <Textarea
                  id="custom-message"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Referans linkinizle birlikte paylaşılacak özel mesajınızı yazın..."
                  rows={3}
                />
                <Button
                  className="mt-2"
                  onClick={async () => {
                    try {
                      await fetch(`/api/user/${userId}/clone-message`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ customMessage }),
                      });
                      alert("Mesaj güncellendi!");
                    } catch (error) {
                      alert("Mesaj güncellenemedi");
                    }
                  }}
                >
                  Mesajı Güncelle
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Referans Linkiniz</h4>
                  <Input
                    value={`${window.location.origin}/clone/${user.memberId}`}
                    readOnly
                    className="mb-3"
                  />
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/clone/${user.memberId}`,
                      );
                      alert("Link kopyalandı!");
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Linki Kopyala
                  </Button>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">QR Kod</h4>
                  <div className="text-center">
                    <img
                      src={generateQRCode(
                        `${window.location.origin}/clone/${user.memberId}`,
                      )}
                      alt="QR Code"
                      className="mx-auto border rounded"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Sosyal Medya Paylaşımı</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button
                    onClick={() => shareToSocial("whatsapp")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    WhatsApp
                  </Button>
                  <Button
                    onClick={() => shareToSocial("facebook")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Facebook
                  </Button>
                  <Button
                    onClick={() => shareToSocial("twitter")}
                    className="bg-sky-500 hover:bg-sky-600"
                  >
                    Twitter
                  </Button>
                  <Button
                    onClick={() => shareToSocial("telegram")}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Telegram
                  </Button>
                </div>
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {cloneInfo.visits}
                      </p>
                      <p className="text-sm text-gray-500">Sayfa Ziyareti</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {cloneInfo.conversions}
                      </p>
                      <p className="text-sm text-gray-500">Kayıt Dönüşümü</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Spiritual Tab */}
        <TabsContent value="spiritual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Manevi Gelişim Merkezi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">
                    Mevcut Nefis Mertebeniz: {user.careerLevel.name}
                  </h4>
                  <p className="text-gray-600">
                    {user.careerLevel.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium mb-2">Ruhsal Hedefler</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Günlük zikir ve dua</li>
                      <li>• Manevi kitap okuma</li>
                      <li>• Topluma faydalı olma</li>
                      <li>• Nefis terbiyesi</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Finansal Hedefler</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Ekip genişletme</li>
                      <li>• Pasif gelir artışı</li>
                      <li>• Yatırım büyütme</li>
                      <li>• Finansal özgürlük</li>
                    </ul>
                  </div>
                </div>

                <Alert className="border-purple-200 bg-purple-50">
                  <Star className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Manevi Rehberlik:</strong> Monoline MLM sistemi
                    sadece finansal gelişim değil, aynı zamanda manevi büyüme
                    için de tasarlanmıştır. Her seviye, nefsinizi terbiye etme
                    yolculuğunuzdaki bir merhaledir.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product Detail Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProduct.name}</DialogTitle>
                <DialogDescription>
                  {selectedProduct.category} • {selectedProduct.rating} ⭐ ({selectedProduct.reviews} yorum)
                </DialogDescription>
              </DialogHeader>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-60 object-cover rounded-lg"
                  />
                </div>

                <div className="space-y-4">
                  <p className="text-gray-700">{selectedProduct.description}</p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-lg">Fiyat:</span>
                      <span className="text-2xl font-bold text-primary">
                        ${selectedProduct.price}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Komisyon:</span>
                      <span className="text-green-600 font-medium">
                        ${Math.round(selectedProduct.price * 0.4)}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => window.open(`/products?product=${selectedProduct.id}&ref=${user.memberId}`, '_blank')}
                    className="w-full"
                    size="lg"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Satın Al
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedMemberPanel;
