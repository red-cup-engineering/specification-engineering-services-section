// Independent, held-out source-cut and trace counterexamples for the native
// HLD/LLD bootstrap. These cases were not supplied to the v27 generator writer.
// No source permission, production result, or Proof follows from a passing test.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { semanticIdOf } from '@red-cup-engineering/computer-data-engineering-services-section/semiotic-expression-notation/semantic-content-identity';
import { planEngineeringDesign, receiveEngineeringDesign,
  readEngineeringDesignInferenceWork } from '../src/engineering-design.mjs';
import { deriveSpecificationFromRequirementReview,
  validateSpecificationRecord } from '../src/specification.mjs';
import { deriveArchitectureDescriptionFromSpecificationReview,
  readRequirementArchitectureTrace } from '../src/architecture-description.mjs';

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

test('current fourteen-condition original Requirement cannot silently receive its historical thirteen-condition HLD cut',()=>{
  // These are the ORIGINAL retained Engineering #137/#19 source records, not
  // made-up source values or a fabricated new provider response. The original
  // Requirement acquired a fourteenth (requirement-cut) cell after the 13-cell
  // Specification/Architecture source selection. That historical LLD lot
  // must remain available as evidence, but it cannot be current Design.
  const dir='../data/records/service-records/';
  const read=path=>readFileSync(new URL(dir+path,import.meta.url),'utf8');
  const reqText=read('requirements-service-records/engineering-design-accepts-explicit-source-profiles.json');
  const specText=read('specification-service-records/engineering-design-accepts-explicit-source-profiles.json');
  const archText=read('architecture-description-service-records/engineering-design-explicit-source-profiles.json');
  const req=JSON.parse(reqText),spec=JSON.parse(specText),arch=JSON.parse(archText);
  assert.equal(req.kind,'requirement');
  assert.equal(req['met-when'].length,14);
  assert.equal(spec.topics.flatMap(topic=>topic.clauses).length,13);
  assert.ok(req['met-when'].some(row=>row.cell.endsWith(':requirement-cut')));
  assert.notEqual(arch.sources.find(row=>row.id===arch.upstream.requirementsSourceId).revision,
    artifactId(req),'the stored 13-cell Architecture source is NOT the revised original Requirement NI');
  const sources=[
    {kind:'requirement',text:reqText},
    {kind:'specification',text:specText},
    {kind:'architecture',text:archText},
  ];
  assert.throws(()=>planEngineeringDesign({stage:'high-level',sources}),TypeError,
    'actual current original source and superseded Design cut cannot produce a new native plan');
  assert.equal(arch.standard.conformance,'unassessed');
});

test('original 14-condition source reprojects its reviewed 13-cell selection through original Spec, Architecture and HLD into a bounded LLD request',()=>{
  // The original PR #19 Work, not a new Requirements registry or synthetic
  // customer. Its historical thirteen-cell LLD was refused, and that raw
  // delivery is retained unchanged. The new section-level Requirement added
  // one cell and changed the complete source NI; no old Plan/Proof can be
  // implicitly reused under the revised source.
  const root='../data/records/service-records/';
  const read=(path)=>readFileSync(new URL(root+path,import.meta.url),'utf8');
  const R=JSON.parse(read('requirements-service-records/engineering-design-accepts-explicit-source-profiles.json'));
  const G=JSON.parse(read('specification-service-records/engineering-design-accepts-explicit-source-profiles.generation.json'));
  const oldArchitecture=JSON.parse(read('architecture-description-service-records/engineering-design-explicit-source-profiles.json'));
  const oldHld=JSON.parse(read('high-level-design-service-records/engineering-design-explicit-source-profiles.json'));
  const raw=read('engineering-generation-records/engineering-design-source-profiles-low-level-v1-raw-delivery.txt');
  const historicalRefusal=JSON.parse(read('engineering-generation-records/engineering-design-source-profiles-low-level-v1-native-refusal.json'));

  const selected=G.review.interpretations.map(x=>x.cell);
  assert.equal(R['met-when'].length,14);
  assert.equal(selected.length,13);
  assert.deepEqual(selected,R['met-when'].slice(0,13).map(x=>x.cell));
  assert.ok(!selected.includes(R.id+':requirement-cut'));
  assert.equal(oldHld.design.components.length,7);
  assert.equal(oldHld.design.traceability.length,13);
  assert.equal(oldHld.admitted,false);
  assert.equal(oldHld.proof,'unreceived');

  // These are the historically authored thirteen interpretations, now
  // projected against the *complete current* Requirement source. This is
  // structural reuse proposed for an external review, NOT a new Office
  // attestation that the modified original-fabrication clause is accepted.
  assert.throws(()=>deriveSpecificationFromRequirementReview(R,{
    ...G.review,cells:selected,
  }),/reviewed Requirement revision/u,
  "archived original review cannot re-attest the changed full Requirement");
  const currentReview={
    ...G.review,cells:selected,
    reviewedRequirementRevision:artifactId(R),
    reviewedBy:"unadmitted-source-cut-assay-not-an-Office-approval",
  };
  const specification=deriveSpecificationFromRequirementReview(R,currentReview);
  assert.equal(validateSpecificationRecord(specification).valid,true);
  assert.equal(specification.topics.flatMap(t=>t.clauses).length,13);
  assert.equal(specification.identity.status,'draft');
  assert.equal(specification.provenance.derivedFrom[0],R.id+'@'+artifactId(R));
  assert.ok(specification.provenance.derivedFrom[1].startsWith(
    R.id+'@'+artifactId(R)+'#cells='));
  assert.notEqual(artifactId(R),
    oldArchitecture.sources.find(x=>x.id==='req').revision);
  assert.deepEqual(
    deriveSpecificationFromRequirementReview(structuredClone(R),{
      ...structuredClone(currentReview),cells:[...selected].reverse(),
    }).provenance.derivedFrom,
    specification.provenance.derivedFrom,
    'selection identity must use sorted cell IDs, never review order');

  // Reuse the actual archived authored 42010 decisions, model assignments
  // and supporting-source references. Only the *review input sourceCut*
  // advances to the new original identities. The original Architecture
  // derivation remains the ONLY candidate maker and does not adopt choices.
  const review={
    identity:{
      id:oldArchitecture.identity.id,
      title:oldArchitecture.identity.title,
      owner:oldArchitecture.identity.owner,
    },
    sourceCut:{
      requirementRevision:artifactId(R),
      specificationRevision:artifactId(specification),
    },
    applicability:oldArchitecture.standard.applicability,
    system:{
      name:oldArchitecture.system.name,
      description:oldArchitecture.system.description,
      supportingSourceIds:oldArchitecture.system.sourceIds
        .filter(x=>x!=='req'&&x!=='spec'),
    },
    supportingSources:oldArchitecture.sources.filter(x=>
      x.id!=='req'&&x.id!=='spec'),
    stakeholders:oldArchitecture.stakeholders,
    concerns:oldArchitecture.concerns,
    viewpoints:oldArchitecture.viewpoints,
    views:oldArchitecture.views,
    models:oldArchitecture.models,
    correspondences:oldArchitecture.correspondences,
    decisions:oldArchitecture.decisions,
    openQuestions:oldArchitecture.openQuestions,
  };
  const architecture=deriveArchitectureDescriptionFromSpecificationReview({
    requirement:R,specification,review,
  });
  const trace=readRequirementArchitectureTrace(architecture,{
    requirement:R,specification,
  });
  assert.deepEqual(trace.counts,{
    sourceCells:13,authoredModelMapped:13,untraced:0,
  });
  assert.equal(trace.independentProof,false);
  assert.equal(trace.independentlyAcceptedCustomerWork,false);
  assert.equal(architecture.standard.conformance,'unassessed');
  assert.notEqual(architecture.identity.revision,oldArchitecture.identity.revision);
  const stale=structuredClone(review);
  stale.sourceCut.requirementRevision=oldArchitecture.sources.find(x=>x.id==='req').revision;
  assert.throws(()=>deriveArchitectureDescriptionFromSpecificationReview({
    requirement:R,specification,review:stale,
  }),/source cut refused/u);

  const sources=[
    {kind:'requirement',text:JSON.stringify(R)},
    {kind:'specification',text:JSON.stringify(specification)},
    {kind:'architecture',text:JSON.stringify(architecture)},
  ];
  const highPlan=planEngineeringDesign({stage:'high-level',sources});
  // The immutable historic HLD allocation is an *input proposal* for a
  // new source-bound receiving. No provider call, source rewrite, semantic
  // refinement, original Work discharge or source author authorization.
  const high=receiveEngineeringDesign({
    stage:'high-level',sources,plan:highPlan,
    deliveryText:JSON.stringify(oldHld.design),
  });
  assert.equal(high.type,'EngineeringDesignCandidate');
  assert.equal(high.admitted,false);
  assert.equal(high.proof,'unreceived');
  assert.equal(high.design.traceability.length,13);

  const lowSources=[...sources,{kind:'high-level',text:JSON.stringify(high)}];
  const lowPlan=planEngineeringDesign({stage:'low-level',sources:lowSources});
  const originalNativeWork=readEngineeringDesignInferenceWork(lowPlan);
  assert.equal(originalNativeWork.enforceProviderSchema,true);
  assert.deepEqual(originalNativeWork.requiredCapabilities,['json-schema-output']);
  assert.deepEqual(Object.keys(originalNativeWork.outputSchema.properties).sort(),
    ['operations','traceability','openQuestions'].sort());
  assert.equal(originalNativeWork.outputSchema.additionalProperties,false);
  assert.deepEqual(JSON.parse(originalNativeWork.context),{
    stage:'low-level',sources:lowPlan.sources,
  });

  // A native plan for the CURRENT source never repairs the historical model
  // lot by dropping its invalid schema-root members. It must still refuse.
  assert.deepEqual(receiveEngineeringDesign({
    stage:'low-level',sources:lowSources,plan:lowPlan,
    deliveryText:raw,
  }),historicalRefusal);
  assert.equal(historicalRefusal.reason,'invalid-design');
  assert.equal(oldHld.admitted,false);
  console.log('Original 14-condition Requirement, reviewed 13-cell selection, 13/13 Architecture and seven-component HLD project a NEW typed LLD request; old raw LLD refused, all stages unadmitted.');
});
