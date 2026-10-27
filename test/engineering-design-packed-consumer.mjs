// This script runs in a separate fresh npm consumer after installing the
// candidate package archive. It imports only the PUBLIC published design
// export, never ../src, and preserves source/Proof/admission boundaries.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  planEngineeringDesign,
  receiveEngineeringDesign,
  readEngineeringCodeWork,
} from '@red-cup-engineering/specification-engineering-services-section/engineering-design';
import { sourcesFixture, clausesSplitAcrossModels } from './engineering-design-source-cut.fixture.mjs';

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

// Independently installed consumer of the ORIGINAL Design→Code readout.
// This source snapshot is a byte-addressed selected target, not an authentic
// GitHub checkout or a permitted Code effect.
const codeSourceText='export const retainSourceValue = x => x;' + '\n';
const codeSourceSha256='sha256:' + createHash('sha256')
  .update(codeSourceText,'utf8').digest('hex');
const sourceCut=[{
  path:'src/source-operation.mjs',text:codeSourceText,
  expectedSha256:codeSourceSha256,
}];
const work=readEngineeringCodeWork({
  designCandidate:low,originalPlan:lowPlan,
  originalDeliveryText:JSON.stringify(low.design),sourceViews:sourceCut,
});
assert.equal(work.type,'EngineeringDesignCodeWorkReadout');
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

console.log('Packed original Design consumer: original LLD-to-Code work and test obligations source-read; no effect, proof or implementation conformance granted.');
console.log('Packed original Design consumer: HLD+LLD source-bound and per-clause model-covered candidates received; stale, cross-cell, unmodeled-clause and partial-model sources refused; proof, adoption and installation still unreceived.');
