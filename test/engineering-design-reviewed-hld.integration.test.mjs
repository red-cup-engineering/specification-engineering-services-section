// Engineering #137: original Requirement → Specification → Architecture →
// qualified high-level design REVIEW. No inference, Code write or stage adoption.
import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { validateJsonSchema } from '@red-cup-engineering/json-schema-services-section/validation';
import { semanticIdOf } from '@red-cup-engineering/computer-data-engineering-services-section/semiotic-expression-notation/semantic-content-identity';
import { sourcesFixture } from './engineering-design-source-cut.fixture.mjs';
import {
  planEngineeringDesign, receiveEngineeringDesign,
  receiveEngineeringHighLevelReview, readEngineeringDesignInferenceWork,
  readEngineeringCodeWork,
} from '../src/engineering-design.mjs';

const copy = value => structuredClone(value);
const digest = text => 'sha256:' + createHash('sha256').update(text, 'utf8').digest('hex');
const limits = Object.freeze({
  maxReviewBytes: 65536, maxComponents: 16, maxRequirements: 32, maxTraceRows: 16,
});

function reviewFixture() {
  return {
    components: [
      { id: 'comp-a', owner: 'fixture-data-owner', layer: 'data',
        responsibility: 'Retain independently sourced A', provides: [], requires: [],
        specificationClauseIds: ['clause-a'] },
      { id: 'comp-b', owner: 'fixture-data-owner', layer: 'data',
        responsibility: 'Retain independently sourced B', provides: [], requires: [],
        specificationClauseIds: ['clause-b'] },
    ],
    openQuestions: ['Original Office source adoption and Proof remain unreceived.'],
  };
}
function request(review = reviewFixture(), sources = sourcesFixture(), bounds = limits) {
  const reviewText = JSON.stringify(review);
  const plan=planEngineeringDesign({stage:'high-level',sources});
  const reviewedSourceCut=plan.sources.map(({kind,digest})=>({kind,digest}));
  return {sources, reviewText, expectedReviewSha256: digest(reviewText),
    reviewedSourceCut, limits: bounds};
}
function acceptedProjection(value) {
  assert.equal(value.type, 'EngineeringDesignReviewProjection');
  assert.equal(value.version, 1);
  assert.equal(value.originalReview.expectedSha256, digest(value.reviewText));
  assert.match(value.originalReview.semanticId, /^ni:\/\/\/sha-256;/u);
  assert.equal(value.admitted, false);
  assert.equal(value.independentReview, 'unreceived');
  assert.equal(value.proof, 'unreceived');
  assert.equal(value.executableWork, false);
  assert.equal(value.candidate.type, 'EngineeringDesignCandidate');
  assert.equal(value.candidate.stage, 'high-level');
  assert.equal(value.candidate.admitted, false);
  assert.equal(value.candidate.proof, 'unreceived');
}

test('original review projection composes with the same exact-source Design receiver, no inference', () => {
  const input=request();
  const actual=receiveEngineeringHighLevelReview(input);
  acceptedProjection(actual);
  const originalPlan=planEngineeringDesign({stage:'high-level',sources:input.sources});
  const independentlyReceived=receiveEngineeringDesign({
    stage:'high-level',sources:input.sources,plan:originalPlan,
    deliveryText:actual.deliveryText,
  });
  assert.deepEqual(actual.candidate,independentlyReceived);
  assert.deepEqual(actual.sourceCut, originalPlan.sources.map(({kind,digest})=>({kind,digest})));
  assert.deepEqual(actual.candidate.design.components.map(c=>c.id),['comp-a','comp-b']);
  assert.equal(actual.candidate.design.traceability.length,2);
  assert.equal(actual.candidate.design.traceability[0].requirementCellId,'source-req:a');
  assert.equal(actual.candidate.design.traceability[1].requirementCellId,'source-req:b');
  // End-to-end stage composition: native source-qualified HLD becomes EXACTLY
  // the fourth source of the incumbent LLD planner. It cannot become Proof.
  const lowLevelSources=[...input.sources,
    {kind:'high-level',text:JSON.stringify(actual.candidate)}];
  const lowLevel=planEngineeringDesign({stage:'low-level',sources:lowLevelSources});
  assert.equal(lowLevel.type,'EngineeringDesignDerivationPlan');
  assert.equal(lowLevel.stage,'low-level');
  assert.equal(lowLevel.sources.length,4);
  assert.equal(lowLevel.sources[3].kind,'high-level');
  assert.deepEqual(lowLevel.sources.slice(0,3),originalPlan.sources);
  assert.deepEqual(actual,receiveEngineeringHighLevelReview(copy(input)),
    'same exact source and original reviewed allocation must replay byte-equivalently');
});

test('the reviewed source is byte-pinned; changed review is not accepted under old digest', () => {
  const input=request();
  const forged={...input,reviewText:input.reviewText.replace('sourced A','unsourced A')};
  assert.throws(()=>receiveEngineeringHighLevelReview(forged),/review source digest/i);
  const changed=request({...reviewFixture(),openQuestions:['Opposing evidence is still unreviewed.']});
  const result=receiveEngineeringHighLevelReview(changed);
  acceptedProjection(result);
  assert.notEqual(result.originalReview.expectedSha256,
    receiveEngineeringHighLevelReview(input).originalReview.expectedSha256);
  assert.notDeepEqual(result.candidate.design,receiveEngineeringHighLevelReview(input).candidate.design);
});

test('source-cut mismatch refuses instead of laundering an old review into a new Architecture', () => {
  const input=request();
  const changed=copy(input);
  changed.sources[2].text=changed.sources[2].text.replace('Component for A.',
    'Unreviewed different source concern.');
  assert.deepEqual(receiveEngineeringHighLevelReview(changed),
    {type:'EngineeringDesignDerivationRefusal',reason:'source-cut-mismatch'});
});

test('no missing or foreign clause, arbitrary extra key, or duplicate-key JSON can enter Design', () => {
  const input=request();
  for (const bad of [
    {...reviewFixture(),components:[{...reviewFixture().components[0],
      specificationClauseIds:['foreign-clause']},reviewFixture().components[1]]},
    {...reviewFixture(),components:[{...reviewFixture().components[0],
      specificationClauseIds:[]},reviewFixture().components[1]]},
    {...reviewFixture(),arbitraryNewGrant:true},
  ]) {
    const value=receiveEngineeringHighLevelReview(request(bad));
    assert.deepEqual(value,{type:'EngineeringDesignDerivationRefusal',
      reason:'invalid-review'});
  }
  const ambiguous=input.reviewText.replace('"responsibility":"Retain independently sourced A"',
    '"responsibility":"foreign behavior","responsibility":"Retain independently sourced A"');
  const value=receiveEngineeringHighLevelReview({
    ...input,reviewText:ambiguous,expectedReviewSha256:digest(ambiguous),
  });
  assert.deepEqual(value,{type:'EngineeringDesignDerivationRefusal',
    reason:'invalid-review'});
});

test('a cyclic but trace-shaped projection is refused by the original Design checker', () => {
  const bad=reviewFixture();
  bad.components[0].layer='code';
  bad.components[1].layer='code';
  // The two original components independently offer valid compatible ports.
  // Their graph, not a missing port contract, must be what refuses the cycle.
  const s='{"type":"string"}';
  bad.components[0].provides=[{port:'a-value',schemaJson:s}];
  bad.components[1].provides=[{port:'b-value',schemaJson:s}];
  bad.components[0].requires=[{componentId:'comp-b',port:'b-value',schemaJson:s}];
  bad.components[1].requires=[{componentId:'comp-a',port:'a-value',schemaJson:s}];
  const value=receiveEngineeringHighLevelReview(request(bad));
  assert.deepEqual(value,{type:'EngineeringDesignDerivationRefusal',
    reason:'invalid-design'});
});

test('host-selected finite review limits refuse before projection or inference', () => {
  const input=request();
  for (const bounds of [
    null, {}, {...limits,maxReviewBytes:0}, {...limits,maxComponents:1},
    {...limits,maxTraceRows:1}, {...limits,maxRequirements:-1},
    {...limits,maxReviewBytes:input.reviewText.length-1},
    {...limits,unknownGrant:true},
  ]) assert.throws(()=>receiveEngineeringHighLevelReview({...input,limits:bounds}),
    /review bounds|review budget/u);
  assert.throws(()=>receiveEngineeringHighLevelReview({...input,
    expectedReviewSha256:'sha256:'+'0'.repeat(64)}),/review source digest/u);
});

test('ENG-20: independently authored provider port contract and consumer demand must compose, not be synthesized',()=>{
  // This is a held-out composition assay of the ORIGINAL reviewed-HLD
  // consumer. Both independent authorship and the physical value grammar
  // matter: having a port name is not evidence that its source exists.
  const positiveSchema=JSON.stringify({
    $schema:'https://json-schema.org/draft/2020-12/schema',
    type:'integer',minimum:0,
  });
  const incompatibleSchema=JSON.stringify({
    $schema:'https://json-schema.org/draft/2020-12/schema',
    type:'string',minLength:1,
  });
  // Independent incumbent Draft 2020-12 evaluator: the two proposed
  // contracts are genuinely different predicates over actual values, not
  // merely two hashes or self-asserted source labels.
  assert.equal(validateJsonSchema(7,JSON.parse(positiveSchema)).valid,true);
  assert.equal(validateJsonSchema('value',JSON.parse(positiveSchema)).valid,false);
  assert.equal(validateJsonSchema('value',JSON.parse(incompatibleSchema)).valid,true);
  assert.equal(validateJsonSchema(7,JSON.parse(incompatibleSchema)).valid,false);

  const linked=reviewFixture();
  linked.components[0].provides=[{port:'source-values',schemaJson:positiveSchema}];
  linked.components[1].provides=[];
  linked.components[1].requires=[{
    componentId:'comp-a',port:'source-values',schemaJson:positiveSchema,
  }];
  const received=receiveEngineeringHighLevelReview(request(linked));
  acceptedProjection(received);
  assert.deepEqual(received.candidate.design.components.map(c=>({
    id:c.id,providedPorts:c.providedPorts,requiredPorts:c.requiredPorts,
  })),[
    {id:'comp-a',providedPorts:['source-values'],requiredPorts:[]},
    {id:'comp-b',providedPorts:[],requiredPorts:['source-values']},
  ]);
  assert.deepEqual(received.candidate.design.connections,[{
    fromComponentId:'comp-a',toComponentId:'comp-b',port:'source-values',
  }]);
  assert.equal(received.reviewText,JSON.stringify(linked),
    'provider contract must remain in the pinned original review source');
  assert.equal(received.admitted,false);
  assert.equal(received.proof,'unreceived');

  const absent=structuredClone(linked);
  absent.components[0].provides=[];
  assert.deepEqual(receiveEngineeringHighLevelReview(request(absent)),{
    type:'EngineeringDesignDerivationRefusal',reason:'invalid-review',
  },'a consumer must not create a fictional provided port');

  const contradictory=structuredClone(linked);
  contradictory.components[1].requires[0].schemaJson=incompatibleSchema;
  assert.deepEqual(receiveEngineeringHighLevelReview(request(contradictory)),{
    type:'EngineeringDesignDerivationRefusal',reason:'invalid-review',
  },'locally admissible integer and string boundaries do not compose');
  const ungrounded=structuredClone(linked);
  ungrounded.components[0].provides[0].independentlyReceived=true;
  assert.deepEqual(receiveEngineeringHighLevelReview(request(ungrounded)),{
    type:'EngineeringDesignDerivationRefusal',reason:'invalid-review',
  },'a purported review flag is not an authored or independently received contract');

  const controls=structuredClone(linked);
  controls.components[1].requires[0].port='source-values'+String.fromCharCode(10);
  assert.deepEqual(receiveEngineeringHighLevelReview(request(controls)),{
    type:'EngineeringDesignDerivationRefusal',reason:'invalid-review',
  },'control characters must not survive the original typed port boundary');

  const duplicate=structuredClone(linked);
  duplicate.components[0].provides.push({
    port:'source-values',schemaJson:positiveSchema,
  });
  assert.deepEqual(receiveEngineeringHighLevelReview(request(duplicate)),{
    type:'EngineeringDesignDerivationRefusal',reason:'invalid-review',
  },'the provider cannot offer two contradictory claims at one port');

  const forged=structuredClone(linked);
  forged.components[0].provides[0].schemaJson=
    '{"type":"integer","type":"string"}';
  assert.deepEqual(receiveEngineeringHighLevelReview(request(forged)),{
    type:'EngineeringDesignDerivationRefusal',reason:'invalid-review',
  },'a duplicate JSON Schema member cannot erase original producer testimony');

  const wrongExternal=structuredClone(linked);
  wrongExternal.components[0].provides[0].schemaJson=
    '{"$ref":"https://unreceived.example/schema.json"}';
  wrongExternal.components[1].requires[0].schemaJson=
    wrongExternal.components[0].provides[0].schemaJson;
  assert.deepEqual(receiveEngineeringHighLevelReview(request(wrongExternal)),{
    type:'EngineeringDesignDerivationRefusal',reason:'invalid-review',
  },'two matching but unreceived external references do not establish a portable contract');
});


test('ENG-137: reviewed provider and consumer interface meaning survives HLD→LLD→Code without authoring new source', () => {
  // Original Specification's independent test descriptions are declared in its
  // source record, not invented downstream to make CIE work submit-able.
  const sources=sourcesFixture();
  const spec=JSON.parse(sources[1].text);
  for (const clause of spec.topics.flatMap(topic=>topic.clauses))
    clause.test='node --test test/source-'+clause.id+'.test.mjs';
  sources[1].text=JSON.stringify(spec);
  const arch=JSON.parse(sources[2].text);
  arch.sources.find(row=>row.id==='specification').revision=
    semanticIdOf('metroplat.artifact')(spec);
  sources[2].text=JSON.stringify(arch);

  const typed=reviewFixture();
  const schemaJson=JSON.stringify({type:'integer',minimum:0});
  typed.components[0].provides=[{port:'source-values',schemaJson}];
  typed.components[1].requires=[
    {componentId:'comp-a',port:'source-values',schemaJson}];
  const input=request(typed,sources);
  const reviewed=receiveEngineeringHighLevelReview(input);
  acceptedProjection(reviewed);
  assert.equal(reviewed.candidate.design.connections.length,1);

  // Original HLD REVIEW, not its lossy name-only candidate, is the fourth
  // original source. No new Work registry or forged independent acceptance.
  const lowSources=[...sources,{kind:'high-level',text:JSON.stringify(reviewed)}];
  const plan=planEngineeringDesign({stage:'low-level',sources:lowSources});
  const inference=readEngineeringDesignInferenceWork(plan);
  assert.equal(inference.enforceProviderSchema,true);
  assert.equal(JSON.parse(inference.context).sources[3].text,lowSources[3].text);
  assert.equal(inference.taskClass,'code-fabrication');

  const operations=typed.components.map((component,index)=>({
    id:'op-'+component.id,componentId:component.id,
    module:'src/retain-'+component.id+'.mjs',
    exportName:'retain'+(index===0?'A':'B'),
    inputSchemaJson:'{}',outputSchemaJson:'{}',
    behavior:'Prospective retained source result '+component.id,
    preconditions:[],postconditions:['Retained original requirement value'],
    failureCases:['Missing or incompatible original source'],
    resourceBounds:['Original host limit pending'],
    effectBoundaries:['No authorized effects without Proof'],
    acceptanceObligations:['Independent reviewer still owed'],
  }));
  const design={
    operations,
    traceability:reviewed.candidate.design.traceability.map(row=>({
      ...row,
      designElementIds:row.designElementIds.map(id=>'op-'+id),
    })),
    openQuestions:['LLD semantic refinement remains unreceived'],
  };
  const deliveryText=JSON.stringify(design);
  const candidate=receiveEngineeringDesign({
    stage:'low-level',sources:lowSources,plan,deliveryText,
  });
  assert.equal(candidate.type,'EngineeringDesignCandidate');
  assert.equal(candidate.proof,'unreceived');
  assert.equal(candidate.admitted,false);

  const code=readEngineeringCodeWork({
    designCandidate:candidate,originalPlan:plan,originalDeliveryText:deliveryText,
    sourceViews:[],
  });
  assert.equal(code.executableWork,false);
  assert.equal(code.independentProof,'unreceived');
  const provider=code.targets.find(row=>row.componentId==='comp-a');
  const consumer=code.targets.find(row=>row.componentId==='comp-b');
  assert.equal(provider.reviewedPortContracts.provided[0].port,'source-values');
  assert.equal(consumer.reviewedPortContracts.required[0].port,'source-values');
  assert.equal(provider.reviewedPortContracts.reviewSha256,digest(input.reviewText));
  assert.equal(provider.reviewedPortContracts.provided[0].schemaIdentity,
    consumer.reviewedPortContracts.required[0].schemaIdentity);
  assert.equal(code.targets.every(row=>row.testObligations.status==='unreceived'),true);
  assert.deepEqual(readEngineeringCodeWork({
    designCandidate:candidate,originalPlan:plan,originalDeliveryText:deliveryText,
    sourceViews:[],
  }),code,'same exact reviewed cut must replay without a new generator');
});

test('ENG-137: name-only connected HLD cannot mint CIE work, and spoofed or stale original reviews refuse', () => {
  const sources=sourcesFixture();
  const spec=JSON.parse(sources[1].text);
  for(const clause of spec.topics.flatMap(topic=>topic.clauses))
    clause.test='node --test test/independent-'+clause.id+'.test.mjs';
  sources[1].text=JSON.stringify(spec);
  const arch=JSON.parse(sources[2].text);
  arch.sources.find(row=>row.id==='specification').revision=
    semanticIdOf('metroplat.artifact')(spec);
  sources[2].text=JSON.stringify(arch);
  const sourceReview=reviewFixture();
  const schemaJson='{"type":"integer"}';
  sourceReview.components[0].provides=[{port:'actual-provider',schemaJson}];
  sourceReview.components[1].requires=[
    {componentId:'comp-a',port:'actual-provider',schemaJson}];
  const reviewed=receiveEngineeringHighLevelReview(request(sourceReview,sources));
  acceptedProjection(reviewed);

  const fourth = row => [...sources,{kind:'high-level',text:JSON.stringify(row)}];
  const nameOnly=planEngineeringDesign({stage:'low-level',sources:fourth(reviewed.candidate)});
  const refusal=readEngineeringDesignInferenceWork(nameOnly);
  assert.equal(refusal.type,'EngineeringDesignInferenceWorkRefusal');
  assert.equal(refusal.reason,'hld-reviewed-interface-contract-unreceived');
  assert.equal(refusal.inferenceSubmitted,false);
  assert.equal(refusal.executableWork,false);
  assert.equal('outputSchema' in refusal,false);

  // Removing the exact review, altering its provider, deleting its host bounds
  // or replaying it after upstream revision must not preserve a typed witness.
  const missing=structuredClone(reviewed);
  delete missing.reviewText;
  assert.throws(()=>planEngineeringDesign({stage:'low-level',sources:fourth(missing)}),
    TypeError);
  const altered=structuredClone(reviewed);
  altered.reviewText=altered.reviewText.replace('actual-provider','fictitious-provider');
  assert.throws(()=>planEngineeringDesign({stage:'low-level',sources:fourth(altered)}),
    TypeError);
  const forged=structuredClone(reviewed);
  forged.candidate.design.components[0].providedPorts=['other-name'];
  assert.throws(()=>planEngineeringDesign({stage:'low-level',sources:fourth(forged)}),
    TypeError);
  const noBounds=structuredClone(reviewed);
  delete noBounds.limits;
  assert.throws(()=>planEngineeringDesign({stage:'low-level',sources:fourth(noBounds)}),
    TypeError);
  const changed=[...sources];
  const different=JSON.parse(changed[0].text);
  different['met-when'][0].says='Changed original upstream demand.';
  changed[0]={kind:'requirement',text:JSON.stringify(different)};
  assert.throws(()=>planEngineeringDesign({stage:'low-level',sources:[
    ...changed,{kind:'high-level',text:JSON.stringify(reviewed)},
  ]}),TypeError);
});
