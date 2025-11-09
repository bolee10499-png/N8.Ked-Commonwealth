-- ARIEUS Migration: dust → frag schema update
-- Run this to update existing n8ked.db database

-- Backup first!
-- Copy n8ked.db to n8ked.db.backup before running

PRAGMA foreign_keys = OFF;

BEGIN TRANSACTION;

-- Rename columns in users table
ALTER TABLE users RENAME COLUMN dust_balance TO frag_balance;
ALTER TABLE users RENAME COLUMN staked_dust TO staked_frag;

-- Update transaction currency values
UPDATE transactions SET currency = 'frag' WHERE currency = 'dust';

-- Update transaction notes (optional - for readability)
UPDATE transactions SET note = REPLACE(note, 'dust', 'FRAG') WHERE note LIKE '%dust%';
UPDATE transactions SET note = REPLACE(note, 'Dust', 'FRAG') WHERE note LIKE '%Dust%';

-- Update votes table comment (schema only, no data change needed)
-- Weight was already "Weighted by staked dust" - will be handled in next schema version

COMMIT;

PRAGMA foreign_keys = ON;

-- Verify migration
SELECT 'Migration complete!' as status;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as transaction_count FROM transactions;
SELECT currency, COUNT(*) as count FROM transactions GROUP BY currency;
