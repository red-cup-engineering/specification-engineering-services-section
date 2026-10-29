// Independent, held-out source-cut and trace counterexamples for the native
// HLD/LLD bootstrap. These cases were not supplied to the v27 generator writer.
// No source permission, production result, or Proof follows from a passing test.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { semanticIdOf } from '@red-cup-engineering/computer-data-engineering-services-section/semiotic-expression-notation/semantic-content-identity';
import { planEngineeringDesign, receiveEngineeringDesign } from '../src/engineering-design.mjs';

const artifactId = semanticIdOf('metroplat.artifact');
const clone = value => JSON.parse(JSON.stringify(value));
const requirement = {
  id: 'source-architecture-assay', kind: 'requirement',
  'met-when': [
    { cell: 'source-architecture-assay:alpha', target: 'held', says: 'Maintain alpha.' },
    { cell: 'source-architecture-assay:beta', target: 'held', says: 'Maintain beta.' }
  ]
};
const requirementId = artifactId(requirement);
const backref = cell => 'Original Requirement ' + requirement.id +
  ' (' + requirementId + '), cell ' + cell;
const specification = {
  identity: { version: '0.1.0', stability: 'draft', status: 'requires-independent-source-admission',
    'date-created': '2026-10-27', id: 'source-architecture-assay-spec', title: 'Assay only',
    seat: 'Test source', carrier: 'Test carrier', authors: ['Independent assay'], profile: 'prose' },
  whatThisIs: 'An unadmitted, synthetic normative source for structural receiving.',
  topics: [{
    heading: 'Source conditions', body: '{{clause:clause-alpha}}\n\n{{clause:clause-beta}}',
    clauses: [
      { id: 'clause-alpha', keyword: 'MUST', actor: 'Data system',
        statement: 'Maintain alpha.', backedBy: [backref(requirement['met-when'][0].cell)] },
      { id: 'clause-beta', keyword: 'MUST', actor: 'Data system',
        statement: 'Maintain beta.', backedBy: [backref(requirement['met-when'][1].cell)] }
    ]
  }],
  implementations: [], openQuestions: [{question: 'Is the source adopted?',blockedBy:'Original owner'}],
  laws: [], standards: [],
  provenance: { derivedAt: '2026-10-27T00:00:00.000Z',
    derivedBy: 'Independent synthetic assay',
    derivedFrom: [requirement.id + '@' + requirementId] }
};
const specificationId = artifactId(specification);
const sourceIds = ['requirement', 'specification'];
const architecture = {
  type: 'ArchitectureDescriptionCandidate', version: 1,
  identity: { id: 'source-architecture-assay-arch', title: 'Assay architecture',
    revision: 'synthetic-v1', owner: 'Test owner', status: 'candidate' },
  standard: { designation: 'ISO/IEC/IEEE 42010', edition: '2022',
    applicability: 'Synthetic structural fixture', conformance: 'unassessed' },
  system: { name: 'Source mapping system', description: 'Two disjoint concerns.', sourceIds },
  upstream: { requirementsSourceId: 'requirement', specificationSourceId: 'specification' },
  sources: [
    { id: 'requirement', locator: 'fixture:requirement', revision: requirementId },
    { id: 'specification', locator: 'fixture:specification', revision: specificationId }
  ],
  stakeholders: [{ id: 'reader', name: 'Test reader', concernIds: ['concern-alpha','concern-beta'] }],
  concerns: [
    { id: 'concern-alpha', statement: 'Alpha only.', sourceIds,
      requirementCellIds: ['source-architecture-assay:alpha'], specificationClauseIds: ['clause-alpha'] },
    { id: 'concern-beta', statement: 'Beta only.', sourceIds,
      requirementCellIds: ['source-architecture-assay:beta'], specificationClauseIds: ['clause-beta'] }
  ],
  viewpoints: [{id:'functional',name:'Function',concernIds:['concern-alpha','concern-beta'],
    modelKinds:['component'],method:'Authored fixture mapping'}],
  views: [{ id:'functional-view',name:'Functional view',viewpointId:'functional',
    modelIds:['model-alpha','model-beta'], sourceIds }],
  models: [
    { id:'model-alpha',kind:'component',content:'Alpha only.',concernIds:['concern-alpha'],sourceIds },
    { id:'model-beta',kind:'component',content:'Beta only.',concernIds:['concern-beta'],sourceIds }
  ],
  correspondences: [],
  decisions: [{id:'decision',statement:'Keep concerns separate.',rationale:'Source trace.',
    alternatives:['Merge concerns.'],concernIds:['concern-alpha','concern-beta'],sourceIds}],
  openQuestions: []
};
const stages = a => [
  { kind:'requirement',text:JSON.stringify(requirement) },
  { kind:'specification',text:JSON.stringify(specification) },
  { kind:'architecture',text:JSON.stringify(a) }
];
const highLevel = {
  components:[{id:'storage',owner:'Test',layer:'data',responsibility:'Retain',
    dependencyIds:[],providedPorts:[],requiredPorts:[]}],
  connections:[],
  traceability: [
    { requirementCellId:'source-architecture-assay:alpha',
      specificationClauseIds:['clause-alpha'],architectureModelIds:['model-alpha'],
      designElementIds:['storage'] },
    { requirementCellId:'source-architecture-assay:beta',
      specificationClauseIds:['clause-beta'],architectureModelIds:['model-beta'],
      designElementIds:['storage'] }
  ],
  openQuestions:['Independent acceptance remains open.']
};
const lowLevel = {
  operations:[{
    id:'write',componentId:'storage',module:'src/write.mjs',exportName:'write',
    inputSchemaJson:'{}',outputSchemaJson:'{}',behavior:'Retain the selected value.',
    preconditions:[],postconditions:['The value is retained.'],failureCases:['Reject invalid source.'],
    resourceBounds:['Unmeasured.'],effectBoundaries:['No effect granted.'],
    acceptanceObligations:['Independent original-owner receiving.']
  }],
  traceability: highLevel.traceability.map(row => ({...row,designElementIds:['write']})),
  openQuestions:['Independent Proof remains open.']
};
function derive(stage, sources, design) {
  const plan = planEngineeringDesign({stage,sources});
  return receiveEngineeringDesign({plan,stage,sources,deliveryText:JSON.stringify(design)});
}
const validHld = () => derive('high-level',stages(architecture),highLevel);
const lowSources = () => [...stages(architecture),{
  kind:'high-level',text:JSON.stringify(validHld())
}];

test('admit only a source-cut-bound authored HLD mapping, without claiming proof',()=>{
  const result=validHld();
  assert.equal(result.type,'EngineeringDesignCandidate');
  assert.equal(result.admitted,false);
  assert.equal(result.proof,'unreceived');
});

test('refuse a stale Requirement revision inside a superficially sound Architecture',()=>{
  const changed=clone(architecture);
  changed.sources[0].revision='ni:///sha-256;FORGED';
  assert.throws(()=>planEngineeringDesign({stage:'high-level',sources:stages(changed)}),TypeError);
});

test('refuse a stale Specification revision inside the Architecture',()=>{
  const changed=clone(architecture);
  changed.sources[1].revision='ni:///sha-256;FORGED';
  assert.throws(()=>planEngineeringDesign({stage:'high-level',sources:stages(changed)}),TypeError);
});

test('refuse model IDs silently exchanged between two legitimate Requirement cells',()=>{
  const crossed=clone(highLevel);
  crossed.traceability[0].architectureModelIds=['model-beta'];
  crossed.traceability[1].architectureModelIds=['model-alpha'];
  assert.equal(derive('high-level',stages(architecture),crossed).reason,'invalid-design');
});

test('refuse a source condition with no authored view/model path',()=>{
  const untraced=clone(architecture);
  untraced.models[1].concernIds=['concern-alpha'];
  assert.throws(()=>planEngineeringDesign({stage:'high-level',sources:stages(untraced)}),TypeError);
});

test('preserve authored model identity into low-level operations for both cells',()=>{
  const result=derive('low-level',lowSources(),lowLevel);
  assert.equal(result.type,'EngineeringDesignCandidate');
  assert.equal(result.proof,'unreceived');
  const crossed=clone(lowLevel);
  crossed.traceability[0].architectureModelIds=['model-beta'];
  assert.equal(derive('low-level',lowSources(),crossed).reason,'invalid-design');
});

test('the original refused LLD provider delivery remains refused at the current exact source cut', () => {
  // These are original recorded sources, not synthetic examples or repaired
  // model output. Reconstruct a NEW read-only plan at today's source parser,
  // without impersonating or replaying the original paid CIE work lot.
  const hld = JSON.parse(readFileSync(new URL(
    '../data/records/service-records/high-level-design-service-records/engineering-design-explicit-source-profiles.json',
    import.meta.url), 'utf8'));
  const raw = readFileSync(new URL(
    '../data/records/service-records/engineering-generation-records/engineering-design-source-profiles-low-level-v1-raw-delivery.txt',
    import.meta.url), 'utf8');
  const receivedRefusal = JSON.parse(readFileSync(new URL(
    '../data/records/service-records/engineering-generation-records/engineering-design-source-profiles-low-level-v1-native-refusal.json',
    import.meta.url), 'utf8'));
  assert.equal(createHash('sha256').update(raw, 'utf8').digest('hex'),
    '164a07f27b6de39aab5a417a13736fe304eaff164f3cfb02a2e791906f39843c',
    'real immutable rejected supplier bytes must not be silently rewritten');
  const delivered = JSON.parse(raw);
  assert.deepEqual(Object.keys(delivered),
    ['type','additionalProperties','required','properties',
      'operations','traceability','openQuestions']);
  assert.equal(delivered.operations.length, 7);
  assert.equal(delivered.traceability.length, 13);
  assert.equal(hld.stage, 'high-level');
  assert.equal(hld.admitted, false);
  assert.equal(hld.proof, 'unreceived');
  const sources = [
    ...hld.sources.map(({kind,text}) => ({kind,text})),
    {kind:'high-level',text:JSON.stringify(hld)},
  ];
  const plan = planEngineeringDesign({stage:'low-level',sources});
  const next = receiveEngineeringDesign({
    stage:'low-level',sources,plan,deliveryText:raw,
  });
  assert.deepEqual(next, receivedRefusal,
    'a later Design receiver may not silently accept a known refused source');
  assert.equal(next.reason, 'invalid-design');
});
