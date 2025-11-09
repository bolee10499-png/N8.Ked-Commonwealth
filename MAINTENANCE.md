# 🔧 N8.KED MAINTENANCE GUIDE

**Last Updated**: November 9, 2025  
**System Version**: Genesis (Sovereign Foundation)

---

## 🎯 Purpose

This document provides safe operational guidance for maintaining the N8.KED sovereign commonwealth infrastructure. These tools are powerful and **irreversible**. Use them with the same care you would use when handling constitutional amendments.

---

## 📁 Directory Structure

```
n8.ked/
├── tests/           # Stress tests, complexity analyzers, boot sequences
├── admin/           # DESTRUCTIVE admin tools (require confirmation)
├── database/        # Core sovereign database + Herald + AI Observer
├── schema/          # SQL documentation with philosophical principles
└── lib/             # Shared utilities (AI Observer, etc.)
```

---

## 🧪 `/tests/` - Validation & Analysis Tools

### `test_boot_sequence.js`
**Purpose**: First boot validation of Herald, AI Observer, and sovereignty schema.

**When to use**:
- After database schema changes
- After Herald or AI Observer modifications
- Before production deployment
- When validating system integrity

**How to run**:
```powershell
$env:NODE_ENV='production'; node tests/test_boot_sequence.js
```

**What it validates**:
- ✅ Herald tables created (sovereign_keys, verifiable_claims, etc.)
- ✅ Cryptographic authentication working
- ✅ AI Observer snapshot/trajectory operational
- ✅ Database statistics accessible

---

### `test_apis_simple.js`
**Purpose**: Validate external platform API connections (YouTube, Reddit).

**When to use**:
- After .env changes
- When API keys rotated
- Before multi-platform reputation imports
- Debugging OAuth token issues

**How to run**:
```powershell
node tests/test_apis_simple.js
```

**What it validates**:
- ✅ YouTube API key working
- ✅ Reddit public API accessible
- ✅ OAuth token format correct

---

### `test_48hr_endurance.js`
**Purpose**: Memory leak detection and performance degradation testing.

**When to use**:
- Before major releases
- After bot core modifications
- When investigating memory issues
- Validating cleanup routines

**How to run**:
```powershell
node tests/test_48hr_endurance.js
```

**What it tests**:
- setInterval accumulation (memory leaks)
- Cooldown Map unbounded growth
- Transaction trimming efficiency
- Cache TTL during API outages

**Expected outcome**: <50MB memory growth over 48-hour simulation

---

### `analyze_complexity.js`
**Purpose**: Cyclomatic complexity analyzer for entire codebase.

**When to use**:
- After major feature additions
- During code reviews
- Identifying refactoring candidates
- Maintaining code quality metrics

**How to run**:
```powershell
node tests/analyze_complexity.js
```

**Thresholds**:
- ✅ Excellent: Avg complexity <5.0
- ⚠️ Moderate: 5.0-10.0
- ❌ High: >10.0

**Current baseline**: 1.17 avg complexity (595 functions)

---

## ⚠️ `/admin/` - DESTRUCTIVE Administrative Tools

### `reset_sovereign_state.js`
**⚠️ DANGER: This script wipes ALL user data.**

**Purpose**: Return database to genesis (empty) state before production launch.

**When to use**:
- **ONLY** before initial public launch
- When migrating to new database instance
- After catastrophic data corruption (with backup)

**What it wipes**:
- All users (except 'platform')
- All transactions
- All NFTs, proposals, votes
- All Herald sovereign keys & claims
- All AI permissions & logs
- All subscriptions & platform integrations

**What it preserves**:
- Database schema (all tables intact)
- System configuration
- Royalty stream templates

**How to run**:
```powershell
node admin/reset_sovereign_state.js
```

**Safety features**:
- Requires typing "RESET" to confirm
- Automatic backup created before wipe
- Atomic transaction (all-or-nothing)
- Auto-increment counters reset
- Database vacuumed to reclaim space

**Recovery**:
Backups stored in `database/backups/pre_reset_TIMESTAMP.db`

To restore:
```powershell
Copy-Item "database\backups\pre_reset_TIMESTAMP.db" "database\n8ked.db" -Force
```

---

## 🛡️ Best Practices

### Before ANY Maintenance Operation:

1. **Backup First**:
   ```powershell
   $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
   Copy-Item "database\n8ked.db" "database\backups\manual_$timestamp.db"
   ```

2. **Check Current State**:
   ```powershell
   node -e "const {getStats} = require('./database/db_service.js'); console.log(getStats());"
   ```

3. **Stop Running Bot**:
   ```powershell
   Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
   ```

4. **Verify No Active Connections**:
   ```powershell
   Get-Process -Name node -ErrorAction SilentlyContinue
   ```

### After Maintenance:

1. **Run Boot Sequence**:
   ```powershell
   $env:NODE_ENV='production'; node tests/test_boot_sequence.js
   ```

2. **Verify Integrity**:
   ```powershell
   node -e "const {db} = require('./database/db_service.js'); console.log(db.pragma('integrity_check'));"
   ```

3. **Check File Size**:
   ```powershell
   Get-Item "database\n8ked.db" | Select-Object Name, @{N='SizeMB';E={[math]::Round($_.Length/1MB, 2)}}
   ```

---

## 🔍 Troubleshooting

### Database Locked Error
**Symptom**: `SqliteError: database is locked`

**Cause**: Another process has active connection

**Fix**:
```powershell
# Kill all node processes
Stop-Process -Name "node" -Force

# Wait 5 seconds for file handles to release
Start-Sleep -Seconds 5

# Retry operation
```

---

### Foreign Key Constraint Failures
**Symptom**: `FOREIGN KEY constraint failed`

**Cause**: Trying to insert data without parent records

**Fix**: Ensure users exist before creating dependent records:
```javascript
// WRONG
db.prepare('INSERT INTO transactions (user_id, ...) VALUES (?, ...)').run('user123', ...);

// RIGHT
db.prepare('INSERT OR IGNORE INTO users (discord_id) VALUES (?)').run('user123');
db.prepare('INSERT INTO transactions (user_id, ...) VALUES (?, ...)').run('user123', ...);
```

---

### Schema Mismatch After Updates
**Symptom**: `no such column: X`

**Cause**: Code expects columns that don't exist in current schema

**Fix**: Check current schema:
```powershell
node -e "const {db} = require('./database/db_service.js'); const schema = db.prepare('SELECT sql FROM sqlite_master WHERE type=\"table\" AND name=\"users\"').get(); console.log(schema.sql);"
```

Compare against `schema/sovereignty_schema.sql` documentation.

---

## 📊 Health Check Commands

### Quick System Status
```powershell
node -e "const {herald, aiObserver, getStats} = require('./database/db_service.js'); const snapshot = aiObserver.getSystemSnapshot(); console.log('Users:', snapshot.users.total, '| FRAG:', snapshot.economy.totalFrag, '| Gini:', snapshot.economy.giniCoefficient.toFixed(3));"
```

### Herald Table Counts
```powershell
node -e "const {db} = require('./database/db_service.js'); ['sovereign_keys', 'verifiable_claims', 'ai_agent_permissions'].forEach(t => console.log(t + ':', db.prepare('SELECT COUNT(*) as c FROM ' + t).get().c));"
```

### AI Observer Emergent Patterns
```powershell
node -e "const {aiObserver} = require('./database/db_service.js'); const patterns = aiObserver.detectEmergentPatterns(); console.log('Patterns detected:', patterns.patternsDetected); patterns.patterns.forEach(p => console.log(' -', p.type, '(confidence:', (p.confidence*100).toFixed(0) + '%)', p.recommendation));"
```

---

## 🚨 Emergency Procedures

### Catastrophic Database Corruption

1. **Stop everything**:
   ```powershell
   Stop-Process -Name "node" -Force
   ```

2. **Find latest backup**:
   ```powershell
   Get-ChildItem "database\backups\" | Sort-Object LastWriteTime -Descending | Select-Object -First 5
   ```

3. **Restore from backup**:
   ```powershell
   $backup = "database\backups\FILENAME.db"
   Copy-Item $backup "database\n8ked.db" -Force
   ```

4. **Verify integrity**:
   ```powershell
   node -e "const {db} = require('./database/db_service.js'); console.log(db.pragma('integrity_check'));"
   ```

---

### Rollback After Bad Migration

1. **Identify last known good backup**
2. **Restore it** (see above)
3. **Re-run boot sequence**:
   ```powershell
   $env:NODE_ENV='production'; node tests/test_boot_sequence.js
   ```

---

## 📝 Change Log

### Genesis (November 9, 2025)
- Created maintenance documentation
- Archived test suite to `/tests/`
- Moved destructive tools to `/admin/`
- Established backup procedures
- Documented sovereignty architecture

---

## 🔐 Security Notes

- **Never commit** `database/n8ked.db` to version control
- **Never commit** `database/backups/` to version control
- **Never share** `admin/reset_sovereign_state.js` with untrusted parties
- **Always backup** before running admin tools
- **Test on copy** before production database operations

---

## 🎯 Philosophy

These tools are not "scripts." They are **constitutional instruments** of the N8.KED sovereign commonwealth.

The Herald doesn't chat. It recites law.  
The AI Observer doesn't guess. It observes.  
The Database doesn't serve. It **preserves sovereignty**.

Treat these tools with the gravity they deserve.

---

**Maintained by**: kidseatdemons?N8.crypto  
**Commonwealth**: N8.KED AUTHORITY  
**Status**: Genesis (Foundational Spirits Active)
