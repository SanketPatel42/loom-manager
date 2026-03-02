import { eq } from 'drizzle-orm';
import { db as baseDb } from './config';
// Cast db to any to stop dialect mismatch errors (SQLite vs Postgres drivers)
const db = baseDb as any;
import * as schema from './schema';
import type {
  Beam,
  Taka,
  WorkerProfile,
  Quality,
  Sale,
  Purchase,
  Transaction,
  Stock,
  BeamPasar,
  Firm,
  WorkerSheetData,
  PurchaseDelivery,
  SaleDelivery,
} from '../types';

// Utility function to convert database decimal to number
const toNumber = (value: any): number => {
  return typeof value === 'string' ? parseFloat(value) : Number(value) || 0;
};

// Beams Service
export const beamsService = {
  async getAll(): Promise<Beam[]> {
    const result = await db.select().from(schema.beams);
    return result.map(beam => ({
      ...beam,
      noOfTakas: toNumber(beam.noOfTakas),
      noOfTar: toNumber(beam.noOfTar),
      pricePerBeam: toNumber(beam.pricePerBeam),
      total: toNumber(beam.total),
    }));
  },

  async create(beam: Beam): Promise<void> {
    await db.insert(schema.beams).values({
      id: beam.id,
      date: beam.date,
      warper: beam.warper,
      beamNo: beam.beamNo,
      noOfTakas: beam.noOfTakas,
      noOfTar: beam.noOfTar,
      pricePerBeam: beam.pricePerBeam,
      total: beam.total,
      qualityId: beam.qualityId,
    });
  },

  async update(id: string, beam: Beam): Promise<void> {
    await db.update(schema.beams)
      .set({
        date: beam.date,
        warper: beam.warper,
        beamNo: beam.beamNo,
        noOfTakas: beam.noOfTakas,
        noOfTar: beam.noOfTar,
        pricePerBeam: beam.pricePerBeam,
        total: beam.total,
        qualityId: beam.qualityId,
        updatedAt: Date.now(),
      })
      .where(eq(schema.beams.id, id));
  },

  async delete(id: string): Promise<void> {
    await db.delete(schema.beams).where(eq(schema.beams.id, id));
  },
};

// Takas Service
export const takasService = {
  async getAll(): Promise<Taka[]> {
    const result = await db.select().from(schema.takas);
    return result.map(taka => ({
      ...taka,
      available: toNumber(taka.available),
      folded: toNumber(taka.folded),
      remaining: toNumber(taka.remaining),
    }));
  },

  async create(taka: Taka): Promise<void> {
    await db.insert(schema.takas).values({
      id: taka.id,
      date: taka.date,
      available: taka.available,
      folded: taka.folded,
      remaining: taka.remaining,
      qualityId: taka.qualityId,
    });
  },

  async update(id: string, taka: Taka): Promise<void> {
    await db.update(schema.takas)
      .set({
        date: taka.date,
        available: taka.available,
        folded: taka.folded,
        remaining: taka.remaining,
        qualityId: taka.qualityId,
        updatedAt: Date.now(),
      })
      .where(eq(schema.takas.id, id));
  },

  async delete(id: string): Promise<void> {
    await db.delete(schema.takas).where(eq(schema.takas.id, id));
  },
};

// Worker Profiles Service
export const workerProfilesService = {
  async getAll(): Promise<WorkerProfile[]> {
    return await db.select().from(schema.workerProfiles);
  },

  async create(profile: WorkerProfile): Promise<void> {
    await db.insert(schema.workerProfiles).values(profile);
  },

  async update(id: string, profile: WorkerProfile): Promise<void> {
    await db.update(schema.workerProfiles)
      .set({
        name: profile.name,
        phoneNumber: profile.phoneNumber,
        emergencyContact: profile.emergencyContact,
        updatedAt: Date.now(),
      })
      .where(eq(schema.workerProfiles.id, id));
  },

  async delete(id: string): Promise<void> {
    await db.delete(schema.workerProfiles).where(eq(schema.workerProfiles.id, id));
  },
};

// Qualities Service
export const qualitiesService = {
  async getAll(): Promise<Quality[]> {
    const result = await db.select().from(schema.qualities);
    return result.map(quality => ({
      ...quality,
      ratePerMeter: toNumber(quality.ratePerMeter),
      epi: toNumber(quality.epi),
      ppi: toNumber(quality.ppi),
      tars: toNumber(quality.tars),
      beamRate: toNumber(quality.beamRate),
      beamPasarRate: toNumber(quality.beamPasarRate),
      createdAt: typeof quality.createdAt === 'number'
        ? new Date(quality.createdAt).toISOString()
        : quality.createdAt || new Date().toISOString(),
    } as Quality));
  },

  async create(quality: Quality): Promise<void> {
    await db.insert(schema.qualities).values({
      ...quality,
      ratePerMeter: quality.ratePerMeter,
      createdAt: Date.now(),
    });
  },

  async update(id: string, quality: Quality): Promise<void> {
    await db.update(schema.qualities)
      .set({
        ...quality,
        updatedAt: Date.now(),
      })
      .where(eq(schema.qualities.id, id));
  },

  async delete(id: string): Promise<void> {
    await db.delete(schema.qualities).where(eq(schema.qualities.id, id));
  },
};

// Sales Service
export const salesService = {
  async getAll(): Promise<Sale[]> {
    const result = await db.select().from(schema.sales);
    return result.map(sale => ({
      ...sale,
      takas: toNumber(sale.takas),
      meters: toNumber(sale.meters),
      ratePerMeter: toNumber(sale.ratePerMeter),
      amount: toNumber(sale.amount),
      tax: toNumber(sale.tax),
      total: toNumber(sale.total),
      paymentTerms: sale.paymentTerms || 45,
      status: sale.status as 'pending' | 'paid',
      type: (sale.type as 'spot' | 'advance') || 'spot',
    }));
  },

  async create(sale: Sale): Promise<void> {
    await db.insert(schema.sales).values({
      ...sale,
      status: sale.status || 'pending',
    });
  },

  async update(id: string, sale: Sale): Promise<void> {
    await db.update(schema.sales)
      .set({
        ...sale,
        updatedAt: Date.now(),
      })
      .where(eq(schema.sales.id, id));
  },

  async delete(id: string): Promise<void> {
    await db.delete(schema.sales).where(eq(schema.sales.id, id));
  },
};

// Purchases Service
export const purchasesService = {
  async getAll(): Promise<Purchase[]> {
    const result = await db.select().from(schema.purchases);
    return result.map(purchase => ({
      ...purchase,
      type: (purchase.type as 'yarn' | 'beam') || 'yarn',
      tons: toNumber(purchase.tons),
      ratePerTon: toNumber(purchase.ratePerTon),
      numberOfBeams: toNumber(purchase.numberOfBeams),
      ratePerBeam: toNumber(purchase.ratePerBeam),
      tars: toNumber(purchase.tars),
      meters: toNumber(purchase.meters),
      total: toNumber(purchase.total),
    }));
  },

  async create(purchase: Purchase): Promise<void> {
    await db.insert(schema.purchases).values({
      ...purchase,
    });
  },

  async update(id: string, purchase: Purchase): Promise<void> {
    await db.update(schema.purchases)
      .set({
        ...purchase,
        updatedAt: Date.now(),
      })
      .where(eq(schema.purchases.id, id));
  },

  async delete(id: string): Promise<void> {
    await db.delete(schema.purchases).where(eq(schema.purchases.id, id));
  },
};

// Firms Service
export const firmsService = {
  async getAll(): Promise<Firm[]> {
    const result = await db.select().from(schema.firms);
    return result.map(firm => ({
      ...firm,
      documents: (firm.documents as any) || [],
    }));
  },

  async create(firm: Firm): Promise<void> {
    await db.insert(schema.firms).values({
      id: firm.id,
      name: firm.name,
      gstNumber: firm.gstNumber,
      address: firm.address,
      contactPerson: firm.contactPerson,
      phoneNumber: firm.phoneNumber,
      email: firm.email,
      documents: firm.documents,
    });
  },

  async update(id: string, firm: Firm): Promise<void> {
    await db.update(schema.firms)
      .set({
        name: firm.name,
        gstNumber: firm.gstNumber,
        address: firm.address,
        contactPerson: firm.contactPerson,
        phoneNumber: firm.phoneNumber,
        email: firm.email,
        documents: firm.documents,
        updatedAt: Date.now(),
      })
      .where(eq(schema.firms.id, id));
  },

  async delete(id: string): Promise<void> {
    await db.delete(schema.firms).where(eq(schema.firms.id, id));
  },
};

// Transactions Service
export const transactionsService = {
  async getAll(): Promise<Transaction[]> {
    const result = await db.select().from(schema.transactions);
    return result.map(transaction => ({
      ...transaction,
      amount: toNumber(transaction.amount),
      type: transaction.type as 'Payment' | 'Received' | 'Other',
    }));
  },

  async create(transaction: Transaction): Promise<void> {
    await db.insert(schema.transactions).values({
      id: transaction.id,
      date: transaction.date,
      firm: transaction.firm,
      type: transaction.type,
      amount: transaction.amount.toString(),
      purpose: transaction.purpose,
      payee: transaction.payee,
    });
  },

  async update(id: string, transaction: Transaction): Promise<void> {
    await db.update(schema.transactions)
      .set({
        ...transaction,
        updatedAt: Date.now(),
      })
      .where(eq(schema.transactions.id, id));
  },

  async delete(id: string): Promise<void> {
    await db.delete(schema.transactions).where(eq(schema.transactions.id, id));
  },
};

// Stock Service
export const stockService = {
  async getAll(): Promise<Stock[]> {
    return await db.select().from(schema.stock);
  },

  async create(stockItem: Stock): Promise<void> {
    await db.insert(schema.stock).values(stockItem);
  },

  async update(id: string, stockItem: Stock): Promise<void> {
    await db.update(schema.stock)
      .set({
        ...stockItem,
        updatedAt: Date.now(),
      })
      .where(eq(schema.stock.id, id));
  },

  async delete(id: string): Promise<void> {
    await db.delete(schema.stock).where(eq(schema.stock.id, id));
  },
};

// Beam Pasar Service
export const beamPasarService = {
  async getAll(): Promise<BeamPasar[]> {
    return await db.select().from(schema.beamPasar);
  },

  async create(beamPasarItem: BeamPasar): Promise<void> {
    await db.insert(schema.beamPasar).values(beamPasarItem);
  },

  async update(id: string, beamPasarItem: BeamPasar): Promise<void> {
    await db.update(schema.beamPasar)
      .set({
        ...beamPasarItem,
        updatedAt: Date.now(),
      })
      .where(eq(schema.beamPasar.id, id));
  },

  async delete(id: string): Promise<void> {
    await db.delete(schema.beamPasar).where(eq(schema.beamPasar.id, id));
  },
};

// Worker Sheet Data Service
export const workerSheetDataService = {
  async get(): Promise<WorkerSheetData | null> {
    const result = await db.select().from(schema.workerSheetData).limit(1);
    if (result.length === 0) return null;

    const data = result[0];
    return {
      assignments: data.assignments as any,
      gridData: data.gridData as any,
      lastUpdated: data.lastUpdated?.toISOString() || new Date().toISOString(),
    };
  },

  async set(data: WorkerSheetData): Promise<void> {
    const existing = await this.get();

    if (existing) {
      await db.update(schema.workerSheetData)
        .set({
          assignments: data.assignments,
          gridData: data.gridData,
          lastUpdated: new Date().toISOString(),
          updatedAt: Date.now(),
        })
        .where(eq(schema.workerSheetData.id, 'main'));
    } else {
      await db.insert(schema.workerSheetData).values({
        id: 'main',
        assignments: data.assignments,
        gridData: data.gridData,
        lastUpdated: new Date().toISOString(),
      });
    }
  },
};

// Purchase Deliveries Service
export const purchaseDeliveriesService = {
  async getAll(): Promise<PurchaseDelivery[]> {
    const result = await db.select().from(schema.purchaseDeliveries);
    return result.map(delivery => ({
      ...delivery,
      kg: toNumber(delivery.kg),
      numberOfBeams: toNumber(delivery.numberOfBeams),
      weight: toNumber(delivery.weight),
      meters: toNumber(delivery.meters),
    } as PurchaseDelivery));
  },

  async create(delivery: PurchaseDelivery): Promise<void> {
    await db.insert(schema.purchaseDeliveries).values({
      id: delivery.id,
      purchaseId: delivery.purchaseId,
      date: delivery.date,
      kg: delivery.kg,
      numberOfBeams: delivery.numberOfBeams,
      beamNo: delivery.beamNo,
      weight: delivery.weight,
      meters: delivery.meters,
      notes: delivery.notes,
      createdAt: Date.now(),
    });
  },

  async update(id: string, delivery: PurchaseDelivery): Promise<void> {
    await db.update(schema.purchaseDeliveries)
      .set({
        ...delivery,
        updatedAt: Date.now(),
      })
      .where(eq(schema.purchaseDeliveries.id, id));
  },

  async delete(id: string): Promise<void> {
    await db.delete(schema.purchaseDeliveries).where(eq(schema.purchaseDeliveries.id, id));
  },
};

// Sale Deliveries Service
export const saleDeliveriesService = {
  async getAll(): Promise<SaleDelivery[]> {
    const result = await db.select().from(schema.saleDeliveries);
    return result.map(delivery => ({
      ...delivery,
      takas: toNumber(delivery.takas),
      meters: toNumber(delivery.meters),
    } as SaleDelivery));
  },

  async create(delivery: SaleDelivery): Promise<void> {
    await db.insert(schema.saleDeliveries).values({
      ...delivery,
      createdAt: Date.now(),
    });
  },

  async update(id: string, delivery: SaleDelivery): Promise<void> {
    await db.update(schema.saleDeliveries)
      .set({
        ...delivery,
        updatedAt: Date.now(),
      })
      .where(eq(schema.saleDeliveries.id, id));
  },

  async delete(id: string): Promise<void> {
    await db.delete(schema.saleDeliveries).where(eq(schema.saleDeliveries.id, id));
  },
};
