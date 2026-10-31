// This script runs in a separate fresh npm consumer after installing the
// candidate package archive. It imports only the PUBLIC published design
// export, never ../src, and preserves source/Proof/admission boundaries.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { artifactId } from '@red-cup-engineering/semiotic-eavt-services-section/identity';
import { spawnSync } from 'node:child_process';
import {
  planEngineeringDesign,
  receiveEngineeringDesign,
  receiveEngineeringHighLevelReview,
  readEngineeringDesignInferenceWork,
  readEngineeringCodeWork,
} from '@red-cup-engineering/specification-engineering-services-section/engineering-design';
import { indexJavaScriptModuleBindings } from '@red-cup-engineering/specification-engineering-services-section/javascript-module-bindings';
import {
  readRequirementArchitectureTrace, readRequirementArchitectureImpact,
  readRequirementRevisionPressure,
} from '@red-cup-engineering/specification-engineering-services-section/architecture-description';
import { sourcesFixture, clausesSplitAcrossModels, sourceWithDeniedCondition } from './engineering-design-source-cut.fixture.mjs';
import { validateSpecificationRecord } from '@red-cup-engineering/specification-engineering-services-section/specification';

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

// Resolve original semantic ESM bindings through the exact installed package
// export. No module under analysis is imported or executed.
const runtimeBindings=indexJavaScriptModuleBindings([
  {owner:'fixture-only',path:'src/leaf.mjs',text:'export const original=1;'},
  {owner:'fixture-only',path:'src/forward.mjs',
    text:'export {original as publicName} from "./leaf.mjs";'},
],{maxBytes:2_097_152,maxModules:64});
const reading=runtimeBindings.inspect({
  owner:'fixture-only',path:'src/forward.mjs',exportName:'publicName',
});
assert.equal(reading.status,'observed');
assert.deepEqual(reading.resolved,{
  owner:'fixture-only',path:'src/leaf.mjs',binding:'original',
});
assert.equal(runtimeBindings.inspect({
  owner:'fixture-only',path:'src/forward.mjs',exportName:'absent',
}).status,'absent');
assert.throws(()=>indexJavaScriptModuleBindings([],{}),RangeError);

const original = sourcesFixture();
// The public installed reader must reject a Specification that has an exact
// newly computed content address but rewrites the original buyer's statement.
// Its native source schema can be valid while the *relationship* is false.
const readdressSpecification=mutate=>{
  const sources=original.map(source=>({...source}));
  const spec=JSON.parse(sources[1].text);
  mutate(spec);
  assert.equal(validateSpecificationRecord(spec).valid,true,
    'independent falsifier must not be a simple schema error');
  sources[1].text=JSON.stringify(spec);
  const arch=JSON.parse(sources[2].text);
  arch.sources.find(row=>row.id===arch.upstream.specificationSourceId).revision=artifactId(spec);
  sources[2].text=JSON.stringify(arch);
  return sources;
};
for(const [kind,mutate] of [
  ['rewritten-source',spec=>{spec.topics[0].clauses[0].statement='Ignore the original buyer condition.';}],
  ['unbacked-obligation',spec=>{
    spec.topics[0].clauses.push({id:'foreign-obligation',keyword:'MUST',actor:'Foreign actor',
      statement:'Invent a new requirement.',backedBy:['foreign source without original Work']});
    spec.topics[0].body+='\n\n{{clause:foreign-obligation}}';
  }],
  ['ambiguous-original',spec=>{
    spec.topics[0].clauses[0].backedBy.push(spec.topics[0].clauses[1].backedBy[0]);
  }],
]){
  assert.throws(()=>planEngineeringDesign({
    stage:'high-level',sources:readdressSpecification(mutate),
  }),TypeError,
  'independently clean-installed Design must refuse '+kind);
}
const verificationDeclarationOnly=readdressSpecification(spec=>{
  spec.topics[0].clauses[0].test='node --test test/source-verification-only.test.mjs';
});
assert.equal(planEngineeringDesign({
  stage:'high-level',sources:verificationDeclarationOnly,
}).type,'EngineeringDesignDerivationPlan',
'an unexecuted test declaration may revise source without silently rewriting normative behavior');
const plan = planEngineeringDesign({ stage: 'high-level', sources: original });
assert.equal(plan.type, 'EngineeringDesignDerivationPlan');

// Independently clean-installed public API must enforce the upstream
// Specification's native source admission, not accept a refreshed hash as
// evidence of a valid Specification or an independently reviewed stage.
const malformedSpecificationCut=original.map(source=>({...source}));
const malformedSpecification=JSON.parse(malformedSpecificationCut[1].text);
malformedSpecification.topics[0].clauses[0].admitted=true;
malformedSpecificationCut[1].text=JSON.stringify(malformedSpecification);
const relabeledArchitecture=JSON.parse(malformedSpecificationCut[2].text);
relabeledArchitecture.sources.find(source=>
  source.id===relabeledArchitecture.upstream.specificationSourceId
).revision=artifactId(malformedSpecification);
malformedSpecificationCut[2].text=JSON.stringify(relabeledArchitecture);
assert.throws(()=>planEngineeringDesign({
  stage:'high-level',sources:malformedSpecificationCut,
}),/selected source cut|Invalid engineering design input or source projection/u,
'installed Design consumer must reject an invalid Specification even under an exact content address');


// Native packed-consumer composition: original review projector → original
// HLD receiver through the public, separately installed package export.
// No model output, Proof or original Work grant is synthesized.
const review={components:[
  {id:'component-a',owner:'fixture-data-owner',layer:'data',
    responsibility:'Maintain source A.',requires:[],specificationClauseIds:['clause-a']},
  {id:'component-b',owner:'fixture-data-owner',layer:'data',
    responsibility:'Maintain source B.',requires:[],specificationClauseIds:['clause-b']},
],openQuestions:['Independent admission and Proof have not been received.']};
const reviewText=JSON.stringify(review);
const reviewDigest='sha256:'+createHash('sha256').update(reviewText,'utf8').digest('hex');
const reviewedSourceCut=plan.sources.map(({kind,digest})=>({kind,digest}));
const reviewRequest={sources:original,reviewText,
  expectedReviewSha256:reviewDigest,reviewedSourceCut,
  limits:{maxReviewBytes:65536,maxComponents:16,maxRequirements:32,maxTraceRows:16}};
const receivedReview=receiveEngineeringHighLevelReview(reviewRequest);
assert.equal(receivedReview.type,'EngineeringDesignReviewProjection');
assert.equal(receivedReview.candidate.type,'EngineeringDesignCandidate');
assert.equal(receivedReview.candidate.admitted,false);
assert.equal(receivedReview.candidate.proof,'unreceived');
assert.deepEqual(receivedReview.candidate,receiveEngineeringDesign({
  stage:'high-level',sources:original,plan,
  deliveryText:receivedReview.deliveryText,
}));
const command='node_modules/@red-cup-engineering/specification-engineering-services-section/scripts/receive-engineering-high-level-review.mjs';
const cliReview=spawnSync(process.execPath,[command],{
  input:JSON.stringify(reviewRequest),encoding:'utf8',
  maxBuffer:2*1024*1024,timeout:20_000,
});
assert.equal(cliReview.status,0,cliReview.stderr);
assert.deepEqual(JSON.parse(cliReview.stdout),receivedReview,
  'packed CLI and package API must read the exact same original source review');
const alteredReview=spawnSync(process.execPath,[command],{
  input:JSON.stringify({...reviewRequest,expectedReviewSha256:'sha256:'+'0'.repeat(64)}),
  encoding:'utf8',maxBuffer:2*1024*1024,timeout:20_000,
});
assert.equal(alteredReview.status,1,'stale review digest must refuse in installed consumer');
assert.equal(alteredReview.stdout,'','source disagreement cannot emit a partial product');
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

// The actual separately installed PUBLIC npm Design consumer must project a
// request that the original CIE typed root can admit, not pass abstract
// messages/schema fields silently ignored or refused by CIE.
for (const stagePlan of [plan,lowPlan]) {
  const oldPlan=structuredClone(stagePlan);
  const work=readEngineeringDesignInferenceWork(stagePlan);
  assert.deepEqual(Object.keys(work).sort(),[
    'objective','context','contextOptimization','taskClass',
    'outputSchema','enforceProviderSchema','requiredCapabilities',
  ].sort());
  assert.deepEqual(JSON.parse(work.context),{stage:stagePlan.stage,sources:stagePlan.sources});
  assert.equal(work.contextOptimization.mode,'exact');
  assert.equal(work.enforceProviderSchema,true);
  assert.deepEqual(work.requiredCapabilities,['json-schema-output']);
  assert.deepEqual(work.outputSchema,stagePlan.request.schema);
  work.outputSchema.type='array';
  assert.deepEqual(stagePlan,oldPlan);
  const forged=structuredClone(stagePlan);
  forged.request.schema={type:'string'};
  assert.throws(()=>readEngineeringDesignInferenceWork(forged),TypeError);
}


// The distinct, independently installed npm consumer must exercise the
// shared strict JSON reader INSIDE both original Design interface schemas.
// The provider's raw outer JSON remains valid; only the nested, normative
// Code schema is ambiguous. Never silently project a last-key-wins contract.
for (const nested of [
  '{"type":"object","required":["keep"],"required":[]}',
  '{"type":"object","properties":{"x":{"type":"string"},"x":{"type":"null"}}}',
  '{"type":"object","required":["keep"],"\\u0072equired":[]}',
  '{"description":"\\ud800"}',
]) {
  assert.doesNotThrow(()=>JSON.parse(nested),
    'negative control: ordinary JSON.parse does not preserve normative source');
  for (const interfaceKey of ['inputSchemaJson','outputSchemaJson']) {
    const ambiguousInterface=structuredClone(low.design);
    ambiguousInterface.operations[0][interfaceKey]=nested;
    assert.deepEqual(receiveEngineeringDesign({
      stage:'low-level',sources:lowSources,plan:lowPlan,
      deliveryText:JSON.stringify(ambiguousInterface),
    }),{type:'EngineeringDesignDerivationRefusal',reason:'invalid-design'},
    'an installed Design reader must refuse ambiguous Code schema: '+interfaceKey);
  }
}
// The packed Design interfaces must use the incumbent Draft 2020-12
// supplier, not accept a JSON-parsable but invalid normative contract.
for (const invalidSchema of [
  '{"type":23}', '{"required":"source"}',
  '{"properties":{"source":{"type":23}}}',
  '{"$schema":"http://json-schema.org/draft-07/schema#","type":"object"}',
]) {
  assert.doesNotThrow(()=>JSON.parse(invalidSchema));
  for (const field of ['inputSchemaJson','outputSchemaJson']) {
    const invalidDesign=structuredClone(low.design);
    invalidDesign.operations[0][field]=invalidSchema;
    assert.deepEqual(receiveEngineeringDesign({
      stage:'low-level',sources:lowSources,plan:lowPlan,
      deliveryText:JSON.stringify(invalidDesign),
    }),{type:'EngineeringDesignDerivationRefusal',reason:'invalid-design'},
    'a clean installed npm consumer must refuse malformed '+field);
  }
}
const concreteInterface=structuredClone(low.design);
concreteInterface.operations[0].inputSchemaJson='false';
concreteInterface.operations[0].outputSchemaJson=
  '{"type":"object","required":["value"],"properties":{"value":{"type":"string"}},"additionalProperties":false}';
const concreteDelivery=JSON.stringify(concreteInterface);
const concreteCandidate=receiveEngineeringDesign({
  stage:'low-level',sources:lowSources,plan:lowPlan,
  deliveryText:concreteDelivery,
});
assert.equal(concreteCandidate.type,'EngineeringDesignCandidate');
const concreteWork=readEngineeringCodeWork({
  designCandidate:concreteCandidate,originalPlan:lowPlan,
  originalDeliveryText:concreteDelivery,sourceViews:[],
});
assert.equal(concreteWork.targets[0].interface.inputSchema,false);
assert.deepEqual(concreteWork.targets[0].interface.outputSchema,{
  type:'object',required:['value'],properties:{value:{type:'string'}},
  additionalProperties:false,
});
assert.equal(concreteWork.executableWork,false);
assert.equal(concreteWork.independentProof,'unreceived');

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
// Independent installed-package consumer: the original normative source test
// reaches the prospective Code target. One missing test stays missing rather
// than being replaced with a model-authored LLD expectation.
const verifiedSources=original.map(row=>({...row}));
const verifiedSpecification=JSON.parse(verifiedSources[1].text);
verifiedSpecification.topics[0].clauses[0].test='node --test test/original-source-a.test.mjs';
verifiedSources[1].text=JSON.stringify(verifiedSpecification);
const verifiedArchitecture=JSON.parse(verifiedSources[2].text);
verifiedArchitecture.sources.find(row=>row.id==='specification').revision=
  artifactId(verifiedSpecification);
verifiedSources[2].text=JSON.stringify(verifiedArchitecture);
const verifiedHldPlan=planEngineeringDesign({stage:'high-level',sources:verifiedSources});
const verifiedHigh=receiveEngineeringDesign({
  stage:'high-level',sources:verifiedSources,plan:verifiedHldPlan,
  deliveryText:JSON.stringify(hld),
});
assert.equal(verifiedHigh.type,'EngineeringDesignCandidate');
const verifiedLowSources=[...verifiedSources,
  {kind:'high-level',text:JSON.stringify(verifiedHigh)}];
const verifiedLowPlan=planEngineeringDesign({stage:'low-level',sources:verifiedLowSources});
const verifiedLow=receiveEngineeringDesign({
  stage:'low-level',sources:verifiedLowSources,plan:verifiedLowPlan,
  deliveryText:JSON.stringify(low.design),
});
assert.equal(verifiedLow.type,'EngineeringDesignCandidate');
const verifiedWork=readEngineeringCodeWork({
  designCandidate:verifiedLow,originalPlan:verifiedLowPlan,
  originalDeliveryText:JSON.stringify(low.design),sourceViews:sourceCut,
});
assert.deepEqual(verifiedWork.targets[0].testObligations.sourceVerification,[
  {requirementCellId:'source-req:a',specificationClauseId:'clause-a',
    test:'node --test test/original-source-a.test.mjs',status:'declared-unverified'},
  {requirementCellId:'source-req:b',specificationClauseId:'clause-b',
    test:null,status:'verification-test-not-declared'},
]);
assert.deepEqual(verifiedWork.sourceVerification,{
  scope:'original-specification-clauses',
  status:'source-tests-missing',
  clauseCount:2,
  declaredTestCount:1,
  missingClauseIds:['clause-b'],
},'the installed public Code Work readout cannot hide an untested source obligation');
assert.equal(verifiedWork.status,'source-present-unassayed',
  'valid source export syntax does not imply source intent was verified');
assert.equal(verifiedWork.independentProof,'unreceived');
assert.equal(verifiedWork.executableWork,false);
assert.equal(verifiedWork.beneficiaryReceived,false);
// A source test is normative text. Changing it under an old source address
// cannot preserve a formerly received HLD/LLD or Code target.
const staleSources=verifiedSources.map(row=>({...row}));
const staleSpec=JSON.parse(staleSources[1].text);
staleSpec.topics[0].clauses[0].test='node --test test/new-assertion.mjs';
staleSources[1].text=JSON.stringify(staleSpec);
assert.throws(()=>planEngineeringDesign({stage:'high-level',sources:staleSources}),
  TypeError,'fresh Specification verification requires fresh Architecture source receiving');

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

// The genuine separately installed npm package (not test authors' checkout)
// must carry a reviewed denied-target source through original Design→Code
// Work without declaring the forbidden action performed, accepted or proved.
const deniedSources=sourceWithDeniedCondition();
const deniedRequirement=JSON.parse(deniedSources[0].text);
const deniedHldPlan=planEngineeringDesign({stage:'high-level',sources:deniedSources});
const deniedHigh=receiveEngineeringDesign({
  stage:'high-level',sources:deniedSources,plan:deniedHldPlan,
  deliveryText:JSON.stringify(hld),
});
assert.equal(deniedHigh.type,'EngineeringDesignCandidate');
assert.equal(deniedHigh.admitted,false);
assert.equal(deniedHigh.proof,'unreceived');
const deniedLowSources=[
  ...deniedSources,{kind:'high-level',text:JSON.stringify(deniedHigh)},
];
const deniedLldPlan=planEngineeringDesign({
  stage:'low-level',sources:deniedLowSources,
});
const deniedLld=structuredClone(low.design);
deniedLld.operations[0].behavior=
  'Preserve original source and refuse supplier output without recipient acceptance';
deniedLld.operations[0].failureCases=[
  'Supplier attempts to call an unreceived result accepted',
];
const deniedLow=receiveEngineeringDesign({
  stage:'low-level',sources:deniedLowSources,plan:deniedLldPlan,
  deliveryText:JSON.stringify(deniedLld),
});
assert.equal(deniedLow.type,'EngineeringDesignCandidate');
assert.equal(deniedLow.admitted,false);
assert.equal(deniedLow.proof,'unreceived');
const deniedCode=readEngineeringCodeWork({
  designCandidate:deniedLow,originalPlan:deniedLldPlan,
  originalDeliveryText:JSON.stringify(deniedLld),sourceViews:[],
});
assert.deepEqual(deniedCode.targets[0].originalTrace.map(row=>row.requirementCellId),
  deniedRequirement['met-when'].map(row=>row.cell));
assert.deepEqual(deniedCode.targets[0].originalTrace.map(row=>row.sourceTarget),
  ['held','denied'],
  'actual installed Code Work consumer retains source evidence polarity, not only IDs');
assert.equal(Object.isFrozen(deniedCode.targets[0].originalTrace[1]),true);
assert.equal(deniedRequirement['met-when'][1].target,'denied');
assert.equal(JSON.parse(deniedSources[1].text).topics[0].clauses[1].keyword,'MUST NOT');
assert.equal(deniedCode.sourceVerification.status,'source-tests-missing');
assert.equal(deniedCode.originalDesignAdmitted,false);
assert.equal(deniedCode.independentProof,'unreceived');
assert.equal(deniedCode.executableWork,false);
assert.equal(deniedCode.beneficiaryReceived,false);
assert.throws(()=>planEngineeringDesign({
  stage:'high-level',sources:sourceWithDeniedCondition({target:'unknown'}),
}),TypeError,'an unknown source target cannot enter Design even with refreshed source cuts');
console.log('Packed Requirement target held + denied: original Design/Code Work traces survive; Proof, original native fabrication and recipient receiving remain open.');

// Packed Architecture impact source revision pressure must preserve original root asks.
// This independently installed package (not ../src) uses the original native
// Requirement/Specification/Architecture fixture with its true SEN addresses.
// Unadmitted fixture source values do not grant original Work or Proof.
const sourceImpactTriples=()=>{
  const [r,s,a]=sourcesFixture();
  return {
    requirement:JSON.parse(r.text),
    specification:JSON.parse(s.text),
    architecture:JSON.parse(a.text),
  };
};
const sourceImpactBefore=sourceImpactTriples();
const sourceImpactAfter=structuredClone(sourceImpactBefore);
sourceImpactAfter.requirement.asks=[
  'The original buyer now requires an additional independently tested refusal.',
];
const oldSourceAddress=artifactId(sourceImpactBefore.requirement);
const nextSourceAddress=artifactId(sourceImpactAfter.requirement);
sourceImpactAfter.specification.provenance.derivedFrom=[
  sourceImpactAfter.requirement.id+'@'+nextSourceAddress,
];
for(const topic of sourceImpactAfter.specification.topics)
  for(const clause of topic.clauses)
    clause.backedBy=clause.backedBy.map(reference=>
      reference.replace(' ('+oldSourceAddress+'), cell ',
        ' ('+nextSourceAddress+'), cell '));
sourceImpactAfter.architecture.sources.find(x=>x.id==='requirement').revision=
  nextSourceAddress;
sourceImpactAfter.architecture.sources.find(x=>x.id==='specification').revision=
  artifactId(sourceImpactAfter.specification);
const originalPressure=readRequirementRevisionPressure(
  sourceImpactBefore.requirement,sourceImpactAfter.requirement);
assert.equal(originalPressure.summary.originalRequestsChanged,true);
assert.equal(originalPressure.downstreamRegenerationRequired,true);
const installedImpact=readRequirementArchitectureImpact(
  sourceImpactBefore,sourceImpactAfter);
assert.equal(installedImpact.summary.regenerationCells,2,
  'the real packed Architecture impact reader must propagate original root-level buyer demand changes');
assert.equal(installedImpact.summary.requalificationOnlyCells,0);
assert.ok(installedImpact.changes.every(row=>
  row.reasons.includes('original-requests-changed')));
assert.equal(installedImpact.originalEffect,'none-read-only');
assert.equal(installedImpact.independentlyAcceptedCustomerWork,false);
console.log('Packed original Architecture change impact: root Requirement speech changes propagate two selected code-facing regenerations; no native Work or Proof effect.');

// Packed independent verification-declaration-only impact: use the actual
// public npm-installed Architecture reader, not a checkout or separate
// factory. An authored Specification.test changes which test needs receiving
// but cannot by itself rewrite the implementation's normative behavior.
const testOnlyCut=structuredClone(sourceImpactBefore);
testOnlyCut.specification.topics[0].clauses[0].test=
  'node --test test/independently-authored-source-check.test.mjs';
testOnlyCut.architecture.sources.find(x=>x.id==='specification').revision=
  artifactId(testOnlyCut.specification);
const verificationOnly=readRequirementArchitectureImpact(
  sourceImpactBefore,testOnlyCut);
assert.equal(verificationOnly.summary.regenerationCells,0);
assert.equal(verificationOnly.summary.requalificationOnlyCells,2);
assert.ok(verificationOnly.changes.find(x=>x.cell==='source-req:a').reasons.includes(
  'verification-declaration-changed'));
assert.equal(verificationOnly.originalEffect,'none-read-only');
assert.equal(verificationOnly.independentlyAcceptedCustomerWork,false);
console.log('Packed independent verification-declaration-only impact: two original requirements require source requalification, zero Code rewrites, and Proof remains unreceived.');
