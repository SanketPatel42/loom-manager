# Migration Instructions for Yarn Usage Feature

## Database Migration Required

The yarn usage tracking feature requires database schema changes. Follow these steps:

## Option 1: Automatic Migration (Recommended)

1. Rebuild native dependencies:
```bash
npm rebuild better-sqlite3
```

2. Run the migration:
```bash
npm run db:migrate
```

## Option 2: Manual SQL Execution

If automatic migration fails, you can manually execute the SQL migrations:

### Step 1: Add warp_weight to qualities table
```sql
ALTER TABLE qualities ADD COLUMN warp_weight REAL;
```

### Step 2: Add yarn_used_kg to beams table
```sql
ALTER TABLE beams ADD COLUMN yarn_used_kg REAL;
```

## How to Execute Manual SQL

### Using Electron App (Recommended for Production)
1. The app will automatically apply migrations on startup
2. The migration files are in `drizzle/` folder
3. Electron's database handler will detect and apply new migrations

### Using SQLite CLI
```bash
# Open the database
sqlite3 path/to/your/database.db

# Execute the migrations
.read drizzle/0005_add_warp_weight_to_qualities.sql
.read drizzle/0006_add_yarn_used_kg_to_beams.sql

# Verify the changes
.schema qualities
.schema beams

# Exit
.quit
```

## Verification

After migration, verify the changes:

1. Check qualities table has `warp_weight` column
2. Check beams table has `yarn_used_kg` column
3. Test by adding a quality with warp weight
4. Test by adding a beam and verify yarn usage is calculated

## Rollback (if needed)

If you need to rollback:

```sql
-- Remove warp_weight from qualities
ALTER TABLE qualities DROP COLUMN warp_weight;

-- Remove yarn_used_kg from beams
ALTER TABLE beams DROP COLUMN yarn_used_kg;
```

Note: SQLite has limited ALTER TABLE support. If DROP COLUMN doesn't work, you may need to:
1. Create a new table without the column
2. Copy data from old table
3. Drop old table
4. Rename new table

## Important Notes

- Existing data is preserved
- New columns are nullable (optional)
- No data loss will occur
- The feature is backward compatible
- Existing beams without yarn usage will continue to work
