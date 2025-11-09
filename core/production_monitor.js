// Production Monitoring & Performance Tracking
// Provides health checks, metrics, and alerting for production deployment

const fs = require('fs');
const path = require('path');

class PerformanceMonitor {
    constructor() {
        this.startTime = Date.now();
        this.commandCount = 0;
        this.errorCount = 0;
        this.memorySnapshots = [];
        this.commandRates = {
            perMinute: [],
            perHour: []
        };
        
        this.config = {
            backupInterval: 3600000, // 1 hour in ms
            healthCheckInterval: 300000, // 5 minutes in ms
            maxMemoryMB: 500,
            maxUsers: 10000,
            rateLimits: {
                globalCommandsPerMinute: 1000,
                userCommandsPerMinute: 60
            }
        };
        
        this.alerts = [];
        this.healthStatus = 'healthy';
    }
    
    recordCommand() {
        this.commandCount++;
        const now = Date.now();
        
        // Track command rate
        this.commandRates.perMinute.push(now);
        this.commandRates.perHour.push(now);
        
        // Clean old entries (keep last minute and hour)
        this.commandRates.perMinute = this.commandRates.perMinute.filter(t => now - t < 60000);
        this.commandRates.perHour = this.commandRates.perHour.filter(t => now - t < 3600000);
    }
    
    recordError(errorType = 'unknown') {
        this.errorCount++;
        this.alerts.push({
            type: 'error',
            errorType: errorType,
            timestamp: Date.now(),
            severity: 'medium'
        });
        
        // Keep only last 100 alerts
        if (this.alerts.length > 100) {
            this.alerts = this.alerts.slice(-100);
        }
    }
    
    getUptime() {
        return Date.now() - this.startTime;
    }
    
    getUptimeFormatted() {
        const uptime = this.getUptime();
        const hours = Math.floor(uptime / 3600000);
        const minutes = Math.floor((uptime % 3600000) / 60000);
        const seconds = Math.floor((uptime % 60000) / 1000);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    }
    
    getCommandsPerMinute() {
        return this.commandRates.perMinute.length;
    }
    
    getCommandsPerHour() {
        return this.commandRates.perHour.length;
    }
    
    getMemoryUsage() {
        const usage = process.memoryUsage();
        return {
            rss: Math.round(usage.rss / 1024 / 1024), // MB
            heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
            heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
            external: Math.round(usage.external / 1024 / 1024) // MB
        };
    }
    
    getCPUUsage() {
        const usage = process.cpuUsage();
        return {
            user: Math.round(usage.user / 1000), // ms
            system: Math.round(usage.system / 1000) // ms
        };
    }
    
    /**
     * Perform comprehensive health check
     */
    performHealthCheck(economyData) {
        const checks = {
            memory: this.checkMemory(),
            users: this.checkUserLoad(economyData),
            economy: this.checkEconomicHealth(economyData),
            errors: this.checkErrorRate()
        };
        
        // Determine overall health
        const failedChecks = Object.values(checks).filter(c => c.status !== 'healthy').length;
        
        if (failedChecks === 0) {
            this.healthStatus = 'healthy';
        } else if (failedChecks <= 2) {
            this.healthStatus = 'degraded';
        } else {
            this.healthStatus = 'critical';
        }
        
        return {
            overall: this.healthStatus,
            checks: checks,
            timestamp: Date.now()
        };
    }
    
    checkMemory() {
        const memory = this.getMemoryUsage();
        const threshold = this.config.maxMemoryMB;
        
        if (memory.rss > threshold) {
            return {
                status: 'critical',
                message: `Memory usage critical: ${memory.rss}MB / ${threshold}MB`,
                value: memory.rss
            };
        } else if (memory.rss > threshold * 0.8) {
            return {
                status: 'warning',
                message: `Memory usage high: ${memory.rss}MB / ${threshold}MB`,
                value: memory.rss
            };
        }
        
        return {
            status: 'healthy',
            message: `Memory normal: ${memory.rss}MB / ${threshold}MB`,
            value: memory.rss
        };
    }
    
    checkUserLoad(economyData) {
        const userCount = economyData?.balances ? Object.keys(economyData.balances).length : 0;
        const threshold = this.config.maxUsers;
        
        if (userCount > threshold) {
            return {
                status: 'critical',
                message: `User limit exceeded: ${userCount} / ${threshold}`,
                value: userCount
            };
        } else if (userCount > threshold * 0.8) {
            return {
                status: 'warning',
                message: `Approaching user limit: ${userCount} / ${threshold}`,
                value: userCount
            };
        }
        
        return {
            status: 'healthy',
            message: `User count normal: ${userCount} / ${threshold}`,
            value: userCount
        };
    }
    
    checkEconomicHealth(economyData) {
        if (!economyData?.balances || !economyData?.assetReserves) {
            return {
                status: 'warning',
                message: 'Economy data incomplete',
                value: 0
            };
        }
        
        const totalDust = Object.values(economyData.balances).reduce((sum, val) => sum + val, 0);
        const backedDust = economyData.assetReserves.waterLiters * economyData.assetReserves.backingRatio;
        const coverage = totalDust > 0 ? (backedDust / totalDust * 100) : 100;
        
        if (coverage < 50) {
            return {
                status: 'critical',
                message: `Low backing coverage: ${coverage.toFixed(1)}%`,
                value: coverage
            };
        } else if (coverage < 80) {
            return {
                status: 'warning',
                message: `Medium backing coverage: ${coverage.toFixed(1)}%`,
                value: coverage
            };
        }
        
        return {
            status: 'healthy',
            message: `Backing coverage healthy: ${coverage.toFixed(1)}%`,
            value: coverage
        };
    }
    
    checkErrorRate() {
        const recentErrors = this.alerts.filter(a => 
            a.type === 'error' && Date.now() - a.timestamp < 3600000 // Last hour
        ).length;
        
        if (recentErrors > 50) {
            return {
                status: 'critical',
                message: `High error rate: ${recentErrors} errors/hour`,
                value: recentErrors
            };
        } else if (recentErrors > 20) {
            return {
                status: 'warning',
                message: `Elevated error rate: ${recentErrors} errors/hour`,
                value: recentErrors
            };
        }
        
        return {
            status: 'healthy',
            message: `Error rate normal: ${recentErrors} errors/hour`,
            value: recentErrors
        };
    }
    
    /**
     * Get comprehensive production metrics
     */
    getProductionMetrics(economyData) {
        const memory = this.getMemoryUsage();
        const cpu = this.getCPUUsage();
        const userCount = economyData?.balances ? Object.keys(economyData.balances).length : 0;
        const totalDust = economyData?.balances ? Object.values(economyData.balances).reduce((sum, val) => sum + val, 0) : 0;
        
        return {
            uptime: {
                ms: this.getUptime(),
                formatted: this.getUptimeFormatted()
            },
            performance: {
                commandsTotal: this.commandCount,
                commandsPerMinute: this.getCommandsPerMinute(),
                commandsPerHour: this.getCommandsPerHour(),
                errorsTotal: this.errorCount
            },
            system: {
                memory: memory,
                cpu: cpu,
                pid: process.pid,
                nodeVersion: process.version
            },
            economy: {
                users: userCount,
                totalDust: totalDust,
                backed: economyData?.assetReserves ? economyData.assetReserves.waterLiters * 1000 : 0
            },
            health: this.healthStatus
        };
    }
    
    /**
     * Create backup with timestamp
     */
    createBackup(dataFilePath) {
        try {
            if (!fs.existsSync(dataFilePath)) {
                return { success: false, message: 'No data file to backup' };
            }
            
            const backupsDir = path.join(path.dirname(dataFilePath), 'backups');
            if (!fs.existsSync(backupsDir)) {
                fs.mkdirSync(backupsDir, { recursive: true });
            }
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T').join('_').slice(0, -5);
            const backupFile = path.join(backupsDir, `economy_backup_${timestamp}.json`);
            
            fs.copyFileSync(dataFilePath, backupFile);
            
            // Clean old backups (keep last 24)
            const backupFiles = fs.readdirSync(backupsDir)
                .filter(f => f.startsWith('economy_backup_'))
                .sort()
                .reverse();
            
            for (let i = 24; i < backupFiles.length; i++) {
                fs.unlinkSync(path.join(backupsDir, backupFiles[i]));
            }
            
            return { 
                success: true, 
                file: backupFile,
                count: Math.min(backupFiles.length, 24)
            };
        } catch (error) {
            return { 
                success: false, 
                message: error.message 
            };
        }
    }
}

module.exports = PerformanceMonitor;
