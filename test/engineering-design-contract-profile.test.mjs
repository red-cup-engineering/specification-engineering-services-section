import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { validateJsonSchema } from '@red-cup-engineering/json-schema-services-section/validation';
import { sourcesFixture } from './engineering-design-source-cut.fixture.mjs';
import {
  planEngineeringDesign, receiveEngineeringDesign, readEngineeringCodeWork,
} from '../src/engineering-design.mjs';
import { readEngineeringInterfaceSchema } from '../src/engineering-interface-schema.mjs';

const load = path => JSON.parse(readFileSync(fileURLToPath(new URL(path, import.meta.url)),'utf8'));
const baseSchemaPath = '../data/records/schema/';
const readoutSchema=load(baseSchemaPath+'engineering-design-code-work-readout.schema.json');
const reviewSchema=load(baseSchemaPath+'engineering-design-review-projection.schema.json');
const requestSchema=load(baseSchemaPath+'plan-engineering-design.input.schema.json');
const planSchema=load(baseSchemaPath+'plan-engineering-design.output.schema.json');
const reviewInputSchema=load(baseSchemaPath+'project-high-level-design-review.input.schema.json');
const packageManifest=load('../package.json');

test('published source contracts declare actual Draft 2020-12, JSON document media types and NodeNext declarations',()=>{
  for(const [name,schema] of Object.entries({readoutSchema,reviewSchema,requestSchema,planSchema,reviewInputSchema})){
    assert.equal(schema.$schema,'https://json-schema.org/draft/2020-12/schema',name);
    assert.match(schema.$id,/^urn:red-cup-engineering:schema:/u,name);
  }
  const sourceTextSchema=requestSchema.properties.sources.items.properties.text;
  assert.equal(sourceTextSchema.contentMediaType,'application/json');
  const offeredPortSchema=reviewInputSchema.properties.review.properties.components.items.properties.provides.items.properties.schemaJson;
  const requiredPortSchema=reviewInputSchema.properties.review.properties.components.items.properties.requires.items.properties.schemaJson;
  assert.equal(offeredPortSchema.contentMediaType,'application/schema+json');
  assert.equal(requiredPortSchema.contentMediaType,'application/schema+json');
  for(const [subpath,name] of [
    ['./engineering-design','engineering-design'],
    ['./engineering-design-review','engineering-design-review'],
  ]){
    const exports=packageManifest.exports[subpath];
    assert.deepEqual(exports,{
      types:'./src/'+name+'.d.mts',default:'./src/'+name+'.mjs',
    },'type metadata must not redirect the original runtime ESM export');
    const typeSource=readFileSync(fileURLToPath(new URL('../src/'+name+'.d.mts',import.meta.url)),'utf8');
    assert.match(typeSource,/export (interface|type|function)/u);
  }
});

test('original interface schema parser enforces byte limits BEFORE parsing, with exact RFC 8259 / 2020-12 source identity',()=>{
  const original='{"type":"integer","minimum":0}';
  const sameSemanticsDifferentKeyOrder='{"minimum":0,"type":"integer"}';
  const first=readEngineeringInterfaceSchema(original,{portableOnly:true});
  assert.equal(first.sourceIdentity,
    readEngineeringInterfaceSchema(sameSemanticsDifferentKeyOrder,{portableOnly:true}).sourceIdentity);
  assert.equal(validateJsonSchema(1,first.schema).valid,true);
  assert.equal(validateJsonSchema('1',first.schema).valid,false);
  // The oversized input is deliberately invalid JSON. Its refusal must be the
  // original finite host boundary, before the JSON parser can consume it.
  const oversized='{'+'é'.repeat(33_000);
  assert.ok(Buffer.byteLength(oversized,'utf8')>65_536);
  assert.throws(()=>readEngineeringInterfaceSchema(oversized,{portableOnly:true}),
    /exceeds its source boundary/u);
  assert.throws(()=>readEngineeringInterfaceSchema('{"type":"string","type":"integer"}',
    {portableOnly:true}),TypeError,'duplicate JSON keys do not become last-writer-wins');
  assert.throws(()=>readEngineeringInterfaceSchema('{"$ref":"https://example.com/type"}',
    {portableOnly:true}),/reference-free/u);
});

test('actual Code Work readout validates against its published schema, and a forged executable grant does not',()=>{
  const sources=sourcesFixture();
  const hld={
    components:[{id:'source-component',owner:'source-only',layer:'data',
      responsibility:'Retain both original conditions',dependencyIds:[],
      providedPorts:[],requiredPorts:[]}],
    connections:[],
    traceability:[
      {requirementCellId:'source-req:a',specificationClauseIds:['clause-a'],
        architectureModelIds:['model-a'],designElementIds:['source-component']},
      {requirementCellId:'source-req:b',specificationClauseIds:['clause-b'],
        architectureModelIds:['model-b'],designElementIds:['source-component']},
    ],
    openQuestions:['Independent Design adoption still unreceived'],
  };
  const highPlan=planEngineeringDesign({stage:'high-level',sources});
  assert.equal(validateJsonSchema(highPlan,planSchema).valid,true);
  const high=receiveEngineeringDesign({
    stage:'high-level',sources,plan:highPlan,deliveryText:JSON.stringify(hld),
  });
  assert.equal(high.type,'EngineeringDesignCandidate');
  const lowSources=[...sources,{kind:'high-level',text:JSON.stringify(high)}];
  const lowPlan=planEngineeringDesign({stage:'low-level',sources:lowSources});
  const lowDesign={
    operations:[{
      id:'retain-original',componentId:'source-component',
      module:'src/retain-original.mjs',exportName:'retainOriginal',
      inputSchemaJson:'{"type":"integer"}',
      outputSchemaJson:'{"type":"integer"}',
      behavior:'Retain and report original value',preconditions:[],
      postconditions:['Value retained'],failureCases:['Value unavailable'],
      resourceBounds:['Finite source'],effectBoundaries:['Pure candidate'],
      acceptanceObligations:['Independent assay required'],
    }],
    traceability:hld.traceability.map(row=>({...row,designElementIds:['retain-original']})),
    openQuestions:['Independent acceptance still required'],
  };
  const deliveryText=JSON.stringify(lowDesign);
  const low=receiveEngineeringDesign({
    stage:'low-level',sources:lowSources,plan:lowPlan,deliveryText,
  });
  assert.equal(low.type,'EngineeringDesignCandidate');
  const receipt=readEngineeringCodeWork({
    designCandidate:low,originalPlan:lowPlan,originalDeliveryText:deliveryText,
    sourceViews:[],
  });
  assert.equal(validateJsonSchema(receipt,readoutSchema).valid,true);
  assert.equal(receipt.executableWork,false);
  assert.equal(receipt.independentProof,'unreceived');
  const forged={...receipt,executableWork:true};
  assert.equal(validateJsonSchema(forged,readoutSchema).valid,false);
  const dropped={...receipt,sourceCut:[]};
  assert.equal(validateJsonSchema(dropped,readoutSchema).valid,false);
  assert.equal(readoutSchema.properties.targets.items.properties.interface.properties.inputSchema.anyOf.length,2);
});
