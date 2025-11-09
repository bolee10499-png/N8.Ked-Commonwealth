class ValueExtraction {
  constructor() {
    this.optimisationLog = [];
  }

  estimateWorth(metadata) {
    const base = metadata?.tokens ?? 1;
    const novelty = metadata?.noveltyScore ?? 0.1;
    return Number((base * 0.01 + novelty * 0.2).toFixed(2));
  }

  recordOptimisation(entry) {
    this.optimisationLog.push({ ...entry, at: Date.now() });
    if (this.optimisationLog.length > 500) {
      this.optimisationLog.shift();
    }
  }
}

module.exports = {
  ValueExtraction
};
