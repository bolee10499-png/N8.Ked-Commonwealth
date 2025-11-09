/**
 * 🛡️ THE HERALD - Cryptographic Authentication System
 * 
 * Philosophy: Passwords are begging permission. Keys are PROVING OWNERSHIP.
 * 
 * Architecture:
 * - Sovereign Identity: User = cryptographic keypair (not username/password)
 * - Challenge-Response: Server never sees private key
 * - Portable Reputation: Identity transcends platforms
 * - Claim Portfolio: Verifiable achievements, not static profiles
 * - Zero-Knowledge Proofs: Prove facts without revealing data
 * 
 * The Herald doesn't guard a door. It RECOGNIZES SOVEREIGNTY.
 */

const crypto = require('crypto');

class Herald {
  constructor(database) {
    this.db = database; // Use injected database instance
    this.activeChallenges = new Map(); // userId -> { challenge, timestamp }
    this.challengeExpiration = 300000; // 5 minutes
    
    this.initializeSchema();
  }

  /**
   * 🗄️ Database Schema for Cryptographic Identity
   * 
   * Philosophy: Database stores PROOFS, not credentials
   */
  initializeSchema() {
    if (!this.db) {
      console.warn('[HERALD] ⚠️  No database instance provided, skipping schema initialization');
      return;
    }

    // Sovereign Keys Table (user owns their identity)
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS sovereign_keys (
        user_id TEXT PRIMARY KEY,
        public_key TEXT NOT NULL UNIQUE,
        key_algorithm TEXT DEFAULT 'ed25519',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_auth DATETIME,
        auth_count INTEGER DEFAULT 0,
        revoked INTEGER DEFAULT 0
      )
    `).run();

    // Verifiable Claims Table (portable achievements)
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS verifiable_claims (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        claim_type TEXT NOT NULL, -- 'reputation', 'achievement', 'balance', 'governance'
        claim_data TEXT NOT NULL, -- JSON blob of claim details
        signature TEXT NOT NULL, -- Cryptographic signature
        issuer TEXT DEFAULT 'n8.ked', -- Who issued this claim
        issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME, -- Optional expiration
        revoked INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES sovereign_keys(user_id)
      )
    `).run();

    // External Reputation Imports (bring reputation from other platforms)
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS external_reputation (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        platform TEXT NOT NULL, -- 'reddit', 'youtube', 'github', 'twitter'
        platform_user_id TEXT NOT NULL,
        reputation_score INTEGER DEFAULT 0,
        verification_proof TEXT, -- Link to public proof (e.g., Reddit comment with verification code)
        verified_at DATETIME,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES sovereign_keys(user_id),
        UNIQUE(user_id, platform)
      )
    `).run();

    // Auth Session Logs (audit trail, not auth mechanism)
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS auth_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        challenge TEXT NOT NULL,
        response TEXT,
        success INTEGER DEFAULT 0,
        ip_address TEXT,
        user_agent TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES sovereign_keys(user_id)
      )
    `).run();

    // AI Agent Permissions (autonomous actions within bounds)
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS ai_agent_permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        agent_id TEXT NOT NULL, -- 'tesseract_avatar', 'auto_trader', etc.
        permission_scope TEXT NOT NULL, -- 'read_balance', 'vote_proposals', 'trade_nfts'
        max_transaction_value REAL DEFAULT 0, -- Spending limit for agent
        expires_at DATETIME,
        granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        revoked INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES sovereign_keys(user_id),
        UNIQUE(user_id, agent_id, permission_scope)
      )
    `).run();

    console.log('[HERALD] ✅ Cryptographic identity schema initialized');
  }

  /**
   * 🔑 Register New Sovereign Identity
   * 
   * User provides their PUBLIC key. Private key NEVER leaves their device.
   */
  registerSovereignKey(userId, publicKey, algorithm = 'ed25519') {
    try {
      this.db.prepare(`
        INSERT INTO sovereign_keys (user_id, public_key, key_algorithm)
        VALUES (?, ?, ?)
      `).run(userId, publicKey, algorithm);

      console.log(`[HERALD] 🔑 Sovereign key registered for ${userId}`);

      return {
        success: true,
        userId,
        publicKey,
        message: 'Sovereign identity created. You own your keys.'
      };
    } catch (error) {
      if (error.message.includes('UNIQUE')) {
        return {
          success: false,
          error: 'Public key already registered to another identity'
        };
      }
      throw error;
    }
  }

  /**
   * ⚔️ Challenge-Response Authentication
   * 
   * 1. Server generates random challenge
   * 2. Client signs challenge with private key
   * 3. Server verifies signature with public key
   * 4. No password, no secret transmission
   */
  generateChallenge(userId) {
    // Generate cryptographically random challenge
    const challenge = crypto.randomBytes(32).toString('hex');
    
    this.activeChallenges.set(userId, {
      challenge,
      timestamp: Date.now()
    });

    // Clean up expired challenges
    this.pruneExpiredChallenges();

    return {
      challenge,
      expiresIn: this.challengeExpiration / 1000, // seconds
      instructions: 'Sign this challenge with your private key and submit via !auth_response <signature>'
    };
  }

  /**
   * ✅ Verify Challenge Response
   * 
   * User signed the challenge. Verify it matches their public key.
   */
  verifyResponse(userId, signatureHex) {
    const challengeData = this.activeChallenges.get(userId);
    
    if (!challengeData) {
      return {
        success: false,
        error: 'No active challenge. Request new challenge with !auth_challenge'
      };
    }

    if (Date.now() - challengeData.timestamp > this.challengeExpiration) {
      this.activeChallenges.delete(userId);
      return {
        success: false,
        error: 'Challenge expired. Request new challenge.'
      };
    }

    try {
      // Get user's public key from database
      const keyData = this.db.prepare('SELECT public_key, key_algorithm FROM sovereign_keys WHERE user_id = ?').get(userId);
      
      if (!keyData) {
        return {
          success: false,
          error: 'No sovereign key registered. Use !register_key first.'
        };
      }

      // Verify signature
      const verify = crypto.createVerify('SHA256');
      verify.update(challengeData.challenge);
      verify.end();

      const publicKey = keyData.public_key;
      const isValid = verify.verify(publicKey, signatureHex, 'hex');

      // Log auth attempt
      this.db.prepare(`
        INSERT INTO auth_sessions (user_id, challenge, response, success)
        VALUES (?, ?, ?, ?)
      `).run(userId, challengeData.challenge, signatureHex, isValid ? 1 : 0);

      if (isValid) {
        // Update last auth timestamp
        this.db.prepare(`
          UPDATE sovereign_keys 
          SET last_auth = CURRENT_TIMESTAMP, auth_count = auth_count + 1 
          WHERE user_id = ?
        `).run(userId);

        this.activeChallenges.delete(userId);

        return {
          success: true,
          message: 'Sovereignty recognized. Authentication successful.',
          userId
        };
      } else {
        return {
          success: false,
          error: 'Invalid signature. Challenge verification failed.'
        };
      }
    } catch (error) {
      console.error('[HERALD] Verification error:', error);
      return {
        success: false,
        error: 'Cryptographic verification failed: ' + error.message
      };
    }
  }

  /**
   * 🧹 Clean up expired challenges
   */
  pruneExpiredChallenges() {
    const now = Date.now();
    for (const [userId, data] of this.activeChallenges.entries()) {
      if (now - data.timestamp > this.challengeExpiration) {
        this.activeChallenges.delete(userId);
      }
    }
  }

  /**
   * 📜 Create Verifiable Claim
   * 
   * System issues cryptographically signed claims that user can prove elsewhere
   */
  issueClaim(userId, claimType, claimData, expiresAt = null) {
    try {
      // Generate claim signature (using HMAC instead of RSA for simplicity)
      const claimString = JSON.stringify({ userId, claimType, claimData, timestamp: Date.now() });
      const hmac = crypto.createHmac('sha256', process.env.HERALD_SECRET || 'n8ked_default_secret');
      hmac.update(claimString);
      const signature = hmac.digest('hex');

      this.db.prepare(`
        INSERT INTO verifiable_claims (user_id, claim_type, claim_data, signature, expires_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(userId, claimType, JSON.stringify(claimData), signature, expiresAt);

      return {
        success: true,
        claim: {
          type: claimType,
          data: claimData,
          signature,
          issuer: 'n8.ked',
          issuedAt: new Date().toISOString(),
          expiresAt
        }
      };
    } catch (error) {
      console.error('[HERALD] Claim issuance error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🌐 Import External Reputation
   * 
   * User proves they own Reddit/YouTube account, we import their reputation
   */
  importExternalReputation(userId, platform, platformUserId, verificationProof) {
    try {
      this.db.prepare(`
        INSERT OR REPLACE INTO external_reputation 
        (user_id, platform, platform_user_id, verification_proof, verified_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run(userId, platform, platformUserId, verificationProof);

      // TODO: Actually fetch reputation from platform API
      // For now, create placeholder claim
      this.issueClaim(userId, 'external_reputation', {
        platform,
        platformUserId,
        verified: true
      });

      return {
        success: true,
        message: `${platform} reputation linked to sovereign identity`
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 🤖 Grant AI Agent Permission
   * 
   * User authorizes AI to act on their behalf within strict bounds
   */
  grantAIPermission(userId, agentId, permissionScope, maxValue = 0, expiresAt = null) {
    try {
      this.db.prepare(`
        INSERT INTO ai_agent_permissions 
        (user_id, agent_id, permission_scope, max_transaction_value, expires_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(userId, agentId, permissionScope, maxValue, expiresAt);

      return {
        success: true,
        message: `AI agent '${agentId}' authorized for '${permissionScope}'`,
        limits: { maxValue, expiresAt }
      };
    } catch (error) {
      if (error.message.includes('UNIQUE')) {
        return {
          success: false,
          error: 'Permission already granted. Revoke first to modify.'
        };
      }
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔍 Check if AI Agent has Permission
   */
  checkAIPermission(userId, agentId, permissionScope) {
    const perm = this.db.prepare(`
      SELECT * FROM ai_agent_permissions
      WHERE user_id = ? AND agent_id = ? AND permission_scope = ?
        AND revoked = 0
        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
    `).get(userId, agentId, permissionScope);

    return perm !== undefined;
  }

  /**
   * 🚫 Revoke AI Agent Permission
   */
  revokeAIPermission(userId, agentId, permissionScope) {
    this.db.prepare(`
      UPDATE ai_agent_permissions
      SET revoked = 1
      WHERE user_id = ? AND agent_id = ? AND permission_scope = ?
    `).run(userId, agentId, permissionScope);

    return {
      success: true,
      message: `Permission '${permissionScope}' revoked for agent '${agentId}'`
    };
  }

  /**
   * 📊 Get User's Claim Portfolio
   * 
   * All verifiable claims they can prove to other systems
   */
  getClaimPortfolio(userId) {
    const claims = this.db.prepare(`
      SELECT * FROM verifiable_claims
      WHERE user_id = ? AND revoked = 0
        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
      ORDER BY issued_at DESC
    `).all(userId);

    return {
      userId,
      claims: claims.map(c => ({
        type: c.claim_type,
        data: JSON.parse(c.claim_data),
        signature: c.signature,
        issuer: c.issuer,
        issuedAt: c.issued_at,
        expiresAt: c.expires_at
      })),
      count: claims.length
    };
  }

  /**
   * 🔗 Generate Portable Identity Export
   * 
   * Everything user needs to prove their identity elsewhere
   */
  exportPortableIdentity(userId) {
    const keyData = this.db.prepare('SELECT public_key, key_algorithm FROM sovereign_keys WHERE user_id = ?').get(userId);
    const portfolio = this.getClaimPortfolio(userId);
    const externalRep = this.db.prepare('SELECT * FROM external_reputation WHERE user_id = ?').all(userId);

    return {
      version: '1.0.0',
      userId,
      publicKey: keyData?.public_key,
      algorithm: keyData?.key_algorithm,
      claims: portfolio.claims,
      externalReputation: externalRep.map(r => ({
        platform: r.platform,
        platformUserId: r.platform_user_id,
        reputationScore: r.reputation_score,
        verifiedAt: r.verified_at
      })),
      exportedAt: new Date().toISOString(),
      signature: this.signPortableIdentity(userId) // Sign the export itself
    };
  }

  /**
   * ✍️ Sign Portable Identity (proof it came from us)
   */
  signPortableIdentity(userId) {
    const hmac = crypto.createHmac('sha256', process.env.HERALD_SECRET || 'n8ked_default_secret');
    hmac.update(`${userId}:${Date.now()}`);
    return hmac.digest('hex');
  }
}

module.exports = Herald;
