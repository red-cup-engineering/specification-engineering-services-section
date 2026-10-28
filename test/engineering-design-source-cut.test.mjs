// Source-cut and cross-stage regressions against the incumbent Engineering
// Design reader. These are synthetic, expressly unadmitted source fixtures;
// passing tests do NOT qualify architecture, Proof, fabrication or an Office.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { sourcesFixture, clausesSplitAcrossModels } from './engineering-design-source-cut.fixture.mjs';
import { planEngineeringDesign, receiveEngineeringDesign,
  readEngineeringCodeWork as readSourceOwnedEngineeringCodeWork } from '../src/engineering-design.mjs';

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

test('refuse planning when a normative source clause has no Architecture model', () => {
  const sources = clausesSplitAcrossModels();
  assert.throws(() => planEngineeringDesign({
    stage: 'high-level', sources,
  }), TypeError);
});

test('refuse a Design row whose selected models cover only part of original clauses', () => {
  const sources = clausesSplitAcrossModels({ completeArchitecture: true });
  const plan = planEngineeringDesign({ stage: 'high-level', sources });
  const design = hldFixture();
  design.traceability[0].specificationClauseIds.push('clause-a2');
  // model-a is real and traces this cell, but covers only clause-a.
  assert.deepEqual(receiveEngineeringDesign({
    stage: 'high-level', sources, plan, deliveryText: JSON.stringify(design),
  }), {
    type: 'EngineeringDesignDerivationRefusal', reason: 'invalid-design',
  });
  // The two selected, independently traced models jointly cover both clauses.
  design.traceability[0].architectureModelIds.push('model-a2');
  const received = receiveEngineeringDesign({
    stage: 'high-level', sources, plan, deliveryText: JSON.stringify(design),
  });
  assert.equal(received.type, 'EngineeringDesignCandidate');
  assert.equal(received.admitted, false);
  assert.equal(received.proof, 'unreceived');
  assert.deepEqual(received.design, design);
});



test('refuse Unicode-normalization alias in an original LLD module without altering its source name', () => {
  const sources=sourcesFixture(),high=hldReceipt(sources);
  const lowSources=[...sources,{kind:'high-level',text:JSON.stringify(high)}];
  const plan=planEngineeringDesign({stage:'low-level',sources:lowSources});
  const decomposed='src/cafe\u0301.mjs',composed='src/caf\u00e9.mjs';
  assert.notEqual(decomposed,composed);
  assert.equal(decomposed.normalize('NFC'),composed);
  const former=lldFixture();
  former.operations[0].module=decomposed;
  assert.deepEqual(receiveEngineeringDesign({
    stage:'low-level',sources:lowSources,plan,deliveryText:JSON.stringify(former),
  }),{type:'EngineeringDesignDerivationRefusal',reason:'invalid-design'},
  'a canonical-equivalent path cannot silently resolve to a different file identity');

  // This is not an ASCII-only policy: the canonical scalar spelling is
  // still legal, and its exact source/text identity is never rewritten.
  const valid=lldFixture();
  valid.operations[0].module=composed;
  const received=receiveEngineeringDesign({
    stage:'low-level',sources:lowSources,plan,deliveryText:JSON.stringify(valid),
  });
  assert.equal(received.type,'EngineeringDesignCandidate');
  assert.equal(received.design.operations[0].module,composed);
  assert.equal(received.admitted,false);
  assert.equal(received.proof,'unreceived');

  // A mixed representation in two claimed modules is likewise not an
  // executable workaround for the same path collision.
  const aliased=lldFixture();
  aliased.operations[0].module=decomposed;
  aliased.operations[1].module=composed;
  assert.deepEqual(receiveEngineeringDesign({
    stage:'low-level',sources:lowSources,plan,deliveryText:JSON.stringify(aliased),
  }),{type:'EngineeringDesignDerivationRefusal',reason:'invalid-design'});
});

test('refuse LLD module paths that cannot preserve their own POSIX UTF-8 file identity', () => {
  const sources = sourcesFixture();
  const highLevel = hldReceipt(sources);
  const lowSources = [...sources, { kind: 'high-level', text: JSON.stringify(highLevel) }];
  const plan = planEngineeringDesign({ stage: 'low-level', sources: lowSources });
  const invalid = [
    'src/invalid\u0000name.mjs',
    'src/invalid\ud800name.mjs',
    'src/invalid\udc00name.mjs',
  ];
  for (const module of invalid) {
    const design = lldFixture();
    design.operations[0].module = module;
    assert.deepEqual(receiveEngineeringDesign({
      stage: 'low-level', sources: lowSources, plan, deliveryText: JSON.stringify(design),
    }), { type: 'EngineeringDesignDerivationRefusal', reason: 'invalid-design' },
    'an unusable module path must not acquire a candidate receiving: ' + JSON.stringify(module));
  }
  // Valid Unicode scalar paths must remain available for real UTF-8 source.
  const valid = lldFixture();
  valid.operations[0].module = 'src/\ud83e\uddea.mjs';
  const received = receiveEngineeringDesign({
    stage: 'low-level', sources: lowSources, plan, deliveryText: JSON.stringify(valid),
  });
  assert.equal(received.type, 'EngineeringDesignCandidate');
  assert.equal(received.admitted, false);
  assert.equal(received.proof, 'unreceived');
});


const codeDigest = text => 'sha256:' + createHash('sha256').update(text, 'utf8').digest('hex');
// Fixture binding over the EXISTING original plan and delivery, not a second
// Code Work reader. Native packed-consumer separately calls the public API.
const readEngineeringCodeWork = ({designCandidate,sourceViews,originalDeliveryText} = {}) => {
  const sources=designCandidate.sources.map(({kind,text})=>({kind,text}));
  return readSourceOwnedEngineeringCodeWork({
    designCandidate,sourceViews,
    originalPlan:planEngineeringDesign({stage:'low-level',sources}),
    originalDeliveryText:originalDeliveryText ?? JSON.stringify(lldFixture()),
  });
};
function lowLevelCandidateFixture() {
  const sources = sourcesFixture();
  const high = hldReceipt(sources);
  const full = [...sources, { kind:'high-level', text:JSON.stringify(high) }];
  const plan = planEngineeringDesign({stage:'low-level',sources:full});
  const candidate = receiveEngineeringDesign({stage:'low-level',sources:full,
    plan,deliveryText:JSON.stringify(lldFixture())});
  assert.equal(candidate.type,'EngineeringDesignCandidate');
  return candidate;
}
const exactView = (path, text) => ({path,text,expectedSha256:codeDigest(text)});

test('original Design→Code reader yields actionable per-operation tests and exact Requirement-cell trace, not fabrication', () => {
  const candidate=lowLevelCandidateFixture();
  const sourceViews=[
    exactView('src/op-a.mjs','export const retainA = value => value;'),
    exactView('src/op-b.mjs','export const retainB = value => value;'),
  ];
  const before=structuredClone({candidate,sourceViews});
  const first=readEngineeringCodeWork({designCandidate:candidate,sourceViews});
  assert.equal(first.type,'EngineeringDesignCodeWorkReadout');
  assert.equal(first.version,1);
  assert.equal(first.status,'source-present-unassayed');
  assert.equal(first.codeSnapshotScope,'supplied-target-views-only');
  assert.equal(first.executableWork,false);
  assert.equal(first.codeApplied,false);
  assert.equal(first.originalDesignAdmitted,false);
  assert.equal(first.independentProof,'unreceived');
  assert.equal(first.beneficiaryReceived,false);
  assert.equal(first.discrepancies.length,0);
  assert.deepEqual(first.targets.map(x=>x.operationId),['op-a','op-b']);
  assert.deepEqual(first.targets.map(x=>x.sourceStatus),
    ['source-present-unassayed','source-present-unassayed']);
  assert.deepEqual(first.targets[0].originalTrace,[{
    requirementCellId:'source-req:a',
    specificationClauseIds:['clause-a'],
    architectureModelIds:['model-a'],
  }]);
  assert.deepEqual(first.targets[1].originalTrace,[{
    requirementCellId:'source-req:b',
    specificationClauseIds:['clause-b'],
    architectureModelIds:['model-b'],
  }]);
  assert.deepEqual(first.targets[0].interface,{inputSchema:{},outputSchema:{}});
  assert.deepEqual(first.targets[0].testObligations.acceptance,['Independent proof required']);
  assert.deepEqual(first.targets[0].testObligations.failureCases,['Source unavailable']);
  assert.deepEqual(first.targets[0].testObligations.effectBoundaries,['Pure candidate']);
  assert.equal(first.targets[0].testObligations.status,'unreceived');
  assert.equal(first.targets[0].observedSha256,codeDigest(sourceViews[0].text));
  assert.ok(Object.isFrozen(first.targets[0].originalTrace[0].specificationClauseIds));
  assert.ok(Object.isFrozen(first.targets[0].testObligations.acceptance));
  assert.deepEqual(readEngineeringCodeWork({designCandidate:candidate,sourceViews:structuredClone(sourceViews)}),first);
  assert.deepEqual({candidate,sourceViews},before);
});

test('missing Code source is an unobserved target, never a claim of absent repository file or passing implementation',()=>{
  const candidate=lowLevelCandidateFixture();
  const result=readEngineeringCodeWork({designCandidate:candidate,
    sourceViews:[exactView('src/op-a.mjs','export function retainA(v){return v;}')]});
  assert.equal(result.status,'source-disagreement');
  assert.deepEqual(result.discrepancies,[{
    code:'SOURCE_VIEW_NOT_RECEIVED',operationId:'op-b',module:'src/op-b.mjs',
    detail:'No source bytes were provided for the intended module',
  }]);
  assert.equal(result.targets[1].sourceStatus,'source-not-observed');
  assert.equal(result.targets[1].observedSha256,null);
  assert.equal(result.executableWork,false);
});

test('Code material and the custodian-addressed digest must match even when LLD module spelling matches',()=>{
  const candidate=lowLevelCandidateFixture();
  const actual='export const retainA = () => "changed";';
  const sourceViews=[{path:'src/op-a.mjs',text:actual,
    expectedSha256:codeDigest('export const retainA = () => "old";')}];
  const read=readEngineeringCodeWork({designCandidate:candidate,sourceViews});
  assert.equal(read.status,'source-disagreement');
  assert.equal(read.targets[0].observedSha256,codeDigest(actual));
  assert.equal(read.targets[0].sourceStatus,'source-cut-disagreement');
  assert.ok(read.discrepancies.some(x=>x.code==='SOURCE_DIGEST_DISAGREEMENT'&&
    x.module==='src/op-a.mjs'));
  assert.equal(read.executableWork,false);
});

test('forged prospective LLD, stale normative source and independently invented proof refuse before Code work',()=>{
  const original=lowLevelCandidateFixture();
  for(const change of [
    d=>{d.design.operations[0].module='src/untraced-alternate.mjs';},
    d=>{d.design.traceability[0].architectureModelIds=['model-b'];},
    d=>{d.sources[0].text+=' ';},
    d=>{d.sources[1].digest='sha256:'+'0'.repeat(64);},
    d=>{d.proof='passed';},
    d=>{d.admitted=true;},
  ]){
    const changed=structuredClone(original);change(changed);
    assert.throws(()=>readEngineeringCodeWork({designCandidate:changed,sourceViews:[]}),TypeError);
  }
});

test('unreviewed extra source path, duplicate snapshot, malformed digest and invalid scalar Code refuse',()=>{
  const original=lowLevelCandidateFixture(),valid=exactView('src/op-a.mjs','export const retainA = x => x;');
  for(const sourceViews of [
    [valid,valid],
    [exactView('src/surprise.mjs','export const x=1;')],
    [{...valid,expectedSha256:'not-a-source-digest'}],
    [{...valid,text:'const forbidden = "'+String.fromCharCode(0xD800)+'";'}],
    [{path:valid.path,text:'x'.repeat(2_097_153),expectedSha256:valid.expectedSha256}],
  ]){
    assert.throws(()=>readEngineeringCodeWork({designCandidate:original,sourceViews}),TypeError);
  }
  assert.throws(()=>readEngineeringCodeWork({designCandidate:original,sourceViews:{}}),TypeError);
});

test('several Design operations on one source module retain distinct original trace and test obligations',()=>{
  const original=lowLevelCandidateFixture();
  const modified=structuredClone(original);
  modified.design.operations[1].module='src/op-a.mjs';
  modified.design.operations[1].exportName='retainB';
  // No revised Design is silently "adopted": structural LLD must independently
  // retain its original Requirement/Specification/Architecture correspondence.
  const source=exactView('src/op-a.mjs','export const retainA = v => v; export const retainB = v => v;');
  const result=readEngineeringCodeWork({designCandidate:modified,sourceViews:[source],
    originalDeliveryText:JSON.stringify(modified.design)});
  assert.equal(result.status,'source-present-unassayed');
  assert.equal(result.targets.length,2);
  assert.deepEqual(result.targets.map(x=>x.observedSha256),[codeDigest(source.text),codeDigest(source.text)]);
  assert.notEqual(result.targets[0].originalTrace[0].requirementCellId,
    result.targets[1].originalTrace[0].requirementCellId);
  assert.deepEqual(result.discrepancies,[]);
});


test('original LLD plan and exact delivery are mandatory; tampered candidate cannot forge Code targets',()=>{
  const candidate=lowLevelCandidateFixture();
  const sources=candidate.sources.map(({kind,text})=>({kind,text}));
  const plan=planEngineeringDesign({stage:'low-level',sources});
  const deliveryText=JSON.stringify(lldFixture());
  assert.throws(()=>readSourceOwnedEngineeringCodeWork({designCandidate:candidate,sourceViews:[]}),TypeError);
  assert.throws(()=>readSourceOwnedEngineeringCodeWork({
    designCandidate:candidate,sourceViews:[],originalDeliveryText:deliveryText,
  }),TypeError);
  const changed=structuredClone(candidate);
  changed.design.operations[0].module='src/unreviewed-change.mjs';
  assert.throws(()=>readSourceOwnedEngineeringCodeWork({
    designCandidate:changed,sourceViews:[],originalPlan:plan,originalDeliveryText:deliveryText,
  }),TypeError);
  const admitted=readSourceOwnedEngineeringCodeWork({
    designCandidate:candidate,sourceViews:[],originalPlan:plan,originalDeliveryText:deliveryText,
  });
  assert.equal(admitted.status,'source-disagreement');
  assert.equal(admitted.executableWork,false);
  const mutPlan=structuredClone(plan);
  mutPlan.request.objective='Different work intended by another author';
  assert.throws(()=>readSourceOwnedEngineeringCodeWork({
    designCandidate:candidate,sourceViews:[],originalPlan:mutPlan,originalDeliveryText:deliveryText,
  }),TypeError);
});


test('distinct original HLD owners retain separate Code work even for identical relative module paths', () => {
  const sources=sourcesFixture();
  const highDesign=hldFixture();
  highDesign.components[0].owner='red-cup-engineering/computer-file-engineering-services-section';
  highDesign.components[1].owner='red-cup-engineering/computer-deployment-engine';
  const highPlan=planEngineeringDesign({stage:'high-level',sources});
  const high=receiveEngineeringDesign({stage:'high-level',sources,plan:highPlan,
    deliveryText:JSON.stringify(highDesign)});
  assert.equal(high.type,'EngineeringDesignCandidate');
  const lowSources=[...sources,{kind:'high-level',text:JSON.stringify(high)}];
  const lowPlan=planEngineeringDesign({stage:'low-level',sources:lowSources});
  const lowDesign=lldFixture();
  lowDesign.operations[1].module='src/shared-original.mjs';
  lowDesign.operations[0].module='src/shared-original.mjs';
  const deliveryText=JSON.stringify(lowDesign);
  const low=receiveEngineeringDesign({stage:'low-level',sources:lowSources,
    plan:lowPlan,deliveryText});
  assert.equal(low.type,'EngineeringDesignCandidate');
  const ownedViews=[
    {owner:highDesign.components[0].owner,path:'src/shared-original.mjs',
      text:'export const retainA = () => "file owner";',
      expectedSha256:codeDigest('export const retainA = () => "file owner";')},
    {owner:highDesign.components[1].owner,path:'src/shared-original.mjs',
      text:'export const retainB = () => "CDE owner";',
      expectedSha256:codeDigest('export const retainB = () => "CDE owner";')},
  ];
  const read=readSourceOwnedEngineeringCodeWork({
    designCandidate:low,originalPlan:lowPlan,originalDeliveryText:deliveryText,
    sourceViews:ownedViews,
  });
  assert.equal(read.status,'source-present-unassayed');
  assert.deepEqual(read.targets.map(x=>x.originalComponentOwner),
    [highDesign.components[0].owner,highDesign.components[1].owner]);
  assert.equal(read.targets[0].module,read.targets[1].module);
  assert.deepEqual(read.targets.map(x=>x.observedSha256),
    ownedViews.map(x=>x.expectedSha256));
  assert.equal(read.executableWork,false);
  assert.equal(read.independentProof,'unreceived');
});

test('foreign or unowned multi-owner Code views cannot impersonate a second source repository',()=>{
  const sources=sourcesFixture();
  const highDesign=hldFixture();
  highDesign.components[0].owner='red-cup-engineering/computer-file-engineering-services-section';
  highDesign.components[1].owner='red-cup-engineering/computer-deployment-engine';
  const high=receiveEngineeringDesign({stage:'high-level',sources,
    plan:planEngineeringDesign({stage:'high-level',sources}),deliveryText:JSON.stringify(highDesign)});
  const lowSources=[...sources,{kind:'high-level',text:JSON.stringify(high)}];
  const lowPlan=planEngineeringDesign({stage:'low-level',sources:lowSources});
  const lowDesign=lldFixture();
  lowDesign.operations[0].module='src/shared.mjs';
  lowDesign.operations[1].module='src/shared.mjs';
  const originalDeliveryText=JSON.stringify(lowDesign);
  const low=receiveEngineeringDesign({stage:'low-level',sources:lowSources,
    plan:lowPlan,deliveryText:originalDeliveryText});
  const view={path:'src/shared.mjs',text:'export const retainA=1;',expectedSha256:codeDigest('export const retainA=1;')};
  for(const sourceViews of [
    [view], [{...view,owner:'red-cup-engineering/foreign-source'}],
    [{...view,owner:highDesign.components[0].owner},{...view,owner:highDesign.components[0].owner}],
  ]) assert.throws(()=>readSourceOwnedEngineeringCodeWork({
    designCandidate:low,originalPlan:lowPlan,originalDeliveryText,sourceViews,
  }),TypeError);
});


test('LLD module/export uniqueness is scoped to the original HLD source owner, not a global path', () => {
  const requirementSources = sourcesFixture();
  const hld = hldFixture();
  hld.components[0].owner = 'red-cup-engineering/computer-file-engineering-services-section';
  hld.components[1].owner = 'red-cup-engineering/computer-deployment-engine';
  const hldPlan = planEngineeringDesign({ stage: 'high-level', sources: requirementSources });
  const high = receiveEngineeringDesign({ stage: 'high-level', sources: requirementSources,
    plan: hldPlan, deliveryText: JSON.stringify(hld) });
  assert.equal(high.type, 'EngineeringDesignCandidate');
  const sources = [...requirementSources, { kind: 'high-level', text: JSON.stringify(high) }];
  const plan = planEngineeringDesign({ stage: 'low-level', sources });
  const lld = lldFixture();
  for (const operation of lld.operations) {
    operation.module = 'src/shared-original.mjs';
    operation.exportName = 'make';
  }
  const originalDeliveryText = JSON.stringify(lld);
  const received = receiveEngineeringDesign({ stage: 'low-level', sources,
    plan, deliveryText: originalDeliveryText });
  assert.equal(received.type, 'EngineeringDesignCandidate',
    'two distinct original repositories may both export make from src/shared-original.mjs');
  assert.equal(received.admitted, false);
  assert.equal(received.proof, 'unreceived');

  const views = [
    { owner: hld.components[0].owner, path: 'src/shared-original.mjs',
      text: 'export const make = () => "original file owner";',
      expectedSha256: codeDigest('export const make = () => "original file owner";') },
    { owner: hld.components[1].owner, path: 'src/shared-original.mjs',
      text: 'export const make = () => "original deployment owner";',
      expectedSha256: codeDigest('export const make = () => "original deployment owner";') },
  ];
  const codeWork = readSourceOwnedEngineeringCodeWork({
    designCandidate: received, originalPlan: plan, originalDeliveryText,
    sourceViews: views,
  });
  assert.equal(codeWork.status, 'source-present-unassayed');
  assert.deepEqual(codeWork.targets.map(target => target.originalComponentOwner),
    hld.components.map(component => component.owner));
  assert.deepEqual(codeWork.targets.map(target => target.exportName), ['make', 'make']);
  assert.deepEqual(codeWork.targets.map(target => target.observedSha256),
    views.map(view => view.expectedSha256));
  assert.equal(codeWork.executableWork, false);
  assert.equal(codeWork.independentProof, 'unreceived');

  // Reusing one owner/path/export in the SAME original repository remains a
  // conflict, even if different HLD component IDs have separate trace rows.
  const collidingHld = structuredClone(hld);
  collidingHld.components[1].owner = collidingHld.components[0].owner;
  const collidingHigh = receiveEngineeringDesign({ stage: 'high-level',
    sources: requirementSources, plan: hldPlan,
    deliveryText: JSON.stringify(collidingHld) });
  assert.equal(collidingHigh.type, 'EngineeringDesignCandidate');
  const collidingSources = [...requirementSources,
    { kind: 'high-level', text: JSON.stringify(collidingHigh) }];
  const collidingPlan = planEngineeringDesign({ stage: 'low-level',
    sources: collidingSources });
  assert.deepEqual(receiveEngineeringDesign({ stage: 'low-level',
    sources: collidingSources, plan: collidingPlan,
    deliveryText: originalDeliveryText }),
  { type: 'EngineeringDesignDerivationRefusal', reason: 'invalid-design' });
});
