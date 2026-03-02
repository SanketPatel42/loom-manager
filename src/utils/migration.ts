import { storage as localStorage } from '@/lib/localStorage';
import { asyncStorage } from '@/lib/storage';

export interface MigrationResult {
  success: boolean;
  message: string;
  details?: {
    beams?: number;
    takas?: number;
    workerProfiles?: number;
    qualities?: number;
    sales?: number;
    purchases?: number;
    firms?: number;
    transactions?: number;
    stock?: number;
    beamPasar?: number;
    workerSheetData?: boolean;
  };
}

export async function migrateFromLocalStorage(): Promise<MigrationResult> {
  try {
    console.log('🔄 Starting migration from localStorage to PostgreSQL...');

    const details: any = {};
    let totalMigrated = 0;
    let skipped = 0;

    // Migrate Beams
    try {
      const beams = localStorage.getBeams();
      const existingBeams = await asyncStorage.getBeams();
      const existingIds = new Set(existingBeams.map(b => b.id));

      if (beams.length > 0) {
        let added = 0;
        for (const beam of beams) {
          if (!existingIds.has(beam.id)) {
            await asyncStorage.addBeam(beam);
            added++;
          } else {
            skipped++;
          }
        }
        details.beams = added;
        totalMigrated += added;
        console.log(`✅ Migrated ${added} beams (${beams.length - added} already exist)`);
      }
    } catch (error) {
      console.warn('⚠️ Error migrating beams:', error);
    }

    // Migrate Takas
    try {
      const takas = localStorage.getTakas();
      const existingTakas = await asyncStorage.getTakas();
      const existingIds = new Set(existingTakas.map(t => t.id));

      if (takas.length > 0) {
        let added = 0;
        for (const taka of takas) {
          if (!existingIds.has(taka.id)) {
            await asyncStorage.addTaka(taka);
            added++;
          } else {
            skipped++;
          }
        }
        details.takas = added;
        totalMigrated += added;
        console.log(`✅ Migrated ${added} takas (${takas.length - added} already exist)`);
      }
    } catch (error) {
      console.warn('⚠️ Error migrating takas:', error);
    }

    // Migrate Worker Profiles
    try {
      const workerProfiles = localStorage.getWorkerProfiles();
      const existingProfiles = await asyncStorage.getWorkerProfiles();
      const existingIds = new Set(existingProfiles.map(p => p.id));

      if (workerProfiles.length > 0) {
        let added = 0;
        for (const profile of workerProfiles) {
          if (!existingIds.has(profile.id)) {
            await asyncStorage.addWorkerProfile(profile);
            added++;
          } else {
            skipped++;
          }
        }
        details.workerProfiles = added;
        totalMigrated += added;
        console.log(`✅ Migrated ${added} worker profiles (${workerProfiles.length - added} already exist)`);
      }
    } catch (error) {
      console.warn('⚠️ Error migrating worker profiles:', error);
    }

    // Migrate Qualities
    try {
      const qualities = localStorage.getQualities();
      const existingQualities = await asyncStorage.getQualities();
      const existingIds = new Set(existingQualities.map(q => q.id));

      if (qualities.length > 0) {
        let added = 0;
        for (const quality of qualities) {
          if (!existingIds.has(quality.id)) {
            await asyncStorage.addQuality(quality);
            added++;
          } else {
            skipped++;
          }
        }
        details.qualities = added;
        totalMigrated += added;
        console.log(`✅ Migrated ${added} qualities (${qualities.length - added} already exist)`);
      }
    } catch (error) {
      console.warn('⚠️ Error migrating qualities:', error);
    }

    // Migrate Sales
    try {
      const sales = localStorage.getSales();
      const existingSales = await asyncStorage.getSales();
      const existingIds = new Set(existingSales.map(s => s.id));

      if (sales.length > 0) {
        let added = 0;
        for (const sale of sales) {
          if (!existingIds.has(sale.id)) {
            await asyncStorage.addSale(sale);
            added++;
          } else {
            skipped++;
          }
        }
        details.sales = added;
        totalMigrated += added;
        console.log(`✅ Migrated ${added} sales (${sales.length - added} already exist)`);
      }
    } catch (error) {
      console.warn('⚠️ Error migrating sales:', error);
    }

    // Migrate Purchases
    try {
      const purchases = localStorage.getPurchases();
      const existingPurchases = await asyncStorage.getPurchases();
      const existingIds = new Set(existingPurchases.map(p => p.id));

      if (purchases.length > 0) {
        let added = 0;
        for (const purchase of purchases) {
          if (!existingIds.has(purchase.id)) {
            await asyncStorage.addPurchase(purchase);
            added++;
          } else {
            skipped++;
          }
        }
        details.purchases = added;
        totalMigrated += added;
        console.log(`✅ Migrated ${added} purchases (${purchases.length - added} already exist)`);
      }
    } catch (error) {
      console.warn('⚠️ Error migrating purchases:', error);
    }

    // Migrate Firms
    try {
      const firms = localStorage.getFirms();
      const existingFirms = await asyncStorage.getFirms();
      const existingIds = new Set(existingFirms.map(f => f.id));

      if (firms.length > 0) {
        let added = 0;
        for (const firm of firms) {
          if (!existingIds.has(firm.id)) {
            await asyncStorage.addFirm(firm);
            added++;
          } else {
            skipped++;
          }
        }
        details.firms = added;
        totalMigrated += added;
        console.log(`✅ Migrated ${added} firms (${firms.length - added} already exist)`);
      }
    } catch (error) {
      console.warn('⚠️ Error migrating firms:', error);
    }

    // Migrate Transactions
    try {
      const transactions = localStorage.getTransactions();
      const existingTransactions = await asyncStorage.getTransactions();
      const existingIds = new Set(existingTransactions.map(t => t.id));

      if (transactions.length > 0) {
        let added = 0;
        for (const transaction of transactions) {
          if (!existingIds.has(transaction.id)) {
            await asyncStorage.addTransaction(transaction);
            added++;
          } else {
            skipped++;
          }
        }
        details.transactions = added;
        totalMigrated += added;
        console.log(`✅ Migrated ${added} transactions (${transactions.length - added} already exist)`);
      }
    } catch (error) {
      console.warn('⚠️ Error migrating transactions:', error);
    }

    // Migrate Stock
    try {
      const stock = localStorage.getStock();
      const existingStock = await asyncStorage.getStock();
      const existingIds = new Set(existingStock.map(s => s.id));

      if (stock.length > 0) {
        let added = 0;
        for (const stockItem of stock) {
          if (!existingIds.has(stockItem.id)) {
            await asyncStorage.addStock(stockItem);
            added++;
          } else {
            skipped++;
          }
        }
        details.stock = added;
        totalMigrated += added;
        console.log(`✅ Migrated ${added} stock items (${stock.length - added} already exist)`);
      }
    } catch (error) {
      console.warn('⚠️ Error migrating stock:', error);
    }

    // Migrate Beam Pasar
    try {
      const beamPasar = localStorage.getBeamPasars();
      const existingBeamPasar = await asyncStorage.getBeamPasars();
      const existingIds = new Set(existingBeamPasar.map(b => b.id));

      if (beamPasar.length > 0) {
        let added = 0;
        for (const item of beamPasar) {
          if (!existingIds.has(item.id)) {
            await asyncStorage.addBeamPasar(item);
            added++;
          } else {
            skipped++;
          }
        }
        details.beamPasar = added;
        totalMigrated += added;
        console.log(`✅ Migrated ${added} beam pasar items (${beamPasar.length - added} already exist)`);
      }
    } catch (error) {
      console.warn('⚠️ Error migrating beam pasar:', error);
    }

    // Migrate Worker Sheet Data
    try {
      const workerSheetData = localStorage.getWorkerSheetData();
      if (workerSheetData) {
        await asyncStorage.setWorkerSheetData(workerSheetData);
        details.workerSheetData = true;
        console.log('✅ Migrated worker sheet data');
      }
    } catch (error) {
      console.warn('⚠️ Error migrating worker sheet data:', error);
    }

    console.log(`🎉 Migration completed! Total records migrated: ${totalMigrated}, Skipped (already exist): ${skipped}`);

    return {
      success: true,
      message: `Successfully migrated ${totalMigrated} new records from localStorage (${skipped} already existed)`,
      details,
    };

  } catch (error) {
    console.error('❌ Migration failed:', error);
    return {
      success: false,
      message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export function hasLocalStorageData(): boolean {
  try {
    // Check original localStorage keys (before migration)
    const originalKeys = [
      'erp_beams', 'erp_takas', 'erp_sales', 'erp_purchases',
      'erp_transactions', 'erp_stock', 'erp_worker_profiles',
      'erp_firms', 'erp_qualities', 'erp_beam_pasar', 'erp_worker_sheet_data'
    ];

    return originalKeys.some(key => {
      const data = window.localStorage.getItem(key);
      if (!data) return false;
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed.length > 0 : parsed !== null;
      } catch {
        return false;
      }
    });
  } catch (error) {
    console.error('Error checking localStorage data:', error);
    return false;
  }
}