/**
 * SUBSCRIPTION MODEL - The Revenue Engine
 * 
 * Step 13: Enterprise-grade tiered pricing that converts data into dollars
 * 
 * Philosophy:
 * Free tier = marketing (shows value)
 * Starter tier = individual streamers ($49/mo)
 * Professional tier = growing brands ($199/mo)
 * Enterprise tier = white-label partners ($999/mo)
 * 
 * Target Economics:
 * - 100 streamers @ $49/mo = $4,900/month
 * - 50 professionals @ $199/mo = $9,950/month
 * - 5 enterprises @ $999/mo = $4,995/month
 * Total: ~$20,000/month at modest scale
 * 
 * Revenue Allocation:
 * - 30% Infrastructure (servers, APIs, databases)
 * - 70% Development (features, support, growth)
 */

const path = require('path');
const { db, statements } = require('../database/db_service.js');

class SubscriptionModel {
  constructor() {
    this.dataPath = path.join(__dirname, '../subscription_data.json'); // Legacy compatibility
    
    // Enterprise-grade subscription tiers with feature gates
    this.tiers = {
      free: {
        name: 'Free',
        price: 0,
        features: [
          'Basic stream stats (current viewers, peak, average)',
          'Simple chat metrics',
          'Overall sentiment analysis',
          'Limited to 7 days of historical data',
          'Single platform support'
        ],
        limits: {
          historicalDays: 7,
          reportsPerDay: 5,
          refreshInterval: 600000, // 10 minutes
          platforms: 1,
          automationHours: 0,
          whiteLabel: false
        }
      },
      
      starter: {
        name: 'Starter',
        price: 49, // USD per month
        features: [
          '✨ Everything in Free, plus:',
          '📈 Growth trajectory analysis with 90-day forecasting',
          '🎯 Automated content suggestions based on viewer behavior',
          '⚡ Real-time alerts for significant events',
          '📊 30 days of historical data',
          '🌐 2 platform integrations (Discord + Twitch)',
          '💎 Dust economy participation',
          '🏆 NFT marketplace access'
        ],
        limits: {
          historicalDays: 30,
          reportsPerDay: 50,
          refreshInterval: 60000, // 1 minute
          platforms: 2,
          automationHours: 10, // 10 hours of automated content/month
          whiteLabel: false
        }
      },
      
      professional: {
        name: 'Professional',
        price: 199, // USD per month
        features: [
          '✨ Everything in Starter, plus:',
          '🚀 Unlimited historical data (lifetime retention)',
          '🌍 Multi-platform analytics (YouTube, Twitter, Reddit)',
          '🤖 24 hours of automated content creation per month',
          '💰 Royalty fission reactor (compounding revenue)',
          '🏛️ Community treasury voting rights',
          '📱 Priority API access',
          '🔔 Custom alert thresholds and webhooks',
          '📧 Email reports and weekly insights'
        ],
        limits: {
          historicalDays: Infinity,
          reportsPerDay: Infinity,
          refreshInterval: 10000, // 10 seconds
          platforms: 5,
          automationHours: 24,
          whiteLabel: false
        }
      },
      
      enterprise: {
        name: 'Enterprise',
        price: 999, // USD per month
        features: [
          '✨ Everything in Professional, plus:',
          '🏢 White-label licensing (5-15% revenue share)',
          '⚙️ Custom branding and domain',
          '🔧 Dedicated support and onboarding',
          '📊 Advanced analytics API access',
          '🤝 Revenue sharing on referred users',
          '🎨 Unlimited automated content creation',
          '👥 Multi-user team access',
          '🔒 Enterprise-grade SLA (99.9% uptime)',
          '🌐 Unlimited platform integrations',
          '💼 Custom feature development'
        ],
        limits: {
          historicalDays: Infinity,
          reportsPerDay: Infinity,
          refreshInterval: 1000, // 1 second real-time
          platforms: Infinity,
          automationHours: Infinity,
          whiteLabel: true,
          revenueShare: { min: 0.05, max: 0.15 }, // 5-15% of partner revenue
          customFeatures: true
        }
      }
    };
    
    // Subscription database
    this.subscriptions = new Map(); // discordUserId -> subscription object
    this.streamerAccounts = new Map(); // twitchStreamerId -> discordUserId
    
    // Revenue tracking
    this.revenue = {
      monthly: 0,
      total: 0,
      transactions: []
    };
    
    this.loadData();
    this.initializeRevenueTracking();
  }
  
  // ===== DATA PERSISTENCE =====
  
  loadData() {
    try {
      // Load from SQLite instead of JSON
      const subscriptions = db.prepare('SELECT * FROM subscriptions').all();
      
      this.subscriptions.clear();
      this.streamerAccounts.clear();
      
      for (const sub of subscriptions) {
        // Restore subscription object
        this.subscriptions.set(sub.discord_user_id, {
          discordUserId: sub.discord_user_id,
          tier: sub.tier,
          price: sub.price,
          linkedStreamers: JSON.parse(sub.linked_streamers || '[]'),
          nextBillingDate: sub.next_billing_date,
          subscriptionStartedAt: sub.subscription_started_at,
          lastPaymentAt: sub.last_payment_at,
          totalPaid: sub.total_paid,
          status: sub.status
        });
        
        // Map streamer accounts (reverse lookup)
        const streamers = JSON.parse(sub.linked_streamers || '[]');
        for (const streamerId of streamers) {
          this.streamerAccounts.set(streamerId, sub.discord_user_id);
        }
      }
      
      console.log(`[SUBSCRIPTIONS] Loaded ${this.subscriptions.size} subscriptions from SQLite`);
    } catch (error) {
      console.error('[SUBSCRIPTIONS] Load error:', error.message);
    }
  }
  
  saveData() {
    try {
      // Save all subscriptions to SQLite
      for (const [userId, sub] of this.subscriptions.entries()) {
        statements.upsertSubscription.run(
          userId,
          sub.tier || 'FREE',
          sub.price || 0,
          JSON.stringify(sub.linkedStreamers || []),
          sub.nextBillingDate || null
        );
      }
    } catch (error) {
      console.error('[SUBSCRIPTIONS] Save error:', error.message);
    }
  }
  
  // ===== STREAMER ONBOARDING =====
  
  linkStreamerAccount(discordUserId, twitchStreamerId, twitchUsername) {
    // Check if already linked
    if (this.streamerAccounts.has(twitchStreamerId)) {
      const existingUserId = this.streamerAccounts.get(twitchStreamerId);
      if (existingUserId !== discordUserId) {
        return {
          success: false,
          message: `Twitch account ${twitchUsername} is already linked to another Discord account`
        };
      }
    }
    
    // Create free tier subscription by default
    if (!this.subscriptions.has(discordUserId)) {
      this.subscriptions.set(discordUserId, {
        discordUserId,
        tier: 'free',
        linkedStreamers: [],
        subscribedAt: Date.now(),
        lastPayment: null,
        nextBillingDate: null
      });
    }
    
    // Link streamer
    const subscription = this.subscriptions.get(discordUserId);
    
    if (!subscription.linkedStreamers) {
      subscription.linkedStreamers = [];
    }
    
    const existingLink = subscription.linkedStreamers.find(s => s.twitchStreamerId === twitchStreamerId);
    
    if (!existingLink) {
      subscription.linkedStreamers.push({
        twitchStreamerId,
        twitchUsername,
        linkedAt: Date.now()
      });
    }
    
    this.streamerAccounts.set(twitchStreamerId, discordUserId);
    this.saveData();
    
    console.log(`[SUBSCRIPTIONS] ✅ Linked ${twitchUsername} to Discord user ${discordUserId}`);
    
    return {
      success: true,
      message: `Successfully linked Twitch account: ${twitchUsername}`,
      tier: subscription.tier,
      upgradePrompt: subscription.tier === 'free' ? 'Upgrade to Pro for advanced analytics!' : null
    };
  }
  
  // ===== SUBSCRIPTION MANAGEMENT =====
  
  subscribe(discordUserId, tier, paymentMethod = 'stripe') {
    if (!this.tiers[tier]) {
      return {
        success: false,
        message: `Invalid tier: ${tier}. Available: free, starter, professional, enterprise`
      };
    }
    
    const tierConfig = this.tiers[tier];
    
    // Get or create subscription
    let subscription = this.subscriptions.get(discordUserId);
    
    if (!subscription) {
      subscription = {
        discordUserId,
        tier: 'free',
        linkedStreamers: [],
        subscribedAt: Date.now(),
        lastPayment: null,
        nextBillingDate: null
      };
      this.subscriptions.set(discordUserId, subscription);
    }
    
    // Handle free tier
    if (tier === 'free') {
      subscription.tier = 'free';
      subscription.lastPayment = null;
      subscription.nextBillingDate = null;
      this.saveData();
      
      return {
        success: true,
        message: 'Downgraded to Free tier',
        tier: 'free'
      };
    }
    
    // Handle paid tier (Pro)
    const previousTier = subscription.tier;
    subscription.tier = tier;
    subscription.lastPayment = Date.now();
    subscription.nextBillingDate = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days
    subscription.paymentMethod = paymentMethod;
    
    // Record transaction
    this.recordTransaction(discordUserId, tierConfig.price, tier);
    
    this.saveData();
    
    console.log(`[SUBSCRIPTIONS] 💰 User ${discordUserId} subscribed to ${tier.toUpperCase()} ($${tierConfig.price}/mo)`);
    
    return {
      success: true,
      message: `Successfully subscribed to ${tierConfig.name} tier!`,
      tier: tier,
      price: `$${tierConfig.price}/month`,
      nextBilling: new Date(subscription.nextBillingDate).toLocaleDateString(),
      upgrade: previousTier === 'free',
      features: tierConfig.features
    };
  }
  
  cancelSubscription(discordUserId) {
    const subscription = this.subscriptions.get(discordUserId);
    
    if (!subscription) {
      return {
        success: false,
        message: 'No subscription found'
      };
    }
    
    if (subscription.tier === 'free') {
      return {
        success: false,
        message: 'Already on free tier'
      };
    }
    
    const previousTier = subscription.tier;
    subscription.tier = 'free';
    subscription.lastPayment = null;
    subscription.nextBillingDate = null;
    
    this.saveData();
    
    console.log(`[SUBSCRIPTIONS] 📉 User ${discordUserId} downgraded from ${previousTier.toUpperCase()} to FREE`);
    
    return {
      success: true,
      message: `Downgraded to Free tier. Your ${previousTier} features will remain active until the next billing date.`,
      tier: 'free'
    };
  }
  
  // ===== FEATURE GATING =====
  
  canAccessFeature(discordUserId, feature) {
    const subscription = this.subscriptions.get(discordUserId);
    
    if (!subscription) {
      // No subscription = free tier
      return { 
        allowed: this.tiers.free.features.includes(feature),
        tier: 'free'
      };
    }
    
    const tierConfig = this.tiers[subscription.tier];
    
    return {
      allowed: tierConfig.features.includes(feature),
      tier: subscription.tier
    };
  }
  
  checkLimits(discordUserId, limitType) {
    const subscription = this.subscriptions.get(discordUserId);
    const tier = subscription ? subscription.tier : 'free';
    const limits = this.tiers[tier].limits;
    
    return {
      tier,
      limit: limits[limitType],
      unlimited: limits[limitType] === Infinity
    };
  }
  
  // ===== REVENUE TRACKING =====
  
  recordTransaction(discordUserId, amount, tier) {
    const transaction = {
      discordUserId,
      amount,
      tier,
      timestamp: Date.now(),
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    this.revenue.transactions.push(transaction);
    this.revenue.total += amount;
    
    // Update monthly revenue (simple approach - in production, use proper accounting)
    this.revenue.monthly += amount;
  }
  
  initializeRevenueTracking() {
    // Reset monthly revenue on first of month
    setInterval(() => {
      const now = new Date();
      if (now.getDate() === 1 && now.getHours() === 0) {
        console.log(`[SUBSCRIPTIONS] 📊 Monthly revenue: $${this.revenue.monthly}`);
        this.revenue.monthly = 0;
        this.saveData();
      }
    }, 60 * 60 * 1000); // Check hourly
  }
  
  getRevenueReport() {
    const activeSubscribers = Array.from(this.subscriptions.values())
      .filter(sub => sub.tier === 'pro');
    
    const monthlyRecurring = activeSubscribers.length * this.tiers.pro.price;
    const totalSubscribers = this.subscriptions.size;
    const conversionRate = totalSubscribers > 0 
      ? ((activeSubscribers.length / totalSubscribers) * 100).toFixed(1)
      : '0';
    
    return {
      subscribers: {
        total: totalSubscribers,
        free: totalSubscribers - activeSubscribers.length,
        pro: activeSubscribers.length,
        conversionRate: conversionRate + '%'
      },
      
      revenue: {
        monthlyRecurring: `$${monthlyRecurring}`,
        currentMonth: `$${this.revenue.monthly}`,
        allTime: `$${this.revenue.total}`,
        averagePerUser: totalSubscribers > 0 
          ? `$${(this.revenue.total / totalSubscribers).toFixed(2)}`
          : '$0'
      },
      
      projections: {
        annualRunRate: `$${monthlyRecurring * 12}`,
        potentialMonthly: `$${totalSubscribers * this.tiers.pro.price}`,
        conversionOpportunity: `$${(totalSubscribers - activeSubscribers.length) * this.tiers.pro.price}`
      },
      
      recentTransactions: this.revenue.transactions.slice(-10).reverse()
    };
  }
  
  // ===== USER DASHBOARD =====
  
  getSubscriptionInfo(discordUserId) {
    const subscription = this.subscriptions.get(discordUserId);
    
    if (!subscription) {
      return {
        tier: 'free',
        features: this.tiers.free.features,
        limits: this.tiers.free.limits,
        linkedStreamers: [],
        upgradeAvailable: true,
        upgradePrice: `$${this.tiers.pro.price}/month`
      };
    }
    
    const tierConfig = this.tiers[subscription.tier];
    
    return {
      tier: subscription.tier,
      features: tierConfig.features,
      limits: tierConfig.limits,
      linkedStreamers: subscription.linkedStreamers || [],
      subscribedAt: new Date(subscription.subscribedAt).toLocaleDateString(),
      nextBilling: subscription.nextBillingDate 
        ? new Date(subscription.nextBillingDate).toLocaleDateString()
        : null,
      upgradeAvailable: subscription.tier === 'free',
      upgradePrice: subscription.tier === 'free' ? `$${this.tiers.pro.price}/month` : null
    };
  }
  
  // ===== BILLING AUTOMATION =====
  
  processMonthlyBilling() {
    const now = Date.now();
    let processed = 0;
    let failed = 0;
    
    for (const [userId, subscription] of this.subscriptions) {
      if (subscription.tier === 'pro' && subscription.nextBillingDate && now >= subscription.nextBillingDate) {
        // In production, this would charge the payment method
        // For now, we simulate successful billing
        
        try {
          // Simulate payment processing
          this.recordTransaction(userId, this.tiers.pro.price, 'pro');
          subscription.lastPayment = now;
          subscription.nextBillingDate = now + (30 * 24 * 60 * 60 * 1000);
          processed++;
          
          console.log(`[SUBSCRIPTIONS] 💳 Billed user ${userId} for Pro tier ($${this.tiers.pro.price})`);
        } catch (error) {
          console.error(`[SUBSCRIPTIONS] ❌ Billing failed for user ${userId}:`, error.message);
          
          // Downgrade to free on failed payment
          subscription.tier = 'free';
          subscription.lastPayment = null;
          subscription.nextBillingDate = null;
          failed++;
        }
      }
    }
    
    if (processed > 0 || failed > 0) {
      this.saveData();
      console.log(`[SUBSCRIPTIONS] 📊 Billing complete: ${processed} successful, ${failed} failed`);
    }
    
    return { processed, failed };
  }
  
  // Initialize daily billing check
  initializeBillingAutomation() {
    // Check for billing daily at midnight
    setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() < 5) {
        this.processMonthlyBilling();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }
}

module.exports = SubscriptionModel;
