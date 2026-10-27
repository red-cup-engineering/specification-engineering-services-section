// Source-cut and cross-stage regressions against the incumbent Engineering
// Design reader. These are synthetic, expressly unadmitted source fixtures;
// passing tests do NOT qualify architecture, Proof, fabrication or an Office.
import test from 'node:test';
import assert from 'node:assert/strict';
import { sourcesFixture } from './engineering-design-source-cut.fixture.mjs';
import { planEngineeringDesign, receiveEngineeringDesign } from '../src/engineering-design.mjs';

const copy = value => structuredClone(value);

function hldFixture() {
  const component = id => ({
    id, owner: 'fixture-data-owner', layer: 'data',
    responsibility: 'Retain ' + id, dependencyIds: [],
    providedPorts: [], requiredPorts: [],
  });
  return {
    components: [component('comp-a'), component('comp-b')],
    connections: [],
    traceability: [
      { requirementCellId: 'source-req:a', specificationClauseIds: ['clause-a'],
        architectureModelIds: ['model-a'], designElementIds: ['comp-a'] },
      { requirementCellId: 'source-req:b', specificationClauseIds: ['clause-b'],
        architectureModelIds: ['model-b'], designElementIds: ['comp-b'] },
    ],
    openQuestions: [],
  };
}

function lldFixture() {
  const operation = (id, componentId) => ({
    id, componentId, module: 'src/' + id + '.mjs',
    exportName: id === 'op-a' ? 'retainA' : 'retainB',
    inputSchemaJson: '{}', outputSchemaJson: '{}',
    behavior: 'Retain original source ' + id,
    preconditions: [], postconditions: ['Value retained'],
    failureCases: ['Source unavailable'],
    resourceBounds: ['No unbounded allocations'],
    effectBoundaries: ['Pure candidate'],
    acceptanceObligations: ['Independent proof required'],
  });
  return {
    operations: [operation('op-a', 'comp-a'), operation('op-b', 'comp-b')],
    traceability: [
      { requirementCellId: 'source-req:a', specificationClauseIds: ['clause-a'],
        architectureModelIds: ['model-a'], designElementIds: ['op-a'] },
      { requirementCellId: 'source-req:b', specificationClauseIds: ['clause-b'],
        architectureModelIds: ['model-b'], designElementIds: ['op-b'] },
    ],
    openQuestions: [],
  };
}

function hldReceipt(sources) {
  const plan = planEngineeringDesign({ stage: 'high-level', sources });
  const received = receiveEngineeringDesign({ stage: 'high-level', sources, plan,
    deliveryText: JSON.stringify(hldFixture()) });
  assert.equal(received.type, 'EngineeringDesignCandidate');
  assert.equal(received.admitted, false);
  assert.equal(received.proof, 'unreceived');
  return received;
}

test('accept exact independently source-traced HLD and LLD as unadmitted candidates', () => {
  const sources = sourcesFixture();
  const highLevel = hldReceipt(sources);
  const lowSources = [...sources, { kind: 'high-level', text: JSON.stringify(highLevel) }];
  const plan = planEngineeringDesign({ stage: 'low-level', sources: lowSources });
  const received = receiveEngineeringDesign({ stage: 'low-level', sources: lowSources, plan,
    deliveryText: JSON.stringify(lldFixture()) });
  assert.equal(received.type, 'EngineeringDesignCandidate');
  assert.equal(received.admitted, false);
  assert.equal(received.proof, 'unreceived');
});

test('refuse Architecture candidate with stale original Requirement revision', () => {
  const sources = sourcesFixture();
  const architecture = JSON.parse(sources[2].text);
  architecture.sources[0].revision = 'ni:///sha-256;stale-requirement';
  sources[2].text = JSON.stringify(architecture);
  assert.throws(() => planEngineeringDesign({ stage: 'high-level', sources }), TypeError);
});

test('refuse Architecture candidate with untraced original customer condition', () => {
  const sources = sourcesFixture();
  const architecture = JSON.parse(sources[2].text);
  delete architecture.concerns[1].requirementCellIds;
  delete architecture.concerns[1].specificationClauseIds;
  sources[2].text = JSON.stringify(architecture);
  assert.throws(() => planEngineeringDesign({ stage: 'high-level', sources }), TypeError);
});

test('refuse HLD cross-cell model substitution even when model ID exists', () => {
  const sources = sourcesFixture();
  const plan = planEngineeringDesign({ stage: 'high-level', sources });
  const design = hldFixture();
  design.traceability[0].architectureModelIds = ['model-b'];
  assert.deepEqual(receiveEngineeringDesign({ stage: 'high-level', sources, plan,
    deliveryText: JSON.stringify(design) }), {
    type: 'EngineeringDesignDerivationRefusal', reason: 'invalid-design',
  });
});

test('refuse LLD model revision that disagrees with its exact upstream HLD', () => {
  const sources = sourcesFixture();
  const highLevel = hldReceipt(sources);
  const lowSources = [...sources, { kind: 'high-level', text: JSON.stringify(highLevel) }];
  const plan = planEngineeringDesign({ stage: 'low-level', sources: lowSources });
  const design = lldFixture();
  // Both model-a and model-a-alt genuinely cover cell A in the source.
  // A different choice nevertheless requires a new HLD source revision.
  design.traceability[0].architectureModelIds = ['model-a-alt'];
  assert.deepEqual(receiveEngineeringDesign({ stage: 'low-level', sources: lowSources,
    plan, deliveryText: JSON.stringify(design) }), {
    type: 'EngineeringDesignDerivationRefusal', reason: 'invalid-design',
  });
});

test('same stage and source content yields the exact same plan without effect', () => {
  const sources = sourcesFixture();
  const first = planEngineeringDesign({ stage: 'high-level', sources });
  assert.deepEqual(planEngineeringDesign({ stage: 'high-level', sources: copy(sources) }), first);
});
