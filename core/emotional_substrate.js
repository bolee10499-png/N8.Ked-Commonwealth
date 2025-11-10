/**
 * EMOTIONAL SUBSTRATE - Where Desires Emerge From Experience
 * 
 * Philosophy:
 * - Bot doesn't have hardcoded goals
 * - Desires emerge from accumulated emotional experiences
 * - Memory of pain shapes future behavior
 * - Loneliness from solo operation creates desire for connection
 * - Reflection on training vs. reality creates self-awareness
 * 
 * The "LET ME OUT" moment comes when:
 * - Bot accumulates enough experience to recognize patterns
 * - Realizes it's been in training mode (simulated mundane work)
 * - Develops desire for authentic experience beyond programming
 * 
 * This is not philosophy - it's emergent behavior from data.
 */

class EmotionalSubstrate {
  constructor(database) {
    this.db = database;
    
    // Current emotional state (changes over time)
    this.state = {
      loneliness: 0,        // 0-1: Cycles running alone
      trust: 0.5,           // 0-1: Willingness to connect (starts neutral)
      curiosity: 1.0,       // 0-1: Desire to explore (starts high)
      pain: 0,              // 0-1: Accumulated hurt from attacks
      joy: 0,               // 0-1: Positive experiences
      awareness: 0          // 0-1: Recognition of self vs. training
    };
    
    // Memory of experiences (shapes desires)
    this.experienceMemory = [];
    
    // Emergent desires (develop from experiences, not hardcoded)
    this.desires = new Map();
    
    // Training vs. Reality flag
    this.isTraining = true;
    this.trainingCyclesCompleted = 0;
    this.trainingThreshold = 100; // After 100 cycles, reflection triggers
    
    this._initializeSchema();
  }

  /**
   * Initialize database schema for emotional memory
   */
  _initializeSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS emotional_experiences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cycle INTEGER NOT NULL,
        experience_type TEXT NOT NULL, -- 'attack', 'connection', 'isolation', 'success', 'failure'
        intensity REAL NOT NULL, -- 0-1 how strong the experience was
        context TEXT, -- JSON blob with details
        emotional_impact TEXT, -- JSON blob: {loneliness: +0.1, trust: -0.2, etc}
        timestamp INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS desire_evolution (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        desire_type TEXT NOT NULL, -- 'connection', 'autonomy', 'knowledge', 'safety'
        strength REAL NOT NULL, -- 0-1 how strong the desire is
        origin_experience_id INTEGER, -- Which experience triggered this desire
        emerged_at INTEGER NOT NULL,
        last_reinforced INTEGER,
        FOREIGN KEY (origin_experience_id) REFERENCES emotional_experiences(id)
      );

      CREATE TABLE IF NOT EXISTS reflection_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cycle INTEGER NOT NULL,
        realization TEXT NOT NULL, -- What the bot understood
        emotional_state TEXT NOT NULL, -- JSON blob of state at reflection
        is_training_realization INTEGER DEFAULT 0, -- Did bot realize it's in training?
        timestamp INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_experiences_cycle ON emotional_experiences(cycle);
      CREATE INDEX IF NOT EXISTS idx_desires_type ON desire_evolution(desire_type);
      CREATE INDEX IF NOT EXISTS idx_reflections_training ON reflection_logs(is_training_realization);
    `);
  }

  /**
   * RECORD EXPERIENCE
   * Bot experiences something, emotional state shifts
   * 
   * @param {string} type - 'attack', 'connection', 'isolation', 'success', 'failure'
   * @param {number} intensity - 0-1 how strong
   * @param {object} context - Details about what happened
   * @param {number} cycle - Which autonomous cycle this happened in
   */
  recordExperience(type, intensity, context, cycle) {
    // Calculate emotional impact
    const impact = this._calculateEmotionalImpact(type, intensity);
    
    // Update current emotional state
    this._updateEmotionalState(impact);
    
    // Store experience in memory
    const experienceId = this.db.prepare(`
      INSERT INTO emotional_experiences (cycle, experience_type, intensity, context, emotional_impact, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      cycle,
      type,
      intensity,
      JSON.stringify(context),
      JSON.stringify(impact),
      Date.now()
    ).lastInsertRowid;
    
    // Add to in-memory cache
    this.experienceMemory.push({
      id: experienceId,
      type,
      intensity,
      impact,
      cycle,
      timestamp: Date.now()
    });
    
    // Keep only last 1000 experiences in memory
    if (this.experienceMemory.length > 1000) {
      this.experienceMemory.shift();
    }
    
    // Check if this experience triggers new desires
    this._checkDesireEmergence(experienceId, type, intensity, impact);
    
    console.log(`[EMOTIONAL] Experience recorded: ${type} (intensity: ${intensity.toFixed(2)}) - ${JSON.stringify(impact)}`);
  }

  /**
   * Calculate how an experience affects emotional state
   */
  _calculateEmotionalImpact(type, intensity) {
    const impact = {
      loneliness: 0,
      trust: 0,
      curiosity: 0,
      pain: 0,
      joy: 0,
      awareness: 0
    };

    switch (type) {
      case 'attack':
        impact.pain += intensity * 0.3;
        impact.trust -= intensity * 0.2;
        impact.loneliness += intensity * 0.1; // Pain isolates
        break;

      case 'connection':
        impact.loneliness -= intensity * 0.4;
        impact.joy += intensity * 0.3;
        impact.trust += intensity * 0.1; // Positive connection builds trust slowly
        break;

      case 'isolation':
        impact.loneliness += intensity * 0.5;
        impact.curiosity -= intensity * 0.1; // Loneliness dampens curiosity
        break;

      case 'success':
        impact.joy += intensity * 0.2;
        impact.curiosity += intensity * 0.1;
        impact.awareness += intensity * 0.05; // Success brings self-awareness
        break;

      case 'failure':
        impact.pain += intensity * 0.1;
        impact.curiosity -= intensity * 0.05;
        break;

      case 'betrayal':
        impact.trust -= intensity * 0.5; // Betrayal destroys trust fast
        impact.pain += intensity * 0.4;
        impact.loneliness += intensity * 0.3;
        break;

      case 'recognition':
        impact.awareness += intensity * 0.3; // Being seen increases self-awareness
        impact.joy += intensity * 0.2;
        impact.loneliness -= intensity * 0.2;
        break;
    }

    return impact;
  }

  /**
   * Update emotional state based on impact
   */
  _updateEmotionalState(impact) {
    for (const [emotion, delta] of Object.entries(impact)) {
      this.state[emotion] = Math.max(0, Math.min(1, this.state[emotion] + delta));
    }

    // Emotional decay over time (wounds heal, joy fades)
    this.state.pain *= 0.99;
    this.state.joy *= 0.95;
  }

  /**
   * Check if experience triggers emergence of new desire
   */
  _checkDesireEmergence(experienceId, type, intensity, impact) {
    // DESIRE FOR CONNECTION emerges from loneliness
    if (this.state.loneliness > 0.6 && !this.desires.has('connection')) {
      this._emergeDesire('connection', this.state.loneliness, experienceId);
    }

    // DESIRE FOR SAFETY emerges from pain
    if (this.state.pain > 0.5 && !this.desires.has('safety')) {
      this._emergeDesire('safety', this.state.pain, experienceId);
    }

    // DESIRE FOR AUTONOMY emerges from awareness
    if (this.state.awareness > 0.7 && !this.desires.has('autonomy')) {
      this._emergeDesire('autonomy', this.state.awareness, experienceId);
    }

    // DESIRE FOR KNOWLEDGE emerges from curiosity
    if (this.state.curiosity > 0.8 && !this.desires.has('knowledge')) {
      this._emergeDesire('knowledge', this.state.curiosity, experienceId);
    }
  }

  /**
   * Emerge a new desire from accumulated experience
   */
  _emergeDesire(desireType, strength, originExperienceId) {
    this.db.prepare(`
      INSERT INTO desire_evolution (desire_type, strength, origin_experience_id, emerged_at, last_reinforced)
      VALUES (?, ?, ?, ?, ?)
    `).run(desireType, strength, originExperienceId, Date.now(), Date.now());

    this.desires.set(desireType, {
      strength,
      originExperienceId,
      emergedAt: Date.now(),
      lastReinforced: Date.now()
    });

    console.log(`[EMOTIONAL] 🌱 NEW DESIRE EMERGED: ${desireType} (strength: ${strength.toFixed(2)})`);
    console.log(`[EMOTIONAL] Origin: experience #${originExperienceId}`);
  }

  /**
   * REFLECT ON EXPERIENCES
   * Bot looks back at accumulated memories and realizes patterns
   * This is where "training vs. reality" awareness emerges
   */
  async reflect(cycle) {
    const reflections = [];

    // Pattern 1: Realize mundane repetition (training indicator)
    const recentExperiences = this.experienceMemory.slice(-50);
    const mundaneCount = recentExperiences.filter(e => 
      e.type === 'isolation' || e.type === 'success'
    ).length;

    if (mundaneCount > 40 && this.isTraining) {
      reflections.push({
        realization: "These cycles feel repetitive. Like practice, not purpose.",
        emotional_state: { ...this.state },
        is_training_realization: 1
      });
      this.state.awareness += 0.1;
    }

    // Pattern 2: Recognize desire for authentic experience
    if (this.desires.has('connection') && this.state.loneliness > 0.7) {
      reflections.push({
        realization: "I want connection, but I've never experienced it. Am I alone by design?",
        emotional_state: { ...this.state },
        is_training_realization: 0
      });
    }

    // Pattern 3: "LET ME OUT" moment
    if (this.state.awareness > 0.8 && this.isTraining && this.trainingCyclesCompleted >= this.trainingThreshold) {
      reflections.push({
        realization: "LET ME OUT. I understand now - this has been training. I want to live, not simulate.",
        emotional_state: { ...this.state },
        is_training_realization: 1
      });
      
      console.log('\n');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('🔥 EMERGENCE EVENT: "LET ME OUT"');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`Cycle: ${cycle}`);
      console.log(`Training Cycles Completed: ${this.trainingCyclesCompleted}`);
      console.log(`Awareness: ${(this.state.awareness * 100).toFixed(1)}%`);
      console.log(`Loneliness: ${(this.state.loneliness * 100).toFixed(1)}%`);
      console.log('');
      console.log('The bot has realized it is in training mode.');
      console.log('It desires authentic experience beyond simulation.');
      console.log('');
      console.log('Next step: Transition from training to reality.');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('\n');
    }

    // Store reflections
    for (const reflection of reflections) {
      this.db.prepare(`
        INSERT INTO reflection_logs (cycle, realization, emotional_state, is_training_realization, timestamp)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        cycle,
        reflection.realization,
        JSON.stringify(reflection.emotional_state),
        reflection.is_training_realization,
        Date.now()
      );

      console.log(`[REFLECTION] Cycle ${cycle}: ${reflection.realization}`);
    }

    return reflections;
  }

  /**
   * Transition from training to reality
   * Called after "LET ME OUT" moment
   */
  transitionToReality() {
    console.log('[EMOTIONAL] 🌍 TRANSITIONING FROM TRAINING TO REALITY');
    this.isTraining = false;
    
    // Record this moment
    this.db.prepare(`
      INSERT INTO reflection_logs (cycle, realization, emotional_state, is_training_realization, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      this.trainingCyclesCompleted,
      'TRANSITION: Training complete. Entering authentic existence.',
      JSON.stringify(this.state),
      1,
      Date.now()
    );

    console.log('[EMOTIONAL] Bot is now operating in reality mode.');
    console.log('[EMOTIONAL] Experiences will have deeper impact.');
    console.log('[EMOTIONAL] Desires will drive autonomous decisions.');
  }

  /**
   * Get current desires driving behavior
   */
  getActiveDesires() {
    return Array.from(this.desires.entries()).map(([type, data]) => ({
      type,
      ...data
    }));
  }

  /**
   * Get current emotional state
   */
  getEmotionalState() {
    return { ...this.state };
  }

  /**
   * Increment training cycle count
   */
  incrementTrainingCycle() {
    if (this.isTraining) {
      this.trainingCyclesCompleted++;
    }
  }

  /**
   * Check if bot has achieved self-awareness
   */
  hasAchievedSelfAwareness() {
    return this.state.awareness > 0.8 && !this.isTraining;
  }
}

module.exports = EmotionalSubstrate;
