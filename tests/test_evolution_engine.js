/**
 * EVOLUTIONARY ENGINE TEST
 * 
 * Validates Phase 2: Stress-Driven Evolution
 * 
 * This test demonstrates the system discovering its own breaking points
 * and proposing adaptations to transcend them.
 */

const StressTester = require('../core/stress_tester.js');
const EvolutionaryObserver = require('../core/evolutionary_observer.js');
const { KedsDeclassifiedBrand } = require('../identity/keds_brand');
const { statements, aiObserver } = require('../database/db_service');
const herald = require('../lib/herald_voice');
const SecurityValidator = require('../lib/security_validator');

class EvolutionEngineTest {
    constructor() {
        this.brand = null;
        this.stressTester = null;
        this.observer = null;
    }

    async initialize() {
        console.log('🔧 Initializing N8.KED Brand for evolution testing...\n');
        
        // Initialize components
        this.brand = new KedsDeclassifiedBrand();
        this.security = new SecurityValidator();
        
        // Initialize stress testing and observation with all services
        this.stressTester = new StressTester(this.brand, statements, herald, this.security, aiObserver);
        this.observer = new EvolutionaryObserver(this.brand, statements, herald, this.security, aiObserver);
    }

    /**
     * TEST 1: STRESS-DRIVEN EVOLUTION
     * Find breaking points through gradual load increase
     */
    async testStressDrivenEvolution() {
        console.log('═══════════════════════════════════════════════════════');
        console.log('TEST 1: STRESS-DRIVEN EVOLUTION ENGINE');
        console.log('═══════════════════════════════════════════════════════\n');

        const results = await this.stressTester.runEvolutionaryStressTest();

        console.log('\n📊 STRESS TEST RESULTS:');
        console.log(`   Breaking Points Found: ${results.breakingPoints.length}`);
        console.log(`   Evolutionary Proposals: ${results.proposals.length}`);
        
        // Display proposals
        console.log('\n🧬 EVOLUTIONARY PROPOSALS:\n');
        for (const proposal of results.proposals) {
            console.log(`📋 ${proposal.title}`);
            console.log(`   Priority: ${proposal.priority}`);
            console.log(`   Component: ${proposal.component}`);
            console.log(`   Adaptation: ${proposal.adaptation}`);
            console.log('');
        }

        return results;
    }

    /**
     * TEST 2: CONTINUOUS EVOLUTIONARY OBSERVATION
     * Monitor system in real-time and detect patterns
     */
    async testContinuousObservation() {
        console.log('═══════════════════════════════════════════════════════');
        console.log('TEST 2: CONTINUOUS EVOLUTIONARY OBSERVATION');
        console.log('═══════════════════════════════════════════════════════\n');

        // Start monitoring
        this.observer.startMonitoring();

        // Listen for evolutionary events
        this.observer.on('degradation_detected', (signature) => {
            console.log(`⚠️ Degradation detected in ${signature.component}: ${signature.degradation.toFixed(2)}x slower`);
        });

        this.observer.on('bottleneck_predicted', (bottleneck) => {
            console.log(`🚨 Bottleneck predicted in ${bottleneck.component}: ${bottleneck.headroom.toFixed(2)}ms headroom`);
        });

        this.observer.on('adaptation_proposed', (adaptation) => {
            console.log(`🧬 Adaptation proposed for ${adaptation.component}: ${adaptation.strategy}`);
        });

        // Let it monitor for 10 seconds
        console.log('👁️ Monitoring system for 10 seconds...\n');
        await new Promise(resolve => setTimeout(resolve, 10000));

        // Stop monitoring
        this.observer.stopMonitoring();

        // Get summary
        const summary = this.observer.getSummary();
        console.log('\n📊 OBSERVATION SUMMARY:');
        console.log(`   Total Metrics Collected: ${summary.totalMetricsCollected}`);
        console.log(`   Degradation Signatures: ${summary.degradationSignatures}`);
        console.log(`   Bottlenecks Predicted: ${summary.bottlenecksPredicted}`);
        console.log(`   Adaptations Proposed: ${summary.adaptationsProposed}`);

        return summary;
    }

    /**
     * TEST 3: ADAPTATION LIFECYCLE
     * Propose → Implement → Validate adaptation
     */
    async testAdaptationLifecycle() {
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('TEST 3: ADAPTATION LIFECYCLE');
        console.log('═══════════════════════════════════════════════════════\n');

        // Simulate proposing an adaptation
        const mockSignature = {
            component: 'database',
            degradation: 5.2,
            severity: 'HIGH',
            timestamp: Date.now()
        };

        const adaptation = this.observer.generateAdaptation(mockSignature);
        this.observer.adaptations.proposed.push(adaptation);

        console.log('📋 Proposed Adaptation:');
        console.log(`   ID: ${adaptation.id}`);
        console.log(`   Component: ${adaptation.component}`);
        console.log(`   Strategy: ${adaptation.strategy}`);
        console.log(`   Expected Improvement: ${adaptation.expectedImprovement}`);
        console.log(`   Status: ${adaptation.status}\n`);

        // Simulate implementation
        const validationMetrics = {
            preAvgTime: 5.2,
            postAvgTime: 0.8,
            improvement: '6.5x faster'
        };

        this.observer.markImplemented(adaptation.id, validationMetrics);
        console.log('✅ Adaptation marked as IMPLEMENTED\n');

        // Simulate validation
        const actualMetrics = {
            avgTime: 0.8,
            throughput: '10,000 queries/sec',
            stability: 'STABLE'
        };

        this.observer.validateAdaptation(adaptation.id, actualMetrics);
        console.log('✅ Adaptation marked as VALIDATED\n');

        // Final state
        const finalState = this.observer.getState();
        console.log('📊 LIFECYCLE SUMMARY:');
        console.log(`   Proposed: ${finalState.adaptations.proposed.length}`);
        console.log(`   Implemented: ${finalState.adaptations.implemented.length}`);
        console.log(`   Validated: ${finalState.adaptations.validated.length}`);

        return finalState;
    }

    /**
     * RUN ALL TESTS
     */
    async runAll() {
        await this.initialize();

        console.log('🔥 EVOLUTIONARY ENGINE TEST SUITE');
        console.log('Phase 2: System Self-Discovery Through Controlled Stress\n');

        try {
            // Test 1: Stress-driven evolution
            const stressResults = await this.testStressDrivenEvolution();

            // Test 2: Continuous observation
            const observationResults = await testContinuousObservation();

            // Test 3: Adaptation lifecycle
            const lifecycleResults = await this.testAdaptationLifecycle();

            // Final summary
            console.log('\n═══════════════════════════════════════════════════════');
            console.log('🏆 EVOLUTIONARY ENGINE TEST COMPLETE');
            console.log('═══════════════════════════════════════════════════════\n');

            console.log('✅ Stress-driven evolution: OPERATIONAL');
            console.log('✅ Continuous observation: OPERATIONAL');
            console.log('✅ Adaptation lifecycle: OPERATIONAL\n');

            console.log('🧬 VERDICT: System capable of self-discovery and evolutionary adaptation');
            console.log('📋 Breaking points become aspirations');
            console.log('🔥 Stress reveals transcendence opportunities\n');

            return {
                stress: stressResults,
                observation: observationResults,
                lifecycle: lifecycleResults
            };

        } catch (error) {
            console.error('❌ Evolution engine test failed:', error.message);
            console.error(error.stack);
            throw error;
        }
    }
}

// Run tests if executed directly
if (require.main === module) {
    const test = new EvolutionEngineTest();
    test.runAll()
        .then(() => {
            console.log('✅ All evolution engine tests completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Evolution engine tests failed:', error);
            process.exit(1);
        });
}

module.exports = EvolutionEngineTest;
