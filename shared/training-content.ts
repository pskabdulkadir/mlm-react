export interface TrainingPage {
  id: number;
  title: string;
  content: string;
  verses?: Array<{
    arabic: string;
    turkish: string;
    source: string;
  }>;
  hadiths?: Array<{
    arabic?: string;
    turkish: string;
    source: string;
  }>;
  keyPoints?: string[];
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  totalPages: number;
  estimatedTime: string;
  pages: TrainingPage[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const sadakaTrainingContent: TrainingModule = {
  id: "sadaka-training",
  title: "Sadaka ve Hayır İşleri Eğitimi",
  description: "İslam'da sadaka, zekat ve hayır işlerinin kapsamlı öğretimi - Kuran ayetleri, hadisler ve sünnet uygulamaları",
  totalPages: 30,
  estimatedTime: "45 dakika",
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  pages: [
    {
      id: 1,
      title: "Sadakanın Önemi ve Tanımı",
      content: `
Sadaka, İslam dininin en temel ibadetlerinden biridir. Kelime anlamı olarak "doğruluk" ve "samimiyeti" ifade eden sadaka, maddi ve manevi yardımlaşmanın en güzel örneklerinden biridir.

İslam'da sadaka, yalnızca maddi yardım değil, aynı zamanda güzel söz, gülümseme, yol göstermek gibi manevi destekleri de kapsar. Her türlü iyilik ve yardım sadaka kapsamında değerlendirilir.

Sadakanın temel amacı:
- Toplumsal dayanışmayı güçlendirmek
- Yoksullukla mücadele etmek  
- Kalpleri Allah'a yaklaştırmak
- Nefsi tezkiye etmek
- Sosyal adaleti sağlamak
      `,
      verses: [
        {
          arabic: "مَنْ ذَا الَّذِي يُقْرِضُ اللَّهَ قَرْضًا حَسَنًا فَيُضَاعِفَهُ لَهُ أَضْعَافًا كَثِيرَةً",
          turkish: "Allah'a güzel bir borç verecek kimdir ki Allah da ona kat kat fazlasıyla versin?",
          source: "Bakara Suresi, 245. Ayet"
        }
      ],
      keyPoints: [
        "Sadaka, gönülden ve samimiyetle verilmelidir",
        "Maddi imkanlar kadar manevi destek de önemlidir",
        "Her iyilik sadaka değerindedir",
        "Toplumsal dayanışmanın temeli sadakadır"
      ]
    },
    {
      id: 2,
      title: "Kuran-ı Kerim'de Sadaka",
      content: `
Kuran-ı Kerim'de sadaka konusu birçok ayette ele alınmıştır. Allah Teala, sadaka verenleri övmüş ve onlara büyük sevaplar vadetmiştir.

Sadaka veren kişiler, Allah'ın rızasını kazanmış ve ahirette büyük mükafatlara nail olacak kimselerdir. Kuran-ı Kerim'de sadakanın fazileti ve önemi defalarca vurgulanmıştır.

İnfak ve sadaka ayetleri, Müslümanları sürekli olarak yardımlaşma ve dayanışmaya teşvik eder. Bu ayetler, imanın gereği olarak maddi paylaşımın önemini ortaya koyar.
      `,
      verses: [
        {
          arabic: "وَمَا أَنفَقْتُم مِّن شَيْءٍ فَهُوَ يُخْلِفُهُ وَهُوَ خَيْرُ الرَّازِقِينَ",
          turkish: "Her ne infak ederseniz, Allah onun yerine başkasını verir. O, rızık verenlerin en hayırlısıdır.",
          source: "Sebe Suresi, 39. Ayet"
        },
        {
          arabic: "مَثَلُ الَّذِينَ يُنْفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنْبَتَتْ سَبْعَ سَنَابِلَ فِي كُلِّ سُنْبُلَةٍ مِائَةُ حَبَّةٍ",
          turkish: "Allah yolunda mallarını infak edenlerin misali, yedi başak bitiren bir tane gibidir ki her başakta yüz tane vardır.",
          source: "Bakara Suresi, 261. Ayet"
        }
      ],
      keyPoints: [
        "Allah, verilen sadakanın yerine daha fazlasını verir",
        "Sadaka 700 kat sevaba vesile olur",
        "İnfak edilen mal asla eksilmez, artar",
        "Sadaka, Allah'ın rızasını kazanmanın yoludur"
      ]
    },
    {
      id: 3,
      title: "Hadis-i Şeriflerde Sadaka",
      content: `
Peygamber Efendimiz (s.a.v), sadakanın önemini birçok hadis-i şerifinde vurgulamıştır. Bu hadisler, sadakanın hem dünya hem ahiret hayatında insana kazandırdığı faydaları açıklamaktadır.

Hadislerde sadakanın, hastalığı iyileştirdiği, bela ve musibetleri def ettiği, ömrü uzattığı ve rızkı artırdığı belirtilmektedir.

Rasulullah (s.a.v), en küçük iyilikten büyük sevaplar elde edilebileceğini öğretmiş ve herkesi imkanları ölçüsünde sadaka vermeye teşvik etmiştir.
      `,
      hadiths: [
        {
          turkish: "Sadaka ölenin üzerindeki ateşi söndürür, tıpkı suyun ateşi söndürdüğü gibi.",
          source: "Tirmizi, Zekat, 26"
        },
        {
          turkish: "Sadaka veren el, sadaka alan elden üstündür.",
          source: "Buhari, Zekat, 18"
        },
        {
          turkish: "Her iyilik sadakadır. Kardeşinin yüzüne güler yüzle bakman da sadakadır.",
          source: "Müslim, Zekat, 56"
        },
        {
          turkish: "İki hurma tanesi de olsa ateşe karşı kendinizi koruyun.",
          source: "Buhari, Zekat, 10"
        }
      ],
      keyPoints: [
        "En küçük iyilik bile değerlidir",
        "Güleryüz de sadaka sayılır",
        "Sadaka veren el, alan elden üstündür",
        "Sadaka cehennem ateşinden korur"
      ]
    },
    {
      id: 4,
      title: "Sadakanın Çeşitleri",
      content: `
İslam'da sadaka çok geniş bir kavramdır ve birçok türü vardır. Maddi sadakalar kadar manevi sadakalar da büyük önem taşır.

Maddi Sadakalar:
- Para ve mal yardımı
- Yiyecek ve giyecek yardımı  
- Barınma desteği
- İş imkanı sağlama
- Borç verme (karz-ı hasen)

Manevi Sadakalar:
- Güzel söz söyleme
- Gülümseme
- Selam verme
- Dua etme
- İlim öğretme
- Yol göstermek
- Hastaları ziyaret etme
- Acılıları teselli etme

Her Müslüman, imkanları ne olursa olsun bir şekilde sadaka verebilir.
      `,
      hadiths: [
        {
          turkish: "Tebessümün kardeşinin yüzüne sadakadır.",
          source: "Tirmizi, Birr, 36"
        },
        {
          turkish: "Her gün güneş doğduğunda insanların her eklemi için bir sadaka gerekir.",
          source: "Buhari, Zekat, 19"
        }
      ],
      keyPoints: [
        "Sadakanın maddi ve manevi türleri vardır",
        "Her Müslüman imkanına göre sadaka verebilir",
        "En basit iyilik bile sadaka sayılır",
        "Günlük hayattaki her iyilik sevap kazandırır"
      ]
    },
    {
      id: 5,
      title: "Sadaka Vermenin Adabı",
      content: `
Sadaka verirken uyulması gereken adap ve erkân vardır. Bu adaba uygun davranmak, sadakanın karşılığını tam olarak alabilmek için gereklidir.

Sadaka Verirken Dikkat Edilecekler:
- İhlas ile, yalnızca Allah rızası için verilmeli
- Sağ elin verdiğini sol el bilmemeli (gizli verilmeli)
- Karşı tarafa minnet edilmemeli
- Küçümsenmemeli, beğenilmemeli
- Temiz ve helal maldan verilmeli
- Gönül hoşluğu ile verilmeli
- Riya (gösteriş) yapılmamalı

Sadaka alırken de tevazu ve şükür içinde olmak gerekir. Sadaka alan kişi de bu nimetten dolayı Allah'a şükretmelidir.
      `,
      verses: [
        {
          arabic: "الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ ثُمَّ لَا يُتْبِعُونَ مَا أَنفَقُوا مَنًّا وَلَا أَذًى",
          turkish: "Allah yolunda mallarını infak edenler, sonra da verdiklerinin arkasından minnet etmez ve gönül kırmazlar.",
          source: "Bakara Suresi, 262. Ayet"
        }
      ],
      keyPoints: [
        "Sadaka gizli verilmesi daha sevaptır",
        "Minnet edilmemeli ve gönül kırılmamalı",
        "İhlas ile yalnızca Allah rızası için verilmeli",
        "Temiz ve helal maldan sadaka verilmeli"
      ]
    },
    {
      id: 6,
      title: "Zekat ve Sadaka Arasındaki Fark",
      content: `
Zekat ve sadaka her ikisi de İslam'ın temel ibadetleri olmakla birlikte, aralarında önemli farklar vardır.

ZEKAT:
- Belirli mallar için farzdır
- Nisap miktarına ulaşan mallarda verilir
- Belirli oranları vardır (%2.5, %10, %20)
- Yılda bir kez verilir
- Belirli kişilere verilir (8 sınıf)
- Terk edilmesi günahtır

SADAKA:
- Hiç bir şart yoktur, nafile ibadetdir
- Her miktarda verilebilir
- Herkeye verilebilir
- Her zaman verilebilir
- Terk edilmesi günah değildir
- Manevi sadakalar da vardır

Zekat, İslam'ın şartlarından biri iken sadaka ise nafile bir ibadettir. Her ikisi de toplumsal dayanışma için çok önemlidir.
      `,
      keyPoints: [
        "Zekat farz, sadaka nafiledir",
        "Zekatın belirli şartları ve oranları vardır",
        "Sadaka her zaman, her miktarda verilebilir",
        "Her ikisi de toplumsal adaletsizliği önler"
      ]
    },
    {
      id: 7,
      title: "Sadakanın Dünyevi Faydaları",
      content: `
Sadaka, yalnızca ahiret için değil, dünya hayatında da pek çok fayda sağlar. Bu faydalar hem maddi hem de manevi alanlarda kendini gösterir.

Maddi Faydalar:
- Rızkın artması ve bereketin gelmesi
- Malın korunması ve çoğalması  
- Ticari başarının artması
- Bela ve musibetlerden korunma
- Hastalıklardan şifa bulma

Manevi Faydalar:
- Kalbin temizlenmesi
- Nefsin tezkiyesi
- Cömertlik ve paylaşım duygusunun gelişmesi
- Toplumsal statünün yükselmesi
- İç huzurun artması
- Allah'a yakınlaşma

Sadaka, kişiyi hem maddi hem manevi olarak zenginleştirir ve hayat kalitesini artırır.
      `,
      hadiths: [
        {
          turkish: "Sadaka malı eksiltmez. Allah, sadaka sebebiyle kulunu yüceltir ve tevazu gösterene de şeref verir.",
          source: "Müslim, Birr, 69"
        },
        {
          turkish: "Sadaka verenin eli üsttedir.",
          source: "Buhari, Zekat, 18"
        }
      ],
      keyPoints: [
        "Sadaka rızkı artırır, azaltmaz",
        "Maddi ve manevi bereket getirir",
        "Hastalık ve belalardan korur",
        "Kalbi temizler ve nefsi arındırır"
      ]
    },
    {
      id: 8,
      title: "Sadakanın Uhrevi Mükafatları",
      content: `
Sadakanın en büyük karşılığı ahiret hayatındadır. Allah Teala, sadaka verenlere ahirette büyük mükafatlar vaat etmiştir.

Ahiretteki Mükafatlar:
- Cennet'e girmek
- Allah'ın rızasını kazanmak
- Günahların affedilmesi
- Derecenin yükseltilmesi
- Hesabın kolaylaştırılması
- Sırat köprüsünden hızla geçmek
- Arş'ın gölgesinde gölgelenmek

Kıyamet gününde sadaka, kişi ile cehennem arasında bir perde olacak ve onu koruyacaktır. Sadaka veren kimse, verdiği miktarın 700 katına kadar sevap alacaktır.

Her sadaka, ahirette kişiyi bekleyen hazineler arasında yerini alır ve ebedi mutluluğun kapılarını açar.
      `,
      verses: [
        {
          arabic: "وَاللَّهُ يُضَاعِفُ لِمَن يَشَاءُ وَاللَّهُ وَاسِعٌ عَلِيمٌ",
          turkish: "Allah dilediği kimsenin sevabını kat kat artırır. Allah'ın lütfu geniştir, her şeyi bilendir.",
          source: "Bakara Suresi, 261. Ayet"
        }
      ],
      keyPoints: [
        "Cennet'e girmenin sebeplerinden biridir",
        "700 kata kadar sevap kazandırır",
        "Günahları örter ve affettirir",
        "Hesabı kolaylaştırır"
      ]
    },
    {
      id: 9,
      title: "Sadaka-i Cariye",
      content: `
Sadaka-i cariye, ölen kişinin vefatından sonra da sevabının devam ettiği sadaka türüdür. Bu sadakalar, kişinin ölümünden sonra da hayır işlemeye devam ettiği için büyük öneme sahiptir.

Sadaka-i Cariye Örnekleri:
- Mescit, medrese, hastane yapımı
- Su kuyusu açtırma
- Yol yapımı
- Köprü inşaatı
- Ağaç dikme
- Kitap bastırma ve dağıtma
- İlim öğretme
- Salih evlat yetiştirme

Bu tür sadakalar, kişinin vefatından sonra da faydalanıldığı sürece sevabı devam eder. Bu nedenle Müslümanlar, hayattayken böyle kalıcı hayır işleri yapmaya özen göstermelidir.

Özellikle eğitim alanındaki yatırımlar, nesiller boyu fayda sağladığı için en değerli sadaka-i cariye örnekleridir.
      `,
      hadiths: [
        {
          turkish: "İnsan öldüğü zaman, üç şey dışında bütün amelleri kesilir: Sadaka-i cariye, faydalanılan ilim ve kendisi için dua eden salih evlat.",
          source: "Müslim, Vasiyye, 14"
        }
      ],
      keyPoints: [
        "Ölümden sonra da sevabı devam eder",
        "Kalıcı hayır işleri yapılmalı",
        "Eğitim yatırımları çok değerlidir",
        "Topluma kalıcı fayda sağlamalı"
      ]
    },
    {
      id: 10,
      title: "Gizli Sadaka",
      content: `
İslam'da gizli sadaka, açık sadakadan daha faziletli kabul edilir. Gizli verilen sadaka, riya (gösteriş) riskini ortadan kaldırır ve ihlası sağlar.

Gizli Sadakanın Faziletleri:
- Allah'ın özel rahmeti
- Meleklerin duası
- Günahların silinmesi
- Kıyamette gölgelenme
- İhlasın korunması
- Riyadan uzak kalma
- Alıcının mahcup olmaması

"Sağ elin verdiğini sol elin bilmemesi" ilkesi, gizli sadakanın ne kadar önemli olduğunu gösterir. Sadaka verenin ismi bile gizli kalmalı, karşı taraf kimden aldığını bilmemelidir.

Ancak başkalarını teşvik etmek ve örnek olmak için bazen açık sadaka da verilebilir. Önemli olan niyetin ihlaslı olmasıdır.
      `,
      hadiths: [
        {
          turkish: "Gizli sadaka, Allah'ın gazabını söndürür.",
          source: "Taberani, Kebir, 7846"
        },
        {
          turkish: "Kıyamet günü Allah'ın arşının altında gölgelenecek yedi çeşit insan vardır. Bunlardan biri de: Gizli sadaka veren, öyle ki sağ eli verdiğini sol eli bilmez.",
          source: "Buhari, Zekat, 16"
        }
      ],
      keyPoints: [
        "Gizli sadaka daha faziletlidir",
        "Riyadan korur ve ihlası sağlar",
        "Allah'ın özel merhametini kazandırır",
        "Kıyamette gölgelenme sebebidir"
      ]
    },
    {
      id: 11,
      title: "Sadakada İhlas",
      content: `
Sadakada en önemli unsur ihlastır. İhlas olmadan verilen sadaka, gerçek anlamda sadaka sayılmaz ve tam sevabını vermez.

İhlaslı Sadakanın Özellikleri:
- Yalnızca Allah rızası için verilir
- Karşılık beklenmez
- Gösteriş yapılmaz
- Minnet edilmez
- Gönül hoşluğu ile verilir
- Temiz maldan verilir
- Gizli tercih edilir

İhlassız sadakanın sakıncaları:
- Sevabı azalır veya hiç olmaz
- Riya günahı işlenmiş olur
- Amel boşa gider
- Allah'ın gazabını çeker

Sadaka verirken kalben "Bu sadaka yalnızca Allah rızası içindir" diye niyet etmek gerekir. Bu niyet, sadakanın kabulü için şarttır.
      `,
      verses: [
        {
          arabic: "وَمَا آتَيْتُم مِّن زَكَاةٍ تُرِيدُونَ وَجْهَ اللَّهِ فَأُولَٰئِكَ هُمُ الْمُضْعِفُونَ",
          turkish: "Allah'ın rızasını dileyerek verdiğiniz zekat (sadaka), işte onlar (sevapları) kat kat artırılanlardır.",
          source: "Rum Suresi, 39. Ayet"
        }
      ],
      keyPoints: [
        "İhlas sadakanın temel şartıdır",
        "Yalnızca Allah rızası için verilmeli",
        "Riya ve gösteriş sadakayı boşa çıkarır",
        "Niyet sadakanın kabulünde belirleyicidir"
      ]
    },
    {
      id: 12,
      title: "Peygamberimizin Sadaka Örnekleri",
      content: `
Hz. Peygamber (s.a.v), sadaka konusunda en güzel örnekleri vermiştir. O'nun hayatı, cömertlik ve paylaşımla doludur.

Peygamberimizin Sadaka Örnekleri:
- Malının tamamını infak etmesi
- Açları doyurması
- Yetime sahip çıkması
- Borçluların borcunu ödemesi
- Köleleri azat etmesi
- Misafirleri ağırlaması
- Hastalara bakması
- Fakirlere yardım etmesi

Hz. Aişe (r.a) şöyle anlatır: "Peygamber Efendimiz hiçbir zaman üç gün üst üste tok yatmadı. Elinde bir şey olsa hemen ihtiyaç sahiplerine verirdi."

Hz. Ali (r.a) der ki: "Rasulullah, vermek istediği şeyi vermezse rahat edemezdi. Sanki o mal kendisine değil, başkalarına aitmişçesine davranırdı."
      `,
      hadiths: [
        {
          turkish: "Allah Rasulü, hiç kimseyi eli boş çevirmezdi.",
          source: "Tirmizi, Şemail, 347"
        },
        {
          turkish: "Peygamber (s.a.v), insanların en cömerdi idi. Ramazan'da Cebrail ile karşılaştığında ise sanki rüzgar gibi iyilik saçardı.",
          source: "Buhari, Bed'ül Vahy, 6"
        }
      ],
      keyPoints: [
        "Peygamberimiz cömertlikte örnek idi",
        "Hiç kimseyi eli boş çevirmezdi",
        "Malını Allah yolunda infak ederdi",
        "Her zaman yardımsever davranırdı"
      ]
    },
    {
      id: 13,
      title: "Sahabe ve Sadaka",
      content: `
Sahabe-i kiram, Peygamberimizden öğrendikleri cömertlik ve sadaka konusunda eşsiz örnekler vermişlerdir.

Hz. Ebu Bekir (r.a):
Bir gün evinin tüm malını getirip Rasulullah'a verdi. Rasulullah "Ailene ne bıraktın?" diye sordu. "Allah ve Rasulü'nü bıraktım" dedi.

Hz. Ömer (r.a):
Malının yarısını Allah yolunda harcardı. Peygamberimiz "Bu gün Ebu Bekir'i geçebilir miyim?" diye düşünür ama hep Ebu Bekir'in gerisinde kalırdı.

Hz. Osman (r.a):
Tebük seferinde ordunun tüm masrafını karşıladı. Bir kuyuyu satın alıp halkın kullanımına açtı.

Hz. Ali (r.a):
Son hurmasını sadaka olarak verdi. Eşi Hz. Fatıma ile birlikte açlığa rağmen sadaka vermeye devam etti.

Bu örnekler, sadakanın samimi Müslümanlar için ne kadar önemli olduğunu gösterir.
      `,
      keyPoints: [
        "Sahabe cömertlikte birbirleriyle yarıştı",
        "Mallarının tamamını Allah yolunda harcadılar",
        "Açlığa rağmen başkalarını düşündüler",
        "Sadakada sınır tanımadılar"
      ]
    },
    {
      id: 14,
      title: "Sadaka ve Sosyal Adalet",
      content: `
İslam'da sadaka, sosyal adaleti sağlamanın en önemli araçlarından biridir. Toplumda zengin ve fakir arasındaki uçurumu kapatır.

Sosyal Adaletteki Rolü:
- Gelir adaletsizliğini azaltır
- Yoksullukla mücadele eder
- Toplumsal huzuru sağlar
- Zengin-fakir çatışmasını önler
- Kardeşlik duygusunu güçlendirir
- Ekonomik dengeleri korur

İslam toplumunda sadaka sistemi:
- Zenginlerin sorumluluklarını hatırlatır
- Fakirlerin haklarını korur
- Toplumsal dayanışmayı güçlendirir
- Ekonomik krizleri önler
- Sosyal barışı sağlar

Sadaka, toplumun tüm bireylerinin insan onuruna yakışır bir yaşam sürmesini sağlar. Bu, İslam'ın sosyal adalet anlayışının temelidir.
      `,
      keyPoints: [
        "Sosyal adaleti sağlar",
        "Gelir uçurumunu kapatır",
        "Toplumsal huzur getirir",
        "Ekonomik dengeyi korur"
      ]
    },
    {
      id: 15,
      title: "Modern Zamanda Sadaka",
      content: `
Günümüzde sadaka, geleneksel yöntemlerin yanı sıra modern araçlarla da verilebilir. Teknoloji, sadaka vermeyi kolaylaştırmış ve yaygınlaştırmıştır.

Modern Sadaka Yöntemleri:
- Online bağış platformları
- Mobil uygulamalar
- Otomatik ödeme sistemleri
- Kripto para bağışları
- Sosyal medya kampanyaları
- QR kod ile bağış
- Kredi kartı ile sadaka

Yeni Sadaka Alanları:
- Eğitim bursları
- Sağlık hizmetleri
- Çevre projeleri
- Teknoloji erişimi
- Afet yardımları
- Mülteci desteği
- Yaşlı bakımı

Modern zamanda sadaka verirken de İslam'ın adap ve erkânına uygun hareket etmek gerekir. Teknoloji bir araçtır, asıl olan niyettir.
      `,
      keyPoints: [
        "Teknoloji sadakayı kolaylaştırır",
        "Online platformlar yaygın kullanılır",
        "Yeni sadaka alanları ortaya çıkar",
        "İslami adaplara uygun hareket edilmeli"
      ]
    },
    {
      id: 16,
      title: "Sadakada Süreklilik",
      content: `
İslam'da sadaka, tek seferlik değil sürekli yapılması gereken bir ibadettir. Düzenli sadaka, hem dünya hem ahiret açısından daha faydalıdır.

Sürekli Sadakanın Faydaları:
- Alışkanlık haline gelir
- Maddi disiplin sağlar
- Düzenli sevap kazanımı
- Topluma sürekli fayda
- Nefsin eğitimi
- Cömertlik karakteri
- Bereketin devamı

Süreklilik İlkeleri:
- Küçük miktarlarla başlama
- Düzenli aralıklarla verme
- Bütçeyi zorlamama
- Aile ihtiyaçlarını gözetme
- İmkanlara göre artırma

Peygamberimiz buyurmuştur: "Allah katında en sevimli amel, az da olsa devamlı yapılandır." Bu hadis, sürekli sadakanın önemini vurgular.
      `,
      hadiths: [
        {
          turkish: "Allah katında en sevimli amel, az da olsa devamlı olanıdır.",
          source: "Buhari, Rikak, 18"
        }
      ],
      keyPoints: [
        "Süreklilik tek seferden daha değerlidir",
        "Düzenli sadaka alışkanlık olmalı",
        "Küçük miktarlar bile değerlidir",
        "Devamlılık Allah katında sevilir"
      ]
    },
    {
      id: 17,
      title: "Aile İçinde Sadaka",
      content: `
İslam'da sadakanın en faziletli olanı, yakın akrabaya verilendir. Aile fertlerine yardım etmek, hem sadaka hem de sıla-i rahim sevabı kazandırır.

Aile İçi Sadaka Öncelikleri:
1. Eş ve çocuklar
2. Anne ve baba
3. Kardeşler
4. Yakın akrabalar
5. Uzak akrabalar
6. Komşular
7. Diğer ihtiyaç sahipleri

Bu sıralama, sadakanın öncelik sırasını gösterir. Kişi önce ailesinin ihtiyaçlarını karşılamalı, sonra başkalarına yardım etmelidir.

Aile içi sadakanın faziletleri:
- Çifte sevap (sadaka + sıla-i rahim)
- Aile bağlarının güçlenmesi
- Karşılıklı sevgi ve saygının artması
- Toplumsal düzenin korunması

Ancak sadaka verirken aile fertleri arasında adaletsizlik yapılmamalı, herkese ihtiyacı kadar destek verilmelidir.
      `,
      hadiths: [
        {
          turkish: "Yakın akrabaya verilen sadaka iki sevaptır: Sadaka sevabı ve sıla-i rahim sevabı.",
          source: "Tirmizi, Zekat, 42"
        }
      ],
      keyPoints: [
        "Yakın akrabaya öncelik verilir",
        "Çifte sevap kazandırır",
        "Aile bağlarını güçlendirir",
        "Adaletli davranılmalı"
      ]
    },
    {
      id: 18,
      title: "Sadaka ve Dua",
      content: `
Sadaka ile dua arasında güçlü bir bağ vardır. Sadaka veren kişinin duaları daha çabuk kabul olur ve sadaka verilen kişiler de sadaka veren için dua eder.

Sadakanın Duaya Etkisi:
- Dua kapılarını açar
- Kabul edilme ihtimalini artırır
- Meleklerin duasını kazandırır
- Kalbi temizler ve duayı samimi kılar
- Günahları siler, dua engellerini kaldırır

Sadaka Verirken Edilecek Dualar:
- "Allahım, bu sadakayı kabul eyle"
- "Sadaka verdiğim kardeşimi mübareşli kıl"
- "Bu sadakayı bizim için hayır eyle"
- "Günahlarımızı affet, bereketimizi artır"

Sadaka Alan Kişinin Duaları:
- Sadaka veren için hayır duası
- Bereket duası
- Sağlık duası
- Allah'ın rızasını kazanma duası

Bu karşılıklı dua ilişkisi, toplumsal dayanışmayı güçlendirir ve herkesi birbirinin iyiliğini istemesve sağlar.
      `,
      keyPoints: [
        "Sadaka duanın kabulünü kolaylaştırır",
        "Karşılıklı dua ilişkisi oluşur",
        "Meleklerin duasını kazandırır",
        "Kalbi temizler ve duayı samimi kılar"
      ]
    },
    {
      id: 19,
      title: "Sadakada Zaman ve Mekan",
      content: `
İslam'da sadaka her zaman verilebilir, ancak bazı zaman ve mekanlar daha faziletlidir. Bu özel zamanlarda verilen sadakalar daha çok sevap kazandırır.

Faziletli Zamanlar:
- Ramazan ayı
- Cuma günleri
- Kandil geceleri
- Arefe günü
- İlk 10 gün (Zilhicce)
- Sabah ve akşam vakitleri
- Zor zamanlar (hastalık, sıkıntı)

Faziletli Mekanlar:
- Mescit-i Haram (Kabe)
- Mescit-i Nebevi (Medine)
- Mescit-i Aksa (Kudüs)
- Cuma namazı kılınan camiler
- Kabristan ziyaretlerinde
- Hastalara yardım mekanları

Özel durumlarda sadaka:
- Duanın kabul olması için
- Hastalıktan şifa için
- Sıkıntıdan kurtulmak için
- Bereketli rızık için
- Günahların affı için

Bu zamanlar ve durumlar, sadakanın etkisini artırır ve daha büyük manevi kazançlar sağlar.
      `,
      keyPoints: [
        "Bazı zamanlar daha faziletlidir",
        "Özel mekanlar sevabı artırır",
        "Zor zamanlar sadaka zamanıdır",
        "Dua ile sadaka birleştirilmeli"
      ]
    },
    {
      id: 20,
      title: "Sadakada Niyetler",
      content: `
Sadaka verirken niyetin doğru olması çok önemlidir. Niyet, amelin kabulü ve sevabının belirlenmesinde temel faktördür.

Doğru Niyetler:
- Yalnızca Allah rızası için verme
- Fakirin ihtiyacını giderme
- Toplumsal adalete katkı
- Günahların affı için
- Bereketli rızık için
- Ahiret yatırımı
- Peygamberimize uyma

Yanlış Niyetler:
- Gösteriş ve övünme
- Karşılık bekleme
- İnsanlara güzel görünme
- Ticari çıkar
- Sosyal statü kazanma
- Minnet ettirme
- Zorla verme

Niyeti Düzeltme Yolları:
- İhlas duası
- Gizli sadaka verme
- Sadaka adabını öğrenme
- Peygamber örneklerini takip etme
- Kalbi temizleme
- Nefsle mücadele

Niyet ne kadar temiz olursa, sadakanın sevabı o kadar büyük olur.
      `,
      verses: [
        {
          arabic: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ",
          turkish: "Ameller niyetlere göredir.",
          source: "Hadis-i Şerif"
        }
      ],
      keyPoints: [
        "Niyet amelin esasıdır",
        "İhlas ile Allah rızası gözetilmeli",
        "Yanlış niyetler sevabı azaltır",
        "Kalbin temizliği önemlidir"
      ]
    },
    {
      id: 21,
      title: "Sadaka ve Tevekkül",
      content: `
Sadaka vermek, Allah'a tevekkülün güzel bir örneğidir. Malını Allah yolunda harcayan kişi, rızkın Allah'tan geldiğine inanır ve O'na güvenir.

Tevekkül ve Sadaka İlişkisi:
- Allah'ın rızık vereceğine iman
- Verilen sadakanın yerine geleceğine inanç
- Geleceğe güvenle bakma
- Malın Allah'ın emaneti olduğunu bilme
- Her şeyin Allah'ın elinde olduğuna iman

Tevekkülün Sonuçları:
- Kalp huzuru
- Maddi kaygılardan kurtuluş
- Güven duygusu
- Cömertlik cesareti
- Bereketli yaşam

Peygamberimiz şöyle buyurmuştur: "Sabah erkenden rızkınızın peşine düşünün. Şüphesiz ki sadaka malı eksiltmez, yalnızca artırır."

Bu hadis, sadaka veren kişinin Allah'a güvenmesi gerektiğini ve bu güvenin boşa çıkmayacağını gösterir.
      `,
      hadiths: [
        {
          turkish: "Sadaka malı eksiltmez, Allah sadaka veren kulunu azizle eder.",
          source: "Müslim, Birr, 69"
        }
      ],
      keyPoints: [
        "Sadaka Allah'a güvenin göstergesidir",
        "Tevekkül kalp huzuru verir",
        "Allah rızık vermeyi garanti eder",
        "Sadaka veren hiç zarar görmez"
      ]
    },
    {
      id: 22,
      title: "Sadakada Ölçü ve Denge",
      content: `
İslam'da sadaka konusunda aşırılık hoş karşılanmaz. Kişi, ailesinin ihtiyaçlarını gözetmeli ve kendini zor duruma sokmamalıdır.

Dengenin Korunması:
- Önce aile ihtiyaçları
- Sonra sadaka
- Borçların ödenmesi
- Gelecek güvencesi
- Makul ölçülerde verme

Aşırılığın Zararları:
- Ailenin mağdur olması
- Maddi sıkıntıya düşme
- Borç batağına girme
- Pişmanlık duyma
- Süreklilik sağlayamama

Hz. Ömer (r.a) şöyle der: "Sadaka ver ama israf etme. Çünkü israf ile verilen sadaka kabul olmaz."

İslam, orta yol dindir. Ne cimrilik ne de israf hoş görülür. Akıllıca sadaka veren kişi hem dünyasını hem ahiretini kazanır.

Sadaka verirken şu sorular sorulmalı:
- Ailem mağdur olur mu?
- Borcum var mı?
- Gelecek güvencem var mı?
- Bu miktar uygun mu?
      `,
      keyPoints: [
        "Orta yol en iyisidir",
        "Aile ihtiyaçları önceliklidir",
        "Aşırılık zararlıdır",
        "Makul ölçüde sadaka verilmeli"
      ]
    },
    {
      id: 23,
      title: "Sadaka ve Sabır",
      content: `
Bazen sadaka vermek sabır gerektirir. Özellikle zor durumlarda veya kısıtlı imkanlarla sadaka vermek, büyük sabır ve fedakarlık ister.

Sabır Gerektiren Durumlar:
- Maddi sıkıntı zamanları
- İş kaybı dönemleri
- Hastalık anları
- Aile baskısı
- Sosyal eleştiriler
- Geri dönüş beklerken

Sabırlı Sadakanın Faziletleri:
- Daha büyük sevap
- Karakterin güçlenmesi
- İmanın artması
- Allah'a yakınlaşma
- Sabır melekesinin gelişmesi

Hz. Ali (r.a) şöyle der: "Zor zamanda verilen bir hurma, bolluk zamanında verilen bin dinardan daha değerlidir."

Peygamberimiz de şöyle buyurmuştur: "İhtiyaç sahibi iken sadaka veren kişi, zengin iken sadaka verenden daha büyük sevap alır."

Bu örnekler, zor durumlarda gösterilen cömertliğin ne kadar değerli olduğunu gösterir.
      `,
      keyPoints: [
        "Zor zamanlarda sadaka daha değerlidir",
        "Sabır büyük sevap kazandırır",
        "Fedakarlık imanı güçlendirir",
        "Az da olsa verilen kabul görür"
      ]
    },
    {
      id: 24,
      title: "Sadakada Hikmet",
      content: `
Sadaka verirken hikmetli davranmak gerekir. Hangi sadakanın, kime, ne zaman, nasıl verileceği konusunda akıllıca davranmak önemlidir.

Hikmetli Sadakanın İlkeleri:
- Doğru kişiyi seçme
- Uygun zamanı belirleme
- Doğru miktarı hesaplama
- Uygun yöntemi kullanma
- Sonuçları değerlendirme

Sadaka Verirken Dikkat Edilecekler:
- Gerçekten ihtiyaç sahibi mi?
- Sadaka kötüye kullanılır mı?
- Bağımlılık yaratır mı?
- Onurunu zedeler mi?
- Kendini geliştirebilir mi?

Hikmetli Sadaka Örnekleri:
- Eğitim bursu verme
- İş kurma desteği
- Beceri geliştirme
- Sağlık hizmeti
- Barınma desteği

Amacı kişiyi sadakaya muhtaç olmaktan çıkarmak olmalıdır. Balık vermek yerine balık tutmayı öğretmek gibi...
      `,
      keyPoints: [
        "Hikmetli davranmak gerekir",
        "Doğru kişiye doğru zamanda verilmeli",
        "Bağımlılık yaratmamalı",
        "Kişiyi kendi ayakları üzerinde durdurmayı hedeflemeli"
      ]
    },
    {
      id: 25,
      title: "Sadaka ve Şükür",
      content: `
Sadaka vermek, Allah'ın verdiği nimetlere şükretmenin en güzel yoludur. Malını paylaşan kişi, sahip olduklarının Allah'tan geldiğini kabul eder.

Şükür ve Sadaka İlişkisi:
- Nimet için teşekkür
- Allah'ın lütfunu tanıma
- Paylaşmanın zevki
- Memnuniyet duygusu
- Bereketli yaşam
- Rıza hali

Şükürün Sonuçları:
- Nimetlerin artması
- Bereketli rızık
- Kalp huzuru
- Allah'ın muhabbeti
- Ahiret yatırımı

Allah Teala şöyle buyurur: "Eğer şükrederseniz, elbette size nimetimi artıracağım." (İbrahim, 7)

Bu ayet, şükredenlerin nimetlerinin artacağını müjdeler. Sadaka da şükrün pratik gösterimi olarak kabul edilir.

Sadaka veren kişi şöyle düşünür:
- "Allah bana bu imkanı verdi"
- "Bu nimeti paylaşmam gerekir"  
- "Başkalarını da düşünmeliyim"
- "Şükrümü eylemle göstermeliyim"
      `,
      verses: [
        {
          arabic: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ",
          turkish: "Eğer şükrederseniz, elbette size nimetimi artıracağım.",
          source: "İbrahim Suresi, 7. Ayet"
        }
      ],
      keyPoints: [
        "Sadaka şükrün pratik gösterimidir",
        "Şükredenin nimeti artar",
        "Paylaşmak bereket getirir",
        "Allah'ın lütfunu tanımaktır"
      ]
    },
    {
      id: 26,
      title: "Sadaka ve Kardeşlik",
      content: `
İslam'da sadaka, Müslümanlar arasındaki kardeşlik bağını güçlendiren en önemli faktörlerden biridir. Paylaşmak, sevgiyi ve dayanışmayı artırır.

Kardeşlik ve Sadaka:
- Birlik ve beraberlik
- Karşılıklı sevgi
- Güven ilişkisi
- Dayanışma ruhu
- Ortak sorumluluk
- Toplumsal barış

Sadakanın Sosyal Etkileri:
- Toplumsal kohezyon
- Çatışmaların azalması
- Barış ortamı
- Güvenli toplum
- Mutlu bireyler
- Güçlü aileler

Peygamberimiz şöyle buyurmuştur: "Müminler, birbirlerini sevmek, acımak ve korumakta bir vücut gibidir. Vücudun bir uzvu hastalandığında diğer uzuvlar da uykusuzluk ve ateşle ona ortak olur."

Bu hadis, Müslümanların bir kardeş gibi birbirlerinin derdini paylaşması gerektiğini gösterir. Sadaka bu paylaşımın en güzel örneğidir.
      `,
      hadiths: [
        {
          turkish: "Mümin, kardeşinin sevmediği şeyi kendisi için de sevmez.",
          source: "Buhari, İman, 7"
        }
      ],
      keyPoints: [
        "Kardeşliği güçlendirir",
        "Toplumsal barışı sağlar",
        "Dayanışma ruhunu artırır",
        "Birlik ve beraberlik yaratır"
      ]
    },
    {
      id: 27,
      title: "Sadaka ve Gelecek Nesiller",
      content: `
Sadaka sadece bugünkü ihtiyaçları karşılamaz, gelecek nesillerin de yararına olan kalıcı projeler destekler. Bu, sürdürülebilir kalkınmanın İslami yaklaşımıdır.

Gelecek Nesiller İçin Sadaka:
- Eğitim kurumları
- Sağlık merkezleri
- Araştırma projeleri
- Çevre korunması
- Teknoloji yatırımları
- Kültürel projeler
- Altyapı çalışmaları

Sürdürülebilir Sadaka Modeli:
- Uzun vadeli planlama
- Kalıcı çözümler
- Nesillere fayda
- Toplumsal gelişim
- Bilim ve teknoloji
- Çevre bilinci

Örnek Projeler:
- Üniversite kurma
- Kütüphane yapımı
- Park ve bahçe
- Temiz su projeleri
- Yenilenebilir enerji
- İlim merkezi

Bu tür sadakalar, sadaka-i cariye özelliği taşır ve verenlerin ölümünden sonra da sevabı devam eder.
      `,
      keyPoints: [
        "Gelecek nesilleri düşünülmeli",
        "Kalıcı projeler desteklenmeli",
        "Sürdürülebilir kalkınma önemli",
        "İlim ve teknolojiye yatırım yapılmalı"
      ]
    },
    {
      id: 28,
      title: "Sadaka ve Küresel Dayanışma",
      content: `
Günümüzde sadaka, sadece yerel toplulukla sınırlı kalmayıp küresel boyutta da ele alınmalıdır. Dünyada yaşanan problemlere karşı ortak çözümler üretmek gerekir.

Küresel Sadaka Alanları:
- Doğal afet yardımları
- Mülteci desteği
- Açlıkla mücadele
- Salgın hastalık mücadelesi
- Eğitim eşitsizliği
- Su kıtlığı
- İklim değişikliği

Uluslararası İş Birliği:
- Sivil toplum kuruluşları
- Uluslararası yardım örgütleri
- Hükümetler arası iş birliği
- Teknoloji paylaşımı
- Deneyim aktarımı

İslami Perspektif:
- Tüm insanlık kardeştir
- Adalet evrenseldir
- Yardımlaşma sınır tanımaz
- İnsanlık ortak değeridir

Bu anlayış, İslam'ın evrensel mesajının bir parçasıdır ve sadakanın sadece Müslümanlara özgü olmadığını gösterir.
      `,
      keyPoints: [
        "Sadaka evrensel değerdir",
        "Küresel problemlere çözüm üretmeli",
        "Uluslararası iş birliği önemli",
        "İnsanlık ortak sorumluluğumuz"
      ]
    },
    {
      id: 29,
      title: "Sadaka ve Teknoloji",
      content: `
Teknolojinin gelişmesi ile sadaka verme yöntemleri de çeşitlenmiştir. Dijital çağda sadaka vermek daha kolay ve hızlı hale gelmiştir.

Teknolojik İmkanlar:
- Online bağış platformları
- Mobil uygulamalar
- QR kod ile ödeme
- Kripto para bağışları
- Sosyal medya kampanyaları
- Otomatik ödeme sistemleri
- Yapay zeka destekli seçim

Avantajları:
- Hızlı ve kolay işlem
- Güvenli ödeme
- Şeffaflık
- Takip edilebilirlik
- Geniş kitlelere ulaşım
- Maliyet tasarrufu

Dikkat Edilecek Noktalar:
- Güvenilir platformlar
- Şeffaf raporlama
- Doğru hedefleme
- Kişisel veri korunması
- İslami adaplara uygunluk

Teknoloji bir araçtır, asıl olan sadakada ihlas ve samimiyettir. Modern araçlar kullanılırken geleneksel değerler korunmalıdır.
      `,
      keyPoints: [
        "Teknoloji sadakayı kolaylaştırır",
        "Dijital platformlar güvenli olmalı",
        "Şeffaflık ve takip önemli",
        "İslami değerler korunmalı"
      ]
    },
    {
      id: 30,
      title: "Sadaka ve Hayatın Anlamı",
      content: `
Sadaka, İslam'da hayatın anlamını ve amacını gösteren temel ibadetlerden biridir. İnsan neden yaratıldığı ve dünyada ne yapması gerektiği konusunda rehberlik eder.

Hayatın Anlamında Sadakanın Yeri:
- Allah'a kulluk
- İnsanlara hizmet
- Toplumsal sorumluluk
- Manevi gelişim
- Ahiret yatırımı
- Karakterin olgunlaşması

Sadakanın Felsefesi:
- Paylaşmak çoğaltır
- Vermek zenginleştirir
- Yardım etmek mutlu eder
- Sevgi bağları güçlenir
- Toplum huzur bulur

Son Söz:
İslam'da sadaka, sadece maddi bir yardım değil, aynı zamanda manevi bir yolculuktur. Bu eğitimde öğrendiğimiz tüm bilgiler, sadakanın ne kadar kapsamlı ve önemli bir konu olduğunu göstermektedir.

Her Müslüman, imkanları ölçüsünde sadaka vererek hem dünya hem ahiret mutluluğuna kavuşabilir. Önemli olan, samimi niyet ve sürekli pratiktir.

Allah hepimizi cömert kulları arasına katsın ve sadakalarımızı kabul buyursun. Amin.
      `,
      verses: [
        {
          arabic: "وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ",
          turkish: "Cinleri ve insanları ancak bana ibadet etsinler diye yarattım.",
          source: "Zariyat Suresi, 56. Ayet"
        }
      ],
      keyPoints: [
        "Sadaka hayatın anlamını gösterir",
        "İnsanlığa hizmet etmektir",
        "Manevi gelişimin yoludur",
        "Ahirete yatırımdır"
      ]
    }
  ]
};

export const defaultTrainingModules: TrainingModule[] = [sadakaTrainingContent];
