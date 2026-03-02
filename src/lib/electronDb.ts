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
    Note,
    BegariWorker,
    TFOAttendance,
    TFOWorker,
    MasterWorker,
    WiremanBill,
    WiremanWorker,
    BobbinWorker,
    BobbinAttendance,
    YarnConversionCalculation,
    FabricCalculation,
    GSMCalculation,
    QualityCalculation,
    TFOProductionCalculation,
    WarpingProductionCalculation,
    YarnConsumptionCalculation,
    PurchaseDelivery,
    SaleDelivery
} from './types';
import { TABLE_NAMES, ALL_DATA_TABLES } from './types';
import { getActiveFactoryPrefix } from './factoryContext';

// Electron storage adapter with SQLite
class ElectronDatabase {
    // Helper to get factory prefix
    private getFactory(): string {
        return getActiveFactoryPrefix();
    }

    // Generic CRUD operations mapped to SQLite

    private async get<T>(table: string): Promise<T[]> {
        if (!window.electronAPI) return [];
        return window.electronAPI.dbGet(this.getFactory(), table);
    }

    private async add<T>(table: string, item: T): Promise<void> {
        if (!window.electronAPI) return;
        await window.electronAPI.dbAdd(this.getFactory(), table, item);
    }

    private async update<T extends { id: string }>(table: string, id: string, item: T): Promise<void> {
        if (!window.electronAPI) return;
        await window.electronAPI.dbUpdate(this.getFactory(), table, item);
    }

    private async delete(table: string, id: string): Promise<void> {
        if (!window.electronAPI) return;
        await window.electronAPI.dbDelete(this.getFactory(), table, id);
    }

    // Test connection
    async testConnection(): Promise<boolean> {
        return !!window.electronAPI;
    }

    // Trigger Migration
    async migrate(): Promise<void> {
        if (window.electronAPI && window.electronAPI.migrateJsonToSqlite) {
            await window.electronAPI.migrateJsonToSqlite();
        }
    }

    // Beams operations
    async getBeams(): Promise<Beam[]> { return this.get<Beam>(TABLE_NAMES.beams); }
    async addBeam(beam: Beam): Promise<void> { return this.add(TABLE_NAMES.beams, beam); }
    async updateBeam(id: string, beam: Beam): Promise<void> { return this.update(TABLE_NAMES.beams, id, beam); }
    async deleteBeam(id: string): Promise<void> { return this.delete(TABLE_NAMES.beams, id); }

    // Takas operations
    async getTakas(): Promise<Taka[]> { return this.get<Taka>(TABLE_NAMES.takas); }
    async addTaka(taka: Taka): Promise<void> { return this.add(TABLE_NAMES.takas, taka); }
    async updateTaka(id: string, taka: Taka): Promise<void> { return this.update(TABLE_NAMES.takas, id, taka); }
    async deleteTaka(id: string): Promise<void> { return this.delete(TABLE_NAMES.takas, id); }

    // Worker Profiles operations
    async getWorkerProfiles(): Promise<WorkerProfile[]> { return this.get<WorkerProfile>(TABLE_NAMES.workerProfiles); }
    async addWorkerProfile(profile: WorkerProfile): Promise<void> { return this.add(TABLE_NAMES.workerProfiles, profile); }
    async updateWorkerProfile(id: string, profile: WorkerProfile): Promise<void> { return this.update(TABLE_NAMES.workerProfiles, id, profile); }
    async deleteWorkerProfile(id: string): Promise<void> { return this.delete(TABLE_NAMES.workerProfiles, id); }

    // Qualities operations
    async getQualities(): Promise<Quality[]> { return this.get<Quality>(TABLE_NAMES.qualities); }
    async addQuality(quality: Quality): Promise<void> { return this.add(TABLE_NAMES.qualities, quality); }
    async updateQuality(id: string, quality: Quality): Promise<void> { return this.update(TABLE_NAMES.qualities, id, quality); }
    async deleteQuality(id: string): Promise<void> { return this.delete(TABLE_NAMES.qualities, id); }

    // Sales operations
    async getSales(): Promise<Sale[]> { return this.get<Sale>(TABLE_NAMES.sales); }
    async addSale(sale: Sale): Promise<void> { return this.add(TABLE_NAMES.sales, sale); }
    async updateSale(id: string, sale: Sale): Promise<void> { return this.update(TABLE_NAMES.sales, id, sale); }
    async deleteSale(id: string): Promise<void> { return this.delete(TABLE_NAMES.sales, id); }

    // Purchases operations
    async getPurchases(): Promise<Purchase[]> { return this.get<Purchase>(TABLE_NAMES.purchases); }
    async addPurchase(purchase: Purchase): Promise<void> { return this.add(TABLE_NAMES.purchases, purchase); }
    async updatePurchase(id: string, purchase: Purchase): Promise<void> { return this.update(TABLE_NAMES.purchases, id, purchase); }
    async deletePurchase(id: string): Promise<void> { return this.delete(TABLE_NAMES.purchases, id); }

    // Firms operations
    async getFirms(): Promise<Firm[]> { return this.get<Firm>(TABLE_NAMES.firms); }
    async addFirm(firm: Firm): Promise<void> { return this.add(TABLE_NAMES.firms, firm); }
    async updateFirm(id: string, firm: Firm): Promise<void> { return this.update(TABLE_NAMES.firms, id, firm); }
    async deleteFirm(id: string): Promise<void> { return this.delete(TABLE_NAMES.firms, id); }

    // Transactions operations
    async getTransactions(): Promise<Transaction[]> { return this.get<Transaction>(TABLE_NAMES.transactions); }
    async addTransaction(transaction: Transaction): Promise<void> { return this.add(TABLE_NAMES.transactions, transaction); }
    async updateTransaction(id: string, transaction: Transaction): Promise<void> { return this.update(TABLE_NAMES.transactions, id, transaction); }
    async deleteTransaction(id: string): Promise<void> { return this.delete(TABLE_NAMES.transactions, id); }

    // Stock operations
    async getStock(): Promise<Stock[]> { return this.get<Stock>(TABLE_NAMES.stock); }
    async addStock(stock: Stock): Promise<void> { return this.add(TABLE_NAMES.stock, stock); }
    async updateStock(id: string, stock: Stock): Promise<void> { return this.update(TABLE_NAMES.stock, id, stock); }
    async deleteStock(id: string): Promise<void> { return this.delete(TABLE_NAMES.stock, id); }

    // Beam Pasar operations
    async getBeamPasars(): Promise<BeamPasar[]> { return this.get<BeamPasar>(TABLE_NAMES.beamPasar); }
    async addBeamPasar(beamPasar: BeamPasar): Promise<void> { return this.add(TABLE_NAMES.beamPasar, beamPasar); }
    async updateBeamPasar(id: string, beamPasar: BeamPasar): Promise<void> { return this.update(TABLE_NAMES.beamPasar, id, beamPasar); }
    async deleteBeamPasar(id: string): Promise<void> { return this.delete(TABLE_NAMES.beamPasar, id); }

    // Worker Sheet Data operations
    async getWorkerSheetData(): Promise<WorkerSheetData | null> {
        const data = await this.get<WorkerSheetData>(TABLE_NAMES.workerSheetData);
        return data.length > 0 ? data[0] : null;
    }

    async setWorkerSheetData(data: WorkerSheetData): Promise<void> {
        const existing = await this.getWorkerSheetData();
        const dataWithId = data as WorkerSheetData & { id: string };

        if (existing) {
            dataWithId.id = (existing as any).id || 'main';
            await this.update(TABLE_NAMES.workerSheetData, dataWithId.id, dataWithId);
        } else {
            dataWithId.id = 'main';
            await this.add(TABLE_NAMES.workerSheetData, dataWithId);
        }
    }

    // Notes operations
    async getNotes(): Promise<Note[]> { return this.get<Note>(TABLE_NAMES.notes); }
    async addNote(note: Note): Promise<void> { return this.add(TABLE_NAMES.notes, note); }
    async updateNote(id: string, note: Note): Promise<void> { return this.update(TABLE_NAMES.notes, id, note); }
    async deleteNote(id: string): Promise<void> { return this.delete(TABLE_NAMES.notes, id); }

    // --- Additional Workers ---

    async getBegariWorkers(): Promise<BegariWorker[]> { return this.get<BegariWorker>(TABLE_NAMES.begariWorkers); }
    async addBegariWorker(w: BegariWorker): Promise<void> { return this.add(TABLE_NAMES.begariWorkers, w); }
    async updateBegariWorker(id: string, w: BegariWorker): Promise<void> { return this.update(TABLE_NAMES.begariWorkers, id, w); }
    async deleteBegariWorker(id: string): Promise<void> { return this.delete(TABLE_NAMES.begariWorkers, id); }

    async getTFOWorkers(): Promise<TFOWorker[]> { return this.get<TFOWorker>(TABLE_NAMES.tfoWorkers); }
    async addTFOWorker(w: TFOWorker): Promise<void> { return this.add(TABLE_NAMES.tfoWorkers, w); }
    async updateTFOWorker(id: string, w: TFOWorker): Promise<void> { return this.update(TABLE_NAMES.tfoWorkers, id, w); }
    async deleteTFOWorker(id: string): Promise<void> { return this.delete(TABLE_NAMES.tfoWorkers, id); }

    async getTFOAttendance(): Promise<TFOAttendance[]> { return this.get<TFOAttendance>(TABLE_NAMES.tfoAttendance); }
    async addTFOAttendance(a: TFOAttendance): Promise<void> { return this.add(TABLE_NAMES.tfoAttendance, a); }
    async updateTFOAttendance(id: string, a: TFOAttendance): Promise<void> { return this.update(TABLE_NAMES.tfoAttendance, id, a); }
    async deleteTFOAttendance(id: string): Promise<void> { return this.delete(TABLE_NAMES.tfoAttendance, id); }

    async getMasterWorkers(): Promise<MasterWorker[]> { return this.get<MasterWorker>(TABLE_NAMES.masterWorkers); }
    async addMasterWorker(w: MasterWorker): Promise<void> { return this.add(TABLE_NAMES.masterWorkers, w); }
    async updateMasterWorker(id: string, w: MasterWorker): Promise<void> { return this.update(TABLE_NAMES.masterWorkers, id, w); }
    async deleteMasterWorker(id: string): Promise<void> { return this.delete(TABLE_NAMES.masterWorkers, id); }

    async getWiremanWorkers(): Promise<WiremanWorker[]> { return this.get<WiremanWorker>(TABLE_NAMES.wiremanWorkers); }
    async addWiremanWorker(w: WiremanWorker): Promise<void> { return this.add(TABLE_NAMES.wiremanWorkers, w); }
    async updateWiremanWorker(id: string, w: WiremanWorker): Promise<void> { return this.update(TABLE_NAMES.wiremanWorkers, id, w); }
    async deleteWiremanWorker(id: string): Promise<void> { return this.delete(TABLE_NAMES.wiremanWorkers, id); }

    async getWiremanBills(): Promise<WiremanBill[]> { return this.get<WiremanBill>(TABLE_NAMES.wiremanBills); }
    async addWiremanBill(b: WiremanBill): Promise<void> { return this.add(TABLE_NAMES.wiremanBills, b); }
    async updateWiremanBill(id: string, b: WiremanBill): Promise<void> { return this.update(TABLE_NAMES.wiremanBills, id, b); }
    async deleteWiremanBill(id: string): Promise<void> { return this.delete(TABLE_NAMES.wiremanBills, id); }

    async getBobbinWorkers(): Promise<BobbinWorker[]> { return this.get<BobbinWorker>(TABLE_NAMES.bobbinWorkers); }
    async addBobbinWorker(w: BobbinWorker): Promise<void> { return this.add(TABLE_NAMES.bobbinWorkers, w); }
    async updateBobbinWorker(id: string, w: BobbinWorker): Promise<void> { return this.update(TABLE_NAMES.bobbinWorkers, id, w); }
    async deleteBobbinWorker(id: string): Promise<void> { return this.delete(TABLE_NAMES.bobbinWorkers, id); }

    async getBobbinAttendance(): Promise<BobbinAttendance[]> { return this.get<BobbinAttendance>(TABLE_NAMES.bobbinAttendance); }
    async addBobbinAttendance(a: BobbinAttendance): Promise<void> { return this.add(TABLE_NAMES.bobbinAttendance, a); }
    async updateBobbinAttendance(id: string, a: BobbinAttendance): Promise<void> { return this.update(TABLE_NAMES.bobbinAttendance, id, a); }
    async deleteBobbinAttendance(id: string): Promise<void> { return this.delete(TABLE_NAMES.bobbinAttendance, id); }

    // --- Textile Calculations ---

    async getYarnConversions(): Promise<YarnConversionCalculation[]> { return this.get<YarnConversionCalculation>(TABLE_NAMES.yarnConversions); }
    async addYarnConversion(c: YarnConversionCalculation): Promise<void> { return this.add(TABLE_NAMES.yarnConversions, c); }
    async updateYarnConversion(id: string, c: YarnConversionCalculation): Promise<void> { return this.update(TABLE_NAMES.yarnConversions, id, c); }
    async deleteYarnConversion(id: string): Promise<void> { return this.delete(TABLE_NAMES.yarnConversions, id); }

    async getFabricCalculations(): Promise<FabricCalculation[]> { return this.get<FabricCalculation>(TABLE_NAMES.fabricCalculations); }
    async addFabricCalculation(c: FabricCalculation): Promise<void> { return this.add(TABLE_NAMES.fabricCalculations, c); }
    async updateFabricCalculation(id: string, c: FabricCalculation): Promise<void> { return this.update(TABLE_NAMES.fabricCalculations, id, c); }
    async deleteFabricCalculation(id: string): Promise<void> { return this.delete(TABLE_NAMES.fabricCalculations, id); }

    async getGSMCalculations(): Promise<GSMCalculation[]> { return this.get<GSMCalculation>(TABLE_NAMES.gsmCalculations); }
    async addGSMCalculation(c: GSMCalculation): Promise<void> { return this.add(TABLE_NAMES.gsmCalculations, c); }
    async updateGSMCalculation(id: string, c: GSMCalculation): Promise<void> { return this.update(TABLE_NAMES.gsmCalculations, id, c); }
    async deleteGSMCalculation(id: string): Promise<void> { return this.delete(TABLE_NAMES.gsmCalculations, id); }

    async getQualityCalculations(): Promise<QualityCalculation[]> { return this.get<QualityCalculation>(TABLE_NAMES.qualityCalculations); }
    async addQualityCalculation(c: QualityCalculation): Promise<void> { return this.add(TABLE_NAMES.qualityCalculations, c); }
    async updateQualityCalculation(id: string, c: QualityCalculation): Promise<void> { return this.update(TABLE_NAMES.qualityCalculations, id, c); }
    async deleteQualityCalculation(id: string): Promise<void> { return this.delete(TABLE_NAMES.qualityCalculations, id); }

    async getTFOProductions(): Promise<TFOProductionCalculation[]> { return this.get<TFOProductionCalculation>(TABLE_NAMES.tfoProductions); }
    async addTFOProduction(c: TFOProductionCalculation): Promise<void> { return this.add(TABLE_NAMES.tfoProductions, c); }
    async updateTFOProduction(id: string, c: TFOProductionCalculation): Promise<void> { return this.update(TABLE_NAMES.tfoProductions, id, c); }
    async deleteTFOProduction(id: string): Promise<void> { return this.delete(TABLE_NAMES.tfoProductions, id); }

    async getWarpingProductions(): Promise<WarpingProductionCalculation[]> { return this.get<WarpingProductionCalculation>(TABLE_NAMES.warpingProductions); }
    async addWarpingProduction(c: WarpingProductionCalculation): Promise<void> { return this.add(TABLE_NAMES.warpingProductions, c); }
    async updateWarpingProduction(id: string, c: WarpingProductionCalculation): Promise<void> { return this.update(TABLE_NAMES.warpingProductions, id, c); }
    async deleteWarpingProduction(id: string): Promise<void> { return this.delete(TABLE_NAMES.warpingProductions, id); }

    async getYarnConsumptions(): Promise<YarnConsumptionCalculation[]> { return this.get<YarnConsumptionCalculation>(TABLE_NAMES.yarnConsumptions); }
    async addYarnConsumption(c: YarnConsumptionCalculation): Promise<void> { return this.add(TABLE_NAMES.yarnConsumptions, c); }
    async updateYarnConsumption(id: string, c: YarnConsumptionCalculation): Promise<void> { return this.update(TABLE_NAMES.yarnConsumptions, id, c); }
    async deleteYarnConsumption(id: string): Promise<void> { return this.delete(TABLE_NAMES.yarnConsumptions, id); }

    // Purchase Deliveries
    async getPurchaseDeliveries(): Promise<PurchaseDelivery[]> { return this.get<PurchaseDelivery>(TABLE_NAMES.purchaseDeliveries); }
    async addPurchaseDelivery(d: PurchaseDelivery): Promise<void> { return this.add(TABLE_NAMES.purchaseDeliveries, d); }
    async updatePurchaseDelivery(id: string, d: PurchaseDelivery): Promise<void> { return this.update(TABLE_NAMES.purchaseDeliveries, id, d); }
    async deletePurchaseDelivery(id: string): Promise<void> { return this.delete(TABLE_NAMES.purchaseDeliveries, id); }

    // Sale Deliveries
    async getSaleDeliveries(): Promise<SaleDelivery[]> { return this.get<SaleDelivery>(TABLE_NAMES.saleDeliveries); }
    async addSaleDelivery(d: SaleDelivery): Promise<void> { return this.add(TABLE_NAMES.saleDeliveries, d); }
    async updateSaleDelivery(id: string, d: SaleDelivery): Promise<void> { return this.update(TABLE_NAMES.saleDeliveries, id, d); }
    async deleteSaleDelivery(id: string): Promise<void> { return this.delete(TABLE_NAMES.saleDeliveries, id); }


    // Clear Methods

    private async clearTable(table: string): Promise<void> {
        const items = await this.get<any>(table);
        for (const item of items) {
            if (item.id) await this.delete(table, item.id);
        }
    }

    async clearBeams(): Promise<void> { await this.clearTable(TABLE_NAMES.beams); }
    async clearBeamPasars(): Promise<void> { await this.clearTable(TABLE_NAMES.beamPasar); }
    async clearTFOAttendance(): Promise<void> { await this.clearTable(TABLE_NAMES.tfoAttendance); }
    async clearBobbinAttendance(): Promise<void> { await this.clearTable(TABLE_NAMES.bobbinAttendance); }
    async clearWiremanBills(): Promise<void> { await this.clearTable(TABLE_NAMES.wiremanBills); }
    async clearWorkerSheetData(): Promise<void> { await this.clearTable(TABLE_NAMES.workerSheetData); }


    // Database status
    isConnected(): boolean {
        return !!window.electronAPI;
    }

    // Clear all data (for testing/reset)
    async clearAll(): Promise<void> {
        if (window.electronAPI && window.electronAPI.deleteAllData) {
            console.log('[ElectronDB] Using hard delete to clear all data');
            await window.electronAPI.deleteAllData();
        }
        window.localStorage.clear();
    }

    // Export data (for backup)
    async exportData(): Promise<Record<string, any[]>> {
        const exportData: Record<string, any[]> = {};

        for (const table of ALL_DATA_TABLES) {
            exportData[table] = await this.get(table);
        }

        return exportData;
    }

    // Import data (for restore)
    async importData(data: Record<string, any[]>): Promise<void> {
        for (const [table, items] of Object.entries(data)) {
            for (const item of items) {
                await this.add(table, item);
            }
        }
    }
}

export const electronDb = new ElectronDatabase();
