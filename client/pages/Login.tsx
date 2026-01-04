import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Eye, EyeOff, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    sponsor: "",
    phone: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      let response;
      let data;

      try {
        response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loginData),
          signal: controller.signal,
        });

        clearTimeout(timeoutId); // Clear timeout if request completes
      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.error("Fetch error:", fetchError);

        if (fetchError.name === "AbortError") {
          alert("Giriş isteği zaman aşımına uğradı. Lütfen tekrar deneyin.");
        } else {
          alert("Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.");
        }

        setLoading(false);
        return;
      }

      // Handle response based on status
      if (!response.ok) {
        console.error("Response not ok:", response.status, response.statusText);

        try {
          const errorData = await response.json();
          alert(
            errorData.error ||
              "Geçersiz email veya şifre. Lütfen bilgilerinizi kontrol edin.",
          );
        } catch {
          alert(`Sunucu hatası: ${response.status} ${response.statusText}`);
        }

        setLoading(false);
        return;
      }

      // Response is ok, parse JSON
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("JSON parsing error:", jsonError);
        alert("Sunucu yanıtı işlenirken hata oluştu. Lütfen tekrar deneyin.");
        setLoading(false);
        return;
      }

      if (response.ok && data.success) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        localStorage.setItem("authToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        // Redirect based on user role
        if (data.user.role === "admin") {
          navigate("/admin-panel");
        } else {
          navigate("/member-panel");
        }
      } else {
        alert(
          data.error || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.",
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(
        "Giriş sırasında beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (registerData.password !== registerData.confirmPassword) {
      alert("Şifreler eşleşmiyor!");
      setLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      alert("Şifre en az 6 karakter olmalıdır!");
      setLoading(false);
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      let response;
      try {
        response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: registerData.name,
            email: registerData.email,
            phone: registerData.phone,
            password: registerData.password,
            sponsorCode: registerData.sponsor || undefined,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === "AbortError") {
          alert("Kayıt isteği zaman aşımına uğradı. Lütfen tekrar deneyin.");
        } else {
          alert("Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.");
        }
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Kayıt başarılı! Giriş yapabilirsiniz.");
        // Switch to login tab
        (document.querySelector('[value="login"]') as HTMLElement | null)?.click();
        // Clear register form
        setRegisterData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          sponsor: "",
          phone: "",
        });
      } else {
        alert(
          data.error ||
            "Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.",
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert(
        "Kayıt sırasında beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-spiritual-purple rounded-lg flex items-center justify-center">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-spiritual-purple bg-clip-text text-transparent">
              Kutbul Zaman
            </span>
          </Link>
          <p className="text-foreground/60 mt-2">Manevi Rehberim</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Giriş Yap</TabsTrigger>
            <TabsTrigger value="register">Kayıt Ol</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Hesabınıza Giriş Yapın</CardTitle>
                <CardDescription>
                  Email ve şifrenizle sisteme giriş yapın
                </CardDescription>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                  <p className="text-blue-800 text-sm">
                    🚀 <strong>Yeni Özellikler:</strong> E-Cüzdan ve Gerçek
                    Zamanlı İşlemler için güvenlik nedeniyle tekrar giriş
                    yapmanız gerekiyor.
                  </p>
                </div>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ornek@email.com"
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({ ...loginData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Şifre</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            password: e.target.value,
                          })
                        }
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Giriş Yap
                  </Button>
                  <div className="text-center text-sm">
                    <a
                      href="#"
                      className="text-primary hover:underline"
                      onClick={async (e) => {
                        e.preventDefault();
                        const phone = window.prompt("Kayıtlı telefon numaranızı girin (+90 ...):");
                        if (!phone) return;
                        try {
                          const res = await fetch('/api/auth/forgot-password-sms', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ phone })
                          });
                          const data = await res.json();
                          if (!res.ok || !data.success) {
                            alert(data.error || 'Kod gönderilemedi.');
                            return;
                          }
                          alert('Doğrulama kodu SMS ile gönderildi.');
                          const code = window.prompt('SMS ile gelen 6 haneli kodu girin:');
                          if (!code) return;
                          const newPassword = window.prompt('Yeni şifrenizi girin (min 6 karakter):');
                          if (!newPassword) return;
                          const res2 = await fetch('/api/auth/reset-password-sms', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ phone, code, newPassword })
                          });
                          const data2 = await res2.json();
                          if (res2.ok && data2.success) {
                            alert('Şifreniz güncellendi. Lütfen yeni şifrenizle giriş yapın.');
                          } else {
                            alert(data2.error || 'Şifre güncellenemedi.');
                          }
                        } catch (err) {
                          console.error('Forgot password flow error:', err);
                          alert('İşlem sırasında hata oluştu.');
                        }
                      }}
                    >
                      Şifremi Unuttum
                    </a>
                  </div>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Yeni Hesap Oluşturun</CardTitle>
                <CardDescription>
                  Manevi yolculuğunuza hemen başlayın
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Ad Soyad</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Adınız Soyadınız"
                      value={registerData.name}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="ornek@email.com"
                      value={registerData.email}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+90 5XX XXX XX XX"
                      value={registerData.phone}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          phone: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sponsor">Sponsor Kodu (Opsiyonel)</Label>
                    <Input
                      id="sponsor"
                      type="text"
                      placeholder="Sponsor kodunu girin"
                      value={registerData.sponsor}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          sponsor: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Şifre</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Şifre Tekrar</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.confirmPassword}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Hesap Oluştur
                  </Button>
                  <div className="text-center text-xs text-muted-foreground">
                    Kayıt olarak{" "}
                    <a href="#" className="text-primary hover:underline">
                      Kullanım Şartları
                    </a>{" "}
                    ve{" "}
                    <a href="#" className="text-primary hover:underline">
                      Gizlilik Politikası
                    </a>
                    'nı kabul etmiş olursunuz.
                  </div>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
