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
import { Switch } from "@/components/ui/switch";
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
  Crown,
  Users,
  DollarSign,
  Settings,
  FileText,
  MessageSquare,
  TrendingUp,
  Shield,
  Bell,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Search,
  Filter,
  BarChart3,
  PieChart,
  Wallet,
  CreditCard,
  Ban,
  RefreshCw,
  Save,
  AlertTriangle,
  Target,
  Network,
  Zap,
  Home,
  Globe,
  Image,
  Layout,
  Database,
  Server,
  Monitor,
  Activity,
  Share2,
  Megaphone,
  Calendar,
  BookOpen,
  Mail,
  Phone,
  Building,
  Star,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// Enhanced Interfaces
interface User {
  id: string;
  memberId: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  membershipType: string;
  isActive: boolean;
  totalInvestment: number;
  directReferrals: number;
  totalTeamSize: number;
  wallet: {
    balance: number;
    totalEarnings: number;
    sponsorBonus: number;
    careerBonus: number;
    passiveIncome: number;
    leadershipBonus: number;
  };
  careerLevel: {
    name: string;
    commissionRate: number;
  };
  registrationDate: string;
  lastLoginDate?: string;
  kycStatus: string;
  sponsorId?: string;
  leftChild?: string;
  rightChild?: string;
}

interface PaymentRequest {
  id: string;
  userId: string;
  type: string;
  amount: number;
  status: string;
  method: string;
  requestDate: string;
  processedDate?: string;
  receipt?: string;
  adminNote?: string;
}

interface Transaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  date: string;
  referenceId?: string;
}

interface NetworkNode {
  userId: string;
  memberId: string;
  fullName: string;
  level: number;
  position: "left" | "right";
  isActive: boolean;
  directReferrals: number;
  totalVolume: number;
  children: NetworkNode[];
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: "info" | "warning" | "success" | "error";
  priority: "low" | "medium" | "high" | "urgent";
  targetAudience: "all" | "members" | "admins";
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

interface SystemSettings {
  systemSettings: {
    maxCapacity: number;
    autoPlacement: boolean;
    registrationEnabled: boolean;
    maintenanceMode: boolean;
    lastMemberNumber: number;
  };
  commissionSettings: {
    sponsorBonusRate: number;
    careerBonusRate: number;
    passiveIncomeRate: number;
    systemFundRate: number;
  };
  websiteSettings: {
    siteName: string;
    siteDescription: string;
    logoUrl: string;
    heroImage: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
  };
}

interface ContentBlock {
  id: string;
  type: "hero" | "features" | "testimonials" | "pricing" | "footer";
  title: string;
  content: string;
  isActive: boolean;
  order: number;
}

export default function EnhancedAdminPanel() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [networkData, setNetworkData] = useState<NetworkNode[]>([]);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);

  const [settings, setSettings] = useState<SystemSettings>({
    systemSettings: {
      maxCapacity: 1000000,
      autoPlacement: true,
      registrationEnabled: true,
      maintenanceMode: false,
      lastMemberNumber: 1,
    },
    commissionSettings: {
      sponsorBonusRate: 10,
      careerBonusRate: 25,
      passiveIncomeRate: 5,
      systemFundRate: 60,
    },
    websiteSettings: {
      siteName: "Kutbul Zaman - Manevi Rehberim",
      siteDescription: "Manevi gelişim ve finansal özgürlük platformu",
      logoUrl: "/placeholder.svg",
      heroImage: "/placeholder.svg",
      contactEmail: "psikologabdulkadirkan@gmail.com",
      contactPhone: "+90 555 123 4567",
      address: "İstanbul, Türkiye",
    },
  });

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    monthlyRevenue: 0,
    totalCommissions: 0,
    networkDepth: 0,
    conversionRate: 0,
  });

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedContentSection, setSelectedContentSection] =
    useState("homepage");
  const [contentData, setContentData] = useState({
    homepage: {
      heroTitle: "Kutbul Zaman - Manevi Rehberim",
      heroSubtitle:
        "Manevi gelişim ve finansal özgürlük yolculuğunuza başlayın",
      heroDescription:
        "7 seviyeli nefis mertebeleri sistemi ile hem ruhsal hem de finansal gelişim. Monoline MLM ağı ile pasif gelir fırsatları.",
      ctaButtonText: "Hemen Katıl",
      ctaSecondaryText: "Kazançları Görüntüle",
      feature1Title: "Monoline Network",
      feature1Description: "7 derinliğe kadar komisyon kazanın",
      feature2Title: "Otomatik Yerleştirme",
      feature2Description: "Sistem sizin için en uygun pozisyonu bulur",
      feature3Title: "Manevi Gelişim",
      feature3Description: "7 seviyeli nefis mertebeleri sistemi",
    },
    about: {
      title: "Hakkımızda",
      subtitle: "Manevi Rehberlik ve Finansal Özgürlük",
      description:
        "Kutbul Zaman platformu, manevi gelişim ve finansal özgürlük arayışında olan bireyler için tasarlanmış kapsamlı bir sistemdir.",
      missionTitle: "Misyonumuz",
      missionText:
        "İnsanların hem manevi hem de maddi anlamda gelişimlerine katkı sağlamak",
      visionTitle: "Vizyonumuz",
      visionText:
        "Dünya çapında manevi değerleri benimseyen bir toplum oluşturmak",
    },
    features: {
      title: "Özelliklerimiz",
      subtitle: "Neden Kutbul Zaman?",
      career1: "Nefs-i Emmare - Giriş seviyesi",
      career2: "Nefs-i Levvame - Kendini kınayan nefis",
      career3: "Nefs-i Mülhime - İlham alan nefis",
      career4: "Nefs-i Mutmainne - Tatmin olmuş nefis",
      career5: "Nefs-i Râziye - Allah'ın takdirine razı nefis",
      career6: "Nefs-i Mardiyye - Allah'ın razı olduğu nefis",
      career7: "Nefs-i Kâmile - Kemale ermiş nefis",
    },
    contact: {
      title: "İletişim",
      subtitle: "Bizimle İletişime Geçin",
      email: "psikologabdulkadirkan@gmail.com",
      phone: "+90 555 123 4567",
      address: "İstanbul, Türkiye",
      workingHours: "Pazartesi - Cuma: 09:00 - 18:00",
      supportEmail: "destek@kutbulzaman.com",
    },
    testimonials: {
      title: "Üye Yorumları",
      subtitle: "Başarı Hikayelerimiz",
      testimonial1Name: "Mehmet K.",
      testimonial1Text:
        "Kutbul Zaman sayesinde hem manevi hem de maddi anlamda gelişim sağladım.",
      testimonial2Name: "Ayşe Y.",
      testimonial2Text:
        "Sistem çok şeffaf ve güvenilir. Herkese tavsiye ederim.",
      testimonial3Name: "Ali R.",
      testimonial3Text:
        "7 seviyeli sistem gerçekten etkili. Hem kendi gelişimim hem de kazancım arttı.",
    },
    footer: {
      companyName: "Kutbul Zaman",
      copyright: "© 2024 Kutbul Zaman. Tüm hakları saklıdır.",
      privacyPolicy: "Gizlilik Politikası",
      termsOfService: "Kullanım Şartları",
      socialFacebook: "https://facebook.com/kutbulzaman",
      socialTwitter: "https://twitter.com/kutbulzaman",
      socialInstagram: "https://instagram.com/kutbulzaman",
    },
  });
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    type: "info" as const,
    priority: "medium" as const,
    targetAudience: "all" as const,
  });

  // Check admin authentication
  useEffect(() => {
    try {
      const userString = localStorage.getItem("currentUser");
      console.log("Checking admin auth, currentUser:", userString);

      if (!userString) {
        console.log("No currentUser found, redirecting to login");
        navigate("/login");
        return;
      }

      const user = JSON.parse(userString);
      console.log("Parsed user:", user);

      if (
        !user ||
        user.email !== "psikologabdulkadirkan@gmail.com" ||
        user.fullName !== "Abdulkadir Kan"
      ) {
        console.log("User is not admin, redirecting to login");
        // Temporary bypass for testing - remove in production
        if (window.location.search.includes("admin=true")) {
          console.log("Admin bypass enabled");
        } else {
          navigate("/login");
          return;
        }
      }

      console.log("Admin authenticated, fetching data");
      fetchData();
    } catch (error) {
      console.error("Error in admin authentication check:", error);
      navigate("/login");
    }
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Add timeout to prevent hanging
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Fetch timeout")), 10000),
      );

      await Promise.race([
        Promise.all([
          fetchUsers(),
          fetchPaymentRequests(),
          fetchTransactions(),
          fetchAnnouncements(),
          fetchNetworkData(),
          fetchSystemStats(),
          fetchContentBlocks(),
        ]),
        timeout,
      ]);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      // Set default values if all fails
      setUsers([]);
      setPaymentRequests([]);
      setTransactions([]);
      setAnnouncements([]);
      setNetworkData([]);
      setContentBlocks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        console.warn("Users API response not OK:", response.status);
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

  const fetchPaymentRequests = async () => {
    try {
      const response = await fetch("/api/admin/payment-requests", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        setPaymentRequests(data.paymentRequests || []);
      } else {
        console.warn("Payment requests API response not OK:", response.status);
        setPaymentRequests([]);
      }
    } catch (error) {
      console.error("Error fetching payment requests:", error);
      setPaymentRequests([]);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/admin/transactions", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      } else {
        console.warn("Transactions API response not OK:", response.status);
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch("/api/announcements", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.announcements || []);
      } else {
        console.warn("Announcements API response not OK:", response.status);
        setAnnouncements([]);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setAnnouncements([]);
    }
  };

  const fetchNetworkData = async () => {
    try {
      const response = await fetch("/api/admin/network", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        setNetworkData(data.network || []);
      } else {
        console.warn("Network API response not OK:", response.status);
        setNetworkData([]);
      }
    } catch (error) {
      console.error("Error fetching network data:", error);
      setNetworkData([]);
    }
  };

  const fetchSystemStats = async () => {
    try {
      const response = await fetch("/api/admin/dashboard", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || stats);
      } else {
        console.warn("Dashboard API response not OK:", response.status);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchContentBlocks = async () => {
    try {
      const response = await fetch("/api/admin/content", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        setContentBlocks(data.content || []);
      } else {
        console.warn("Content API response not OK:", response.status);
        setContentBlocks([]);
      }
    } catch (error) {
      console.error("Error fetching content blocks:", error);
      setContentBlocks([]);
    }
  };

  const handleUserStatusUpdate = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/user/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        await fetchUsers();
        alert("Kullanıcı durumu güncellendi");
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Güncelleme hatası");
    }
  };

  const handlePaymentApproval = async (
    paymentId: string,
    approved: boolean,
  ) => {
    try {
      const response = await fetch(`/api/admin/payment-request/${paymentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: approved ? "approved" : "rejected",
          processedDate: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        await fetchPaymentRequests();
        alert(`Ödeme ${approved ? "onaylandı" : "reddedildi"}`);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("İşlem hatası");
    }
  };

  const handleAnnouncementCreate = async () => {
    try {
      const response = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newAnnouncement,
          startDate: new Date().toISOString(),
          isActive: true,
          createdBy: "Abdulkadir Kan",
        }),
      });

      if (response.ok) {
        await fetchAnnouncements();
        setNewAnnouncement({
          title: "",
          content: "",
          type: "info",
          priority: "medium",
          targetAudience: "all",
        });
        alert("Duyuru oluşturuldu");
      }
    } catch (error) {
      console.error("Error creating announcement:", error);
      alert("Duyuru oluşturma hatası");
    }
  };

  const handleSettingsUpdate = async () => {
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert("Ayarlar güncellendi");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      alert("Ayar güncelleme hatası");
    }
  };

  const handleContentUpdate = async (section: string) => {
    try {
      const response = await fetch(`/api/admin/content/${section}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contentData[section as keyof typeof contentData]),
      });

      if (response.ok) {
        alert(`${section} içeriği güncellendi`);
      }
    } catch (error) {
      console.error("Error updating content:", error);
      alert("İçerik güncelleme hatası");
    }
  };

  const handleDatabaseReset = async () => {
    if (
      confirm(
        "Veritabanını sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz!",
      )
    ) {
      try {
        const response = await fetch("/api/admin/reset-database", {
          method: "POST",
        });

        if (response.ok) {
          alert("Veritabanı sıfırlandı");
          await fetchData();
        }
      } catch (error) {
        console.error("Error resetting database:", error);
        alert("Veritabanı sıfırlama hatası");
      }
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.memberId || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && user.isActive) ||
      (filterStatus === "inactive" && !user.isActive);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Yönetim paneli yükleniyor...</p>
        </div>
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
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-spiritual-purple rounded-lg flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-spiritual-purple bg-clip-text text-transparent">
                  Kutbul Zaman Admin
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">Abdulkadir Kan</Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/member-panel")}
                className="text-primary hover:text-primary"
              >
                <Users className="w-4 h-4 mr-2" />
                Üye Paneli
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate("/comprehensive-admin")}
                className="bg-gradient-to-r from-primary to-spiritual-purple hover:opacity-90"
              >
                <Crown className="w-4 h-4 mr-2" />
                Kapsamlı Admin
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/kazanc")}
                className="text-green-600 hover:text-green-700"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Kazançlar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  localStorage.removeItem("isAuthenticated");
                  localStorage.removeItem("currentUser");
                  navigate("/");
                }}
              >
                Çıkış Yap
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Sistem Yönetim Paneli</h1>
          <p className="text-foreground/60">
            Kutbul Zaman platformunun tam yönetimi
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full lg:w-auto grid-cols-4 lg:grid-cols-10">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">Üyeler</TabsTrigger>
            <TabsTrigger value="payments">Ödemeler</TabsTrigger>
            <TabsTrigger value="finance">Finans</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="content">İçerik</TabsTrigger>
            <TabsTrigger value="homepage">Ana Sayfa</TabsTrigger>
            <TabsTrigger value="announcements">Duyurular</TabsTrigger>
            <TabsTrigger value="system">Sistem</TabsTrigger>
            <TabsTrigger value="settings">Ayarlar</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Toplam Üyeler
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    Aktif: {stats.activeUsers}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Toplam Gelir
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${stats.totalRevenue}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Bu ay: ${stats.monthlyRevenue}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Bekleyen Ödemeler
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.pendingPayments}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    İnceleme bekliyor
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Network Derinliği
                  </CardTitle>
                  <Network className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.networkDepth}</div>
                  <p className="text-xs text-muted-foreground">
                    Seviye derinliği
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Son Kayıtlar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.slice(0, 5).map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center space-x-4"
                      >
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{user.fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.memberId}
                          </p>
                        </div>
                        <Badge
                          variant={user.isActive ? "default" : "secondary"}
                        >
                          {user.isActive ? "Aktif" : "Pasif"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Son İşlemler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center space-x-4"
                      >
                        <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString(
                              "tr-TR",
                            )}
                          </p>
                        </div>
                        <Badge variant="outline">${transaction.amount}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Üye ara (isim, email, member ID)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Durum filtrele" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Pasif</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={fetchUsers}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Yenile
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Tüm Üyeler ({filteredUsers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Üye ID</TableHead>
                      <TableHead>İsim</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefon</TableHead>
                      <TableHead>Seviye</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Bakiye</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono">
                          {user.memberId}
                        </TableCell>
                        <TableCell className="font-medium">
                          {user.fullName}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {user.careerLevel.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.isActive ? "default" : "secondary"}
                          >
                            {user.isActive ? "Aktif" : "Pasif"}
                          </Badge>
                        </TableCell>
                        <TableCell>${user.wallet.balance.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={
                                user.isActive ? "destructive" : "default"
                              }
                              onClick={() =>
                                handleUserStatusUpdate(user.id, !user.isActive)
                              }
                            >
                              {user.isActive ? (
                                <Ban className="w-4 h-4" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ödeme Talepleri</CardTitle>
                <CardDescription>
                  Üyelerden gelen para yatırma ve çekme talepleri
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Üye</TableHead>
                      <TableHead>Tür</TableHead>
                      <TableHead>Tutar</TableHead>
                      <TableHead>Yöntem</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentRequests.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {new Date(payment.requestDate).toLocaleDateString(
                            "tr-TR",
                          )}
                        </TableCell>
                        <TableCell>
                          {users.find((u) => u.id === payment.userId)
                            ?.fullName || "Bilinmiyor"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              payment.type === "deposit"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {payment.type === "deposit" ? "Yatırım" : "Çekim"}
                          </Badge>
                        </TableCell>
                        <TableCell>${payment.amount}</TableCell>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              payment.status === "approved"
                                ? "default"
                                : payment.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {payment.status === "approved"
                              ? "Onaylandı"
                              : payment.status === "rejected"
                                ? "Reddedildi"
                                : "Beklemede"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {payment.status === "pending" && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handlePaymentApproval(payment.id, true)
                                }
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handlePaymentApproval(payment.id, false)
                                }
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Finance Tab */}
          <TabsContent value="finance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gelir Özeti</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Toplam Gelir:</span>
                    <span className="font-bold">${stats.totalRevenue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Aylık Gelir:</span>
                    <span className="font-bold">${stats.monthlyRevenue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Toplam Komisyon:</span>
                    <span className="font-bold">${stats.totalCommissions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sistem Fonu:</span>
                    <span className="font-bold">
                      $
                      {(
                        (stats.totalRevenue *
                          settings.commissionSettings.systemFundRate) /
                        100
                      ).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Komisyon Dağılımı</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Sponsor Bonusu:</span>
                    <span>{settings.commissionSettings.sponsorBonusRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kariyer Bonusu:</span>
                    <span>{settings.commissionSettings.careerBonusRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pasif Gelir:</span>
                    <span>
                      {settings.commissionSettings.passiveIncomeRate}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sistem Fonu:</span>
                    <span>{settings.commissionSettings.systemFundRate}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>İşlem İstatistikleri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Toplam İşlem:</span>
                    <span className="font-bold">{transactions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Onaylı Ödemeler:</span>
                    <span className="font-bold">
                      {
                        paymentRequests.filter((p) => p.status === "approved")
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bekleyen Ödemeler:</span>
                    <span className="font-bold text-yellow-600">
                      {
                        paymentRequests.filter((p) => p.status === "pending")
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reddedilen Ödemeler:</span>
                    <span className="font-bold text-red-600">
                      {
                        paymentRequests.filter((p) => p.status === "rejected")
                          .length
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Son Finansal İşlemler</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Üye</TableHead>
                      <TableHead>İşlem Türü</TableHead>
                      <TableHead>Açıklama</TableHead>
                      <TableHead>Tutar</TableHead>
                      <TableHead>Durum</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.slice(0, 10).map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {new Date(transaction.date).toLocaleDateString(
                            "tr-TR",
                          )}
                        </TableCell>
                        <TableCell>
                          {users.find((u) => u.id === transaction.userId)
                            ?.fullName || "Sistem"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              transaction.type === "commission"
                                ? "default"
                                : transaction.type === "deposit"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell
                          className={
                            transaction.amount >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {transaction.amount >= 0 ? "+" : ""}$
                          {Math.abs(transaction.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              transaction.status === "completed"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {transaction.status === "completed"
                              ? "Tamamlandı"
                              : "Beklemede"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Network Tab */}
          <TabsContent value="network" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Network İstatistikleri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Toplam Üye:</span>
                    <span className="font-bold">{users.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Aktif Üye:</span>
                    <span className="font-bold text-green-600">
                      {users.filter((u) => u.isActive).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Network Derinliği:</span>
                    <span className="font-bold">
                      {stats.networkDepth} seviye
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ortalama Takım Boyutu:</span>
                    <span className="font-bold">
                      {users.length > 0
                        ? (
                            users.reduce((sum, u) => sum + u.totalTeamSize, 0) /
                            users.length
                          ).toFixed(1)
                        : 0}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Seviye Dağılımı</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.from(
                    new Set(users.map((u) => u.careerLevel.name)),
                  ).map((levelName) => {
                    const count = users.filter(
                      (u) => u.careerLevel.name === levelName,
                    ).length;
                    const percentage =
                      users.length > 0
                        ? ((count / users.length) * 100).toFixed(1)
                        : 0;
                    return (
                      <div key={levelName} className="flex justify-between">
                        <span>{levelName}:</span>
                        <span className="font-bold">
                          {count} (%{percentage})
                        </span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Network Ağacı</CardTitle>
                <CardDescription>
                  Üyelerin sponsor-sponsor ilişkileri ve binary yerleşimi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users
                    .filter((u) => u.role === "admin")
                    .map((admin) => (
                      <div key={admin.id} className="border rounded-lg p-4">
                        <div className="text-center mb-4">
                          <Badge variant="default" className="text-lg p-2">
                            {admin.fullName} ({admin.memberId})
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-2">
                            Sistem Kurucusu
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="text-center">
                            <h4 className="font-medium mb-2">Sol Bacak</h4>
                            <div className="space-y-2">
                              {users
                                .filter((u) => u.sponsorId === admin.id)
                                .slice(0, 5)
                                .map((user) => (
                                  <div
                                    key={user.id}
                                    className="p-2 border rounded text-sm"
                                  >
                                    <p className="font-medium">
                                      {user.fullName}
                                    </p>
                                    <p className="text-muted-foreground">
                                      {user.memberId}
                                    </p>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {user.careerLevel.name}
                                    </Badge>
                                  </div>
                                ))}
                            </div>
                          </div>

                          <div className="text-center">
                            <h4 className="font-medium mb-2">Sağ Bacak</h4>
                            <div className="space-y-2">
                              {users
                                .filter((u) => u.sponsorId === admin.id)
                                .slice(5, 10)
                                .map((user) => (
                                  <div
                                    key={user.id}
                                    className="p-2 border rounded text-sm"
                                  >
                                    <p className="font-medium">
                                      {user.fullName}
                                    </p>
                                    <p className="text-muted-foreground">
                                      {user.memberId}
                                    </p>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {user.careerLevel.name}
                                    </Badge>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Management Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Content Sections Sidebar */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Sayfa Bölümleri</CardTitle>
                  <CardDescription>
                    Düzenlemek istediğiniz bölümü seçin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant={
                      selectedContentSection === "homepage"
                        ? "default"
                        : "outline"
                    }
                    className="w-full justify-start"
                    onClick={() => setSelectedContentSection("homepage")}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Ana Sayfa
                  </Button>
                  <Button
                    variant={
                      selectedContentSection === "about" ? "default" : "outline"
                    }
                    className="w-full justify-start"
                    onClick={() => setSelectedContentSection("about")}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Hakkımızda
                  </Button>
                  <Button
                    variant={
                      selectedContentSection === "features"
                        ? "default"
                        : "outline"
                    }
                    className="w-full justify-start"
                    onClick={() => setSelectedContentSection("features")}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Özellikler
                  </Button>
                  <Button
                    variant={
                      selectedContentSection === "testimonials"
                        ? "default"
                        : "outline"
                    }
                    className="w-full justify-start"
                    onClick={() => setSelectedContentSection("testimonials")}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Yorumlar
                  </Button>
                  <Button
                    variant={
                      selectedContentSection === "contact"
                        ? "default"
                        : "outline"
                    }
                    className="w-full justify-start"
                    onClick={() => setSelectedContentSection("contact")}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    İletişim
                  </Button>
                  <Button
                    variant={
                      selectedContentSection === "footer"
                        ? "default"
                        : "outline"
                    }
                    className="w-full justify-start"
                    onClick={() => setSelectedContentSection("footer")}
                  >
                    <Layout className="w-4 h-4 mr-2" />
                    Footer
                  </Button>
                </CardContent>
              </Card>

              {/* Content Editor Area */}
              <div className="lg:col-span-3 space-y-6">
                {/* Homepage Content */}
                {selectedContentSection === "homepage" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Ana Sayfa İçerik Yönetimi</CardTitle>
                      <CardDescription>
                        Ana sayfa hero bölümü ve özellikler kısmını düzenleyin
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label>Ana Başlık</Label>
                            <Input
                              value={contentData.homepage.heroTitle}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  homepage: {
                                    ...contentData.homepage,
                                    heroTitle: e.target.value,
                                  },
                                })
                              }
                              placeholder="Ana sayfa başlığı"
                            />
                          </div>
                          <div>
                            <Label>Alt Başlık</Label>
                            <Input
                              value={contentData.homepage.heroSubtitle}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  homepage: {
                                    ...contentData.homepage,
                                    heroSubtitle: e.target.value,
                                  },
                                })
                              }
                              placeholder="Alt başlık"
                            />
                          </div>
                          <div>
                            <Label>Açıklama Metni</Label>
                            <Textarea
                              value={contentData.homepage.heroDescription}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  homepage: {
                                    ...contentData.homepage,
                                    heroDescription: e.target.value,
                                  },
                                })
                              }
                              placeholder="Ana açıklama"
                              rows={4}
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label>Ana Buton Metni</Label>
                            <Input
                              value={contentData.homepage.ctaButtonText}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  homepage: {
                                    ...contentData.homepage,
                                    ctaButtonText: e.target.value,
                                  },
                                })
                              }
                              placeholder="Buton metni"
                            />
                          </div>
                          <div>
                            <Label>İkinci Buton Metni</Label>
                            <Input
                              value={contentData.homepage.ctaSecondaryText}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  homepage: {
                                    ...contentData.homepage,
                                    ctaSecondaryText: e.target.value,
                                  },
                                })
                              }
                              placeholder="İkinci buton metni"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4">
                          Özellikler Bölümü
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <Label>Özellik 1 Başlık</Label>
                            <Input
                              value={contentData.homepage.feature1Title}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  homepage: {
                                    ...contentData.homepage,
                                    feature1Title: e.target.value,
                                  },
                                })
                              }
                            />
                            <Label>Açıklama</Label>
                            <Textarea
                              value={contentData.homepage.feature1Description}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  homepage: {
                                    ...contentData.homepage,
                                    feature1Description: e.target.value,
                                  },
                                })
                              }
                              rows={3}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Özellik 2 Başlık</Label>
                            <Input
                              value={contentData.homepage.feature2Title}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  homepage: {
                                    ...contentData.homepage,
                                    feature2Title: e.target.value,
                                  },
                                })
                              }
                            />
                            <Label>Açıklama</Label>
                            <Textarea
                              value={contentData.homepage.feature2Description}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  homepage: {
                                    ...contentData.homepage,
                                    feature2Description: e.target.value,
                                  },
                                })
                              }
                              rows={3}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Özellik 3 Başlık</Label>
                            <Input
                              value={contentData.homepage.feature3Title}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  homepage: {
                                    ...contentData.homepage,
                                    feature3Title: e.target.value,
                                  },
                                })
                              }
                            />
                            <Label>Açıklama</Label>
                            <Textarea
                              value={contentData.homepage.feature3Description}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  homepage: {
                                    ...contentData.homepage,
                                    feature3Description: e.target.value,
                                  },
                                })
                              }
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => handleContentUpdate("homepage")}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Ana Sayfa İçeriklerini Kaydet
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* About Content */}
                {selectedContentSection === "about" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Hakkımızda Sayfası</CardTitle>
                      <CardDescription>
                        Hakkımızda sayfasının tüm içeriklerini düzenleyin
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label>Sayfa Başlığı</Label>
                            <Input
                              value={contentData.about.title}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  about: {
                                    ...contentData.about,
                                    title: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Alt Başlık</Label>
                            <Input
                              value={contentData.about.subtitle}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  about: {
                                    ...contentData.about,
                                    subtitle: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Ana Açıklama</Label>
                            <Textarea
                              value={contentData.about.description}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  about: {
                                    ...contentData.about,
                                    description: e.target.value,
                                  },
                                })
                              }
                              rows={4}
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label>Misyon Başlığı</Label>
                            <Input
                              value={contentData.about.missionTitle}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  about: {
                                    ...contentData.about,
                                    missionTitle: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Misyon Açıklaması</Label>
                            <Textarea
                              value={contentData.about.missionText}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  about: {
                                    ...contentData.about,
                                    missionText: e.target.value,
                                  },
                                })
                              }
                              rows={3}
                            />
                          </div>
                          <div>
                            <Label>Vizyon Başlığı</Label>
                            <Input
                              value={contentData.about.visionTitle}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  about: {
                                    ...contentData.about,
                                    visionTitle: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Vizyon Açıklaması</Label>
                            <Textarea
                              value={contentData.about.visionText}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  about: {
                                    ...contentData.about,
                                    visionText: e.target.value,
                                  },
                                })
                              }
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => handleContentUpdate("about")}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Hakkımızda İçeriklerini Kaydet
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Features Content */}
                {selectedContentSection === "features" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Özellikler ve Kariyer Seviyeleri</CardTitle>
                      <CardDescription>
                        7 seviyeli nefis mertebeleri sisteminin açıklamalarını
                        düzenleyin
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <Label>Bölüm Başlığı</Label>
                          <Input
                            value={contentData.features.title}
                            onChange={(e) =>
                              setContentData({
                                ...contentData,
                                features: {
                                  ...contentData.features,
                                  title: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>Alt Başlık</Label>
                          <Input
                            value={contentData.features.subtitle}
                            onChange={(e) =>
                              setContentData({
                                ...contentData,
                                features: {
                                  ...contentData.features,
                                  subtitle: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label>Seviye 1 - Nefs-i Emmare</Label>
                            <Textarea
                              value={contentData.features.career1}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  features: {
                                    ...contentData.features,
                                    career1: e.target.value,
                                  },
                                })
                              }
                              rows={2}
                            />
                          </div>
                          <div>
                            <Label>Seviye 2 - Nefs-i Levvame</Label>
                            <Textarea
                              value={contentData.features.career2}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  features: {
                                    ...contentData.features,
                                    career2: e.target.value,
                                  },
                                })
                              }
                              rows={2}
                            />
                          </div>
                          <div>
                            <Label>Seviye 3 - Nefs-i Mülhime</Label>
                            <Textarea
                              value={contentData.features.career3}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  features: {
                                    ...contentData.features,
                                    career3: e.target.value,
                                  },
                                })
                              }
                              rows={2}
                            />
                          </div>
                          <div>
                            <Label>Seviye 4 - Nefs-i Mutmainne</Label>
                            <Textarea
                              value={contentData.features.career4}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  features: {
                                    ...contentData.features,
                                    career4: e.target.value,
                                  },
                                })
                              }
                              rows={2}
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label>Seviye 5 - Nefs-i Râziye</Label>
                            <Textarea
                              value={contentData.features.career5}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  features: {
                                    ...contentData.features,
                                    career5: e.target.value,
                                  },
                                })
                              }
                              rows={2}
                            />
                          </div>
                          <div>
                            <Label>Seviye 6 - Nefs-i Mardiyye</Label>
                            <Textarea
                              value={contentData.features.career6}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  features: {
                                    ...contentData.features,
                                    career6: e.target.value,
                                  },
                                })
                              }
                              rows={2}
                            />
                          </div>
                          <div>
                            <Label>Seviye 7 - Nefs-i Kâmile</Label>
                            <Textarea
                              value={contentData.features.career7}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  features: {
                                    ...contentData.features,
                                    career7: e.target.value,
                                  },
                                })
                              }
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => handleContentUpdate("features")}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Özellikler İçeriklerini Kaydet
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Testimonials Content */}
                {selectedContentSection === "testimonials" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Üye Yorumları</CardTitle>
                      <CardDescription>
                        Müşteri testimoniallarını düzenleyin
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <Label>Bölüm Başlığı</Label>
                          <Input
                            value={contentData.testimonials.title}
                            onChange={(e) =>
                              setContentData({
                                ...contentData,
                                testimonials: {
                                  ...contentData.testimonials,
                                  title: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>Alt Başlık</Label>
                          <Input
                            value={contentData.testimonials.subtitle}
                            onChange={(e) =>
                              setContentData({
                                ...contentData,
                                testimonials: {
                                  ...contentData.testimonials,
                                  subtitle: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>1. Yorum - İsim</Label>
                            <Input
                              value={contentData.testimonials.testimonial1Name}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  testimonials: {
                                    ...contentData.testimonials,
                                    testimonial1Name: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>1. Yorum - Metin</Label>
                            <Textarea
                              value={contentData.testimonials.testimonial1Text}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  testimonials: {
                                    ...contentData.testimonials,
                                    testimonial1Text: e.target.value,
                                  },
                                })
                              }
                              rows={3}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>2. Yorum - İsim</Label>
                            <Input
                              value={contentData.testimonials.testimonial2Name}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  testimonials: {
                                    ...contentData.testimonials,
                                    testimonial2Name: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>2. Yorum - Metin</Label>
                            <Textarea
                              value={contentData.testimonials.testimonial2Text}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  testimonials: {
                                    ...contentData.testimonials,
                                    testimonial2Text: e.target.value,
                                  },
                                })
                              }
                              rows={3}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>3. Yorum - İsim</Label>
                            <Input
                              value={contentData.testimonials.testimonial3Name}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  testimonials: {
                                    ...contentData.testimonials,
                                    testimonial3Name: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>3. Yorum - Metin</Label>
                            <Textarea
                              value={contentData.testimonials.testimonial3Text}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  testimonials: {
                                    ...contentData.testimonials,
                                    testimonial3Text: e.target.value,
                                  },
                                })
                              }
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => handleContentUpdate("testimonials")}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Yorumlar İçeriklerini Kaydet
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Contact Content */}
                {selectedContentSection === "contact" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>İletişim Bilgileri</CardTitle>
                      <CardDescription>
                        Tüm iletişim bilgilerini düzenleyin
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label>Sayfa Başlığı</Label>
                            <Input
                              value={contentData.contact.title}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  contact: {
                                    ...contentData.contact,
                                    title: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Alt Başlık</Label>
                            <Input
                              value={contentData.contact.subtitle}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  contact: {
                                    ...contentData.contact,
                                    subtitle: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Email Adresi</Label>
                            <Input
                              value={contentData.contact.email}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  contact: {
                                    ...contentData.contact,
                                    email: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Telefon Numarası</Label>
                            <Input
                              value={contentData.contact.phone}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  contact: {
                                    ...contentData.contact,
                                    phone: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label>Adres</Label>
                            <Textarea
                              value={contentData.contact.address}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  contact: {
                                    ...contentData.contact,
                                    address: e.target.value,
                                  },
                                })
                              }
                              rows={3}
                            />
                          </div>
                          <div>
                            <Label>Çalışma Saatleri</Label>
                            <Input
                              value={contentData.contact.workingHours}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  contact: {
                                    ...contentData.contact,
                                    workingHours: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Destek Email</Label>
                            <Input
                              value={contentData.contact.supportEmail}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  contact: {
                                    ...contentData.contact,
                                    supportEmail: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => handleContentUpdate("contact")}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        İletişim Bilgilerini Kaydet
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Footer Content */}
                {selectedContentSection === "footer" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Footer (Alt Bilgi) Yönetimi</CardTitle>
                      <CardDescription>
                        Sitenin alt kısmındaki bilgileri düzenleyin
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label>Şirket Adı</Label>
                            <Input
                              value={contentData.footer.companyName}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  footer: {
                                    ...contentData.footer,
                                    companyName: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Telif Hakkı Metni</Label>
                            <Input
                              value={contentData.footer.copyright}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  footer: {
                                    ...contentData.footer,
                                    copyright: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Gizlilik Politikası</Label>
                            <Input
                              value={contentData.footer.privacyPolicy}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  footer: {
                                    ...contentData.footer,
                                    privacyPolicy: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Kullanım Şartları</Label>
                            <Input
                              value={contentData.footer.termsOfService}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  footer: {
                                    ...contentData.footer,
                                    termsOfService: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="font-semibold">
                            Sosyal Medya Linkleri
                          </h3>
                          <div>
                            <Label>Facebook URL</Label>
                            <Input
                              value={contentData.footer.socialFacebook}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  footer: {
                                    ...contentData.footer,
                                    socialFacebook: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Twitter URL</Label>
                            <Input
                              value={contentData.footer.socialTwitter}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  footer: {
                                    ...contentData.footer,
                                    socialTwitter: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Instagram URL</Label>
                            <Input
                              value={contentData.footer.socialInstagram}
                              onChange={(e) =>
                                setContentData({
                                  ...contentData,
                                  footer: {
                                    ...contentData.footer,
                                    socialInstagram: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => handleContentUpdate("footer")}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Footer İçeriklerini Kaydet
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Content Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle>İçerik Önizleme</CardTitle>
                    <CardDescription>
                      Yaptığınız değişikliklerin nasıl görüneceğini inceleyin
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg p-4 bg-gray-50 min-h-64">
                      {selectedContentSection === "homepage" && (
                        <div className="text-center space-y-4">
                          <h1 className="text-3xl font-bold">
                            {contentData.homepage.heroTitle}
                          </h1>
                          <h2 className="text-xl text-gray-600">
                            {contentData.homepage.heroSubtitle}
                          </h2>
                          <p className="text-gray-700">
                            {contentData.homepage.heroDescription}
                          </p>
                          <div className="flex justify-center space-x-4">
                            <div className="bg-blue-600 text-white px-4 py-2 rounded">
                              {contentData.homepage.ctaButtonText}
                            </div>
                            <div className="border border-blue-600 text-blue-600 px-4 py-2 rounded">
                              {contentData.homepage.ctaSecondaryText}
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 mt-8">
                            <div className="p-4 border rounded">
                              <h3 className="font-semibold">
                                {contentData.homepage.feature1Title}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {contentData.homepage.feature1Description}
                              </p>
                            </div>
                            <div className="p-4 border rounded">
                              <h3 className="font-semibold">
                                {contentData.homepage.feature2Title}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {contentData.homepage.feature2Description}
                              </p>
                            </div>
                            <div className="p-4 border rounded">
                              <h3 className="font-semibold">
                                {contentData.homepage.feature3Title}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {contentData.homepage.feature3Description}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedContentSection === "about" && (
                        <div className="space-y-4">
                          <h1 className="text-3xl font-bold">
                            {contentData.about.title}
                          </h1>
                          <h2 className="text-xl text-gray-600">
                            {contentData.about.subtitle}
                          </h2>
                          <p className="text-gray-700">
                            {contentData.about.description}
                          </p>
                          <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="p-4 border rounded">
                              <h3 className="font-semibold">
                                {contentData.about.missionTitle}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {contentData.about.missionText}
                              </p>
                            </div>
                            <div className="p-4 border rounded">
                              <h3 className="font-semibold">
                                {contentData.about.visionTitle}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {contentData.about.visionText}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedContentSection === "contact" && (
                        <div className="space-y-4">
                          <h1 className="text-3xl font-bold">
                            {contentData.contact.title}
                          </h1>
                          <h2 className="text-xl text-gray-600">
                            {contentData.contact.subtitle}
                          </h2>
                          <div className="grid grid-cols-2 gap-4 mt-6">
                            <div>
                              <p>
                                <strong>Email:</strong>{" "}
                                {contentData.contact.email}
                              </p>
                              <p>
                                <strong>Telefon:</strong>{" "}
                                {contentData.contact.phone}
                              </p>
                              <p>
                                <strong>Adres:</strong>{" "}
                                {contentData.contact.address}
                              </p>
                            </div>
                            <div>
                              <p>
                                <strong>Çalışma Saatleri:</strong>{" "}
                                {contentData.contact.workingHours}
                              </p>
                              <p>
                                <strong>Destek:</strong>{" "}
                                {contentData.contact.supportEmail}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {["features", "testimonials", "footer"].includes(
                        selectedContentSection,
                      ) && (
                        <div className="text-center text-gray-500">
                          <p>Bu bölümün önizlemesi hazırlanıyor...</p>
                          <p className="text-sm mt-2">
                            Değişiklikleriniz kaydedildikten sonra canlı sitede
                            görünecektir.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Homepage Management Tab */}
          <TabsContent value="homepage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ana Sayfa Yönetimi</CardTitle>
                <CardDescription>
                  Ana sayfa düzeni ve içeriklerini özelleştirin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Site Başlığı</h3>
                    <Input
                      value={settings.websiteSettings.siteName}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          websiteSettings: {
                            ...settings.websiteSettings,
                            siteName: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Site Açıklaması</h3>
                    <Input
                      value={settings.websiteSettings.siteDescription}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          websiteSettings: {
                            ...settings.websiteSettings,
                            siteDescription: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Hero Bölümü Ana Metni</h3>
                  <Textarea
                    placeholder="Ana sayfa hero bölümünde görünecek ana metin..."
                    rows={3}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Alt Başlık</h3>
                  <Textarea
                    placeholder="Hero bölümü alt açıklaması..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Özellik 1</h3>
                    <Input placeholder="Özellik başlığı" />
                    <Textarea placeholder="Özellik açıklaması" rows={3} />
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Özellik 2</h3>
                    <Input placeholder="Özellik başlığı" />
                    <Textarea placeholder="Özellik açıklaması" rows={3} />
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Özellik 3</h3>
                    <Input placeholder="Özellik başlığı" />
                    <Textarea placeholder="Özellik açıklaması" rows={3} />
                  </div>
                </div>

                <Button onClick={handleSettingsUpdate}>
                  <Save className="w-4 h-4 mr-2" />
                  Ana Sayfa Ayarlarını Kaydet
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sayfa Önizleme</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="text-center space-y-4">
                    <h1 className="text-3xl font-bold">
                      {settings.websiteSettings.siteName}
                    </h1>
                    <p className="text-lg text-gray-600">
                      {settings.websiteSettings.siteDescription}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                      <div className="p-4 border rounded">
                        <h3 className="font-semibold">Özellik 1</h3>
                        <p className="text-sm text-gray-600">Açıklama...</p>
                      </div>
                      <div className="p-4 border rounded">
                        <h3 className="font-semibold">Özellik 2</h3>
                        <p className="text-sm text-gray-600">Açıklama...</p>
                      </div>
                      <div className="p-4 border rounded">
                        <h3 className="font-semibold">Özellik 3</h3>
                        <p className="text-sm text-gray-600">Açıklama...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Yeni Duyuru Oluştur</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Başlık</Label>
                    <Input
                      value={newAnnouncement.title}
                      onChange={(e) =>
                        setNewAnnouncement({
                          ...newAnnouncement,
                          title: e.target.value,
                        })
                      }
                      placeholder="Duyuru başlığı"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Hedef Kitle</Label>
                    <Select
                      value={newAnnouncement.targetAudience}
                      onValueChange={(value: any) =>
                        setNewAnnouncement({
                          ...newAnnouncement,
                          targetAudience: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm Kullanıcılar</SelectItem>
                        <SelectItem value="members">Sadece Üyeler</SelectItem>
                        <SelectItem value="admins">Sadece Adminler</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tür</Label>
                    <Select
                      value={newAnnouncement.type}
                      onValueChange={(value: any) =>
                        setNewAnnouncement({
                          ...newAnnouncement,
                          type: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Bilgi</SelectItem>
                        <SelectItem value="warning">Uyarı</SelectItem>
                        <SelectItem value="success">Başarı</SelectItem>
                        <SelectItem value="error">Hata</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Öncelik</Label>
                    <Select
                      value={newAnnouncement.priority}
                      onValueChange={(value: any) =>
                        setNewAnnouncement({
                          ...newAnnouncement,
                          priority: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Düşük</SelectItem>
                        <SelectItem value="medium">Orta</SelectItem>
                        <SelectItem value="high">Yüksek</SelectItem>
                        <SelectItem value="urgent">Acil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>İçerik</Label>
                  <Textarea
                    value={newAnnouncement.content}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        content: e.target.value,
                      })
                    }
                    placeholder="Duyuru içeriği..."
                    rows={4}
                  />
                </div>

                <Button onClick={handleAnnouncementCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Duyuru Oluştur
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Aktif Duyurular</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{announcement.title}</h3>
                        <div className="flex space-x-2">
                          <Badge
                            variant={
                              announcement.type === "info"
                                ? "default"
                                : announcement.type === "warning"
                                  ? "destructive"
                                  : announcement.type === "success"
                                    ? "default"
                                    : "destructive"
                            }
                          >
                            {announcement.type}
                          </Badge>
                          <Badge variant="outline">
                            {announcement.priority}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-2">
                        {announcement.content}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        Hedef: {announcement.targetAudience} • Oluşturulma:{" "}
                        {new Date(announcement.createdAt).toLocaleDateString(
                          "tr-TR",
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Management Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sistem Durumu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Sistem Durumu:</span>
                    <Badge variant="default">Çalışıyor</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Bakım Modu:</span>
                    <Switch
                      checked={settings.systemSettings.maintenanceMode}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          systemSettings: {
                            ...settings.systemSettings,
                            maintenanceMode: checked,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Kayıt Açık:</span>
                    <Switch
                      checked={settings.systemSettings.registrationEnabled}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          systemSettings: {
                            ...settings.systemSettings,
                            registrationEnabled: checked,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Otomatik Yerleştirme:</span>
                    <Switch
                      checked={settings.systemSettings.autoPlacement}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          systemSettings: {
                            ...settings.systemSettings,
                            autoPlacement: checked,
                          },
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Veritabanı İşlemleri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Son Üye Numarası: ak
                      {settings.systemSettings.lastMemberNumber
                        .toString()
                        .padStart(7, "0")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Toplam Üye: {users.length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Toplam İşlem: {transactions.length}
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <Button
                      variant="destructive"
                      onClick={handleDatabaseReset}
                      className="w-full"
                    >
                      <Database className="w-4 h-4 mr-2" />
                      Veritabanını Sıfırla
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      ⚠️ Bu işlem tüm veriyi siler ve sistemi Abdulkadir Kan ile
                      yeniden başlatır
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Sistem Logları</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 bg-gray-50 p-4 rounded font-mono text-sm max-h-60 overflow-y-auto">
                  <div>[{new Date().toLocaleString()}] Sistem başlatıldı</div>
                  <div>
                    [{new Date().toLocaleString()}] Veritabanı bağlantısı
                    başarılı
                  </div>
                  <div>
                    [{new Date().toLocaleString()}] Admin paneli erişimi:
                    Abdulkadir Kan
                  </div>
                  <div>
                    [{new Date().toLocaleString()}] Toplam {users.length} üye
                    yüklendi
                  </div>
                  <div>
                    [{new Date().toLocaleString()}]{" "}
                    {
                      paymentRequests.filter((p) => p.status === "pending")
                        .length
                    }{" "}
                    ödeme beklemede
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sistem Ayarları</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Maksimum Kapasite</Label>
                    <Input
                      type="number"
                      value={settings.systemSettings.maxCapacity}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          systemSettings: {
                            ...settings.systemSettings,
                            maxCapacity: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Son Üye Numarası</Label>
                    <Input
                      type="number"
                      value={settings.systemSettings.lastMemberNumber}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          systemSettings: {
                            ...settings.systemSettings,
                            lastMemberNumber: parseInt(e.target.value) || 1,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.systemSettings.autoPlacement}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          systemSettings: {
                            ...settings.systemSettings,
                            autoPlacement: checked,
                          },
                        })
                      }
                    />
                    <Label>Otomatik Yerleştirme</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.systemSettings.registrationEnabled}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          systemSettings: {
                            ...settings.systemSettings,
                            registrationEnabled: checked,
                          },
                        })
                      }
                    />
                    <Label>Kayıt Açık</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.systemSettings.maintenanceMode}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          systemSettings: {
                            ...settings.systemSettings,
                            maintenanceMode: checked,
                          },
                        })
                      }
                    />
                    <Label>Bakım Modu</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Komisyon Ayarları</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Sponsor Bonusu (%)</Label>
                    <Input
                      type="number"
                      value={settings.commissionSettings.sponsorBonusRate}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          commissionSettings: {
                            ...settings.commissionSettings,
                            sponsorBonusRate: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Kariyer Bonusu (%)</Label>
                    <Input
                      type="number"
                      value={settings.commissionSettings.careerBonusRate}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          commissionSettings: {
                            ...settings.commissionSettings,
                            careerBonusRate: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Pasif Gelir (%)</Label>
                    <Input
                      type="number"
                      value={settings.commissionSettings.passiveIncomeRate}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          commissionSettings: {
                            ...settings.commissionSettings,
                            passiveIncomeRate: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Sistem Fonu (%)</Label>
                    <Input
                      type="number"
                      value={settings.commissionSettings.systemFundRate}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          commissionSettings: {
                            ...settings.commissionSettings,
                            systemFundRate: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="pt-4 text-sm text-muted-foreground">
                    Toplam:{" "}
                    {settings.commissionSettings.sponsorBonusRate +
                      settings.commissionSettings.careerBonusRate +
                      settings.commissionSettings.passiveIncomeRate +
                      settings.commissionSettings.systemFundRate}
                    % (100% olmalı)
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>İletişim Ayarları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>İletişim Email</Label>
                    <Input
                      value={settings.websiteSettings.contactEmail}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          websiteSettings: {
                            ...settings.websiteSettings,
                            contactEmail: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>İletişim Telefon</Label>
                    <Input
                      value={settings.websiteSettings.contactPhone}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          websiteSettings: {
                            ...settings.websiteSettings,
                            contactPhone: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Adres</Label>
                  <Textarea
                    value={settings.websiteSettings.address}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        websiteSettings: {
                          ...settings.websiteSettings,
                          address: e.target.value,
                        },
                      })
                    }
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={fetchData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Yenile
              </Button>
              <Button onClick={handleSettingsUpdate}>
                <Save className="w-4 h-4 mr-2" />
                Tüm Ayarları Kaydet
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
