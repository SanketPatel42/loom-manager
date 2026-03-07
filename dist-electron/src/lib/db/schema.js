"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saleDeliveries = exports.purchaseDeliveries = exports.yarnConsumptions = exports.warpingProductions = exports.tfoProductions = exports.qualityCalculations = exports.gsmCalculations = exports.fabricCalculations = exports.yarnConversions = exports.bobbinAttendance = exports.bobbinWorkers = exports.wiremanBills = exports.wiremanWorkers = exports.masterWorkers = exports.tfoAttendance = exports.tfoWorkers = exports.begariWorkers = exports.notes = exports.workerSheetData = exports.beamPasar = exports.stock = exports.transactions = exports.firms = exports.purchases = exports.sales = exports.qualities = exports.workerProfiles = exports.takas = exports.beams = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
// Beams table
exports.beams = (0, sqlite_core_1.sqliteTable)('beams', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    date: (0, sqlite_core_1.text)('date').notNull(),
    warper: (0, sqlite_core_1.text)('warper').notNull(),
    beamNo: (0, sqlite_core_1.text)('beam_no').notNull(),
    noOfTakas: (0, sqlite_core_1.real)('no_of_takas').notNull(),
    noOfTar: (0, sqlite_core_1.real)('no_of_tar').notNull(),
    pricePerBeam: (0, sqlite_core_1.real)('price_per_beam').notNull(),
    total: (0, sqlite_core_1.real)('total').notNull(),
    qualityId: (0, sqlite_core_1.text)('quality_id'),
    createdAt: (0, sqlite_core_1.integer)('created_at').default((Date.now())),
    updatedAt: (0, sqlite_core_1.integer)('updated_at').default((Date.now())),
});
// Takas table
exports.takas = (0, sqlite_core_1.sqliteTable)('takas', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    date: (0, sqlite_core_1.text)('date').notNull(),
    available: (0, sqlite_core_1.real)('available').notNull(),
    folded: (0, sqlite_core_1.real)('folded').notNull(),
    remaining: (0, sqlite_core_1.real)('remaining').notNull(),
    qualityId: (0, sqlite_core_1.text)('quality_id'),
    createdAt: (0, sqlite_core_1.integer)('created_at').default((Date.now())),
    updatedAt: (0, sqlite_core_1.integer)('updated_at').default((Date.now())),
});
// Worker Profiles table
exports.workerProfiles = (0, sqlite_core_1.sqliteTable)('worker_profiles', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    name: (0, sqlite_core_1.text)('name').notNull(),
    phoneNumber: (0, sqlite_core_1.text)('phone_number').notNull(),
    emergencyContact: (0, sqlite_core_1.text)('emergency_contact').notNull(),
    createdAt: (0, sqlite_core_1.integer)('created_at').default((Date.now())),
    updatedAt: (0, sqlite_core_1.integer)('updated_at').default((Date.now())),
});
// Qualities table
exports.qualities = (0, sqlite_core_1.sqliteTable)('qualities', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    name: (0, sqlite_core_1.text)('name').notNull(),
    ratePerMeter: (0, sqlite_core_1.real)('rate_per_meter').notNull(),
    description: (0, sqlite_core_1.text)('description'),
    epi: (0, sqlite_core_1.real)('epi'),
    ppi: (0, sqlite_core_1.real)('ppi'),
    danier: (0, sqlite_core_1.text)('danier'),
    tars: (0, sqlite_core_1.real)('tars'),
    beamRate: (0, sqlite_core_1.real)('beam_rate'),
    beamPasarRate: (0, sqlite_core_1.real)('beam_pasar_rate'),
    createdAt: (0, sqlite_core_1.integer)('created_at').default((Date.now())),
    updatedAt: (0, sqlite_core_1.integer)('updated_at').default((Date.now())),
});
// Sales table
exports.sales = (0, sqlite_core_1.sqliteTable)('sales', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    date: (0, sqlite_core_1.text)('date').notNull(),
    party: (0, sqlite_core_1.text)('party').notNull(),
    takas: (0, sqlite_core_1.real)('takas').notNull(),
    meters: (0, sqlite_core_1.real)('meters').notNull(),
    ratePerMeter: (0, sqlite_core_1.real)('rate_per_meter').notNull(),
    amount: (0, sqlite_core_1.real)('amount').notNull(),
    tax: (0, sqlite_core_1.real)('tax').notNull(),
    total: (0, sqlite_core_1.real)('total').notNull(),
    paymentTerms: (0, sqlite_core_1.integer)('payment_terms').notNull(),
    expectedPaymentDate: (0, sqlite_core_1.text)('expected_payment_date').notNull(),
    status: (0, sqlite_core_1.text)('status').notNull().default('pending'),
    type: (0, sqlite_core_1.text)('type').notNull().default('spot'), // 'spot' | 'advance'
    qualityId: (0, sqlite_core_1.text)('quality_id'),
    paymentMethod: (0, sqlite_core_1.text)('payment_method'), // 'RTGS' | 'Cheque' | 'Cash' | 'Other'
    paidAmount: (0, sqlite_core_1.real)('paid_amount'),
    billNumbers: (0, sqlite_core_1.text)('bill_numbers'),
    paymentDate: (0, sqlite_core_1.text)('payment_date'),
    paymentNotes: (0, sqlite_core_1.text)('payment_notes'),
    createdAt: (0, sqlite_core_1.integer)('created_at').default((Date.now())),
    updatedAt: (0, sqlite_core_1.integer)('updated_at').default((Date.now())),
});
exports.purchases = (0, sqlite_core_1.sqliteTable)('purchases', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    date: (0, sqlite_core_1.text)('date').notNull(),
    supplier: (0, sqlite_core_1.text)('supplier').notNull(),
    type: (0, sqlite_core_1.text)('type').notNull().default('yarn'), // 'yarn' | 'beam'
    yarnType: (0, sqlite_core_1.text)('yarn_type'),
    danier: (0, sqlite_core_1.text)('danier'),
    tons: (0, sqlite_core_1.real)('tons'),
    ratePerTon: (0, sqlite_core_1.real)('rate_per_ton'),
    numberOfBeams: (0, sqlite_core_1.real)('number_of_beams'),
    ratePerBeam: (0, sqlite_core_1.real)('rate_per_beam'),
    qualityId: (0, sqlite_core_1.text)('quality_id'),
    tars: (0, sqlite_core_1.real)('tars'),
    meters: (0, sqlite_core_1.real)('meters'),
    total: (0, sqlite_core_1.real)('total').notNull(),
    createdAt: (0, sqlite_core_1.integer)('created_at').default((Date.now())),
    updatedAt: (0, sqlite_core_1.integer)('updated_at').default((Date.now())),
});
// Firms table
exports.firms = (0, sqlite_core_1.sqliteTable)('firms', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    name: (0, sqlite_core_1.text)('name').notNull(),
    gstNumber: (0, sqlite_core_1.text)('gst_number').notNull(),
    address: (0, sqlite_core_1.text)('address').notNull(),
    contactPerson: (0, sqlite_core_1.text)('contact_person').notNull(),
    phoneNumber: (0, sqlite_core_1.text)('phone_number').notNull(),
    email: (0, sqlite_core_1.text)('email').notNull(),
    documents: (0, sqlite_core_1.text)('documents', { mode: 'json' }).default('[]'),
    createdAt: (0, sqlite_core_1.integer)('created_at').default((Date.now())),
    updatedAt: (0, sqlite_core_1.integer)('updated_at').default((Date.now())),
});
// Transactions table
exports.transactions = (0, sqlite_core_1.sqliteTable)('transactions', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    date: (0, sqlite_core_1.text)('date').notNull(),
    firm: (0, sqlite_core_1.text)('firm').notNull(),
    type: (0, sqlite_core_1.text)('type').notNull(),
    amount: (0, sqlite_core_1.real)('amount').notNull(),
    purpose: (0, sqlite_core_1.text)('purpose').notNull(),
    payee: (0, sqlite_core_1.text)('payee').notNull(),
    createdAt: (0, sqlite_core_1.integer)('created_at').default((Date.now())),
    updatedAt: (0, sqlite_core_1.integer)('updated_at').default((Date.now())),
});
// Stock table
exports.stock = (0, sqlite_core_1.sqliteTable)('stock', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    date: (0, sqlite_core_1.text)('date').notNull(),
    yarnCount: (0, sqlite_core_1.text)('yarn_count').notNull(),
    boxesAvailable: (0, sqlite_core_1.integer)('boxes_available').notNull(),
    createdAt: (0, sqlite_core_1.integer)('created_at').default((Date.now())),
    updatedAt: (0, sqlite_core_1.integer)('updated_at').default((Date.now())),
});
// Beam Pasar table
exports.beamPasar = (0, sqlite_core_1.sqliteTable)('beam_pasar', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    date: (0, sqlite_core_1.text)('date').notNull(),
    beamNo: (0, sqlite_core_1.text)('beam_no').notNull(),
    count: (0, sqlite_core_1.integer)('count'), // Optional in interface
    tars: (0, sqlite_core_1.integer)('tars').notNull(),
    noOfTaka: (0, sqlite_core_1.integer)('no_of_taka'), // Optional in interface
    ratePerBeam: (0, sqlite_core_1.real)('rate_per_beam').notNull(),
    qualityId: (0, sqlite_core_1.text)('quality_id'),
    createdAt: (0, sqlite_core_1.integer)('created_at').default((Date.now())),
    updatedAt: (0, sqlite_core_1.integer)('updated_at').default((Date.now())),
});
// Worker Sheet Data table
exports.workerSheetData = (0, sqlite_core_1.sqliteTable)('worker_sheet_data', {
    id: (0, sqlite_core_1.text)('id').primaryKey().default('main'),
    assignments: (0, sqlite_core_1.text)('assignments', { mode: 'json' }).notNull(),
    gridData: (0, sqlite_core_1.text)('grid_data', { mode: 'json' }).notNull(),
    lastUpdated: (0, sqlite_core_1.text)('last_updated').default((new Date().toISOString())),
    createdAt: (0, sqlite_core_1.integer)('created_at').default((Date.now())),
    updatedAt: (0, sqlite_core_1.integer)('updated_at').default((Date.now())),
});
// Notes table
exports.notes = (0, sqlite_core_1.sqliteTable)('notes', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    title: (0, sqlite_core_1.text)('title').notNull(),
    content: (0, sqlite_core_1.text)('content').notNull(),
    isReminder: (0, sqlite_core_1.integer)('is_reminder', { mode: 'boolean' }).default(false),
    reminderDate: (0, sqlite_core_1.text)('reminder_date'),
    completed: (0, sqlite_core_1.integer)('completed', { mode: 'boolean' }).default(false),
    createdAt: (0, sqlite_core_1.text)('created_at').notNull(),
});
// Additional Workers & Attendance
// Begari Workers
exports.begariWorkers = (0, sqlite_core_1.sqliteTable)('begari_workers', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    name: (0, sqlite_core_1.text)('name').notNull(),
    phoneNumber: (0, sqlite_core_1.text)('phone_number').notNull(),
    monthlySalary: (0, sqlite_core_1.real)('monthly_salary').notNull(),
    joinDate: (0, sqlite_core_1.text)('join_date').notNull(),
});
// TFO Workers
exports.tfoWorkers = (0, sqlite_core_1.sqliteTable)('tfo_workers', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    name: (0, sqlite_core_1.text)('name').notNull(),
    phoneNumber: (0, sqlite_core_1.text)('phone_number').notNull(),
    fullDaySalary: (0, sqlite_core_1.real)('full_day_salary').notNull(),
    joinDate: (0, sqlite_core_1.text)('join_date').notNull(),
});
// TFO Attendance
exports.tfoAttendance = (0, sqlite_core_1.sqliteTable)('tfo_attendance', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    workerId: (0, sqlite_core_1.text)('worker_id').notNull(),
    date: (0, sqlite_core_1.text)('date').notNull(),
    type: (0, sqlite_core_1.text)('type').notNull(), // 'full' | 'half'
    cycle: (0, sqlite_core_1.text)('cycle').notNull(), // '1-15' | '16-30'
});
// Master Workers
exports.masterWorkers = (0, sqlite_core_1.sqliteTable)('master_workers', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    name: (0, sqlite_core_1.text)('name').notNull(),
    phoneNumber: (0, sqlite_core_1.text)('phone_number').notNull(),
    monthlySalary: (0, sqlite_core_1.real)('monthly_salary').notNull(),
    joinDate: (0, sqlite_core_1.text)('join_date').notNull(),
});
// Wireman Workers
exports.wiremanWorkers = (0, sqlite_core_1.sqliteTable)('wireman_workers', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    name: (0, sqlite_core_1.text)('name').notNull(),
    phoneNumber: (0, sqlite_core_1.text)('phone_number').notNull(),
    joinDate: (0, sqlite_core_1.text)('join_date').notNull(),
});
// Wireman Bills
exports.wiremanBills = (0, sqlite_core_1.sqliteTable)('wireman_bills', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    workerId: (0, sqlite_core_1.text)('worker_id').notNull(),
    date: (0, sqlite_core_1.text)('date').notNull(),
    billAmount: (0, sqlite_core_1.real)('bill_amount').notNull(),
    description: (0, sqlite_core_1.text)('description').notNull(),
    cycle: (0, sqlite_core_1.text)('cycle').notNull(),
});
// Bobbin Workers
exports.bobbinWorkers = (0, sqlite_core_1.sqliteTable)('bobbin_workers', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    name: (0, sqlite_core_1.text)('name').notNull(),
    phoneNumber: (0, sqlite_core_1.text)('phone_number').notNull(),
    fullDaySalary: (0, sqlite_core_1.real)('full_day_salary').notNull(),
    joinDate: (0, sqlite_core_1.text)('join_date').notNull(),
});
// Bobbin Attendance
exports.bobbinAttendance = (0, sqlite_core_1.sqliteTable)('bobbin_attendance', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    workerId: (0, sqlite_core_1.text)('worker_id').notNull(),
    date: (0, sqlite_core_1.text)('date').notNull(),
    type: (0, sqlite_core_1.text)('type').notNull(), // 'full' | 'half'
    cycle: (0, sqlite_core_1.text)('cycle').notNull(),
});
// Textile Calculations
// Yarn Conversion Calculations
exports.yarnConversions = (0, sqlite_core_1.sqliteTable)('yarn_conversions', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    name: (0, sqlite_core_1.text)('name').notNull(),
    date: (0, sqlite_core_1.text)('date').notNull(),
    type: (0, sqlite_core_1.text)('type').notNull(),
    data: (0, sqlite_core_1.text)('data', { mode: 'json' }).notNull(), // Store all flexible fields as JSON
    result: (0, sqlite_core_1.real)('result').notNull(),
    resultUnit: (0, sqlite_core_1.text)('result_unit').notNull(),
});
// Fabric Calculations
exports.fabricCalculations = (0, sqlite_core_1.sqliteTable)('fabric_calculations', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    name: (0, sqlite_core_1.text)('name').notNull(),
    date: (0, sqlite_core_1.text)('date').notNull(),
    type: (0, sqlite_core_1.text)('type').notNull(),
    data: (0, sqlite_core_1.text)('data', { mode: 'json' }).notNull(),
    warpWeight: (0, sqlite_core_1.real)('warp_weight'),
    weftWeight: (0, sqlite_core_1.real)('weft_weight'),
    totalWeight: (0, sqlite_core_1.real)('total_weight'),
});
// GSM Calculations
exports.gsmCalculations = (0, sqlite_core_1.sqliteTable)('gsm_calculations', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    name: (0, sqlite_core_1.text)('name').notNull(),
    date: (0, sqlite_core_1.text)('date').notNull(),
    type: (0, sqlite_core_1.text)('type').notNull(),
    fabricWidth: (0, sqlite_core_1.real)('fabric_width').notNull(),
    data: (0, sqlite_core_1.text)('data', { mode: 'json' }).notNull(),
    gsm: (0, sqlite_core_1.real)('gsm').notNull(),
});
// Quality Calculations
exports.qualityCalculations = (0, sqlite_core_1.sqliteTable)('quality_calculations', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    name: (0, sqlite_core_1.text)('name').notNull(),
    date: (0, sqlite_core_1.text)('date').notNull(),
    gsm: (0, sqlite_core_1.real)('gsm').notNull(),
    fabricWidth: (0, sqlite_core_1.real)('fabric_width').notNull(),
    qualityGrams: (0, sqlite_core_1.real)('quality_grams').notNull(),
});
// TFO Production Calculations
exports.tfoProductions = (0, sqlite_core_1.sqliteTable)('tfo_productions', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    name: (0, sqlite_core_1.text)('name').notNull(),
    date: (0, sqlite_core_1.text)('date').notNull(),
    spindleRPM: (0, sqlite_core_1.real)('spindle_rpm').notNull(),
    workingTimeHours: (0, sqlite_core_1.real)('working_time_hours').notNull(),
    denier: (0, sqlite_core_1.real)('denier').notNull(),
    totalSpindles: (0, sqlite_core_1.integer)('total_spindles').notNull(),
    tpm: (0, sqlite_core_1.real)('tpm').notNull(),
    productionKg: (0, sqlite_core_1.real)('production_kg').notNull(),
});
// Warping Production Calculations
exports.warpingProductions = (0, sqlite_core_1.sqliteTable)('warping_productions', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    name: (0, sqlite_core_1.text)('name').notNull(),
    date: (0, sqlite_core_1.text)('date').notNull(),
    headRPM: (0, sqlite_core_1.real)('head_rpm').notNull(),
    timeMinutes: (0, sqlite_core_1.real)('time_minutes').notNull(),
    picksPerDm: (0, sqlite_core_1.real)('picks_per_dm').notNull(),
    efficiency: (0, sqlite_core_1.real)('efficiency').notNull(),
    productionMeters: (0, sqlite_core_1.real)('production_meters').notNull(),
});
// Yarn Consumption Calculations
exports.yarnConsumptions = (0, sqlite_core_1.sqliteTable)('yarn_consumptions', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    name: (0, sqlite_core_1.text)('name').notNull(),
    date: (0, sqlite_core_1.text)('date').notNull(),
    type: (0, sqlite_core_1.text)('type').notNull(),
    fabricLength: (0, sqlite_core_1.real)('fabric_length').notNull(),
    data: (0, sqlite_core_1.text)('data', { mode: 'json' }).notNull(),
    warpWeightKg: (0, sqlite_core_1.real)('warp_weight_kg'),
    weftWeightKg: (0, sqlite_core_1.real)('weft_weight_kg'),
    totalWeightKg: (0, sqlite_core_1.real)('total_weight_kg'),
});
exports.purchaseDeliveries = (0, sqlite_core_1.sqliteTable)('purchase_deliveries', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    purchaseId: (0, sqlite_core_1.text)('purchase_id').notNull(),
    date: (0, sqlite_core_1.text)('date').notNull(),
    kg: (0, sqlite_core_1.real)('kg'), // for yarn
    numberOfBeams: (0, sqlite_core_1.real)('number_of_beams'), // for beam purchases (batch)
    beamNo: (0, sqlite_core_1.text)('beam_no'), // for beams
    weight: (0, sqlite_core_1.real)('weight'), // for beams
    meters: (0, sqlite_core_1.real)('meters'), // for beams
    notes: (0, sqlite_core_1.text)('notes'),
    createdAt: (0, sqlite_core_1.integer)('created_at').default((Date.now())),
    updatedAt: (0, sqlite_core_1.integer)('updated_at').default((Date.now())),
});
// Sale Deliveries table
exports.saleDeliveries = (0, sqlite_core_1.sqliteTable)('sale_deliveries', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    saleId: (0, sqlite_core_1.text)('sale_id').notNull(),
    date: (0, sqlite_core_1.text)('date').notNull(),
    takas: (0, sqlite_core_1.real)('takas').notNull(),
    meters: (0, sqlite_core_1.real)('meters').notNull(),
    notes: (0, sqlite_core_1.text)('notes'),
    createdAt: (0, sqlite_core_1.integer)('created_at').default((Date.now())),
    updatedAt: (0, sqlite_core_1.integer)('updated_at').default((Date.now())),
});
//# sourceMappingURL=schema.js.map