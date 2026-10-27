// Source-cut and cross-stage regressions against the incumbent Engineering
// Design reader. These are synthetic, expressly unadmitted source fixtures;
// passing tests do NOT qualify architecture, Proof, fabrication or an Office.
import test from 'node:test';
import assert from 'node:assert/strict';
import { artifactId } from '@red-cup-engineering/semiotic-eavt-services-section/identity';
import { planEngineeringDesign, receiveEngineeringDesign } from '../src/engineering-design.mjs';

const copy = value => structuredClone(value);

function sourcesFixture() {
  const requirement = {
    kind: 'requirement', id: 'source-req', 'met-when': [
      { cell: 'source-req:a', target: 'held', says: 'Retain A.' },
      { cell: 'source-req:b', target: 'held', says: 'Retain B.' },
    ],
  };
  const requirementRevision = artifactId(requirement);
  const reference = cell =>
    'Original Requirement source-req (' + requirementRevision + '), cell source-req:' + cell;
  const specification = {
    identity: { id: 'source-spec' },
    provenance: { derivedFrom: ['source-req@' + requirementRevision] },
    topics: [{ clauses: [
      { id: 'clause-a', backedBy: [reference('a')] },
      { id: 'clause-b', backedBy: [reference('b')] },
    ] }],
  };
  const sourceIds = ['requirement', 'specification'];
  const architecture = {
    type: 'ArchitectureDescriptionCandidate',
    version: 1,
    identity: { id: 'source-arch', title: 'Synthetic original design',
      revision: 'unadmitted-fixture-v1', owner: 'source-owner', status: 'candidate' },
    standard: { designation: 'ISO/IEC/IEEE 42010', edition: '2022',
      applicability: 'Synthetic source-format fixture only', conformance: 'unassessed' },
    system: { name: 'Source fixture', description: 'Two separate requirements',
      sourceIds },
    upstream: { requirementsSourceId: 'requirement',
      specificationSourceId: 'specification' },
    sources: [
      { id: 'requirement', locator: 'fixture:requirement',
        revision: requirementRevision },
      { id: 'specification', locator: 'fixture:specification',
        revision: artifactId(specification) },
    ],
    stakeholders: [{ id: 'buyer', name: 'Fixture buyer',
      concernIds: ['concern-a', 'concern-b'] }],
    concerns: [
      { id: 'concern-a', statement: 'Retain A.', sourceIds,
        requirementCellIds: ['source-req:a'], specificationClauseIds: ['clause-a'] },
      { id: 'concern-b', statement: 'Retain B.', sourceIds,
        requirementCellIds: ['source-req:b'], specificationClauseIds: ['clause-b'] },
    ],
    viewpoints: [{ id: 'functional', name: 'Functional',
      concernIds: ['concern-a', 'concern-b'], modelKinds: ['component'],
      method: 'Synthetic attributed fixture' }],
    views: [{ id: 'functional-view', name: 'Functional view',
      viewpointId: 'functional', modelIds: ['model-a', 'model-a-alt', 'model-b'],
      sourceIds }],
    models: [
      { id: 'model-a', kind: 'component', content: 'Component for A.',
        concernIds: ['concern-a'], sourceIds },
      { id: 'model-a-alt', kind: 'component', content: 'Alternative model for A.',
        concernIds: ['concern-a'], sourceIds },
      { id: 'model-b', kind: 'component', content: 'Component for B.',
        concernIds: ['concern-b'], sourceIds },
    ],
    correspondences: [],
    decisions: [{ id: 'choice', statement: 'Model each separate cell.',
      rationale: 'Distinct requirement sources.', alternatives: ['Use one component.'],
      concernIds: ['concern-a', 'concern-b'], sourceIds }],
    openQuestions: [],
  };
  return [
    { kind: 'requirement', text: JSON.stringify(requirement) },
    { kind: 'specification', text: JSON.stringify(specification) },
    { kind: 'architecture', text: JSON.stringify(architecture) },
  ];
}

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
