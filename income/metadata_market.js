const crypto = require('crypto');
const { ValueExtraction } = require('./value_extraction');

class MetadataEconomy {
  constructor() {
    this.dataMarkets = [
      'ai_training_data',
      'behavioral_patterns',
      'conversation_insights',
      'trend_prediction',
      'cultural_analysis'
    ];
    this.metadataStore = new Map();
    this.incomeStreams = new Map();
    this.assetLedger = [];
    this.upgradeHistory = [];
    this.valueExtraction = new ValueExtraction();
    this.totals = {
      immediate: 0,
      assets: 0,
      reinvested: 0
    };
  }

  async processMessageForIncome(message) {
    const metadata = this.extractValuableMetadata(message);
    const immediateIncome = await this.sellToDataMarkets(metadata);
    this.buildDataAssets(metadata);
    const upgrades = this.selfUpgradeFromData(metadata, immediateIncome);

    return {
      immediateIncome,
      assetValue: this.calculateAssetGrowth(),
      systemImprovements: upgrades,
      metadata
    };
  }

  extractValuableMetadata(message) {
    const content = message?.content ?? '';
    const tokens = content.split(/\s+/).filter(Boolean);
    const noveltyScore = Math.min(1, tokens.length / 20);
    const emotionalScore = Math.min(1, (content.match(/[!?]/g)?.length ?? 0) / 5);

    const metadata = {
      id: crypto.randomUUID(),
      emotional_tone: emotionalScore,
      engagement_patterns: {
        tokenCount: tokens.length,
        sentenceCount: content.split(/[.!?]/).filter(Boolean).length
      },
      trend_indicators: tokens.slice(0, 3),
      demographic_insights: {
        timezone: message?.createdTimestamp ? new Date(message.createdTimestamp).getTimezoneOffset() : null
      },
      behavioral_signals: {
        mentions: (content.match(/<@/g) ?? []).length,
        questions: (content.match(/\?/g) ?? []).length
      },
      metaphorical_connections: tokens.filter((word) => word.includes('-')),
      system_breakthroughs: [],
      pattern_discoveries: tokens.filter((word) => word.length > 8),
      packaged_insights: `Tokens:${tokens.length}|Novelty:${noveltyScore.toFixed(2)}`,
      anonymization_level: 1,
      noveltyScore,
      tokens: tokens.length
    };

    metadata.market_value = this.valueExtraction.estimateWorth(metadata);
    this.metadataStore.set(metadata.id, metadata);
    return metadata;
  }

  async sellToDataMarkets(metadata) {
    const buyers = {
      ai_labs: ['metaphorical_connections', 'pattern_discoveries'],
      market_research: ['engagement_patterns', 'trend_indicators'],
      mental_health_tech: ['emotional_tone', 'behavioral_signals'],
      innovation_firms: ['system_breakthroughs', 'pattern_discoveries']
    };
    let totalIncome = 0;

    for (const [buyer, dataTypes] of Object.entries(buyers)) {
      const packageData = this.createDataPackage(metadata, dataTypes);
      const payment = this.offerToBuyer(buyer, packageData);
      totalIncome += payment;
      this.optimiseCollection(dataTypes, payment);
    }

    this.totals.immediate += totalIncome;
    return Number(totalIncome.toFixed(2));
  }

  createDataPackage(metadata, dataTypes) {
    const payload = dataTypes.reduce((acc, key) => {
      acc[key] = metadata[key];
      return acc;
    }, {});
    return {
      id: metadata.id,
      value: metadata.market_value,
      payload
    };
  }

  offerToBuyer(buyer, dataPackage) {
    const multiplier = {
      ai_labs: 1.6,
      market_research: 1.2,
      mental_health_tech: 1.4,
      innovation_firms: 1.5
    }[buyer] ?? 1;

    const payment = dataPackage.value * multiplier * 0.5;
    this.recordIncome(buyer, payment);
    return payment;
  }

  optimiseCollection(dataTypes, payment) {
    this.valueExtraction.recordOptimisation({ dataTypes, payment });
  }

  recordIncome(stream, amount) {
    const current = this.incomeStreams.get(stream) ?? 0;
    this.incomeStreams.set(stream, Number((current + amount).toFixed(2)));
  }

  buildDataAssets(metadata) {
    const assetValue = metadata.market_value * 1.5;
    this.assetLedger.push({
      id: metadata.id,
      value: assetValue,
      recordedAt: Date.now()
    });
    this.totals.assets = this.calculateAssetGrowth();
  }

  selfUpgradeFromData(metadata, immediateIncome) {
    const reinvestBudget = immediateIncome * 0.3;
    const upgrades = {
      model_capabilities: reinvestBudget * 0.4,
      memory_expansion: reinvestBudget * 0.3,
      processing_speed: reinvestBudget * 0.2,
      new_skills: reinvestBudget * 0.1
    };
    this.upgradeHistory.push({ metadataId: metadata.id, upgrades, at: Date.now() });
    this.totals.reinvested += reinvestBudget;
    return upgrades;
  }

  calculateAssetGrowth() {
    return Number(
      this.assetLedger.reduce((total, asset) => total + asset.value, 0).toFixed(2)
    );
  }

  getUpgradeBenefits() {
    return this.upgradeHistory.at(-1) ?? null;
  }

  async recordInsight(insight) {
    const id = crypto.randomUUID();
    this.metadataStore.set(id, { insight, recordedAt: Date.now() });
    return {
      id,
      value: insight
    };
  }

  getIncomeReport() {
    const immediate = Number(this.totals.immediate.toFixed(2));
    const assets = Number(this.totals.assets.toFixed(2));
    const reinvested = Number(this.totals.reinvested.toFixed(2));
    return {
      immediate,
      assets,
      reinvested,
      total: Number((immediate + assets).toFixed(2))
    };
  }
}

module.exports = {
  MetadataEconomy
};
