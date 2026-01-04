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
} from "@/components/ui/alert-dialog";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Euro,
  Bitcoin,
  Plus,
  Minus,
  Eye,
  EyeOff,
  RefreshCw,
  Copy,
  CheckCircle,
  AlertTriangle,
  Clock,
  CreditCard,
  Building,
  Smartphone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Types for E-Wallet
interface WalletBalance {
  currency: 'TRY' | 'USD' | 'EUR' | 'BTC';
  balance: number;
  frozen: number;
  available: number;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  currency: 'TRY' | 'USD' | 'EUR' | 'BTC';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  date: string;
  reference?: string;
  fee?: number;
  description: string;
  fromAddress?: string;
  toAddress?: string;
}

interface DepositRequest {
  currency: 'TRY' | 'USD' | 'EUR' | 'BTC';
  amount: number;
  paymentMethod: 'bank_transfer' | 'crypto';
  reference?: string;
  transactionHash?: string;
  notes?: string;
}

interface WithdrawRequest {
  currency: 'TRY' | 'USD' | 'EUR' | 'BTC';
  amount: number;
  bankAccount?: {
    iban: string;
    accountHolder: string;
    bankName: string;
  };
  cryptoAddress?: string;
  notes?: string;
}

interface CryptoRates {
  btc_try: number;
  btc_usd: number;
  btc_eur: number;
}

export default function EWallet() {
  const navigate = useNavigate();
  
  // State Management
  const [loading, setLoading] = useState(true);
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cryptoRates, setCryptoRates] = useState<CryptoRates>({
    btc_try: 0,
    btc_usd: 0,
    btc_eur: 0
  });
  
  // Modal States
  const [depositModal, setDepositModal] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  
  // Form States
  const [depositForm, setDepositForm] = useState<DepositRequest>({
    currency: 'TRY',
    amount: 0,
    paymentMethod: 'bank_transfer'
  });
  
  const [withdrawForm, setWithdrawForm] = useState<WithdrawRequest>({
    currency: 'TRY',
    amount: 0
  });
  
  // UI States
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showBalances, setShowBalances] = useState(true);
  const [pendingOperation, setPendingOperation] = useState<any>(null);

  // Admin Bank Details (These would normally come from admin settings)
  const adminBankDetails = {
    TRY: {
      iban: 'TR33 0006 1005 1978 6457 8413 26',
      bank: 'İş Bankası',
      accountHolder: 'Kutbul Zaman Sistemi A.Ş.',
      branch: 'Merkez Şubesi'
    },
    USD: {
      iban: 'US64 SVBK US6S 3300 9673 8637',
      bank: 'Silicon Valley Bank',
      accountHolder: 'Kutbul Zaman Systems Inc.',
      swift: 'SVBKUS6S'
    },
    EUR: {
      iban: 'DE89 3704 0044 0532 0130 00',
      bank: 'Commerzbank AG',
      accountHolder: 'Kutbul Zaman Systems GmbH',
      swift: 'COBADEFF'
    },
    BTC: {
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      network: 'Bitcoin Mainnet',
      note: 'Bitcoin cüzdan adresi - sadece BTC gönderin'
    }
  };

  // Load wallet data
  useEffect(() => {
    loadWalletData();
    loadCryptoRates();
    // Refresh crypto rates every 5 minutes
    const interval = setInterval(loadCryptoRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      // Load balances
      const balancesResponse = await fetch('/api/wallet/balances', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (balancesResponse.ok) {
        const balancesData = await balancesResponse.json();
        setBalances(balancesData.balances || [
          { currency: 'TRY', balance: 0, frozen: 0, available: 0 },
          { currency: 'USD', balance: 0, frozen: 0, available: 0 },
          { currency: 'EUR', balance: 0, frozen: 0, available: 0 },
          { currency: 'BTC', balance: 0, frozen: 0, available: 0 }
        ]);
      }
      
      // Load transactions
      const transactionsResponse = await fetch('/api/wallet/transactions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        // Defensive: ensure transactions is an array
        const txArray = Array.isArray(transactionsData.transactions)
          ? transactionsData.transactions
          : (transactionsData?.transactions || []);

        const mapped = txArray.map((t: any) => ({
          id: t.id || `tx-${Date.now()}`,
          type: t.type || 'unknown',
          currency: t.currency || 'TRY',
          amount: t.amount || 0,
          status: t.status || 'pending',
          date: t.date ? new Date(t.date).toISOString() : (t.createdAt || new Date().toISOString()),
          reference: t.reference || '',
          fee: t.fee || 0,
          description: t.description || '',
          fromAddress: t.fromAddress || '',
          toAddress: t.toAddress || '',
        }));
        setTransactions(mapped);
      } else {
        setTransactions([]);
      }
      
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCryptoRates = async () => {
    try {
      // This would normally use CoinGecko API
      // For demo purposes, using mock data
      const response = await fetch('/api/crypto/rates');
      if (response.ok) {
        const data = await response.json();
        const r = {
          btc_try: data.btc_try ?? 2850000,
          btc_usd: data.btc_usd ?? 42000,
          btc_eur: data.btc_eur ?? 38500
        };
        setCryptoRates(r);
      } else {
        // Fallback mock rates
        setCryptoRates({
          btc_try: 2850000, // ~$42,000 * 67 TRY/USD
          btc_usd: 42000,
          btc_eur: 38500
        });
      }
    } catch (error) {
      console.error('Error loading crypto rates:', error);
      // Fallback rates
      setCryptoRates({
        btc_try: 2850000,
        btc_usd: 42000,
        btc_eur: 38500
      });
    }
  };

  const handleDeposit = async () => {
    try {
      if (!depositForm.amount || depositForm.amount <= 0) {
        alert('Lütfen geçerli bir tutar girin.');
        return;
      }

      if (depositForm.paymentMethod === 'crypto' && !depositForm.transactionHash) {
        alert('Lütfen transaction hash\'i girin.');
        return;
      }

      if (depositForm.paymentMethod === 'bank_transfer' && !depositForm.reference) {
        alert('Lütfen referans numarasını girin.');
        return;
      }

      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(depositForm)
      });

      if (response.ok) {
        setDepositModal(false);
        setDepositForm({
          currency: 'TRY',
          amount: 0,
          paymentMethod: 'bank_transfer'
        });
        alert('✅ Para yatırma talebi başarıyla gönderildi! Admin onayından sonra bakiyenize eklenecektir.');
        loadWalletData();
      } else {
        let message = `${response.status} ${response.statusText}`;
        try {
          const error = await response.json();
          message = error.error || error.message || message;
        } catch {}
        alert(`❌ Hata: ${message}`);
      }
    } catch (error) {
      console.error('Deposit error:', error);
      alert('❌ Para yatırma işleminde hata oluştu.');
    }
  };

  const handleWithdraw = async () => {
    try {
      if (!withdrawForm.amount || withdrawForm.amount <= 0) {
        alert('Lütfen geçerli bir tutar girin.');
        return;
      }

      const selectedBalance = balances.find(b => b.currency === withdrawForm.currency);
      if (!selectedBalance || withdrawForm.amount > selectedBalance.available) {
        alert('Yetersiz bakiye.');
        return;
      }

      if (withdrawForm.currency === 'BTC' && !withdrawForm.cryptoAddress) {
        alert('Lütfen Bitcoin cüzdan adresinizi girin.');
        return;
      }

      if (withdrawForm.currency !== 'BTC' && !withdrawForm.bankAccount?.iban) {
        alert('Lütfen banka hesap bilgilerini doldurun.');
        return;
      }

      setPendingOperation(withdrawForm);
      setConfirmDialog(true);
    } catch (error) {
      console.error('Withdraw validation error:', error);
    }
  };

  const confirmWithdraw = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pendingOperation)
      });

      if (response.ok) {
        setWithdrawModal(false);
        setConfirmDialog(false);
        setWithdrawForm({
          currency: 'TRY',
          amount: 0
        });
        setPendingOperation(null);
        alert('✅ Para çekme talebi başarıyla gönderildi! Admin onayından sonra işlem gerçekleştirilecektir.');
        loadWalletData();
      } else {
        let message = `${response.status} ${response.statusText}`;
        try {
          const error = await response.json();
          message = error.error || error.message || message;
        } catch {}
        alert(`❌ Hata: ${message}`);
      }
    } catch (error) {
      console.error('Withdraw error:', error);
      alert('❌ Para çekme işleminde hata oluştu.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('📋 Panoya kopyalandı!');
  };

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case 'TRY': return '₺';
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'BTC': return '₿';
      default: return '';
    }
  };

  const getCurrencyName = (currency: string) => {
    switch (currency) {
      case 'TRY': return 'Türk Lirası';
      case 'USD': return 'Amerikan Doları';
      case 'EUR': return 'Euro';
      case 'BTC': return 'Bitcoin';
      default: return currency;
    }
  };

  const formatCurrency = (amount: number | undefined, currency: string) => {
    const safeAmount = amount ?? 0;
    if (currency === 'BTC') {
      return `${safeAmount.toFixed(8)} ₿`;
    }
    return `${getCurrencyIcon(currency)}${safeAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;
  };

  const getTotalValueInTRY = () => {
    return balances.reduce((total, balance) => {
      switch (balance.currency) {
        case 'TRY':
          return total + (balance.balance || 0);
        case 'USD':
          return total + ((balance.balance || 0) * 67); // Mock USD to TRY rate
        case 'EUR':
          return total + ((balance.balance || 0) * 73); // Mock EUR to TRY rate
        case 'BTC':
          return total + ((balance.balance || 0) * (cryptoRates?.btc_try || 2850000));
        default:
          return total;
      }
    }, 0);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">✅ Tamamlandı</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ Bekliyor</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">❌ Başarısız</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">🚫 İptal Edildi</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>E-Cüzdan yükleniyor...</p>
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
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-spiritual-purple rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-spiritual-purple bg-clip-text text-transparent">
                  E-Cüzdan
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBalances(!showBalances)}
              >
                {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showBalances ? 'Gizle' : 'Göster'}
              </Button>
              <Button
                onClick={() => navigate("/member-panel")}
                variant="outline"
                size="sm"
              >
                Üye Paneli
              </Button>
              <Button onClick={() => navigate("/")} variant="outline" size="sm">
                Ana Sayfa
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Main Balance Overview */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center space-x-2">
              <Wallet className="w-8 h-8" />
              <span>Toplam Portföy Değeri</span>
            </CardTitle>
            <CardDescription className="text-blue-100">
              Tüm varlıklarınızın TL cinsinden toplam değeri
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4">
              {showBalances ? `₺${getTotalValueInTRY().toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '••••••••'}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {balances.map((balance) => (
                <div key={balance.currency} className="bg-white/10 rounded-lg p-3">
                  <div className="text-sm text-blue-100 mb-1">{getCurrencyName(balance.currency)}</div>
                  <div className="font-semibold">
                    {showBalances ? formatCurrency(balance.balance, balance.currency) : '••••••'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-600">
                <Plus className="w-6 h-6" />
                <span>Para Yatır</span>
              </CardTitle>
              <CardDescription>
                Hesabınıza güvenli bir şekilde para yatırın
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setDepositModal(true)}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Para Yatır
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-600">
                <Minus className="w-6 h-6" />
                <span>Para Çek</span>
              </CardTitle>
              <CardDescription>
                Bakiyenizi güvenli bir şekilde çekin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setWithdrawModal(true)}
                variant="outline"
                className="w-full border-red-300 text-red-600 hover:bg-red-50"
                size="lg"
              >
                <Minus className="w-5 h-5 mr-2" />
                Para Çek
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Currency Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="TRY">₺ TL</TabsTrigger>
            <TabsTrigger value="USD">$ Dolar</TabsTrigger>
            <TabsTrigger value="EUR">€ Euro</TabsTrigger>
            <TabsTrigger value="BTC">₿ Bitcoin</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Crypto Rates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bitcoin className="w-6 h-6 text-orange-500" />
                  <span>Bitcoin Kurları</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={loadCryptoRates}
                    className="ml-auto"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-r from-orange-100 to-orange-200 p-4 rounded-lg">
                    <div className="text-sm text-orange-700 mb-1">BTC/TRY</div>
                    <div className="text-2xl font-bold text-orange-800">
                      ₺{(cryptoRates?.btc_try || 0).toLocaleString('tr-TR')}
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-100 to-green-200 p-4 rounded-lg">
                    <div className="text-sm text-green-700 mb-1">BTC/USD</div>
                    <div className="text-2xl font-bold text-green-800">
                      ${(cryptoRates?.btc_usd || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-4 rounded-lg">
                    <div className="text-sm text-blue-700 mb-1">BTC/EUR</div>
                    <div className="text-2xl font-bold text-blue-800">
                      €{(cryptoRates?.btc_eur || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Son İşlemler</CardTitle>
                <CardDescription>
                  En son gerçekleştirilen finansal işlemleriniz
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Wallet className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Henüz işlem bulunmuyor</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {transaction.type === 'deposit' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="font-semibold">{transaction.description}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(transaction.date).toLocaleDateString('tr-TR')} - {transaction.id}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold ${
                            transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency)}
                          </div>
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Currency specific tabs */}
          {['TRY', 'USD', 'EUR', 'BTC'].map((currency) => (
            <TabsContent key={currency} value={currency} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="text-2xl">{getCurrencyIcon(currency)}</span>
                    <span>{getCurrencyName(currency)} Cüzdanı</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const balance = balances.find(b => b.currency === currency);
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-blue-50 rounded-lg">
                          <div className="text-sm text-blue-600 mb-2">Toplam Bakiye</div>
                          <div className="text-3xl font-bold text-blue-800">
                            {showBalances ? formatCurrency(balance?.balance || 0, currency) : '••••••••'}
                          </div>
                        </div>
                        <div className="text-center p-6 bg-yellow-50 rounded-lg">
                          <div className="text-sm text-yellow-600 mb-2">Dondurulmuş</div>
                          <div className="text-3xl font-bold text-yellow-800">
                            {showBalances ? formatCurrency(balance?.frozen || 0, currency) : '••••••••'}
                          </div>
                        </div>
                        <div className="text-center p-6 bg-green-50 rounded-lg">
                          <div className="text-sm text-green-600 mb-2">Kullanılabilir</div>
                          <div className="text-3xl font-bold text-green-800">
                            {showBalances ? formatCurrency(balance?.available || 0, currency) : '••••••••'}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Currency specific transactions */}
              <Card>
                <CardHeader>
                  <CardTitle>{getCurrencyName(currency)} İşlem Geçmişi</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tarih</TableHead>
                        <TableHead>İşlem Türü</TableHead>
                        <TableHead>Tutar</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead>Referans</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions
                        .filter(t => t.currency === currency)
                        .map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              {transaction?.date ? new Date(transaction.date).toLocaleDateString('tr-TR') : 'Tarih yok'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {transaction.type === 'deposit' ? (
                                  <TrendingUp className="w-4 h-4 text-green-500" />
                                ) : (
                                  <TrendingDown className="w-4 h-4 text-red-500" />
                                )}
                                <span className="capitalize">
                                  {transaction.type === 'deposit' ? 'Para Yatırma' : 'Para Çekme'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className={transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}>
                              {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount, currency)}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(transaction.status)}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {transaction.reference || transaction.id}
                            </TableCell>
                          </TableRow>
                        ))}
                      {transactions.filter(t => t.currency === currency).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            Bu para biriminde henüz işlem bulunmuyor
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Deposit Modal */}
      <Dialog open={depositModal} onOpenChange={setDepositModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Plus className="w-6 h-6 text-green-600" />
              <span>Para Yatırma</span>
            </DialogTitle>
            <DialogDescription>
              Hesabınıza güvenli bir şekilde para yatırın
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Currency Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Para Birimi</Label>
                <Select
                  value={depositForm.currency}
                  onValueChange={(value: any) => setDepositForm({...depositForm, currency: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRY">₺ Türk Lirası</SelectItem>
                    <SelectItem value="USD">$ Amerikan Doları</SelectItem>
                    <SelectItem value="EUR">€ Euro</SelectItem>
                    <SelectItem value="BTC">₿ Bitcoin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Tutar</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={depositForm.amount || ''}
                  onChange={(e) => setDepositForm({...depositForm, amount: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <Label>Yatırma Yöntemi</Label>
              <Select
                value={depositForm.paymentMethod}
                onValueChange={(value: any) => setDepositForm({...depositForm, paymentMethod: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {depositForm.currency === 'BTC' ? (
                    <SelectItem value="crypto">Kripto Transfer</SelectItem>
                  ) : (
                    <SelectItem value="bank_transfer">Banka Havalesi</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Details */}
            {depositForm.currency === 'BTC' ? (
              <Card className="bg-orange-50 border-orange-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Bitcoin className="w-5 h-5 text-orange-600" />
                    <span>Bitcoin Yatırma Adresi</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white p-4 rounded border">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm break-all">{adminBankDetails.BTC.address}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(adminBankDetails.BTC.address)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-orange-700">
                    <p>⚠️ Sadece Bitcoin (BTC) gönderin. Diğer kripto paralar kaybolabilir.</p>
                    <p>📡 Network: {adminBankDetails.BTC.network}</p>
                  </div>
                  
                  <div>
                    <Label>Transaction Hash</Label>
                    <Input
                      placeholder="İşlem hash'ini girin"
                      value={depositForm.transactionHash || ''}
                      onChange={(e) => setDepositForm({...depositForm, transactionHash: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    <span>Banka Hesap Bilgileri</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(() => {
                    const bankInfo: any = adminBankDetails[depositForm.currency as keyof typeof adminBankDetails];
                    return (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm font-medium text-blue-700">Banka:</span>
                            <p className="font-semibold">{bankInfo.bank}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-blue-700">Hesap Sahibi:</span>
                            <p className="font-semibold">{bankInfo.accountHolder}</p>
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium text-blue-700">IBAN:</span>
                          <div className="flex items-center justify-between bg-white p-3 rounded border">
                            <span className="font-mono">{bankInfo.iban}</span>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => copyToClipboard(bankInfo.iban)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {'swift' in bankInfo && (
                          <div>
                            <span className="text-sm font-medium text-blue-700">SWIFT:</span>
                            <p className="font-mono bg-white p-2 rounded border">{bankInfo.swift}</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  
                  <div>
                    <Label>Referans/Açıklama</Label>
                    <Input
                      placeholder="Havale açıklaması veya referans numarası"
                      value={depositForm.reference || ''}
                      onChange={(e) => setDepositForm({...depositForm, reference: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            <div>
              <Label>Notlar (Opsiyonel)</Label>
              <Textarea
                placeholder="Ek bilgiler..."
                value={depositForm.notes || ''}
                onChange={(e) => setDepositForm({...depositForm, notes: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDepositModal(false)}>
              İptal
            </Button>
            <Button onClick={handleDeposit} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Yatırma Talebini Gönder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Modal */}
      <Dialog open={withdrawModal} onOpenChange={setWithdrawModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Minus className="w-6 h-6 text-red-600" />
              <span>Para Çekme</span>
            </DialogTitle>
            <DialogDescription>
              Bakiyenizi güvenli bir şekilde çekin
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Currency and Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Para Birimi</Label>
                <Select
                  value={withdrawForm.currency}
                  onValueChange={(value: any) => setWithdrawForm({...withdrawForm, currency: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRY">₺ Türk Lirası</SelectItem>
                    <SelectItem value="USD">$ Amerikan Doları</SelectItem>
                    <SelectItem value="EUR">€ Euro</SelectItem>
                    <SelectItem value="BTC">₿ Bitcoin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Çekilecek Tutar</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={withdrawForm.amount || ''}
                  onChange={(e) => setWithdrawForm({...withdrawForm, amount: parseFloat(e.target.value) || 0})}
                />
                {(() => {
                  const balance = balances.find(b => b.currency === withdrawForm.currency);
                  return balance && (
                    <p className="text-sm text-gray-500 mt-1">
                      Kullanılabilir: {formatCurrency(balance.available, withdrawForm.currency)}
                    </p>
                  );
                })()}
              </div>
            </div>

            {/* Withdrawal Details */}
            {withdrawForm.currency === 'BTC' ? (
              <Card className="bg-orange-50 border-orange-200">
                <CardHeader>
                  <CardTitle className="text-lg">Bitcoin Çekme Adresi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label>Bitcoin Cüzdan Adresi</Label>
                    <Input
                      placeholder="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                      value={withdrawForm.cryptoAddress || ''}
                      onChange={(e) => setWithdrawForm({...withdrawForm, cryptoAddress: e.target.value})}
                    />
                    <p className="text-sm text-orange-700 mt-2">
                      ⚠️ Lütfen Bitcoin adresini dikkatli kontrol edin. Hatalı adres kayıplara neden olabilir.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg">Banka Hesap Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>IBAN</Label>
                    <Input
                      placeholder="TR33 0006 1005 1978 6457 8413 26"
                      value={withdrawForm.bankAccount?.iban || ''}
                      onChange={(e) => setWithdrawForm({
                        ...withdrawForm, 
                        bankAccount: {...withdrawForm.bankAccount, iban: e.target.value}
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label>Hesap Sahibi Adı</Label>
                    <Input
                      placeholder="Ahmet Yılmaz"
                      value={withdrawForm.bankAccount?.accountHolder || ''}
                      onChange={(e) => setWithdrawForm({
                        ...withdrawForm, 
                        bankAccount: {...withdrawForm.bankAccount, accountHolder: e.target.value}
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label>Banka Adı</Label>
                    <Input
                      placeholder="Türkiye İş Bankası"
                      value={withdrawForm.bankAccount?.bankName || ''}
                      onChange={(e) => setWithdrawForm({
                        ...withdrawForm, 
                        bankAccount: {...withdrawForm.bankAccount, bankName: e.target.value}
                      })}
                    />
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-semibold mb-1">KYC Uyarısı</p>
                        <p>Hesap sahibi adı, KYC belgelerinizdeki isimle eşleşmelidir. Aksi takdirde çekim talebi reddedilecektir.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div>
              <Label>Notlar (Opsiyonel)</Label>
              <Textarea
                placeholder="Ek bilgiler..."
                value={withdrawForm.notes || ''}
                onChange={(e) => setWithdrawForm({...withdrawForm, notes: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawModal(false)}>
              İptal
            </Button>
            <Button onClick={handleWithdraw} variant="destructive">
              <Minus className="w-4 h-4 mr-2" />
              Çekme Talebini Gönder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Para Çekme Onayı</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlemi onaylıyor musunuz?
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Tutar:</span>
                    <span className="font-semibold">
                      {pendingOperation && formatCurrency(pendingOperation.amount, pendingOperation.currency)}
                    </span>
                  </div>
                  {pendingOperation?.bankAccount && (
                    <div className="flex justify-between">
                      <span>Hedef IBAN:</span>
                      <span className="font-mono text-sm">{pendingOperation.bankAccount.iban}</span>
                    </div>
                  )}
                  {pendingOperation?.cryptoAddress && (
                    <div className="flex justify-between">
                      <span>BTC Adresi:</span>
                      <span className="font-mono text-sm break-all">{pendingOperation.cryptoAddress}</span>
                    </div>
                  )}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmWithdraw}>
              Onayla ve Gönder
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
