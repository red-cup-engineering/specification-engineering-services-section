// Requirement-first drift must be readable BEFORE an altered source has an
// admitted new Specification and Architecture. This is not a stage Proof,
// rights grant, Code-maker result or a model-generated Work acceptance.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { artifactId } from '@red-cup-engineering/semiotic-eavt-services-section/identity';
import { readRequirementRevisionPressure } from '../src/architecture-description.mjs';

const ID='producer-artifacts-retire-at-their-terminal-owner-boundary';
function requirement(){
  return {
    id:ID,kind:'requirement',
    asks:['Retain original source','Keep Ubuntu online','Receive actual useful work'],
    'met-when':Array.from({length:8},(_,i)=>({
      cell:ID+':condition-'+i,target:'held',
      says:'The original producer MUST preserve source obligation '+i+'.',
    })),
    'x-provenance':{originalSource:'fixture, not a customer decision',revision:1},
  };
}
const revised=fn=>{const x=requirement();fn(x);return x;};

test('same complete original Requirement yields no new Work or fabricated Proof',()=>{
  const source=requirement(),before=structuredClone(source),result=readRequirementRevisionPressure(source,source);
  assert.deepEqual(source,before);
  assert.equal(result.kind,'specification.requirement-revision-pressure.v1');
  assert.equal(result.originalRequirementId,ID);
  assert.equal(result.before,artifactId(source));
  assert.equal(result.after,artifactId(source));
  assert.equal(result.revised,false);
  assert.equal(result.firstOpenStage,null);
  assert.equal(result.summary.changedCells,0);
  assert.equal(result.summary.originalRequestsChanged,false);
  assert.equal(result.downstreamRegenerationRequired,false);
  assert.equal(result.originalEffect,'none-read-only');
  assert.equal(result.independentProof,false);
  assert.equal(result.independentlyAcceptedCustomerWork,false);
  assert.ok(Object.isFrozen(result.changes));
  assert.deepEqual(readRequirementRevisionPressure(requirement(),requirement()),result);
});

test('original 3 to 4 requests and eight amended producer conditions are genuinely upstream',()=>{
  const source=requirement();
  const current=revised(r=>{
    r.asks.push('New independent original owner receiving and bounds');
    r['met-when'].forEach((row,i)=>row.says+=' Preserve added native admission '+i+'.');
    r['x-provenance'].revision=2;
  });
  const before=structuredClone(source),after=structuredClone(current);
  const read=readRequirementRevisionPressure(source,current);
  assert.deepEqual(source,before);
  assert.deepEqual(current,after);
  assert.equal(read.before,artifactId(source));
  assert.equal(read.after,artifactId(current));
  assert.equal(read.firstOpenStage,'requirement-admission');
  assert.equal(read.revised,true);
  assert.equal(read.summary.originalRequestCountBefore,3);
  assert.equal(read.summary.originalRequestCountAfter,4);
  assert.equal(read.summary.originalRequestsChanged,true);
  assert.equal(read.summary.changedCells,8);
  assert.equal(read.summary.revisedCells,8);
  assert.equal(read.summary.addedCells,0);
  assert.equal(read.summary.removedCells,0);
  assert.equal(read.summary.sourceConditionOrderChanged,false);
  assert.equal(read.downstreamRegenerationRequired,true);
  assert.deepEqual(read.changes.map(x=>x.cell),current['met-when'].map(x=>x.cell).sort());
  assert.ok(read.changes.every(x=>x.kind==='revised'&&x.originalStatementChanged));
  assert.ok(!JSON.stringify(read).includes('Preserve added native admission'));
  assert.equal(read.independentProof,false);
});

test('added and removed original conditions cannot disappear from requalification',()=>{
  const current=revised(r=>{
    r['met-when'].shift();
    r['met-when'].push({cell:ID+':condition-new',target:'held',says:'New source obligation.'});
  });
  const read=readRequirementRevisionPressure(requirement(),current);
  assert.equal(read.summary.addedCells,1);
  assert.equal(read.summary.removedCells,1);
  assert.equal(read.summary.changedCells,2);
  assert.equal(read.downstreamRegenerationRequired,true);
  assert.equal(read.firstOpenStage,'requirement-admission');
});

test('target changes and unclaimed condition metadata remain source-visible',()=>{
  const current=revised(r=>{
    r['met-when'][0].target='denied';
    r['met-when'][1].separateContext='unadmitted original metadata';
  });
  const read=readRequirementRevisionPressure(requirement(),current);
  assert.equal(read.summary.changedCells,2);
  assert.equal(read.changes.find(x=>x.cell.endsWith('condition-0')).originalTargetChanged,true);
  assert.equal(read.changes.find(x=>x.cell.endsWith('condition-1')).otherConditionMetadataChanged,true);
  assert.equal(read.independentlyAcceptedCustomerWork,false);
});

test('changed authorship/provenance alone demands requalification, not fake code work',()=>{
  const current=revised(r=>r['x-provenance'].revision=2);
  const read=readRequirementRevisionPressure(requirement(),current);
  assert.equal(read.revised,true);
  assert.equal(read.summary.changedCells,0);
  assert.equal(read.summary.originalRequestsChanged,false);
  assert.equal(read.summary.otherSourceContextChanged,true);
  assert.equal(read.downstreamRegenerationRequired,false);
  assert.equal(read.firstOpenStage,'requirement-admission');
});

test('changed original requests alone can invalidate stage semantics without a clause edit',()=>{
  const current=revised(r=>r.asks.push('Do not omit beneficiary authority'));
  const read=readRequirementRevisionPressure(requirement(),current);
  assert.equal(read.summary.changedCells,0);
  assert.equal(read.summary.originalRequestsChanged,true);
  assert.equal(read.downstreamRegenerationRequired,true);
  assert.equal(read.firstOpenStage,'requirement-admission');
});

test('reordering original condition records cannot masquerade as identical source',()=>{
  const current=revised(r=>r['met-when'].reverse());
  const read=readRequirementRevisionPressure(requirement(),current);
  assert.equal(read.summary.changedCells,0);
  assert.equal(read.summary.sourceConditionOrderChanged,true);
  assert.equal(read.downstreamRegenerationRequired,true);
  assert.equal(read.revised,true);
});

test('semantic replay ignores object property insertion order only, never edited values',()=>{
  const older=requirement();
  const reordered=JSON.parse(JSON.stringify(older));
  const reversed={...Object.fromEntries(Object.entries(reordered).reverse())};
  reversed['met-when']=reversed['met-when'].map(row=>Object.fromEntries(Object.entries(row).reverse()));
  const read=readRequirementRevisionPressure(older,reversed);
  assert.equal(read.revised,false);
  assert.deepEqual(read.changes,[]);
});

test('foreign Requirement identity and duplicate cells refuse before computing a stage',()=>{
  const foreign=revised(r=>r.id='other-origin');
  assert.throws(()=>readRequirementRevisionPressure(requirement(),foreign),TypeError);
  const duplicate=revised(r=>r['met-when'].push({...r['met-when'][0]}));
  assert.throws(()=>readRequirementRevisionPressure(requirement(),duplicate),TypeError);
  const malformed=revised(r=>r['met-when'][0].cell='other:field');
  assert.throws(()=>readRequirementRevisionPressure(requirement(),malformed),TypeError);
});

test('a self-declared result or unqualified source shape is not an accepted Requirement',()=>{
  assert.throws(()=>readRequirementRevisionPressure({id:ID},requirement()),TypeError);
  assert.throws(()=>readRequirementRevisionPressure(requirement(),[requirement()]),TypeError);
  assert.throws(()=>readRequirementRevisionPressure(requirement(),
    revised(r=>r['met-when'][0].target='accepted')),TypeError);
  assert.throws(()=>readRequirementRevisionPressure(requirement(),
    revised(r=>r['met-when'][0].says='Untrusted\nscript')),TypeError);
});

test('original shipped Architecture command independently reads the revised Requirement first',()=>{
  const cli=fileURLToPath(new URL('../scripts/render-architecture-description.mjs',import.meta.url));
  const before=requirement(),after=revised(r=>{
    r.asks.push('Original new customer request');
    r['met-when'].forEach(x=>x.says+=' New independent responsibility.');
  });
  const invoke=obj=>spawnSync(process.execPath,[cli,'--requirement-pressure'],{
    input:JSON.stringify(obj),encoding:'utf8',timeout:15000,maxBuffer:1024*1024,
  });
  const result=invoke({before,after});
  assert.equal(result.status,0,result.stderr);
  const read=JSON.parse(result.stdout);
  assert.equal(read.summary.changedCells,8);
  assert.equal(read.summary.originalRequestCountAfter,4);
  assert.equal(read.originalEffect,'none-read-only');
  assert.equal(read.independentProof,false);
  const denied=invoke({before,after,accepted:true});
  assert.notEqual(denied.status,0);
  assert.equal(denied.stdout,'','no partial accepted result on a forged effect input');
});
