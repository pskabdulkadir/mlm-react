import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
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
  ShoppingCart,
  Star,
  Search,
  Filter,
  Eye,
  ArrowLeft,
  Crown,
  ShieldCheck,
  Truck,
  CreditCard,
  Heart,
  Share2,
  Grid3X3,
  List,
  Users,
  Zap,
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
}

const ProductsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const referralCode = searchParams.get('ref') || 'ak0000001';

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, priceRange, sortBy]);

  const loadProducts = async () => {
    try {
      const response = await fetch("/api/products");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }

      const data = await response.json();

      if (data.success && data.products) {
        setProducts(data.products);
      } else {
        console.error("API returned no products or failed:", data);
        setProducts([]);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => 
        product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Price range filter
    if (priceRange !== "all") {
      const [min, max] = priceRange.split("-").map(Number);
      filtered = filtered.filter(product => {
        if (max) {
          return product.price >= min && product.price <= max;
        } else {
          return product.price >= min;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "reviews":
          return b.reviews - a.reviews;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  };

  const categories = Array.from(new Set(products.map(p => p.category)));

  const handlePurchase = (product: Product) => {
    navigate(`/checkout?product=${product.id}&ref=${referralCode}`);
  };

  const calculateDiscount = (product: Product) => {
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-spiritual-purple/10 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Button 
                variant="ghost" 
                onClick={() => navigate("/")}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Ana Sayfaya Dön
              </Button>
              <h1 className="text-4xl font-bold mb-2">Premium Ürün Koleksiyonu</h1>
              <p className="text-foreground/80">
                Kaliteli ürünler, güvenli ödeme ve hızlı kargo ile alışverişin tadını çıkarın
              </p>
              {referralCode !== 'ak0000001' && (
                <div className="mt-4 bg-gradient-to-r from-spiritual-purple/10 to-primary/10 rounded-lg p-4 inline-block border border-primary/20">
                  <p className="text-sm text-primary font-medium mb-2">
                    🎯 <strong>{referralCode}</strong> sponsorluğunda alışveriş yapıyorsunuz
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-xs text-center">
                    <div>
                      <div className="w-6 h-6 bg-spiritual-gold rounded-full mx-auto mb-1 flex items-center justify-center">
                        <span className="text-white font-bold text-xs">40%</span>
                      </div>
                      <span>Sponsor Komisyonu</span>
                    </div>
                    <div>
                      <div className="w-6 h-6 bg-green-500 rounded-full mx-auto mb-1 flex items-center justify-center">
                        <Zap className="w-3 h-3 text-white" />
                      </div>
                      <span>Anında Dağıtım</span>
                    </div>
                    <div>
                      <div className="w-6 h-6 bg-blue-500 rounded-full mx-auto mb-1 flex items-center justify-center">
                        <Users className="w-3 h-3 text-white" />
                      </div>
                      <span>7 Seviye Network</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <ShieldCheck className="w-8 h-8 text-green-500 mx-auto mb-1" />
                  <p className="text-xs">Güvenli</p>
                </div>
                <div className="text-center">
                  <Truck className="w-8 h-8 text-blue-500 mx-auto mb-1" />
                  <p className="text-xs">Hızlı Kargo</p>
                </div>
                <div className="text-center">
                  <CreditCard className="w-8 h-8 text-purple-500 mx-auto mb-1" />
                  <p className="text-xs">Kolay Ödeme</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Ürün ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category.toLowerCase()}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sırala" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">İsme Göre</SelectItem>
                <SelectItem value="price-low">Fiyat (Düşük-Yüksek)</SelectItem>
                <SelectItem value="price-high">Fiyat (Yüksek-Düşük)</SelectItem>
                <SelectItem value="rating">En Çok Beğenilen</SelectItem>
                <SelectItem value="reviews">En Çok Yorumlanan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Additional Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Fiyat Aralığı" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Fiyatlar</SelectItem>
              <SelectItem value="0-100">$0 - $100</SelectItem>
              <SelectItem value="100-200">$100 - $200</SelectItem>
              <SelectItem value="200-400">$200 - $400</SelectItem>
              <SelectItem value="400">$400+</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 text-right">
            <p className="text-sm text-gray-600">
              {filteredProducts.length} ürün bulundu
            </p>
          </div>
        </div>

        {/* Products Grid/List */}
        {filteredProducts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-500 mb-4">Aramanıza uygun ürün bulunamadı.</p>
              <Button onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setPriceRange("all");
              }}>
                Filtreleri Temizle
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
          }>
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className={`group hover:shadow-lg transition-all overflow-hidden ${
                  viewMode === "list" ? "flex flex-row" : ""
                }`}
              >
                <div className={`relative ${viewMode === "list" ? "w-48 flex-shrink-0" : ""}`}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
                      viewMode === "list" ? "w-full h-full" : "w-full h-48"
                    }`}
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-spiritual-gold text-white">
                      {product.category}
                    </Badge>
                  </div>
                  {calculateDiscount(product) > 0 && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-red-500 text-white">
                        %{calculateDiscount(product)} İndirim
                      </Badge>
                    </div>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Detay
                  </Button>
                </div>
                
                <div className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                    <Button variant="ghost" size="sm">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? "text-spiritual-gold fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-500 ml-1">
                      {product.rating} ({product.reviews})
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-primary">
                        ${product.price}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          ${product.originalPrice}
                        </span>
                      )}
                      <p className="text-xs text-spiritual-gold font-medium">
                        Komisyon: ${Math.round(product.price * 0.4)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handlePurchase(product)}
                      className="flex-1 bg-gradient-to-r from-primary to-spiritual-purple hover:opacity-90"
                      disabled={!product.inStock}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {product.inStock ? "Satın Al" : "Stokta Yok"}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* MLM Integration & Commission Info */}
        <div className="mt-12 space-y-6">
          <Card className="bg-gradient-to-r from-spiritual-gold/10 to-primary/10 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-center mb-6 text-primary">
                💰 MLM Komisyon Sistemi - Her Alışverişte Herkes Kazanır!
              </h3>
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div className="bg-white/50 rounded-lg p-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-spiritual-gold to-primary rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-lg">10%</span>
                  </div>
                  <h4 className="font-semibold mb-2">Sponsor Bonusu</h4>
                  <p className="text-sm text-gray-600">Direkt sponsor otomatik kazanır</p>
                </div>
                <div className="bg-white/50 rounded-lg p-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-lg">25%</span>
                  </div>
                  <h4 className="font-semibold mb-2">Kariyer Bonusu</h4>
                  <p className="text-sm text-gray-600">7 seviyeye kadar dağıtım</p>
                </div>
                <div className="bg-white/50 rounded-lg p-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-lg">5%</span>
                  </div>
                  <h4 className="font-semibold mb-2">Pasif Gelir</h4>
                  <p className="text-sm text-gray-600">Network ağında pasif kazanç</p>
                </div>
                <div className="bg-white/50 rounded-lg p-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-semibold mb-2">Anında İşlem</h4>
                  <p className="text-sm text-gray-600">Satış anında otomatik dağıtım</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-primary/5 to-spiritual-purple/5 border-primary/20">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <Crown className="w-12 h-12 text-spiritual-gold mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Premium Kalite</h3>
                  <p className="text-sm text-gray-600">
                    Dünya markalarından seçilmiş kaliteli ürünler
                  </p>
                </div>
                <div>
                  <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Güvenli Alışveriş</h3>
                  <p className="text-sm text-gray-600">
                    256-bit SSL ile korumalı ödeme sistemi
                  </p>
                </div>
                <div>
                  <Truck className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Hızlı Teslimat</h3>
                  <p className="text-sm text-gray-600">
                    Türkiye geneline ücretsiz kargo
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Product Detail Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                    className="w-full h-80 object-cover rounded-lg"
                  />
                </div>
                
                <div className="space-y-4">
                  <p className="text-gray-700">{selectedProduct.description}</p>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Özellikler:</h4>
                    <ul className="space-y-1">
                      {selectedProduct.features.map((feature, index) => (
                        <li key={index} className="text-sm flex items-center">
                          <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-lg">Fiyat:</span>
                      <div>
                        <span className="text-2xl font-bold text-primary">
                          ${selectedProduct.price}
                        </span>
                        {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ${selectedProduct.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Komisyon Dağıtımı:</span>
                      <span className="text-spiritual-gold font-medium">
                        ${Math.round(selectedProduct.price * 0.4)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Sistem Fonu:</span>
                      <span className="text-gray-500">
                        ${Math.round(selectedProduct.price * 0.6)}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handlePurchase(selectedProduct)}
                    className="w-full bg-gradient-to-r from-primary to-spiritual-purple hover:opacity-90"
                    size="lg"
                    disabled={!selectedProduct.inStock}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {selectedProduct.inStock ? "Satın Al" : "Stokta Yok"}
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

export default ProductsPage;
