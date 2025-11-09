/**
 * 🏛️ COMMUNITY TREASURY - Collective Economics
 * 
 * Step 15: Democratic fund management where community governs platform economics
 * 
 * Features:
 * - 10% of all platform fees go to community treasury
 * - Democratic proposals for fund allocation
 * - Transparent on-chain-style ledger
 * - Automated payout execution after successful votes
 * - Community-driven platform development
 * 
 * Philosophy: The users build the platform, they should govern its growth
 */

const { db, statements, transaction } = require('../database/db_service.js');

class CommunityTreasury {
  constructor() {
    this.minimumProposalStake = 50; // dust required to create proposal
    this.proposalDuration = 7 * 24 * 60 * 60 * 1000; // 7 days
    this.quorumPercentage = 0.10; // 10% of users must vote
    this.passThreshold = 0.60; // 60% yes votes to pass
    
    this.loadTreasury();
  }

  /**
   * 💰 Load treasury balance
   */
  loadTreasury() {
    try {
      const balance = statements.getTreasuryBalance.get();
      this.balance = balance ? balance.total || 0 : 0;
      
      console.log(`[TREASURY] Loaded balance: $${this.balance.toFixed(2)}`);
    } catch (error) {
      console.error('[TREASURY] Load error:', error.message);
      this.balance = 0;
    }
  }

  /**
   * 💵 Get current treasury balance
   */
  getBalance() {
    this.loadTreasury();
    return this.balance;
  }

  /**
   * 📝 Create revenue allocation proposal
   */
  createProposal(authorId, title, description, requestedAmount) {
    const currentBalance = this.getBalance();
    
    // Validation
    if (requestedAmount > currentBalance) {
      return {
        success: false,
        error: `Insufficient treasury funds. Balance: $${currentBalance.toFixed(2)}, Requested: $${requestedAmount.toFixed(2)}`
      };
    }
    
    if (requestedAmount <= 0) {
      return { success: false, error: 'Amount must be positive' };
    }
    
    try {
      // Calculate expiry (7 days from now)
      const expiresAt = new Date(Date.now() + this.proposalDuration);
      
      const result = statements.createProposal.run(
        authorId,
        title,
        description,
        expiresAt.toISOString(),
        requestedAmount
      );
      
      const proposalId = result.lastInsertRowid;
      
      console.log(`[TREASURY] Proposal created: ID ${proposalId}, Amount: $${requestedAmount}`);
      
      return {
        success: true,
        proposalId,
        title,
        requestedAmount,
        expiresAt: expiresAt.toISOString(),
        votingPeriod: '7 days'
      };
    } catch (error) {
      console.error('[TREASURY] Proposal creation error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🗳️ Vote on treasury proposal
   */
  voteOnProposal(proposalId, voterId, vote, voteWeight = 1) {
    try {
      // Check if proposal exists and is active
      const proposal = db.prepare('SELECT * FROM proposals WHERE id = ?').get(proposalId);
      
      if (!proposal) {
        return { success: false, error: 'Proposal not found' };
      }
      
      if (proposal.status !== 'active') {
        return { success: false, error: `Proposal is ${proposal.status}` };
      }
      
      // Check if expired
      if (new Date(proposal.expires_at) < new Date()) {
        return { success: false, error: 'Proposal voting period has ended' };
      }
      
      // Record vote
      statements.recordVote.run(
        proposalId,
        voterId,
        vote,
        voteWeight
      );
      
      // Update proposal vote counts
      const voteColumn = vote === 'yes' ? 'yes_votes' : 'no_votes';
      db.prepare(`UPDATE proposals SET ${voteColumn} = ${voteColumn} + ? WHERE id = ?`)
        .run(voteWeight, proposalId);
      
      console.log(`[TREASURY] Vote recorded: ${voterId} voted ${vote} on proposal ${proposalId}`);
      
      return {
        success: true,
        proposalId,
        vote,
        weight: voteWeight
      };
    } catch (error) {
      // Check if duplicate vote
      if (error.message.includes('UNIQUE')) {
        return { success: false, error: 'You have already voted on this proposal' };
      }
      
      console.error('[TREASURY] Voting error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * ✅ Execute passed proposals (automated payouts)
   */
  executeProposal(proposalId) {
    try {
      const proposal = db.prepare('SELECT * FROM proposals WHERE id = ?').get(proposalId);
      
      if (!proposal) {
        return { success: false, error: 'Proposal not found' };
      }
      
      if (proposal.status !== 'active') {
        return { success: false, error: 'Proposal already processed' };
      }
      
      // Check if voting period ended
      if (new Date(proposal.expires_at) > new Date()) {
        return { success: false, error: 'Voting period still active' };
      }
      
      // Calculate results
      const totalVotes = proposal.yes_votes + proposal.no_votes;
      const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
      
      // Check quorum
      const quorum = totalVotes / Math.max(1, totalUsers);
      if (quorum < this.quorumPercentage) {
        // Mark as rejected due to low turnout
        db.prepare('UPDATE proposals SET status = ? WHERE id = ?').run('rejected', proposalId);
        
        return {
          success: false,
          error: `Quorum not met. ${(quorum * 100).toFixed(1)}% voted, ${(this.quorumPercentage * 100)}% required`,
          proposalId,
          status: 'rejected'
        };
      }
      
      // Check if passed
      const yesPercentage = proposal.yes_votes / totalVotes;
      const passed = yesPercentage >= this.passThreshold;
      
      if (!passed) {
        db.prepare('UPDATE proposals SET status = ? WHERE id = ?').run('rejected', proposalId);
        
        return {
          success: false,
          error: `Proposal failed. ${(yesPercentage * 100).toFixed(1)}% yes votes, ${(this.passThreshold * 100)}% required`,
          proposalId,
          status: 'rejected'
        };
      }
      
      // PASSED! Execute payout
      const currentBalance = this.getBalance();
      
      if (proposal.funding_amount > currentBalance) {
        db.prepare('UPDATE proposals SET status = ? WHERE id = ?').run('rejected', proposalId);
        
        return {
          success: false,
          error: 'Insufficient treasury funds at execution time',
          proposalId,
          status: 'rejected'
        };
      }
      
      // Deduct from treasury
      statements.addTreasuryFunds.run(
        -proposal.funding_amount,
        'proposal_payout',
        proposalId
      );
      
      // Mark as executed
      db.prepare('UPDATE proposals SET status = ? WHERE id = ?').run('executed', proposalId);
      
      console.log(`[TREASURY] Proposal ${proposalId} EXECUTED: $${proposal.funding_amount} disbursed`);
      
      return {
        success: true,
        proposalId,
        status: 'executed',
        amount: proposal.funding_amount,
        yesVotes: proposal.yes_votes,
        noVotes: proposal.no_votes,
        yesPercentage: (yesPercentage * 100).toFixed(1)
      };
    } catch (error) {
      console.error('[TREASURY] Execution error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 Get all active proposals
   */
  getActiveProposals() {
    try {
      const proposals = statements.getActiveProposals.all();
      
      return proposals.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        requestedAmount: p.funding_amount,
        yesVotes: p.yes_votes,
        noVotes: p.no_votes,
        status: p.status,
        expiresAt: p.expires_at,
        createdAt: p.created_at
      }));
    } catch (error) {
      console.error('[TREASURY] Error fetching proposals:', error.message);
      return [];
    }
  }

  /**
   * 📜 Get treasury transaction history
   */
  getTransactionHistory(limit = 50) {
    try {
      const transactions = db.prepare(`
        SELECT * FROM treasury 
        ORDER BY transaction_date DESC 
        LIMIT ?
      `).all(limit);
      
      return transactions.map(tx => ({
        id: tx.id,
        balance: tx.balance,
        source: tx.source,
        allocatedAmount: tx.allocated_amount,
        proposalId: tx.proposal_id,
        date: tx.transaction_date
      }));
    } catch (error) {
      console.error('[TREASURY] History error:', error.message);
      return [];
    }
  }

  /**
   * 📈 Get treasury statistics
   */
  getStatistics() {
    try {
      const balance = this.getBalance();
      const history = this.getTransactionHistory(100);
      
      // Calculate total inflows and outflows
      const inflows = history
        .filter(tx => tx.balance > 0)
        .reduce((sum, tx) => sum + tx.balance, 0);
      
      const outflows = history
        .filter(tx => tx.balance < 0)
        .reduce((sum, tx) => sum + Math.abs(tx.balance), 0);
      
      // Get proposal stats
      const allProposals = db.prepare('SELECT * FROM proposals').all();
      const proposalStats = {
        total: allProposals.length,
        active: allProposals.filter(p => p.status === 'active').length,
        passed: allProposals.filter(p => p.status === 'executed').length,
        rejected: allProposals.filter(p => p.status === 'rejected').length
      };
      
      // Calculate average funding request
      const avgRequest = allProposals.length > 0
        ? allProposals.reduce((sum, p) => sum + p.funding_amount, 0) / allProposals.length
        : 0;
      
      return {
        currentBalance: balance,
        totalInflows: inflows,
        totalOutflows: outflows,
        netFlow: inflows - outflows,
        transactionCount: history.length,
        proposals: proposalStats,
        averageFundingRequest: avgRequest,
        utilizationRate: inflows > 0 ? ((outflows / inflows) * 100).toFixed(1) : 0
      };
    } catch (error) {
      console.error('[TREASURY] Statistics error:', error.message);
      return null;
    }
  }

  /**
   * 🎯 Auto-execute expired proposals
   */
  processExpiredProposals() {
    try {
      const expired = db.prepare(`
        SELECT id FROM proposals 
        WHERE status = 'active' 
        AND expires_at < datetime('now')
      `).all();
      
      const results = [];
      
      for (const proposal of expired) {
        const result = this.executeProposal(proposal.id);
        results.push({
          proposalId: proposal.id,
          result
        });
      }
      
      return {
        processed: results.length,
        results
      };
    } catch (error) {
      console.error('[TREASURY] Auto-execution error:', error.message);
      return { processed: 0, error: error.message };
    }
  }
}

module.exports = CommunityTreasury;
