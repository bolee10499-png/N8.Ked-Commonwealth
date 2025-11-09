/**
 * ANALYTICS ENGINE - Data to Dollars
 * 
 * Step 13: Transform raw Twitch data into monetizable insights
 * 
 * Philosophy:
 * Raw data = worthless. Actionable intelligence = $$$.
 * We don't just collect data - we extract value patterns that streamers will pay for.
 * 
 * Value Propositions:
 * - FREE tier: Basic stats anyone can see (current viewers, follower count)
 * - PRO tier ($10/mo): The stuff that makes money (growth trends, engagement optimization, revenue forecasting)
 */

class AnalyticsEngine {
  constructor() {
    // Analytics cache for performance
    this.reportCache = new Map(); // streamerId -> cached reports
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    
    // Machine learning patterns (simplified - in production use TensorFlow.js)
    this.growthPatterns = new Map(); // streamerId -> growth trajectory
    this.engagementModels = new Map(); // streamerId -> engagement prediction
    
    console.log('[ANALYTICS] Engine initialized');
  }
  
  // ===== FREE TIER ANALYTICS =====
  
  generateBasicReport(streamerId, twitchData) {
    const { viewerMetrics, chatMetrics } = twitchData;
    
    return {
      tier: 'FREE',
      streamer: twitchData.streamer,
      
      currentStats: {
        viewers: viewerMetrics.current,
        peakViewers: viewerMetrics.peak,
        chatters: chatMetrics.uniqueChatters,
        messages: chatMetrics.totalMessages
      },
      
      simpleMetrics: {
        averageViewers: viewerMetrics.average,
        chatEngagement: chatMetrics.engagementRate,
        overallSentiment: chatMetrics.sentiment
      },
      
      upgradePrompt: {
        message: '🔒 Unlock growth trends, revenue forecasting, and optimization recommendations',
        action: 'Upgrade to PRO tier ($10/mo) for advanced analytics'
      }
    };
  }
  
  // ===== PRO TIER ANALYTICS =====
  
  generateProReport(streamerId, twitchData, historicalData) {
    // Check cache first
    const cached = this.reportCache.get(streamerId);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return { ...cached.report, cached: true };
    }
    
    const basicReport = this.generateBasicReport(streamerId, twitchData);
    
    // PRO INSIGHTS START HERE
    const growthAnalysis = this.analyzeGrowthTrajectory(streamerId, historicalData);
    const engagementOptimization = this.calculateEngagementOpportunities(twitchData, historicalData);
    const revenueForecasting = this.forecastRevenue(streamerId, twitchData, growthAnalysis);
    const competitivePosition = this.calculateMarketPosition(twitchData);
    const contentRecommendations = this.generateContentStrategy(twitchData, growthAnalysis);
    
    const proReport = {
      ...basicReport,
      tier: 'PRO',
      
      // GROWTH INTELLIGENCE
      growthMetrics: {
        trajectory: growthAnalysis.trend, // 'Accelerating', 'Steady', 'Declining'
        weeklyGrowth: growthAnalysis.weeklyChange,
        monthlyGrowth: growthAnalysis.monthlyChange,
        projectedViewers30d: growthAnalysis.forecast30d,
        confidence: growthAnalysis.confidence
      },
      
      // ENGAGEMENT OPTIMIZATION
      engagement: {
        current: parseFloat(twitchData.chatMetrics.engagementRate),
        optimal: engagementOptimization.targetRate,
        gap: engagementOptimization.improvementPotential,
        actionItems: engagementOptimization.recommendations
      },
      
      // REVENUE FORECASTING
      monetization: {
        estimatedMonthlyRevenue: revenueForecasting.estimated,
        potentialRevenue: revenueForecasting.potential,
        revenueGap: revenueForecasting.gap,
        pathToIncrease: revenueForecasting.strategies
      },
      
      // COMPETITIVE INTELLIGENCE
      marketPosition: {
        percentile: competitivePosition.percentile,
        comparison: competitivePosition.vsAverage,
        strengthAreas: competitivePosition.strengths,
        improvementAreas: competitivePosition.weaknesses
      },
      
      // CONTENT STRATEGY
      contentStrategy: {
        optimalStreamTimes: contentRecommendations.timing,
        suggestedGames: contentRecommendations.games,
        titleOptimization: contentRecommendations.titles,
        collaborationOpportunities: contentRecommendations.collabs
      },
      
      generatedAt: new Date().toISOString()
    };
    
    // Cache the report
    this.reportCache.set(streamerId, {
      report: proReport,
      timestamp: Date.now()
    });
    
    return proReport;
  }
  
  // ===== GROWTH TRAJECTORY ANALYSIS =====
  
  analyzeGrowthTrajectory(streamerId, historicalData) {
    // Historical data should be array of { timestamp, viewers, chatters }
    if (!historicalData || historicalData.length < 7) {
      return {
        trend: 'Insufficient Data',
        weeklyChange: 0,
        monthlyChange: 0,
        forecast30d: 0,
        confidence: 0
      };
    }
    
    // Calculate weekly growth
    const last7Days = historicalData.slice(-7);
    const previous7Days = historicalData.slice(-14, -7);
    
    const recentAvg = this.average(last7Days.map(d => d.viewers));
    const previousAvg = this.average(previous7Days.map(d => d.viewers));
    const weeklyChange = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg * 100) : 0;
    
    // Calculate monthly growth
    const last30Days = historicalData.slice(-30);
    const previous30Days = historicalData.slice(-60, -30);
    
    const recentMonthAvg = this.average(last30Days.map(d => d.viewers));
    const previousMonthAvg = this.average(previous30Days.map(d => d.viewers));
    const monthlyChange = previousMonthAvg > 0 ? ((recentMonthAvg - previousMonthAvg) / previousMonthAvg * 100) : 0;
    
    // Determine trend
    let trend = 'Steady';
    if (weeklyChange > 10 && monthlyChange > 5) {
      trend = 'Accelerating';
    } else if (weeklyChange < -10 || monthlyChange < -5) {
      trend = 'Declining';
    }
    
    // Simple linear forecast (in production, use exponential smoothing or ARIMA)
    const growthRate = monthlyChange / 100;
    const forecast30d = Math.round(recentAvg * (1 + growthRate));
    
    // Confidence based on data consistency
    const variance = this.calculateVariance(last30Days.map(d => d.viewers));
    const confidence = Math.max(0, Math.min(100, 100 - (variance / recentAvg * 100)));
    
    // Store pattern for future ML training
    this.growthPatterns.set(streamerId, {
      trend,
      weeklyChange,
      monthlyChange,
      lastUpdate: Date.now()
    });
    
    return {
      trend,
      weeklyChange: weeklyChange.toFixed(1) + '%',
      monthlyChange: monthlyChange.toFixed(1) + '%',
      forecast30d,
      confidence: Math.round(confidence) + '%'
    };
  }
  
  // ===== ENGAGEMENT OPTIMIZATION =====
  
  calculateEngagementOpportunities(twitchData, historicalData) {
    const currentEngagement = parseFloat(twitchData.chatMetrics.engagementRate);
    
    // Industry benchmarks (based on real Twitch data)
    const benchmarks = {
      small: 15, // <100 viewers
      medium: 8, // 100-1000 viewers
      large: 3   // >1000 viewers
    };
    
    const avgViewers = twitchData.viewerMetrics.average;
    let targetRate;
    
    if (avgViewers < 100) {
      targetRate = benchmarks.small;
    } else if (avgViewers < 1000) {
      targetRate = benchmarks.medium;
    } else {
      targetRate = benchmarks.large;
    }
    
    const gap = targetRate - currentEngagement;
    const improvementPotential = gap > 0 ? gap : 0;
    
    // Generate specific recommendations
    const recommendations = [];
    
    if (currentEngagement < targetRate * 0.5) {
      recommendations.push('🎮 Enable chat commands/games to boost interaction');
      recommendations.push('❓ Ask viewers questions directly - engagement triggers');
      recommendations.push('🎁 Implement channel point rewards for chat participation');
    } else if (currentEngagement < targetRate * 0.8) {
      recommendations.push('💬 Respond to more chat messages personally');
      recommendations.push('📊 Run polls during stream to involve viewers');
    } else {
      recommendations.push('✨ Excellent engagement - maintain current strategies');
      recommendations.push('🔥 Consider hosting community events');
    }
    
    return {
      targetRate: targetRate.toFixed(1) + '%',
      improvementPotential: improvementPotential.toFixed(1) + '%',
      recommendations
    };
  }
  
  // ===== REVENUE FORECASTING =====
  
  forecastRevenue(streamerId, twitchData, growthAnalysis) {
    const avgViewers = twitchData.viewerMetrics.average;
    const engagementRate = parseFloat(twitchData.chatMetrics.engagementRate);
    
    // Revenue estimation formulas (industry averages)
    // Assumptions: $2-5 CPM for ads, 2-5% sub rate, $5 avg sub value
    
    const adRevenue = (avgViewers * 30 * 60) / 1000 * 3; // 30 streams/mo, 60min avg, $3 CPM
    const estimatedSubRate = Math.min(engagementRate / 3, 5); // Engagement correlates to subs
    const subRevenue = (avgViewers * (estimatedSubRate / 100) * 5); // $5 avg sub
    
    const estimatedMonthly = Math.round(adRevenue + subRevenue);
    
    // Potential revenue if they hit engagement/growth targets
    const potentialViewers = growthAnalysis.forecast30d || avgViewers * 1.2;
    const potentialEngagement = Math.min(engagementRate * 1.5, 15);
    const potentialSubRate = Math.min(potentialEngagement / 3, 8);
    
    const potentialAdRevenue = (potentialViewers * 30 * 60) / 1000 * 3;
    const potentialSubRevenue = (potentialViewers * (potentialSubRate / 100) * 5);
    const potentialMonthly = Math.round(potentialAdRevenue + potentialSubRevenue);
    
    const gap = potentialMonthly - estimatedMonthly;
    
    // Strategies to close the gap
    const strategies = [];
    
    if (gap > 100) {
      strategies.push('📈 Focus on viewer growth - each +10 viewers = +$30/mo');
      strategies.push('💬 Increase engagement to boost sub rate');
      strategies.push('⏰ Stream consistently at peak hours');
      strategies.push('🎯 Optimize stream titles/tags for discoverability');
    }
    
    return {
      estimated: `$${estimatedMonthly}/month`,
      potential: `$${potentialMonthly}/month`,
      gap: `$${gap}/month opportunity`,
      strategies
    };
  }
  
  // ===== COMPETITIVE POSITIONING =====
  
  calculateMarketPosition(twitchData) {
    const avgViewers = twitchData.viewerMetrics.average;
    const engagement = parseFloat(twitchData.chatMetrics.engagementRate);
    const retention = parseFloat(twitchData.viewerMetrics.retention);
    
    // Twitch percentiles (approximate, based on 2024 data)
    // 90th percentile: 100+ avg viewers
    // 75th percentile: 20+ avg viewers
    // 50th percentile: 5+ avg viewers
    // 25th percentile: 1-2 avg viewers
    
    let percentile;
    if (avgViewers >= 100) percentile = 90;
    else if (avgViewers >= 20) percentile = 75;
    else if (avgViewers >= 5) percentile = 50;
    else percentile = 25;
    
    // Compare to category average (simplified - would use real API data)
    const categoryAverage = 15; // Placeholder
    const vsAverage = avgViewers >= categoryAverage ? 'Above' : 'Below';
    
    // Identify strengths
    const strengths = [];
    const weaknesses = [];
    
    if (engagement > 10) {
      strengths.push('Strong chat engagement');
    } else if (engagement < 3) {
      weaknesses.push('Low chat engagement');
    }
    
    if (retention > 110) {
      strengths.push('Excellent viewer retention');
    } else if (retention < 90) {
      weaknesses.push('Viewer retention needs improvement');
    }
    
    if (avgViewers > categoryAverage) {
      strengths.push('Above-average viewership');
    }
    
    return {
      percentile: `Top ${100 - percentile}%`,
      vsAverage,
      strengths,
      weaknesses: weaknesses.length > 0 ? weaknesses : ['None identified']
    };
  }
  
  // ===== CONTENT STRATEGY =====
  
  generateContentStrategy(twitchData, growthAnalysis) {
    // In production, this would use historical stream data and ML
    // For now, provide sensible defaults
    
    return {
      timing: [
        '⏰ Weekdays: 6-10 PM local time (peak gaming hours)',
        '📅 Weekends: Afternoons 2-6 PM (longer sessions possible)',
        '🎯 Consistency > Perfect timing - pick a schedule and stick to it'
      ],
      
      games: [
        '🔥 Current trending games in your category',
        '🎮 Mix popular titles (discovery) with niche games (loyal community)',
        '🆕 New releases = high search volume = discovery opportunity'
      ],
      
      titles: [
        '✍️ Use specific keywords: "[GAME] [CHALLENGE/GOAL]" performs best',
        '🎯 Avoid clickbait - descriptive titles build trust',
        '💡 Include skill level: "Learning [GAME]" or "[GAME] Expert Gameplay"'
      ],
      
      collabs: [
        '🤝 Network with streamers at similar viewer count (cross-promotion)',
        '🎪 Participate in community events/tournaments',
        '📢 Host other streamers when going offline (builds relationships)'
      ]
    };
  }
  
  // ===== UTILITY METHODS =====
  
  average(numbers) {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }
  
  calculateVariance(numbers) {
    const avg = this.average(numbers);
    const squareDiffs = numbers.map(n => Math.pow(n - avg, 2));
    return Math.sqrt(this.average(squareDiffs));
  }
  
  // ===== BULK ANALYTICS =====
  
  generateDashboard(allStreamersData) {
    const totalStreamers = allStreamersData.length;
    const freeTier = allStreamersData.filter(s => s.tier === 'free').length;
    const proTier = allStreamersData.filter(s => s.tier === 'pro').length;
    
    const totalViewers = allStreamersData.reduce((sum, s) => sum + s.viewerMetrics.average, 0);
    const avgViewersPerStreamer = totalStreamers > 0 ? Math.round(totalViewers / totalStreamers) : 0;
    
    const highPerformers = allStreamersData.filter(s => s.revenueOpportunity.score >= 75);
    
    return {
      overview: {
        totalStreamers,
        freeTier,
        proTier,
        conversionRate: totalStreamers > 0 ? ((proTier / totalStreamers) * 100).toFixed(1) + '%' : '0%'
      },
      
      aggregate: {
        totalViewers,
        avgViewersPerStreamer,
        highPerformers: highPerformers.length
      },
      
      revenue: {
        monthlyRecurring: `$${proTier * 10}`,
        potentialRevenue: `$${totalStreamers * 10}`,
        conversionOpportunity: `$${(totalStreamers - proTier) * 10}`
      },
      
      topPerformers: highPerformers.slice(0, 5).map(s => ({
        name: s.streamer,
        score: s.revenueOpportunity.score,
        tier: s.tier
      }))
    };
  }
}

module.exports = AnalyticsEngine;
