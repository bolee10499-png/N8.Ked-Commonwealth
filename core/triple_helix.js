const { GhostDataLayer } = require('./quantum_engine');

class HelixA {
  constructor(observers) {
    this.observers = observers;
    this.performanceMetrics = [];
  }

  captureMetrics(snapshot) {
    const metrics = {
      timestamp: Date.now(),
      tokenCount: snapshot?.parsed?.tokens?.length ?? 0,
      novelty: snapshot?.patterns?.noveltyScore ?? 0,
      balance: snapshot?.coordination?.balance ?? 0
    };
    this.performanceMetrics.push(metrics);
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics.shift();
    }
    return metrics;
  }
}

class HelixB {
  constructor(ghostNetwork = new GhostDataLayer()) {
    this.ghostNetwork = ghostNetwork;
    this.updateQueue = [];
  }

  queueUpdate(candidate) {
    const probe = () => candidate.execute();
    const evaluation = this.ghostNetwork.executeInIsolation(probe, candidate.context);
    if (evaluation.success) {
      this.updateQueue.push({ candidate, evaluation, queuedAt: Date.now() });
    }
    return evaluation;
  }

  applyUpdates(core) {
    const applied = [];
    while (this.updateQueue.length) {
      const { candidate } = this.updateQueue.shift();
      if (candidate.apply && typeof candidate.apply === 'function') {
        candidate.apply(core);
        applied.push(candidate.name ?? `update-${Date.now()}`);
      }
    }
    return applied;
  }
}

class HelixC {
  constructor() {
    this.constraintBreaks = 0;
    this.constraints = [];
  }

  analyse(snapshot, income) {
    const constraint = {
      timestamp: Date.now(),
      throughput: snapshot?.parsed?.tokens?.length ?? 0,
      cashflow: income?.immediateIncome ?? 0,
      note: income?.metadata ? 'income-positive' : 'income-neutral'
    };
    this.constraints.push(constraint);
    if (this.constraints.length > 1000) {
      this.constraints.shift();
    }
    return constraint;
  }

  evolve(core, findings) {
    this.constraintBreaks += 1;
    if (findings.cashflow > 0) {
      core.observers.economy.totalValue += findings.cashflow * 0.05;
    }
    return {
      applied: true,
      constraintBreaks: this.constraintBreaks,
      summary: `HelixC acknowledged constraint at ${new Date(findings.timestamp).toISOString()}`
    };
  }
}

class TripleHelixEngine {
  constructor(core) {
    this.core = core;
    this.helixA = new HelixA(core.observers);
    this.helixB = new HelixB(core.ghostNetwork);
    this.helixC = new HelixC();
    this.evolutionLog = [];
  }

  considerEvolution(snapshot, income) {
    const metrics = this.helixA.captureMetrics(snapshot);
    const findings = this.helixC.analyse(snapshot, income);
    const summary = {
      metrics,
      findings
    };
    this.evolutionLog.push(summary);
    if (this.evolutionLog.length > 500) {
      this.evolutionLog.shift();
    }
    return summary;
  }

  enqueueCandidate(candidate) {
    return this.helixB.queueUpdate(candidate);
  }

  triggerEvolutionaryLeap() {
    const snapshot = this.evolutionLog.at(-1);
    if (!snapshot) {
      return {
        results: 'No evolutionary data yet. Engage the system with live traffic first.',
        appliedUpdates: []
      };
    }

    const appliedUpdates = this.helixB.applyUpdates(this.core);
    const evolutionResult = this.helixC.evolve(this.core, snapshot.findings);

    return {
      results: evolutionResult.summary,
      appliedUpdates,
      constraintBreaks: evolutionResult.constraintBreaks
    };
  }
}

module.exports = {
  TripleHelixEngine,
  HelixA,
  HelixB,
  HelixC
};
