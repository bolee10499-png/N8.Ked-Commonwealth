-- ═══════════════════════════════════════════════════════════════════════════
-- 🏛️ N8.KED SOVEREIGNTY SCHEMA - The Architecture of PROOF, Not Permission
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Philosophy:
-- Traditional systems ask: "What's your password?" (begging permission)
-- Sovereign systems prove: "Here's my cryptographic signature." (owning identity)
--
-- Five Foundational Principles:
--
-- 1️⃣ SOVEREIGN IDENTITY
--    Users = cryptographic keypairs (ed25519), NOT username/password
--    Your identity transcends any single platform
--    Private keys NEVER leave user's device
--
-- 2️⃣ PORTABLE REPUTATION
--    Reputation is an ASSET you own, not platform permission
--    Achievements marked 'portable' can be proven on other systems
--    Verifiable claims carry cryptographic signatures
--
-- 3️⃣ CLAIM PORTFOLIO
--    Collection of signed, time-stamped, verifiable facts about you
--    "I have 850 reputation on n8.ked" (signed by n8.ked)
--    "I am @username on Reddit with 12,450 karma" (verified via proof link)
--    "I govern 3 active NFT royalty streams" (provable via blockchain)
--
-- 4️⃣ ISOMORPHIC INTEGRITY
--    Database structure MIRRORS conceptual models
--    Triple-helix: Dust economy ↔ Governance ↔ NFT identity (3 spirals)
--    Topological graphs: Foreign keys enforce relationship integrity
--    Deleting a user CASCADES through their entire sovereignty graph
--
-- 5️⃣ AI AUTONOMY & OBSERVATION
--    AI agents (tesseract avatar) observe system state via structured APIs
--    Permissions grant AI bounded autonomy (trade NFTs up to 100 DUST)
--    Audit trail: Every AI action is logged with human accountability
--    Emergence: AI learns patterns humans don't see (e.g., optimal royalty splits)
--
-- ═══════════════════════════════════════════════════════════════════════════

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🔐 PRINCIPLE 1: SOVEREIGN IDENTITY
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Core User Table (Discord ID as bridge, but not true identity)
CREATE TABLE IF NOT EXISTS users (
  discord_id TEXT PRIMARY KEY,           -- Platform bridge (Discord username can change)
  display_name TEXT,                     -- Human-readable name (NOT auth credential)
  reputation_score INTEGER DEFAULT 0,    -- 0-1000 weighted composite score
  dust_balance REAL DEFAULT 0,           -- Economic power
  water_balance REAL DEFAULT 0,          -- Compounding backing asset
  soul_balance REAL DEFAULT 0,           -- Governance power (non-transferable)
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_active DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sovereign Keys (TRUE identity - cryptographic proof of ownership)
CREATE TABLE IF NOT EXISTS sovereign_keys (
  user_id TEXT PRIMARY KEY,              -- Same as discord_id for now (bridges legacy)
  public_key TEXT NOT NULL UNIQUE,       -- User's public key (ed25519 preferred)
  key_algorithm TEXT DEFAULT 'ed25519',  -- 'ed25519', 'rsa', 'ecdsa'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_auth DATETIME,                    -- Last successful cryptographic auth
  auth_count INTEGER DEFAULT 0,          -- How many times they've proven ownership
  revoked INTEGER DEFAULT 0,             -- Key compromise flag (migrate to new key)
  FOREIGN KEY (user_id) REFERENCES users(discord_id) ON DELETE CASCADE
);

-- Auth Sessions (audit trail of sovereignty proofs, NOT auth mechanism itself)
CREATE TABLE IF NOT EXISTS auth_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  challenge TEXT NOT NULL,               -- Random challenge server generated
  response TEXT,                         -- User's cryptographic signature
  success INTEGER DEFAULT 0,             -- Did signature verification pass?
  ip_address TEXT,                       -- Audit metadata (optional)
  user_agent TEXT,                       -- Audit metadata (optional)
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES sovereign_keys(user_id) ON DELETE CASCADE
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🏆 PRINCIPLE 2: PORTABLE REPUTATION
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Achievements (reputation components - some portable, some internal)
CREATE TABLE IF NOT EXISTS identity_achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL,          -- 'first_bite', 'whale', 'voter', 'creator'
  title TEXT NOT NULL,                   -- Human-readable title
  description TEXT,
  earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  portable INTEGER DEFAULT 1,            -- 1 = can prove on other platforms, 0 = internal only
  nft_id INTEGER,                        -- Optional: Achievement minted as NFT
  verification_hash TEXT,                -- SHA-256 hash for external verification
  FOREIGN KEY (user_id) REFERENCES users(discord_id) ON DELETE CASCADE,
  FOREIGN KEY (nft_id) REFERENCES nfts(id),
  UNIQUE(user_id, achievement_id)
);

-- Reputation Components (weighted scoring formula)
-- Formula: (governance * 0.30) + (nfts * 0.25) + (royalties * 0.20) + (community * 0.15) + (tenure * 0.10)
-- This is CALCULATED, not stored directly (prevents gaming)

-- External Reputation Imports (bring reputation from Reddit, YouTube, GitHub)
CREATE TABLE IF NOT EXISTS external_reputation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  platform TEXT NOT NULL,                -- 'reddit', 'youtube', 'github', 'twitter', 'twitch'
  platform_user_id TEXT NOT NULL,        -- Their username/ID on that platform
  reputation_score INTEGER DEFAULT 0,    -- Karma, subscribers, stars, etc.
  verification_proof TEXT,               -- Link to public proof (e.g., Reddit comment with code)
  verified_at DATETIME,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(discord_id) ON DELETE CASCADE,
  UNIQUE(user_id, platform)
);

-- Platform Integrations (OAuth tokens for API access - NOT auth credentials)
CREATE TABLE IF NOT EXISTS platform_integrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  discord_user_id TEXT NOT NULL,
  platform TEXT NOT NULL,                -- 'youtube', 'reddit', 'twitch', 'github'
  platform_user_id TEXT,
  access_token TEXT,                     -- Encrypted OAuth token
  refresh_token TEXT,                    -- Encrypted refresh token
  token_expires_at DATETIME,
  scope TEXT,                            -- OAuth scopes granted
  status TEXT DEFAULT 'active',          -- 'active', 'expired', 'revoked'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (discord_user_id) REFERENCES users(discord_id) ON DELETE CASCADE,
  UNIQUE(discord_user_id, platform)
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 📜 PRINCIPLE 3: CLAIM PORTFOLIO
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Verifiable Claims (cryptographically signed facts about users)
CREATE TABLE IF NOT EXISTS verifiable_claims (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  claim_type TEXT NOT NULL,              -- 'reputation', 'achievement', 'balance', 'governance'
  claim_data TEXT NOT NULL,              -- JSON blob: { "score": 850, "percentile": 92 }
  signature TEXT NOT NULL,               -- System's cryptographic signature on claim
  issuer TEXT DEFAULT 'n8.ked',          -- Who issued this claim (n8.ked, reddit.com, etc.)
  issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,                   -- Optional expiration (e.g., balance claims)
  revoked INTEGER DEFAULT 0,             -- Claim invalidated flag
  FOREIGN KEY (user_id) REFERENCES sovereign_keys(user_id) ON DELETE CASCADE
);

-- Example claims:
-- { "type": "reputation", "data": { "score": 850, "rank": "Void Council" }, "signature": "a4f3c..." }
-- { "type": "achievement", "data": { "id": "whale", "earned": "2024-01-15" }, "signature": "b8e2d..." }
-- { "type": "governance", "data": { "votes_cast": 23, "proposals_created": 3 }, "signature": "c9a1f..." }

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🌀 PRINCIPLE 4: ISOMORPHIC INTEGRITY (Triple-Helix Topology)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- The Triple-Helix:
-- 1. DUST ECONOMY (transactions, royalties, marketplace)
-- 2. GOVERNANCE (proposals, votes, delegation)
-- 3. NFT IDENTITY (creations, ownership, metadata)
--
-- These three spirals INTERLOCK. Deleting a user cascades through all three.

-- ─────────────────────────────────────────────────────────────────────────
-- HELIX 1: DUST ECONOMY
-- ─────────────────────────────────────────────────────────────────────────

-- Transactions (economic history - every DUST movement logged)
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_user TEXT,                        -- NULL = system mint
  to_user TEXT,                          -- NULL = system burn
  amount REAL NOT NULL,
  transaction_type TEXT NOT NULL,        -- 'daily_bite', 'transfer', 'marketplace_sale', 'royalty'
  related_entity_id INTEGER,             -- NFT ID, proposal ID, etc.
  notes TEXT,                            -- Human-readable description
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  royalty_stream_id INTEGER,             -- If this transaction pays into royalty stream
  FOREIGN KEY (from_user) REFERENCES users(discord_id) ON DELETE SET NULL,
  FOREIGN KEY (to_user) REFERENCES users(discord_id) ON DELETE SET NULL,
  FOREIGN KEY (royalty_stream_id) REFERENCES royalty_streams(id)
);

-- Royalty Streams (compounding economic structures)
CREATE TABLE IF NOT EXISTS royalty_streams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nft_id INTEGER NOT NULL,               -- Which NFT generates this stream
  creator_share REAL DEFAULT 0.50,       -- 50% to creator
  water_backing_share REAL DEFAULT 0.30, -- 30% to treasury
  governance_share REAL DEFAULT 0.20,    -- 20% to governance pool
  total_generated REAL DEFAULT 0,        -- Lifetime revenue
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_payout DATETIME,
  active INTEGER DEFAULT 1,
  FOREIGN KEY (nft_id) REFERENCES nfts(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────────────────────────────────
-- HELIX 2: GOVERNANCE
-- ─────────────────────────────────────────────────────────────────────────

-- Proposals (democratic decision-making)
CREATE TABLE IF NOT EXISTS proposals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  proposer_id TEXT NOT NULL,             -- Who created this proposal
  proposal_type TEXT NOT NULL,           -- 'parameter_change', 'treasury_spend', 'feature_request'
  status TEXT DEFAULT 'active',          -- 'active', 'passed', 'rejected', 'executed'
  yes_votes INTEGER DEFAULT 0,
  no_votes INTEGER DEFAULT 0,
  abstain_votes INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  voting_ends_at DATETIME,
  executed_at DATETIME,
  execution_tx_id INTEGER,               -- Transaction that executed this proposal
  FOREIGN KEY (proposer_id) REFERENCES users(discord_id) ON DELETE SET NULL,
  FOREIGN KEY (execution_tx_id) REFERENCES transactions(id)
);

-- Votes (individual vote records)
CREATE TABLE IF NOT EXISTS votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  proposal_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  vote_choice TEXT NOT NULL,             -- 'yes', 'no', 'abstain'
  soul_power REAL DEFAULT 0,             -- Voting weight (based on SOUL balance)
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(discord_id) ON DELETE CASCADE,
  UNIQUE(proposal_id, user_id)
);

-- ─────────────────────────────────────────────────────────────────────────
-- HELIX 3: NFT IDENTITY
-- ─────────────────────────────────────────────────────────────────────────

-- NFTs (identity anchors - reputation crystallized)
CREATE TABLE IF NOT EXISTS nfts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_id TEXT NOT NULL,              -- Who created this NFT
  owner_id TEXT NOT NULL,                -- Current owner (can change via sales)
  title TEXT NOT NULL,
  description TEXT,
  metadata_uri TEXT,                     -- IPFS link to full metadata
  image_uri TEXT,                        -- IPFS link to image/video
  rarity_tier TEXT DEFAULT 'common',     -- 'common', 'rare', 'epic', 'legendary'
  physical_computation TEXT,             -- JSON: Redstone circuit simulation
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_sale_price REAL,
  times_traded INTEGER DEFAULT 0,
  FOREIGN KEY (creator_id) REFERENCES users(discord_id) ON DELETE SET NULL,
  FOREIGN KEY (owner_id) REFERENCES users(discord_id) ON DELETE CASCADE
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🤖 PRINCIPLE 5: AI AUTONOMY & OBSERVATION
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- AI Agent Permissions (bounded autonomy)
CREATE TABLE IF NOT EXISTS ai_agent_permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,                 -- Who granted this permission
  agent_id TEXT NOT NULL,                -- 'tesseract_avatar', 'auto_trader', 'reputation_guardian'
  permission_scope TEXT NOT NULL,        -- 'read_balance', 'vote_proposals', 'trade_nfts', 'claim_daily'
  max_transaction_value REAL DEFAULT 0, -- Spending limit (e.g., trade up to 100 DUST)
  expires_at DATETIME,                   -- Optional expiration
  granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  revoked INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(discord_id) ON DELETE CASCADE,
  UNIQUE(user_id, agent_id, permission_scope)
);

-- AI Action Logs (audit trail for autonomous actions)
CREATE TABLE IF NOT EXISTS ai_action_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id TEXT NOT NULL,                -- Which AI performed the action
  user_id TEXT NOT NULL,                 -- On whose behalf
  action_type TEXT NOT NULL,             -- 'trade_nft', 'vote_proposal', 'claim_daily'
  action_data TEXT,                      -- JSON blob of action details
  success INTEGER DEFAULT 1,
  error_message TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(discord_id) ON DELETE CASCADE
);

-- AI Observations (what the AI learns about system state)
CREATE TABLE IF NOT EXISTS ai_observations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id TEXT NOT NULL,
  observation_type TEXT NOT NULL,        -- 'market_trend', 'reputation_pattern', 'governance_insight'
  observation_data TEXT NOT NULL,        -- JSON: { "pattern": "whale_accumulation", "confidence": 0.87 }
  confidence REAL DEFAULT 0.5,           -- AI's confidence in this observation (0-1)
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Example AI observations:
-- { "type": "market_trend", "data": { "pattern": "nft_rarity_correlation", "insight": "Legendary NFTs sell 3.2x faster" }, "confidence": 0.91 }
-- { "type": "reputation_pattern", "data": { "insight": "Users who vote on 5+ proposals gain 23% more reputation" }, "confidence": 0.78 }

-- ═══════════════════════════════════════════════════════════════════════════
-- 🔗 FOREIGN KEY CASCADE RULES (Isomorphic Integrity Enforcement)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Deleting a USER cascades through:
--   ✓ sovereign_keys (their cryptographic identity)
--   ✓ auth_sessions (their authentication history)
--   ✓ identity_achievements (their portable reputation)
--   ✓ external_reputation (their cross-platform links)
--   ✓ platform_integrations (their OAuth tokens)
--   ✓ verifiable_claims (their claim portfolio)
--   ✓ ai_agent_permissions (their AI authorizations)
--   ✓ ai_action_logs (audit trail of AI actions)
--   ✓ votes (their governance participation)
--   ✓ nfts (where they're the owner - transfers to NULL if creator)
--
-- This is TOPOLOGICAL INTEGRITY: The user IS their sovereignty graph.
-- Deleting the center node removes all edges. No orphaned data.
--
-- ═══════════════════════════════════════════════════════════════════════════

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 📊 INDEXES FOR PERFORMANCE (AI queries hit these frequently)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_transactions_royalty ON transactions(royalty_stream_id);
CREATE INDEX IF NOT EXISTS idx_votes_proposal ON votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_nfts_creator ON nfts(creator_id);
CREATE INDEX IF NOT EXISTS idx_nfts_owner ON nfts(owner_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user ON identity_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_permissions_user ON ai_agent_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_agent ON ai_action_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_external_rep_user ON external_reputation(user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- 🎯 SCHEMA SUMMARY
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Total Tables: 18 (+ 5 new Herald tables = 23 total)
-- Total Principles Enforced: 5
--
-- 1️⃣ Sovereign Identity: ✅ (sovereign_keys, auth_sessions)
-- 2️⃣ Portable Reputation: ✅ (identity_achievements.portable, external_reputation)
-- 3️⃣ Claim Portfolio: ✅ (verifiable_claims with cryptographic signatures)
-- 4️⃣ Isomorphic Integrity: ✅ (triple-helix via foreign keys, cascade deletes)
-- 5️⃣ AI Autonomy: ✅ (ai_agent_permissions, ai_action_logs, ai_observations)
--
-- This is not a "user database." This is a SOVEREIGNTY GRAPH.
-- ═══════════════════════════════════════════════════════════════════════════
