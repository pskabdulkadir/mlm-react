import "dotenv/config";
import mongoose from "mongoose";
import { mlmDb } from "../lib/mlm-database";
import { hashPassword, generateReferralCode } from "../lib/utils";
import { User } from "../../shared/mlm-types";

// --- AYARLAR ---
const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/kutbulzaman";

// --- EVENT LISTENER MANTIĞI (Laravel: CalculatePvAndBonus) ---
async function onUserRegistered(user: User) {
  console.log(`   ⚡ Event Tetiklendi: ${user.fullName}`);

  // 1. Satın Alma İşlemi ($100)
  // Laravel: Transaction::create(['amount' => 100, 'type' => 'purchase'...]) 
  await mlmDb.createTransaction({
    userId: user.id,
    type: "payment", // veya 'purchase'
    amount: 100,
    description: "Initial purchase $100 (Seeder)",
    status: "completed",
  });

  // 2. Yıllık Aktivite ($200)
  // Laravel: Activity::create(['amount' => 200...])
  await mlmDb.updateUser(user.id, {
    annualSalesVolume: (user.annualSalesVolume || 0) + 200,
    monthlySalesVolume: (user.monthlySalesVolume || 0) + 200,
    isActive: true,
    totalInvestment: (user.totalInvestment || 0) + 100, // 100$ purchase eklendi
  });
  
  // Aktivite logu (Transaction olarak da görebiliriz veya sadece log)
  await mlmDb.createTransaction({
    userId: user.id,
    type: "system_fee",
    amount: 0, // Bakiye düşmesin diye 0, ama açıklamada belirtiyoruz
    description: "Annual activity check: $200 volume added",
    status: "completed",
  });

  // 3. PV ve Bonus Hesaplama
  const pv = 100;
  const bonusRate = 0.10;
  const bonus = pv * bonusRate; // $10

  // PV Kaydı (Opsiyonel, UserPv modeli yerine Transaction kullanıyoruz)
  // ...

  // 4. Monoline Sponsor Bonus (Recursive / Döngüsel)
  // Laravel: while ($currentSponsorId) { ... }
  let currentSponsorId = user.sponsorId;
  let depth = 1;

  while (currentSponsorId) {
    const sponsor = await mlmDb.getUserById(currentSponsorId);
    
    if (!sponsor) break;

    console.log(`      💰 [Seviye ${depth}] Sponsor Bonusu: ${sponsor.fullName} kazanıyor -> $${bonus}`);

    // Sponsorun cüzdanını güncelle
    const newBalance = (sponsor.wallet.balance || 0) + bonus;
    const newSponsorBonus = (sponsor.wallet.sponsorBonus || 0) + bonus;
    const newTotalEarnings = (sponsor.wallet.totalEarnings || 0) + bonus;

    await mlmDb.updateUser(sponsor.id, {
      wallet: {
        ...sponsor.wallet,
        balance: newBalance,
        sponsorBonus: newSponsorBonus,
        totalEarnings: newTotalEarnings
      }
    });

    // Sponsor için Transaction kaydı
    await mlmDb.createTransaction({
      userId: sponsor.id,
      type: "bonus",
      amount: bonus,
      description: `Monoline Bonus from ${user.fullName} (Level ${depth})`,
      status: "completed",
    });

    // Bir üst sponsora geç
    currentSponsorId = sponsor.sponsorId;
    depth++;
  }
}

// --- SEEDER MANTIĞI (Laravel: InitialUsersSeeder) ---
async function seed() {
  console.log("🌱 Seeding başlatılıyor...");

  try {
    // DB Bağlantısı (Mongoose singleton veya mlmDb üzerinden)
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGO_URI);
      console.log("✅ DB Bağlandı");
    }

    // 1. İlk Kullanıcı: Abdulkadir Kan
    const adminEmail = "abdulkadir@example.com";
    let firstUser = await mlmDb.getUserByEmail(adminEmail);

    if (!firstUser) {
      console.log("👤 Abdulkadir Kan oluşturuluyor...");
      firstUser = await mlmDb.createUser({
        fullName: "Abdulkadir Kan",
        email: adminEmail,
        phone: "5550000000",
        password: hashPassword("Password123!"),
        role: "admin",
        sponsorId: null,
        referralCode: generateReferralCode("Abdulkadir Kan"),
        isActive: true,
        wallet: { balance: 0, totalEarnings: 0, sponsorBonus: 0, careerBonus: 0, passiveIncome: 0, leadershipBonus: 0 },
        careerLevel: { 
          id: "1", 
          name: "Nefs-i Emmare", 
          displayName: "Entry",
          description: "Giriş seviyesi",
          minInvestment: 0,
          minDirectReferrals: 0,
          personalSalesPoints: 0,
          teamSalesPoints: 0,
          commissionRate: 0,
          order: 1,
          isActive: true
        } as any
      } as any);
      
      // Event tetikle (Kendi kendine bonus vermez ama işlem kaydı oluşur)
      await onUserRegistered(firstUser);
    } else {
      console.log("ℹ️ Abdulkadir Kan zaten mevcut.");
    }

    // 2. Sonraki 10 Kullanıcı (Sultan 1...10)
    // Monoline mantığı için her kullanıcı bir öncekine bağlanır.
    let lastUserId = firstUser.id;

    for (let i = 1; i <= 10; i++) {
      const email = `sultan${i}@example.com`;
      let user = await mlmDb.getUserByEmail(email);

      if (!user) {
        console.log(`👤 Sultan ${i} oluşturuluyor...`);
        user = await mlmDb.createUser({
          fullName: `Sultan ${i}`,
          email: email,
          phone: `555000000${i}`,
          password: hashPassword("Password123!"),
          role: "user",
          sponsorId: lastUserId, // ZİNCİRLEME (Monoline): Bir önceki kullanıcı sponsor olur
          referralCode: generateReferralCode(`Sultan ${i}`),
          isActive: true,
          wallet: { balance: 0, totalEarnings: 0, sponsorBonus: 0, careerBonus: 0, passiveIncome: 0, leadershipBonus: 0 },
          careerLevel: { 
            id: "1", 
            name: "Nefs-i Emmare", 
            displayName: "Entry",
            description: "Giriş seviyesi",
            minInvestment: 0,
            minDirectReferrals: 0,
            personalSalesPoints: 0,
            teamSalesPoints: 0,
            commissionRate: 0,
            order: 1,
            isActive: true
          } as any
        } as any);

        // Event tetikle (Recursive bonus hesaplar)
        await onUserRegistered(user);
        
        // Zinciri devam ettir
        lastUserId = user.id;
      } else {
        console.log(`ℹ️ Sultan ${i} zaten mevcut.`);
        lastUserId = user.id; // Mevcutsa zinciri buradan devam ettir
      }
    }

    console.log("\n✅ Seeding tamamlandı! Admin panelinden kontrol edebilirsiniz.");
    process.exit(0);

  } catch (error) {
    console.error("❌ Seeding hatası:", error);
    process.exit(1);
  }
}

seed();