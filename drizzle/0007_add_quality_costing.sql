-- Add quality costing table
CREATE TABLE IF NOT EXISTS quality_costing (
    id TEXT PRIMARY KEY,
    quality_id TEXT NOT NULL,
    warp_rate REAL NOT NULL DEFAULT 0,
    weft_rate REAL NOT NULL DEFAULT 0,
    extra_costs TEXT DEFAULT '[]',
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);
