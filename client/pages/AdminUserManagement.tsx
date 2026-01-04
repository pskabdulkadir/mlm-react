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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Search,
  UserPlus,
  Edit,
  Trash2,
  Move,
  Eye,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  Activity,
  Crown,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface User {
  id: string;
  memberId: string;
  fullName: string;
  email: string;
  phone: string;
  role: "admin" | "leader" | "member" | "visitor";
  isActive: boolean;
  careerLevel: {
    name: string;
    level: number;
  };
  wallet: {
    balance: number;
    totalEarnings: number;
  };
  kycStatus: "pending" | "approved" | "rejected";
  membershipType: "entry" | "monthly" | "yearly";
  registrationDate: string;
  lastLoginDate: string;
  sponsorId?: string;
  leftChild?: string;
  rightChild?: string;
  twoFactorEnabled: boolean;
}

interface AdminLog {
  id: string;
  action: string;
  targetUserId?: string;
  details: string;
  adminId: string;
  timestamp: string;
}

export default function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(20);

  // Create/Edit/Move user form state types
  interface CreateForm {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role: "admin" | "leader" | "member" | "visitor";
    sponsorId?: string;
    isActive: boolean;
    membershipType: "entry" | "monthly" | "yearly";
    initialBalance: number;
    placementPreference: "auto" | "manual";
  }

  interface EditForm {
    fullName: string;
    email: string;
    phone: string;
    role: "admin" | "leader" | "member" | "visitor";
    isActive: boolean;
    careerLevel: string;
    walletBalance: number;
    kycStatus: "pending" | "approved" | "rejected";
    membershipType: "entry" | "monthly" | "yearly";
    twoFactorEnabled: boolean;
  }

  interface MoveForm {
    newParentId: string;
    newPosition: "left" | "right";
  }

  const [createForm, setCreateForm] = useState<CreateForm>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "member",
    sponsorId: "",
    isActive: true,
    membershipType: "entry",
    initialBalance: 0,
    placementPreference: "auto",
  });

  const [editForm, setEditForm] = useState<EditForm>({
    fullName: "",
    email: "",
    phone: "",
    role: "member",
    isActive: true,
    careerLevel: "",
    walletBalance: 0,
    kycStatus: "pending",
    membershipType: "entry",
    twoFactorEnabled: false,
  });

  const [moveForm, setMoveForm] = useState<MoveForm>({
    newParentId: "",
    newPosition: "left",
  });

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    leaders: 0,
    members: 0,
    visitors: 0,
  });

  useEffect(() => {
    loadUsers();
    loadLogs();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [users]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/auth/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        toast({
          title: "Hata",
          description: "Kullanıcılar yüklenirken hata oluştu.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Load users error:", error);
      toast({
        title: "Hata",
        description: "Ağ bağlantı hatası.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/auth/admin/logs?limit=50", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error("Load logs error:", error);
    }
  };

  const calculateStats = () => {
    const total = users.length;
    const active = users.filter((u) => u.isActive).length;
    const inactive = total - active;
    const admins = users.filter((u) => u.role === "admin").length;
    const leaders = users.filter((u) => u.role === "leader").length;
    const members = users.filter((u) => u.role === "member").length;
    const visitors = users.filter((u) => u.role === "visitor").length;

    setStats({ total, active, inactive, admins, leaders, members, visitors });
  };

  const handleCreateUser = async () => {
    if (!createForm.fullName || !createForm.email || !createForm.password) {
      toast({
        title: "Hata",
        description: "Tüm gerekli alanları doldurun.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/auth/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createForm),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Başarılı",
          description: data.message,
        });
        setShowCreateDialog(false);
        setCreateForm({
          fullName: "",
          email: "",
          phone: "",
          password: "",
          role: "member",
          sponsorId: "",
          isActive: true,
          membershipType: "entry",
          initialBalance: 0,
          placementPreference: "auto",
        });
        loadUsers();
        loadLogs();
      } else {
        toast({
          title: "Hata",
          description: data.message || "Kullanıcı oluşturulamadı.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Create user error:", error);
      toast({
        title: "Hata",
        description: "Ağ bağlantı hatası.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `/api/auth/admin/update-user/${selectedUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editForm),
        },
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Başarılı",
          description: data.message,
        });
        setShowEditDialog(false);
        setSelectedUser(null);
        loadUsers();
        loadLogs();
      } else {
        toast({
          title: "Hata",
          description: data.message || "Kullanıcı güncellenemedi.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Edit user error:", error);
      toast({
        title: "Hata",
        description: "Ağ bağlantı hatası.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/auth/admin/delete-user/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Başarılı",
          description: data.message,
        });
        loadUsers();
        loadLogs();
      } else {
        toast({
          title: "Hata",
          description: data.message || "Kullanıcı silinemedi.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Delete user error:", error);
      toast({
        title: "Hata",
        description: "Ağ bağlantı hatası.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMoveUser = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/auth/admin/move-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          newParentId: moveForm.newParentId,
          newPosition: moveForm.newPosition,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Başarılı",
          description: data.message,
        });
        setShowMoveDialog(false);
        setSelectedUser(null);
        loadUsers();
        loadLogs();
      } else {
        toast({
          title: "Hata",
          description: data.message || "Kullanıcı taşınamadı.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Move user error:", error);
      toast({
        title: "Hata",
        description: "Ağ bağlantı hatası.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      careerLevel: user.careerLevel.name,
      walletBalance: user.wallet.balance,
      kycStatus: user.kycStatus,
      membershipType: user.membershipType,
      twoFactorEnabled: user.twoFactorEnabled,
    });
    setShowEditDialog(true);
  };

  const openMoveDialog = (user: User) => {
    setSelectedUser(user);
    setMoveForm({
      newParentId: "",
      newPosition: "left",
    });
    setShowMoveDialog(true);
  };

  // Filter and search users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.memberId || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && user.isActive) ||
      (filterStatus === "inactive" && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "leader":
        return "bg-purple-100 text-purple-800";
      case "member":
        return "bg-blue-100 text-blue-800";
      case "visitor":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Kullanıcı Yönetimi</h1>
          <p className="text-muted-foreground">
            Sistem kullanıcılarını yönetin, düzenleyin ve organizasyonda
            yerleştirin.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadUsers} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Yenile
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Yeni Kullanıcı
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Yeni Kullanıcı Oluştur</DialogTitle>
                <DialogDescription>
                  Sisteme yeni bir kullanıcı ekleyin.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Ad Soyad</Label>
                  <Input
                    id="fullName"
                    value={createForm.fullName}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, fullName: e.target.value })
                    }
                    placeholder="Kullanıcının tam adı"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, email: e.target.value })
                    }
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={createForm.phone}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, phone: e.target.value })
                    }
                    placeholder="+90 5XX XXX XX XX"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Şifre</Label>
                  <Input
                    id="password"
                    type="password"
                    value={createForm.password}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, password: e.target.value })
                    }
                    placeholder="En az 6 karakter"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Rol</Label>
                  <Select
                    value={createForm.role}
                    onValueChange={(value: any) =>
                      setCreateForm({ ...createForm, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Üye</SelectItem>
                      <SelectItem value="leader">Lider</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="visitor">Ziyaretçi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sponsorId">Sponsor ID (Opsiyonel)</Label>
                  <Input
                    id="sponsorId"
                    value={createForm.sponsorId}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        sponsorId: e.target.value,
                      })
                    }
                    placeholder="Sponsor kullanıcı ID'si"
                  />
                </div>
                <div>
                  <Label htmlFor="initialBalance">Başlangıç Bakiyesi</Label>
                  <Input
                    id="initialBalance"
                    type="number"
                    value={createForm.initialBalance}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        initialBalance: Number(e.target.value),
                      })
                    }
                    placeholder="0"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  İptal
                </Button>
                <Button onClick={handleCreateUser} disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Oluştur
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Toplam</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Aktif</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserX className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-sm font-medium">Pasif</p>
                <p className="text-2xl font-bold">{stats.inactive}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Crown className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-sm font-medium">Admin</p>
                <p className="text-2xl font-bold">{stats.admins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Lider</p>
                <p className="text-2xl font-bold">{stats.leaders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Üye</p>
                <p className="text-2xl font-bold">{stats.members}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium">Ziyaretçi</p>
                <p className="text-2xl font-bold">{stats.visitors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
          <TabsTrigger value="logs">İşlem Geçmişi</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="İsim, email veya üye ID ile ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Roller</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="leader">Lider</SelectItem>
                      <SelectItem value="member">Üye</SelectItem>
                      <SelectItem value="visitor">Ziyaretçi</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Durumlar</SelectItem>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="inactive">Pasif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Kariyer</TableHead>
                    <TableHead>Bakiye</TableHead>
                    <TableHead>Kayıt Tarihi</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                        <p className="mt-2">Kullanıcılar yükleniyor...</p>
                      </TableCell>
                    </TableRow>
                  ) : currentUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <p>Kullanıcı bulunamadı.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.fullName}</p>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ID: {user.memberId}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(user.isActive)}>
                            {user.isActive ? "Aktif" : "Pasif"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{user.careerLevel.name}</p>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">
                            ₺{user.wallet.balance.toFixed(2)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">
                            {new Date(user.registrationDate).toLocaleDateString(
                              "tr-TR",
                            )}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(user)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openMoveDialog(user)}
                            >
                              <Move className="w-3 h-3" />
                            </Button>
                            {user.role !== "admin" && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <Trash2 className="w-3 h-3 text-red-600" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Kullanıcıyı Sil
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {user.fullName} kullanıcısını silmek
                                      istediğinizden emin misiniz? Bu işlem geri
                                      alınamaz.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>İptal</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteUser(user.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Sil
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Önceki
              </Button>
              <span className="flex items-center px-4 text-sm">
                Sayfa {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Sonraki
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>İşlem Geçmişi</CardTitle>
              <CardDescription>
                Admin tarafından yapılan tüm işlemler burada görüntülenir.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>İşlem</TableHead>
                    <TableHead>Hedef Kullanıcı</TableHead>
                    <TableHead>Detaylar</TableHead>
                    <TableHead>Admin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <p className="text-sm">
                          {new Date(log.timestamp).toLocaleString("tr-TR")}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">
                          {log.targetUserId || "Sistem"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm max-w-xs truncate">
                          {log.details}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{log.adminId}</p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Kullanıcı Düzenle</DialogTitle>
            <DialogDescription>
              {selectedUser?.fullName} kullanıcısının bilgilerini güncelleyin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editFullName">Ad Soyad</Label>
              <Input
                id="editFullName"
                value={editForm.fullName}
                onChange={(e) =>
                  setEditForm({ ...editForm, fullName: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="editEmail">Email</Label>
              <Input
                id="editEmail"
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="editRole">Rol</Label>
              <Select
                value={editForm.role}
                onValueChange={(value: any) =>
                  setEditForm({ ...editForm, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Üye</SelectItem>
                  <SelectItem value="leader">Lider</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="visitor">Ziyaretçi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editWalletBalance">Cüzdan Bakiyesi</Label>
              <Input
                id="editWalletBalance"
                type="number"
                value={editForm.walletBalance}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    walletBalance: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="editIsActive"
                checked={editForm.isActive}
                onChange={(e) =>
                  setEditForm({ ...editForm, isActive: e.target.checked })
                }
              />
              <Label htmlFor="editIsActive">Aktif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              İptal
            </Button>
            <Button onClick={handleEditUser} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Güncelle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move User Dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Kullanıcıyı Taşı</DialogTitle>
            <DialogDescription>
              {selectedUser?.fullName} kullanıcısını ağaçta farklı bir pozisyona
              taşıyın.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newParentId">Yeni Ebeveyn Kullanıcı ID</Label>
              <Input
                id="newParentId"
                value={moveForm.newParentId}
                onChange={(e) =>
                  setMoveForm({ ...moveForm, newParentId: e.target.value })
                }
                placeholder="Ebeveyn kullanıcının ID'si"
              />
            </div>
            <div>
              <Label htmlFor="newPosition">Pozisyon</Label>
              <Select
                value={moveForm.newPosition}
                onValueChange={(value: any) =>
                  setMoveForm({ ...moveForm, newPosition: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Sol</SelectItem>
                  <SelectItem value="right">Sağ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoveDialog(false)}>
              İptal
            </Button>
            <Button onClick={handleMoveUser} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Taşı
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
