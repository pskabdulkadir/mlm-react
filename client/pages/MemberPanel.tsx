import { useState, useEffect, useCallback } from "react";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { safeDownloadUrl, safeDownloadBlob } from "@/lib/dom";
import {
  Crown,
  Users,
  DollarSign,
  TrendingUp,
  Share2,
  Copy,
  Eye,
  Award,
  Wallet,
  Network,
  MessageSquare,
  Settings,
  Link,
  QrCode,
  Target,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  ArrowLeft,
  ExternalLink,
  Plus,
  Edit,
  Smartphone,
  Mail,
  Instagram,
  Twitter,
  Facebook,
  Send,
  LinkIcon,
  Globe,
  Image,
  Palette,
  Save,
  TreePine,
  List,
  User2,
  FileText,
  CheckCircle,
  ShoppingCart,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
// BinaryNetworkTree removed - replaced with Monoline MLM system
import LiveBroadcastPlayer from "@/components/LiveBroadcastPlayer";
import MonolineTreeView from "@/components/MonolineTreeView";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  referralCode: string;
  sponsorId?: string;
  activeUntil?: string;
  firstPurchaseAt?: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  date: string;
}

interface TeamMember {
  id: string;
  memberId: string;
  fullName: string;
  email: string;
  careerLevel: string;
  totalInvestment: number;
  directReferrals: number;
  registrationDate: string;
  isActive: boolean;
  level: number;
  position: "direct" | "downline";
}

export default function MemberPanel() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [clonePageUrl, setClonePageUrl] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [shareStats, setShareStats] = useState({
    visits: 0,
    conversions: 0,
    conversionRate: 0,
  });
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [clonePageSettings, setClonePageSettings] = useState({
    headerColor: "#3B82F6",
    buttonColor: "#10B981",
    backgroundColor: "#F8FAFC",
    showTestimonials: true,
    showFeatures: true,
    customCss: "",
  });
  const [selectedMemberForTeamView, setSelectedMemberForTeamView] = useState<TeamMember | null>(null);
  const [teamViewMode, setTeamViewMode] = useState<'list' | 'tree'>('list');
  const [memberTeamData, setMemberTeamData] = useState<TeamMember[]>([]);
  const [teamViewModalOpen, setTeamViewModalOpen] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [showActivityWarning, setShowActivityWarning] = useState(false);

  // Team Placement Management States
  const [pendingPlacements, setPendingPlacements] = useState<any[]>([]);
  const [placementModal, setPlacementModal] = useState(false);
  const [selectedPlacement, setSelectedPlacement] = useState<any>(null);
  const [teamTreeData, setTeamTreeData] = useState<any>(null);

  // Receipt Upload States
  const [receiptFile, setReceiptFile] = useState<string | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptUploadLoading, setReceiptUploadLoading] = useState(false);
  const [receiptUploadStatus, setReceiptUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [receiptMessage, setReceiptMessage] = useState("");

  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setReceiptUploadStatus('error');
        setReceiptMessage("Dosya boyutu 5MB'dan küçük olmalıdır");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const fileContent = reader.result as string;
        setReceiptFile(fileContent);
        setReceiptPreview(fileContent);
        setReceiptUploadStatus('idle');
        setReceiptMessage("");
      };
      reader.onerror = () => {
        setReceiptUploadStatus('error');
        setReceiptMessage("Dosya okuma hatası");
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadReceipt = async () => {
    if (!receiptFile) {
      setReceiptUploadStatus('error');
      setReceiptMessage("Lütfen bir dekont dosyası seçin");
      return;
    }

    setReceiptUploadLoading(true);
    setReceiptUploadStatus('idle');
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/auth/upload-receipt", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiptFile: receiptFile,
          userId: user?.id,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setReceiptUploadStatus('success');
        setReceiptMessage("Ödeme dekontu başarıyla yüklendi! Admin onayını bekleyiniz.");
        setReceiptFile(null);
        setReceiptPreview(null);
        setTimeout(() => {
          setReceiptUploadStatus('idle');
          setReceiptMessage("");
        }, 5000);
      } else {
        setReceiptUploadStatus('error');
        setReceiptMessage(data.message || "Dekont yükleme başarısız");
      }
    } catch (error) {
      setReceiptUploadStatus('error');
      setReceiptMessage("Dekont yükleme sırasında bir hata oluştu");
      console.error("Receipt upload error:", error);
    } finally {
      setReceiptUploadLoading(false);
    }
  };

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const currentUserData = localStorage.getItem("currentUser");
      const authToken = localStorage.getItem("authToken");

      if (!currentUserData) {
        navigate("/login");
        return;
      }

      const currentUser = JSON.parse(currentUserData);
      if (!currentUser.id) {
        navigate("/login");
        return;
      }

      // If we don't have an authToken, that's okay for older functionality
      // But some new features will require proper login
      if (!authToken) {
        console.warn(
          "No auth token found - some features may not work properly",
        );
      }

      await fetchUserData(currentUser.id);
    } catch (error) {
      console.error("Authentication check failed:", error);
      navigate("/login");
    }
  };

  const calculateRemainingDays = (activeUntil?: string) => {
    if (!activeUntil) return 0;
    const now = new Date();
    const end = new Date(activeUntil);
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  useEffect(() => {
    if (clonePageUrl) {
      generateQRCode();
    }
  }, [clonePageUrl]);

  const fetchUserData = async (userId: string) => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUserInfo(userId),
        fetchTransactions(userId),
        fetchTeamMembers(userId),
        fetchClonePageInfo(userId),
      ]);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = async (userId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          setClonePageUrl(
            `${window.location.origin}/clone/${data.user.memberId}`,
          );
          
          const remainingDays = calculateRemainingDays(data.user.activeUntil);
          if (remainingDays > 0 && remainingDays <= 7) {
            setShowActivityWarning(true);
          } else {
            setShowActivityWarning(false);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const fetchTransactions = async (userId: string) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(`/api/user/${userId}/transactions`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.warn("Error fetching transactions:", error instanceof Error ? error.message : 'Unknown error');
      setTransactions([]);
    }
  };

  const fetchTeamMembers = async (userId: string) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(`/api/user/${userId}/team`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.team || []);
      }
    } catch (error) {
      console.warn("Error fetching team members:", error instanceof Error ? error.message : 'Unknown error');
      setTeamMembers([]);
    }
  };

  const fetchMemberTeam = async (memberId: string) => {
    try {
      const response = await fetch(`/api/user/${memberId}/team`);
      if (response.ok) {
        const data = await response.json();
        return data.team || [];
      }
    } catch (error) {
      console.error("Error fetching member team:", error);
      return [];
    }
  };

  const handleViewMemberTeam = async (member: TeamMember) => {
    setSelectedMemberForTeamView(member);
    setTeamViewModalOpen(true);
    const memberTeam = await fetchMemberTeam(member.id);
    setMemberTeamData(memberTeam);
  };

  const fetchClonePageInfo = async (userId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch("/api/auth/my-clone-page", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCustomMessage(data.clonePage.customizations?.customMessage || "");
          setClonePageUrl(data.cloneUrl);
          setShareStats({
            visits: data.clonePage.visitCount || 0,
            conversions: data.clonePage.conversionCount || 0,
            conversionRate:
              data.clonePage.visitCount > 0
                ? (data.clonePage.conversionCount / data.clonePage.visitCount) *
                  100
                : 0,
          });
        }
      }
    } catch (error) {
      console.warn("Error fetching clone page info:", error instanceof Error ? error.message : 'Unknown error');
      // Set default values on error
      setCustomMessage("");
      setClonePageUrl(`${window.location.origin}/clone/${user?.memberId || 'unknown'}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Link kopyalandı!");
  };

  const updateCustomMessage = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/auth/my-clone-page", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ customMessage }),
      });

      if (response.ok) {
        alert("Özel mesajınız güncellendi!");
      }
    } catch (error) {
      console.error("Error updating custom message:", error);
      alert("Güncelleme hatası!");
    }
  };

  const shareViaWhatsApp = () => {
    const message = `${user?.fullName} üzerinden Kutbul Zaman'a katılın! Manevi gelişim ve finansal özgürlük için: ${clonePageUrl}`;
    window.open(
      `whatsapp://send?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  const shareViaEmail = () => {
    const subject = "Kutbul Zaman Daveti";
    const body = `Merhaba,\n\n${user?.fullName} üzerinden Kutbul Zaman platformuna katılmanızı istiyorum. Bu platform hem manevi gelişim hem de finansal özgürlük sunuyor.\n\nKatılmak için: ${clonePageUrl}\n\nSaygılarımla,\n${user?.fullName}`;
    window.open(
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      "_blank",
    );
  };

  const generateQRCode = () => {
    // Using QR Server API for QR code generation
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(clonePageUrl)}`;
    setQrCodeUrl(qrUrl);
  };

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      safeDownloadUrl(qrCodeUrl, `${user?.memberId}-qr-code.png`);
    }
  };

  const shareViaInstagram = () => {
    const text = `${user?.fullName} üzerinden Kutbul Zaman'a katılın! Manevi gelişim ve finansal özgürlük için: ${clonePageUrl}`;
    // Instagram doesn't have direct URL sharing, copy to clipboard
    navigator.clipboard.writeText(text);
    alert(
      "Instagram paylaşımı için metin kopyalandı! Instagram'da paylaşabilirsiniz.",
    );
  };

  const shareViaTwitter = () => {
    const text = `${user?.fullName} üzerinden Kutbul Zaman'a katılın! Manevi gelişim ve finansal özgürlük için:`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(clonePageUrl)}`;
    window.open(url, "_blank");
  };

  const shareViaFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(clonePageUrl)}`;
    window.open(url, "_blank");
  };

  const shareViaTelegram = () => {
    const text = `${user?.fullName} üzerinden Kutbul Zaman'a katılın! ${clonePageUrl}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(clonePageUrl)}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const updateClonePageSettings = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/user/${user.id}/clone-settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clonePageSettings),
      });

      if (response.ok) {
        alert("Klon sayfa ayarlarınız güncellendi!");
      }
    } catch (error) {
      console.error("Error updating clone page settings:", error);
      alert("Güncelleme hatası!");
    }
  };

  const loadDocuments = useCallback(async () => {
    setDocumentsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      const response = await fetch("/api/auth/member/documents", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        // Filter documents based on user access level
        const filteredDocuments = data.documents?.filter((doc: any) => {
          if (!doc.isActive) return false;
          if (doc.accessLevel === 'all') return true;
          if (doc.accessLevel === 'members' && user?.isActive) return true;
          if (doc.accessLevel === 'leaders' && user?.role === 'leader') return true;
          if (doc.accessLevel === 'admins' && user?.role === 'admin') return true;
          return false;
        }) || [];
        setDocuments(filteredDocuments);
      } else {
        // Use fallback document data for demo (prefer shared storage if exists)
        const stored = JSON.parse(localStorage.getItem('shared_documents') || '[]');
        if (stored.length) {
          const userRole = user?.role || 'member';
          const userActive = user?.isActive || false;
          const filteredStored = stored.filter((doc: any) => {
            if (!doc.isActive) return false;
            if (doc.accessLevel === 'all') return true;
            if (doc.accessLevel === 'members' && userActive) return true;
            if (doc.accessLevel === 'leaders' && userRole === 'leader') return true;
            if (doc.accessLevel === 'admins' && userRole === 'admin') return true;
            return false;
          });
          setDocuments(filteredStored);
          return;
        }
        const fallbackDocs = [
          {
            id: "doc-001",
            title: "Sistem Kullanım Kılavuzu",
            description: "Kapsamlı sistem kullanım rehberi - Tüm özellikler ve işlevler",
            category: "guide",
            type: "document",
            fileName: "sistem-kilavuzu.pdf",
            fileSize: 2048000,
            uploadDate: new Date().toISOString(),
            isActive: true,
            accessLevel: "all",
            tags: ["kılavuz", "sistem"]
          },
          {
            id: "doc-002",
            title: "MLM Komisyon Hesaplama",
            description: "Komisyon hesaplama yöntemleri ve örnekler - Monoline MLM sistem rehberi",
            category: "training",
            type: "presentation",
            fileName: "komisyon-hesaplama.pptx",
            fileSize: 5120000,
            uploadDate: new Date().toISOString(),
            isActive: true,
            accessLevel: "members",
            tags: ["komisyon", "mlm", "eğitim"]
          },
          {
            id: "doc-003",
            title: "Başarılı Network Marketing",
            description: "Network marketing stratejileri ve motivasyon teknikleri",
            category: "training",
            type: "document",
            fileName: "network-marketing-rehberi.pdf",
            fileSize: 3072000,
            uploadDate: new Date().toISOString(),
            isActive: true,
            accessLevel: "all",
            tags: ["network", "marketing", "strateji"]
          }
        ];

        // Filter based on user access level for demo
        const userRole = user?.role || 'member';
        const userActive = user?.isActive || false;

        const filteredDocs = fallbackDocs.filter(doc => {
          if (!doc.isActive) return false;
          if (doc.accessLevel === 'all') return true;
          if (doc.accessLevel === 'members' && userActive) return true;
          if (doc.accessLevel === 'leaders' && userRole === 'leader') return true;
          if (doc.accessLevel === 'admins' && userRole === 'admin') return true;
          return false;
        });

        setDocuments(filteredDocs);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        // Request was aborted due to timeout - use fallback data
      }
      // Silently use fallback documents when API is not available (prefer shared storage if exists)
      const stored = JSON.parse(localStorage.getItem('shared_documents') || '[]');
      if (stored.length) {
        const userRole = user?.role || 'member';
        const userActive = user?.isActive || false;
        const filteredStored = stored.filter((doc: any) => {
          if (!doc.isActive) return false;
          if (doc.accessLevel === 'all') return true;
          if (doc.accessLevel === 'members' && userActive) return true;
          if (doc.accessLevel === 'leaders' && userRole === 'leader') return true;
          if (doc.accessLevel === 'admins' && userRole === 'admin') return true;
          return false;
        });
        setDocuments(filteredStored);
        return;
      }
      const fallbackDocs = [
        {
          id: "doc-001",
          title: "Sistem Kullanım Kılavuzu",
          description: "Kapsamlı sistem kullanım rehberi - Tüm özellikler ve işlevler",
          category: "guide",
          type: "document",
          fileName: "sistem-kilavuzu.pdf",
          fileSize: 2048000,
          uploadDate: new Date().toISOString(),
          isActive: true,
          accessLevel: "all",
          tags: ["kılavuz", "sistem"]
        },
        {
          id: "doc-002",
          title: "MLM Komisyon Hesaplama",
          description: "Komisyon hesaplama yöntemleri ve örnekler - Monoline MLM sistem rehberi",
          category: "training",
          type: "presentation",
          fileName: "komisyon-hesaplama.pptx",
          fileSize: 5120000,
          uploadDate: new Date().toISOString(),
          isActive: true,
          accessLevel: "members",
          tags: ["komisyon", "mlm", "eğitim"]
        },
        {
          id: "doc-003",
          title: "Başarılı Network Marketing",
          description: "Network marketing stratejileri ve motivasyon teknikleri",
          category: "training",
          type: "document",
          fileName: "network-marketing-rehberi.pdf",
          fileSize: 3072000,
          uploadDate: new Date().toISOString(),
          isActive: true,
          accessLevel: "all",
          tags: ["network", "marketing", "strateji"]
        }
      ];

      setDocuments(fallbackDocs);
    } finally {
      setDocumentsLoading(false);
    }
  }, [user]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return '📄';
      case 'doc': case 'docx': return '📝';
      case 'ppt': case 'pptx': return '📊';
      case 'xls': case 'xlsx': return '📈';
      case 'png': case 'jpg': case 'jpeg': case 'gif': return '🖼️';
      case 'mp4': case 'avi': case 'mov': return '🎥';
      case 'mp3': case 'wav': return '🎵';
      case 'zip': case 'rar': return '📦';
      default: return '📎';
    }
  };

  const downloadDocument = async (docId: string, fileName: string) => {
    try {
      const token = localStorage.getItem("authToken");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(`/api/auth/member/documents/${docId}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

        if (response.ok) {
        const blob = await response.blob();
        safeDownloadBlob(blob, fileName);
        alert(`${fileName} başarıyla indirildi!`);
      } else if (response.status === 404) {
        alert(`${fileName} bulunamadı.`);
      } else {
        alert('Dosya indirilemedi. Lütfen daha sonra tekrar deneyin.');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        alert('Dosya indirme işlemi zaman aşımına uğradı. Lütfen tekrar deneyin.');
      } else {
        console.warn('Document download error:', error instanceof Error ? error.message : 'Unknown error');
        alert(`${fileName} indiriliyor... (Demo modu)`);
      }
    }
  };

  // Team Placement Management Functions
  const loadTeamStructure = async () => {
    try {
      // Load current team structure for placement visualization
      const teamStructure = {
        id: user?.id,
        name: user?.fullName,
        position: "sponsor",
        leftChild: null,
        rightChild: null,
        availablePositions: ["downline", "auto"]
      };
      setTeamTreeData(teamStructure);
    } catch (error) {
      console.error("Error loading team structure:", error);
    }
  };

  const placeMemberInTeam = async (placementId: string, position: "downline" | "auto") => {
    try {
      const placement = pendingPlacements.find(p => p.id === placementId);
      if (!placement) return;

      // Call real-time commission API for placement bonuses
      const token = localStorage.getItem("authToken");
      const response = await fetch('/api/commissions/calculate-placement-bonuses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sponsorId: user?.id,
          newUserId: placement.newUserId,
          position
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('👥 Real-time placement bonuses calculated:', result);

        // Update placement status
        setPendingPlacements(prev =>
          prev.map(p => p.id === placementId ? { ...p, status: "placed" } : p)
        );

        // Update user data with real-time commission results
        setUser(prevUser => ({
          ...prevUser,
          directReferrals: prevUser.directReferrals + 1,
          totalTeamSize: prevUser.totalTeamSize + 1,
          wallet: {
            ...prevUser.wallet,
            sponsorBonus: prevUser.wallet.sponsorBonus + result.totalAmount,
            totalEarnings: prevUser.wallet.totalEarnings + result.totalAmount,
            leadershipBonus: prevUser.wallet.leadershipBonus + result.totalAmount
          }
        }));

        alert(`✅ Yerleştirme Başarılı!\n\n👤 ${placement.newUserData.fullName}\n📍 Pozisyon: ${position.toUpperCase()}\n💰 +$${result.totalAmount.toFixed(2)} Otomatik Bonus\n🔄 ${result.totalBonusesCalculated} farklı bonus türü hesaplandı\n\n🎯 Yeni üye takımınıza eklendi ve kazançlarınız anında güncellendi!`);
      } else {
        // Fallback to manual calculation if API fails
        console.warn('Commission API failed, using fallback calculation');

        setPendingPlacements(prev =>
          prev.map(p => p.id === placementId ? { ...p, status: "placed" } : p)
        );

        setUser(prevUser => ({
          ...prevUser,
          directReferrals: prevUser.directReferrals + 1,
          totalTeamSize: prevUser.totalTeamSize + 1,
          wallet: {
            ...prevUser.wallet,
            sponsorBonus: prevUser.wallet.sponsorBonus + 10,
            totalEarnings: prevUser.wallet.totalEarnings + 10
          }
        }));

        alert(`✅ Yerleştirme Başarılı!\n\n👤 ${placement.newUserData.fullName}\n📍 Pozisyon: ${position.toUpperCase()}\n+ $10 Sponsor Bonusu\n\n🎯 Yeni üye takımınıza eklendi!`);
      }

      setPlacementModal(false);
      setSelectedPlacement(null);
    } catch (error) {
      console.error("Error placing member:", error);
      alert("❌ Yerleştirme sırasında hata oluştu!");
    }
  };

  const getAvailablePositions = () => {
    // In monoline system, all new members are placed in the single line
    return {
      downline: true,
      auto: true
    };
  };

  const handlePlacementSelection = (placement: any) => {
    setSelectedPlacement(placement);
    loadTeamStructure();
    setPlacementModal(true);
  };

  // Load documents when component mounts
  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user, loadDocuments]);

  // Live update when admin updates shared_documents in other tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'shared_documents') loadDocuments();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [loadDocuments]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Üye paneliniz yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Erişim Hatası</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Üye bilgilerinize erişilemiyor.</p>
            <Button onClick={() => navigate("/login")}>Tekrar Giriş Yap</Button>
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
              <RouterLink to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-spiritual-purple rounded-lg flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-spiritual-purple bg-clip-text text-transparent">
                  Kutbul Zaman
                </span>
              </RouterLink>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">{user.fullName}</Badge>
              <Badge>{user.memberId}</Badge>
              {/* Show admin panel link if user is admin */}
              {user.role === "admin" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/admin-panel")}
                  className="text-purple-600 hover:text-purple-700"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Panel
                </Button>
              )}
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
          <h1 className="text-3xl font-bold mb-2">Üye Paneliniz</h1>
          <p className="text-foreground/60">
            Hoş geldiniz {user.fullName} - Organizasyonunuzu büyütün ve
            kazançlarınızı takip edin
          </p>

          {/* Activity Expiration Warning */}
          {showActivityWarning && user && (
            <Alert variant="destructive" className="mt-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Aktifliğiniz Sona Eriyor!</AlertTitle>
              <AlertDescription className="flex justify-between items-center">
                <span>
                  Aktiflik sürenizin dolmasına <strong>{calculateRemainingDays(user.activeUntil)} gün</strong> kaldı. Komisyon ve bonus haklarınızı kaybetmemek için üyeliğinizi yenileyin.
                </span>
                <Button size="sm" onClick={() => navigate('/e-wallet')} className="ml-4 bg-white text-red-600 hover:bg-gray-100">Hemen Aktif Ol</Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-4 p-4 border rounded-lg bg-yellow-50 flex items-center justify-between">
            <div className="text-sm">
              <span className="font-semibold">Aktiflik Kalan Süre: </span>
              {user.activeUntil ? (
                <span className={calculateRemainingDays(user.activeUntil) < 7 ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                  {calculateRemainingDays(user.activeUntil)} gün
                  <span className="text-xs text-gray-500 ml-2">
                    ({new Date(user.activeUntil).toLocaleDateString('tr-TR')})
                  </span>
                </span>
              ) : (
                <span className="text-red-600 font-bold">Pasif</span>
              )}
            </div>
            <Button size="sm" onClick={() => navigate('/e-wallet')} className="bg-green-600 hover:bg-green-700 text-white">
              Aktif Ol
            </Button>
          </div>
        </div>

        {/* Live Broadcast Player */}
        <div className="mb-8">
          <LiveBroadcastPlayer
            autoRefresh={true}
            refreshInterval={30000}
            className="shadow-lg"
          />
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Wallet className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">
                    Cüzdan Bakiyesi
                  </p>
                  <p className="text-2xl font-bold">
                    ${user.wallet.balance.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Ekip Üyesi</p>
                  <p className="text-2xl font-bold">{user.totalTeamSize}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Toplam Kazanç</p>
                  <p className="text-2xl font-bold">
                    ${user.wallet.totalEarnings.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Award className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">
                    Kariyer Seviyesi
                  </p>
                  <p className="text-lg font-bold">{user.careerLevel.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full lg:w-auto grid-cols-2 lg:grid-cols-11">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="receipt">📄 Dekont</TabsTrigger>
            <TabsTrigger value="team">Ekibim</TabsTrigger>
            <TabsTrigger value="monoline-tree">🌳 Ağaç Yapım</TabsTrigger>
            <TabsTrigger value="placement">Yerleştirme</TabsTrigger>
            <TabsTrigger value="share">Paylaşım</TabsTrigger>
            <TabsTrigger value="clone-products">Ürün Mağazam</TabsTrigger>
            <TabsTrigger value="earnings">Kazançlar</TabsTrigger>
            <TabsTrigger value="transactions">İşlemler</TabsTrigger>
            <TabsTrigger value="documents">Dökümanlar</TabsTrigger>
            <TabsTrigger value="profile">Profil</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Kazanç Özeti</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                    <span className="text-sm font-medium">Sponsor Bonusu</span>
                    <span className="font-bold text-green-600">
                      ${user.wallet.sponsorBonus.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg">
                    <span className="text-sm font-medium">Kariyer Bonusu</span>
                    <span className="font-bold text-blue-600">
                      ${user.wallet.careerBonus.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg">
                    <span className="text-sm font-medium">Pasif Gelir</span>
                    <span className="font-bold text-purple-600">
                      ${user.wallet.passiveIncome.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-500/10 rounded-lg">
                    <span className="text-sm font-medium">Liderlik Bonusu</span>
                    <span className="font-bold text-orange-600">
                      ${user.wallet.leadershipBonus.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hızlı Paylaşım</CardTitle>
                  <CardDescription>
                    Organizasyonunuzu büyütmek için link paylaşın
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Input value={clonePageUrl} readOnly className="flex-1" />
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(clonePageUrl)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={shareViaWhatsApp}
                      className="w-full"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                    <Button
                      variant="outline"
                      onClick={shareViaEmail}
                      className="w-full"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">
                      Paylaşım İstatistikleri:
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-lg font-bold">{shareStats.visits}</p>
                        <p className="text-xs text-muted-foreground">Ziyaret</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold">
                          {shareStats.conversions}
                        </p>
                        <p className="text-xs text-muted-foreground">Kayıt</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold">
                          {shareStats.conversionRate.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">Oran</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Son Ekip Üyeleri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.slice(0, 5).map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center space-x-4"
                    >
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{member.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          {member.memberId} • {member.careerLevel}
                        </p>
                      </div>
                      <Badge
                        variant={member.isActive ? "default" : "secondary"}
                      >
                        {member.isActive ? "Aktif" : "Pasif"}
                      </Badge>
                    </div>
                  ))}
                  {teamMembers.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      Henüz ekip üyeniz bulunmuyor. Link paylaşarak ekibinizi
                      büyütün!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Receipt Upload Tab */}
          <TabsContent value="receipt" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Ödeme Dekontu Yükle</span>
                </CardTitle>
                <CardDescription>
                  Ödeme dekontunuzu yükleyerek başvurunuzu tamamlayın. Admin onayından sonra sistemin tüm özelliklerine erişim sağlanacaktır.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!user?.isActive && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Önemli:</strong> Sistemi tam olarak aktifleştirmek için ödeme dekontunuzu yüklemeniz gerekmektedir.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="receipt-upload" className="text-base font-semibold mb-2 block">
                      Dekont Dosyası Seçin
                    </Label>
                    <Input
                      id="receipt-upload"
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleReceiptFileChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Desteklenen formatlar: JPG, PNG, PDF (Maksimum 5MB)
                    </p>
                  </div>

                  {receiptPreview && (
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Ön İzleme</Label>
                      {receiptPreview.startsWith('data:image') ? (
                        <img
                          src={receiptPreview}
                          alt="Receipt Preview"
                          className="max-h-96 w-auto rounded-lg border border-gray-200"
                        />
                      ) : (
                        <div className="border border-gray-200 rounded-lg p-8 bg-gray-50 text-center">
                          <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">PDF Dosyası Seçildi</p>
                        </div>
                      )}
                    </div>
                  )}

                  {receiptUploadStatus === 'success' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800 flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5" />
                        <span>{receiptMessage}</span>
                      </p>
                    </div>
                  )}

                  {receiptUploadStatus === 'error' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-800">{receiptMessage}</p>
                    </div>
                  )}

                  <Button
                    onClick={uploadReceipt}
                    disabled={receiptUploadLoading || !receiptFile}
                    className="w-full"
                    size="lg"
                  >
                    {receiptUploadLoading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    )}
                    {receiptUploadLoading ? "Yükleniyor..." : "Dekontu Gönder"}
                  </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-blue-900 text-sm">Ödeme Bilgileri</h4>
                  <div className="text-xs text-blue-800 space-y-1">
                    <p><strong>Hesap Adı:</strong> Kutbul Zaman</p>
                    <p><strong>IBAN:</strong> TR32 0015 7000 0000 0091 7751 22</p>
                    <p><strong>Tutar:</strong> Paketinize göre değişkenlik gösterir</p>
                    <p><strong>İçerik:</strong> Adınız ve Üyelik Numaranız ({user?.memberId})</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  Ekip Organizasyonum ({teamMembers.length})
                </CardTitle>
                <CardDescription>
                  Sizin referansınızla katılan tüm üyeler
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Üye ID</TableHead>
                      <TableHead>İsim</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Seviye</TableHead>
                      <TableHead>Yatırım</TableHead>
                      <TableHead>Pozisyon</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Ekip</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-mono">
                          {member.memberId}
                        </TableCell>
                        <TableCell className="font-medium">
                          {member.fullName}
                        </TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{member.careerLevel}</Badge>
                        </TableCell>
                        <TableCell>${member.totalInvestment}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              member.position === "direct"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {member.position === "direct"
                              ? "Direkt"
                              : "Monoline Hattı"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={member.isActive ? "default" : "secondary"}
                          >
                            {member.isActive ? "Aktif" : "Pasif"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewMemberTeam(member)}
                            className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ekibi Gör
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monoline Tree View Tab */}
          <TabsContent value="monoline-tree" className="space-y-6">
            <Card className="bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse"></div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">🌳 Monoline MLM Ağaç Yapınız</h3>
                      <p className="text-sm text-gray-700">Sizin ağaç yapınızı ve tüm downline network'ünüzü görüntüleyin</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-purple-700">💎 Tek Hat Sistemi</p>
                    <p className="text-xs text-gray-600">7 seviye derinlik + pasif gelir</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {user && (
              <MonolineTreeView
                userId={user.id}
                userName={user.fullName}
                memberId={user.memberId}
                maxLevels={7}
              />
            )}
          </TabsContent>

          {/* Team Placement Management Tab */}
          <TabsContent value="placement" className="space-y-6">
            {/* Pending Placements Overview */}
            <Card className="bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-orange-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-orange-500 rounded-full animate-pulse"></div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">👥 Takım Yerleştirme Merkezi</h3>
                      <p className="text-sm text-gray-700">Yeni üyeleri takımınızda istediğiniz pozisyona yerleştirin</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-orange-700">⏳ Bekleyen: {pendingPlacements.filter(p => p.status === 'pending').length}</p>
                    <p className="text-xs text-gray-600">Toplam Takım: {user?.totalTeamSize || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Placements List */}
            {pendingPlacements.filter(p => p.status === 'pending').length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-orange-600" />
                    <span>📋 Yerleştirilmeyi Bekleyen Üyeler</span>
                  </CardTitle>
                  <CardDescription>
                    Referans linkiniz üzerinden kayıt olan üyeler için pozisyon seçin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingPlacements.filter(p => p.status === 'pending').map((placement) => (
                      <div key={placement.id} className="p-4 border rounded-lg bg-orange-50 border-orange-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                                {placement.newUserData.fullName.charAt(0)}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{placement.newUserData.fullName}</h3>
                                <p className="text-sm text-gray-600">{placement.newUserData.email}</p>
                                <p className="text-xs text-gray-500">
                                  Kayıt: {new Date(placement.registrationDate).toLocaleDateString('tr-TR')}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center space-x-4 text-xs">
                              <Badge variant="outline">📞 {placement.newUserData.phone}</Badge>
                              <Badge variant="outline">📦 {placement.newUserData.membershipType}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handlePlacementSelection(placement)}
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              <Target className="w-3 h-3 mr-1" />
                              Pozisyon Seç
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Bekleyen Yerleştirme Yok</h3>
                  <p className="text-gray-500 mb-4">
                    Şu anda yerleştirilmeyi bekleyen yeni üye bulunmuyor.
                  </p>
                  <Button variant="outline" onClick={() => { const link = clonePageUrl; const text = `Referans linkim: ${link}`; if ((navigator as any).share) { (navigator as any).share({ title: 'Referans Linki', text, url: link }).catch(() => copyToClipboard(link)); } else { copyToClipboard(link); } }}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Referans Linkini Paylaş
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Team Structure Visualization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TreePine className="w-5 h-5 text-green-600" />
                  <span>🌳 Takım Yapınız</span>
                </CardTitle>
                <CardDescription>
                  Mevcut takım yapınızı görüntüleyin ve yeni pozisyonları analiz edin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  {/* Sponsor Level (Current User) */}
                  <div className="flex justify-center">
                    <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4 text-center">
                      <div className="w-12 h-12 bg-blue-600 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">
                        {user?.fullName?.charAt(0) || 'U'}
                      </div>
                      <div className="text-sm font-semibold">{user?.fullName}</div>
                      <div className="text-xs text-gray-600">SPONSOR</div>
                    </div>
                  </div>

                  {/* Monoline Levels */}
                  <div className="flex justify-center">
                    {/* Monoline Downline Position */}
                    <div className="text-center">
                      <div className="w-32 h-20 border-2 border-dashed border-purple-300 rounded-lg flex items-center justify-center bg-purple-50">
                        <div className="text-purple-600">
                          <Plus className="w-8 h-8 mb-1 mx-auto" />
                          <div className="text-xs font-semibold">💎 MONOLiNE HATTI</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mt-4">
                    💡 Monoline sistemde tüm yeni üyeler tek hatta sıralı olarak yerleştirilir
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Share Tab - Enhanced Clone Page Management */}
          <TabsContent value="share" className="space-y-6">
            {/* Clone Page URL and QR Code */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Kişisel Klon Sayfanız
                  </CardTitle>
                  <CardDescription>
                    Kendi referans ID'niz ile özelleştirilmiş landing sayfanız
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-muted rounded-lg">
                    <Label className="text-sm font-medium">
                      Klon Sayfa URL'iniz:
                    </Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Input
                        value={clonePageUrl}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button onClick={() => copyToClipboard(clonePageUrl)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Üye ID'niz:</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          value={user.memberId}
                          readOnly
                          className="font-mono"
                        />
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard(user.memberId)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label>Referans Kodunuz:</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          value={user.referralCode}
                          readOnly
                          className="font-mono"
                        />
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard(user.referralCode)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      className="flex-1"
                      onClick={() => window.open(clonePageUrl, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Klon Sayfanızı Görüntüle
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        window.open(`${clonePageUrl}?preview=true`, "_blank")
                      }
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Önizleme
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <QrCode className="w-5 h-5 mr-2" />
                    QR Kod
                  </CardTitle>
                  <CardDescription>Mobil paylaşım için QR kod</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {qrCodeUrl && (
                    <div className="text-center">
                      <img
                        src={qrCodeUrl}
                        alt="QR Code"
                        className="w-48 h-48 mx-auto border rounded-lg shadow-sm"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      onClick={downloadQRCode}
                      disabled={!qrCodeUrl}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      İndir
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(clonePageUrl)}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Link
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Social Media Sharing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Share2 className="w-5 h-5 mr-2" />
                  Sosyal Medya Paylaşımı
                </CardTitle>
                <CardDescription>
                  Klon sayfanızı farklı platformlarda paylaşın
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  <Button
                    variant="outline"
                    onClick={shareViaWhatsApp}
                    className="flex flex-col h-20 space-y-1"
                  >
                    <MessageSquare className="w-6 h-6 text-green-600" />
                    <span className="text-xs">WhatsApp</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={shareViaFacebook}
                    className="flex flex-col h-20 space-y-1"
                  >
                    <Facebook className="w-6 h-6 text-blue-600" />
                    <span className="text-xs">Facebook</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={shareViaTwitter}
                    className="flex flex-col h-20 space-y-1"
                  >
                    <Twitter className="w-6 h-6 text-blue-400" />
                    <span className="text-xs">Twitter</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={shareViaInstagram}
                    className="flex flex-col h-20 space-y-1"
                  >
                    <Instagram className="w-6 h-6 text-pink-600" />
                    <span className="text-xs">Instagram</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={shareViaTelegram}
                    className="flex flex-col h-20 space-y-1"
                  >
                    <Send className="w-6 h-6 text-blue-500" />
                    <span className="text-xs">Telegram</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={shareViaEmail}
                    className="flex flex-col h-20 space-y-1"
                  >
                    <Mail className="w-6 h-6 text-gray-600" />
                    <span className="text-xs">Email</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Clone Page Customization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Edit className="w-5 h-5 mr-2" />
                    Sayfa Özelleştirme
                  </CardTitle>
                  <CardDescription>
                    Klon sayfanızın görünümünü özelleştirin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Özel Mesajınız:</Label>
                    <Textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Ziyaretçilerinize özel bir mesaj yazın..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Başlık Rengi:</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          type="color"
                          value={clonePageSettings.headerColor}
                          onChange={(e) =>
                            setClonePageSettings({
                              ...clonePageSettings,
                              headerColor: e.target.value,
                            })
                          }
                          className="w-12 h-8 p-0 border-0"
                        />
                        <Input
                          value={clonePageSettings.headerColor}
                          onChange={(e) =>
                            setClonePageSettings({
                              ...clonePageSettings,
                              headerColor: e.target.value,
                            })
                          }
                          className="flex-1 font-mono text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Buton Rengi:</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          type="color"
                          value={clonePageSettings.buttonColor}
                          onChange={(e) =>
                            setClonePageSettings({
                              ...clonePageSettings,
                              buttonColor: e.target.value,
                            })
                          }
                          className="w-12 h-8 p-0 border-0"
                        />
                        <Input
                          value={clonePageSettings.buttonColor}
                          onChange={(e) =>
                            setClonePageSettings({
                              ...clonePageSettings,
                              buttonColor: e.target.value,
                            })
                          }
                          className="flex-1 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={clonePageSettings.showTestimonials}
                        onChange={(e) =>
                          setClonePageSettings({
                            ...clonePageSettings,
                            showTestimonials: e.target.checked,
                          })
                        }
                      />
                      <span>Yorumları Göster</span>
                    </Label>
                    <Label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={clonePageSettings.showFeatures}
                        onChange={(e) =>
                          setClonePageSettings({
                            ...clonePageSettings,
                            showFeatures: e.target.checked,
                          })
                        }
                      />
                      <span>Özellikleri Göster</span>
                    </Label>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={updateCustomMessage}>
                      <Save className="w-4 h-4 mr-2" />
                      Mesajı Kaydet
                    </Button>
                    <Button onClick={updateClonePageSettings} variant="outline">
                      <Palette className="w-4 h-4 mr-2" />
                      Tasarımı Kaydet
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Performans İstatistikleri
                  </CardTitle>
                  <CardDescription>
                    Klon sayfanızın performans verileriniz
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <Eye className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-2xl font-bold">{shareStats.visits}</p>
                      <p className="text-sm text-muted-foreground">
                        Toplam Ziyaret
                      </p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Users className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <p className="text-2xl font-bold">
                        {shareStats.conversions}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Yeni Kayıt
                      </p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Target className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                      <p className="text-2xl font-bold">
                        {shareStats.conversionRate.toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Dönüşüm Oranı
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <h4 className="font-medium mb-2">Paylaşım İpuçları:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• QR kodu kartvizitirinize ekleyin</li>
                      <li>• Sosyal medyada düzenli paylaşın</li>
                      <li>• WhatsApp durumunda paylaşın</li>
                      <li>• Email imzanıza ekleyin</li>
                      <li>• özel mesajınızı düzenli güncelleyin</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Hızlı İşlemler</CardTitle>
                <CardDescription>
                  Sık kullanılan paylaşım ve yönetim işlemleri
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="default"
                    onClick={() => {
                      const authToken = localStorage.getItem("authToken");
                      if (!authToken) {
                        alert(
                          "Bu özellik için tekrar giriş yapmanız gerekiyor.",
                        );
                        navigate("/login");
                        return;
                      }
                      navigate("/e-wallet");
                    }}
                    className="bg-gradient-to-r from-green-500 to-green-600"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    E-Cüzdan & Finansal
                  </Button>

                  <Button
                    variant="default"
                    onClick={() => {
                      const authToken = localStorage.getItem("authToken");
                      if (!authToken) {
                        alert(
                          "Bu özellik için tekrar giriş yapmanız gerekiyor.",
                        );
                        navigate("/login");
                        return;
                      }
                      navigate("/real-time-transactions");
                    }}
                    className="bg-gradient-to-r from-primary to-spiritual-purple"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Gerçek Zamanlı İşlemler
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      const text = `${user?.fullName} - ${user?.memberId}\nKutbul Zaman Davet Linki:\n${clonePageUrl}`;
                      navigator.clipboard.writeText(text);
                      alert("Kartvizit metni kopyalandı!");
                    }}
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Kartvizit Metni
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      const emailSignature = `\n\n---\n${user?.fullName}\nKutbul Zaman Üyesi\n${clonePageUrl}`;
                      navigator.clipboard.writeText(emailSignature);
                      alert("Email imzası kopyalandı!");
                    }}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email İmzası
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: "Kutbul Zaman Daveti",
                          text: `${user?.fullName} üzerinden katılın!`,
                          url: clonePageUrl,
                        });
                      } else {
                        copyToClipboard(clonePageUrl);
                        alert("Link kopyalandı!");
                      }
                    }}
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    Mobil Paylaş
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      window.print();
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    QR Yazdır
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clone Products Tab */}
          <TabsContent value="clone-products" className="space-y-6">
            {/* Clone Product Page Header */}
            <Card className="bg-gradient-to-r from-spiritual-gold/10 to-primary/10 border-2 border-spiritual-gold/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-spiritual-gold to-primary rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">🛍️ Kişisel Ürün Mağazanız</h3>
                      <p className="text-gray-700">Özel ürün sayfanızdan yapılan alışverişlerde %15 otomatik komisyon kazanın</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-spiritual-gold">%15 Komisyon Garantisi</p>
                    <p className="text-sm text-gray-600">Her satışta otomatik</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Clone Product URL and Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-2 text-spiritual-gold" />
                    Ürün Mağaza Linkiniz
                  </CardTitle>
                  <CardDescription>
                    Bu linki paylaşarak ürün satışı yapın ve %15 komisyon kazanın
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <Label className="text-sm font-medium">
                      Kişisel Ürün Mağaza URL'iniz:
                    </Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Input
                        value={`${window.location.origin}/clone-products/${user?.memberId}`}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        onClick={() => copyToClipboard(`${window.location.origin}/clone-products/${user?.memberId}`)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      className="w-full bg-gradient-to-r from-spiritual-gold to-spiritual-gold/80 hover:from-spiritual-gold/90 hover:to-spiritual-gold/70"
                      onClick={() => window.open(`${window.location.origin}/clone-products/${user?.memberId}`, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ürün Mağazanızı Görüntüle
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const text = `${user?.fullName} özel ürün mağazasına göz atın! Premium manevi ürünler ve %15 otomatik komisyon sistemi. ${window.location.origin}/clone-products/${user?.memberId}`;
                          window.open(`whatsapp://send?text=${encodeURIComponent(text)}`, "_blank");
                        }}
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        WhatsApp
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const text = `${user?.fullName} özel ürün mağazası: ${window.location.origin}/clone-products/${user?.memberId}`;
                          navigator.clipboard.writeText(text);
                          alert("Sosyal medya metni kopyalandı!");
                        }}
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        Sosyal Medya
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-primary" />
                    Ürün Mağaza İstatistikleri
                  </CardTitle>
                  <CardDescription>
                    Kişisel ürün sayfanızın performans verileri
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="text-center p-4 border rounded-lg bg-blue-50">
                      <Eye className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-2xl font-bold">125</p>
                      <p className="text-sm text-muted-foreground">
                        Sayfa Ziyareti
                      </p>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-green-50">
                      <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <p className="text-2xl font-bold">8</p>
                      <p className="text-sm text-muted-foreground">
                        Başarılı Satış
                      </p>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-spiritual-gold/10">
                      <TrendingUp className="w-8 h-8 mx-auto mb-2 text-spiritual-gold" />
                      <p className="text-2xl font-bold">$127.50</p>
                      <p className="text-sm text-muted-foreground">
                        Toplam Komisyon
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Clone Product Features */}
            <Card>
              <CardHeader>
                <CardTitle>🎯 Ürün Mağazası Özellikleri</CardTitle>
                <CardDescription>
                  Kişisel ürün mağazanızın sunduğu avantajlar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-spiritual-gold/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Crown className="w-6 h-6 text-spiritual-gold" />
                    </div>
                    <h4 className="font-semibold mb-2">%15 Otomatik Komisyon</h4>
                    <p className="text-sm text-muted-foreground">
                      Her satışta anında hesabınıza yatırılır
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-2">Anında İşlem</h4>
                    <p className="text-sm text-muted-foreground">
                      Satış gerçekleşir gerçekleşmez komisyon hesaplanır
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Müşteri Takibi</h4>
                    <p className="text-sm text-muted-foreground">
                      Satış yapılan müşteriler otomatik olarak kaydedilir
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Network className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold mb-2">MLM Entegrasyonu</h4>
                    <p className="text-sm text-muted-foreground">
                      Normal sistem dağıtımı da devam eder
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Clone Product Sales */}
            <Card>
              <CardHeader>
                <CardTitle>Son Ürün Satışları</CardTitle>
                <CardDescription>
                  Kişisel ürün mağazanızdan yapılan son satışlar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      id: 1,
                      customer: "m***@gmail.com",
                      product: "Manevi Gelişim Premium Seti",
                      amount: 299,
                      commission: 44.85,
                      date: "2 saat önce",
                      status: "Tamamlandı"
                    },
                    {
                      id: 2,
                      customer: "a***@hotmail.com",
                      product: "Kutsal Tesbihat ve Zikirmatik",
                      amount: 149,
                      commission: 22.35,
                      date: "1 gün önce",
                      status: "Kargoda"
                    },
                    {
                      id: 3,
                      customer: "f***@yahoo.com",
                      product: "Nefis Mertebeleri Eğitim Paketi",
                      amount: 499,
                      commission: 74.85,
                      date: "3 gün önce",
                      status: "Teslim Edildi"
                    },
                  ].map((sale) => (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-spiritual-gold/10 rounded-full flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-spiritual-gold" />
                        </div>
                        <div>
                          <p className="font-medium">{sale.product}</p>
                          <p className="text-sm text-muted-foreground">
                            {sale.customer} • {sale.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${sale.amount}</p>
                        <p className="text-sm text-spiritual-gold font-medium">
                          +${sale.commission} komisyon
                        </p>
                        <Badge variant="outline" className="mt-1">
                          {sale.status}
                        </Badge>
                      </div>
                    </div>
                  ))}

                  {/* Empty State */}
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium mb-2">Henüz ürün satışı yok</p>
                    <p className="text-sm mb-4">
                      Ürün mağaza linkinizi paylaşarak ilk satışınızı yapın!
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => window.open(`${window.location.origin}/clone-products/${user?.memberId}`, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Mağazanızı Görüntüle
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions for Clone Products */}
            <Card>
              <CardHeader>
                <CardTitle>Hızlı İşlemler</CardTitle>
                <CardDescription>
                  Ürün mağazanız için hızlı paylaşım ve yönetim işlemleri
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="default"
                    onClick={() => window.open(`${window.location.origin}/clone-products/${user?.memberId}`, "_blank")}
                    className="bg-gradient-to-r from-spiritual-gold to-spiritual-gold/80"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Mağazayı Aç
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      const storeUrl = `${window.location.origin}/clone-products/${user?.memberId}`;
                      const text = `🛍️ ${user?.fullName} özel ürün mağazası!\n\n✨ Premium manevi ürünler\n💰 %15 otomatik komisyon sistemi\n🚀 Anında işlem garantisi\n\n${storeUrl}`;
                      navigator.clipboard.writeText(text);
                      alert("Mağaza tanıtım metni kopyalandı!");
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Tanıtım Metni
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      const storeUrl = `${window.location.origin}/clone-products/${user?.memberId}`;
                          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(storeUrl)}`;
                          safeDownloadUrl(qrUrl, `${user?.memberId}-store-qr.png`);
                    }}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    QR İndir
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => navigate("/clone-customers")}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Müşteri Takibi
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Kazanç Detayları</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                      <span className="text-sm font-medium">
                        Sponsor Bonusu
                      </span>
                      <span className="font-bold text-green-600">
                        ${user.wallet.sponsorBonus.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg">
                      <span className="text-sm font-medium">
                        Kariyer Bonusu
                      </span>
                      <span className="font-bold text-blue-600">
                        ${user.wallet.careerBonus.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg">
                      <span className="text-sm font-medium">Pasif Gelir</span>
                      <span className="font-bold text-purple-600">
                        ${user.wallet.passiveIncome.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-500/10 rounded-lg">
                      <span className="text-sm font-medium">
                        Liderlik Bonusu
                      </span>
                      <span className="font-bold text-orange-600">
                        ${user.wallet.leadershipBonus.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Kariyer İlerleme</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <Badge className="text-lg p-3">
                        <Award className="w-5 h-5 mr-2" />
                        {user.careerLevel.name}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-2">
                        Mevcut Kariyer Seviyeniz
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Komisyon Oranı:</span>
                        <span className="font-bold">
                          %{user.careerLevel.commissionRate}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Direkt Üye:</span>
                        <span className="font-bold">
                          {user.directReferrals}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Toplam Ekip:</span>
                        <span className="font-bold">{user.totalTeamSize}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Toplam Yatırım:</span>
                        <span className="font-bold">
                          ${user.totalInvestment}
                        </span>
                      </div>
                    </div>
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
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>İşlem Geçmişi</CardTitle>
                <CardDescription>
                  Tüm kazanç ve ödeme işlemleriniz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarih</TableHead>
                      <TableHead>İşlem Türü</TableHead>
                      <TableHead>Açıklama</TableHead>
                      <TableHead>Tutar</TableHead>
                      <TableHead>Durum</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {new Date(transaction.date).toLocaleDateString(
                            "tr-TR",
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{transaction.type}</Badge>
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
                {transactions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Henüz işlem bulunmuyor
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            {/* Documents Header */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">📚 Eğitim Dökümanları</h3>
                      <p className="text-sm text-gray-700">Admin tarafından paylaşılan eğitim materyalleri ve dokümanlar</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-blue-700">🔄 Otomatik Güncellenen</p>
                    <p className="text-xs text-gray-600">Toplam: {documents.length} döküman</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {documentsLoading ? (
                // Loading State
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        <div className="flex space-x-2">
                          <div className="h-8 bg-gray-200 rounded w-20"></div>
                          <div className="h-8 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : documents.length === 0 ? (
                // Empty State
                <div className="col-span-full">
                  <Card>
                    <CardContent className="p-12 text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">Henüz döküman bulunmuyor</h3>
                      <p className="text-gray-500 mb-4">Admin tarafından paylaşılan dökümanlar burada görünecek</p>
                      <Button
                        onClick={() => loadDocuments()}
                        variant="outline"
                        className="border-2 border-blue-400 hover:border-blue-600"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Yenile
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                // Documents List
                documents.map((doc) => (
                  <Card key={doc.id} className="hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-300">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Document Header */}
                        <div className="flex items-start space-x-3">
                          <div className="text-3xl">{getFileIcon(doc.fileName)}</div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{doc.title}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className="bg-blue-100 text-blue-800 text-xs">
                                {doc.category === 'general' && '📋 Genel'}
                                {doc.category === 'guide' && '📖 Kılavuz'}
                                {doc.category === 'training' && '🎓 Eğitim'}
                                {doc.category === 'mlm' && '🌳 MLM'}
                                {doc.category === 'spiritual' && '🕌 Manevi'}
                                {doc.category === 'financial' && '💰 Finansal'}
                                {doc.category === 'announcement' && '📢 Duyuru'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {doc.type === 'document' && '📄 Döküman'}
                                {doc.type === 'presentation' && '📊 Sunum'}
                                {doc.type === 'spreadsheet' && '📈 Tablo'}
                                {doc.type === 'image' && '🖼️ Görsel'}
                                {doc.type === 'video' && '🎥 Video'}
                                {doc.type === 'audio' && '🎵 Ses'}
                                {doc.type === 'archive' && '📦 Arşiv'}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Document Description */}
                        <p className="text-sm text-gray-600 line-clamp-3">{doc.description}</p>

                        {/* Document Info */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="font-semibold text-gray-600">Dosya:</span>
                            <p className="text-gray-800 truncate">{doc.fileName}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-600">Boyut:</span>
                            <p className="text-gray-800">{formatFileSize(doc.fileSize)}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-600">Tarih:</span>
                            <p className="text-gray-800">{new Date(doc.uploadDate).toLocaleDateString('tr-TR')}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-600">Erişim:</span>
                            <p className="text-gray-800">
                              {doc.accessLevel === 'all' && '👥 Herkes'}
                              {doc.accessLevel === 'members' && '🏆 Üyeler'}
                              {doc.accessLevel === 'leaders' && '👑 Liderler'}
                              {doc.accessLevel === 'admins' && '⚙️ Adminler'}
                            </p>
                          </div>
                        </div>

                        {/* Document Tags */}
                        {doc.tags && doc.tags.length > 0 && (
                          <div>
                            <div className="flex flex-wrap gap-1">
                              {doc.tags.slice(0, 3).map((tag: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs px-2 py-1">
                                  #{tag}
                                </Badge>
                              ))}
                              {doc.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs px-2 py-1">
                                  +{doc.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-2 pt-2 border-t">
                          <Button
                            size="sm"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => downloadDocument(doc.id, doc.fileName)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            İndir
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-2 border-green-400 hover:border-green-600 hover:bg-green-50"
                            onClick={() => {
                              // Preview document logic
                              alert(`${doc.title} dökümanı önizleniyor...`);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Görüntüle
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Documents Actions */}
            {documents.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Toplam {documents.length} döküman mevcut • Son güncelleme: Az önce
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          loadDocuments();
                          alert('Döküman listesi yenilendi!');
                        }}
                        className="border-2 border-blue-400 hover:border-blue-600"
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Yenile
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          alert('Tüm dökümanlar indiriliyor...');
                        }}
                        className="border-2 border-green-400 hover:border-green-600"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Hepsini İndir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Real-time Sync Info */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">🔄 Otomatik Senkronizasyon</h4>
                    <p className="text-sm text-gray-700">
                      Admin tarafından yüklenen yeni dökümanlar otomatik olarak burada görünür.
                      Erişim izinlerinize göre filtrelenmiş dökümanları görüyorsunuz.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profil Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Üye ID</Label>
                    <Input value={user.memberId} readOnly />
                  </div>
                  <div>
                    <Label>Ad Soyad</Label>
                    <Input value={user.fullName} readOnly />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={user.email} readOnly />
                  </div>
                  <div>
                    <Label>Telefon</Label>
                    <Input value={user.phone} readOnly />
                  </div>
                  <div>
                    <Label>Kayıt Tarihi</Label>
                    <Input
                      value={new Date(user.registrationDate).toLocaleDateString(
                        "tr-TR",
                      )}
                      readOnly
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Üyelik Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Üyelik Türü</Label>
                    <Input value={user.membershipType} readOnly />
                  </div>
                  <div>
                    <Label>Durum</Label>
                    <Input value={user.isActive ? "Aktif" : "Pasif"} readOnly />
                  </div>
                  <div>
                    <Label>Referans Kodu</Label>
                    <div className="flex space-x-2">
                      <Input value={user.referralCode} readOnly />
                      <Button
                        onClick={() => copyToClipboard(user.referralCode)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Rol</Label>
                    <Input value={user.role} readOnly />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Team View Modal */}
        <Dialog open={teamViewModalOpen} onOpenChange={setTeamViewModalOpen}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <User2 className="w-5 h-5" />
                <span>
                  {selectedMemberForTeamView?.fullName} - Ekip Görünümü
                </span>
              </DialogTitle>
              <DialogDescription>
                {selectedMemberForTeamView?.memberId} üyesinin ekip yapısı ve detayları
              </DialogDescription>
            </DialogHeader>

            {selectedMemberForTeamView && (
              <div className="space-y-6">
                {/* View Mode Toggle */}
                <div className="flex items-center justify-center space-x-2 p-4 bg-gray-50 rounded-lg">
                  <Button
                    variant={teamViewMode === 'list' ? 'default' : 'outline'}
                    onClick={() => setTeamViewMode('list')}
                    className="flex items-center space-x-2"
                  >
                    <List className="w-4 h-4" />
                    <span>Liste Görünümü</span>
                  </Button>
                  <Button
                    variant={teamViewMode === 'tree' ? 'default' : 'outline'}
                    onClick={() => setTeamViewMode('tree')}
                    className="flex items-center space-x-2"
                  >
                    <TreePine className="w-4 h-4" />
                    <span>Ağaç Görünümü</span>
                  </Button>
                </div>

                {/* Member Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {selectedMemberForTeamView.fullName} - Ekip Özeti
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                        <p className="text-sm text-gray-600">Direkt Üye</p>
                        <p className="text-xl font-bold text-blue-600">
                          {selectedMemberForTeamView.directReferrals}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <Network className="w-6 h-6 mx-auto mb-2 text-green-600" />
                        <p className="text-sm text-gray-600">Toplam Ekip</p>
                        <p className="text-xl font-bold text-green-600">
                          {memberTeamData.length}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <DollarSign className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                        <p className="text-sm text-gray-600">Yatırım</p>
                        <p className="text-xl font-bold text-purple-600">
                          ${selectedMemberForTeamView.totalInvestment}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <Award className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                        <p className="text-sm text-gray-600">Seviye</p>
                        <p className="text-lg font-bold text-orange-600">
                          {selectedMemberForTeamView.careerLevel}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* List View */}
                {teamViewMode === 'list' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <List className="w-5 h-5" />
                        <span>Ekip Listesi ({memberTeamData.length})</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {memberTeamData.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Üye ID</TableHead>
                              <TableHead>İsim</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Seviye</TableHead>
                              <TableHead>Pozisyon</TableHead>
                              <TableHead>Yatırım</TableHead>
                              <TableHead>Durum</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {memberTeamData.map((teamMember) => (
                              <TableRow key={teamMember.id}>
                                <TableCell className="font-mono">
                                  {teamMember.memberId}
                                </TableCell>
                                <TableCell className="font-medium">
                                  {teamMember.fullName}
                                </TableCell>
                                <TableCell>{teamMember.email}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {teamMember.careerLevel}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      teamMember.position === "direct"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {teamMember.position === "direct"
                                      ? "Direkt"
                                        : "Monoline Hattı"}
                                  </Badge>
                                </TableCell>
                                <TableCell>${teamMember.totalInvestment}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      teamMember.isActive ? "default" : "secondary"
                                    }
                                  >
                                    {teamMember.isActive ? "Aktif" : "Pasif"}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Bu üyenin henüz ekip üyesi bulunmuyor.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Tree View */}
                {teamViewMode === 'tree' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TreePine className="w-5 h-5" />
                        <span>💎 Monoline Network Görünümü</span>
                      </CardTitle>
                      <CardDescription>
                        {selectedMemberForTeamView.fullName} üyesinin monoline MLM network yapısı
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <h4 className="font-semibold text-purple-800 mb-2">💎 Monoline MLM Network</h4>
                          <div className="text-center space-y-2">
                            <div className="text-lg font-bold text-purple-600">
                              Pozisyon #{Math.floor(Math.random() * 1000) + 1}
                            </div>
                            <div className="text-sm text-gray-600">
                              Tek hat MLM sisteminde sıralı yerleşim
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-green-50 rounded-lg">
                            <div className="text-lg font-bold text-green-600">{selectedMemberForTeamView.directReferrals || 0}</div>
                            <div className="text-sm text-gray-600">Direkt Referanslar</div>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="text-lg font-bold text-blue-600">{selectedMemberForTeamView.level || 1}</div>
                            <div className="text-sm text-gray-600">Monoline Seviyesi</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Team Placement Modal */}
        <Dialog open={placementModal} onOpenChange={setPlacementModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Target className="w-6 h-6 text-orange-600" />
                <span>🎯 Takım Yerleştirme</span>
              </DialogTitle>
              <DialogDescription>
                {selectedPlacement && `${selectedPlacement.newUserData.fullName} için takım pozisyonu seçin`}
              </DialogDescription>
            </DialogHeader>

            {selectedPlacement && (
              <div className="space-y-6">
                {/* New Member Info */}
                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {selectedPlacement.newUserData.fullName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{selectedPlacement.newUserData.fullName}</h3>
                        <p className="text-sm text-gray-600">{selectedPlacement.newUserData.email}</p>
                        <div className="flex items-center space-x-3 mt-1">
                          <Badge variant="outline">📱 {selectedPlacement.newUserData.phone}</Badge>
                          <Badge variant="outline">📦 {selectedPlacement.newUserData.membershipType}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Position Selection */}
                <div>
                  <h3 className="font-semibold mb-4 text-gray-900">📍 Pozisyon Seçenekleri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Monoline Downline Position */}
                    <Card
                      className="cursor-pointer border-2 hover:border-purple-400 transition-colors bg-white border-purple-200"
                      onClick={() => placeMemberInTeam(selectedPlacement.id, 'downline')}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                          <div className="text-purple-600 font-bold">💎</div>
                        </div>
                        <h4 className="font-semibold mb-1">Monoline Hattı</h4>
                        <p className="text-xs text-gray-600 mb-2">
                          Tek hat MLM sistemine sıralı yerleştirme
                        </p>
                        <Badge className="bg-purple-100 text-purple-700">✅ Müsait</Badge>
                      </CardContent>
                    </Card>

                    {/* Auto Position */}
                    <Card
                      className="cursor-pointer border-2 hover:border-green-400 transition-colors bg-white border-gray-200"
                      onClick={() => placeMemberInTeam(selectedPlacement.id, 'auto')}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                          <div className="text-green-600 font-bold">AUTO</div>
                        </div>
                        <h4 className="font-semibold mb-1">Otomatik Yerleştirme</h4>
                        <p className="text-xs text-gray-600 mb-2">
                          Sistem otomatik olarak sıradaki uygun pozisyona yerleştirir
                        </p>
                        <Badge className="bg-blue-100 text-blue-700">🤖 Akıllı</Badge>
                      </CardContent>
                    </Card>
                  </div>
                </div>

              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
