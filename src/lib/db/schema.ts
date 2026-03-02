import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// Beams table
export const beams = sqliteTable('beams', {
    id: text('id').primaryKey(),
    date: text('date').notNull(),
    warper: text('warper').notNull(),
    beamNo: text('beam_no').notNull(),
    noOfTakas: real('no_of_takas').notNull(),
    noOfTar: real('no_of_tar').notNull(),
    pricePerBeam: real('price_per_beam').notNull(),
    total: real('total').notNull(),
    qualityId: text('quality_id'),
    createdAt: integer('created_at').default((Date.now())),
    updatedAt: integer('updated_at').default((Date.now())),
});

// Takas table
export const takas = sqliteTable('takas', {
    id: text('id').primaryKey(),
    date: text('date').notNull(),
    available: real('available').notNull(),
    folded: real('folded').notNull(),
    remaining: real('remaining').notNull(),
    qualityId: text('quality_id'),
    createdAt: integer('created_at').default((Date.now())),
    updatedAt: integer('updated_at').default((Date.now())),
});

// Worker Profiles table
export const workerProfiles = sqliteTable('worker_profiles', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    phoneNumber: text('phone_number').notNull(),
    emergencyContact: text('emergency_contact').notNull(),
    createdAt: integer('created_at').default((Date.now())),
    updatedAt: integer('updated_at').default((Date.now())),
});

// Qualities table
export const qualities = sqliteTable('qualities', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    ratePerMeter: real('rate_per_meter').notNull(),
    description: text('description'),
    epi: real('epi'),
    ppi: real('ppi'),
    danier: text('danier'),
    tars: real('tars'),
    beamRate: real('beam_rate'),
    beamPasarRate: real('beam_pasar_rate'),
    createdAt: integer('created_at').default((Date.now())),
    updatedAt: integer('updated_at').default((Date.now())),
});

// Sales table
export const sales = sqliteTable('sales', {
    id: text('id').primaryKey(),
    date: text('date').notNull(),
    party: text('party').notNull(),
    takas: real('takas').notNull(),
    meters: real('meters').notNull(),
    ratePerMeter: real('rate_per_meter').notNull(),
    amount: real('amount').notNull(),
    tax: real('tax').notNull(),
    total: real('total').notNull(),
    paymentTerms: integer('payment_terms').notNull(),
    expectedPaymentDate: text('expected_payment_date').notNull(),
    status: text('status').notNull().default('pending'),
    type: text('type').notNull().default('spot'), // 'spot' | 'advance'
    qualityId: text('quality_id'),
    createdAt: integer('created_at').default((Date.now())),
    updatedAt: integer('updated_at').default((Date.now())),
});

export const purchases = sqliteTable('purchases', {
    id: text('id').primaryKey(),
    date: text('date').notNull(),
    supplier: text('supplier').notNull(),
    type: text('type').notNull().default('yarn'), // 'yarn' | 'beam'
    yarnType: text('yarn_type'),
    danier: text('danier'),
    tons: real('tons'),
    ratePerTon: real('rate_per_ton'),
    numberOfBeams: real('number_of_beams'),
    ratePerBeam: real('rate_per_beam'),
    qualityId: text('quality_id'),
    tars: real('tars'),
    meters: real('meters'),
    total: real('total').notNull(),
    createdAt: integer('created_at').default((Date.now())),
    updatedAt: integer('updated_at').default((Date.now())),
});

// Firms table
export const firms = sqliteTable('firms', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    gstNumber: text('gst_number').notNull(),
    address: text('address').notNull(),
    contactPerson: text('contact_person').notNull(),
    phoneNumber: text('phone_number').notNull(),
    email: text('email').notNull(),
    documents: text('documents', { mode: 'json' }).default('[]'),
    createdAt: integer('created_at').default((Date.now())),
    updatedAt: integer('updated_at').default((Date.now())),
});

// Transactions table
export const transactions = sqliteTable('transactions', {
    id: text('id').primaryKey(),
    date: text('date').notNull(),
    firm: text('firm').notNull(),
    type: text('type').notNull(),
    amount: real('amount').notNull(),
    purpose: text('purpose').notNull(),
    payee: text('payee').notNull(),
    createdAt: integer('created_at').default((Date.now())),
    updatedAt: integer('updated_at').default((Date.now())),
});

// Stock table
export const stock = sqliteTable('stock', {
    id: text('id').primaryKey(),
    date: text('date').notNull(),
    yarnCount: text('yarn_count').notNull(),
    boxesAvailable: integer('boxes_available').notNull(),
    createdAt: integer('created_at').default((Date.now())),
    updatedAt: integer('updated_at').default((Date.now())),
});

// Beam Pasar table
export const beamPasar = sqliteTable('beam_pasar', {
    id: text('id').primaryKey(),
    date: text('date').notNull(),
    beamNo: text('beam_no').notNull(),
    count: integer('count'), // Optional in interface
    tars: integer('tars').notNull(),
    noOfTaka: integer('no_of_taka'), // Optional in interface
    ratePerBeam: real('rate_per_beam').notNull(),
    qualityId: text('quality_id'),
    createdAt: integer('created_at').default((Date.now())),
    updatedAt: integer('updated_at').default((Date.now())),
});

// Worker Sheet Data table
export const workerSheetData = sqliteTable('worker_sheet_data', {
    id: text('id').primaryKey().default('main'),
    assignments: text('assignments', { mode: 'json' }).notNull(),
    gridData: text('grid_data', { mode: 'json' }).notNull(),
    lastUpdated: text('last_updated').default((new Date().toISOString())),
    createdAt: integer('created_at').default((Date.now())),
    updatedAt: integer('updated_at').default((Date.now())),
});

// Notes table
export const notes = sqliteTable('notes', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    isReminder: integer('is_reminder', { mode: 'boolean' }).default(false),
    reminderDate: text('reminder_date'),
    completed: integer('completed', { mode: 'boolean' }).default(false),
    createdAt: text('created_at').notNull(),
});

// Additional Workers & Attendance

// Begari Workers
export const begariWorkers = sqliteTable('begari_workers', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    phoneNumber: text('phone_number').notNull(),
    monthlySalary: real('monthly_salary').notNull(),
    joinDate: text('join_date').notNull(),
});

// TFO Workers
export const tfoWorkers = sqliteTable('tfo_workers', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    phoneNumber: text('phone_number').notNull(),
    fullDaySalary: real('full_day_salary').notNull(),
    joinDate: text('join_date').notNull(),
});

// TFO Attendance
export const tfoAttendance = sqliteTable('tfo_attendance', {
    id: text('id').primaryKey(),
    workerId: text('worker_id').notNull(),
    date: text('date').notNull(),
    type: text('type').notNull(), // 'full' | 'half'
    cycle: text('cycle').notNull(), // '1-15' | '16-30'
});

// Master Workers
export const masterWorkers = sqliteTable('master_workers', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    phoneNumber: text('phone_number').notNull(),
    monthlySalary: real('monthly_salary').notNull(),
    joinDate: text('join_date').notNull(),
});

// Wireman Workers
export const wiremanWorkers = sqliteTable('wireman_workers', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    phoneNumber: text('phone_number').notNull(),
    joinDate: text('join_date').notNull(),
});

// Wireman Bills
export const wiremanBills = sqliteTable('wireman_bills', {
    id: text('id').primaryKey(),
    workerId: text('worker_id').notNull(),
    date: text('date').notNull(),
    billAmount: real('bill_amount').notNull(),
    description: text('description').notNull(),
    cycle: text('cycle').notNull(),
});

// Bobbin Workers
export const bobbinWorkers = sqliteTable('bobbin_workers', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    phoneNumber: text('phone_number').notNull(),
    fullDaySalary: real('full_day_salary').notNull(),
    joinDate: text('join_date').notNull(),
});

// Bobbin Attendance
export const bobbinAttendance = sqliteTable('bobbin_attendance', {
    id: text('id').primaryKey(),
    workerId: text('worker_id').notNull(),
    date: text('date').notNull(),
    type: text('type').notNull(), // 'full' | 'half'
    cycle: text('cycle').notNull(),
});

// Textile Calculations

// Yarn Conversion Calculations
export const yarnConversions = sqliteTable('yarn_conversions', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    date: text('date').notNull(),
    type: text('type').notNull(),
    data: text('data', { mode: 'json' }).notNull(), // Store all flexible fields as JSON
    result: real('result').notNull(),
    resultUnit: text('result_unit').notNull(),
});

// Fabric Calculations
export const fabricCalculations = sqliteTable('fabric_calculations', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    date: text('date').notNull(),
    type: text('type').notNull(),
    data: text('data', { mode: 'json' }).notNull(),
    warpWeight: real('warp_weight'),
    weftWeight: real('weft_weight'),
    totalWeight: real('total_weight'),
});

// GSM Calculations
export const gsmCalculations = sqliteTable('gsm_calculations', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    date: text('date').notNull(),
    type: text('type').notNull(),
    fabricWidth: real('fabric_width').notNull(),
    data: text('data', { mode: 'json' }).notNull(),
    gsm: real('gsm').notNull(),
});

// Quality Calculations
export const qualityCalculations = sqliteTable('quality_calculations', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    date: text('date').notNull(),
    gsm: real('gsm').notNull(),
    fabricWidth: real('fabric_width').notNull(),
    qualityGrams: real('quality_grams').notNull(),
});

// TFO Production Calculations
export const tfoProductions = sqliteTable('tfo_productions', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    date: text('date').notNull(),
    spindleRPM: real('spindle_rpm').notNull(),
    workingTimeHours: real('working_time_hours').notNull(),
    denier: real('denier').notNull(),
    totalSpindles: integer('total_spindles').notNull(),
    tpm: real('tpm').notNull(),
    productionKg: real('production_kg').notNull(),
});

// Warping Production Calculations
export const warpingProductions = sqliteTable('warping_productions', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    date: text('date').notNull(),
    headRPM: real('head_rpm').notNull(),
    timeMinutes: real('time_minutes').notNull(),
    picksPerDm: real('picks_per_dm').notNull(),
    efficiency: real('efficiency').notNull(),
    productionMeters: real('production_meters').notNull(),
});

// Yarn Consumption Calculations
export const yarnConsumptions = sqliteTable('yarn_consumptions', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    date: text('date').notNull(),
    type: text('type').notNull(),
    fabricLength: real('fabric_length').notNull(),
    data: text('data', { mode: 'json' }).notNull(),
    warpWeightKg: real('warp_weight_kg'),
    weftWeightKg: real('weft_weight_kg'),
    totalWeightKg: real('total_weight_kg'),
});

export const purchaseDeliveries = sqliteTable('purchase_deliveries', {
    id: text('id').primaryKey(),
    purchaseId: text('purchase_id').notNull(),
    date: text('date').notNull(),
    kg: real('kg'), // for yarn
    numberOfBeams: real('number_of_beams'), // for beam purchases (batch)
    beamNo: text('beam_no'), // for beams
    weight: real('weight'), // for beams
    meters: real('meters'), // for beams
    notes: text('notes'),
    createdAt: integer('created_at').default((Date.now())),
    updatedAt: integer('updated_at').default((Date.now())),
});

// Sale Deliveries table
export const saleDeliveries = sqliteTable('sale_deliveries', {
    id: text('id').primaryKey(),
    saleId: text('sale_id').notNull(),
    date: text('date').notNull(),
    takas: real('takas').notNull(),
    meters: real('meters').notNull(),
    notes: text('notes'),
    createdAt: integer('created_at').default((Date.now())),
    updatedAt: integer('updated_at').default((Date.now())),
});