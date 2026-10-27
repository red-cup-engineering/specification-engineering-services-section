// This runs AFTER npm pack and independent installation. It imports only the
// original public Architecture export from the installed npm package, not
// the checkout, original source module or another simulated algorithm.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readRequirementRevisionPressure } from '@red-cup-engineering/specification-engineering-services-section/architecture-description';

const id='producer-artifacts-retire-at-their-terminal-owner-boundary';
const before={
  id,kind:'requirement',
  asks:['Original producer custody','Keep Ubuntu online','Retain native proof'],
  'met-when':Array.from({length:8},(_,i)=>({
    cell:id+':condition-'+i,target:'held',
    says:'Original owner admission obligation '+i+'.',
  })),
  'x-provenance':{standing:'original read-only fixture'},
};
const after=structuredClone(before);
after.asks.push('Independent original buyer source revision');
after['met-when'].forEach((row,i)=>
  row.says+=' Native revised source/Proof boundary '+i+'.');
const received=readRequirementRevisionPressure(before,after);
assert.equal(received.kind,'specification.requirement-revision-pressure.v1');
assert.equal(received.revised,true);
assert.equal(received.firstOpenStage,'requirement-admission');
assert.equal(received.summary.originalRequestCountBefore,3);
assert.equal(received.summary.originalRequestCountAfter,4);
assert.equal(received.summary.originalRequestsChanged,true);
assert.equal(received.summary.changedCells,8);
assert.equal(received.summary.revisedCells,8);
assert.equal(received.downstreamRegenerationRequired,true);
assert.equal(received.originalEffect,'none-read-only');
assert.equal(received.independentProof,false);
assert.equal(received.independentlyAcceptedCustomerWork,false);
assert.ok(!JSON.stringify(received).includes('Native revised source/Proof boundary'));
const replay=readRequirementRevisionPressure(before,structuredClone(before));
assert.equal(replay.revised,false);
assert.equal(replay.firstOpenStage,null);
assert.deepEqual(replay.changes,[]);
const contextOnly=structuredClone(before);
contextOnly['x-provenance'].standing='another unapproved revision';
const held=readRequirementRevisionPressure(before,contextOnly);
assert.equal(held.revised,true);
assert.equal(held.summary.changedCells,0);
assert.equal(held.downstreamRegenerationRequired,false);
assert.equal(held.firstOpenStage,'requirement-admission');
const foreign=structuredClone(after);
foreign.id='different-customer';
assert.throws(()=>readRequirementRevisionPressure(before,foreign),TypeError);
// Drive the installed original executable, not a working-tree alias. A model
// cannot use the outer carrier to claim accepted Work or fabrication effects.
const executable='node_modules/@red-cup-engineering/specification-engineering-services-section/scripts/render-architecture-description.mjs';
const invoke=(request)=>spawnSync(process.execPath,[executable,'--requirement-pressure'],{
  input:JSON.stringify(request),encoding:'utf8',timeout:15000,maxBuffer:1024*1024,
});
const cli=invoke({before,after});
assert.equal(cli.status,0,cli.stderr);
assert.deepEqual(JSON.parse(cli.stdout),received);
const injection=invoke({before,after,accepted:true});
assert.notEqual(injection.status,0);
assert.equal(injection.stdout,'');
console.log('Packed original Requirement-first reader: authentic source revisions, 3-to-4 request and all 8 condition changes require requalification; no Proof, maker, installer or customer acceptance.');
