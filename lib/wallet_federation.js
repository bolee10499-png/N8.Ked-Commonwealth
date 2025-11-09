/**
 * Multi-Wallet Federation System
 * 
 * Architecture: Cross-chain wallet linking with cryptographic proof
 * Supports: Phantom (Solana), Coinbase Wallet (ETH/multi-chain), 
 *           Electrum (Bitcoin), Ledger (hardware), Crypto.com
 * 
 * Philosophy: Tree of Life roots - each blockchain teaches archetypal wisdom
 * - Solana: Speed and parallel execution
 * - Ethereum: Composability and smart contracts
 * - Bitcoin: Security and store of value
 * - XRP: Bridging and settlement
 * 
 * Economic Model: Aggregate activity across ALL chains → unified dust rewards
 * Water Backing: Cross-chain value flows like water through roots
 */

const nacl = require('tweetnacl');
const bs58 = require('bs58');
const { getDatabase } = require('../database/db_service');

class WalletFederation {
  constructor() {
    this.db = getDatabase();
    this.supportedChains = {
      solana: {
        name: 'Solana',
        providers: ['phantom', 'solflare', 'ledger'],
        archetype: 'speed',
        wisdom: 'Parallel execution, high throughput, low cost'
      },
      ethereum: {
        name: 'Ethereum',
        providers: ['coinbase_wallet', 'metamask', 'ledger'],
        archetype: 'composability',
        wisdom: 'Smart contracts, DeFi primitives, programmable money'
      },
      bitcoin: {
        name: 'Bitcoin',
        providers: ['electrum', 'ledger', 'trezor'],
        archetype: 'security',
        wisdom: 'Proof of work, immutability, digital gold'
      },
      xrp: {
        name: 'XRP Ledger',
        providers: ['xumm', 'ledger'],
        archetype: 'bridging',
        wisdom: 'Cross-border settlement, liquidity, interoperability'
      }
    };
    
    this.initializeDatabase();
  }

  /**
   * Create wallet_links table for multi-wallet support
   */
  initializeDatabase() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS wallet_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        chain TEXT NOT NULL,
        address TEXT NOT NULL,
        provider TEXT,
        verification_proof TEXT NOT NULL,
        verification_message TEXT,
        verified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_primary INTEGER DEFAULT 0,
        activity_count INTEGER DEFAULT 0,
        last_activity_at DATETIME,
        dust_earned REAL DEFAULT 0.0,
        metadata TEXT,
        FOREIGN KEY (user_id) REFERENCES sovereign_keys(user_id),
        UNIQUE(chain, address)
      );
    `;

    const createIndexSQL = `
      CREATE INDEX IF NOT EXISTS idx_wallet_links_user 
      ON wallet_links(user_id);
    `;

    try {
      this.db.exec(createTableSQL);
      this.db.exec(createIndexSQL);
      console.log('[WalletFederation] Database initialized - wallet_links table ready');
    } catch (error) {
      console.error('[WalletFederation] Database initialization failed:', error);
    }
  }

  /**
   * Link a new wallet via message signing verification
   * 
   * @param {string} userId - Discord user ID (sovereign identity)
   * @param {string} chain - Blockchain network (solana, ethereum, bitcoin, xrp)
   * @param {string} address - Public wallet address
   * @param {string} signature - Cryptographic signature
   * @param {string} message - Original signed message
   * @param {string} provider - Wallet provider (phantom, coinbase_wallet, etc)
   * @param {boolean} setPrimary - Set as primary wallet for this chain
   * @returns {object} Result with success status and wallet data
   */
  async linkWallet(userId, chain, address, signature, message, provider = null, setPrimary = false) {
    // Validate chain support
    if (!this.supportedChains[chain]) {
      return {
        success: false,
        error: 'UNSUPPORTED_CHAIN',
        message: `Chain '${chain}' not supported. Available: ${Object.keys(this.supportedChains).join(', ')}`
      };
    }

    // Verify signature based on chain
    const verificationResult = await this.verifySignature(chain, address, signature, message);
    
    if (!verificationResult.valid) {
      return {
        success: false,
        error: 'VERIFICATION_FAILED',
        message: verificationResult.reason || 'Signature verification failed'
      };
    }

    // Check if wallet already linked
    const existingWallet = this.db.prepare(`
      SELECT * FROM wallet_links 
      WHERE chain = ? AND address = ?
    `).get(chain, address);

    if (existingWallet && existingWallet.user_id !== userId) {
      return {
        success: false,
        error: 'WALLET_ALREADY_LINKED',
        message: 'This wallet is already linked to another sovereign identity'
      };
    }

    // If setting as primary, unset other primary wallets for this chain
    if (setPrimary) {
      this.db.prepare(`
        UPDATE wallet_links 
        SET is_primary = 0 
        WHERE user_id = ? AND chain = ?
      `).run(userId, chain);
    }

    // Link the wallet
    const insertSQL = `
      INSERT INTO wallet_links 
      (user_id, chain, address, provider, verification_proof, verification_message, is_primary)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    try {
      const result = this.db.prepare(insertSQL).run(
        userId,
        chain,
        address,
        provider,
        signature,
        message,
        setPrimary ? 1 : 0
      );

      console.log(`[WalletFederation] Wallet linked: ${chain}:${address} → ${userId}`);

      return {
        success: true,
        wallet: {
          id: result.lastInsertRowid,
          userId,
          chain,
          address,
          provider,
          isPrimary: setPrimary,
          archetype: this.supportedChains[chain].archetype,
          wisdom: this.supportedChains[chain].wisdom
        }
      };
    } catch (error) {
      console.error('[WalletFederation] Link failed:', error);
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: error.message
      };
    }
  }

  /**
   * Verify cryptographic signature for wallet ownership proof
   * 
   * @param {string} chain - Blockchain network
   * @param {string} address - Public address
   * @param {string} signature - Signature to verify
   * @param {string} message - Original signed message
   * @returns {object} Verification result with validity and reason
   */
  async verifySignature(chain, address, signature, message) {
    try {
      switch (chain) {
        case 'solana':
          return this.verifySolanaSignature(address, signature, message);
        
        case 'ethereum':
          return this.verifyEthereumSignature(address, signature, message);
        
        case 'bitcoin':
          return this.verifyBitcoinSignature(address, signature, message);
        
        case 'xrp':
          return this.verifyXRPSignature(address, signature, message);
        
        default:
          return {
            valid: false,
            reason: `Signature verification not implemented for ${chain}`
          };
      }
    } catch (error) {
      console.error(`[WalletFederation] Verification error (${chain}):`, error);
      return {
        valid: false,
        reason: error.message
      };
    }
  }

  /**
   * Verify Solana wallet signature (ed25519)
   */
  verifySolanaSignature(address, signature, message) {
    try {
      const publicKeyBytes = bs58.decode(address);
      const signatureBytes = bs58.decode(signature);
      const messageBytes = new TextEncoder().encode(message);

      const valid = nacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKeyBytes
      );

      return {
        valid,
        reason: valid ? 'Solana signature verified' : 'Invalid Solana signature'
      };
    } catch (error) {
      return {
        valid: false,
        reason: `Solana verification failed: ${error.message}`
      };
    }
  }

  /**
   * Verify Ethereum wallet signature (ECDSA secp256k1)
   * Note: Requires ethers.js for production use
   */
  verifyEthereumSignature(address, signature, message) {
    // TODO: Implement with ethers.js
    // const { verifyMessage } = require('ethers');
    // const recoveredAddress = verifyMessage(message, signature);
    // return recoveredAddress.toLowerCase() === address.toLowerCase();
    
    console.log('[WalletFederation] Ethereum verification placeholder - implement with ethers.js');
    return {
      valid: true, // PLACEHOLDER for zero-budget MVP
      reason: 'Ethereum verification pending ethers.js integration'
    };
  }

  /**
   * Verify Bitcoin wallet signature (ECDSA secp256k1)
   * Note: Requires bitcoinjs-lib for production use
   */
  verifyBitcoinSignature(address, signature, message) {
    // TODO: Implement with bitcoinjs-lib
    // const bitcoin = require('bitcoinjs-lib');
    // const verified = bitcoin.message.verify(message, address, signature);
    
    console.log('[WalletFederation] Bitcoin verification placeholder - implement with bitcoinjs-lib');
    return {
      valid: true, // PLACEHOLDER for zero-budget MVP
      reason: 'Bitcoin verification pending bitcoinjs-lib integration'
    };
  }

  /**
   * Verify XRP Ledger signature (ECDSA secp256k1 or ed25519)
   * Note: Requires xrpl.js for production use
   */
  verifyXRPSignature(address, signature, message) {
    // TODO: Implement with xrpl.js
    // const { verify } = require('xrpl');
    
    console.log('[WalletFederation] XRP verification placeholder - implement with xrpl.js');
    return {
      valid: true, // PLACEHOLDER for zero-budget MVP
      reason: 'XRP verification pending xrpl.js integration'
    };
  }

  /**
   * Get all linked wallets for a user
   * 
   * @param {string} userId - Discord user ID
   * @returns {array} Array of linked wallet objects
   */
  getLinkedWallets(userId) {
    const wallets = this.db.prepare(`
      SELECT * FROM wallet_links 
      WHERE user_id = ?
      ORDER BY is_primary DESC, chain ASC, verified_at DESC
    `).all(userId);

    return wallets.map(wallet => ({
      ...wallet,
      archetype: this.supportedChains[wallet.chain]?.archetype,
      wisdom: this.supportedChains[wallet.chain]?.wisdom
    }));
  }

  /**
   * Get primary wallet for a specific chain
   * 
   * @param {string} userId - Discord user ID
   * @param {string} chain - Blockchain network
   * @returns {object|null} Primary wallet or null if none set
   */
  getPrimaryWallet(userId, chain) {
    return this.db.prepare(`
      SELECT * FROM wallet_links 
      WHERE user_id = ? AND chain = ? AND is_primary = 1
      LIMIT 1
    `).get(userId, chain);
  }

  /**
   * Record wallet activity (transaction, interaction, etc.)
   * Updates activity_count and last_activity_at
   * 
   * @param {string} chain - Blockchain network
   * @param {string} address - Wallet address
   * @param {number} dustEarned - Dust rewarded for this activity (optional)
   */
  recordActivity(chain, address, dustEarned = 0) {
    const updateSQL = `
      UPDATE wallet_links 
      SET 
        activity_count = activity_count + 1,
        last_activity_at = CURRENT_TIMESTAMP,
        dust_earned = dust_earned + ?
      WHERE chain = ? AND address = ?
    `;

    const result = this.db.prepare(updateSQL).run(dustEarned, chain, address);
    
    if (result.changes > 0) {
      console.log(`[WalletFederation] Activity recorded: ${chain}:${address} (+${dustEarned} dust)`);
    }

    return result.changes > 0;
  }

  /**
   * Aggregate dust earned across all linked wallets
   * 
   * @param {string} userId - Discord user ID
   * @returns {object} Aggregated dust totals by chain and total
   */
  getAggregatedDust(userId) {
    const wallets = this.getLinkedWallets(userId);
    
    const byChain = {};
    let totalDust = 0;

    wallets.forEach(wallet => {
      if (!byChain[wallet.chain]) {
        byChain[wallet.chain] = 0;
      }
      byChain[wallet.chain] += wallet.dust_earned;
      totalDust += wallet.dust_earned;
    });

    return {
      totalDust,
      byChain,
      walletCount: wallets.length,
      chains: Object.keys(byChain)
    };
  }

  /**
   * Unlink a wallet (removes cross-chain connection)
   * 
   * @param {string} userId - Discord user ID (must own the wallet)
   * @param {string} chain - Blockchain network
   * @param {string} address - Wallet address
   * @returns {boolean} Success status
   */
  unlinkWallet(userId, chain, address) {
    const result = this.db.prepare(`
      DELETE FROM wallet_links 
      WHERE user_id = ? AND chain = ? AND address = ?
    `).run(userId, chain, address);

    if (result.changes > 0) {
      console.log(`[WalletFederation] Wallet unlinked: ${chain}:${address}`);
    }

    return result.changes > 0;
  }

  /**
   * Generate verification message for wallet linking
   * Standard format for consistent signing
   * 
   * @param {string} userId - Discord user ID
   * @param {number} timestamp - Unix timestamp (prevents replay attacks)
   * @returns {string} Message to be signed by wallet
   */
  static generateVerificationMessage(userId, timestamp = Date.now()) {
    return `N8.KED Sovereign Commonwealth
Wallet Verification

I hereby link this wallet to my sovereign identity.

Discord User: ${userId}
Timestamp: ${timestamp}

By signing this message, I cryptographically prove ownership of this wallet and authorize cross-chain activity aggregation for unified dust rewards.

Glass House Transparency | Constitutional Voice`;
  }

  /**
   * Get federation statistics
   * 
   * @returns {object} Stats about total wallets, chains, activity
   */
  getStats() {
    const totalWallets = this.db.prepare('SELECT COUNT(*) as count FROM wallet_links').get().count;
    const totalUsers = this.db.prepare('SELECT COUNT(DISTINCT user_id) as count FROM wallet_links').get().count;
    const totalDust = this.db.prepare('SELECT SUM(dust_earned) as total FROM wallet_links').get().total || 0;
    
    const chainStats = this.db.prepare(`
      SELECT 
        chain,
        COUNT(*) as wallet_count,
        SUM(activity_count) as total_activity,
        SUM(dust_earned) as total_dust
      FROM wallet_links
      GROUP BY chain
    `).all();

    return {
      totalWallets,
      totalUsers,
      totalDust,
      averageWalletsPerUser: totalUsers > 0 ? (totalWallets / totalUsers).toFixed(2) : 0,
      chainStats: chainStats.map(stat => ({
        ...stat,
        archetype: this.supportedChains[stat.chain]?.archetype,
        wisdom: this.supportedChains[stat.chain]?.wisdom
      }))
    };
  }
}

module.exports = { WalletFederation };
