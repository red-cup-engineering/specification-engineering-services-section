// Engineering #137: original Requirement → Specification → Architecture →
// qualified high-level design REVIEW. No inference, Code write or stage adoption.
import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { sourcesFixture } from './engineering-design-source-cut.fixture.mjs';
import {
  planEngineeringDesign, receiveEngineeringDesign,
  receiveEngineeringHighLevelReview,
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
        responsibility: 'Retain independently sourced A', requires: [],
        specificationClauseIds: ['clause-a'] },
      { id: 'comp-b', owner: 'fixture-data-owner', layer: 'data',
        responsibility: 'Retain independently sourced B', requires: [],
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
  bad.components[0].requires=[{componentId:'comp-b',port:'b-value'}];
  bad.components[1].requires=[{componentId:'comp-a',port:'a-value'}];
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
