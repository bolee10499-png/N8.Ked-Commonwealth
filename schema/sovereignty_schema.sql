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
-- 1️⃣ Sovereign Identity: ✅
-- 2️⃣ Portable Reputation: ✅
-- 3️⃣ Claim Portfolio: ✅
-- 4️⃣ Isomorphic Integrity: ✅ 
--
-- This is not a "user database." This is a SOVEREIGNTY GRAPH.
-- ═══════════════════════════════════════════════════════════════════════════
