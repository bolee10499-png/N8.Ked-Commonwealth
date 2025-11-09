// Resilience Layer - Real Error Recovery & Graceful Degradation
// Handles actual production failures without the quantum mysticism

const fs = require('fs');

class ResilienceLayer {
    constructor() {
        this.fallbackData = {
            waterFlow: null,
            weather: null,
            lastSuccessfulFetch: {}
        };
        
        this.errorThresholds = {
            consecutiveFailures: 3,
            errorRatePerHour: 10
        };
        
        this.circuitBreakers = {
            externalAPIs: {
                state: 'closed', // closed | open | half-open
                failures: 0,
                lastFailure: null,
                cooldownMs: 300000 // 5 minutes
            }
        };
    }
    
    /**
     * Cache successful external API responses
     * When APIs fail, serve cached data instead of crashing
     */
    cacheExternalData(source, data) {
        this.fallbackData[source] = {
            data: data,
            timestamp: Date.now()
        };
        
        this.lastSuccessfulFetch[source] = Date.now();
    }
    
    /**
     * Get cached data if fresh enough
     */
    getCachedData(source, maxAgeMs = 86400000) { // 24 hours default
        const cached = this.fallbackData[source];
        if (!cached) return null;
        
        const age = Date.now() - cached.timestamp;
        if (age > maxAgeMs) return null;
        
        return {
            ...cached.data,
            cached: true,
            age: Math.floor(age / 1000 / 60) // minutes
        };
    }
    
    /**
     * Circuit breaker pattern for external APIs
     * Prevents hammering failing services
     */
    shouldAttemptExternalCall(service) {
        const breaker = this.circuitBreakers[service];
        if (!breaker) return true;
        
        // Circuit is open (too many failures)
        if (breaker.state === 'open') {
            const timeSinceFailure = Date.now() - breaker.lastFailure;
            
            // Cooldown period elapsed, try half-open
            if (timeSinceFailure > breaker.cooldownMs) {
                breaker.state = 'half-open';
                return true;
            }
            
            return false; // Still in cooldown
        }
        
        return true;
    }
    
    /**
     * Record external API call result
     */
    recordExternalResult(service, success, error = null) {
        const breaker = this.circuitBreakers[service];
        if (!breaker) return;
        
        if (success) {
            // Reset on success
            breaker.failures = 0;
            breaker.state = 'closed';
        } else {
            // Increment failures
            breaker.failures++;
            breaker.lastFailure = Date.now();
            
            // Open circuit if threshold exceeded
            if (breaker.failures >= this.errorThresholds.consecutiveFailures) {
                breaker.state = 'open';
                console.error(`[RESILIENCE] Circuit breaker opened for ${service}: ${breaker.failures} consecutive failures`);
            }
        }
    }
    
    /**
     * Graceful degradation for economy operations
     * Never let the bot crash, just reduce functionality
     */
    async safeEconomyOperation(operation, fallback = null) {
        try {
            return await operation();
        } catch (error) {
            console.error(`[RESILIENCE] Economy operation failed, using fallback:`, error.message);
            return fallback;
        }
    }
    
    /**
     * Self-healing data structures
     * Detect and repair corrupted economy data
     */
    validateAndRepairEconomyData(data) {
        const repairs = [];
        
        // Ensure all required fields exist
        if (!data.balances) {
            data.balances = {};
            repairs.push('Created missing balances object');
        }
        
        if (!data.assetReserves) {
            data.assetReserves = {
                waterLiters: 1000000,
                backingRatio: 1000,
                sources: []
            };
            repairs.push('Created missing assetReserves');
        }
        
        if (!data.transactions) {
            data.transactions = [];
            repairs.push('Created missing transactions array');
        }
        
        // Validate balance integrity
        for (const [userId, balance] of Object.entries(data.balances)) {
            if (typeof balance !== 'number' || isNaN(balance) || balance < 0) {
                console.warn(`[RESILIENCE] Invalid balance for user ${userId}: ${balance}, resetting to 0`);
                data.balances[userId] = 0;
                repairs.push(`Reset invalid balance for user ${userId}`);
            }
        }
        
        // Validate stake amounts
        if (data.stakes) {
            for (const [userId, stake] of Object.entries(data.stakes)) {
                if (!stake.amount || stake.amount < 0) {
                    console.warn(`[RESILIENCE] Invalid stake for user ${userId}, removing`);
                    delete data.stakes[userId];
                    repairs.push(`Removed invalid stake for user ${userId}`);
                }
            }
        }
        
        if (repairs.length > 0) {
            console.log(`[RESILIENCE] Data repairs performed:`, repairs);
        }
        
        return {
            data: data,
            repairs: repairs,
            healthy: repairs.length === 0
        };
    }
    
    /**
     * Predictive error prevention
     * Detect patterns that lead to failures before they happen
     */
    detectAnomalies(economyData) {
        const warnings = [];
        
        // Detect unbacked dust (economic crisis warning)
        const totalDust = Object.values(economyData.balances || {}).reduce((sum, val) => sum + val, 0);
        const reserves = economyData.assetReserves || { waterLiters: 0, backingRatio: 1000 };
        const backedDust = reserves.waterLiters * reserves.backingRatio;
        const coverage = totalDust > 0 ? (backedDust / totalDust * 100) : 100;
        
        if (coverage < 30) {
            warnings.push({
                type: 'critical',
                issue: 'economic_collapse_risk',
                message: `Backing coverage critically low: ${coverage.toFixed(1)}%`,
                recommendation: 'Add water reserves immediately'
            });
        } else if (coverage < 50) {
            warnings.push({
                type: 'warning',
                issue: 'low_backing_coverage',
                message: `Backing coverage low: ${coverage.toFixed(1)}%`,
                recommendation: 'Consider adding water reserves'
            });
        }
        
        // Detect excessive staking (liquidity crisis)
        const totalStaked = Object.values(economyData.stakes || {}).reduce((sum, stake) => sum + (stake.amount || 0), 0);
        const stakingRatio = totalDust > 0 ? (totalStaked / totalDust * 100) : 0;
        
        if (stakingRatio > 80) {
            warnings.push({
                type: 'warning',
                issue: 'high_staking_ratio',
                message: `${stakingRatio.toFixed(1)}% of dust is staked`,
                recommendation: 'Low circulating supply may impact liquidity'
            });
        }
        
        // Detect unusual transaction volumes
        const recentTransactions = (economyData.transactions || []).filter(tx => 
            Date.now() - tx.timestamp < 3600000 // Last hour
        );
        
        if (recentTransactions.length > 100) {
            warnings.push({
                type: 'info',
                issue: 'high_transaction_volume',
                message: `${recentTransactions.length} transactions in last hour`,
                recommendation: 'Monitor for potential abuse'
            });
        }
        
        return warnings;
    }
    
    /**
     * Get system health report
     */
    getHealthReport(economyData, externalAPIStatus) {
        const validation = this.validateAndRepairEconomyData(economyData);
        const anomalies = this.detectAnomalies(validation.data);
        
        return {
            healthy: validation.healthy && anomalies.filter(a => a.type === 'critical').length === 0,
            dataIntegrity: validation.healthy,
            repairs: validation.repairs,
            warnings: anomalies,
            circuitBreakers: this.circuitBreakers,
            fallbackData: {
                waterFlow: this.fallbackData.waterFlow ? `Cached ${Math.floor((Date.now() - this.fallbackData.waterFlow.timestamp) / 60000)}m ago` : 'None',
                weather: this.fallbackData.weather ? `Cached ${Math.floor((Date.now() - this.fallbackData.weather.timestamp) / 60000)}m ago` : 'None'
            }
        };
    }

    /**
     * 📊 ARCHITECTURE INTEGRITY SCORING (Step 12 Enhancement)
     * Calculate 0-100% health score based on system performance
     */
    calculateIntegrityScore() {
        const { db, statements } = require('../database/db_service.js');
        
        let score = 100;
        const factors = [];
        
        // Factor 1: Circuit Breaker Health (30 points)
        const openCircuits = Object.values(this.circuitBreakers).filter(cb => cb.state === 'open').length;
        const totalCircuits = Object.keys(this.circuitBreakers).length;
        const circuitHealth = totalCircuits > 0 ? ((totalCircuits - openCircuits) / totalCircuits) * 30 : 30;
        score -= (30 - circuitHealth);
        factors.push({
            name: 'Circuit Breaker Health',
            score: circuitHealth,
            max: 30,
            details: `${totalCircuits - openCircuits}/${totalCircuits} circuits operational`
        });
        
        // Factor 2: Error Rate (25 points)
        try {
            const recentErrors = db.prepare(`
                SELECT COUNT(*) as count 
                FROM resilience_events 
                WHERE event_type = 'failure' 
                AND timestamp > datetime('now', '-1 hour')
            `).get();
            
            const errorDeduction = Math.min(25, recentErrors.count * 2.5);
            score -= errorDeduction;
            factors.push({
                name: 'Error Rate (Last Hour)',
                score: 25 - errorDeduction,
                max: 25,
                details: `${recentErrors.count} errors detected`
            });
        } catch (e) {
            // Database not ready, skip this factor
            factors.push({
                name: 'Error Rate',
                score: 25,
                max: 25,
                details: 'Tracking not available'
            });
        }
        
        // Factor 3: Recovery Success Rate (25 points)
        try {
            const recoveries = db.prepare(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful
                FROM resilience_events 
                WHERE event_type = 'self_heal' 
                AND timestamp > datetime('now', '-24 hours')
            `).get();
            
            if (recoveries.total > 0) {
                const successRate = (recoveries.successful / recoveries.total) * 25;
                score = score - 25 + successRate;
                factors.push({
                    name: 'Recovery Success Rate (24h)',
                    score: successRate,
                    max: 25,
                    details: `${recoveries.successful}/${recoveries.total} recoveries successful`
                });
            } else {
                factors.push({
                    name: 'Recovery Success Rate',
                    score: 25,
                    max: 25,
                    details: 'No recovery attempts in 24h (healthy!)'
                });
            }
        } catch (e) {
            factors.push({
                name: 'Recovery Success Rate',
                score: 25,
                max: 25,
                details: 'Tracking not available'
            });
        }
        
        // Factor 4: Uptime Stability (20 points)
        const uptimeMs = Date.now() - (this.startTime || Date.now());
        const uptimeHours = uptimeMs / (1000 * 60 * 60);
        const uptimeScore = Math.min(20, uptimeHours * 2); // Full score at 10+ hours
        score = score - 20 + uptimeScore;
        factors.push({
            name: 'Uptime Stability',
            score: uptimeScore,
            max: 20,
            details: `${uptimeHours.toFixed(1)} hours continuous operation`
        });
        
        return {
            score: Math.max(0, Math.min(100, score)),
            grade: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F',
            factors,
            timestamp: Date.now()
        };
    }

    /**
     * 🧠 PATTERN LEARNING ENGINE (Step 12 Enhancement)
     * Learn from successful recoveries and apply automatically
     */
    async learnFromRecovery(serviceId, recoveryMethod, success) {
        const { statements } = require('../database/db_service.js');
        
        try {
            // Log recovery event
            statements.logResilienceEvent.run(
                success ? 'self_heal' : 'failure',
                serviceId,
                JSON.stringify({ method: recoveryMethod }),
                null, // recovery_time will be set by successful recoveries
                success ? 1 : 0
            );
            
            // If successful, update service-specific recovery strategy
            if (success && !this.recoveryPatterns) {
                this.recoveryPatterns = {};
            }
            
            if (success) {
                if (!this.recoveryPatterns[serviceId]) {
                    this.recoveryPatterns[serviceId] = {
                        successfulMethods: {},
                        lastSuccess: null
                    };
                }
                
                const methodKey = recoveryMethod;
                if (!this.recoveryPatterns[serviceId].successfulMethods[methodKey]) {
                    this.recoveryPatterns[serviceId].successfulMethods[methodKey] = 0;
                }
                this.recoveryPatterns[serviceId].successfulMethods[methodKey]++;
                this.recoveryPatterns[serviceId].lastSuccess = Date.now();
                
                console.log(`✅ [PATTERN LEARNING] ${serviceId}: ${recoveryMethod} marked as successful pattern`);
            }
        } catch (error) {
            console.error('[PATTERN LEARNING] Failed to log recovery:', error.message);
        }
    }

    /**
     * 🎯 Get best recovery method based on learned patterns
     */
    getBestRecoveryMethod(serviceId) {
        if (!this.recoveryPatterns || !this.recoveryPatterns[serviceId]) {
            return 'exponential_backoff'; // Default
        }
        
        const patterns = this.recoveryPatterns[serviceId].successfulMethods;
        const methods = Object.entries(patterns);
        
        if (methods.length === 0) {
            return 'exponential_backoff';
        }
        
        // Return method with highest success count
        methods.sort((a, b) => b[1] - a[1]);
        return methods[0][0];
    }

    /**
     * 📈 Get evolution metrics over time
     */
    getEvolutionMetrics(daysBack = 30) {
        const { db } = require('../database/db_service.js');
        
        try {
            const metrics = db.prepare(`
                SELECT 
                    DATE(timestamp) as date,
                    COUNT(*) as total_events,
                    SUM(CASE WHEN event_type = 'failure' THEN 1 ELSE 0 END) as failures,
                    SUM(CASE WHEN event_type = 'self_heal' AND success = 1 THEN 1 ELSE 0 END) as successful_heals,
                    AVG(CASE WHEN recovery_time IS NOT NULL THEN recovery_time ELSE NULL END) as avg_recovery_ms
                FROM resilience_events
                WHERE timestamp > datetime('now', '-${daysBack} days')
                GROUP BY DATE(timestamp)
                ORDER BY date ASC
            `).all();
            
            // Calculate trend (improving or degrading)
            if (metrics.length >= 2) {
                const recent = metrics.slice(-7); // Last 7 days
                const older = metrics.slice(0, 7);  // First 7 days
                
                const recentFailureRate = recent.reduce((sum, m) => sum + m.failures, 0) / recent.length;
                const olderFailureRate = older.reduce((sum, m) => sum + m.failures, 0) / older.length;
                
                const trend = recentFailureRate < olderFailureRate ? 'improving' : 
                              recentFailureRate > olderFailureRate ? 'degrading' : 'stable';
                
                return {
                    metrics,
                    trend,
                    recentFailureRate: recentFailureRate.toFixed(2),
                    olderFailureRate: olderFailureRate.toFixed(2),
                    daysAnalyzed: daysBack
                };
            }
            
            return {
                metrics,
                trend: 'insufficient_data',
                daysAnalyzed: daysBack
            };
        } catch (error) {
            console.error('[EVOLUTION METRICS] Error:', error.message);
            return {
                metrics: [],
                trend: 'error',
                error: error.message
            };
        }
    }

    /**
     * 🔄 Toggle resilience features on/off
     */
    toggleFeature(feature, enabled) {
        if (!this.features) {
            this.features = {
                selfHealing: true,
                circuitBreakers: true,
                patternLearning: true,
                fallbackCache: true
            };
        }
        
        if (this.features.hasOwnProperty(feature)) {
            this.features[feature] = enabled;
            console.log(`🔧 [RESILIENCE] ${feature} ${enabled ? 'ENABLED' : 'DISABLED'}`);
            return { success: true, feature, enabled };
        }
        
        return { success: false, error: `Unknown feature: ${feature}` };
    }

    /**
     * Initialize tracking
     */
    initializeTracking() {
        this.startTime = Date.now();
        this.recoveryPatterns = {};
        this.features = {
            selfHealing: true,
            circuitBreakers: true,
            patternLearning: true,
            fallbackCache: true
        };
    }

    /**
     * Execute operation with circuit breaker protection
     * @param {string} service - Service name for circuit tracking
     * @param {Function} operation - Async operation to execute
     * @param {Function} fallback - Fallback function if circuit is open
     * @returns {Promise} Result of operation or fallback
     */
    async executeWithCircuitBreaker(service, operation, fallback = null) {
        // Check if we should attempt the call
        if (!this.shouldAttemptExternalCall(service)) {
            console.warn(`[RESILIENCE] Circuit breaker open for ${service}, using fallback`);
            return fallback ? await fallback() : null;
        }

        try {
            const result = await operation();
            this.recordExternalResult(service, true);
            return result;
        } catch (error) {
            console.error(`[RESILIENCE] Operation failed for ${service}:`, error.message);
            this.recordExternalResult(service, false, error);
            
            if (fallback) {
                console.log(`[RESILIENCE] Using fallback for ${service}`);
                return await fallback();
            }
            
            throw error;
        }
    }
}

module.exports = ResilienceLayer;

