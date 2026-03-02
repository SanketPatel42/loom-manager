import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { asyncStorage } from '@/lib/storage';
import { emitDataChange, onDataChange } from '@/lib/events';
import { useEffect } from 'react';
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
  TFOWorker,
  TFOAttendance,
  MasterWorker,
  WiremanWorker,
  WiremanBill,
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
  SaleDelivery,
} from '@/lib/types';

// Generic hook for TanStack Query based storage operations
export function useAsyncStorage<T extends { id?: string }>(
  entityName: string,
  getMethod: () => Promise<T[]>,
  addMethod: (item: T) => Promise<void>,
  updateMethod: (id: string, item: T) => Promise<void>,
  deleteMethod: (id: string) => Promise<void>
) {
  const queryClient = useQueryClient();
  const queryKey = [entityName];

  // Fetch data
  const { data = [], isLoading: loading, error, refetch: refresh } = useQuery({
    queryKey,
    queryFn: getMethod,
  });

  // Listen for external changes (from other windows or direct storage calls)
  useEffect(() => {
    return onDataChange((event) => {
      if (event.detail.entity === entityName) {
        queryClient.invalidateQueries({ queryKey });
      }
    });
  }, [entityName, queryClient, queryKey]);

  // Mutations
  const addMutation = useMutation({
    mutationFn: addMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      emitDataChange(entityName, 'create');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, item }: { id: string; item: T }) => updateMethod(id, item),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey });
      emitDataChange(entityName, 'update', variables.id);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMethod,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey });
      emitDataChange(entityName, 'delete', variables);
    },
  });

  return {
    data,
    loading,
    error: error instanceof Error ? error.message : null,
    refresh,
    add: (item: T) => addMutation.mutateAsync(item),
    update: (id: string, item: T) => updateMutation.mutateAsync({ id, item }),
    delete: (id: string) => deleteMutation.mutateAsync(id),
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

// Specific hooks for each entity
export const useBeams = () => useAsyncStorage<Beam>(
  'beams',
  () => asyncStorage.getBeams(),
  (item) => asyncStorage.addBeam(item),
  (id, item) => asyncStorage.updateBeam(id, item),
  (id) => asyncStorage.deleteBeam(id)
);

export const useTakas = () => useAsyncStorage<Taka>(
  'takas',
  () => asyncStorage.getTakas(),
  (item) => asyncStorage.addTaka(item),
  (id, item) => asyncStorage.updateTaka(id, item),
  (id) => asyncStorage.deleteTaka(id)
);

export const useWorkerProfiles = () => useAsyncStorage<WorkerProfile>(
  'workerProfiles',
  () => asyncStorage.getWorkerProfiles(),
  (item) => asyncStorage.addWorkerProfile(item),
  (id, item) => asyncStorage.updateWorkerProfile(id, item),
  (id) => asyncStorage.deleteWorkerProfile(id)
);

export const useQualities = () => useAsyncStorage<Quality>(
  'qualities',
  () => asyncStorage.getQualities(),
  (item) => asyncStorage.addQuality(item),
  (id, item) => asyncStorage.updateQuality(id, item),
  (id) => asyncStorage.deleteQuality(id)
);

export const useSales = () => useAsyncStorage<Sale>(
  'sales',
  () => asyncStorage.getSales(),
  (item) => asyncStorage.addSale(item),
  (id, item) => asyncStorage.updateSale(id, item),
  (id) => asyncStorage.deleteSale(id)
);

export const usePurchases = () => useAsyncStorage<Purchase>(
  'purchases',
  () => asyncStorage.getPurchases(),
  (item) => asyncStorage.addPurchase(item),
  (id, item) => asyncStorage.updatePurchase(id, item),
  (id) => asyncStorage.deletePurchase(id)
);

export const useFirms = () => useAsyncStorage<Firm>(
  'firms',
  () => asyncStorage.getFirms(),
  (item) => asyncStorage.addFirm(item),
  (id, item) => asyncStorage.updateFirm(id, item),
  (id) => asyncStorage.deleteFirm(id)
);

export const useTransactions = () => useAsyncStorage<Transaction>(
  'transactions',
  () => asyncStorage.getTransactions(),
  (item) => asyncStorage.addTransaction(item),
  (id, item) => asyncStorage.updateTransaction(id, item),
  (id) => asyncStorage.deleteTransaction(id)
);

export const useStock = () => useAsyncStorage<Stock>(
  'stock',
  () => asyncStorage.getStock(),
  (item) => asyncStorage.addStock(item),
  (id, item) => asyncStorage.updateStock(id, item),
  (id) => asyncStorage.deleteStock(id)
);

export const useBeamPasar = () => useAsyncStorage<BeamPasar>(
  'beamPasar',
  () => asyncStorage.getBeamPasars(),
  (item) => asyncStorage.addBeamPasar(item),
  (id, item) => asyncStorage.updateBeamPasar(id, item),
  (id) => asyncStorage.deleteBeamPasar(id)
);

export const useNotes = () => useAsyncStorage<Note>(
  'notes',
  () => asyncStorage.getNotes(),
  (item) => asyncStorage.addNote(item),
  (id, item) => asyncStorage.updateNote(id, item),
  (id) => asyncStorage.deleteNote(id)
);

export const useBegariWorkers = () => useAsyncStorage<BegariWorker>(
  'begariWorkers',
  () => asyncStorage.getBegariWorkers(),
  (item) => asyncStorage.addBegariWorker(item),
  (id, item) => asyncStorage.updateBegariWorker(id, item),
  (id) => asyncStorage.deleteBegariWorker(id)
);

export const useTFOWorkers = () => useAsyncStorage<TFOWorker>(
  'tfoWorkers',
  () => asyncStorage.getTFOWorkers(),
  (item) => asyncStorage.addTFOWorker(item),
  (id, item) => asyncStorage.updateTFOWorker(id, item),
  (id) => asyncStorage.deleteTFOWorker(id)
);

export const useTFOAttendance = () => useAsyncStorage<TFOAttendance>(
  'tfoAttendance',
  () => asyncStorage.getTFOAttendance(),
  (item) => asyncStorage.addTFOAttendance(item),
  (id, item) => asyncStorage.updateTFOAttendance(id, item),
  (id) => asyncStorage.deleteTFOAttendance(id)
);

export const useMasterWorkers = () => useAsyncStorage<MasterWorker>(
  'masterWorkers',
  () => asyncStorage.getMasterWorkers(),
  (item) => asyncStorage.addMasterWorker(item),
  (id, item) => asyncStorage.updateMasterWorker(id, item),
  (id) => asyncStorage.deleteMasterWorker(id)
);

export const useWiremanWorkers = () => useAsyncStorage<WiremanWorker>(
  'wiremanWorkers',
  () => asyncStorage.getWiremanWorkers(),
  (item) => asyncStorage.addWiremanWorker(item),
  (id, item) => asyncStorage.updateWiremanWorker(id, item),
  (id) => asyncStorage.deleteWiremanWorker(id)
);

export const useWiremanBills = () => useAsyncStorage<WiremanBill>(
  'wiremanBills',
  () => asyncStorage.getWiremanBills(),
  (item) => asyncStorage.addWiremanBill(item),
  (id, item) => asyncStorage.updateWiremanBill(id, item),
  (id) => asyncStorage.deleteWiremanBill(id)
);

export const useBobbinWorkers = () => useAsyncStorage<BobbinWorker>(
  'bobbinWorkers',
  () => asyncStorage.getBobbinWorkers(),
  (item) => asyncStorage.addBobbinWorker(item),
  (id, item) => asyncStorage.updateBobbinWorker(id, item),
  (id) => asyncStorage.deleteBobbinWorker(id)
);

export const useBobbinAttendance = () => useAsyncStorage<BobbinAttendance>(
  'bobbinAttendance',
  () => asyncStorage.getBobbinAttendance(),
  (item) => asyncStorage.addBobbinAttendance(item),
  (id, item) => asyncStorage.updateBobbinAttendance(id, item),
  (id) => asyncStorage.deleteBobbinAttendance(id)
);

// Textile Calculation Hooks
export const useYarnConversions = () => useAsyncStorage<YarnConversionCalculation>(
  'yarnConversions',
  () => asyncStorage.getYarnConversions(),
  (item) => asyncStorage.addYarnConversion(item),
  (id, item) => asyncStorage.updateYarnConversion(id, item),
  (id) => asyncStorage.deleteYarnConversion(id)
);

export const useFabricCalculations = () => useAsyncStorage<FabricCalculation>(
  'fabricCalculations',
  () => asyncStorage.getFabricCalculations(),
  (item) => asyncStorage.addFabricCalculation(item),
  (id, item) => asyncStorage.updateFabricCalculation(id, item),
  (id) => asyncStorage.deleteFabricCalculation(id)
);

export const useGSMCalculations = () => useAsyncStorage<GSMCalculation>(
  'gsmCalculations',
  () => asyncStorage.getGSMCalculations(),
  (item) => asyncStorage.addGSMCalculation(item),
  (id, item) => asyncStorage.updateGSMCalculation(id, item),
  (id) => asyncStorage.deleteGSMCalculation(id)
);

export const useQualityCalculations = () => useAsyncStorage<QualityCalculation>(
  'qualityCalculations',
  () => asyncStorage.getQualityCalculations(),
  (item) => asyncStorage.addQualityCalculation(item),
  (id, item) => asyncStorage.updateQualityCalculation(id, item),
  (id) => asyncStorage.deleteQualityCalculation(id)
);

export const useTFOProductions = () => useAsyncStorage<TFOProductionCalculation>(
  'tfoProductions',
  () => asyncStorage.getTFOProductions(),
  (item) => asyncStorage.addTFOProduction(item),
  (id, item) => asyncStorage.updateTFOProduction(id, item),
  (id) => asyncStorage.deleteTFOProduction(id)
);

export const useWarpingProductions = () => useAsyncStorage<WarpingProductionCalculation>(
  'warpingProductions',
  () => asyncStorage.getWarpingProductions(),
  (item) => asyncStorage.addWarpingProduction(item),
  (id, item) => asyncStorage.updateWarpingProduction(id, item),
  (id) => asyncStorage.deleteWarpingProduction(id)
);

export const useYarnConsumptions = () => useAsyncStorage<YarnConsumptionCalculation>(
  'yarnConsumptions',
  () => asyncStorage.getYarnConsumptions(),
  (item) => asyncStorage.addYarnConsumption(item),
  (id, item) => asyncStorage.updateYarnConsumption(id, item),
  (id) => asyncStorage.deleteYarnConsumption(id)
);

export const usePurchaseDeliveries = () => useAsyncStorage<PurchaseDelivery>(
  'purchaseDeliveries',
  () => asyncStorage.getPurchaseDeliveries(),
  (item) => asyncStorage.addPurchaseDelivery(item),
  (id, item) => asyncStorage.updatePurchaseDelivery(id, item),
  (id) => asyncStorage.deletePurchaseDelivery(id)
);

export const useSaleDeliveries = () => useAsyncStorage<SaleDelivery>(
  'saleDeliveries',
  () => asyncStorage.getSaleDeliveries(),
  (item) => asyncStorage.addSaleDelivery(item),
  (id, item) => asyncStorage.updateSaleDelivery(id, item),
  (id) => asyncStorage.deleteSaleDelivery(id)
);

// Special hook for worker sheet data (single record)
export function useWorkerSheetData() {
  const queryClient = useQueryClient();
  const queryKey = ['workerSheetData'];

  const { data = null, isLoading: loading, error, refetch: refresh } = useQuery({
    queryKey,
    queryFn: () => asyncStorage.getWorkerSheetData(),
  });

  const mutation = useMutation({
    mutationFn: (newData: WorkerSheetData) => asyncStorage.setWorkerSheetData(newData),
    onSuccess: (newData) => {
      queryClient.setQueryData(queryKey, newData);
      emitDataChange('workerSheetData', 'update');
    },
  });

  return {
    data,
    loading,
    error: error instanceof Error ? error.message : null,
    refresh,
    save: (newData: WorkerSheetData) => mutation.mutateAsync(newData),
    clear: async () => {
      await asyncStorage.clearWorkerSheetData();
      queryClient.invalidateQueries({ queryKey: ['workerSheetData'] });
    },
    isSaving: mutation.isPending,
  };
}