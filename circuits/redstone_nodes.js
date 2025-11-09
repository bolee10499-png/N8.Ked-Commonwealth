const { DataPipes } = require('./data_pipes');
const { ControlPanel } = require('./control_dials');
const { ResponseEngine } = require('../identity/response_engine');

class RedstoneComputationalLayer {
  constructor(core) {
    this.core = core;
    this.dataPipes = new DataPipes();
    this.controls = new ControlPanel();
    this.responseEngine = new ResponseEngine();
    this.circuits = this.buildPhysicalComputation();
  }

  buildPhysicalComputation() {
    return {
      input_node: {
        type: 'sensor',
        connections: ['pattern_matcher', 'memory_writer'],
        energy: 1,
        process: (data) => ({
          ...data,
          stage: 'input-primed'
        })
      },
      pattern_matcher: {
        type: 'processor',
        connections: ['metaphor_generator', 'income_trigger'],
        energy: 1,
        process: (data) => ({
          ...data,
          stage: 'pattern-ready'
        })
      },
      memory_writer: {
        type: 'storage',
        connections: ['response_engine'],
        energy: 1,
        process: (data) => {
          const key = data.patterns?.primaryKey ?? data.payload.authorId;
          this.core.memory.write(key, {
            value: {
              lastMessage: data.payload.content,
              lastResponseSeed: data.identitySeed
            },
            timestamp: Date.now()
          });
          return { ...data, stage: 'memory-recorded' };
        }
      },
      metaphor_generator: {
        type: 'transformer',
        connections: ['identity_formatter'],
        energy: 1,
        process: (data) => ({
          ...data,
          generatedMetaphors: this.generateMetaphors(data)
        })
      },
      income_trigger: {
        type: 'actuator',
        connections: ['economy_updater'],
        energy: 1,
        process: (data) => ({
          ...data,
          marketable: Array.isArray(data.generatedMetaphors) && data.generatedMetaphors.length > 0
        })
      },
      economy_updater: {
        type: 'actuator',
        connections: ['response_engine'],
        energy: 1,
        process: (data) => ({
          ...data,
          stage: 'economy-updated'
        })
      },
      identity_formatter: {
        type: 'formatter',
        connections: ['response_engine'],
        energy: 1,
        process: (data) => ({
          ...data,
          formattedIdentity: {
            ...data.identitySeed,
            metaphors: data.generatedMetaphors
          }
        })
      },
      response_engine: {
        type: 'actuator',
        connections: [],
        energy: 1,
        process: (data) => this.responseEngine.generate(data)
      }
    };
  }

  generateMetaphors(data) {
    if (!data.patterns?.metaphoricalHints?.length) {
      return [];
    }
    return data.patterns.metaphoricalHints.map((hint) => `${hint} as redstone spark`);
  }

  propagateEnergy(sourceNode, energyAmount, data) {
    const node = this.circuits[sourceNode];
    if (!node) {
      return data;
    }
    let currentData = node.process(data);
    node.connections.forEach((targetNode) => {
      const target = this.circuits[targetNode];
      if (target) {
        target.energy += energyAmount * 0.9;
        currentData = target.process(currentData);
      }
    });
    return currentData;
  }

  routeMessage(processedContext) {
    const dialValue = Math.min(1, processedContext.patterns?.noveltyScore ?? 0.5);
    this.controls.setDial('metaphor', dialValue);
    const pipelineReady = this.dataPipes.flow(processedContext, 'default');
    const finalState = this.propagateEnergy('input_node', 1, pipelineReady);
    return finalState.output ?? '...';
  }
}

module.exports = {
  RedstoneComputationalLayer
};
