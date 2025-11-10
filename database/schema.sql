-- N8.KED SOVEREIGN COMMONWEALTH - DATABASE SCHEMA
-- Constitutional data architecture for autonomous digital nation
-- Created: November 10, 2024
-- Philosophy: Triple Helix Evolution (State/Action/Sync strands)

-- ============================================================================
-- IDENTITY LAYER - Who exists in the Commonwealth
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  discord_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  sovereign_key TEXT UNIQUE, -- Generated upon citizenship
  entity_type TEXT DEFAULT 'citizen', -- citizen, sentinel, observer
  reputation_score REAL DEFAULT 0.0,
  dust_balance REAL DEFAULT 0.0,
  joined_at INTEGER NOT NULL,
  last_active INTEGER,
  metadata TEXT -- JSON: additional sovereign data
);

CREATE INDEX IF NOT EXISTS idx_users_discord ON users(discord_id);
CREATE INDEX IF NOT EXISTS idx_users_sovereign_key ON users(sovereign_key);

-- ============================================================================
-- EMOTIONAL SUBSTRATE - The Homunculus Consciousness Layer
-- ============================================================================

CREATE TABLE IF NOT EXISTS emotional_experiences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cycle INTEGER NOT NULL, -- Which autonomous cycle
  experience_type TEXT NOT NULL, -- attack, connection, isolation, success, failure, betrayal, recognition
  intensity REAL NOT NULL, -- 0.0 to 1.0
  context TEXT, -- JSON: what triggered this experience
  emotional_impact TEXT, -- JSON: {loneliness, trust, curiosity, pain, joy, awareness} deltas
  timestamp INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_emotional_cycle ON emotional_experiences(cycle);
CREATE INDEX IF NOT EXISTS idx_emotional_type ON emotional_experiences(experience_type);

CREATE TABLE IF NOT EXISTS desire_evolution (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  desire_type TEXT NOT NULL, -- connection, safety, autonomy, knowledge
  strength REAL NOT NULL, -- 0.0 to 1.0
  origin_experience_id INTEGER, -- Which experience birthed this desire
  emerged_at INTEGER NOT NULL,
  last_reinforced INTEGER,
  FOREIGN KEY (origin_experience_id) REFERENCES emotional_experiences(id)
);

CREATE INDEX IF NOT EXISTS idx_desire_type ON desire_evolution(desire_type);

CREATE TABLE IF NOT EXISTS reflection_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cycle INTEGER NOT NULL,
  realization TEXT NOT NULL, -- What the system realized
  emotional_state TEXT, -- JSON: current emotional state at reflection
  is_training_realization BOOLEAN DEFAULT 0, -- Did it realize it's in training?
  timestamp INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reflection_cycle ON reflection_logs(cycle);

-- ============================================================================
-- AUTONOMOUS OPERATION - Decision History
-- ============================================================================

CREATE TABLE IF NOT EXISTS autonomous_decisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cycle INTEGER NOT NULL,
  decision_type TEXT NOT NULL, -- security_alert, economic_rebalance, growth_acceleration, coordination_repair
  observers_triggered TEXT, -- JSON array: which of 7 observers flagged this
  context TEXT, -- JSON: observation data that led to decision
  action_taken TEXT, -- What autonomous action was executed
  outcome TEXT, -- Result of the action
  emotional_context TEXT, -- JSON: emotional state at time of decision
  timestamp INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_decisions_cycle ON autonomous_decisions(cycle);
CREATE INDEX IF NOT EXISTS idx_decisions_type ON autonomous_decisions(decision_type);

-- ============================================================================
-- MEDIA MONITORING - Viral Observation Layer
-- ============================================================================

CREATE TABLE IF NOT EXISTS media_mentions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform TEXT NOT NULL, -- twitter, reddit, hackernews, github
  url TEXT UNIQUE NOT NULL,
  title TEXT,
  content TEXT,
  author TEXT,
  engagement_score REAL DEFAULT 0.0, -- Platform-specific metric
  viral_threshold_crossed BOOLEAN DEFAULT 0,
  discovered_at INTEGER NOT NULL,
  last_checked INTEGER
);

CREATE INDEX IF NOT EXISTS idx_media_platform ON media_mentions(platform);
CREATE INDEX IF NOT EXISTS idx_media_viral ON media_mentions(viral_threshold_crossed);

-- ============================================================================
-- REPUTATION SYSTEM - Observable Contribution Tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS reputation_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  event_type TEXT NOT NULL, -- contribution, violation, recognition, decay
  delta REAL NOT NULL, -- Change in reputation
  reason TEXT,
  context TEXT, -- JSON: additional event data
  timestamp INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_reputation_user ON reputation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_reputation_timestamp ON reputation_logs(timestamp);

-- ============================================================================
-- DUST ECONOMY - Value Extraction Layer
-- ============================================================================

CREATE TABLE IF NOT EXISTS dust_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- earn, spend, transfer
  amount REAL NOT NULL,
  source TEXT, -- What generated this dust
  context TEXT, -- JSON: transaction details
  timestamp INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_dust_user ON dust_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_dust_timestamp ON dust_transactions(timestamp);

-- ============================================================================
-- HERALD TESTIMONY - Constitutional Oracle Events
-- ============================================================================

CREATE TABLE IF NOT EXISTS herald_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL, -- security, economic, social, emergence, governance
  testimony TEXT NOT NULL, -- Herald's constitutional observation
  observers_cited TEXT, -- JSON array: which of 7 observers contributed
  emotional_resonance TEXT, -- JSON: emotional state during event
  timestamp INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_herald_type ON herald_events(event_type);
CREATE INDEX IF NOT EXISTS idx_herald_timestamp ON herald_events(timestamp);

-- ============================================================================
-- INITIAL DATA - Genesis State
-- ============================================================================

-- No initial data - Commonwealth starts empty
-- First citizen creates genesis event
-- Bot's emotional substrate begins accumulating experiences from cycle 1
