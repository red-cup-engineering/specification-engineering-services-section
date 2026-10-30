// Source-cut and cross-stage regressions against the incumbent Engineering
// Design reader. These are synthetic, expressly unadmitted source fixtures;
// passing tests do NOT qualify architecture, Proof, fabrication or an Office.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { semanticIdOf } from '@red-cup-engineering/computer-data-engineering-services-section/semiotic-expression-notation/semantic-content-identity';
import { sourcesFixture, clausesSplitAcrossModels, sourceWithDeniedCondition } from './engineering-design-source-cut.fixture.mjs';
import { planEngineeringDesign, receiveEngineeringDesign,
  readEngineeringDesignInferenceWork,
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


test('exact HLD and LLD plans produce closed original CIE work inputs without changing historical source receipts', () => {
  const sources=sourcesFixture();
  const high=planEngineeringDesign({stage:'high-level',sources});
  const lowSources=[...sources,{kind:'high-level',text:JSON.stringify(hldReceipt(sources))}];
  const low=planEngineeringDesign({stage:'low-level',sources:lowSources});
  // Independent CIE 2026-10-29 contract: inference-work-request.schema.json
  // blob 81608c2608df119d8ddb0f2ecd5cee42fce879a0, additionalProperties:false.
  // CIE direct dispatch source 91c2176 ignores abstract "schema"/"messages".
  const allowedCieKeys=[
    'objective','context','contextOptimization','taskClass',
    'outputSchema','enforceProviderSchema','requiredCapabilities',
  ].sort();
  const closed=(schema) => {
    if (schema.type==='array') return closed(schema.items);
    if (schema.type!=='object') return true;
    const keys=Object.keys(schema.properties);
    return schema.additionalProperties===false &&
      new Set(schema.required).size===keys.length &&
      keys.every(key=>schema.required.includes(key) && closed(schema.properties[key]));
  };
  for (const plan of [high,low]) {
    const original=structuredClone(plan);
    const input=readEngineeringDesignInferenceWork(plan);
    assert.deepEqual(Object.keys(input).sort(),allowedCieKeys);
    assert.equal(input.objective,plan.request.objective+'\n\n'+plan.request.messages[0].content);
    assert.equal(input.context,plan.request.messages[1].content);
    assert.deepEqual(JSON.parse(input.context),{stage:plan.stage,sources:plan.sources});
    assert.deepEqual(input.contextOptimization,{mode:'exact'});
    assert.deepEqual(input.outputSchema,plan.request.schema);
    assert.equal(closed(input.outputSchema),true,'CIE strict mode needs recursively closed schemas');
    assert.equal(input.enforceProviderSchema,true);
    assert.deepEqual(input.requiredCapabilities,['json-schema-output']);
    assert.equal(input.taskClass,'code-fabrication');
    assert.equal(Object.hasOwn(input,'chatCompletion'),false,
      'assistant-turn delivery would bypass plain CIE output-schema candidate assay');
    assert.equal(Object.hasOwn(input,'messages'),false);
    assert.equal(Object.hasOwn(input,'schema'),false);
    input.outputSchema.type='array';
    assert.deepEqual(plan,original,'mutating a projected CIE input cannot rewrite the source-pinned Design plan');
    assert.deepEqual(readEngineeringDesignInferenceWork(plan).outputSchema,original.request.schema);
  }
});

test('forged or changed Design sources, schema or prompt cannot be translated to CIE work', () => {
  const plan=planEngineeringDesign({stage:'high-level',sources:sourcesFixture()});
  const changes=[
    candidate=>{candidate.request.schema={type:'string'};},
    candidate=>{candidate.request.messages[0].content='Forget source obligations';},
    candidate=>{candidate.request.messages[1].content='{}';},
    candidate=>{candidate.request.requiredCapabilities=['chat'];},
    candidate=>{candidate.sources[0].digest='sha256:forged';},
    candidate=>{candidate.sources[0].text=candidate.sources[0].text.replace('source-req','unowned');},
  ];
  for(const change of changes){
    const candidate=structuredClone(plan);
    change(candidate);
    assert.throws(()=>readEngineeringDesignInferenceWork(candidate),TypeError);
  }
  assert.throws(()=>readEngineeringDesignInferenceWork({
    ...plan,request:{...plan.request,messages:[]},
  }),TypeError);
  assert.throws(()=>readEngineeringDesignInferenceWork({
    ...plan,sources:[],
  }),TypeError);
});

test('duplicate normative Requirement member cannot be erased before Design source tracing', () => {
  const sources = sourcesFixture();
  const original = sources[0].text;
  const duplicate = original.replace('"met-when":',
    '"met-when":[{"cell":"source-req:hidden","target":"held","says":"Keep a denied action denied."}],"met-when":');
  assert.notEqual(duplicate, original);
  assert.deepEqual(JSON.parse(duplicate), JSON.parse(original),
    'negative control: ordinary JSON.parse silently discards the first normative member');
  sources[0].text = duplicate;
  assert.throws(() => planEngineeringDesign({stage:'high-level',sources}), TypeError,
    'the original strict JSON admission must refuse conflicting source members');
});

test('duplicate HLD operations and escaped isolated Unicode cannot become received Design', () => {
  const sources = sourcesFixture();
  const plan = planEngineeringDesign({stage:'high-level',sources});
  const valid = JSON.stringify(hldFixture());
  const duplicate = valid.replace('"components":','"components":[],"components":');
  assert.deepEqual(JSON.parse(duplicate),JSON.parse(valid),
    'negative control: JSON.parse makes a different delivery indistinguishable');
  assert.deepEqual(receiveEngineeringDesign({
    stage:'high-level',sources,plan,deliveryText:duplicate,
  }),{type:'EngineeringDesignDerivationRefusal',reason:'invalid-design'});

  const escaped = valid.replace('Retain comp-a','Retain \\u' + 'd800 comp-a');
  assert.equal(escaped.isWellFormed(),true,
    'raw source Unicode checks do not catch escaped isolated surrogate scalars');
  assert.equal(JSON.parse(escaped).components[0].responsibility.isWellFormed(),false);
  assert.deepEqual(receiveEngineeringDesign({
    stage:'high-level',sources,plan,deliveryText:escaped,
  }),{type:'EngineeringDesignDerivationRefusal',reason:'invalid-design'});
});

test('malformed UTF-16 in an original source cut refuses before lossy UTF-8 addressing', () => {
  const sources = sourcesFixture();
  // JSON.parse accepts a raw isolated surrogate in a JSON string, but Node's
  // UTF-8 encoder replaces it with U+FFFD. Without source admission these two
  // distinct authored texts would acquire the same source-content digest.
  const ill = sources[2].text.replace('Synthetic original design',
    'Synthetic ' + String.fromCharCode(0xD800) + ' original design');
  const replacement = sources[2].text.replace('Synthetic original design',
    'Synthetic ' + String.fromCharCode(0xFFFD) + ' original design');
  assert.notEqual(ill, replacement);
  assert.equal(codeDigest(ill), codeDigest(replacement),
    'negative control: hashing before well-formed Unicode admission loses source identity');
  assert.doesNotThrow(() => JSON.parse(ill));
  const changed = sources.map(source => ({ ...source }));
  changed[2].text = ill;
  assert.throws(() => planEngineeringDesign({stage:'high-level', sources: changed}),
    TypeError, 'non-representable raw source is not a distinct admitted source cut');
  assert.equal(planEngineeringDesign({stage:'high-level',sources}).type,
    'EngineeringDesignDerivationPlan');
});

test('malformed UTF-16 in received HLD refuses as invalid Design before minting a candidate', () => {
  const sources = sourcesFixture();
  const plan = planEngineeringDesign({stage:'high-level', sources});
  const original = JSON.stringify(hldFixture());
  const delivered = original.replace('Retain comp-a',
    'Retain ' + String.fromCharCode(0xD800) + ' comp-a');
  assert.notEqual(delivered, original);
  assert.doesNotThrow(() => JSON.parse(delivered));
  assert.deepEqual(receiveEngineeringDesign({
    stage:'high-level',sources,plan,deliveryText:delivered,
  }),{type:'EngineeringDesignDerivationRefusal',reason:'invalid-design'},
  'a structurally plausible delivery must not gain an ambiguous source identity');
});

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

test('LLD embedded interface schemas cannot erase normative members before Code projection', () => {
  const sources = sourcesFixture();
  const high = hldReceipt(sources);
  const lowSources = [...sources, {kind:'high-level', text:JSON.stringify(high)}];
  const plan = planEngineeringDesign({stage:'low-level', sources:lowSources});
  const original = lldFixture();
  const ambiguousSchemas = [
    '{"type":"object","required":["preserve"],"required":[]}',
    '{"type":"object","properties":{"x":{"type":"string"},"x":{"type":"null"}}}',
    '{"type":"object","required":["preserve"],"\\u0072equired":[]}',
    '{"description":"\\ud800"}',
  ];
  for (const raw of ambiguousSchemas) {
    // Before this correction JSON.parse made these source-distinct contracts
    // appear ordinary. It is intentionally not an acceptance oracle.
    assert.doesNotThrow(() => JSON.parse(raw));
    for (const field of ['inputSchemaJson','outputSchemaJson']) {
      const design = structuredClone(original);
      design.operations[0][field] = raw;
      assert.deepEqual(receiveEngineeringDesign({
        stage:'low-level', sources:lowSources, plan,
        deliveryText:JSON.stringify(design),
      }), {type:'EngineeringDesignDerivationRefusal', reason:'invalid-design'},
      'nested normative source must refuse rather than become a Code interface: '+field);
    }
  }

  const unambiguous = structuredClone(original);
  unambiguous.operations[0].inputSchemaJson = 'false';
  unambiguous.operations[0].outputSchemaJson =
    '{"type":"object","required":["preserved"],"properties":{"preserved":{"type":"string"}},"additionalProperties":false}';
  const deliveryText = JSON.stringify(unambiguous);
  const candidate = receiveEngineeringDesign({
    stage:'low-level', sources:lowSources, plan, deliveryText,
  });
  assert.equal(candidate.type,'EngineeringDesignCandidate');
  assert.equal(candidate.admitted,false);
  assert.equal(candidate.proof,'unreceived');
  const result = readSourceOwnedEngineeringCodeWork({
    designCandidate:candidate, originalPlan:plan,
    originalDeliveryText:deliveryText, sourceViews:[],
  });
  assert.equal(result.executableWork,false);
  assert.equal(result.independentProof,'unreceived');
  const target = result.targets.find(x => x.operationId === 'op-a');
  assert.equal(target.interface.inputSchema,false);
  assert.deepEqual(target.interface.outputSchema,{
    type:'object', required:['preserved'],
    properties:{preserved:{type:'string'}}, additionalProperties:false,
  });
});

test('LLD interface contracts must satisfy the declared JSON Schema dialect, not merely parse', () => {
  const sources = sourcesFixture();
  const high = hldReceipt(sources);
  const lowSources = [...sources, {kind:'high-level', text:JSON.stringify(high)}];
  const plan = planEngineeringDesign({stage:'low-level', sources:lowSources});
  // Real JSON text can carry a nonsensical schema. A valid JSON *document*
  // does not establish a valid Draft 2020-12 interface contract.
  const invalidSchemas = [
    '{"type":23}',
    '{"type":"not-a-json-schema-type"}',
    '{"required":"source"}',
    '{"properties":{"source":{"type":23}}}',
    '{"$schema":"http://json-schema.org/draft-07/schema#","type":"object"}',
    '{"type":"object","pattern":"["}',
  ];
  for (const raw of invalidSchemas) {
    assert.doesNotThrow(()=>JSON.parse(raw));
    for (const field of ['inputSchemaJson','outputSchemaJson']) {
      const candidate = lldFixture();
      candidate.operations[0][field] = raw;
      assert.deepEqual(receiveEngineeringDesign({
        stage:'low-level', sources:lowSources, plan,
        deliveryText:JSON.stringify(candidate),
      }),{type:'EngineeringDesignDerivationRefusal',reason:'invalid-design'},
      'a malformed normative '+field+' cannot become a Code contract: '+raw);
    }
  }
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
const exactView = (path, text) => ({owner:'fixture-data-owner',path,text,expectedSha256:codeDigest(text)});

test('original Data semantic Design identity survives property ordering but changes for new obligations; source owner is mandatory', () => {
  const candidate = lowLevelCandidateFixture();
  const first = readEngineeringCodeWork({designCandidate:candidate,sourceViews:[]});
  assert.match(first.designCarrierId, /^ni:\/\/\/sha-256;/u);
  const reordered = {
    proof:candidate.proof, admitted:candidate.admitted,
    design:{openQuestions:candidate.design.openQuestions,
      traceability:candidate.design.traceability,operations:candidate.design.operations},
    sources:candidate.sources,stage:candidate.stage,type:candidate.type,
  };
  const same = readEngineeringCodeWork({designCandidate:reordered,sourceViews:[]});
  assert.equal(same.designCarrierId, first.designCarrierId,
    'a property order in an untrusted JS object is not a new semantic Design');

  const changed = structuredClone(candidate);
  changed.design.operations[0].failureCases.push('An additional independently required refusal');
  const changedRead = readEngineeringCodeWork({
    designCandidate:changed,sourceViews:[],
    originalDeliveryText:JSON.stringify(changed.design),
  });
  assert.notEqual(changedRead.designCarrierId,first.designCarrierId,
    'a changed original normative test obligation must change the Design source cut');
  assert.equal(changedRead.independentProof,'unreceived');
  assert.equal(changedRead.executableWork,false);

  const valid = exactView('src/op-a.mjs','export const retainA = x => x;');
  const {owner, ...ownerless} = valid;
  assert.equal(owner,'fixture-data-owner');
  assert.throws(()=>readEngineeringCodeWork({
    designCandidate:candidate,sourceViews:[ownerless],
  }),TypeError,'even one possible owner is not permission to invent its identity');
  assert.equal(readEngineeringCodeWork({
    designCandidate:candidate,sourceViews:[valid],
  }).targets[0].sourceStatus,'source-present-unassayed');
});

test('Design→Code observes actual original named ESM export, without asserting behavior or Proof',()=>{
  const candidate=lowLevelCandidateFixture();
  const a=exactView('src/op-a.mjs','export const retainA = x => x;');
  const b=exactView('src/op-b.mjs','export const retainB = x => x;');
  const result=readEngineeringCodeWork({designCandidate:candidate,sourceViews:[a,b]});
  assert.deepEqual(result.discrepancies,[]);
  assert.deepEqual(result.targets[0].bindingObservation.resolved,{
    owner:'fixture-data-owner',path:'src/op-a.mjs',binding:'retainA',
  });
  assert.equal(result.targets[0].bindingObservation.status,'observed');
  assert.ok(result.targets[0].bindingObservation.evidence[0].end>0);
  assert.equal(result.status,'source-present-unassayed');
  assert.equal(result.independentProof,'unreceived');
  assert.equal(result.executableWork,false);
});

test('implementation source with missing original Design export produces a typed disagreement',()=>{
  const candidate=lowLevelCandidateFixture();
  const source=exactView('src/op-a.mjs','export const otherName = () => 1;');
  const result=readEngineeringCodeWork({designCandidate:candidate,sourceViews:[source]});
  assert.equal(result.targets[0].sourceStatus,'source-present-unassayed');
  assert.equal(result.targets[0].bindingObservation.status,'absent');
  assert.equal(result.discrepancies[0].code,'CODE_EXPORT_NOT_OBSERVED');
  assert.equal(result.status,'source-disagreement');
  assert.equal(result.independentProof,'unreceived');
  assert.equal(result.executableWork,false);
});

test('Design→Code follows an authored reexport to a distinct original source target',()=>{
  const candidate=lowLevelCandidateFixture();
  const a=exactView('src/op-a.mjs','export { retainA } from "./op-b.mjs";');
  const b=exactView('src/op-b.mjs',
    'export const retainA = value => value; export const retainB = value => value;');
  const result=readEngineeringCodeWork({designCandidate:candidate,sourceViews:[a,b]});
  assert.equal(result.targets[0].bindingObservation.status,'observed');
  assert.deepEqual(result.targets[0].bindingObservation.resolved,{
    owner:'fixture-data-owner',path:'src/op-b.mjs',binding:'retainA',
  });
  assert.deepEqual(result.discrepancies,[]);
  assert.equal(result.codeApplied,false);
  assert.equal(result.beneficiaryReceived,false);
});

test('unobserved ESM reexport cannot be called absent or executable Work',()=>{
  const candidate=lowLevelCandidateFixture();
  const a=exactView('src/op-a.mjs','export * from "./not-in-source-cut.mjs";');
  const result=readEngineeringCodeWork({designCandidate:candidate,sourceViews:[a]});
  assert.equal(result.targets[0].bindingObservation.status,'unknown');
  assert.equal(result.targets[0].bindingObservation.reason,'source-not-provided');
  assert.equal(result.targets[0].sourceStatus,'source-present-unassayed');
  assert.equal(result.independentProof,'unreceived');
  assert.equal(result.executableWork,false);
});

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
  const sourceViews=[{owner:'fixture-data-owner',path:'src/op-a.mjs',text:actual,
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
    [{owner:valid.owner,path:valid.path,text:'x'.repeat(2_097_153),expectedSha256:valid.expectedSha256}],
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

test('original predeclared Specification tests reach the source-traced Code Work reader as unexecuted obligations', () => {
  const sources = sourcesFixture();
  const specification = JSON.parse(sources[1].text);
  const architecture = JSON.parse(sources[2].text);
  specification.topics[0].clauses[0].test = 'node --test test/original-a.test.mjs';
  sources[1].text = JSON.stringify(specification);
  architecture.sources.find(item => item.id === 'specification').revision =
    semanticIdOf('metroplat.artifact')(specification);
  sources[2].text = JSON.stringify(architecture);
  const highLevel = hldReceipt(sources);
  const full = [...sources, {kind:'high-level',text:JSON.stringify(highLevel)}];
  const plan = planEngineeringDesign({stage:'low-level',sources:full});
  const deliveryText = JSON.stringify(lldFixture());
  const candidate = receiveEngineeringDesign({stage:'low-level',sources:full,plan,deliveryText});
  assert.equal(candidate.type, 'EngineeringDesignCandidate');
  const read = readSourceOwnedEngineeringCodeWork({
    designCandidate:candidate,originalPlan:plan,originalDeliveryText:deliveryText,sourceViews:[],
  });
  assert.deepEqual(read.targets[0].testObligations.sourceVerification,[{
    requirementCellId:'source-req:a',
    specificationClauseId:'clause-a',
    test:'node --test test/original-a.test.mjs',
    status:'declared-unverified',
  }]);
  assert.deepEqual(read.targets[1].testObligations.sourceVerification,[{
    requirementCellId:'source-req:b',
    specificationClauseId:'clause-b',
    test:null,
    status:'verification-test-not-declared',
  }]);
  assert.equal(read.independentProof,'unreceived');
  assert.equal(read.codeApplied,false);
  assert.equal(read.beneficiaryReceived,false);
  const forged = JSON.parse(full[1].text);
  forged.topics[0].clauses[0].test = 'node --test test/forged.mjs';
  assert.throws(() => planEngineeringDesign({stage:'low-level',sources:[
    full[0],{kind:'specification',text:JSON.stringify(forged)},full[2],full[3],
  ]}), TypeError, 'a changed clause test invalidates the exact Architecture/HLD source cut');
});

test('source-cut tests carrying line controls refuse before Design or Code Work can call them', () => {
  const sources = sourcesFixture();
  const specification = JSON.parse(sources[1].text);
  specification.topics[0].clauses[0].test = 'node --test test/a.mjs\n## forged success';
  sources[1].text = JSON.stringify(specification);
  assert.throws(() => planEngineeringDesign({stage:'high-level',sources}),TypeError);
});

test('source-wide declaration gate refuses export-presence as intent verification at 0, 1 and 2 declared clauses', () => {
  for (const declared of [0, 1, 2]) {
    const sources = sourcesFixture();
    if (declared > 0) {
      const specification = JSON.parse(sources[1].text);
      for (let index = 0; index < declared; index++) {
        specification.topics[0].clauses[index].test =
          'node --test test/source-clause-' + index + '.test.mjs';
      }
      sources[1].text = JSON.stringify(specification);
      const architecture = JSON.parse(sources[2].text);
      architecture.sources.find(row => row.id === 'specification').revision =
        semanticIdOf('metroplat.artifact')(specification);
      sources[2].text = JSON.stringify(architecture);
    }
    const high = hldReceipt(sources);
    const lowSources = [...sources, { kind: 'high-level', text: JSON.stringify(high) }];
    const plan = planEngineeringDesign({ stage: 'low-level', sources: lowSources });
    const originalDeliveryText = JSON.stringify(lldFixture());
    const candidate = receiveEngineeringDesign({
      stage: 'low-level', sources: lowSources, plan, deliveryText: originalDeliveryText,
    });
    assert.equal(candidate.type, 'EngineeringDesignCandidate');
    const result = readSourceOwnedEngineeringCodeWork({
      designCandidate: candidate, originalPlan: plan, originalDeliveryText,
      sourceViews: [
        exactView('src/op-a.mjs', 'export const retainA = value => value;'),
        exactView('src/op-b.mjs', 'export const retainB = value => value;'),
      ],
    });
    assert.equal(result.status, 'source-present-unassayed',
      'existing exports are only source presence, not warranted intention');
    assert.deepEqual(result.discrepancies, []);
    assert.deepEqual(result.sourceVerification, {
      scope: 'original-specification-clauses',
      status: declared === 2
        ? 'source-tests-declared-unverified' : 'source-tests-missing',
      clauseCount: 2,
      declaredTestCount: declared,
      missingClauseIds: ['clause-a', 'clause-b'].slice(declared),
    });
    assert.equal(result.originalDesignAdmitted, false);
    assert.equal(result.independentProof, 'unreceived');
    assert.equal(result.executableWork, false);
    assert.equal(result.codeApplied, false);
    assert.ok(Object.isFrozen(result.sourceVerification.missingClauseIds),
      'downstream agents cannot silently change the source-qualified missing obligations');
  }
});

test('original denied Requirement target crosses Specification, Architecture, HLD and LLD without fabricated proof',()=>{
  const sources=sourceWithDeniedCondition();
  const requirement=JSON.parse(sources[0].text);
  const specification=JSON.parse(sources[1].text);
  assert.equal(requirement['met-when'][1].target,'denied');
  assert.equal(specification.topics[0].clauses[1].keyword,'MUST NOT');
  const high=planEngineeringDesign({stage:'high-level',sources});
  const receivedHigh=receiveEngineeringDesign({
    stage:'high-level',sources,plan:high,
    deliveryText:JSON.stringify(hldFixture()),
  });
  assert.equal(receivedHigh.type,'EngineeringDesignCandidate');
  assert.equal(receivedHigh.admitted,false);
  assert.equal(receivedHigh.proof,'unreceived');
  const lowSources=[...sources,{kind:'high-level',text:JSON.stringify(receivedHigh)}];
  const low=planEngineeringDesign({stage:'low-level',sources:lowSources});
  const originalLld=lldFixture();
  originalLld.operations[1].behavior='Refuse unreceived supplier output';
  originalLld.operations[1].postconditions=['Unreceived supplier output remains refused'];
  originalLld.operations[1].failureCases=['An unreceived supplier result is presented as customer acceptance'];
  const receivedLow=receiveEngineeringDesign({
    stage:'low-level',sources:lowSources,plan:low,
    deliveryText:JSON.stringify(originalLld),
  });
  assert.equal(receivedLow.type,'EngineeringDesignCandidate');
  assert.equal(receivedLow.admitted,false);
  assert.equal(receivedLow.proof,'unreceived');
  assert.deepEqual(receivedLow.design.traceability.map(row=>row.requirementCellId),
    requirement['met-when'].map(row=>row.cell));
  const refused=sourceWithDeniedCondition({target:'contested'});
  assert.throws(()=>planEngineeringDesign({stage:'high-level',sources:refused}),
    TypeError,'a contested target still refuses even when every source address is refreshed');
});

test('Code Work preserves exact held/denied source polarity through qualified Design cuts',()=>{
  const sources=sourceWithDeniedCondition();
  const requirement=JSON.parse(sources[0].text);
  const highPlan=planEngineeringDesign({stage:'high-level',sources});
  const high=receiveEngineeringDesign({
    stage:'high-level',sources,plan:highPlan,
    deliveryText:JSON.stringify(hldFixture()),
  });
  assert.equal(high.type,'EngineeringDesignCandidate');
  const lowSources=[...sources,{kind:'high-level',text:JSON.stringify(high)}];
  const lowPlan=planEngineeringDesign({stage:'low-level',sources:lowSources});
  const delivery=JSON.stringify(lldFixture());
  const low=receiveEngineeringDesign({
    stage:'low-level',sources:lowSources,plan:lowPlan,deliveryText:delivery,
  });
  assert.equal(low.type,'EngineeringDesignCandidate');
  const projected=readSourceOwnedEngineeringCodeWork({
    designCandidate:low,originalPlan:lowPlan,
    originalDeliveryText:delivery,sourceViews:[],
  });
  assert.deepEqual(projected.targets.map(target=>({
    operation:target.operationId,
    originalTargets:target.originalTrace.map(row=>({
      cell:row.requirementCellId,
      target:row.sourceTarget,
    })),
  })),[
    {operation:'op-a',originalTargets:[{cell:requirement['met-when'][0].cell,target:'held'}]},
    {operation:'op-b',originalTargets:[{cell:requirement['met-when'][1].cell,target:'denied'}]},
  ],'the original desired evidence polarity cannot disappear between Design and Code Work');
  assert.ok(Object.isFrozen(projected.targets[1].originalTrace[0]));
  assert.equal(projected.originalDesignAdmitted,false);
  assert.equal(projected.independentProof,'unreceived');
  assert.equal(projected.executableWork,false);
  assert.equal(projected.codeApplied,false);
  assert.equal(projected.beneficiaryReceived,false);
});
