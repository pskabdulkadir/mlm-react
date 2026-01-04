#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getMongoDBService } from '../dist/server/lib/mongodb-service.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateToMongoDB() {
  console.log('🚀 Starting migration from file-based database to MongoDB Atlas...');
  
  try {
    // Read the file-based database
    const dbFilePath = path.join(__dirname, '../data/mlm-db.json');
    
    if (!fs.existsSync(dbFilePath)) {
      console.log('📁 No existing file database found. Creating fresh MongoDB setup...');
      await setupFreshDatabase();
      return;
    }

    console.log('📖 Reading existing file database...');
    const fileData = JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
    
    // Connect to MongoDB
    const mongoService = getMongoDBService();
    await mongoService.connect();
    
    // Perform migration
    await mongoService.migrateFromFileDatabase(fileData);
    
    // Backup the old file
    const backupPath = path.join(__dirname, `../data/mlm-db-backup-${Date.now()}.json`);
    fs.copyFileSync(dbFilePath, backupPath);
    console.log(`💾 Backed up original database to: ${backupPath}`);
    
    // Verify migration
    const health = await mongoService.healthCheck();
    console.log('🔍 Migration verification:', health);
    
    if (health.connected && health.totalUsers > 0) {
      console.log('✅ Migration completed successfully!');
      console.log(`📊 Migrated ${health.totalUsers} users to MongoDB`);
      console.log('🗑️  You can now safely remove the file database');
    } else {
      console.error('❌ Migration verification failed');
    }
    
    await mongoService.disconnect();
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

async function setupFreshDatabase() {
  try {
    const mongoService = getMongoDBService();
    await mongoService.connect();
    
    // Create default admin user
    const defaultAdmin = {
      id: 'admin-001',
      memberId: 'ak0000001',
      fullName: 'Abdulkadir Kan',
      email: 'psikoloqabdulkadirkan@gmail.com',
      phone: '+90 555 123 4567',
      password: '$2a$12$hashedpassword', // Should be properly hashed
      role: 'admin',
      sponsorId: null,
      referralCode: 'abdulkadirkan',
      leftChild: null,
      rightChild: null,
      membershipType: 'yearly',
      membershipStartDate: new Date(),
      isActive: true,
      careerLevel: {
        name: 'Diamond',
        commissionRate: 15
      },
      totalInvestment: 0,
      directReferrals: 0,
      totalTeamSize: 0,
      wallet: {
        balance: 0,
        totalEarnings: 0,
        sponsorBonus: 0,
        careerBonus: 0,
        passiveIncome: 0,
        leadershipBonus: 0
      },
      kycStatus: 'approved',
      registrationDate: new Date(),
      lastLoginDate: new Date()
    };
    
    await mongoService.createUser(defaultAdmin);
    
    // Create default membership packages
    const defaultPackages = [
      {
        id: 'entry-package',
        name: 'Giriş Paketi',
        price: 100,
        currency: 'USD',
        description: 'Temel üyelik paketi',
        features: ['Clone sayfa', 'Temel komisyon', '%10 bonus'],
        bonusPercentage: 10,
        commissionRate: 5,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        displayOrder: 1
      },
      {
        id: 'monthly-package',
        name: 'Aylık Paket',
        price: 50,
        currency: 'USD',
        description: 'Aylık aktivasyon paketi',
        features: ['Aylık aktivasyon', 'Gelişmiş komisyon', '%15 bonus'],
        bonusPercentage: 15,
        commissionRate: 8,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        displayOrder: 2
      }
    ];
    
    for (const pkg of defaultPackages) {
      await mongoService.createMembershipPackage(pkg);
    }
    
    // Set up system settings
    const systemSettings = {
      siteName: 'Kutbul Zaman MLM',
      maintenanceMode: false,
      registrationOpen: true,
      defaultCommissionRate: 10,
      maxBinaryLevels: 10,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await mongoService.updateSystemSettings(systemSettings);
    
    console.log('✅ Fresh MongoDB database setup completed');
    console.log('👤 Default admin user created: ak0000001');
    console.log('📦 Default membership packages created');
    
    await mongoService.disconnect();
    
  } catch (error) {
    console.error('❌ Fresh setup failed:', error);
    throw error;
  }
}

// Check if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateToMongoDB();
}

export { migrateToMongoDB, setupFreshDatabase };
