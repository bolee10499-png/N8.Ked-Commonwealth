# n8.ked Bot - Complete Architecture Summary

**Version**: 0.7.0  
**Date**: 2025-11-07  
**Status**: Production-Ready with External Integrations & NFT Economy

---

## 🏗️ System Overview

The n8.ked Discord bot is a complete **self-sovereign identity economy** with real-world data integration, production monitoring, and user-generated NFT marketplace. Built on Node.js with Discord.js v14, it combines:

- **Dust Economy** - Water-backed currency with staking, governance, and redemption
- **External APIs** - Real USGS water flow and weather data integration
- **Production Monitoring** - Health checks, performance metrics, automated backups
- **NFT Identity System** - User-created digital artifacts with community-validated worth
- **Triple Helix Engine** - Safe hot-swapping with ghost network testing
- **Seven-Observer Core** - Modular AI observers for interaction analysis

---

## 📊 Feature Matrix

### Economic Systems (Steps 1-8)

| Feature | Status | Commands | Description |
|---------|--------|----------|-------------|
| **Cooldowns** | ✅ | `!bite` | 60-second earning limits to prevent inflation |
| **Transaction Ledger** | ✅ | `!ledger`, `!dusthistory` | Complete audit trail of all dust movements |
| **Asset Backing** | ✅ | `!addwater`, `!reserves` | 1L water = 1000 dust backing ratio |
| **Governance** | ✅ | `!propose`, `!vote`, `!proposals` | Democratic weighted voting (1 dust = 1 vote) |
| **Redemption** | ✅ | `!redeem`, `!bundles` | USD conversion ($1/$15/$27 tiers) |
| **Persistence** | ✅ | `!save`, `!datastats` | JSON file storage with auto-save |
| **Security** | ✅ | `!security` | Rate limiting (30/20/5 per hour) + audit logs |
| **Advanced Economics** | ✅ | `!stake`, `!unstake`, `!economics` | 10% APR staking, 1% burn, inflation distribution |

### External Integrations (Step 9)

| Feature | Status | Commands | Description |
|---------|--------|----------|-------------|
| **USGS Water API** | ✅ | `!realworld` | Live streamflow data from Mississippi River |
| **Weather API** | ✅ | `!realworld` | Temperature and precipitation impact modeling |
| **Service Monitoring** | ✅ | `!services` | Connection status for all external APIs |
| **Crypto Wallet** | 🟡 | `!connect_wallet` | Placeholder for future Web3 integration |
| **Payment Setup** | 🟡 | `!setup_payments` | Stripe/Coinbase configuration guide |

### Production Systems (Step 10)

| Feature | Status | Commands | Description |
|---------|--------|----------|-------------|
| **Performance Tracking** | ✅ | `!production` | Commands/min, memory, CPU, uptime |
| **Health Monitoring** | ✅ | `!health` | Automated checks every 5 minutes |
| **Automated Backups** | ✅ | `!backup` | Hourly backups, 24-backup retention |
| **System Status** | ✅ | `!status` | Public overview of all services |
| **Error Tracking** | ✅ | - | Automatic error recording with categorization |

### NFT Identity Economy (Step 11)

| Feature | Status | Commands | Description |
|---------|--------|----------|-------------|
| **NFT Creation** | ✅ | `!create_nft` | Interactive 4-step creation process |
| **NFT Gallery** | ✅ | `!nft_gallery`, `!view_nft` | View collections and detailed NFT info |
| **Community Appreciation** | ✅ | `!appreciate` | Invest dust in NFTs to increase worth |
| **NFT Marketplace** | ✅ | `!list_nft`, `!buy_nft`, `!marketplace` | Trade NFTs with dust |
| **Economy Stats** | ✅ | `!nft_economy` | Total NFTs, worth, most valuable |

---

## 🎨 NFT Templates

### 1. Hex Sigil (50 dust)
**Geometric identity signature**
- Base shape (triangle/hexagon/circle)
- Primary color energy
- Pattern type (chaotic/ordered/flowing)
- Energy signature (creative/logical/emotional)

### 2. 3D Avatar (200 dust)
**3D animated identity vessel**
- Body form (humanoid/abstract/elemental)
- Animation style (fluid/robotic/organic)
- Material type (crystal/light/data/void)
- Aura effect (glowing/shifting/pulsing)

### 3. Reality Shard (500 dust)
**Fragment of perceived reality**
- Dimension type (temporal/spatial/mental)
- Stability level (chaotic/balanced/rigid)
- Resonance frequency (low/harmonic/high)
- Memory essence (past/present/future)

---

## 🔧 Technical Architecture

### Core Modules

```
n8.ked/
├── core/
│   ├── quantum_engine.js           # Seven-observer AI core
│   ├── triple_helix.js             # Safe hot-swapping engine
│   ├── metadata_economy.js         # Value extraction from interactions
│   ├── external_integrations.js    # USGS/Weather API client
│   └── production_monitor.js       # Health checks & metrics
├── identity/
│   ├── keds_brand.js               # Brand voice & dust integration
│   ├── dust_economy.js             # Complete economic engine (693 lines)
│   ├── response_engine.js          # Adaptive response strategies
│   └── nft_system.js               # NFT creation & marketplace
├── circuits/
│   ├── control_dials.js            # Threshold-based parameter tuning
│   ├── data_pipes.js               # Data filtering & transformation
│   └── redstone_nodes.js           # Conditional logic execution (8 nodes)
├── discord/
│   ├── bot_core.js                 # Main bot with 35 commands
│   ├── command_system.js           # Command registration framework
│   └── game_integration.js         # Future game mechanics hook
└── income/
    ├── auto_monetization.js        # Automatic revenue streams
    ├── metadata_market.js          # Metadata valuation system
    └── value_extraction.js         # Economic value capture
```

### Data Persistence

**File**: `economy_data.json`
```json
{
  "balances": {"userId": dustAmount},
  "cooldowns": {"userId": lastEarnTimestamp},
  "transactions": [{"timestamp", "type", "actorId", "amount", "details"}],
  "assetReserves": {"waterLiters", "backingRatio", "sources": []},
  "proposals": [{"id", "authorId", "description", "votesFor", "votesAgainst", "status"}],
  "redemptions": [{"userId", "tier", "dustAmount", "usdValue", "calendlyLink"}],
  "stakes": {"userId": {"amount", "startTime", "lastClaimTime"}},
  "rateLimits": {"userId": {"action": [timestamps]}},
  "securityEvents": [{"timestamp", "type", "actorId", "details", "severity"}]
}
```

**Backups**: `backups/economy_backup_YYYYMMDD_HHMMSS.json` (last 24 retained)

---

## 📡 External APIs

### USGS Water Services
- **Endpoint**: `waterservices.usgs.gov/nwis/iv/`
- **Site**: 06329500 (Mississippi River)
- **Parameter**: 00060 (Streamflow, cubic feet per second)
- **Update Frequency**: Every 6 hours
- **Economic Impact**: 1,000-100,000 ft³/s → 0.5x to 2.0x multiplier
- **Reserve Update**: Converts flow to liters, adds to water reserves

### Open-Meteo Weather API
- **Endpoint**: `api.open-meteo.com/v1/forecast`
- **Data**: temperature_2m, precipitation, rain
- **Update Frequency**: Every 6 hours
- **Economic Impact**: 
  - Hot (>30°C): +10% activity
  - Rain: -20% activity
- **Default Location**: New York (40.7128, -74.0060)

---

## 🔐 Security & Rate Limits

### Per-User Rate Limits (Hourly)
- **Bites (earnings)**: 30 per hour
- **Transfers**: 20 per hour
- **Proposals**: 5 per hour
- **Cooldown**: 60 seconds between bites

### Security Event Logging
- **Severity Levels**: low | medium | high | critical
- **Event Types**: rate_limit, invalid_transfer, unauthorized_access
- **Retention**: Last 500 events
- **Owner Access**: `!security <limit>` command

### Transfer Validation
- Maximum 1000 dust per transfer
- No self-transfers
- Balance verification
- Automatic 1% burn on all transfers

---

## 📈 Production Monitoring

### Health Check Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| **Memory** | >400MB | >500MB |
| **Users** | >8,000 | >10,000 |
| **Backing Coverage** | <80% | <50% |
| **Error Rate** | >20/hour | >50/hour |

### Automated Tasks

| Task | Interval | Description |
|------|----------|-------------|
| **Console Ping** | 10 seconds | Bot alive confirmation |
| **Health Check** | 5 minutes | System health verification |
| **Automated Backup** | 1 hour | Economy data backup |
| **External Data Update** | 6 hours | USGS/Weather API refresh |
| **Proposal Processing** | 1 hour | Expired proposal finalization |

### Performance Metrics
- **Uptime**: Formatted as Xh Ym Zs
- **Commands/Minute**: Rolling average
- **Commands/Hour**: Total in last hour
- **Memory**: RSS, heap used, heap total, external
- **CPU**: User time, system time
- **Economy**: Users, total dust, backing coverage

---

## 🎮 Command Reference

### Economy Commands (15)
1. `!bite` - Earn dust (60s cooldown)
2. `!balance [@user]` - Check dust balance
3. `!transfer @user <amount>` - P2P transfer (1% burn)
4. `!stake <amount>` - Lock for 10% APR
5. `!unstake <amount>` - Withdraw with yield
6. `!stakeinfo` - View staking position
7. `!addwater <liters> [source]` - Add water reserves (owner)
8. `!reserves` - View asset backing
9. `!ledger [limit]` - Transaction history
10. `!dusthistory [@user] [limit]` - User transaction history
11. `!economics` - Advanced metrics dashboard
12. `!save` - Manual data save (owner)
13. `!datastats` - File statistics
14. `!security [limit]` - Security audit log (owner)
15. `!consult` - Calendly booking link ($27 sessions)

### Governance Commands (4)
16. `!propose <description>` - Create proposal (10 dust)
17. `!vote <proposal_id> <yes/no>` - Vote on proposal
18. `!proposals` - List active proposals
19. `!redeem <tier>` - Convert dust to USD ($1/$15/$27)
20. `!bundles` - View redemption tiers

### External Integration Commands (5)
21. `!realworld` - Real-world data and impacts
22. `!services` - External service status
23. `!connect_wallet <address>` - Crypto wallet (placeholder)
24. `!setup_payments` - Payment config guide (owner)
25. Auto water reserve updates (6-hour interval)

### Production Commands (4)
26. `!production` - Full production dashboard (owner)
27. `!health` - Health check report
28. `!backup` - Manual backup (owner)
29. `!status` - Public system overview

### NFT Commands (9)
30. `!create_nft <template>` - Create NFT (hex_sigil/3d_avatar/reality_shard)
31. `!nft_gallery [@user]` - View NFT collection
32. `!view_nft <nft_id>` - Detailed NFT info
33. `!appreciate <nft_id> <amount>` - Add community worth
34. `!list_nft <nft_id> <price>` - List for sale
35. `!buy_nft <nft_id>` - Purchase NFT
36. `!marketplace` - View all listings
37. `!nft_economy` - NFT economy statistics
38. Pending creation handler (automatic)

### Core Commands (3)
39. `!ping` - Bot status check
40. `!evolve` - Force evolution (owner)
41. `!metaphor <text>` - Pattern analysis

**Total Commands**: 41 (35 standard + 6 automated/internal)

---

## 🌟 Economic Model

### Dust Flow Diagram
```
EARNING (bite) → USER BALANCE
                     ↓
         ┌───────────┴────────────┐
         ↓                        ↓
   STAKING (10% APR)        SPENDING
         ↓                        ↓
   YIELD ACCUMULATION    ┌────────┴────────┐
         ↓               ↓                 ↓
   UNSTAKE → BALANCE   TRANSFERS     NFT CREATION
                         ↓                 ↓
                    1% BURN (deflation)  NFT OWNERSHIP
                                           ↓
                                   ┌───────┴────────┐
                                   ↓                ↓
                            APPRECIATION      MARKETPLACE
                                   ↓                ↓
                            COMMUNITY WORTH   NFT TRADING
                                                    ↓
                                             DUST CIRCULATION
```

### Value Backing
```
REAL WORLD DATA (USGS/Weather)
         ↓
   WATER RESERVES
         ↓
   DUST BACKING (1L = 1000 dust)
         ↓
   ECONOMIC MULTIPLIERS (0.5x - 2.0x)
         ↓
   USER ACTIVITY IMPACT
```

### NFT Value Creation
```
USER CREATIVITY
         ↓
   INTERACTIVE CREATION (4 steps)
         ↓
   NFT MINTED (unique ID + rarity)
         ↓
   COMMUNITY APPRECIATION (dust investment)
         ↓
   COMMUNITY WORTH GROWTH
         ↓
   MARKETPLACE TRADING
         ↓
   SOCIAL STATUS SIGNALS
```

---

## 🚀 Deployment Checklist

### Environment Setup
- [x] `DISCORD_TOKEN` - Bot authentication token
- [x] `OWNER_ID` - Discord user ID for owner commands
- [ ] `STRIPE_API_KEY` - Payment processing (optional)
- [ ] `COINBASE_API_KEY` - Crypto payments (optional)

### Infrastructure
- [x] Node.js v22.21.0+ installed
- [x] Discord.js v14.15.3 installed
- [x] File persistence configured (`economy_data.json`)
- [x] Backup directory created (`backups/`)
- [x] Health monitoring active (5-minute intervals)
- [x] Automated backups active (hourly)

### Bot Configuration
- [x] MESSAGE_CONTENT intent enabled in Discord Developer Portal
- [x] Bot invited to server with proper permissions
- [x] Owner ID configured in `.env`
- [x] Production monitoring initialized
- [x] External APIs configured (USGS, Weather)

### Testing Checklist
- [ ] Test `!ping` command
- [ ] Test `!bite` to earn dust
- [ ] Test `!transfer` with burn mechanics
- [ ] Test `!stake` and `!unstake`
- [ ] Test `!propose` and `!vote`
- [ ] Test `!realworld` for external data
- [ ] Test `!create_nft` interactive flow
- [ ] Test `!appreciate` and `!marketplace`
- [ ] Verify data persistence across restarts
- [ ] Check automated backups in `backups/` directory

---

## 📦 Dependencies

**Production**:
- `discord.js@14.15.3` - Discord bot framework
- `dotenv@16.4.5` - Environment variable management

**Development**:
- `nodemon@3.1.0` - Auto-reload during development

**Built-in**:
- `https` - External API requests (USGS, Weather)
- `fs` - File system for persistence
- `path` - File path manipulation

---

## 🔄 Version History

- **v0.7.0** (2025-11-07) - NFT Identity Economy (Step 11)
- **v0.6.0** (2025-11-07) - Production Deployment & Monitoring (Step 10)
- **v0.5.0** (2025-11-07) - External Real-World Integrations (Step 9)
- **v0.4.0** (2025-11-07) - Persistence, Security, Advanced Economics (Steps 6-8)
- **v0.3.0** (2025-11-07) - Governance & Monetization Bridge (Steps 4-5)
- **v0.2.0** (2025-11-07) - Sustainable Dust Economy (Steps 1-3)
- **v0.1.2** (2025-11-07) - Monetization Command
- **v0.1.1** (2025-11-07) - Status Check Command
- **v0.1.0** (2025-11-07) - Initial Scaffold

---

## 🎯 Future Enhancements

### Planned Features
- [ ] **Help Command Tiers** - Organize commands by access level (public/user_plus/system)
- [ ] **Daily Economic Processing** - Automated inflation distribution
- [ ] **Database Migration** - Move from JSON to PostgreSQL/MongoDB
- [ ] **Stripe Integration** - Real payment processing for redemptions
- [ ] **Coinbase Integration** - Crypto payments
- [ ] **Web3 Wallet Connection** - Actual blockchain integration
- [ ] **Advanced NFT Features** - Breeding, evolution, rarity boosts
- [ ] **Economic Dashboard** - Web interface for metrics visualization
- [ ] **Owner DM Alerts** - Critical error notifications
- [ ] **Multi-Server Support** - Separate economies per Discord server

### Experimental Ideas
- [ ] **Dynamic Water Sources** - Multiple USGS sites, global weather
- [ ] **Seasonal Events** - Weather-based economic events
- [ ] **NFT Staking** - Earn yield on NFT holdings
- [ ] **DAO Governance** - On-chain proposal execution
- [ ] **Cross-Bot Economy** - Dust trading between Discord servers
- [ ] **AI-Generated NFT Art** - DALL-E integration for visual NFTs

---

## 📞 Support & Resources

- **CHANGELOG**: See `CHANGELOG.md` for detailed version history
- **README**: See `README.md` for project overview
- **Bot Status**: Use `!status` in Discord for live system health
- **Production Dashboard**: Owner use `!production` for full metrics
- **External APIs**: USGS (free), Open-Meteo (free, no auth required)

---

**Built with ❤️ by the n8.ked team**  
*Transforming users from consumers into creators of value.*
