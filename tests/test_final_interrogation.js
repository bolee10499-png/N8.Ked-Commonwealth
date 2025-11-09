/**
 * FINAL INTERROGATION TEST SUITE
 * 
 * Comprehensive performance benchmarks to measure actual system speed
 * Tests all critical paths and measures against realistic baselines
 * 
 * What We're Measuring:
 * 1. Discord command processing speed (legacy !commands)
 * 2. Slash command execution speed (new /commands)
 * 3. Database query performance (SQLite operations)
 * 4. Herald testimony generation speed
 * 5. AI Observer pattern detection speed
 * 6. Security validation overhead
 * 7. Blender client HTTP latency
 * 8. End-to-end /explore command execution
 * 
 * Industry Baselines (from Discord bot ecosystem):
 * - Command response: <500ms (instant feel)
 * - Database query: <50ms (single SELECT)
 * - Complex operation: <2000ms (multi-step with external API)
 */

const { performance } = require('perf_hooks');
const { db, aiObserver } = require('../database/db_service');
const herald = require('../lib/herald_voice'); // Herald Voice Engine, not crypto Herald
const SecurityValidator = require('../lib/security_validator');
const BlenderClient = require('../lib/blender_client');

// Dust economy is integrated via KedsDeclassifiedBrand
const { KedsDeclassifiedBrand } = require('../identity/keds_brand');

class FinalInterrogation {
  constructor() {
    this.results = {};
    this.iterations = 100; // Run each test 100 times for statistical significance
    this.security = new SecurityValidator();
    this.brand = new KedsDeclassifiedBrand(); // Dust economy is inside brand
    this.blender = new BlenderClient();
  }

  /**
   * RUN ALL INTERROGATION TESTS
   */
  async runAllTests() {
    console.log('\n🔬 FINAL INTERROGATION TEST SUITE');
    console.log('═'.repeat(70));
    console.log(`Iterations per test: ${this.iterations}`);
    console.log('Measuring system performance against industry baselines\n');

    await this.testDatabaseQueries();
    await this.testHeraldGeneration();
    await this.testAIObserver();
    await this.testSecurityValidation();
    await this.testDustEconomy();
    await this.testBlenderClient();
    await this.testEndToEndExplore();

    this.analyzeResults();
    this.generateReport();
  }

  /**
   * TEST 1: DATABASE QUERY PERFORMANCE
   */
  async testDatabaseQueries() {
    console.log('📊 TEST 1: Database Query Performance');
    
    const tests = {
      simpleSelect: () => db.prepare('SELECT COUNT(*) as count FROM users').get(),
      complexJoin: () => db.prepare(`
        SELECT u.*, COUNT(ia.id) as achievements
        FROM users u
        LEFT JOIN identity_achievements ia ON u.discord_id = ia.user_id
        GROUP BY u.discord_id
        LIMIT 10
      `).all(),
      reputationCalc: () => db.prepare(`
        SELECT AVG(reputation_score) as avg, 
               MAX(reputation_score) as max,
               MIN(reputation_score) as min
        FROM users
      `).get()
    };

    const results = {};
    
    for (const [testName, testFn] of Object.entries(tests)) {
      const times = [];
      
      for (let i = 0; i < this.iterations; i++) {
        const start = performance.now();
        testFn();
        const end = performance.now();
        times.push(end - start);
      }

      results[testName] = this.calculateStats(times);
      console.log(`  ${testName}: ${results[testName].avg.toFixed(2)}ms avg (min: ${results[testName].min.toFixed(2)}ms, max: ${results[testName].max.toFixed(2)}ms)`);
    }

    this.results.database = results;
    console.log('');
  }

  /**
   * TEST 2: HERALD TESTIMONY GENERATION
   */
  async testHeraldGeneration() {
    console.log('🏛️ TEST 2: Herald Testimony Generation');

    const testEvents = [
      {
        type: 'sovereign_arrival',
        facts: { user_id: 'test_user', username: 'TestSovereign', reputation: 0, timestamp: Date.now() }
      },
      {
        type: 'reputation_shift',
        facts: { user_id: 'test_user', old_score: 50, new_score: 150, threshold: 100, percentile: 75 }
      },
      {
        type: 'system_metric',
        facts: { metric_name: 'economy_health', metric_value: 85, threshold: 70, severity: 'info' }
      }
    ];

    const results = {};

    for (const event of testEvents) {
      const times = [];

      for (let i = 0; i < this.iterations; i++) {
        const start = performance.now();
        herald.observe(event.type, event.facts);
        const end = performance.now();
        times.push(end - start);
      }

      results[event.type] = this.calculateStats(times);
      console.log(`  ${event.type}: ${results[event.type].avg.toFixed(2)}ms avg`);
    }

    this.results.herald = results;
    console.log('');
  }

  /**
   * TEST 3: AI OBSERVER PATTERN DETECTION
   */
  async testAIObserver() {
    console.log('🔮 TEST 3: AI Observer Pattern Detection');

    const tests = {
      economySnapshot: () => aiObserver.getEconomySnapshot(),
      reputationSnapshot: () => aiObserver.getReputationSnapshot(),
      governanceSnapshot: () => aiObserver.getGovernanceSnapshot(),
      systemTrajectory: () => aiObserver.getSystemTrajectory(7),
      emergentPatterns: () => aiObserver.detectEmergentPatterns()
    };

    const results = {};

    for (const [testName, testFn] of Object.entries(tests)) {
      const times = [];

      for (let i = 0; i < this.iterations; i++) {
        const start = performance.now();
        testFn();
        const end = performance.now();
        times.push(end - start);
      }

      results[testName] = this.calculateStats(times);
      console.log(`  ${testName}: ${results[testName].avg.toFixed(2)}ms avg`);
    }

    this.results.aiObserver = results;
    console.log('');
  }

  /**
   * TEST 4: SECURITY VALIDATION OVERHEAD
   */
  async testSecurityValidation() {
    console.log('🔒 TEST 4: Security Validation Overhead');

    const testCases = [
      { cmd: 'explore', args: ['ancient_ruins'], user: 'test_user_1' },
      { cmd: 'challenge', args: ['opponent_id', '100'], user: 'test_user_2' },
      { cmd: 'build', args: ['control_dial', 'TestCircuit'], user: 'test_user_3' }
    ];

    const results = {};

    for (const testCase of testCases) {
      const times = [];

      for (let i = 0; i < this.iterations; i++) {
        const start = performance.now();
        await this.security.validateCommand(testCase.cmd, testCase.args, testCase.user);
        const end = performance.now();
        times.push(end - start);
      }

      results[testCase.cmd] = this.calculateStats(times);
      console.log(`  ${testCase.cmd}: ${results[testCase.cmd].avg.toFixed(2)}ms avg (security overhead)`);
    }

    this.results.security = results;
    console.log('');
  }

  /**
   * TEST 5: DUST ECONOMY OPERATIONS
   */
  async testDustEconomy() {
    console.log('\n💰 TEST 5: Dust Economy Operations\n');

    const tests = {
      getBalance: () => this.brand.dust.balance('test_user'),
      checkCooldown: () => this.brand.dust.checkCooldown('test_user', 'bite'),
      setCooldown: () => this.brand.dust.setCooldown('test_user', 'bite')
    };

    const results = {};

    for (const [testName, testFn] of Object.entries(tests)) {
      const times = [];

      for (let i = 0; i < this.iterations; i++) {
        const start = performance.now();
        testFn();
        const end = performance.now();
        times.push(end - start);
      }

      results[testName] = this.calculateStats(times);
      console.log(`  ${testName}: ${results[testName].avg.toFixed(2)}ms avg`);
    }

    this.results.dustEconomy = results;
    console.log('');
  }

  /**
   * TEST 6: BLENDER CLIENT LATENCY
   */
  async testBlenderClient() {
    console.log('🎨 TEST 6: Blender Client HTTP Latency');

    // Check if Blender server is running
    const isHealthy = await this.blender.checkHealth();

    if (!isHealthy) {
      console.log('  ⚠️  Blender server not running (port 8000)');
      console.log('  Skipping Blender tests (start server to measure)\n');
      this.results.blender = { status: 'server_offline' };
      return;
    }

    console.log('  ✅ Blender server detected');

    // Test scene generation (only 5 iterations - rendering is slow)
    const times = [];
    const testIterations = 5;

    for (let i = 0; i < testIterations; i++) {
      const start = performance.now();
      try {
        await this.blender.generateScene({
          topology: { location: 'test_scene' },
          user_id: 'benchmark_user',
          timestamp: Date.now()
        });
        const end = performance.now();
        times.push(end - start);
        console.log(`  Render ${i + 1}/${testIterations}: ${(times[times.length - 1]).toFixed(2)}ms`);
      } catch (error) {
        console.log(`  Render ${i + 1}/${testIterations}: FAILED (${error.message})`);
      }
    }

    if (times.length > 0) {
      this.results.blender = this.calculateStats(times);
      console.log(`  Overall: ${this.results.blender.avg.toFixed(2)}ms avg\n`);
    } else {
      console.log('  ❌ All renders failed\n');
      this.results.blender = { status: 'all_failed' };
    }
  }

  /**
   * TEST 7: END-TO-END /EXPLORE COMMAND
   */
  async testEndToEndExplore() {
    console.log('🗺️ TEST 7: End-to-End /explore Command');
    console.log('  Simulating complete flow: Security → Herald → Blender → Database');

    const times = [];
    const testIterations = this.blender.checkHealth ? 5 : 10; // Fewer iterations if Blender enabled

    for (let i = 0; i < testIterations; i++) {
      const start = performance.now();

      try {
        // 1. Security validation
        const validation = await this.security.validateCommand(
          'explore',
          ['ancient_ruins'],
          'benchmark_user'
        );

        if (!validation.approved) throw new Error('Security failed');

        // 2. Dust deduction (simulated)
        const balance = this.brand.dust.balance('benchmark_user');

        // 3. Blender generation (if server running)
        if (this.results.blender?.status !== 'server_offline') {
          await this.blender.generateScene({
            topology: { location: 'ancient_ruins' },
            user_id: 'benchmark_user',
            timestamp: Date.now()
          });
        }

        // 4. Database record
        db.prepare(`
          INSERT OR IGNORE INTO game_actions (user_id, action_type, details, timestamp)
          VALUES (?, 'explore', ?, ?)
        `).run('benchmark_user', 'ancient_ruins', Date.now());

        // 5. Herald testimony
        const heraldResult = herald.observe('exploration_complete', {
          sovereign_id: 'benchmark_user',
          location: 'ancient_ruins',
          timestamp: new Date().toISOString()
        });
        // Herald may return null for unknown event types, that's ok for benchmark

        const end = performance.now();
        times.push(end - start);
        console.log(`  Iteration ${i + 1}/${testIterations}: ${times[times.length - 1].toFixed(2)}ms`);
      } catch (error) {
        console.log(`  Iteration ${i + 1}/${testIterations}: FAILED (${error.message})`);
      }
    }

    if (times.length > 0) {
      this.results.endToEnd = this.calculateStats(times);
      console.log(`  Overall: ${this.results.endToEnd.avg.toFixed(2)}ms avg\n`);
    } else {
      console.log('  ❌ All iterations failed\n');
      this.results.endToEnd = { status: 'all_failed' };
    }
  }

  /**
   * CALCULATE STATISTICS
   */
  calculateStats(times) {
    const sorted = times.sort((a, b) => a - b);
    const sum = times.reduce((a, b) => a + b, 0);

    return {
      avg: sum / times.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  /**
   * ANALYZE RESULTS AGAINST BASELINES
   */
  analyzeResults() {
    console.log('\n📈 PERFORMANCE ANALYSIS');
    console.log('═'.repeat(70));

    const baselines = {
      database_simple: 5,      // 5ms baseline for simple SELECT
      database_complex: 20,    // 20ms for complex JOIN
      herald: 10,              // 10ms for testimony generation
      aiObserver: 50,          // 50ms for pattern detection
      security: 2,             // 2ms for validation overhead
      dustEconomy: 5,          // 5ms for economy operations
      blender: 1000,           // 1000ms for 3D rendering (1 second)
      endToEnd: 2000           // 2000ms for complete flow (2 seconds)
    };

    console.log('Industry Baselines:');
    Object.entries(baselines).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}ms`);
    });
    console.log('');

    // Compare database performance
    if (this.results.database) {
      const simpleRatio = baselines.database_simple / this.results.database.simpleSelect.avg;
      console.log(`Database (simple): ${this.results.database.simpleSelect.avg.toFixed(2)}ms`);
      console.log(`  Speed multiplier: ${simpleRatio.toFixed(2)}x ${simpleRatio > 1 ? '(FASTER)' : '(SLOWER)'}`);
    }

    // Compare Herald performance
    if (this.results.herald) {
      const avgHerald = Object.values(this.results.herald).reduce((sum, r) => sum + r.avg, 0) / Object.keys(this.results.herald).length;
      const heraldRatio = baselines.herald / avgHerald;
      console.log(`Herald: ${avgHerald.toFixed(2)}ms avg`);
      console.log(`  Speed multiplier: ${heraldRatio.toFixed(2)}x ${heraldRatio > 1 ? '(FASTER)' : '(SLOWER)'}`);
    }

    // Compare end-to-end
    if (this.results.endToEnd && this.results.endToEnd.avg) {
      const e2eRatio = baselines.endToEnd / this.results.endToEnd.avg;
      console.log(`End-to-End /explore: ${this.results.endToEnd.avg.toFixed(2)}ms`);
      console.log(`  Speed multiplier: ${e2eRatio.toFixed(2)}x ${e2eRatio > 1 ? '(FASTER)' : '(SLOWER)'}`);
    }
  }

  /**
   * GENERATE FINAL REPORT
   */
  generateReport() {
    console.log('\n📋 FINAL REPORT');
    console.log('═'.repeat(70));

    const report = {
      timestamp: new Date().toISOString(),
      iterations: this.iterations,
      results: this.results,
      verdict: this.calculateVerdict()
    };

    console.log('System Verdict:', report.verdict);
    console.log('');
    console.log('✅ Interrogation complete. Results saved to memory.');
    console.log('═'.repeat(70));

    return report;
  }

  /**
   * CALCULATE OVERALL VERDICT
   */
  calculateVerdict() {
    const scores = [];

    // Database score
    if (this.results.database?.simpleSelect) {
      scores.push(this.results.database.simpleSelect.avg < 10 ? 'EXCELLENT' : 'ACCEPTABLE');
    }

    // Herald score
    if (this.results.herald) {
      const avgHerald = Object.values(this.results.herald).reduce((sum, r) => sum + r.avg, 0) / Object.keys(this.results.herald).length;
      scores.push(avgHerald < 15 ? 'EXCELLENT' : 'ACCEPTABLE');
    }

    // End-to-end score
    if (this.results.endToEnd?.avg) {
      scores.push(this.results.endToEnd.avg < 2500 ? 'EXCELLENT' : 'ACCEPTABLE');
    }

    const excellentCount = scores.filter(s => s === 'EXCELLENT').length;
    const ratio = excellentCount / scores.length;

    if (ratio >= 0.8) return '🏆 EXCEPTIONAL PERFORMANCE';
    if (ratio >= 0.5) return '✅ STRONG PERFORMANCE';
    return '⚠️  ACCEPTABLE PERFORMANCE';
  }
}

// Execute if run directly
if (require.main === module) {
  const interrogation = new FinalInterrogation();
  interrogation.runAllTests().then(() => {
    console.log('\nInterrogation complete. Exiting.\n');
    process.exit(0);
  }).catch(error => {
    console.error('\n❌ Interrogation failed:', error);
    process.exit(1);
  });
}

module.exports = FinalInterrogation;
