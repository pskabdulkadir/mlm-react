import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  ImageIcon,
  Package,
  DollarSign,
  Tag,
  Star,
  CheckCircle2,
  XCircle,
  Save,
  X,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  features: string[];
  inStock: boolean;
  rating: number;
  reviews: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    image: "",
    category: "",
    features: "",
    inStock: true,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch("/api/products/admin/products");
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products);
      } else {
        setError("Ürünler yüklenemedi.");
      }
    } catch (error) {
      console.error("Error loading products:", error);
      setError("Ürünler yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      image: "",
      category: "",
      features: "",
      inStock: true,
    });
    setEditingProduct(null);
  };

  const handleCreate = async () => {
    try {
      setError("");

      if (!formData.name || !formData.description || !formData.price || !formData.category) {
        setError("Lütfen tüm gerekli alanları doldurun.");
        return;
      }

      const productData = {
        ...formData,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        features: formData.features.split(",").map(f => f.trim()).filter(f => f),
        autoIntegratePOS: true, // Enable automatic POS integration
      };

      const response = await fetch("/api/products/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (data.success) {
        // Check if POS integration was successful
        if (data.posIntegration?.success) {
          setSuccess(`✅ Ürün başarıyla oluşturuldu ve ana sayfa koleksiyonuna eklendi! POS entegrasyonu tamamlandı. POS ID: ${data.posIntegration.posProductId}`);
        } else {
          setSuccess("✅ Ürün başarıyla oluşturuldu ve ana sayfa koleksiyonuna eklendi! POS entegrasyonu: " + (data.posIntegration?.message || "Başarısız"));
        }
        setShowCreateDialog(false);
        resetForm();
        loadProducts();
      } else {
        setError(data.error || "Ürün oluşturulamadı.");
      }
    } catch (error) {
      console.error("Create product error:", error);
      setError("Ürün oluşturulurken hata oluştu.");
    }
  };

  const handleUpdate = async () => {
    if (!editingProduct) return;

    try {
      setError("");

      const response = await fetch(`/api/products/admin/products/${editingProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
          features: formData.features.split(",").map(f => f.trim()).filter(f => f),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("✅ Ürün başarıyla güncellendi! Ana sayfada değişiklikler görüntüleniyor.");
        setEditingProduct(null);
        resetForm();
        loadProducts();
      } else {
        setError(data.error || "Ürün güncellenemedi.");
      }
    } catch (error) {
      console.error("Update product error:", error);
      setError("Ürün güncellenirken hata oluştu.");
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Bu ürünü silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/products/admin/products/${productId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("✅ Ürün başarıyla silindi! Ana sayfadan kaldırıldı.");
        loadProducts();
      } else {
        setError(data.error || "Ürün silinemedi.");
      }
    } catch (error) {
      console.error("Delete product error:", error);
      setError("Ürün silinirken hata oluştu.");
    }
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || "",
      image: product.image,
      category: product.category,
      features: product.features.join(", "),
      inStock: product.inStock,
    });
  };

  const categories = Array.from(new Set(products.map(p => p.category)));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ürün Yönetimi</h2>
          <p className="text-gray-600">Ürünleri ekleyin, düzenleyin ve yönetin - Ana sayfada otomatik gösterilir</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => window.open('/', '_blank')}
          >
            <Eye className="w-4 h-4 mr-2" />
            Ana Sayfa Koleksiyonu
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Ürün Ekle
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Alert className="border-blue-200 bg-blue-50">
        <Package className="h-4 w-4" />
        <AlertDescription className="text-blue-700">
          <div className="space-y-2">
            <p><strong>🚀 Otomatik Entegrasyon:</strong> Eklediğiniz ürünler ana sayfadaki "Premium Ürün Koleksiyonu" bölümünde otomatik görüntülenir</p>
            <p><strong>🔄 Sınırsız Ürün:</strong> İstediğiniz kadar ürün ekleyebilir, sistem kapasitesi sınırı yoktur</p>
            <p><strong>💰 POS Entegrasyonu:</strong> Her yeni ürün otomatik olarak sanal POS sistemi ile entegre edilir</p>
            <p><strong>📊 MLM Komisyonu:</strong> Tüm ürünlerde %40 komisyon otomatik dağıtılır</p>
          </div>
        </AlertDescription>
      </Alert>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Ürün Listesi ({products.length} Ürün)
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              Sınırsız Ekleme Aktif
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ürün</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Fiyat</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          {product.description.substring(0, 50)}...
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-semibold">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.inStock ? "default" : "destructive"}>
                      {product.inStock ? "Mevcut" : "Tükendi"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? "Aktif" : "Pasif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Product Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Ürün Ekle</DialogTitle>
            <DialogDescription>
              Yeni ürün bilgilerini girin ve sisteme ekleyin.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Ürün Adı *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ürün adını girin"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Kategori *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                    <SelectItem value="new">Yeni Kategori</SelectItem>
                  </SelectContent>
                </Select>
                {formData.category === "new" && (
                  <Input
                    className="mt-2"
                    placeholder="Yeni kategori adı"
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  />
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Fiyat ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="originalPrice">Eski Fiyat ($)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="image">Ürün Resmi URL *</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Açıklama *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Ürün açıklaması"
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="features">Özellikler (virgülle ayırın)</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({...formData, features: e.target.value})}
                  placeholder="UV400 Koruma, Polarize Cam, Metal Çerçeve"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={formData.inStock}
                  onChange={(e) => setFormData({...formData, inStock: e.target.checked})}
                />
                <Label htmlFor="inStock">Stokta mevcut</Label>
              </div>
              
              {formData.image && (
                <div>
                  <Label>Ön İzleme</Label>
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button onClick={handleCreate} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Ürün Ekle
            </Button>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              resetForm();
            }}>
              <X className="w-4 h-4 mr-2" />
              İptal
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => {
        setEditingProduct(null);
        resetForm();
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ürün Düzenle</DialogTitle>
            <DialogDescription>
              Ürün bilgilerini güncelleyin.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Ürün Adı *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-category">Kategori *</Label>
                <Input
                  id="edit-category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-price">Fiyat ($) *</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-originalPrice">Eski Fiyat ($)</Label>
                  <Input
                    id="edit-originalPrice"
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-image">Ürün Resmi URL *</Label>
                <Input
                  id="edit-image"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-description">Açıklama *</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-features">Özellikler</Label>
                <Textarea
                  id="edit-features"
                  value={formData.features}
                  onChange={(e) => setFormData({...formData, features: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-inStock"
                  checked={formData.inStock}
                  onChange={(e) => setFormData({...formData, inStock: e.target.checked})}
                />
                <Label htmlFor="edit-inStock">Stokta mevcut</Label>
              </div>
              
              {formData.image && (
                <div>
                  <Label>Ön İzleme</Label>
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded border"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button onClick={handleUpdate} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Güncelle
            </Button>
            <Button variant="outline" onClick={() => {
              setEditingProduct(null);
              resetForm();
            }}>
              <X className="w-4 h-4 mr-2" />
              İptal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProductManagement;
