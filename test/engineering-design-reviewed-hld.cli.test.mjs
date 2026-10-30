import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { sourcesFixture } from './engineering-design-source-cut.fixture.mjs';
import { planEngineeringDesign } from '../src/engineering-design.mjs';

const command=fileURLToPath(new URL('../scripts/receive-engineering-high-level-review.mjs',import.meta.url));
const review={
  components:[
    {id:'comp-a',owner:'original-data',layer:'data',responsibility:'Retain A',
      requires:[],specificationClauseIds:['clause-a']},
    {id:'comp-b',owner:'original-data',layer:'data',responsibility:'Retain B',
      requires:[],specificationClauseIds:['clause-b']},
  ],
  openQuestions:['Office adoption is separate from source projection.'],
};
const digest=text=>'sha256:'+createHash('sha256').update(text,'utf8').digest('hex');
const original=sourcesFixture();
const plan=planEngineeringDesign({stage:'high-level',sources:original});
const input={
  sources:original,
  reviewText:JSON.stringify(review),
  expectedReviewSha256:digest(JSON.stringify(review)),
  reviewedSourceCut:plan.sources.map(({kind,digest})=>({kind,digest})),
  limits:{maxReviewBytes:65536,maxComponents:8,maxRequirements:8,maxTraceRows:8},
};
function invoke(value, argv=[]) {
  return spawnSync(process.execPath,[command,...argv],{
    input:typeof value==='string'?value:JSON.stringify(value),
    encoding:'utf8',timeout:25000,maxBuffer:4*1024*1024,
  });
}
test('actual original CLI receives a reviewed candidate with independent Proof still open',()=>{
  const run=invoke(input);
  assert.equal(run.status,0,run.stderr);
  const result=JSON.parse(run.stdout);
  assert.equal(result.type,'EngineeringDesignReviewProjection');
  assert.equal(result.candidate.type,'EngineeringDesignCandidate');
  assert.equal(result.candidate.admitted,false);
  assert.equal(result.candidate.proof,'unreceived');
  assert.equal(result.independentReview,'unreceived');
  assert.equal(result.executableWork,false);
  assert.equal(result.candidate.design.traceability.length,2);
  assert.equal(result.originalReview.expectedSha256,input.expectedReviewSha256);
  assert.equal(invoke(input).stdout,run.stdout,'source-unchanged replay must be byte-stable');
});
test('CLI refuses mismatched review source and a source-revision drift without partial output',()=>{
  for(const changed of [
    {...input,reviewText:input.reviewText.replace('Retain A','Foreign A')},
    {...input,reviewedSourceCut:[...input.reviewedSourceCut].reverse()},
  ]) {
    const run=invoke(changed);
    assert.equal(run.status,1,run.stderr);
    assert.equal(run.stdout,'','an unreceived source cannot print a positive candidate');
  }
});
test('CLI refuses ambiguous JSON, extra root authority and malformed args before deriving',()=>{
  for(const raw of [
    '{"sources":1,"sources":2}',
    JSON.stringify({...input,claimedAdoption:true}),
    '',
  ]) {
    const run=invoke(raw);
    assert.equal(run.status,1,run.stderr);
    assert.equal(run.stdout,'');
  }
  const unknown=invoke('', ['--grant-authorization']);
  assert.equal(unknown.status,2);
  assert.equal(unknown.stdout,'');
  const help=invoke('', ['--help']);
  assert.equal(help.status,0,help.stderr);
  assert.match(help.stdout,/No inference, authority, Code effect, Proof/u);
});
