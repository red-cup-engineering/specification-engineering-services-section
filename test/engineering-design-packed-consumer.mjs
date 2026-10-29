// This script runs in a separate fresh npm consumer after installing the
// candidate package archive. It imports only the PUBLIC published design
// export, never ../src, and preserves source/Proof/admission boundaries.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import {
  planEngineeringDesign,
  receiveEngineeringDesign,
  readEngineeringCodeWork,
} from '@red-cup-engineering/specification-engineering-services-section/engineering-design';
import { sourcesFixture, clausesSplitAcrossModels } from './engineering-design-source-cut.fixture.mjs';

// The installed package's four original source producers must share STRICT
// JSON intake. Source bytes that hide an earlier claim cannot reach any
// later Specification renderer or Design generator.
const duplicateInput='{"claim":"preserved","claim":"silently erased"}';
for (const name of [
  'derive-specification','render-specification',
  'render-specification-rfcxml','render-architecture-description',
]) {
  const command='node_modules/@red-cup-engineering/specification-engineering-services-section/scripts/'+name+'.mjs';
  const result=spawnSync(process.execPath,[command],{
    input:duplicateInput,encoding:'utf8',maxBuffer:2*1024*1024,timeout:15_000,
  });
  assert.equal(result.status,1,name+' '+result.stderr);
  assert.equal(result.stdout,'',name+' emitted a partial product from ambiguous source');
  assert.match(result.stderr,/duplicate-key/u,name+' did not use the shared JSON source admission');
}

const original = sourcesFixture();
const plan = planEngineeringDesign({ stage: 'high-level', sources: original });
assert.equal(plan.type, 'EngineeringDesignDerivationPlan');
const hld = {
  components: [
    { id: 'source-component', owner: 'fixture-only', layer: 'data',
      responsibility: 'Retain A and B', dependencyIds: [], providedPorts: [], requiredPorts: [] },
  ],
  connections: [],
  traceability: [
    { requirementCellId: 'source-req:a', specificationClauseIds: ['clause-a'],
      architectureModelIds: ['model-a'], designElementIds: ['source-component'] },
    { requirementCellId: 'source-req:b', specificationClauseIds: ['clause-b'],
      architectureModelIds: ['model-b'], designElementIds: ['source-component'] },
  ],
  openQuestions: [],
};
const high = receiveEngineeringDesign({ stage: 'high-level',
  sources: original, plan, deliveryText: JSON.stringify(hld) });
assert.equal(high.type, 'EngineeringDesignCandidate');
assert.equal(high.admitted, false);
assert.equal(high.proof, 'unreceived');

// Independent packed consumer must refuse lossy UTF-8 source views before
// a plan acquires its source addresses, even when raw JSON parses successfully.
const malformedArchitecture = original.map(source => ({...source}));
malformedArchitecture[2].text = original[2].text.replace('Synthetic original design',
  'Synthetic ' + String.fromCharCode(0xD800) + ' original design');
assert.doesNotThrow(() => JSON.parse(malformedArchitecture[2].text));
assert.throws(() => planEngineeringDesign({
  stage:'high-level', sources:malformedArchitecture,
}),TypeError,'original source owner cannot be re-addressed through lossy UTF-8');
const malformedDelivery=JSON.stringify(hld).replace('Retain A and B',
  'Retain ' + String.fromCharCode(0xD800) + ' A and B');
assert.doesNotThrow(() => JSON.parse(malformedDelivery));
assert.deepEqual(receiveEngineeringDesign({
  stage:'high-level',sources:original,plan,deliveryText:malformedDelivery,
}),{type:'EngineeringDesignDerivationRefusal',reason:'invalid-design'});


// Independent package consumer: no normative clause may disappear via a
// duplicate JSON member, and no delivered Design may hide an earlier operation.
const duplicateRequirement=original.map(row=>({...row}));
duplicateRequirement[0].text=original[0].text.replace('"met-when":',
  '"met-when":[{"cell":"source-req:hidden","target":"held","says":"Never silently erase this requirement."}],"met-when":');
assert.deepEqual(JSON.parse(duplicateRequirement[0].text),JSON.parse(original[0].text));
assert.throws(()=>planEngineeringDesign({
  stage:'high-level',sources:duplicateRequirement,
}),TypeError);
const duplicateDesign=JSON.stringify(hld).replace('"components":','"components":[],"components":');
assert.deepEqual(JSON.parse(duplicateDesign),hld);
assert.deepEqual(receiveEngineeringDesign({
  stage:'high-level',sources:original,plan,deliveryText:duplicateDesign,
}),{type:'EngineeringDesignDerivationRefusal',reason:'invalid-design'});
const escapedUnicode=JSON.stringify(hld).replace('Retain A and B','Retain \\u'+'d800 A and B');
assert.equal(escapedUnicode.isWellFormed(),true);
assert.deepEqual(receiveEngineeringDesign({
  stage:'high-level',sources:original,plan,deliveryText:escapedUnicode,
}),{type:'EngineeringDesignDerivationRefusal',reason:'invalid-design'});

const lowSources = [...original, { kind: 'high-level', text: JSON.stringify(high) }];
const lowPlan = planEngineeringDesign({ stage: 'low-level', sources: lowSources });
const low = receiveEngineeringDesign({
  stage: 'low-level', sources: lowSources, plan: lowPlan,
  deliveryText: JSON.stringify({
    operations: [{
      id: 'source-operation', componentId: 'source-component',
      module: 'src/source-operation.mjs', exportName: 'retainSourceValue',
      inputSchemaJson: '{}', outputSchemaJson: '{}',
      behavior: 'Prospective source retention',
      preconditions: [], postconditions: ['Source retained'],
      failureCases: ['Source missing'], resourceBounds: ['Bounded input'],
      effectBoundaries: ['No external effect'],
      acceptanceObligations: ['Independent proof pending'],
    }],
    traceability: [
      { requirementCellId: 'source-req:a', specificationClauseIds: ['clause-a'],
        architectureModelIds: ['model-a'], designElementIds: ['source-operation'] },
      { requirementCellId: 'source-req:b', specificationClauseIds: ['clause-b'],
        architectureModelIds: ['model-b'], designElementIds: ['source-operation'] },
    ],
    openQuestions: [],
  }),
});
assert.equal(low.type, 'EngineeringDesignCandidate');
assert.equal(low.admitted, false);
assert.equal(low.proof, 'unreceived');

 // Canonical-equivalent module paths may alias after materialization. The
 // installed consumer must see a source refusal, not normalize the Design
 // silently or inherit the previous output identity.
const decomposedName='src/cafe\u0301.mjs';
const canonicalName='src/caf\u00e9.mjs';
assert.notEqual(decomposedName,canonicalName);
assert.equal(decomposedName.normalize('NFC'),canonicalName);
const ambiguousLLD=structuredClone(low.design);
ambiguousLLD.operations[0].module=decomposedName;
assert.deepEqual(receiveEngineeringDesign({
  stage:'low-level',sources:lowSources,plan:lowPlan,
  deliveryText:JSON.stringify(ambiguousLLD),
}),{type:'EngineeringDesignDerivationRefusal',reason:'invalid-design'});
const canonicalLLD=structuredClone(low.design);
canonicalLLD.operations[0].module=canonicalName;
const canonicalReceipt=receiveEngineeringDesign({
  stage:'low-level',sources:lowSources,plan:lowPlan,
  deliveryText:JSON.stringify(canonicalLLD),
});
assert.equal(canonicalReceipt.type,'EngineeringDesignCandidate');
assert.equal(canonicalReceipt.design.operations[0].module,canonicalName);
assert.equal(canonicalReceipt.admitted,false);
assert.equal(canonicalReceipt.proof,'unreceived');
const canonicalText='export const retainSourceValue = x => x;';
const canonicalReadout=readEngineeringCodeWork({
  designCandidate:canonicalReceipt,originalPlan:lowPlan,
  originalDeliveryText:JSON.stringify(canonicalLLD),
  sourceViews:[{owner:'fixture-only',path:canonicalName,text:canonicalText,
    expectedSha256:'sha256:'+createHash('sha256').update(canonicalText,'utf8').digest('hex')}],
});
assert.equal(canonicalReadout.status,'source-present-unassayed');
assert.equal(canonicalReadout.targets[0].module,canonicalName);
assert.equal(canonicalReadout.executableWork,false);
assert.equal(canonicalReadout.independentProof,'unreceived');



// Independently installed consumer of the ORIGINAL Design→Code readout.
// This source snapshot is a byte-addressed selected target, not an authentic
// GitHub checkout or a permitted Code effect.
const codeSourceText='export const retainSourceValue = x => x;' + '\n';
const codeSourceSha256='sha256:' + createHash('sha256')
  .update(codeSourceText,'utf8').digest('hex');
const sourceCut=[{
  owner:'fixture-only',path:'src/source-operation.mjs',text:codeSourceText,
  expectedSha256:codeSourceSha256,
}];
const work=readEngineeringCodeWork({
  designCandidate:low,originalPlan:lowPlan,
  originalDeliveryText:JSON.stringify(low.design),sourceViews:sourceCut,
});
assert.equal(work.type,'EngineeringDesignCodeWorkReadout');
assert.equal(work.targets[0].bindingObservation.status,'observed');
assert.deepEqual(work.targets[0].bindingObservation.resolved,{
  owner:'fixture-only',path:'src/source-operation.mjs',binding:'retainSourceValue',
});
// Deliberately clean source bytes with the WRONG export must disagree with the
// original LLD; passing a digest proves no obligation of its implementation.
const wrongText='export const differentOperation = () => 42;\n';
const wrongView={
  owner:'fixture-only',path:'src/source-operation.mjs',text:wrongText,
  expectedSha256:'sha256:'+createHash('sha256').update(wrongText,'utf8').digest('hex'),
};
const wrongReadout=readEngineeringCodeWork({
  designCandidate:low,originalPlan:lowPlan,
  originalDeliveryText:JSON.stringify(low.design),sourceViews:[wrongView],
});
assert.equal(wrongReadout.targets[0].bindingObservation.status,'absent');
assert.equal(wrongReadout.discrepancies[0].code,'CODE_EXPORT_NOT_OBSERVED');
assert.equal(wrongReadout.status,'source-disagreement');
assert.equal(wrongReadout.executableWork,false);
assert.equal(wrongReadout.independentProof,'unreceived');

assert.match(work.designCarrierId,/^ni:\/\/\/sha-256;/u);
assert.equal(work.designCarrierSha256,undefined,
  'the Code Work reader no longer hashes caller-ordered JSON serialization');
assert.equal(work.status,'source-present-unassayed');
assert.equal(work.targets.length,1);
assert.equal(work.targets[0].operationId,'source-operation');
assert.equal(work.targets[0].module,'src/source-operation.mjs');
assert.equal(work.targets[0].exportName,'retainSourceValue');
assert.equal(work.targets[0].observedSha256,codeSourceSha256);
assert.deepEqual(work.targets[0].originalTrace.map(x=>x.requirementCellId),
  ['source-req:a','source-req:b']);
assert.equal(work.targets[0].testObligations.status,'unreceived');
assert.equal(work.originalDesignAdmitted,false);
assert.equal(work.independentProof,'unreceived');
assert.equal(work.executableWork,false);
assert.equal(work.codeApplied,false);
assert.ok(Object.isFrozen(work.targets[0].testObligations));
const changedWork=structuredClone(low);
changedWork.design.operations[0].module='src/a-different-maker.mjs';
assert.throws(()=>readEngineeringCodeWork({
  designCandidate:changedWork,originalPlan:lowPlan,
  originalDeliveryText:JSON.stringify(low.design),sourceViews:sourceCut,
}),TypeError);
const staleCodeCut=readEngineeringCodeWork({
  designCandidate:low,originalPlan:lowPlan,
  originalDeliveryText:JSON.stringify(low.design),
  sourceViews:[{...sourceCut[0],expectedSha256:'sha256:'+'0'.repeat(64)}],
});
assert.equal(staleCodeCut.status,'source-disagreement');
assert.equal(staleCodeCut.discrepancies[0].code,'SOURCE_DIGEST_DISAGREEMENT');
assert.equal(staleCodeCut.executableWork,false);

const changed = structuredClone(hld);
changed.traceability[0].architectureModelIds = ['model-b'];
assert.deepEqual(receiveEngineeringDesign({
  stage: 'high-level', sources: original, plan,
  deliveryText: JSON.stringify(changed),
}), { type: 'EngineeringDesignDerivationRefusal', reason: 'invalid-design' });

const stale = structuredClone(original);
const staleArch = JSON.parse(stale[2].text);
staleArch.sources[0].revision = 'ni:///sha-256;stale-original-requirement';
stale[2].text = JSON.stringify(staleArch);
assert.throws(() => planEngineeringDesign({ stage: 'high-level', sources: stale }), TypeError);

  
// Independently installed Design-export receiving of the same clause-to-model
// law tested at source level. The original archived candidate cannot pass by
// citing one model for two independent normative clauses.
const clauseWithoutModel = clausesSplitAcrossModels();
assert.throws(() => planEngineeringDesign({
  stage: 'high-level', sources: clauseWithoutModel,
}), TypeError, 'unmodeled normative clause refuses before inference');

const clauseSources = clausesSplitAcrossModels({ completeArchitecture: true });
const clausePlan = planEngineeringDesign({ stage: 'high-level', sources: clauseSources });
const clauseHld = structuredClone(hld);
clauseHld.traceability[0].specificationClauseIds.push('clause-a2');
assert.deepEqual(receiveEngineeringDesign({
  stage: 'high-level', sources: clauseSources, plan: clausePlan,
  deliveryText: JSON.stringify(clauseHld),
}), { type: 'EngineeringDesignDerivationRefusal', reason: 'invalid-design' },
'one selected model cannot falsely receive a second independent clause');

clauseHld.traceability[0].architectureModelIds.push('model-a2');
const clauseHigh = receiveEngineeringDesign({
  stage: 'high-level', sources: clauseSources, plan: clausePlan,
  deliveryText: JSON.stringify(clauseHld),
});
assert.equal(clauseHigh.type, 'EngineeringDesignCandidate');
assert.equal(clauseHigh.admitted, false);
assert.equal(clauseHigh.proof, 'unreceived');

const clauseLowSources = [
  ...clauseSources, { kind: 'high-level', text: JSON.stringify(clauseHigh) },
];
const clauseLowPlan = planEngineeringDesign({ stage: 'low-level', sources: clauseLowSources });
const clauseLld = structuredClone(low.design);
clauseLld.traceability[0].specificationClauseIds.push('clause-a2');
assert.deepEqual(receiveEngineeringDesign({
  stage: 'low-level', sources: clauseLowSources, plan: clauseLowPlan,
  deliveryText: JSON.stringify(clauseLld),
}), { type: 'EngineeringDesignDerivationRefusal', reason: 'invalid-design' },
'LLD cannot drop an independently modeled clause from its same-source HLD');
clauseLld.traceability[0].architectureModelIds.push('model-a2');
const clauseLow = receiveEngineeringDesign({
  stage: 'low-level', sources: clauseLowSources, plan: clauseLowPlan,
  deliveryText: JSON.stringify(clauseLld),
});
assert.equal(clauseLow.type, 'EngineeringDesignCandidate');
assert.equal(clauseLow.admitted, false);
assert.equal(clauseLow.proof, 'unreceived');

// The actual separately installed public Design export must refuse module
// strings that cannot denote a stable POSIX UTF-8 pathname. This is not
// emulated by a test-only helper and never writes generated code.
for (const module of ['src/bad\u0000name.mjs', 'src/bad\ud800name.mjs', 'src/bad\udc00name.mjs']) {
  const candidate = structuredClone(low.design);
  candidate.operations[0].module = module;
  assert.deepEqual(receiveEngineeringDesign({
    stage: 'low-level', sources: lowSources, plan: lowPlan,
    deliveryText: JSON.stringify(candidate),
  }), { type: 'EngineeringDesignDerivationRefusal', reason: 'invalid-design' });
}
const unicodeCandidate = structuredClone(low.design);
unicodeCandidate.operations[0].module = 'src/\ud83e\uddea.mjs';
const unicodeReceived = receiveEngineeringDesign({
  stage: 'low-level', sources: lowSources, plan: lowPlan,
  deliveryText: JSON.stringify(unicodeCandidate),
});
assert.equal(unicodeReceived.type, 'EngineeringDesignCandidate');
assert.equal(unicodeReceived.admitted, false);
assert.equal(unicodeReceived.proof, 'unreceived');

// The clean, independently installed package must keep SAME relative path
// from two authentic HLD owners as TWO original Code source identities,
// even when the export name is also byte-identical.
const owners=['red-cup-engineering/computer-file-engineering-services-section',
  'red-cup-engineering/computer-deployment-engine'];
const splitHld=structuredClone(hld);
splitHld.components=[
  {...hld.components[0],id:'file-component',owner:owners[0]},
  {...hld.components[0],id:'deployment-component',owner:owners[1]},
];
splitHld.traceability[0].designElementIds=['file-component'];
splitHld.traceability[1].designElementIds=['deployment-component'];
const splitHigh=receiveEngineeringDesign({
  stage:'high-level',sources:original,plan,
  deliveryText:JSON.stringify(splitHld),
});
assert.equal(splitHigh.type,'EngineeringDesignCandidate');
const splitLowSources=[...original,{kind:'high-level',text:JSON.stringify(splitHigh)}];
const splitLowPlan=planEngineeringDesign({stage:'low-level',sources:splitLowSources});
const shared='src/same-relative-name.mjs';
const splitDesign=structuredClone(low.design);
splitDesign.operations=[
  {...low.design.operations[0],id:'file-op',componentId:'file-component',
    module:shared,exportName:'make'},
  {...low.design.operations[0],id:'deployment-op',componentId:'deployment-component',
    module:shared,exportName:'make'},
];
splitDesign.traceability[0].designElementIds=['file-op'];
splitDesign.traceability[1].designElementIds=['deployment-op'];
const splitDelivery=JSON.stringify(splitDesign);
const splitLow=receiveEngineeringDesign({
  stage:'low-level',sources:splitLowSources,plan:splitLowPlan,
  deliveryText:splitDelivery,
});
assert.equal(splitLow.type,'EngineeringDesignCandidate');
const digest=text=>'sha256:'+createHash('sha256').update(text,'utf8').digest('hex');
const sourceViews=owners.map((owner,i)=>{
  const text='export const make = () => '+i+';';
  return {owner,path:shared,text,expectedSha256:digest(text)};
});
const splitReadout=readEngineeringCodeWork({
  designCandidate:splitLow,originalPlan:splitLowPlan,
  originalDeliveryText:splitDelivery,sourceViews,
});
assert.equal(splitReadout.status,'source-present-unassayed');
const targets=new Map(splitReadout.targets.map(x=>[x.originalComponentOwner,x]));
for(const view of sourceViews){
  assert.equal(targets.get(view.owner).observedSha256,view.expectedSha256);
  assert.equal(targets.get(view.owner).module,shared);
  assert.equal(targets.get(view.owner).exportName,'make');
}
assert.equal(splitReadout.executableWork,false);
assert.equal(splitReadout.independentProof,'unreceived');
assert.throws(()=>readEngineeringCodeWork({
  designCandidate:splitLow,originalPlan:splitLowPlan,
  originalDeliveryText:splitDelivery,
  sourceViews:[{path:shared,text:sourceViews[0].text,
    expectedSha256:sourceViews[0].expectedSha256}],
}),TypeError,'one ownerless source view cannot impersonate two original repositories');

// Identical module/export within one original source owner must still
// refuse before a Code Work readout, despite the two distinct component IDs.
const collidingHld=structuredClone(splitHld);
collidingHld.components[1].owner=owners[0];
const collidingHigh=receiveEngineeringDesign({
  stage:'high-level',sources:original,plan,
  deliveryText:JSON.stringify(collidingHld),
});
assert.equal(collidingHigh.type,'EngineeringDesignCandidate');
const collidingSources=[...original,{kind:'high-level',text:JSON.stringify(collidingHigh)}];
const collidingPlan=planEngineeringDesign({stage:'low-level',sources:collidingSources});
assert.deepEqual(receiveEngineeringDesign({
  stage:'low-level',sources:collidingSources,plan:collidingPlan,
  deliveryText:splitDelivery,
}),{type:'EngineeringDesignDerivationRefusal',reason:'invalid-design'});

console.log('Packed original Design consumer: original LLD-to-Code work and test obligations source-read; no effect, proof or implementation conformance granted.');
console.log('Packed original Design consumer: HLD+LLD source-bound and per-clause model-covered candidates received; stale, cross-cell, unmodeled-clause and partial-model sources refused; proof, adoption and installation still unreceived.');
