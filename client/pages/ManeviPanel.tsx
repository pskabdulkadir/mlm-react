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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Crown,
  ArrowLeft,
  Heart,
  Book,
  Play,
  Pause,
  Plus,
  Minus,
  BookOpen,
  Video,
  Headphones,
  Star,
  Trophy,
  Target,
  Calendar,
  Clock,
  CheckCircle,
  FileText,
  Download,
  Upload,
  Volume2,
  Moon,
  Sun,
  Bookmark,
  Search,
  Globe,
  Quote,
  Lightbulb,
  MessageCircle,
  PenTool,
  Archive,
  Filter,
  ExternalLink,
  ArrowRight,
  ArrowLeft as ArrowLeftIcon,
  Users,
  Sparkles,
  Calculator,
} from "lucide-react";
import { Link } from "react-router-dom";

// Ahmet el Acemi YouTube Kur'an Cüzleri - Gerçek Playlist
const quranJuzList = [
  { id: 1, name: "1. Cüz", startSura: "Fatiha", endSura: "Bakara 141", playlistUrl: "https://www.youtube.com/watch?v=B5KwA5gukHA&list=PLUJuhUbtCMFPO3bAPVeG_taebSHH3KIS7&index=1", duration: "45:30" },
  { id: 2, name: "2. Cüz", startSura: "Bakara 142", endSura: "Bakara 252", playlistUrl: "https://www.youtube.com/watch?v=B5KwA5gukHA&list=PLUJuhUbtCMFPO3bAPVeG_taebSHH3KIS7&index=2", duration: "48:20" },
  { id: 3, name: "3. Cüz", startSura: "Bakara 253", endSura: "Âl-i İmran 92", playlistUrl: "https://www.youtube.com/watch?v=B5KwA5gukHA&list=PLUJuhUbtCMFPO3bAPVeG_taebSHH3KIS7&index=3", duration: "47:15" },
  { id: 4, name: "4. Cüz", startSura: "Âl-i İmran 93", endSura: "Nisa 23", playlistUrl: "https://www.youtube.com/watch?v=B5KwA5gukHA&list=PLUJuhUbtCMFPO3bAPVeG_taebSHH3KIS7&index=4", duration: "46:45" },
  { id: 5, name: "5. Cüz", startSura: "Nisa 24", endSura: "Nisa 147", playlistUrl: "https://www.youtube.com/watch?v=B5KwA5gukHA&list=PLUJuhUbtCMFPO3bAPVeG_taebSHH3KIS7&index=5", duration: "49:10" },
  { id: 6, name: "6. Cüz", startSura: "Nisa 148", endSura: "Maide 81", playlistUrl: "https://www.youtube.com/watch?v=B5KwA5gukHA&list=PLUJuhUbtCMFPO3bAPVeG_taebSHH3KIS7&index=6", duration: "48:35" },
  { id: 7, name: "7. Cüz", startSura: "Maide 82", endSura: "Enam 110", playlistUrl: "https://www.youtube.com/watch?v=B5KwA5gukHA&list=PLUJuhUbtCMFPO3bAPVeG_taebSHH3KIS7&index=7", duration: "47:55" },
  { id: 8, name: "8. Cüz", startSura: "Enam 111", endSura: "Araf 87", playlistUrl: "https://www.youtube.com/watch?v=B5KwA5gukHA&list=PLUJuhUbtCMFPO3bAPVeG_taebSHH3KIS7&index=8", duration: "46:20" },
  { id: 9, name: "9. Cüz", startSura: "Araf 88", endSura: "Enfal 40", playlistUrl: "https://www.youtube.com/watch?v=B5KwA5gukHA&list=PLUJuhUbtCMFPO3bAPVeG_taebSHH3KIS7&index=9", duration: "48:40" },
  { id: 10, name: "10. Cüz", startSura: "Enfal 41", endSura: "Tevbe 92", playlistUrl: "https://www.youtube.com/watch?v=B5KwA5gukHA&list=PLUJuhUbtCMFPO3bAPVeG_taebSHH3KIS7&index=10", duration: "47:25" },
  { id: 11, name: "11. Cüz", startSura: "Tevbe 93", endSura: "Hud 5", playlistUrl: "https://www.youtube.com/watch?v=B5KwA5gukHA&list=PLUJuhUbtCMFPO3bAPVeG_taebSHH3KIS7&index=11", duration: "49:15" },
  { id: 12, name: "12. Cüz", startSura: "Hud 6", endSura: "Yusuf 52", playlistUrl: "https://www.youtube.com/watch?v=B5KwA5gukHA&list=PLUJuhUbtCMFPO3bAPVeG_taebSHH3KIS7&index=12", duration: "48:00" },
  { id: 13, name: "13. Cüz", startSura: "Yusuf 53", endSura: "İbrahim 52", playlistUrl: "https://www.youtube.com/watch?v=B5KwA5gukHA&list=PLUJuhUbtCMFPO3bAPVeG_taebSHH3KIS7&index=13", duration: "47:30" },
  { id: 14, name: "14. Cüz", startSura: "Hicr 1", endSura: "Nahl 128", playlistUrl: "https://www.youtube.com/watch?v=B5KwA5gukHA&list=PLUJuhUbtCMFPO3bAPVeG_taebSHH3KIS7&index=14", duration: "46:50" },
  { id: 15, name: "15. Cüz", startSura: "İsra 1", endSura: "Kehf 74", playlistUrl: "https://www.youtube.com/watch?v=B5KwA5gukHA&list=PLUJuhUbtCMFPO3bAPVeG_taebSHH3KIS7&index=15", duration: "48:10" },
  { id: 16, name: "16. Cüz", startSura: "Kehf 75", endSura: "Taha 135", playlistUrl: "https://www.youtube.com/watch?v=B5KwA5gukHA&list=PLUJuhUbtCMFPO3bAPVeG_taebSHH3KIS7&index=16", duration: "47:45" },
  { id: 17, name: "17. Cüz", startSura: "Enbiya 1", endSura: "Hac 78", playlistUrl: "https://www.youtube.com/watch?v=B5KwA5gukHA&list=PLUJuhUbtCMFPO3bAPVeG_taebSHH3KIS7&index=17", duration: "49:05" },
  { id: 18, name: "18. Cüz", startSura: "Mü'minun 1", endSura: "Furkan 20", playlistUrl: "https://www.youtube.com/watch?v=B5KwA5gukHA&list=PLUJuhUbtCMFPO3bAPVeG_taebSHH3KIS7&index=18", duration: "48:25" },
  { id: 19, name: "19. Cüz", startSura: "Furkan 21", endSura: "Neml 55", playlistUrl: "https://www.youtube.com/watch?v=B5KwA5gukHA&list=PLUJuhUbtCMFPO3bAPVeG_taebSHH3KIS7&index=19", duration: "47:55" },
  { id: 20, name: "20. Cüz", startSura: "Neml 56", endSura: "Ankebut 45", playlistUrl: "https://www.youtube.com/watch?v=B5KwA5gukHA&list=PLUJuhUbtCMFPO3bAPVeG_taebSHH3KIS7&index=20", duration: "46:35" },
  { id: 21, name: "21. Cüz", startSura: "Ankebut 46", endSura: "Ahzab 30", playlistUrl: "https://www.youtube.com/watch?v=B5KwA5gukHA&list=PLUJuhUbtCMFPO3bAPVeG_taebSHH3KIS7&index=21", duration: "48:15" },
  { id: 22, name: "22. Cüz", startSura: "Ahzab 31", endSura: "Yasin 27", playlistUrl: "https://www.youtube.com/watch?v=B5KwA5gukHA&list=PLUJuhUbtCMFPO3bAPVeG_taebSHH3KIS7&index=22", duration: "47:40" },
  { id: 23, name: "23. Cüz", startSura: "Yasin 28", endSura: "Zümer 31", playlistUrl: "https://www.youtube.com/watch?v=B5KwA5gukHA&list=PLUJuhUbtCMFPO3bAPVeG_taebSHH3KIS7&index=23", duration: "49:20" },
  { id: 24, name: "24. Cüz", startSura: "Zümer 32", endSura: "Fussilet 46", playlistUrl: "https://www.youtube.com/watch?v=B5KwA5gukHA&list=PLUJuhUbtCMFPO3bAPVeG_taebSHH3KIS7&index=24", duration: "48:05" },
  { id: 25, name: "25. Cüz", startSura: "Fussilet 47", endSura: "Casiye 37", playlistUrl: "https://www.youtube.com/watch?v=B5KwA5gukHA&list=PLUJuhUbtCMFPO3bAPVeG_taebSHH3KIS7&index=25", duration: "47:20" },
  { id: 26, name: "26. Cüz", startSura: "Ahkaf 1", endSura: "Zariyat 30", playlistUrl: "https://www.youtube.com/watch?v=B5KwA5gukHA&list=PLUJuhUbtCMFPO3bAPVeG_taebSHH3KIS7&index=26", duration: "46:45" },
  { id: 27, name: "27. Cüz", startSura: "Zariyat 31", endSura: "Hadid 29", playlistUrl: "https://www.youtube.com/watch?v=B5KwA5gukHA&list=PLUJuhUbtCMFPO3bAPVeG_taebSHH3KIS7&index=27", duration: "48:30" },
  { id: 28, name: "28. Cüz", startSura: "Mücadele 1", endSura: "Tahrim 12", playlistUrl: "https://www.youtube.com/watch?v=B5KwA5gukHA&list=PLUJuhUbtCMFPO3bAPVeG_taebSHH3KIS7&index=28", duration: "47:10" },
  { id: 29, name: "29. Cüz", startSura: "Mülk 1", endSura: "Mürselat 50", playlistUrl: "https://www.youtube.com/watch?v=B5KwA5gukHA&list=PLUJuhUbtCMFPO3bAPVeG_taebSHH3KIS7&index=29", duration: "49:00" },
  { id: 30, name: "30. Cüz", startSura: "Nebe 1", endSura: "Nas 6", playlistUrl: "https://www.youtube.com/watch?v=B5KwA5gukHA&list=PLUJuhUbtCMFPO3bAPVeG_taebSHH3KIS7&index=30", duration: "48:50" }
];

// Burç bilgileri ve hesaplama
const zodiacSigns = [
  {
    name: "Koç",
    dates: "21 Mart - 19 Nisan",
    element: "Ateş",
    planet: "Mars",
    traits: ["Cesur", "Enerjik", "Lider ruhlu", "Hızlı karar veren", "Rekabetçi"],
    compatibility: ["Aslan", "Yay", "İkizler", "Kova"],
    luckyNumbers: [1, 8, 17],
    luckyColors: ["Kırmızı", "Turuncu"],
    description: "Koç burcu, zodyak'ın ilk burcu olarak doğal liderlik özelliklerine sahiptir. Ateş elementi sayesinde enerjik ve dinamik yapıya sahiplerdir."
  },
  {
    name: "Boğa",
    dates: "20 Nisan - 20 Mayıs",
    element: "Toprak",
    planet: "Venüs",
    traits: ["Kararlı", "Güvenilir", "Sabırlı", "Sanat sever", "Lüks düşkünü"],
    compatibility: ["Başak", "Oğlak", "Yengeç", "Balık"],
    luckyNumbers: [2, 6, 9],
    luckyColors: ["Yeşil", "Pembe"],
    description: "Boğa burcu, toprak elementi ile kararlı ve güvenilir yapıya sahiptir. Venüs'ün etkisiyle estetik ve güzellik anlayışları gelişmiştir."
  },
  {
    name: "İkizler",
    dates: "21 Mayıs - 20 Haziran",
    element: "Hava",
    planet: "Merkür",
    traits: ["Zeki", "İletişim kuvvetli", "Meraklı", "Değişken", "Sosyal"],
    compatibility: ["Terazi", "Kova", "Koç", "Aslan"],
    luckyNumbers: [5, 7, 14],
    luckyColors: ["Sarı", "Gümüş"],
    description: "İkizler burcu, hava elementi ile zeki ve iletişim yetenekleri güçlü bireylerdir. Merkür'ün etkisiyle düşünce ve konuşma yetenekleri gelişmiştir."
  },
  {
    name: "Yengeç",
    dates: "21 Haziran - 22 Temmuz",
    element: "Su",
    planet: "Ay",
    traits: ["Duygusal", "Koruyucu", "Sezgileri güçlü", "Aile yanlısı", "Empatik"],
    compatibility: ["Balık", "Akrep", "Boğa", "Başak"],
    luckyNumbers: [2, 7, 11],
    luckyColors: ["Gümüş", "Beyaz"],
    description: "Yengeç burcu, su elementi ile duygusal ve sezgileri güçlü yapıya sahiptir. Ay'ın etkisiyle koruyucu ve aile odaklı özellikler taşır."
  },
  {
    name: "Aslan",
    dates: "23 Temmuz - 22 Ağustos",
    element: "Ateş",
    planet: "Güneş",
    traits: ["Gururlu", "Cömert", "Yaratıcı", "Dramatik", "Güven verici"],
    compatibility: ["Koç", "Yay", "İkizler", "Terazi"],
    luckyNumbers: [1, 3, 10],
    luckyColors: ["Altın", "Turuncu"],
    description: "Aslan burcu, ateş elementi ve Güneş'in etkisiyle doğal karizma ve liderlik özelliklerine sahiptir. Yaratıcı ve cömert yapıdadırlar."
  },
  {
    name: "Başak",
    dates: "23 Ağustos - 22 Eylül",
    element: "Toprak",
    planet: "Merkür",
    traits: ["Mükemmeliyetçi", "Analitik", "Pratik", "Hizmet odaklı", "Detaycı"],
    compatibility: ["Boğa", "Oğlak", "Yengeç", "Akrep"],
    luckyNumbers: [6, 14, 23],
    luckyColors: ["Lacivert", "Gri"],
    description: "Başak burcu, toprak elementi ile pratik ve analitik düşünce yapısına sahiptir. Merkür'ün etkisiyle detaylara önem verir ve mükemmeliyetçidir."
  },
  {
    name: "Terazi",
    dates: "23 Eylül - 22 Ekim",
    element: "Hava",
    planet: "Venüs",
    traits: ["Dengeli", "Adil", "Diplomatik", "Estetik", "Sosyal"],
    compatibility: ["İkizler", "Kova", "Aslan", "Yay"],
    luckyNumbers: [6, 15, 24],
    luckyColors: ["Pembe", "Mavi"],
    description: "Terazi burcu, hava elementi ile dengeli ve adil yapıya sahiptir. Venüs'ün etkisiyle estetik anlayışları gelişmiş ve diplomatik yaklaşım sergilerler."
  },
  {
    name: "Akrep",
    dates: "23 Ekim - 21 Kasım",
    element: "Su",
    planet: "Plüton",
    traits: ["Yoğun", "Gizemli", "Kararlı", "Dönüştürücü", "Sezgileri güçlü"],
    compatibility: ["Yengeç", "Balık", "Başak", "Oğlak"],
    luckyNumbers: [4, 13, 27],
    luckyColors: ["Kırmızı", "Siyah"],
    description: "Akrep burcu, su elementi ile yoğun duygusal derinliğe sahiptir. Plüton'un etkisiyle dönüştürücü güç ve güçlü sezgilere sahiplerdir."
  },
  {
    name: "Yay",
    dates: "22 Kasım - 21 Aralık",
    element: "Ateş",
    planet: "Jüpiter",
    traits: ["Özgür", "Macera sever", "Felsefik", "İyimser", "Doğru sözlü"],
    compatibility: ["Koç", "Aslan", "Terazi", "Kova"],
    luckyNumbers: [3, 9, 22],
    luckyColors: ["Mor", "Turkuaz"],
    description: "Yay burcu, ateş elementi ile özgürlük seven ve macera dolu yaşam tarzına sahiptir. Jüpiter'in etkisiyle felsefik düşünce ve iyimserlik taşır."
  },
  {
    name: "Oğlak",
    dates: "22 Aralık - 19 Ocak",
    element: "Toprak",
    planet: "Satürn",
    traits: ["Disiplinli", "Hırslı", "Sorumluluk sahibi", "Pratik", "Kararlı"],
    compatibility: ["Boğa", "Başak", "Akrep", "Balık"],
    luckyNumbers: [10, 8, 26],
    luckyColors: ["Siyah", "Kahverengi"],
    description: "Oğlak burcu, toprak elementi ile disiplinli ve sorumluluk sahibi yapıya sahiptir. Satürn'ün etkisiyle uzun vadeli hedefler koyan kararlı bireylerdir."
  },
  {
    name: "Kova",
    dates: "20 Ocak - 18 Şubat",
    element: "Hava",
    planet: "Uranüs",
    traits: ["Yenilikçi", "Bağımsız", "İnsancıl", "Orijinal", "Vizyoner"],
    compatibility: ["İkizler", "Terazi", "Koç", "Yay"],
    luckyNumbers: [4, 7, 11],
    luckyColors: ["Mavi", "Gümüş"],
    description: "Kova burcu, hava elementi ile yenilikçi ve bağımsız yapıya sahiptir. Uranüs'ün etkisiyle orijinal düşünceler ve insancıl yaklaşım sergiler."
  },
  {
    name: "Balık",
    dates: "19 Şubat - 20 Mart",
    element: "Su",
    planet: "Neptün",
    traits: ["Hayal gücü kuvvetli", "Empatik", "Sanatsal", "Ruhani", "Sezgileri güçlü"],
    compatibility: ["Yengeç", "Akrep", "Boğa", "Oğlak"],
    luckyNumbers: [7, 12, 29],
    luckyColors: ["Deniz mavisi", "Mor"],
    description: "Balık burcu, su elementi ile güçlü hayal gücü ve empati yeteneğine sahiptir. Neptün'ün etkisiyle sanatsal ve ruhani eğilimleri bulunur."
  }
];

// Kur'an Sureleri (seçilmiş)
const quranSuras = [
  {
    id: 1,
    name: "Al-Fatiha",
    arabicName: "الفاتحة",
    meaning: "Açılış",
    verses: 7,
    type: "Mekkî",
    content: {
      arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿١﴾ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾ الرَّحْمَٰنِ الرَّحِيمِ ﴿٣﴾ مَالِكِ يَوْمِ الدِّينِ ﴿٤﴾ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٥﴾ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٦﴾ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿٧﴾",
      translation: "Rahman ve Rahim olan Allah'ın adıyla. Hamd, âlemlerin Rabbi Allah'a mahsustur. O Rahman'dır, Rahim'dir. Din (ceza ve mükâfat) gününün sahibidir. (Ey Rabbimiz!) Yalnız sana kulluk eder ve yalnız senden yardım dileriz. Bizi doğru yola ilet; kendilerine nimet verdiklerinin yoluna; gazaba uğrayanların ve sapıtanların yoluna değil!",
      commentary: "Fatiha suresi, Kur'an'ın özeti ve namaz için vazgeçilmez bir suredir. İçerdiği dua, kulluk, tevhid ve hidayet temaları tüm Müslümanların günlük yaşamının temelini oluşturur."
    }
  },
  {
    id: 2,
    name: "Al-Ikhlas",
    arabicName: "الإخلاص",
    meaning: "İhlas",
    verses: 4,
    type: "Mekkî",
    content: {
      arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿١﴾ قُلْ هُوَ اللَّهُ أَحَدٌ ﴿١﴾ اللَّهُ الصَّمَدُ ﴿٢﴾ لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿٣﴾ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ ﴿٤﴾",
      translation: "De ki: O Allah birdir. Allah Samed'dir (her şey O'na muhtaçtır, O hiçbir şeye muhtaç değildir). O doğurmamış ve doğmamıştır. Hiçbir şey O'na denk değildir.",
      commentary: "İhlas suresi, tevhidin en saf ifadesidir. Allah'ın birliği ve eşsizliğini vurgular. Bu sure, Kur'an'ın üçte birine eşdeğer sevaptadır."
    }
  },
  {
    id: 3,
    name: "Al-Falaq",
    arabicName: "الفلق",
    meaning: "Şafak",
    verses: 5,
    type: "Mekkî",
    content: {
      arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿١﴾ قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ﴿١﴾ مِن شَرِّ مَا خَلَقَ ﴿٢﴾ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ﴿٣﴾ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ﴿٤﴾ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ﴿٥﴾",
      translation: "De ki: Şafağın Rabbine sığınırım; yarattığı şeylerin şerrinden, karanlık bastırdığında gecenin şerrinden, düğümlere üfleyenlerin şerrinden ve haset ettiği zaman hasetçinin şerrinden.",
      commentary: "Falak suresi, korunma duasıdır. Her türlü kötülükten, büyüden ve hasetten Allah'a sığınmayı öğretir."
    }
  },
  {
    id: 4,
    name: "An-Nas",
    arabicName: "الناس",
    meaning: "İnsanlar",
    verses: 6,
    type: "Mekkî",
    content: {
      arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿١﴾ قُلْ أَعُوذُ بِرَبِّ النَّاسِ ﴿١﴾ مَلِكِ النَّاسِ ﴿٢﴾ إِلَٰهِ النَّاسِ ﴿٣﴾ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ﴿٤﴾ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ﴿٥﴾ مِنَ الْجِنَّةِ وَالنَّاسِ ﴿٦﴾",
      translation: "De ki: İnsanların Rabbine, İnsanların Kralına, İnsanların İlahına sığınırım; sinsi vesvesenin şerrinden; o insanların kalplerine vesvese verenin şerrinden; cinlerden ve insanlardan.",
      commentary: "Nas suresi, şeytanın vesveselerinden korunma duasıdır. Kalpteki kötü düşünceler ve şeytani fısıltılardan Allah'a sığınmayı öğretir."
    }
  }
];

// Kapsamlı Hadis Arşivi
const hadiths = [
  // Temel İman ve İbadet Hadisleri
  {
    id: 1,
    arabic: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    translation: "Ameller niyetlere göredir ve herkesin niyetlediği vardır.",
    source: "Buhari, Muslim",
    category: "Niyet",
    explanation: "Bu hadis, İslam'da niyetin önemini vurgular. Her amelin değeri, yapılırken taşınan niyete bağlıdır. Allah katında sevap kazanmak için samimi bir niyet gereklidir.",
    narrator: "Hz. Ömer (r.a.)",
    bookNumber: "Buhari 1, Muslim 1907"
  },
  {
    id: 2,
    arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    translation: "Allah'a ve ahiret gününe iman eden kimse ya hayır söylesin ya sussun.",
    source: "Buhari, Muslim",
    category: "Ahlak",
    explanation: "Bu hadis, sözümüzü kontrol etmenin önemini vurgular. Faydasız konuşmak yerine susmanın daha hayırlı olduğunu öğretir.",
    narrator: "Hz. Ebu Hüreyre (r.a.)",
    bookNumber: "Buhari 6018, Muslim 47"
  },
  {
    id: 3,
    arabic: "الدِّينُ النَّصِيحَةُ",
    translation: "Din nasihattir.",
    source: "Muslim",
    category: "Nasihat",
    explanation: "Din, samimi öğüt vermekten ibarettir. Allah'a, Resulüne, İslam liderlerine ve tüm Müslümanlara karşı nasihat etmek dinin esasıdır.",
    narrator: "Hz. Temim ed-Dari (r.a.)",
    bookNumber: "Muslim 55"
  },
  {
    id: 4,
    arabic: "مَنْ لَمْ يَشْكُرِ النَّاسَ لَمْ يَشْكُرِ اللَّّهَ",
    translation: "İnsanlara şükretmeyen, Allah'a şükretmemiş olur.",
    source: "Tirmizi",
    category: "Şükür",
    explanation: "Şükür, önce insanlara sonra Allah'a karşı gösterilmelidir. İnsanların iyiliğini takdir etmek, Allah'a şükretmenin bir parçasıdır.",
    narrator: "Hz. Ebu Hüreyre (r.a.)",
    bookNumber: "Tirmizi 1954"
  },
  {
    id: 5,
    arabic: "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ",
    translation: "Nerede olursan ol Allah'tan kork, kötülüğün ardından iyilik yap ki onu silsin ve insanlarla güzel ahlakla muamele et.",
    source: "Tirmizi",
    category: "Takva",
    explanation: "Bu hadis, takva, tövbe ve güzel ahlakın önemini vurgular. Müslümanın hem Allah'a hem de insanlara karşı sorumluluklarını hatırlatır.",
    narrator: "Hz. Muaz bin Cebel (r.a.)",
    bookNumber: "Tirmizi 1987"
  },
  // Namaz ve İbadet Hadisleri
  {
    id: 6,
    arabic: "بُنِيَ الْإِسْلَامُ عَلَى خَمْس��",
    translation: "İslam beş temel üzerine bina edilmiştir.",
    source: "Buhari, Muslim",
    category: "İbadet",
    explanation: "İslam'ın beş temel esası: Kelime-i Şahadet, namaz, zekat, hac ve oruç. Bu hadis İslam'ın ana pillerini belirtir.",
    narrator: "Hz. İbn Ömer (r.a.)",
    bookNumber: "Buhari 8, Muslim 16"
  },
  {
    id: 7,
    arabic: "الصَّلَاةُ نُورٌ وَالصَّدَقَةُ بُرْهَانٌ وَالصَّبْرُ ضِيَاءٌ",
    translation: "Namaz nurdur, sadaka delildir, sabır aydınlıktır.",
    source: "Muslim",
    category: "Namaz",
    explanation: "Bu hadis namaz, sadaka ve sabrın manevi değerini açıklar. Her biri müslümanın ruhunu aydınlatan farklı niteliklerdir.",
    narrator: "Hz. Ebu Malik el-Eş'ari (r.a.)",
    bookNumber: "Muslim 223"
  },
  // Ahlak ve Muamelat Hadisleri
  {
    id: 8,
    arabic: "إِنَّمَا بُعِثْتُ لِأُتَمِّمَ مَكَارِمَ الْأَخْلَاقِ",
    translation: "Ben ancak güzel ahlakı tamamlamak için gönderildim.",
    source: "Muvatta",
    category: "Ahlak",
    explanation: "Bu hadis, İslam'ın temel amacının güzel ahlak olduğunu belirtir. Hz. Peygamber'in temel misyonu ahlaki mükemmelliği sağlamaktır.",
    narrator: "Hz. Ebu Hüreyre (r.a.)",
    bookNumber: "Muvatta 1614"
  },
  {
    id: 9,
    arabic: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    translation: "Biriniz, kardeşi için kendisi için istediğini istemediği sürece iman etmiş olmaz.",
    source: "Buhari, Muslim",
    category: "Kardeşlik",
    explanation: "Bu hadis, müslümanlar arasındaki kardeşlik bağının derinliğini gösterir. Gerçek iman, başkalarını kendisi gibi sevmeyi gerektirir.",
    narrator: "Hz. Enes (r.a.)",
    bookNumber: "Buhari 13, Muslim 45"
  },
  {
    id: 10,
    arabic: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ",
    translation: "Müslüman, müslümanların dil ve elinden emin olduğu kimsedir.",
    source: "Buhari, Muslim",
    category: "Müslümanlık",
    explanation: "Gerçek müslümanlık, başkalarına zarar vermemekle ölçülür. Dil ve el, en çok zarar verebilecek organlar olarak belirtilmiştir.",
    narrator: "Hz. Abdullah bin Amr (r.a.)",
    bookNumber: "Buhari 10, Muslim 41"
  },
  // İlim ve Hikmet Hadisleri
  {
    id: 11,
    arabic: "اطْلُبُوا الْعِلْمَ مِنَ الْمَهْدِ إِلَى اللَّحْدِ",
    translation: "İlmi beşikten mezara kadar arayın.",
    source: "İbn Abdülber",
    category: "İlim",
    explanation: "Bu hadis, yaşam boyu öğrenmenin önemini vurgular. İlim arayışı, doğumdan ölüme kadar devam etmesi gereken bir ibadettir.",
    narrator: "Hz. Enes (r.a.)",
    bookNumber: "İbn Abdülber, Camiu Beyan 1/59"
  },
  {
    id: 12,
    arabic: "اطْلُبُوا الْعِلْمَ وَلَوْ بِالصِّينِ",
    translation: "İlmi öğrenin, Çin'de bile olsa.",
    source: "Beyhaki",
    category: "İlim",
    explanation: "Bu hadis, ilim için her türlü zorluğa katlanmanın gerekliliğini belirtir. Uzaklık ve güçlük, ilim öğrenmeye engel olmamalıdır.",
    narrator: "Hz. Enes (r.a.)",
    bookNumber: "Beyhaki, Şuab 2/253"
  },
  // Dua ve Zikir Hadisleri
  {
    id: 13,
    arabic: "الدُّعَاءُ مُخُّ الْعِبَادَةِ",
    translation: "Dua, ibadetin özüdür.",
    source: "Tirmizi",
    category: "Dua",
    explanation: "Bu hadis, duanın ibadet hayatındaki merkezi yerini gösterir. Dua, kul ile Allah arasındaki en samimi iletişim biçimidir.",
    narrator: "Hz. Enes (r.a.)",
    bookNumber: "Tirmizi 3371"
  },
  {
    id: 14,
    arabic: "أَفْضَلُ الذِّكْرِ لَا إِلَهَ إِلَّا اللَّهُ",
    translation: "Zikrin en faziletlisi 'La ilahe illallah'tır.",
    source: "Tirmizi",
    category: "Zikir",
    explanation: "Tevhid kelimesi olan 'La ilahe illallah' en faziletli zikirdir. Bu kelime, İslam'ın temel esasını ve Allah'ın birliğini ifade eder.",
    narrator: "Hz. Cabir (r.a.)",
    bookNumber: "Tirmizi 3383"
  },
  // Sabır ve Şükür Hadisleri
  {
    id: 15,
    arabic: "عَجَبًا لِأَمْرِ الْمُؤْمِنِ إِنَّ أَمْرُهُ كُلَّهُ خَيْرٌ",
    translation: "Müminin işi şaşılacak şeydir, çünkü bütün işleri hayırdır.",
    source: "Muslim",
    category: "Sabır",
    explanation: "Bu hadis, müslümanın her halinde kazançlı olduğunu belirtir. Sevinçte şükretmek, sıkıntıda sabretmek, her ikisi de sevabtır.",
    narrator: "Hz. Suheyb (r.a.)",
    bookNumber: "Muslim 2999"
  }
];

// Kapsamlı Sünnet Arşivi
const sunnahs = [
  {
    id: 1,
    title: "Misvak Kullanmak",
    description: "Ağız ve diş hijyeni için misvak kullanmak",
    time: "Her namaz öncesi ve uyandığında",
    reward: "Ağzın temizlenmesi ve Allah'ın rızası",
    evidence: "Misvak ağzı temizler ve Rabb'i razı eder. (Nesai)",
    subcategory: "Temizlik",
    details: [
      "Sabah uyanınca",
      "Her namaz öncesi", 
      "Ağız kokusu olduğunda",
      "Kur'an okumadan önce"
    ]
  },
  {
    id: 2,
    title: "Sağ Taraftan Başlamak",
    description: "Ayakkabı giyerken, yemek yerken, abdest alırken sağdan başlamak",
    time: "Günlük hayatın her anında",
    reward: "Güzel ahlak ve bereketli hayat",
    evidence: "Hz. Aişe: Resûlullah her işinde sağdan başlamayı severdi. (Buhari)",
    subcategory: "Ahlak",
    details: [
      "Ayakkabı giyerken",
      "Yemek yerken",
      "Abdest alırken",
      "Camiye girerken"
    ]
  },
  {
    id: 3,
    title: "Selamlaşmak",
    description: "Müslümanlarla karşılaştığında selam vermek",
    time: "Her karşılaşmada",
    reward: "Sevap kazanmak ve kalpler arası dostluk",
    evidence: "Aranızda şunu yaygınlaştırın: Selamı yayın. (Muslim)",
    subcategory: "Sosyal",
    details: [
      "Evden çıkarken",
      "Eve girerken",
      "Müslümanlarla karşılaşınca",
      "Toplantı başında"
    ]
  },
  {
    id: 4,
    title: "Üç Kere Yemek",
    description: "Yemek ve içmek üç nefeste, üç kerede yapılması",
    time: "Her yemek ve içme anında",
    reward: "Sağlıklı beslenme ve bereket",
    evidence: "Resûlullah su içerken üç nefeste içerdi. (Buhari)",
    subcategory: "Beslenme",
    details: [
      "Su içerken",
      "Yemek yerken",
      "Süt içerken",
      "Her içecek için"
    ]
  },
  {
    id: 5,
    title: "Yatmadan Önce Zikirler",
    description: "Yatmadan önce İhlas, Felak, Nas surelerini okumak",
    time: "Her gece yatmadan önce",
    reward: "Korunma ve huzurlu uyku",
    evidence: "Resûlullah her gece yatarken bu sureleri okurdu. (Buhari)",
    subcategory: "Zikir",
    details: [
      "İhlas suresi (3 defa)",
      "Felak suresi (3 defa)",
      "Nas suresi (3 defa)",
      "Ayetel Kürsi"
    ]
  },
  {
    id: 6,
    title: "Sünnet Dualar",
    description: "Belirli durumlarda okunacak sünnet dualar",
    time: "Duruma göre değişir",
    reward: "Manevi huzur ve Allah'ın koruması",
    evidence: "Resûlullah her iş için dua ederdi. (Buhari)",
    subcategory: "Dua",
    details: [
      "Yemek öncesi ve sonrası dualar",
      "Yolculuk duası",
      "Hastalık duası",
      "Uyku duası"
    ]
  },
  {
    id: 7,
    title: "Fecir ve Akşam Ezkarı",
    description: "Sabah akşam okunacak zikirler ve dualar",
    time: "Fecirden güneş doğana, Maghripten yatsıya kadar",
    reward: "Günlük korunma ve bereket",
    evidence: "Kim sabah akşam ezkarını okursa, hiçbir şey ona zarar veremez. (Ebu Davud)",
    subcategory: "Zikir",
    details: [
      "Ayetel Kürsi",
      "İhlas, Felak, Nas sureleri",
      "İstiaze duaları",
      "Hamd ve şükür zikirler"
    ]
  },
  {
    id: 8,
    title: "Cemaatle Namaz",
    description: "Namazları cemaatle kılmak",
    time: "Her namaz vakti",
    reward: "25-27 kat daha fazla sevap",
    evidence: "Cemaatle namaz, tek başına kılınan namazdan 27 derece üstündür. (Buhari)",
    subcategory: "Namaz",
    details: [
      "Camide cemaatle namaz",
      "İmamın arkasında durma adabı",
      "Namaz öncesi ve sonrası sünnetler",
      "Tekbir-i tahrimeden sonra dua"
    ]
  },
  {
    id: 9,
    title: "Zikir ve Tesbih",
    description: "Günlük zikir ve tesbihleri yapmak",
    time: "Gün boyunca, özellikle namaz sonrası",
    reward: "Kalp temizliği ve ruhani yükseliş",
    evidence: "Allah'ı zikreden ve zikretmeyen kimse, diri ve ölü gibidir. (Buhari)",
    subcategory: "Zikir",
    details: [
      "Subhanallah (33 defa)",
      "Elhamdülillah (33 defa)",
      "Allahu Ekber (34 defa)",
      "La ilahe illallah (100 defa)"
    ]
  },
  {
    id: 10,
    title: "Güzel Ahlak",
    description: "İnsanlarla güzel ahlakla muamele etmek",
    time: "Her zaman",
    reward: "Cennet'te Peygamber'e yakın olmak",
    evidence: "Kıyamette bana en yakın olanınız, ahlakı en güzel olanınızdır. (Tirmizi)",
    subcategory: "Ahlak",
    details: [
      "Sabırlı olmak",
      "Güleryüzlü olmak",
      "Affedici olmak",
      "Yardım etmek"
    ]
  }
];

// Manevi İlimler
const spiritualSciences = [
  {
    id: 1,
    title: "Tasavvuf İlmi",
    description: "Kalp temizliği ve Allah'a yakınlaşma ilmi",
    topics: ["Kalp ilmi", "Zikir adabı", "Nefis terbiyesi", "Marifet yolları"],
    importance: "İslam'ın ihsan boyutunu anlamak ve yaşamak için gereklidir.",
    scholars: ["İmam Gazzali", "Mevlana", "İbn Arabi", "Ahmed Rifai"]
  },
  {
    id: 2,
    title: "Ahlak İlmi",
    description: "Güzel karakter özellikleri ve kötü huylardan arınma",
    topics: ["Faziletler", "Reziletler", "Karakter gelişimi", "İnsan ilişkileri"],
    importance: "İnsan olmanın temel gereklerinden biri güzel ahlak sahibi olmaktır.",
    scholars: ["İmam Gazzali", "Raghıb İsfehani", "İbn Miskeveyh", "Maturidi"]
  },
  {
    id: 3,
    title: "Kur'an İlimleri",
    description: "Kur'an'ı anlama ve tefsir etme ilmi",
    topics: ["Tefsir", "Tilâvet", "Esbâb-ı nuzul", "Nâsih-mensuh"],
    importance: "Allah'ın kelâmını doğru anlayıp yaşamak için vazgeçilmezdir.",
    scholars: ["Taberi", "İbn Kesir", "Zemahşeri", "Fahreddin Razi"]
  },
  {
    id: 4,
    title: "Hadis İlmi",
    description: "Hz. Muhammed'in sözleri, fiilleri ve onaylarını anlama ilmi",
    topics: ["İsnad ilmi", "Cerh-ta'dil", "Hadis fıkhı", "Siyer"],
    importance: "İslam'ın ikinci kaynağı olan hadisleri doğru anlamak için gereklidir.",
    scholars: ["Buhari", "Muslim", "İbn Hacer", "Suyuti"]
  }
];

// Anlamlı Sözler
const meaningfulQuotes = [
  {
    id: 1,
    text: "Kalbin en büyük zikri, Allah'ı unutmamaktır.",
    author: "İmam Gazzali",
    category: "Zikir"
  },
  {
    id: 2,
    text: "Sabır, imanın yarısıdır.",
    author: "Hz. Ali",
    category: "Sabır"
  },
  {
    id: 3,
    text: "İlim öğrenin, besinden uzaklarda da olsa.",
    author: "Hz. Muhammed (SAV)",
    category: "İlim"
  },
  {
    id: 4,
    text: "Gönlünde Allah sevgisi olan, dünyada cenneti bulmuştur.",
    author: "Mevlana",
    category: "Aşk"
  },
  {
    id: 5,
    text: "Nefsinizi tanıyın, Rabbinizi tanırsınız.",
    author: "Hz. Ali",
    category: "Marifet"
  },
  {
    id: 6,
    text: "Dünya mümin için hapishane, kafir için cennettir.",
    author: "Hz. Muhammed (SAV)",
    category: "Dünya"
  },
  {
    id: 7,
    text: "Allah'a yakın olmak istersen, O'nun sevdiklerine yakın ol.",
    author: "İmam Gazzali",
    category: "Yakınlık"
  },
  {
    id: 8,
    text: "Tevekküllü olmak, sebepleri bırakmak değil, sonuçları Allah'a bırakmaktır.",
    author: "İbn Teymiye",
    category: "Tevekkül"
  }
];

// Günlük zikir listesi
const dailyAdhkar = [
  { name: "La ilahe illallah", target: 100, current: 0, meaning: "Allah'tan başka ilah yoktur" },
  { name: "Estağfirullah", target: 100, current: 0, meaning: "Allah'tan mağfiret dilerim" },
  { name: "Subhanallah", target: 33, current: 0, meaning: "Allah eksikliklerden münezzehtir" },
  { name: "Elhamdülillah", target: 33, current: 0, meaning: "Hamd Allah'a mahsustur" },
  { name: "Allahu Ekber", target: 34, current: 0, meaning: "Allah en büyüktür" },
  { name: "Salli Ala Muhammed", target: 100, current: 0, meaning: "Muhammed'e salat gönder" },
];

// Rüya Tabiri Veritabanı
const dreamSymbols = {
  // Doğa ve Elementler
  "su": {
    meaning: "Hayat, temizlik, bereket ve maneviyat",
    interpretations: ["Bereket ve bolluk gelecek", "Manevi temizlenme", "Hayırlı değişiklikler", "İlim ve hikmet artışı"],
    context: "Suyun durumu önemlidir: Temiz su hayır, bulanık su sıkıntı işareti olabilir."
  },
  "ateş": {
    meaning: "Güç, arzu, değişim ve bazen tehlike",
    interpretations: ["Güçlü duygular", "Önemli değişiklikler", "Manevi aydınlanma", "Dikkat edilmesi gereken durumlar"],
    context: "Kontrollü ateş hayır, kontrolsüz ateş dikkat gerektirir."
  },
  "rüzgar": {
    meaning: "Değişim, hareket ve Allah'ın rahmeti",
    interpretations: ["Yeni fırsatlar", "Değişim zamanı", "Manevi rehberlik", "Seyahat imkanları"],
    context: "Hafif rüzgar rahmet, fırtına ise zorlukları işaret eder."
  },
  "toprak": {
    meaning: "Bereket, sağlamlık ve maddi kazanç",
    interpretations: ["Maddi kazanç", "Sağlam temeller", "Tarım ve bereket", "Ev bark sahibi olma"],
    context: "Verimli toprak bereket, çorak toprak zorluk işareti."
  },

  // Hayvanlar
  "kedi": {
    meaning: "Kadın, zerafet ve bazen hırsızlık",
    interpretations: ["Ev hanımı ile ilgili durumlar", "Nazik yaklaşımlar", "Dikkatli olmak gerekir", "Samimiyet"],
    context: "Kedinin davranışı önemlidir: Sevimli kedi hayır, saldırgan kedi dikkat."
  },
  "köpek": {
    meaning: "Dostluk, sadakat ve koruma",
    interpretations: ["Sadık dostlar", "Koruyucu çevre", "Güvenlik", "Aile bağları"],
    context: "Köpeğin davranışı belirleyicidir: Dost köpek sadakat, saldırgan köpek düşman."
  },
  "yılan": {
    meaning: "Düşman, gizli tehlike veya büyük değişim",
    interpretations: ["Gizli düşmanlar", "Dikkat edilmesi gerekenler", "Büyük değişimler", "İç savaşlar"],
    context: "Yılanın öldürülmesi düşmana galibiyeti, yaşaması ise devam eden tehdidi işaret eder."
  },
  "kuş": {
    meaning: "Ruh, özgürlük ve mesajlar",
    interpretations: ["Manevi mesajlar", "Özgürleşme", "Yeni haberler", "Ruhsal yükseliş"],
    context: "Kuşun türü önemlidir: Güzel kuşlar müjde, kara kuşlar kötü haber olabilir."
  },
  "aslan": {
    meaning: "Güç, otorite ve liderlik",
    interpretations: ["Liderlik pozisyonu", "Güç ve kudret", "Cesaret", "Saygınlık"],
    context: "Aslanla dostluk güç kazanımı, saldırısı ise güçlü düşmanları işaret eder."
  },

  // İnsanlar ve İlişkiler
  "anne": {
    meaning: "Sevgi, koruma ve manevi destek",
    interpretations: ["Aile bağları güçlenecek", "Manevi destek", "Şifa ve iyileşme", "Bereket ve dua"],
    context: "Annenin durumu rüya sahibinin duygusal haline işaret eder."
  },
  "baba": {
    meaning: "Otorite, rehberlik ve koruma",
    interpretations: ["İş hayatında gelişme", "Rehberlik alacağı kişi", "Koruma altında olma", "Saygınlık"],
    context: "Babanın durumu rüya sahibinin otoriteye yaklaşımını gösterir."
  },
  "çocuk": {
    meaning: "Yeni başlangıçlar, masumiyet ve potansiyel",
    interpretations: ["Yeni projeler", "Temiz kalp", "Gelecek umutları", "Yenilenme"],
    context: "Çocuğun mutluluğu gelecek umutlarını, üzüntüsü ise endişeleri yansıtır."
  },

  // Nesneler ve Durumlar
  "ev": {
    meaning: "Kişinin iç dünyası, güvenlik ve aile",
    interpretations: ["Aile hayatı", "İç huzur", "Güvenlik", "Maddi durum"],
    context: "Evin durumu kişinin ruhsal ve maddi durumunu yansıtır."
  },
  "para": {
    meaning: "Değer, güç ve bazen endişe",
    interpretations: ["Maddi kazanç", "Değer artışı", "Güç elde etme", "Endişeler"],
    context: "Para bulma kazanç, kaybetme ise kayıp anlamına gelir."
  },
  "kitap": {
    meaning: "İlim, hikmet ve manevi rehberlik",
    interpretations: ["İlim öğrenme", "Manevi gelişim", "Yeni bilgiler", "Rehberlik"],
    context: "Kutsal kitap manevi gelişimi, diğer kitaplar genel ilmi işaret eder."
  },
  "elbise": {
    meaning: "Sosyal statü, kişilik ve görünüm",
    interpretations: ["Sosyal konum", "Kişilik değişimi", "İtibar", "Dış görünüş"],
    context: "Güzel elbise itibar artışı, yırtık elbise saygınlık kaybını işaret eder."
  },

  // Renkler
  "beyaz": {
    meaning: "Temizlik, saflık ve iyilik",
    interpretations: ["Temiz kalp", "iyi niyetler", "Barış", "Manevi temizlik"],
    context: "Beyaz renk genellikle olumlu anlam taşır."
  },
  "siyah": {
    meaning: "Gizem, bilinmeyen ve bazen kötülük",
    interpretations: ["Gizli durumlar", "Bilinmeyen faktörler", "Dikkat gerektirir", "Derin düşünceler"],
    context: "Siyah rengin bağlamı önemlidir, her zaman olumsuz değildir."
  },
  "yeşil": {
    meaning: "Bereket, huzur ve İslami değerler",
    interpretations: ["Bereket artışı", "Manevi huzur", "Doğa ile bağ", "İslami gelişim"],
    context: "Yeşil renk genellikle bereket ve huzuru işaret eder."
  },
  "kırmızı": {
    meaning: "Güç, tutku ve bazen tehlike",
    interpretations: ["Güçlü duygular", "Enerji artışı", "Dikkat çekme", "Tutku"],
    context: "Kırmızının tonu ve bağlamı önemlidir."
  }
};

// Rüya tabiri kategorileri
const dreamCategories = [
  "Doğa ve Elementler",
  "Hayvanlar",
  "İnsanlar ve İlişkiler",
  "Nesneler",
  "Renkler",
  "Duygular",
  "Mekânlar",
  "Yiyecek ve İçecek",
  "Dinî Semboller",
  "Sayılar"
];

export default function ManeviPanel() {
  const [activeQuran, setActiveQuran] = useState(0);
  const [dhikrCounts, setDhikrCounts] = useState(dailyAdhkar);
  const [dailyNote, setDailyNote] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hatmProgress, setHatmProgress] = useState(15); // Yüzde olarak hatm ilerlemesi
  const [currentPage, setCurrentPage] = useState(245); // Kur'an'dan hangi sayfada
  const [currentJuz, setCurrentJuz] = useState(1); // Hangi cüz
  const [selectedZodiac, setSelectedZodiac] = useState(null);
  const [userBirthInfo, setUserBirthInfo] = useState({
    name: "",
    motherName: "",
    birthDate: ""
  });
  const [calculatedSign, setCalculatedSign] = useState(null);

  // Dynamic content states
  const [dynamicHadiths, setDynamicHadiths] = useState(hadiths);
  const [dynamicSunnahs, setDynamicSunnahs] = useState(sunnahs);
  const [lastUpdateTime, setLastUpdateTime] = useState(localStorage.getItem('lastUpdateTime') || null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [quranPages, setQuranPages] = useState([
    { page: 1, content: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", sura: "Fatiha", imageUrl: "https://www.quranpages.com/images/pages/page001.jpg" },
    { page: 2, content: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", sura: "Fatiha", imageUrl: "https://www.quranpages.com/images/pages/page002.jpg" },
    { page: 3, content: "الرَّحْمَٰنِ الرَّحِيمِ", sura: "Bakara", imageUrl: "https://www.quranpages.com/images/pages/page003.jpg" },
    { page: 4, content: "مَالِكِ يَوْمِ الدِّينِ", sura: "Bakara", imageUrl: "https://www.quranpages.com/images/pages/page004.jpg" },
    { page: 5, content: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", sura: "Bakara", imageUrl: "https://www.quranpages.com/images/pages/page005.jpg" },
  ]);

  // Real Quran page images (sample URLs - you can replace with actual hosted images)
  const quranPageImages = Array.from({length: 604}, (_, i) => ({
    page: i + 1,
    imageUrl: `https://everyayah.com/data/images_png/${String(i + 1).padStart(3, '0')}.png`,
    alternativeUrl: `https://quran.com/assets/images/pages/page${String(i + 1).padStart(3, '0')}.png`
  }));

  // Dream interpretation states
  const [dreamText, setDreamText] = useState("");
  const [dreamInterpretation, setDreamInterpretation] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dreamHistory, setDreamHistory] = useState([]);

  // Quran page viewer states
  const [showQuranPageModal, setShowQuranPageModal] = useState(false);
  const [currentQuranPageImage, setCurrentQuranPageImage] = useState("");

  // Check for updates on component mount and daily
  useEffect(() => {
    checkForDailyUpdates();

    // Set up interval for checking updates every hour
    const updateInterval = setInterval(checkForDailyUpdates, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(updateInterval);
  }, []);

  const updateDhikr = (index: number, increment: boolean) => {
    setDhikrCounts(prev =>
      prev.map((dhikr, i) =>
        i === index
          ? { ...dhikr, current: Math.max(0, increment ? dhikr.current + 1 : dhikr.current - 1) }
          : dhikr
      )
    );
  };

  const resetDhikr = () => {
    setDhikrCounts(prev => prev.map(dhikr => ({ ...dhikr, current: 0 })));
  };

  const filteredQuotes = meaningfulQuotes.filter(quote => 
    selectedCategory === "all" || quote.category === selectedCategory
  );

  const filteredHadiths = dynamicHadiths.filter(hadith =>
    hadith.translation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hadith.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateZodiacSign = () => {
    if (!userBirthInfo.birthDate) return;

    const birthDate = new Date(userBirthInfo.birthDate);
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();

    let sign = null;

    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) sign = zodiacSigns[0]; // Koç
    else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) sign = zodiacSigns[1]; // Boğa
    else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) sign = zodiacSigns[2]; // İkizler
    else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) sign = zodiacSigns[3]; // Yengeç
    else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) sign = zodiacSigns[4]; // Aslan
    else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) sign = zodiacSigns[5]; // Başak
    else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) sign = zodiacSigns[6]; // Terazi
    else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) sign = zodiacSigns[7]; // Akrep
    else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) sign = zodiacSigns[8]; // Yay
    else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) sign = zodiacSigns[9]; // Oğlak
    else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) sign = zodiacSigns[10]; // Kova
    else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) sign = zodiacSigns[11]; // Balık

    setCalculatedSign(sign);
  };

  const interpretDream = () => {
    if (!dreamText.trim()) return;

    setIsAnalyzing(true);

    // Simulate API call delay
    setTimeout(() => {
      const dreamWords = dreamText.toLowerCase().split(/[\s,.:;!?]+/);
      const foundSymbols = [];
      const interpretations = [];

      // Analyze dream text for known symbols
      dreamWords.forEach(word => {
        if (dreamSymbols[word]) {
          foundSymbols.push({
            symbol: word,
            data: dreamSymbols[word]
          });
          interpretations.push(...dreamSymbols[word].interpretations);
        }
      });

      // Generate comprehensive interpretation
      const interpretation = {
        id: Date.now(),
        dreamText: dreamText,
        date: new Date().toLocaleDateString('tr-TR'),
        foundSymbols: foundSymbols,
        generalInterpretation: foundSymbols.length > 0
          ? `Rüyanızda ${foundSymbols.length} önemli sembol tespit edildi. Bu semboller genel olarak ${foundSymbols.map(s => s.data.meaning).join(', ')} anlamlarına gelebilir.`
          : "Rüyanız detaylı analiz edildi. Her rüya kişinin iç dünyasının bir yansımasıdır ve Allah'ın bir hikmeti olabilir.",
        detailedAnalysis: foundSymbols.length > 0
          ? foundSymbols.map(s => `${s.symbol.toUpperCase()}: ${s.data.meaning} - ${s.data.context}`).join('\n\n')
          : "Rüyanızdaki semboller doğrudan veritabanımızda bulunmamaktadır, ancak genel rüya kurallarına göre değerlendirilebilir.",
        recommendations: [
          "Rüyanızın ardından Allah'a hamd edin",
          "Eğer güzel bir rüyaysa, sevdiklerinizle paylaşabilirsiniz",
          "Kötü rüya görürseniz, üç kez 'euzubillah' deyip sol tarafınıza tükürün",
          "Rüyadan sonra iki rekât namaz kılmak müstehaptır"
        ],
        overallMeaning: interpretations.length > 0
          ? `Bu rüya genel olarak ${(interpretations || []).slice(0,3).join(', ')} gibi durumların işareti olabilir.`
          : "Her rüya Allah'tan bir hikmet barındırır. Güzel rüyalar müjde, kötü rüyalar ise dua etme sebebidir."
      };

      setDreamInterpretation(interpretation);
      setDreamHistory(prev => [interpretation, ...prev]);
      setIsAnalyzing(false);
    }, 2000);
  };

  const showQuranPage = (pageNumber) => {
    const pageImage = quranPageImages[pageNumber - 1];
    setCurrentQuranPageImage(pageImage.imageUrl);
    setShowQuranPageModal(true);
  };

  // Check if daily update is needed
  const checkForDailyUpdates = () => {
    const now = new Date();
    const today = now.toDateString();
    const lastUpdate = lastUpdateTime ? new Date(lastUpdateTime).toDateString() : null;

    if (!lastUpdate || lastUpdate !== today) {
      updateIslamicContent();
    }
  };

  // Fetch updated Islamic content from various sources
  const updateIslamicContent = async () => {
    setIsUpdating(true);
    setUpdateStatus('📡 İslami içerik güncelleniyor...');

    try {
      // Fetch new hadiths from multiple Islamic APIs
      const newHadiths = await fetchNewHadiths();
      const newSunnahs = await fetchNewSunnahs();

      if (newHadiths.length > 0) {
        // Add new hadiths to existing ones, avoiding duplicates
        const combinedHadiths = [...dynamicHadiths];
        newHadiths.forEach(newHadith => {
          if (!combinedHadiths.some(h => h.arabic === newHadith.arabic)) {
            combinedHadiths.push(newHadith);
          }
        });
        setDynamicHadiths(combinedHadiths);
      }

      if (newSunnahs.length > 0) {
        // Add new sunnahs to existing ones, avoiding duplicates
        const combinedSunnahs = [...dynamicSunnahs];
        newSunnahs.forEach(newSunnah => {
          if (!combinedSunnahs.some(s => s.title === newSunnah.title)) {
            combinedSunnahs.push(newSunnah);
          }
        });
        setDynamicSunnahs(combinedSunnahs);
      }

      const updateTime = new Date().toISOString();
      setLastUpdateTime(updateTime);
      localStorage.setItem('lastUpdateTime', updateTime);

      setUpdateStatus(`✅ İçerik güncellendi! ${newHadiths.length} yeni hadis, ${newSunnahs.length} yeni sünnet eklendi.`);

    } catch (error) {
      console.error('Error updating Islamic content:', error);
      setUpdateStatus('⚠️ Güncelleme sırasında hata oluştu. Varsayılan içerik kullanılıyor.');
    } finally {
      setIsUpdating(false);
      // Clear status after 5 seconds
      setTimeout(() => setUpdateStatus(''), 5000);
    }
  };

  // Fetch hadiths from Islamic APIs
  const fetchNewHadiths = async () => {
    const newHadiths = [];

    try {
      // Source 1: Hadith API (example implementation)
      const hadithSources = [
        {
          name: 'Buhari Collection',
          url: 'https://api.hadith.gading.dev/books/bukhari',
          category: 'İbadet'
        },
        {
          name: 'Muslim Collection',
          url: 'https://api.hadith.gading.dev/books/muslim',
          category: 'Ahlak'
        }
      ];

      for (const source of hadithSources) {
        try {
          const response = await fetch(`${source.url}?range=1-5`);
          if (response.ok) {
            const data = await response.json();

            if (data.data && data.data.hadiths) {
              (data.data.hadiths || []).slice(0, 2).forEach((hadith, index) => {
                newHadiths.push({
                  id: Date.now() + index + Math.random(),
                  arabic: hadith.arab || "حديث شريف",
                  translation: hadith.id || "Günlük hadis-i şerif",
                  source: source.name,
                  category: source.category,
                  explanation: `Bu hadis ${source.name} koleksiyonundan alınmış güncel bir hadistir. İslami hayatımızda önemli bir yere sahiptir.`,
                  narrator: "Hz. Sahabi",
                  bookNumber: `${source.name} - Günlük`
                });
              });
            }
          }
        } catch (apiError) {
          console.log(`Error fetching from ${source.name}:`, apiError);
        }
      }

      // If API fails, add some sample daily hadiths
      if (newHadiths.length === 0) {
        const dailyHadiths = [
          {
            id: Date.now() + 1000,
            arabic: "مَا نَقَصَ مَالُ عَبْدٍ مِنْ صَدَقَةٍ",
            translation: "Hiçbir kimsenin malı sadaka vermekle azalmaz.",
            source: "Tirmizi",
            category: "Sadaka",
            explanation: "Bu hadis, sadaka vermenin bereket getireceğini ve malın azalmayacağını öğretir.",
            narrator: "Hz. Ebu Hüreyre (r.a.)",
            bookNumber: "Tirmizi 2325"
          },
          {
            id: Date.now() + 1001,
            arabic: "خَيْرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ",
            translation: "İnsanların en hayırlısı, insanlara en faydalı olanıdır.",
            source: "Taberani",
            category: "Hizmet",
            explanation: "Bu hadis, başkalarına fayda sağlamanın en büyük fazilet olduğunu belirtir.",
            narrator: "Hz. Abdullah bin Ömer (r.a.)",
            bookNumber: "Taberani 13646"
          }
        ];
        newHadiths.push(...dailyHadiths);
      }

    } catch (error) {
      console.error('Error in fetchNewHadiths:', error);
    }

    return newHadiths;
  };

  // Fetch sunnahs from Islamic sources
  const fetchNewSunnahs = async () => {
    const newSunnahs = [];

    try {
      // Add some daily sunnahs (these would come from APIs in real implementation)
      const dailySunnahs = [
        {
          id: Date.now() + 2000,
          title: "Sabah Akşam Ezkarı",
          description: "Her sabah ve akşam belirli duaları okumak",
          time: "Sabah ve akşam vakitlerinde",
          reward: "Günlük korunma ve bereket",
          evidence: "Kim sabah akşam ezkarını okursa, hiçbir şey ona zarar veremez. (Ebu Davud)",
          subcategory: "Günlük Zikir",
          details: [
            "Ayetel Kürsi (3 kez)",
            "İhlas, Felak, Nas (3'er kez)",
            "Sabah akşam duaları",
            "İstiğfar (100 kez)"
          ]
        },
        {
          id: Date.now() + 2001,
          title: "Temizlik ve Hijyen",
          description: "Bedensel ve ruhsal temizliğe önem vermek",
          time: "Günlük yaşamın her anında",
          reward: "Allah'ın sevgisi ve meleklerin duası",
          evidence: "Allah temiz olanları sever. (Tirmizi)",
          subcategory: "Temizlik",
          details: [
            "Düzenli gusül ve abdest",
            "Diş temizliği",
            "Temiz elbise giymek",
            "Çevre temizliği"
          ]
        }
      ];

      newSunnahs.push(...dailySunnahs);

    } catch (error) {
      console.error('Error in fetchNewSunnahs:', error);
    }

    return newSunnahs;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-spiritual-purple rounded-lg flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-spiritual-purple bg-clip-text text-transparent">
                  Kutbul Zaman
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="inline-flex items-center text-primary hover:text-primary/80"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Ana Sayfa
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  localStorage.removeItem("isAuthenticated");
                  localStorage.removeItem("userEmail");
                  window.location.href = "/";
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
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Heart className="w-8 h-8 mr-3 text-primary" />
            Manevi Panel
            {isUpdating && <div className="ml-3 animate-pulse">🔄</div>}
          </h1>
          <p className="text-foreground/60">
            İslami ilimler, Kur'an, hadisler, burç hesaplama ve manevi gelişim için kapsamlı rehberiniz
          </p>
          <div className="mt-2 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">Günlük otomatik güncelleme aktif</span>
            </div>
            {lastUpdateTime && (
              <span className="text-xs text-muted-foreground">
                Son güncelleme: {new Date(lastUpdateTime).toLocaleDateString('tr-TR')}
              </span>
            )}
          </div>
        </div>

        <Tabs defaultValue="quran" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
            <TabsTrigger value="quran" className="flex flex-col items-center p-2">
              <BookOpen className="w-4 h-4 mb-1" />
              <span className="text-xs">Kur'an</span>
            </TabsTrigger>
            <TabsTrigger value="hatm" className="flex flex-col items-center p-2">
              <Star className="w-4 h-4 mb-1" />
              <span className="text-xs">Hatm</span>
            </TabsTrigger>
            <TabsTrigger value="hadith" className="flex flex-col items-center p-2">
              <Quote className="w-4 h-4 mb-1" />
              <span className="text-xs">Hadisler</span>
            </TabsTrigger>
            <TabsTrigger value="sunnah" className="flex flex-col items-center p-2">
              <Heart className="w-4 h-4 mb-1" />
              <span className="text-xs">Sünnetler</span>
            </TabsTrigger>
            <TabsTrigger value="sciences" className="flex flex-col items-center p-2">
              <Lightbulb className="w-4 h-4 mb-1" />
              <span className="text-xs">M. İlimler</span>
            </TabsTrigger>
            <TabsTrigger value="zodiac" className="flex flex-col items-center p-2">
              <Sparkles className="w-4 h-4 mb-1" />
              <span className="text-xs">Burçlar</span>
            </TabsTrigger>
            <TabsTrigger value="dreams" className="flex flex-col items-center p-2">
              <Moon className="w-4 h-4 mb-1" />
              <span className="text-xs">Rüya Tabiri</span>
            </TabsTrigger>
            <TabsTrigger value="dhikr" className="flex flex-col items-center p-2">
              <Volume2 className="w-4 h-4 mb-1" />
              <span className="text-xs">Zikir</span>
            </TabsTrigger>
            <TabsTrigger value="quotes" className="flex flex-col items-center p-2">
              <MessageCircle className="w-4 h-4 mb-1" />
              <span className="text-xs">A. Sözler</span>
            </TabsTrigger>
            <TabsTrigger value="diary" className="flex flex-col items-center p-2">
              <PenTool className="w-4 h-4 mb-1" />
              <span className="text-xs">Günlük</span>
            </TabsTrigger>
          </TabsList>

          {/* Kur'an-ı Kerim Tab */}
          <TabsContent value="quran" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Ahmet el Acemi - Kur'an Cüzleri
                  </CardTitle>
                  <CardDescription>
                    YouTube'dan dinlemek için tıklayın
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-2">
                      {quranJuzList.map((juz) => (
                        <div
                          key={juz.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent border ${
                            currentJuz === juz.id ? 'border-primary bg-primary/10' : 'border-border'
                          }`}
                          onClick={() => {
                            setCurrentJuz(juz.id);
                            window.open(juz.playlistUrl, '_blank');
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium flex items-center gap-2">
                                <Play className="w-4 h-4 text-red-500" />
                                {juz.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {juz.startSura} - {juz.endSura}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="w-3 h-3" />
                                <span className="text-xs text-muted-foreground">{juz.duration}</span>
                              </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Book className="w-5 h-5" />
                    {quranSuras[activeQuran]?.name} Suresi
                  </CardTitle>
                  <CardDescription>
                    {quranSuras[activeQuran]?.meaning} • {quranSuras[activeQuran]?.verses} ayet • {quranSuras[activeQuran]?.type}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-6">
                      <div className="text-right">
                        <h3 className="text-xl font-arabic leading-loose mb-4">
                          {quranSuras[activeQuran]?.content.arabic}
                        </h3>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="font-semibold mb-2">Türkçe Meali:</h4>
                        <p className="text-foreground/80 leading-relaxed">
                          {quranSuras[activeQuran]?.content.translation}
                        </p>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="font-semibold mb-2">Kısa Açıklama:</h4>
                        <p className="text-foreground/70 leading-relaxed">
                          {quranSuras[activeQuran]?.content.commentary}
                        </p>
                      </div>
                      
                      {/* YouTube Video Embed */}
                      <div className="mt-6">
                        <h4 className="font-semibold mb-2">Ahmet el Acemi Tilaveti:</h4>
                        <div className="bg-gray-100 rounded-lg p-4 text-center">
                          <Button
                            onClick={() => window.open(quranJuzList[currentJuz-1]?.playlistUrl, '_blank')}
                            className="w-full"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            YouTube'da {currentJuz}. Cüzü Dinle (Ahmet el Acemi)
                          </Button>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Hatmi Şerif Tab */}
          <TabsContent value="hatm" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Hatm İlerlemesi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">%{hatmProgress}</div>
                    <Progress value={hatmProgress} className="h-3 mb-4" />
                    <p className="text-sm text-muted-foreground">
                      {currentPage} / 604 sayfa tamamlandı
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 border rounded-lg">
                      <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                      <p className="text-lg font-bold">15</p>
                      <p className="text-sm text-muted-foreground">Kalan Gün</p>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <BookOpen className="w-6 h-6 mx-auto mb-2 text-green-500" />
                      <p className="text-lg font-bold">12</p>
                      <p className="text-sm text-muted-foreground">Günlük Sayfa</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="text-base font-bold py-4"
                        onClick={() => {
                          if (currentPage > 1) {
                            setCurrentPage(prev => prev - 1);
                            setHatmProgress(Math.round(((currentPage - 1) / 604) * 100));
                          }
                        }}
                      >
                        <ArrowLeftIcon className="w-5 h-5 mr-2" />
                        ⬅️ Önceki Sayfa
                      </Button>
                      <Button
                        className="text-base font-bold py-4"
                        onClick={() => {
                          setCurrentPage(prev => Math.min(604, prev + 1));
                          setHatmProgress(Math.round(((currentPage + 1) / 604) * 100));
                        }}
                      >
                        Sonraki Sayfa ➡️
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                    <Button variant="outline" className="w-full text-base font-bold py-4">
                      <Download className="w-5 h-5 mr-2" />
                      📋 Hatm Programı İndir
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Kur'an Sayfası Okuyucu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div
                      className="text-center p-6 border rounded-lg bg-gradient-to-br from-green-50 to-blue-50 cursor-pointer hover:bg-gradient-to-br hover:from-green-100 hover:to-blue-100 transition-all duration-300"
                      onClick={() => showQuranPage(currentPage)}
                    >
                      <div className="text-2xl font-arabic leading-loose mb-4">
                        {quranPages[0]?.content}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Sayfa {currentPage} - {quranPages[0]?.sura}
                      </p>
                      <p className="text-xs text-blue-600 font-medium">
                        🖼️ Gerçek Kur'an sayfasını görmek için tıklayın
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-xl font-bold text-primary">Sayfa {currentPage}</p>
                      <p className="text-base text-muted-foreground font-medium">604 sayfadan</p>
                    </div>

                    <Button
                      onClick={() => showQuranPage(currentPage)}
                      className="w-full text-lg font-bold py-6"
                      variant="outline"
                    >
                      <BookOpen className="w-5 h-5 mr-3" />
                      Kur'an Sayfa {currentPage}'yi Görüntüle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Rüya Tabiri Tab */}
          <TabsContent value="dreams" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Moon className="w-5 h-5" />
                    Rüya Tabiriniz
                  </CardTitle>
                  <CardDescription>
                    Rüyanızı detaylı olarak anlatın, size İslami rüya tabiri yapacağız
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="dreamText">Rüyanızı Anlatın</Label>
                    <Textarea
                      id="dreamText"
                      value={dreamText}
                      onChange={(e) => setDreamText(e.target.value)}
                      placeholder="Gördüğünüz rüyayı mümkün olduğunca detaylı şekilde anlatın. Hangi nesneleri, kişileri, hayvanları gördünüz, neler yaşadınız..."
                      className="min-h-[150px]"
                    />
                  </div>

                  <Button
                    onClick={interpretDream}
                    className="w-full text-lg font-bold py-6"
                    disabled={isAnalyzing || !dreamText.trim()}
                  >
                    {isAnalyzing ? (
                      <>
                        <Clock className="w-5 h-5 mr-3 animate-spin" />
                        🔮 Rüya Tabir Ediliyor...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-3" />
                        🌙 Rüyamı Tabir Et
                      </>
                    )}
                  </Button>

                  {dreamInterpretation && (
                    <div className="mt-6 p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-blue-50">
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        Rüya Tabiriniz
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-purple-800 mb-2">Genel Değerlendirme:</h4>
                          <p className="text-sm text-purple-700">{dreamInterpretation.generalInterpretation}</p>
                        </div>

                        {dreamInterpretation.foundSymbols.length > 0 && (
                          <div>
                            <h4 className="font-medium text-purple-800 mb-2">Tespit Edilen Semboller:</h4>
                            <div className="space-y-2">
                              {dreamInterpretation.foundSymbols.map((symbol, index) => (
                                <div key={index} className="bg-white p-3 rounded border">
                                  <h5 className="font-medium text-purple-900 capitalize">{symbol.symbol}</h5>
                                  <p className="text-sm text-gray-700 mt-1">{symbol.data.meaning}</p>
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {symbol.data.interpretations.map((interp, i) => (
                                      <Badge key={i} variant="outline" className="text-xs">
                                        {interp}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <h4 className="font-medium text-purple-800 mb-2">Öneriler:</h4>
                          <ul className="text-sm text-purple-700 space-y-1">
                            {dreamInterpretation.recommendations.map((rec, index) => (
                              <li key={index}>• {rec}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium text-purple-800 mb-2">Genel Anlam:</h4>
                          <p className="text-sm text-purple-700">{dreamInterpretation.overallMeaning}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Archive className="w-5 h-5" />
                    Rüya Tabir Geçmişi
                  </CardTitle>
                  <CardDescription>
                    Daha önce tabir ettiğiniz rüyalarınız
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {dreamHistory.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                          <Moon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>Henüz rüya tabiriniz bulunmuyor.</p>
                        </div>
                      ) : (
                        dreamHistory.map((dream) => (
                          <div key={dream.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-medium text-sm">{dream.date}</p>
                              <Badge variant="outline">
                                {dream.foundSymbols.length} sembol
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {dream.dreamText.length > 100
                                ? dream.dreamText.substring(0, 100) + "..."
                                : dream.dreamText
                              }
                            </p>
                            <p className="text-xs text-blue-600">
                              {dream.overallMeaning}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Rüya Sembolleri Rehberi */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Rüya Sembolleri Rehberi
                </CardTitle>
                <CardDescription>
                  Yaygın rüya sembollerinin anlamları
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(dreamSymbols).map(([symbol, data]) => (
                    <div key={symbol} className="border rounded-lg p-3 hover:bg-accent/50 transition-colors">
                      <h3 className="font-semibold capitalize text-primary mb-1">{symbol}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{data.meaning}</p>
                      <div className="space-y-1">
                        {(data.interpretations || []).slice(0, 2).map((interp, index) => (
                          <p key={index} className="text-xs text-green-600">• {interp}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Burçlar Yıldızname Tab */}
          <TabsContent value="zodiac" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Burç Hesaplayıcı
                  </CardTitle>
                  <CardDescription>
                    İsminiz, anne isminiz ve doğum tarihinizle burç hesaplama
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Adınız</Label>
                    <Input
                      id="name"
                      value={userBirthInfo.name}
                      onChange={(e) => setUserBirthInfo(prev => ({...prev, name: e.target.value}))}
                      placeholder="Adınızı giriniz"
                    />
                  </div>
                  <div>
                    <Label htmlFor="motherName">Anne İsmi</Label>
                    <Input
                      id="motherName"
                      value={userBirthInfo.motherName}
                      onChange={(e) => setUserBirthInfo(prev => ({...prev, motherName: e.target.value}))}
                      placeholder="Anne isminizi giriniz"
                    />
                  </div>
                  <div>
                    <Label htmlFor="birthDate">Doğum Tarihi</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={userBirthInfo.birthDate}
                      onChange={(e) => setUserBirthInfo(prev => ({...prev, birthDate: e.target.value}))}
                    />
                  </div>
                  <Button onClick={calculateZodiacSign} className="w-full text-lg font-bold py-6">
                    <Sparkles className="w-5 h-5 mr-3" />
                    ✨ Burcumu Hesapla
                  </Button>

                  {calculatedSign && (
                    <div className="mt-6 p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-blue-50">
                      <h3 className="font-semibold text-lg mb-2">{calculatedSign.name} Burcu</h3>
                      <p className="text-sm text-muted-foreground mb-2">{calculatedSign.dates}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><strong>Element:</strong> {calculatedSign.element}</div>
                        <div><strong>Gezegen:</strong> {calculatedSign.planet}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Burç Özellikleri</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {zodiacSigns.map((sign) => (
                        <div
                          key={sign.name}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                            selectedZodiac === sign.name ? 'border-primary bg-primary/10' : ''
                          }`}
                          onClick={() => setSelectedZodiac(selectedZodiac === sign.name ? null : sign.name)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold">{sign.name}</h4>
                              <p className="text-sm text-muted-foreground">{sign.dates}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant="secondary">{sign.element}</Badge>
                            </div>
                          </div>
                          
                          {selectedZodiac === sign.name && (
                            <div className="mt-4 space-y-3">
                              <p className="text-sm">{sign.description}</p>
                              
                              <div>
                                <h5 className="font-medium mb-1">Özellikler:</h5>
                                <div className="flex flex-wrap gap-1">
                                  {sign.traits.map((trait, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {trait}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <h5 className="font-medium">Uyumlu Burçlar:</h5>
                                  <p className="text-muted-foreground">{sign.compatibility.join(", ")}</p>
                                </div>
                                <div>
                                  <h5 className="font-medium">Şanslı Sayılar:</h5>
                                  <p className="text-muted-foreground">{sign.luckyNumbers.join(", ")}</p>
                                </div>
                              </div>

                              <div>
                                <h5 className="font-medium">Şanslı Renkler:</h5>
                                <div className="flex gap-2 mt-1">
                                  {sign.luckyColors.map((color, index) => (
                                    <span key={index} className="text-xs px-2 py-1 bg-gray-100 rounded">
                                      {color}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Hadisler Tab */}
          <TabsContent value="hadith" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Quote className="w-5 h-5" />
                  Kapsamlı Hadis Arşivi
                  {isUpdating && <div className="animate-spin ml-2">🔄</div>}
                </CardTitle>
                <CardDescription>
                  Hz. Muhammed (SAV)'in hadisleri ve açıklamaları - Günlük otomatik güncelleme ({dynamicHadiths.length} hadis)
                </CardDescription>
                {updateStatus && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium">{updateStatus}</p>
                  </div>
                )}
                {lastUpdateTime && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Son güncelleme: {new Date(lastUpdateTime).toLocaleDateString('tr-TR')} {new Date(lastUpdateTime).toLocaleTimeString('tr-TR')}
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Hadislerde ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    onClick={updateIslamicContent}
                    disabled={isUpdating}
                    variant="outline"
                    className="font-bold"
                  >
                    {isUpdating ? (
                      <>🔄 Güncelleniyor...</>
                    ) : (
                      <>🔄 Güncelle</>
                    )}
                  </Button>
                </div>

                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {filteredHadiths.map((hadith) => (
                      <Card key={hadith.id} className="border-l-4 border-l-primary">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="text-right">
                              <p className="text-lg font-arabic leading-loose">{hadith.arabic}</p>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{hadith.translation}</p>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex gap-2">
                                <Badge variant="secondary">{hadith.category}</Badge>
                                <Badge variant="outline">{hadith.narrator}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{hadith.source}</p>
                            </div>
                            <div className="bg-accent/50 p-3 rounded-lg">
                              <p className="text-sm text-foreground/80">{hadith.explanation}</p>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <strong>Kaynak:</strong> {hadith.bookNumber}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sünnetler Tab */}
          <TabsContent value="sunnah" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Heart className="w-6 h-6 text-red-500" />
                  Kapsamlı Sünnet Arşivi
                  {isUpdating && <div className="animate-spin ml-2">🔄</div>}
                </CardTitle>
                <CardDescription className="text-base font-medium">
                  Hz. Muhammed (SAV)'in uyguladığı sünnetler - Günlük otomatik güncelleme ({dynamicSunnahs.length} sünnet)
                </CardDescription>
                {updateStatus && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">{updateStatus}</p>
                  </div>
                )}
                {lastUpdateTime && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Son güncelleme: {new Date(lastUpdateTime).toLocaleDateString('tr-TR')} {new Date(lastUpdateTime).toLocaleTimeString('tr-TR')}
                  </div>
                )}
                <div className="mt-4">
                  <Button
                    onClick={updateIslamicContent}
                    disabled={isUpdating}
                    variant="outline"
                    className="font-bold"
                  >
                    {isUpdating ? (
                      <>🔄 Güncelleniyor...</>
                    ) : (
                      <>🔄 İçeriği Yenile</>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {dynamicSunnahs.map((sunnah) => (
                    <Card key={sunnah.id} className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-green-800">{sunnah.title}</h3>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="text-green-600 font-bold text-sm px-3 py-1">
                                ✨ Sünnet
                              </Badge>
                              <Badge variant="secondary" className="text-sm font-medium px-3 py-1">
                                {sunnah.subcategory}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-lg leading-relaxed text-gray-800 font-medium">{sunnah.description}</p>
                          <div className="grid md:grid-cols-2 gap-4 text-base">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                              <span className="font-bold text-blue-700">⏰ Zamanı: </span>
                              <span className="text-blue-800 font-medium">{sunnah.time}</span>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                              <span className="font-bold text-green-700">🎯 Faydası: </span>
                              <span className="text-green-800 font-medium">{sunnah.reward}</span>
                            </div>
                          </div>
                          {sunnah.details && (
                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                              <h4 className="font-bold text-yellow-800 mb-3 text-lg">📋 Detaylar:</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {sunnah.details.map((detail, index) => (
                                  <div key={index} className="text-base bg-white p-3 rounded-lg shadow-sm border">
                                    <span className="font-medium text-gray-800">✓ {detail}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="bg-green-100 p-4 rounded-lg border-2 border-green-300">
                            <p className="text-base text-green-900 leading-relaxed">
                              <strong className="text-lg text-green-800">📖 Delil:</strong>
                              <span className="ml-2 font-medium">{sunnah.evidence}</span>
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manevi İlimler Tab */}
          <TabsContent value="sciences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Manevi İlimler
                </CardTitle>
                <CardDescription>
                  İslami ilimler ve ruhsal gelişim alanları
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {spiritualSciences.map((science) => (
                    <Card key={science.id} className="border-l-4 border-l-purple-500">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-xl font-semibold mb-2">{science.title}</h3>
                            <p className="text-foreground/80">{science.description}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Konular:</h4>
                            <div className="flex flex-wrap gap-2">
                              {science.topics.map((topic, index) => (
                                <Badge key={index} variant="secondary">
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <h4 className="font-medium text-purple-800 mb-2">Önemi:</h4>
                            <p className="text-sm text-purple-700">{science.importance}</p>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Önemli Âlimler:</h4>
                            <div className="flex flex-wrap gap-2">
                              {science.scholars.map((scholar, index) => (
                                <Badge key={index} variant="outline" className="text-purple-600">
                                  {scholar}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Zikir Takibi Tab */}
          <TabsContent value="dhikr" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5" />
                    Günlük Zikir Sayacı
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dhikrCounts.map((dhikr, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{dhikr.name}</p>
                        <p className="text-xs text-muted-foreground">{dhikr.meaning}</p>
                        <Progress
                          value={(dhikr.current / dhikr.target) * 100}
                          className="mt-2"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          {dhikr.current} / {dhikr.target}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateDhikr(index, false)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-12 text-center font-bold">
                          {dhikr.current}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateDhikr(index, true)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <Button onClick={resetDhikr} variant="outline">
                      Sıfırla
                    </Button>
                    <Button>Günlük Tamamla</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Zikir Rehberi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">Zikrin Adabı:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Temiz bir yerde ve abdestli olarak yapın</li>
                      <li>• Kıbleye dönük oturun</li>
                      <li>• Kalbinizle ve zihninizle yapın</li>
                      <li>• Zikrini tesbihle sayın</li>
                      <li>• Düzenli ve istikrarlı devam edin</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Zikir Faydaları:</h4>
                    <div className="grid gap-2">
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="text-sm">Kalp huzuru</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm">Ruhsal yükseliş</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Sevap kazanımı</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Moon className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">İç huzur</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Anlamlı Sözler Tab */}
          <TabsContent value="quotes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Anlamlı Sözler ve Hikmetler
                </CardTitle>
                <CardDescription>
                  İslam büyüklerinden manevi sözler ve hikmetler
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("all")}
                  >
                    Tümü
                  </Button>
                  {Array.from(new Set(meaningfulQuotes.map(q => q.category))).map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>

                <div className="grid gap-4">
                  {filteredQuotes.map((quote) => (
                    <Card key={quote.id} className="border-l-4 border-l-spiritual-gold">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <blockquote className="text-lg font-medium italic">
                            "{quote.text}"
                          </blockquote>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-primary">
                              — {quote.author}
                            </p>
                            <Badge variant="secondary">{quote.category}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manevi Günlük Tab */}
          <TabsContent value="diary" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PenTool className="w-5 h-5" />
                    Bugünkü Manevi Notlarım
                  </CardTitle>
                  <CardDescription>
                    Bugün yaşadığınız manevi deneyimleri kaydedin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Bugün yaptığınız zikirler, okuduğunuz ayetler, yaşadığınız manevi anlar, aldığınız dersler hakkında yazın..."
                    value={dailyNote}
                    onChange={(e) => setDailyNote(e.target.value)}
                    className="min-h-[200px]"
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Bugünkü Ruh Halim</Label>
                      <select className="w-full mt-1 p-2 border rounded-md">
                        <option value="">Seçiniz</option>
                        <option value="huzurlu">Huzurlu</option>
                        <option value="mutlu">Mutlu</option>
                        <option value="düşünceli">Düşünceli</option>
                        <option value="müteşekkir">Müteşekkir</option>
                        <option value="umutlu">Umutlu</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Manevi Hedefim</Label>
                      <select className="w-full mt-1 p-2 border rounded-md">
                        <option value="">Seçiniz</option>
                        <option value="zikir">Daha çok zikir</option>
                        <option value="sabir">Sabırlı olmak</option>
                        <option value="şükür">Şükretmek</option>
                        <option value="tevekkel">Tevekkül</option>
                        <option value="ihlas">İhlas</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Kaydet
                    </Button>
                    <Button variant="outline">
                      <Bookmark className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Archive className="w-5 h-5" />
                    Geçmiş Kayıtlarım
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium">15 Aralık 2024</p>
                          <Badge variant="outline">Huzurlu</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Bugün sabah namazında çok huzur buldum. Fatiha suresini okurken kalbimde tarif edilemez bir...
                        </p>
                      </div>
                      
                      <div className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium">14 Aralık 2024</p>
                          <Badge variant="outline">Müteşekkir</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Allah'ın bana verdiği nimetleri düşündüm. Sağlık, aile, iman... Ne kadar şükretmeli...
                        </p>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium">13 Aralık 2024</p>
                          <Badge variant="outline">Düşünceli</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Nefis terbiyesi konusunda okudukların çok etkiledi. Sabır ve şükür konularında kendimi...
                        </p>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium">12 Aralık 2024</p>
                          <Badge variant="outline">Umutlu</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Zikir sayımı düzenli tutmaya başladım. Her geçen gün kalbimde daha fazla nur hissediyorum...
                        </p>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Quran Page Modal */}
      <Dialog open={showQuranPageModal} onOpenChange={setShowQuranPageModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              📖 Kur'an-ı Kerim - Sayfa {currentPage}
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Mushaf-ı Şerif {currentPage}. sayfa
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-center bg-green-50 p-4 rounded-lg">
              <p className="text-green-800 font-medium">
                📋 Hatm İlerlemesi: %{hatmProgress} tamamlandı
              </p>
            </div>

            <div className="text-center">
              {currentQuranPageImage ? (
                <div className="relative">
                  <img
                    src={currentQuranPageImage}
                    alt={`Kur'an Sayfa ${currentPage}`}
                    className="max-w-full h-auto rounded-lg border-2 border-green-300 shadow-lg"
                    onError={(e) => {
                      // Fallback to alternative source or placeholder
                      (e.target as HTMLImageElement).src = `https://quran.com/assets/images/pages/page${String(currentPage).padStart(3, '0')}.png`;
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-3 py-1 rounded-full">
                    <span className="text-sm font-bold text-green-800">Sayfa {currentPage}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 p-12 rounded-lg border-2 border-dashed">
                  <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 font-medium">Sayfa yükleniyor...</p>
                </div>
              )}
            </div>

            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                className="text-base font-bold"
                onClick={() => {
                  if (currentPage > 1) {
                    setCurrentPage(prev => prev - 1);
                    setHatmProgress(Math.round(((currentPage - 1) / 604) * 100));
                    showQuranPage(currentPage - 1);
                  }
                }}
                disabled={currentPage <= 1}
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                ⬅️ Önceki Sayfa
              </Button>

              <Button
                className="text-base font-bold"
                onClick={() => {
                  setCurrentPage(prev => Math.min(604, prev + 1));
                  setHatmProgress(Math.round(((currentPage + 1) / 604) * 100));
                  showQuranPage(currentPage + 1);
                }}
                disabled={currentPage >= 604}
              >
                Sonraki Sayfa ➡️
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Sayfa {currentPage} / 604 • Hatm İlerlemesi: %{hatmProgress}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
