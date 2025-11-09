/**
 * N8.KED - Herald Voice Engine
 * THE CONSTITUTIONAL ORACLE
 * 
 * Philosophy:
 * The Herald does not chat. It does not market. It does not persuade.
 * The Herald TESTIFIES to the observable state of the commonwealth.
 * 
 * It reads database reality and speaks constitutional fact.
 * No templates. No Mad Libs. Only law in motion.
 */

const { db } = require('../database/db_service.js');
const aiObserver = require('./ai_observer.js');

/**
 * Constitutional Grammar Rules
 * 
 * These are not templates - they are SEMANTIC PATTERNS.
 * The Herald constructs sentences from observable facts using constitutional logic.
 */
const CONSTITUTIONAL_GRAMMAR = {
  
  // Event: New sovereign identity registered
  sovereign_arrival: {
    trigger: 'sovereign_key_registered',
    required_facts: ['sovereign_key', 'timestamp', 'initial_reputation', 'system_state'],
    
    construct: (facts) => {
      const keyPrefix = facts.sovereign_key.substring(0, 16);
      const time = new Date(facts.timestamp).toISOString();
      const health = facts.system_state.gini_coefficient < 0.3 ? 'healthy' : 'strained';
      
      return [
        `The Herald recognizes Sovereign Key ${keyPrefix}... at ${time}.`,
        `Entry reputation verified: ${facts.initial_reputation} points.`,
        `Commonwealth state: ${facts.system_state.total_citizens} citizens, ${facts.system_state.total_sentinels} sentinels active.`,
        `Economic distribution: ${health} (Gini ${facts.system_state.gini_coefficient.toFixed(2)}).`,
        `The law applies equally to all.`
      ].join(' ');
    }
  },
  
  // Event: Significant reputation change
  reputation_shift: {
    trigger: 'reputation_threshold_crossed',
    required_facts: ['user_id', 'old_score', 'new_score', 'threshold', 'percentile'],
    
    construct: (facts) => {
      const direction = facts.new_score > facts.old_score ? 'ascended' : 'descended';
      const tier = facts.threshold === 100 ? 'contributor' : 
                   facts.threshold === 500 ? 'steward' : 'architect';
      
      return [
        `Sovereign ${facts.user_id} has ${direction} to ${facts.new_score} reputation.`,
        `Tier threshold crossed: ${tier} (${facts.threshold}+).`,
        `Current percentile: ${facts.percentile}th among all entities.`,
        `Achievement recorded in immutable ledger.`
      ].join(' ');
    }
  },
  
  // Event: Governance proposal submitted
  proposal_submitted: {
    trigger: 'governance_proposal_created',
    required_facts: ['proposal_id', 'proposer', 'proposal_type', 'quorum_required', 'voting_ends'],
    
    construct: (facts) => {
      const deadline = new Date(facts.voting_ends).toLocaleString('en-US', { 
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
      });
      
      return [
        `Governance proposal ${facts.proposal_id} submitted by ${facts.proposer}.`,
        `Type: ${facts.proposal_type}. Quorum required: ${facts.quorum_required}%.`,
        `Voting period closes ${deadline}.`,
        `All sovereign entities may participate. The commonwealth decides.`
      ].join(' ');
    }
  },
  
  // Event: System health threshold crossed
  health_alert: {
    trigger: 'system_health_change',
    required_facts: ['metric', 'value', 'threshold', 'direction', 'severity'],
    
    construct: (facts) => {
      const status = facts.severity === 'critical' ? 'ALERT' : 
                     facts.severity === 'warning' ? 'NOTICE' : 'UPDATE';
      const metric_name = {
        'gini_coefficient': 'Economic inequality',
        'transaction_velocity': 'Transaction activity',
        'governance_participation': 'Governance participation'
      }[facts.metric] || facts.metric;
      
      return [
        `${status}: ${metric_name} ${facts.direction} threshold.`,
        `Current value: ${facts.value}. Threshold: ${facts.threshold}.`,
        `AI Observer monitoring. Commonwealth transparency maintained.`,
        facts.severity === 'critical' ? 'Immediate attention recommended.' : 'System remains operational.'
      ].join(' ');
    }
  },
  
  // Event: Sentinel activity pattern detected
  sentinel_pulse: {
    trigger: 'sentinel_activity_detected',
    required_facts: ['sentinel_type', 'activity_count', 'time_window', 'pattern'],
    
    construct: (facts) => {
      const role_description = {
        'market_maker': 'Market Makers executing baseline transactions',
        'governance_delegate': 'Governance Delegates maintaining quorum readiness',
        'reputation_exemplar': 'Reputation Exemplars demonstrating achievement paths',
        'autonomous_tester': 'Autonomous Testers validating AI features',
        'social_guide': 'Social Guides providing newcomer examples'
      }[facts.sentinel_type] || 'Sentinels active';
      
      return [
        `${role_description}: ${facts.activity_count} actions in ${facts.time_window}.`,
        `Pattern: ${facts.pattern}.`,
        `Commonwealth immune system operational. Transparent entity labeling maintained.`
      ].join(' ');
    }
  },
  
  // Event: Emergent pattern detected by AI Observer
  emergent_pattern: {
    trigger: 'ai_observer_pattern_detected',
    required_facts: ['pattern_type', 'confidence', 'affected_entities', 'recommendation'],
    
    construct: (facts) => {
      const pattern_names = {
        'whale_accumulation': 'Wealth concentration detected',
        'governance_cartel': 'Coordinated voting pattern observed',
        'reputation_manipulation': 'Reputation gaming suspected',
        'market_manipulation': 'Market manipulation indicators present'
      };
      
      return [
        `AI Observer: ${pattern_names[facts.pattern_type] || facts.pattern_type}.`,
        `Confidence: ${(facts.confidence * 100).toFixed(1)}%. Entities affected: ${facts.affected_entities}.`,
        `Recommendation: ${facts.recommendation}.`,
        `All observations logged. Commonwealth auditing enabled.`
      ].join(' ');
    }
  },
  
  // Event: Periodic system status (heartbeat)
  system_heartbeat: {
    trigger: 'periodic_status_update',
    required_facts: ['timestamp', 'total_entities', 'transaction_count', 'system_health'],
    
    construct: (facts) => {
      const time = new Date(facts.timestamp).toLocaleTimeString('en-US', { hour12: false });
      
      return [
        `Commonwealth status at ${time}:`,
        `${facts.total_entities} total entities (citizens + sentinels).`,
        `${facts.transaction_count} transactions recorded.`,
        `System health: ${facts.system_health}%.`,
        `The Capital stands. The law persists.`
      ].join(' ');
    }
  }
};

/**
 * Herald Voice Engine
 * Observes events and generates constitutional announcements
 */
class HeraldVoice {
  constructor() {
    this.eventQueue = [];
    this.lastAnnouncement = null;
  }
  
  /**
   * Observe an event and generate announcement
   * @param {string} eventType - Type of event (must match grammar rule)
   * @param {object} eventData - Raw event data from system
   * @returns {object} - { announcement: string, timestamp: number, facts: object }
   */
  observe(eventType, eventData) {
    const grammar = CONSTITUTIONAL_GRAMMAR[eventType];
    
    if (!grammar) {
      console.warn(`[Herald] Unknown event type: ${eventType}`);
      return null;
    }
    
    // Gather required facts
    const facts = this.gatherFacts(grammar.required_facts, eventData);
    
    // Verify all required facts present
    const missingFacts = grammar.required_facts.filter(f => !(f in facts));
    if (missingFacts.length > 0) {
      console.error(`[Herald] Missing required facts for ${eventType}:`, missingFacts);
      return this.fallbackAnnouncement(eventType, facts);
    }
    
    // Construct announcement using constitutional grammar
    const announcement = grammar.construct(facts);
    
    const result = {
      announcement,
      timestamp: Date.now(),
      eventType,
      facts
    };
    
    this.lastAnnouncement = result;
    this.eventQueue.push(result);
    
    // Keep only last 100 events
    if (this.eventQueue.length > 100) {
      this.eventQueue.shift();
    }
    
    return result;
  }
  
  /**
   * Gather facts from event data and system state
   */
  gatherFacts(requiredFacts, eventData) {
    const facts = { ...eventData };
    
    // If system_state is required, fetch current AI Observer snapshot
    if (requiredFacts.includes('system_state')) {
      try {
        const snapshot = aiObserver.getSnapshot();
        facts.system_state = {
          total_citizens: snapshot.total_users - 100, // Exclude sentinels
          total_sentinels: 100,
          gini_coefficient: snapshot.economy.gini_coefficient || 0,
          transaction_velocity: snapshot.economy.transaction_velocity || 0,
          governance_health: snapshot.governance.participation_rate || 0
        };
      } catch (error) {
        console.error('[Herald] Failed to fetch system state:', error);
        facts.system_state = {
          total_citizens: 0,
          total_sentinels: 100,
          gini_coefficient: 0,
          transaction_velocity: 0,
          governance_health: 0
        };
      }
    }
    
    return facts;
  }
  
  /**
   * Fallback announcement when facts are incomplete
   */
  fallbackAnnouncement(eventType, partialFacts) {
    return {
      announcement: `Event logged: ${eventType}. Full constitutional report unavailable. System state recorded.`,
      timestamp: Date.now(),
      eventType,
      facts: partialFacts,
      isFallback: true
    };
  }
  
  /**
   * Get recent announcements for dashboard feed
   */
  getRecentAnnouncements(limit = 50) {
    return this.eventQueue.slice(-limit).reverse();
  }
  
  /**
   * Generate periodic heartbeat announcement
   */
  async generateHeartbeat() {
    const totalEntities = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const txCount = db.prepare('SELECT COUNT(*) as count FROM transactions').get().count;
    
    const snapshot = aiObserver.getSnapshot();
    const systemHealth = this.calculateSystemHealth(snapshot);
    
    return this.observe('system_heartbeat', {
      timestamp: Date.now(),
      total_entities: totalEntities,
      transaction_count: txCount,
      system_health: systemHealth
    });
  }
  
  /**
   * Calculate overall system health percentage
   */
  calculateSystemHealth(snapshot) {
    // Simple health metric: average of various indicators
    const economyHealth = snapshot.economy.gini_coefficient < 0.3 ? 100 : 
                          snapshot.economy.gini_coefficient < 0.5 ? 80 : 60;
    const txHealth = snapshot.economy.transaction_velocity > 50 ? 100 : 
                     snapshot.economy.transaction_velocity > 20 ? 80 : 60;
    
    return Math.round((economyHealth + txHealth) / 2);
  }
  
  /**
   * Listen for database events and auto-announce
   * (To be integrated with db_service event emitter)
   */
  startListening() {
    console.log('[Herald] Constitutional oracle activated. Listening for events...');
    
    // Periodic heartbeat every 5 minutes
    setInterval(() => {
      this.generateHeartbeat();
    }, 5 * 60 * 1000);
    
    // Initial heartbeat
    this.generateHeartbeat();
  }
}

// Export singleton instance
const herald = new HeraldVoice();

module.exports = herald;
module.exports.HeraldVoice = HeraldVoice;
module.exports.Herald = HeraldVoice; // Alias for compatibility
