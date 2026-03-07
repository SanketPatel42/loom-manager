-- Add overhead costing tables
CREATE TABLE IF NOT EXISTS overhead_entries (
    id TEXT PRIMARY KEY,
    month TEXT NOT NULL,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS monthly_production (
    id TEXT PRIMARY KEY,
    month TEXT NOT NULL,
    quality_id TEXT NOT NULL,
    meters_produced REAL NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    UNIQUE(month, quality_id)
);
