import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import {
  Crown,
  Wallet,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Minus,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Send,
  CreditCard,
  Banknote,
  ArrowLeftRight,
  Gift,
  ShoppingCart,
  Undo,
  AlertCircle,
  Activity,
  BarChart3,
  Calendar,
  Search,
  ArrowLeft,
  Upload,
  FileText,
  Building,
  Receipt,
  PiggyBank,
  Target,
  Zap,
  Star,
  Users,
  Shield,
  Lock,
  Unlock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MonolineCommissionHistory } from "@/components/MonolineCommissionHistory";

interface WalletData {
  balance: number;
  totalEarnings: number;
  sponsorBonus: number;
  careerBonus: number;
  passiveIncome: number;
  leadershipBonus: number;
  pendingWithdrawals: number;
  totalInvestment: number;
  availableForWithdrawal: number;
  lastTransaction: string;
}

interface Investment {
  id: string;
  type: "entry" | "monthly" | "yearly";
  amount: number;
  status: "pending" | "approved" | "rejected";
  receiptUrl?: string;
  iban: string;
  accountHolder: string;
  requestDate: string;
  processedDate?: string;
  adminNote?: string;
  paymentMethod: "bank_transfer" | "crypto" | "cash";
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  iban: string;
  accountHolder: string;
  status: "pending" | "processing" | "completed" | "rejected";
  requestDate: string;
  processedDate?: string;
  adminNote?: string;
  fee: number;
  netAmount: number;
}

interface CommissionCalculation {
  totalInvestment: number;
  sponsorBonus: number; // 10%
  careerBonus: number; // 25%
  passiveIncome: number; // 5%
  systemFund: number; // 60%
  calculations: {
    sponsor: { rate: number; amount: number };
    career: { rate: number; amount: number };
    passive: { rate: number; amount: number };
    system: { rate: number; amount: number };
  };
}

export default function EWalletFinancial() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [walletData, setWalletData] = useState<WalletData>({
    balance: 0,
    totalEarnings: 0,
    sponsorBonus: 0,
    careerBonus: 0,
    passiveIncome: 0,
    leadershipBonus: 0,
    pendingWithdrawals: 0,
    totalInvestment: 0,
    availableForWithdrawal: 0,
    lastTransaction: "",
  });

  const [investments, setInvestments] = useState<Investment[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [commissionCalc, setCommissionCalc] = useState<CommissionCalculation>({
    totalInvestment: 0,
    sponsorBonus: 0,
    careerBonus: 0,
    passiveIncome: 0,
    systemFund: 0,
    calculations: {
      sponsor: { rate: 10, amount: 0 },
      career: { rate: 25, amount: 0 },
      passive: { rate: 5, amount: 0 },
      system: { rate: 60, amount: 0 },
    },
  });

  // Investment Form
  const [investmentForm, setInvestmentForm] = useState({
    type: "entry",
    amount: "",
    iban: "",
    accountHolder: "",
    paymentMethod: "bank_transfer",
    receiptFile: null as File | null,
  });

  // Withdrawal Form
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: "",
    iban: "",
    accountHolder: "",
  });

  // Transfer Form
  const [transferForm, setTransferForm] = useState({
    targetMemberId: "",
    amount: "",
    description: "",
  });

  // Dialog States
  const [investDialogOpen, setInvestDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [receiptViewOpen, setReceiptViewOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<string>("");

  useEffect(() => {
    checkAuthentication();
    loadWalletData();
    loadInvestments();
    loadWithdrawals();
    calculateCommissions();

    // Set up real-time updates
    const interval = setInterval(() => {
      loadWalletData();
      loadInvestments();
      loadWithdrawals();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const checkAuthentication = async () => {
    try {
      const currentUserData = localStorage.getItem("currentUser");
      const authToken = localStorage.getItem("authToken");

      console.log(
        "Auth check - currentUser:",
        currentUserData ? "exists" : "missing",
      );
      console.log("Auth check - authToken:", authToken ? "exists" : "missing");

      if (!currentUserData || !authToken) {
        console.log("Missing authentication data, redirecting to login");
        navigate("/login");
        return;
      }

      const currentUser = JSON.parse(currentUserData);
      setCurrentUser(currentUser);
      if (!currentUser.id) {
        console.log("Invalid user data, redirecting to login");
        navigate("/login");
        return;
      }

      // Test the token by making a quick API call
      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          console.log("Token validation failed, redirecting to login");
          localStorage.removeItem("authToken");
          localStorage.removeItem("currentUser");
          navigate("/login");
          return;
        }
      } catch (apiError) {
        console.error("Token validation error:", apiError);
        navigate("/login");
        return;
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      navigate("/login");
    }
  };

  const loadWalletData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      console.log("Auth token:", token ? "exists" : "missing");

      if (!token) {
        console.error("No auth token found, redirecting to login");
        navigate("/login");
        return;
      }

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Wallet(me) API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          const u = data.user;
          setWalletData({
            balance: u.wallet?.balance || 0,
            totalEarnings: u.wallet?.totalEarnings || 0,
            sponsorBonus: u.wallet?.sponsorBonus || 0,
            careerBonus: u.wallet?.careerBonus || 0,
            passiveIncome: u.wallet?.passiveIncome || 0,
            leadershipBonus: u.wallet?.leadershipBonus || 0,
            pendingWithdrawals: 0,
            totalInvestment: u.totalInvestment || 0,
            availableForWithdrawal: u.wallet?.balance || 0,
            lastTransaction: "",
          });
        }
      } else {
        console.error("Wallet API error:", response.status);
        if (response.status === 401) {
          console.error("Token invalid, redirecting to login");
          localStorage.removeItem("authToken");
          localStorage.removeItem("currentUser");
          navigate("/login");
        }
      }
    } catch (error) {
      console.error("Error loading wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadInvestments = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/wallet/transactions", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const deposits = (data.transactions || []).filter((t: any) => t.type === 'deposit');
          const mapped = deposits.map((t: any) => ({
            id: t.id,
            type: 'entry',
            amount: t.amount || 0,
            status: t.status || 'pending',
            iban: (t.bankAccount?.iban || '').toString(),
            accountHolder: t.bankAccount?.accountHolder || '',
            requestDate: t.createdAt || new Date().toISOString(),
            paymentMethod: t.paymentMethod || 'bank_transfer',
          }));
          setInvestments(mapped);
        }
      }
    } catch (error) {
      console.error("Error loading investments:", error);
    }
  };

  const loadWithdrawals = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/wallet/transactions", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const withdrawals = (data.transactions || []).filter((t: any) => t.type === 'withdrawal');
          const mapped = withdrawals.map((t: any) => ({
            id: t.id,
            amount: t.amount || 0,
            iban: (t.bankAccount?.iban || '').toString(),
            accountHolder: t.bankAccount?.accountHolder || '',
            status: t.status || 'pending',
            requestDate: t.createdAt || new Date().toISOString(),
            fee: t.fee || Math.round((t.amount || 0) * 0.02),
            netAmount: (t.amount || 0) - (t.fee || Math.round((t.amount || 0) * 0.02)),
          }));
          setWithdrawals(mapped);
        }
      }
    } catch (error) {
      console.error("Error loading withdrawals:", error);
    }
  };

  const calculateCommissions = () => {
    const totalInvestment = walletData.totalInvestment;
    const calculations = {
      sponsor: { rate: 10, amount: (totalInvestment * 10) / 100 },
      career: { rate: 25, amount: (totalInvestment * 25) / 100 },
      passive: { rate: 5, amount: (totalInvestment * 5) / 100 },
      system: { rate: 60, amount: (totalInvestment * 60) / 100 },
    };

    setCommissionCalc({
      totalInvestment,
      sponsorBonus: calculations.sponsor.amount,
      careerBonus: calculations.career.amount,
      passiveIncome: calculations.passive.amount,
      systemFund: calculations.system.amount,
      calculations,
    });
  };

  const submitInvestment = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const formData = new FormData();

      formData.append("type", investmentForm.type);
      formData.append("amount", investmentForm.amount);
      formData.append("iban", investmentForm.iban);
      formData.append("accountHolder", investmentForm.accountHolder);
      formData.append("paymentMethod", investmentForm.paymentMethod);

      if (investmentForm.receiptFile) {
        formData.append("receipt", investmentForm.receiptFile);
      }

      const response = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currency: 'TRY',
          amount: parseFloat(investmentForm.amount || '0') || 0,
          paymentMethod: investmentForm.paymentMethod || 'bank_transfer',
          reference: investmentForm.iban ? `IBAN: ${investmentForm.iban} - ${investmentForm.accountHolder || ''}` : undefined,
          notes: 'E-Wallet investment request'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert(
            "Yatırım talebiniz başarıyla gönderildi! Admin onayından sonra hesabınıza yansıtılacaktır.",
          );
          setInvestDialogOpen(false);
          setInvestmentForm({
            type: "entry",
            amount: "",
            iban: "",
            accountHolder: "",
            paymentMethod: "bank_transfer",
            receiptFile: null,
          });
          loadInvestments();
        } else {
          alert(`Hata: ${data.error}`);
        }
      } else {
        let message = `${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          message = errorData.error || errorData.message || message;
        } catch {}
        alert(`Hata: ${message}`);
      }
    } catch (error) {
      console.error("Error submitting investment:", error);
      alert("Yatırım gönderme sırasında hata oluştu.");
    }
  };

  const submitWithdrawal = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currency: 'TRY',
          amount: parseFloat(withdrawalForm.amount || '0') || 0,
          bankAccount: { iban: withdrawalForm.iban, accountHolder: withdrawalForm.accountHolder },
          notes: 'E-Wallet withdrawal request'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert(
            "Para çekme talebiniz başarıyla gönderildi! İşleminiz incelenecektir.",
          );
          setWithdrawDialogOpen(false);
          setWithdrawalForm({
            amount: "",
            iban: "",
            accountHolder: "",
          });
          loadWithdrawals();
          loadWalletData();
        } else {
          alert(`Hata: ${data.error}`);
        }
      } else {
        let message = `${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          message = errorData.error || errorData.message || message;
        } catch {}
        alert(`Hata: ${message}`);
      }
    } catch (error) {
      console.error("Error submitting withdrawal:", error);
      alert("Para çekme sırasında hata oluştu.");
    }
  };

  const submitTransfer = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/wallet/transfer", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transferForm),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert("Transfer başarıyla gerçekleştirildi!");
          setTransferDialogOpen(false);
          setTransferForm({
            targetMemberId: "",
            amount: "",
            description: "",
          });
          loadWalletData();
        } else {
          alert(`Hata: ${data.error}`);
        }
      } else {
        let message = `${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          message = errorData.error || errorData.message || message;
        } catch {}
        alert(`Hata: ${message}`);
      }
    } catch (error) {
      console.error("Error submitting transfer:", error);
      alert("Transfer sırasında hata oluştu.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600">
            <Clock className="w-3 h-3 mr-1" />
            Bekliyor
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="outline" className="text-blue-600">
            <RefreshCw className="w-3 h-3 mr-1" />
            İşleniyor
          </Badge>
        );
      case "approved":
      case "completed":
        return (
          <Badge variant="default" className="text-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Onaylandı
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Reddedildi
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'Tarih yok';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Geçersiz tarih';
      return date.toLocaleString("tr-TR");
    } catch (error) {
      return 'Tarih yok';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-spiritual-purple rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-muted-foreground">E-Cüzdan yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/member-panel")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-spiritual-purple rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-spiritual-purple bg-clip-text text-transparent">
                  E-Cüzdan & Finansal Sistem
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-600">
                <Shield className="w-3 h-3 mr-1" />
                Güvenli
              </Badge>
              <Button onClick={loadWalletData} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Yenile
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Wallet Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">
                Toplam Bakiye
              </CardTitle>
              <Wallet className="h-4 w-4 text-green-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(walletData.balance)}
              </div>
              <p className="text-xs text-green-100">
                Son işlem: {walletData.lastTransaction || "Henüz yok"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">
                Toplam Kazanç
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(walletData.totalEarnings)}
              </div>
              <p className="text-xs text-blue-100">
                Çekilebilir: {formatCurrency(walletData.availableForWithdrawal)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">
                Toplam Yatırım
              </CardTitle>
              <PiggyBank className="h-4 w-4 text-purple-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(walletData.totalInvestment)}
              </div>
              <p className="text-xs text-purple-100">
                Bekleyen: {formatCurrency(walletData.pendingWithdrawals)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-100">
                Bonus Gelirleri
              </CardTitle>
              <Star className="h-4 w-4 text-orange-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  walletData.sponsorBonus +
                    walletData.careerBonus +
                    walletData.passiveIncome +
                    walletData.leadershipBonus,
                )}
              </div>
              <p className="text-xs text-orange-100">Aktif komisyonlar</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="invest">Yatırım Yap</TabsTrigger>
              <TabsTrigger value="withdraw">Para Çek</TabsTrigger>
              <TabsTrigger value="transfer">Transfer</TabsTrigger>
              <TabsTrigger value="commissions">Komisyonlar</TabsTrigger>
              <TabsTrigger value="history">Geçmiş</TabsTrigger>
            </TabsList>

            <div className="flex space-x-2">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Rapor Al
              </Button>
            </div>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Kazanç Dağılımı</CardTitle>
                  <CardDescription>
                    Farklı kaynaklardan gelen kazançlarınız
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">
                        Sponsor Bonusu
                      </span>
                    </div>
                    <span className="font-bold text-green-600">
                      {formatCurrency(walletData.sponsorBonus)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Crown className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">
                        Kariyer Bonusu
                      </span>
                    </div>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(walletData.careerBonus)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium">Pasif Gelir</span>
                    </div>
                    <span className="font-bold text-purple-600">
                      {formatCurrency(walletData.passiveIncome)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-500/10 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium">
                        Liderlik Bonusu
                      </span>
                    </div>
                    <span className="font-bold text-orange-600">
                      {formatCurrency(walletData.leadershipBonus)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hızlı İşlemler</CardTitle>
                  <CardDescription>
                    Sık kullanılan finansal işlemler
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={() => setInvestDialogOpen(true)}
                      className="h-20 flex flex-col space-y-2"
                    >
                      <Plus className="w-6 h-6" />
                      <span>Yatırım Yap</span>
                    </Button>
                    <Button
                      onClick={() => setWithdrawDialogOpen(true)}
                      variant="outline"
                      className="h-20 flex flex-col space-y-2"
                    >
                      <Minus className="w-6 h-6" />
                      <span>Para Çek</span>
                    </Button
                    >
                    <Button
                      onClick={() => setTransferDialogOpen(true)}
                      variant="outline"
                      className="h-20 flex flex-col space-y-2"
                    >
                      <ArrowLeftRight className="w-6 h-6" />
                      <span>Transfer</span>
                    </Button>

                    <Button
                      onClick={() => navigate("/real-time-transactions")}
                      variant="outline"
                      className="h-20 flex flex-col space-y-2"
                    >
                      <Activity className="w-6 h-6" />
                      <span>İşlem Geçmişi</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Son İşlemler</CardTitle>
                <CardDescription>
                  En son finansal hareketleriniz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tip</TableHead>
                      <TableHead>Miktar</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Tarih</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      ...investments.slice(0, 3),
                      ...withdrawals.slice(0, 2),
                    ].map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {"type" in item ? (
                              <ArrowDownRight className="w-4 h-4 text-green-500" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4 text-red-500" />
                            )}
                            <span>
                              {"type" in item ? "Yatırım" : "Para Çekme"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(item.amount)}
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>{formatDate(item.requestDate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Investment Tab */}
          <TabsContent value="invest" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>🏦 IBAN Üzerinden Yatırım</CardTitle>
                <CardDescription>
                  Yatırım yapın ve dekont yükleyerek onay bekleyin. Admin
                  onayından sonra üyeliğiniz aktif olur.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="investType">Yatırım Paketi</Label>
                      <Select
                        value={investmentForm.type}
                        onValueChange={(value) =>
                          setInvestmentForm({ ...investmentForm, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Paket seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry">
                            Giriş Paketi - $100
                          </SelectItem>
                          <SelectItem value="monthly">
                            Aylık Aktiflik - $20
                          </SelectItem>
                          <SelectItem value="yearly">
                            Yıllık Aktiflik - $200
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="amount">Miktar (TRY)</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={investmentForm.amount}
                        onChange={(e) =>
                          setInvestmentForm({
                            ...investmentForm,
                            amount: e.target.value,
                          })
                        }
                        placeholder="Yatırım miktarı"
                      />
                    </div>

                    <div>
                      <Label htmlFor="iban">IBAN</Label>
                      <Input
                        id="iban"
                        value={investmentForm.iban}
                        onChange={(e) =>
                          setInvestmentForm({
                            ...investmentForm,
                            iban: e.target.value,
                          })
                        }
                        placeholder="TR00 0000 0000 0000 0000 0000 00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="accountHolder">Hesap Sahibi</Label>
                      <Input
                        id="accountHolder"
                        value={investmentForm.accountHolder}
                        onChange={(e) =>
                          setInvestmentForm({
                            ...investmentForm,
                            accountHolder: e.target.value,
                          })
                        }
                        placeholder="Ad Soyad"
                      />
                    </div>

                    <div>
                      <Label htmlFor="paymentMethod">Ödeme Yöntemi</Label>
                      <Select
                        value={investmentForm.paymentMethod}
                        onValueChange={(value) =>
                          setInvestmentForm({
                            ...investmentForm,
                            paymentMethod: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank_transfer">
                            Banka Havalesi
                          </SelectItem>
                          <SelectItem value="crypto">Kripto Para</SelectItem>
                          <SelectItem value="cash">Nakit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="receipt">Dekont/Fiş</Label>
                      <Input
                        id="receipt"
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) =>
                          setInvestmentForm({
                            ...investmentForm,
                            receiptFile: e.target.files?.[0] || null,
                          })
                        }
                      />
                    </div>

                    <Button onClick={submitInvestment} className="w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      Yatırım Talebini Gönder
                    </Button>
                  </div>

                  <div>
                    <div className="bg-muted rounded-lg p-6">
                      <h3 className="font-semibold mb-4">
                        💳 Sistem Banka Bilgileri
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="font-medium">Banka:</span> Türkiye İş
                          Bankası
                        </div>
                        <div>
                          <span className="font-medium">Hesap Sahibi:</span>{" "}
                          Kutbul Zaman Ltd. Şti.
                        </div>
                        <div>
                          <span className="font-medium">IBAN:</span>
                          <div className="font-mono bg-background p-2 rounded border mt-1">
                            TR64 0006 4000 0011 2345 6789 01
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Açıklama:</span> Üye ID
                          + Ad Soyad
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                      <h4 className="font-medium text-yellow-800 mb-2">
                        ⚠️ Önemli Notlar
                      </h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Dekont/fiş mutlaka yükleyin</li>
                        <li>• İşlem açıklamasına üye ID'nizi yazın</li>
                        <li>• Admin onayı sonrası bakiyenize yansır</li>
                        <li>• 24 saat içinde onaylanır</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Yatırım Geçmişi</CardTitle>
                <CardDescription>
                  Tüm yatırım talepleriniz ve durumları
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paket</TableHead>
                      <TableHead>Miktar</TableHead>
                      <TableHead>IBAN</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {investments.map((investment) => (
                      <TableRow key={investment.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {investment.type === "entry"
                              ? "Giriş"
                              : investment.type === "monthly"
                                ? "Aylık"
                                : "Yıllık"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(investment.amount)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {investment.iban.replace(/(.{4})/g, "$1 ").trim()}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(investment.status)}
                        </TableCell>
                        <TableCell>
                          {formatDate(investment.requestDate)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            {investment.receiptUrl && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedReceipt(investment.receiptUrl!);
                                  setReceiptViewOpen(true);
                                }}
                              >
                                <FileText className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Withdrawal Tab */}
          <TabsContent value="withdraw" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>💰 Para Çekme</CardTitle>
                <CardDescription>
                  Kazancınızdan para çekin. İşlem ücretleri otomatik hesaplanır.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="withdrawAmount">Çekilecek Miktar</Label>
                      <Input
                        id="withdrawAmount"
                        type="number"
                        value={withdrawalForm.amount}
                        onChange={(e) =>
                          setWithdrawalForm({
                            ...withdrawalForm,
                            amount: e.target.value,
                          })
                        }
                        placeholder="Çekmek istediğiniz miktar"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Çekilebilir miktar:{" "}
                        {formatCurrency(walletData.availableForWithdrawal)}
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="withdrawIban">IBAN</Label>
                      <Input
                        id="withdrawIban"
                        value={withdrawalForm.iban}
                        onChange={(e) =>
                          setWithdrawalForm({
                            ...withdrawalForm,
                            iban: e.target.value,
                          })
                        }
                        placeholder="TR00 0000 0000 0000 0000 0000 00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="withdrawAccountHolder">
                        Hesap Sahibi
                      </Label>
                      <Input
                        id="withdrawAccountHolder"
                        value={withdrawalForm.accountHolder}
                        onChange={(e) =>
                          setWithdrawalForm({
                            ...withdrawalForm,
                            accountHolder: e.target.value,
                          })
                        }
                        placeholder="Ad Soyad"
                      />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-2">
                        💳 İşlem Ücretleri
                      </h4>
                      <div className="text-sm text-blue-700 space-y-1">
                        <div>İşlem ücreti: %2</div>
                        <div>
                          Net alacağınız:{" "}
                          {withdrawalForm.amount
                            ? formatCurrency(
                                parseFloat(withdrawalForm.amount) * 0.98,
                              )
                            : "0 TL"}
                        </div>
                      </div>
                    </div>

                    <Button onClick={submitWithdrawal} className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      Para Çekme Talebi Gönder
                    </Button>
                  </div>

                  <div>
                    <div className="bg-muted rounded-lg p-6">
                      <h3 className="font-semibold mb-4">
                        📋 Para Çekme Kuralları
                      </h3>
                      <ul className="text-sm space-y-2">
                        <li>• Minimum çekim tutarı: 100 TL</li>
                        <li>• İşlem ücreti: %2</li>
                        <li>• İşlem süresi: 1-3 iş günü</li>
                        <li>• Sadece kendi IBAN'ınıza çekim</li>
                        <li>• Günlük limit: 5.000 TL</li>
                        <li>• Aylık limit: 50.000 TL</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                      <h4 className="font-medium text-green-800 mb-2">
                        ✅ Güvenlik Özellikleri
                      </h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• 2FA doğrulama</li>
                        <li>• SMS onay</li>
                        <li>• IP kontrolü</li>
                        <li>• Risk analizi</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Para Çekme Geçmişi</CardTitle>
                <CardDescription>
                  Tüm para çekme talepleriniz ve durumları
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Miktar</TableHead>
                      <TableHead>Ücret</TableHead>
                      <TableHead>Net Tutar</TableHead>
                      <TableHead>IBAN</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Tarih</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.map((withdrawal) => (
                      <TableRow key={withdrawal.id}>
                        <TableCell className="font-semibold">
                          {formatCurrency(withdrawal.amount)}
                        </TableCell>
                        <TableCell className="text-red-600">
                          -{formatCurrency(withdrawal.fee)}
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatCurrency(withdrawal.netAmount)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {withdrawal.iban.replace(/(.{4})/g, "$1 ").trim()}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(withdrawal.status)}
                        </TableCell>
                        <TableCell>
                          {formatDate(withdrawal.requestDate)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>


          {/* Transfer Tab */}
          <TabsContent value="transfer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>🔄 Üyeler Arası Transfer</CardTitle>
                <CardDescription>
                  Diğer üyelere anında para transferi yapın
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-w-md mx-auto space-y-4">
                  <div>
                    <Label htmlFor="targetMember">Hedef Üye ID</Label>
                    <Input
                      id="targetMember"
                      value={transferForm.targetMemberId}
                      onChange={(e) =>
                        setTransferForm({
                          ...transferForm,
                          targetMemberId: e.target.value,
                        })
                      }
                      placeholder="ak000002"
                    />
                  </div>

                  <div>
                    <Label htmlFor="transferAmount">Miktar</Label>
                    <Input
                      id="transferAmount"
                      type="number"
                      value={transferForm.amount}
                      onChange={(e) =>
                        setTransferForm({
                          ...transferForm,
                          amount: e.target.value,
                        })
                      }
                      placeholder="Transfer miktarı"
                    />
                  </div>

                  <div>
                    <Label htmlFor="transferDesc">Açıklama</Label>
                    <Textarea
                      id="transferDesc"
                      value={transferForm.description}
                      onChange={(e) =>
                        setTransferForm({
                          ...transferForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Transfer açıklaması"
                      rows={3}
                    />
                  </div>

                  <Button onClick={submitTransfer} className="w-full">
                    <ArrowLeftRight className="w-4 h-4 mr-2" />
                    Transfer Yap
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commissions Tab */}
          <TabsContent value="commissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>📊 Komisyon Hesaplamaları</CardTitle>
                <CardDescription>
                  Otomatik komisyon dağılımı: Sponsor (%10), Kariyer (%25),
                  Pasif (%5)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">
                        {formatCurrency(commissionCalc.totalInvestment)}
                      </div>
                      <p className="text-muted-foreground">Toplam Yatırım</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                        <div>
                          <span className="text-sm font-medium">
                            Sponsor Bonusu
                          </span>
                          <div className="text-xs text-muted-foreground">
                            %{commissionCalc.calculations.sponsor.rate}
                          </div>
                        </div>
                        <span className="font-bold text-green-600">
                          {formatCurrency(
                            commissionCalc.calculations.sponsor.amount,
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg">
                        <div>
                          <span className="text-sm font-medium">
                            Kariyer Bonusu
                          </span>
                          <div className="text-xs text-muted-foreground">
                            %{commissionCalc.calculations.career.rate}
                          </div>
                        </div>
                        <span className="font-bold text-blue-600">
                          {formatCurrency(
                            commissionCalc.calculations.career.amount,
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg">
                        <div>
                          <span className="text-sm font-medium">
                            Pasif Gelir
                          </span>
                          <div className="text-xs text-muted-foreground">
                            %{commissionCalc.calculations.passive.rate}
                          </div>
                        </div>
                        <span className="font-bold text-purple-600">
                          {formatCurrency(
                            commissionCalc.calculations.passive.amount,
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-gray-500/10 rounded-lg">
                        <div>
                          <span className="text-sm font-medium">
                            Sistem Fonu
                          </span>
                          <div className="text-xs text-muted-foreground">
                            %{commissionCalc.calculations.system.rate}
                          </div>
                        </div>
                        <span className="font-bold text-gray-600">
                          {formatCurrency(
                            commissionCalc.calculations.system.amount,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Komisyon Kuralları</h3>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">
                          🤝 Sponsor Bonusu (%10)
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Direkt referanslarınızın yatırımlarından alınan bonus
                        </p>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">
                          👑 Kariyer Bonusu (%25)
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Kariyer seviyenize göre ekip yatırımlarından bonus
                        </p>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">
                          💰 Pasif Gelir (%5)
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Ağ genelindeki tüm yatırımlardan alınan pasif gelir
                        </p>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">
                          🏛️ Sistem Fonu (%60)
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Sistem işletme maliyetleri ve geliştirme fonu
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monoline Commission History */}
            <MonolineCommissionHistory userId={currentUser?.id} limit={50} />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>İşlem Geçmişi</CardTitle>
                <CardDescription>
                  Tüm finansal işlemlerinizin detaylı geçmişi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tip</TableHead>
                      <TableHead>Miktar</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Açıklama</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...investments, ...withdrawals]
                      .sort(
                        (a, b) =>
                          new Date(b.requestDate).getTime() -
                          new Date(a.requestDate).getTime(),
                      )
                      .map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {"type" in item ? (
                                <ArrowDownRight className="w-4 h-4 text-green-500" />
                              ) : (
                                <ArrowUpRight className="w-4 h-4 text-red-500" />
                              )}
                              <span>
                                {"type" in item ? "Yatırım" : "Para Çekme"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(item.amount)}
                          </TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>{formatDate(item.requestDate)}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {"type" in item
                              ? `${item.type} paketi`
                              : `${(item.iban || '').slice(-4)} IBAN'a`}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Receipt View Dialog */}
        <Dialog open={receiptViewOpen} onOpenChange={setReceiptViewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Dekont/Fiş Görüntüle</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              {selectedReceipt && (
                <img
                  src={selectedReceipt}
                  alt="Dekont"
                  className="w-full h-auto rounded-lg"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
