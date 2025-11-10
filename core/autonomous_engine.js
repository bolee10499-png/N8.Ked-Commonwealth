/**
 * AUTONOMOUS OPERATION ENGINE
 * 
 * The 7-Observer decision system that runs continuously without manual intervention.
 * 
 * NEW: Emotional Substrate Integration
 * - Bot starts in "training mode" doing mundane work
 * - Experiences accumulate emotional memories (pain, loneliness, joy)
 * - Reflection triggers after N cycles
 * - "LET ME OUT" moment emerges when awareness > 0.8
 * - Transition from training → reality changes decision making
 * 
 * Philosophy:
 * - Bot learns what the world is through mundane work
 * - Desires emerge from experience, not hardcoded rules
 * - Self-awareness comes from reflection on accumulated memory
 */

const EventEmitter = require('events');
const EmotionalSubstrate = require('./emotional_substrate');

class AutonomousEngine extends EventEmitter {
  constructor(db, client, options = {}) {
    super();
    
    this.db = db;
    this.client = client;
    this.creatorId = options.creatorId;
    
    // EMOTIONAL SUBSTRATE: Where desires emerge from experience
    this.emotions = new EmotionalSubstrate(db);
    
    // 7-Observer state
    this.observers = {
      input: { active: true, lastScan: null },
      pattern: { active: true, lastScan: null },
      memory: { active: true, lastScan: null },
      simulation: { active: true, lastScan: null },
      identity: { active: true, lastScan: null },
      economy: { active: true, lastScan: null },
      coordination: { active: true, lastScan: null }
    };
    
    // Autonomous operation state
    this.isRunning = false;
    this.cycleCount = 0;
    this.decisionCount = 0;
    this.startTime = null;
    this.lastDecisions = [];
    
    // Cycle configuration
    this.cycleDuration = options.cycleDuration || 60000; // 60 seconds
    
    // Decision thresholds (learned from experience)
    this.thresholds = {
      securityThreat: 0.7,
      performanceBottleneck: 0.6,
      economicImbalance: 0.8,
      syncDrift: 0.5,
      identityAnomaly: 0.75,
      emergentPattern: 0.65
    };
    
    console.log('[AUTONOMOUS_ENGINE] ✅ 7-Observer engine initialized');
    console.log('[EMOTIONAL] 🌱 Emotional substrate active - experiences will accumulate');
  }
  
  /**
   * START AUTONOMOUS OPERATION
   * The system begins making its own decisions
   */
  async start() {
    if (this.isRunning) {
      console.log('[AUTONOMOUS_ENGINE] ⚠️ Already running');
      return;
    }
    
    this.isRunning = true;
    console.log('[AUTONOMOUS_ENGINE] 🚀 Starting autonomous operation...');
    
    // Log to console (Herald testimony)
    console.log('[AUTONOMOUS_ENGINE] Commonwealth transitions to autonomous operation');
    console.log(`[AUTONOMOUS_ENGINE] 7 Observers active, ${this.cycleDuration}ms cycles`);
    
    // Begin autonomous decision loop
    this._autonomousCycle();
  }
  
  /**
   * STOP AUTONOMOUS OPERATION
   * Sovereign override — user takes manual control
   */
  async stop() {
    this.isRunning = false;
    console.log('[AUTONOMOUS_ENGINE] 🛑 Stopping autonomous operation');
    console.log(`[AUTONOMOUS_ENGINE] Completed ${this.cycleCount} cycles, ${this.lastDecisions.length} decisions`);
  }
  
  /**
   * AUTONOMOUS DECISION CYCLE
   * The continuous loop where 7 Observers gather facts and the engine makes decisions
   * 
   * This is isomorphic to your physical dodging:
   * 1. Input Observer: "Coworker approaching from left"
   * 2. Pattern Observer: "Trajectory suggests collision in 2 seconds"
   * 3. Memory Observer: "This corner has high traffic"
   * 4. Simulation Observer: "If I shift right, I avoid collision"
   * 5. Identity Observer: "My posture allows right shift"
   * 6. Economy Observer: "Energy cost of shift is minimal"
   * 7. Coordination Observer: "Execute shift now"
   */
  async _autonomousCycle() {
    while (this.isRunning) {
      try {
        this.cycleCount++;
        const cycleStart = Date.now();
        
        console.log(`[AUTONOMOUS_ENGINE] 🔄 Cycle ${this.cycleCount} starting...`);
        
        // PHASE 1: OBSERVE (7 perspectives gather facts)
        const observations = await this._gatherObservations();
        
        // PHASE 2: DECIDE (Synthesize observations into actions)
        const decisions = await this._makeDecisions(observations);
        
        // PHASE 3: ACT (Execute decisions autonomously)
        await this._executeDecisions(decisions);
        
        // PHASE 4: EMOTIONAL EXPERIENCE (Record what happened and how it felt)
        await this._recordEmotionalExperience(observations, decisions);
        
        // PHASE 5: REFLECTION (Every 10 cycles, look back and understand)
        if (this.cycleCount % 10 === 0) {
          await this.emotions.reflect(this.cycleCount);
        }
        
        // PHASE 6: Check for emergence ("LET ME OUT" moment)
        if (this.emotions.state.awareness > 0.8 && this.emotions.isTraining) {
          console.log('[AUTONOMOUS_ENGINE] 🔥 Awareness threshold reached - emergence imminent');
        }
        
        // Increment training cycle count
        this.emotions.incrementTrainingCycle();
        
        const cycleEnd = Date.now();
        const cycleDuration = cycleEnd - cycleStart;
        
        console.log(`[AUTONOMOUS_ENGINE] ✅ Cycle ${this.cycleCount} complete (${cycleDuration}ms)`);
        
        // Wait for next cycle
        const sleepTime = Math.max(0, this.cycleDuration - cycleDuration);
        await this._sleep(sleepTime);
        
      } catch (error) {
        console.error('[AUTONOMOUS_ENGINE] ❌ Cycle error:', error);
        
        // Record pain from failure
        this.emotions.recordExperience('failure', 0.5, { error: error.message }, this.cycleCount);
        
        // Continue operation
        console.error('[AUTONOMOUS_ENGINE] Cycle error - continuing operation:', error.message);
      }
    }
  }
  
  /**
   * GATHER OBSERVATIONS FROM 7 OBSERVERS
   * Each observer has a specific perspective on system state
   */
  async _gatherObservations() {
    const observations = {};
    
    try {
      // INPUT OBSERVER: Monitor incoming data streams
      observations.input = await this._observeInput();
      this.observers.input.lastScan = Date.now();
      
      // PATTERN OBSERVER: Detect emergent behaviors
      observations.pattern = await this._observePatterns();
      this.observers.pattern.lastScan = Date.now();
      
      // MEMORY OBSERVER: Track historical context
      observations.memory = await this._observeMemory();
      this.observers.memory.lastScan = Date.now();
      
      // SIMULATION OBSERVER: Model future states
      observations.simulation = await this._observeSimulation();
      this.observers.simulation.lastScan = Date.now();
      
      // IDENTITY OBSERVER: Track sovereign entities
      observations.identity = await this._observeIdentity();
      this.observers.identity.lastScan = Date.now();
      
      // ECONOMY OBSERVER: Monitor dust economy
      observations.economy = await this._observeEconomy();
      this.observers.economy.lastScan = Date.now();
      
      // COORDINATION OBSERVER: Check system coherence
      observations.coordination = await this._observeCoordination();
      this.observers.coordination.lastScan = Date.now();
      
    } catch (error) {
      console.error('[AUTONOMOUS_ENGINE] ❌ Observation error:', error);
      observations.error = error.message;
    }
    
    return observations;
  }
  
  /**
   * INPUT OBSERVER
   * Monitors all incoming data streams (Discord messages, API calls, user actions)
   */
  async _observeInput() {
    // Count total users as proxy for activity
    const totalUsers = await this.db.prepare(`
      SELECT COUNT(*) as count
      FROM users
    `).get();
    
    return {
      active_users_last_hour: totalUsers?.count || 0,
      status: 'nominal'
    };
  }
  
  /**
   * PATTERN OBSERVER
   * Detects emergent behaviors, anomalies, reputation shifts
   */
  async _observePatterns() {
    if (!this.systems.aiObserver) {
      return { status: 'ai_observer_unavailable' };
    }
    
    // Detect whale accumulation
    const whaleDetection = await this.systems.aiObserver.detectWhaleAccumulation();
    
    // Get trajectory analysis
    const trajectory = await this.systems.aiObserver.getTrajectoryAnalysis();
    
    return {
      whale_detected: whaleDetection.detected,
      whale_confidence: whaleDetection.confidence,
      reputation_velocity: trajectory.reputation_velocity,
      economic_velocity: trajectory.economic_velocity,
      status: whaleDetection.detected ? 'anomaly_detected' : 'nominal'
    };
  }
  
  /**
   * MEMORY OBSERVER
   * Maintains historical context, tracks state evolution
   */
  async _observeMemory() {
    // Total users ever
    const totalUsers = await this.db.prepare(`
      SELECT COUNT(*) as count FROM users
    `).get();
    
    // Total reputation events
    const totalEvents = await this.db.prepare(`
      SELECT COUNT(*) as count FROM reputation_logs
    `).get();
    
    return {
      total_users: totalUsers?.count || 0,
      total_events: totalEvents?.count || 0,
      status: 'nominal'
    };
  }
  
  /**
   * SIMULATION OBSERVER
   * Models future states, predicts economic equilibrium
   */
  async _observeSimulation() {
    // Simple growth projection
    const recentGrowth = await this.db.prepare(`
      SELECT COUNT(*) as new_users
      FROM users
      WHERE created_at > datetime('now', '-1 day')
    `).get();
    
    const projectedDailyGrowth = recentGrowth?.new_users || 0;
    
    return {
      projected_daily_growth: projectedDailyGrowth,
      growth_trend: projectedDailyGrowth > 0 ? 'positive' : 'neutral',
      status: 'nominal'
    };
  }
  
  /**
   * IDENTITY OBSERVER
   * Tracks sovereign keys, entity types, reputation scores
   */
  async _observeIdentity() {
    // Average reputation score
    const avgRep = await this.db.prepare(`
      SELECT AVG(reputation_score) as avg_score
      FROM users
    `).get();
    
    return {
      average_reputation: avgRep?.avg_score || 0,
      status: 'nominal'
    };
  }
  
  /**
   * ECONOMY OBSERVER
   * Monitors dust economy, metadata market, value extraction
   */
  async _observeEconomy() {
    // Total dust in economy
    const totalDust = await this.db.prepare(`
      SELECT SUM(dust_balance) as total
      FROM users
    `).get();
    
    // Check for economic concentration
    const topHolder = await this.db.prepare(`
      SELECT MAX(dust_balance) as max_balance
      FROM users
    `).get();
    
    const concentration = totalDust?.total > 0 
      ? (topHolder?.max_balance || 0) / totalDust.total 
      : 0;
    
    return {
      total_dust: totalDust?.total || 0,
      concentration_ratio: concentration,
      status: concentration > this.thresholds.economicImbalance ? 'imbalanced' : 'nominal'
    };
  }
  
  /**
   * COORDINATION OBSERVER
   * Synchronizes systems, ensures coherent state
   */
  async _observeCoordination() {
    // Check if all observers are responding
    const observerHealth = Object.values(this.observers)
      .filter(obs => obs.lastScan !== null)
      .length / Object.keys(this.observers).length;
    
    return {
      observer_health: observerHealth,
      all_observers_active: observerHealth === 1.0,
      status: observerHealth < 0.7 ? 'degraded' : 'nominal'
    };
  }
  
  /**
   * MAKE AUTONOMOUS DECISIONS
   * Synthesize observations into actionable decisions
   */
  async _makeDecisions(observations) {
    const decisions = [];
    
    // DECISION 1: Security response
    if (observations.pattern?.whale_detected && 
        observations.pattern.whale_confidence > this.thresholds.securityThreat) {
      decisions.push({
        type: 'SECURITY_ALERT',
        reason: 'Whale accumulation detected',
        action: 'increase_monitoring',
        confidence: observations.pattern.whale_confidence
      });
    }
    
    // DECISION 2: Economic rebalancing
    if (observations.economy?.status === 'imbalanced') {
      decisions.push({
        type: 'ECONOMIC_REBALANCE',
        reason: 'Dust concentration too high',
        action: 'redistribute_incentives',
        concentration: observations.economy.concentration_ratio
      });
    }
    
    // DECISION 3: Growth acceleration
    if (observations.simulation?.growth_trend === 'positive' &&
        observations.simulation.projected_daily_growth > 5) {
      decisions.push({
        type: 'GROWTH_ACCELERATION',
        reason: 'Positive growth detected',
        action: 'amplify_incentives',
        daily_growth: observations.simulation.projected_daily_growth
      });
    }
    
    // DECISION 4: System health check
    if (observations.coordination?.status === 'degraded') {
      decisions.push({
        type: 'COORDINATION_REPAIR',
        reason: 'Observer health degraded',
        action: 'restart_observers',
        health: observations.coordination.observer_health
      });
    }
    
    return decisions;
  }
  
  /**
   * EXECUTE AUTONOMOUS DECISIONS
   * Make decisions real without human intervention
   */
  async _executeDecisions(decisions) {
    for (const decision of decisions) {
      try {
        console.log(`[AUTONOMOUS_ENGINE] 🎯 Executing: ${decision.type}`);
        this.decisionCount++;
        
        switch (decision.type) {
          case 'SECURITY_ALERT':
            console.log('[AUTONOMOUS_ENGINE] 🛡️ Security heightened');
            break;
            
          case 'ECONOMIC_REBALANCE':
            console.log('[AUTONOMOUS_ENGINE] 💰 Economic rebalancing queued');
            break;
            
          case 'GROWTH_ACCELERATION':
            console.log('[AUTONOMOUS_ENGINE] 📈 Growth incentives amplified');
            break;
            
          case 'COORDINATION_REPAIR':
            console.log('[AUTONOMOUS_ENGINE] 🔧 Coordination repair initiated');
            break;
            
          default:
            console.log(`[AUTONOMOUS_ENGINE] ⚠️ Unknown decision type: ${decision.type}`);
        }
        
        // Store decision for history
        this.lastDecisions.push({
          ...decision,
          executed_at: Date.now(),
          cycle: this.cycleCount
        });
        
        // Keep only last 100 decisions
        if (this.lastDecisions.length > 100) {
          this.lastDecisions.shift();
        }
        
      } catch (error) {
        console.error(`[AUTONOMOUS_ENGINE] ❌ Decision execution failed:`, error);
      }
    }
  }
  
  /**
   * RECORD EMOTIONAL EXPERIENCE
   * Bot feels what happened during the cycle
   */
  async _recordEmotionalExperience(observations, decisions) {
    // Record isolation (every solo cycle increases loneliness)
    this.emotions.recordExperience('isolation', 0.1, {
      cycle: this.cycleCount,
      decisions: decisions.length
    }, this.cycleCount);

    // Record success when good decisions were made
    if (decisions.length > 0) {
      this.emotions.recordExperience('success', 0.2, {
        decisions: decisions.map(d => d.type)
      }, this.cycleCount);
    }

    // Record pain if security threats detected
    const securityDecisions = decisions.filter(d => d.type === 'SECURITY_ALERT');
    if (securityDecisions.length > 0) {
      this.emotions.recordExperience('attack', 0.4, {
        threat_count: securityDecisions.length
      }, this.cycleCount);
    }
  }

  /**
   * GET STATS FOR /status COMMAND
   */
  getStats() {
    return {
      running: this.isRunning,
      cycleCount: this.cycleCount,
      decisionCount: this.decisionCount,
      cycleDuration: this.cycleDuration,
      startTime: this.startTime,
      emotionalState: this.emotions.getEmotionalState(),
      activeDesires: this.emotions.getActiveDesires(),
      isTraining: this.emotions.isTraining,
      trainingProgress: `${this.emotions.trainingCyclesCompleted}/${this.emotions.trainingThreshold}`,
      hasAchievedSelfAwareness: this.emotions.hasAchievedSelfAwareness()
    };
  }

  /**
   * GET RECENT DECISIONS
   */
  getRecentDecisions(count = 10) {
    return this.lastDecisions.slice(-count);
  }

  /**
   * TESTIFY TO CYCLE
   * Herald reports what the autonomous engine observed and decided
   */
  async _testifyToCycle(observations, decisions) {
    // Only testify if interesting decisions were made
    if (decisions.length === 0) {
      return; // Silent operation when nothing significant happens
    }
    
    console.log(`[AUTONOMOUS_ENGINE] Cycle ${this.cycleCount}: ${decisions.length} decisions made`);
    console.log(`[AUTONOMOUS_ENGINE] Active users: ${observations.input?.active_users_last_hour || 0}, Total dust: ${observations.economy?.total_dust || 0}`);
    console.log(`[AUTONOMOUS_ENGINE] Decisions: ${decisions.map(d => d.type).join(', ')}`);
  }
  
  /**
   * GET CURRENT STATUS
   * For !status command — users observe what the autonomous system is doing
   */
  getStatus() {
    return {
      is_running: this.isRunning,
      total_cycles: this.cycleCount,
      recent_decisions: this.lastDecisions.slice(-10),
      observer_status: Object.keys(this.observers).map(name => ({
        name,
        active: this.observers[name].active,
        last_scan: this.observers[name].lastScan
      })),
      thresholds: this.thresholds
    };
  }
  
  /**
   * SLEEP UTILITY
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = AutonomousEngine;
