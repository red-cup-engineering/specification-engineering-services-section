import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { indexJavaScriptModuleBindings } from '../src/javascript-module-bindings.mjs';

const LIMITS=Object.freeze({maxBytes:2_097_152,maxModules:64});
const index=sources=>indexJavaScriptModuleBindings(sources,LIMITS);
const owner='red-cup-engineering/original-source-owner';
const source=(path,text,sourceOwner=owner)=>({owner:sourceOwner,path,text});
const read=(views,path,exportName)=>index(views)
  .inspect({owner,path,exportName});

test('reads actual named ECMAScript exports without executing module code',()=>{
  const before=globalThis.__moduleBindingEvidence;
  const views=[source('src/a.mjs',
    'globalThis.__moduleBindingEvidence = "MUST NOT EXECUTE"; export const value = 1; export function service(){}')];
  const result=read(views,'src/a.mjs','service');
  assert.equal(result.status,'observed');
  assert.deepEqual(result.resolved,{owner,path:'src/a.mjs',binding:'service'});
  assert.deepEqual(result.evidence.map(e=>e.exportedName),['service']);
  assert.equal(globalThis.__moduleBindingEvidence,before);
  assert.equal(read(views,'src/a.mjs','value').status,'observed');
  assert.equal(read(views,'src/a.mjs','privateName').status,'absent');
});

test('local export names must refer to actual source declarations',()=>{
  assert.equal(read([source('src/a.mjs','const local=1; export { local as named };')],
    'src/a.mjs','named').resolved.binding,'local');
  const absent=read([source('src/a.mjs','export { invented as named };')],
    'src/a.mjs','named');
  assert.equal(absent.status,'unknown');
  assert.equal(absent.reason,'exported-local-not-declared');
});

test('transitive explicit exports resolve original semantic module-and-binding identity',()=>{
  const views=[
    source('src/leaf.mjs','export const value=42;'),
    source('src/middle.mjs','export {value as renamed} from "./leaf.mjs";'),
    source('src/entry.mjs','export {renamed as publicValue} from "./middle.mjs";')
  ];
  const result=read(views,'src/entry.mjs','publicValue');
  assert.equal(result.status,'observed');
  assert.deepEqual(result.resolved,{owner,path:'src/leaf.mjs',binding:'value'});
  assert.deepEqual(result.evidence.map(x=>x.path),
    ['src/entry.mjs','src/middle.mjs','src/leaf.mjs']);
});

test('explicit local imports can be re-exported with original import binding identity',()=>{
  const views=[
    source('src/leaf.mjs','export const value=4;'),
    source('src/entry.mjs','import {value as local} from "./leaf.mjs"; export {local as forwarded};')
  ];
  assert.deepEqual(read(views,'src/entry.mjs','forwarded').resolved,
    {owner,path:'src/leaf.mjs',binding:'value'});
});

test('convergent star exports name one semantic binding, not artificial ambiguity',()=>{
  const views=[
    source('src/leaf.mjs','export const value=3;'),
    source('src/left.mjs','export * from "./leaf.mjs";'),
    source('src/right.mjs','export * from "./leaf.mjs";'),
    source('src/root.mjs','export * from "./left.mjs"; export * from "./right.mjs";')
  ];
  const result=read(views,'src/root.mjs','value');
  assert.equal(result.status,'observed');
  assert.deepEqual(result.resolved,{owner,path:'src/leaf.mjs',binding:'value'});
});

test('distinct reachable star targets remain contested despite matching exported name',()=>{
  const views=[
    source('src/one.mjs','export const value=1;'),
    source('src/two.mjs','export const value=2;'),
    source('src/root.mjs','export * from "./one.mjs"; export * from "./two.mjs";')
  ];
  const result=read(views,'src/root.mjs','value');
  assert.equal(result.status,'contested');
  assert.equal(result.reason,'distinct-star-export-targets');
  assert.equal(result.resolved,null);
});

test('explicit named export takes precedence over star export conflicts',()=>{
  const views=[
    source('src/one.mjs','export const value=1;'),
    source('src/two.mjs','export const value=2;'),
    source('src/root.mjs','export const value=0; export * from "./one.mjs"; export * from "./two.mjs";')
  ];
  assert.deepEqual(read(views,'src/root.mjs','value').resolved,
    {owner,path:'src/root.mjs',binding:'value'});
});

test('namespace exports preserve exact namespace identity across equal source routes',()=>{
  const views=[
    source('src/leaf.mjs','export const value=1;'),
    source('src/left.mjs','export * as ns from "./leaf.mjs";'),
    source('src/right.mjs','export * as ns from "./leaf.mjs";'),
    source('src/root.mjs','export * from "./left.mjs"; export * from "./right.mjs";')
  ];
  const result=read(views,'src/root.mjs','ns');
  assert.equal(result.status,'observed');
  assert.deepEqual(result.resolved,{owner,path:'src/leaf.mjs',binding:'*'});
});

test('unobserved reexport target refuses a false absence or successful binding',()=>{
  const views=[source('src/entry.mjs','export * from "./missing.mjs";')];
  const result=read(views,'src/entry.mjs','value');
  assert.equal(result.status,'unknown');
  assert.equal(result.reason,'source-not-provided');
  assert.equal(result.resolved,null);
});

test('unresolved bare imports do not become source-owned exports',()=>{
  const views=[source('src/entry.mjs','export {value} from "unreviewed-package";')];
  const result=read(views,'src/entry.mjs','value');
  assert.equal(result.status,'unknown');
  assert.equal(result.reason,'unresolved-external-or-invalid-import');
});

test('invalid parser syntax is an explicit unknown, not a false missing export',()=>{
  const result=read([source('src/broken.mjs','export const value = ;')],
    'src/broken.mjs','value');
  assert.equal(result.status,'unknown');
  assert.equal(result.reason,'ecmascript-parser-refused');
});

test('cyclic reexports refuse a false success without allocating unbounded work',()=>{
  const views=[
    source('src/a.mjs','export * from "./b.mjs";'),
    source('src/b.mjs','export * from "./a.mjs";')
  ];
  const result=read(views,'src/a.mjs','missing');
  assert.equal(result.status,'unknown');
  assert.equal(result.reason,'cyclic-reexport');
});

test('duplicate explicit export name is contested even where both appear identical',()=>{
  const result=read([source('src/a.mjs',
    'const value=1; export {value}; export {value};')],
    'src/a.mjs','value');
  assert.equal(result.status,'contested');
  assert.equal(result.reason,'duplicate-explicit-export');
});

test('default is never inherited through export-star',()=>{
  const views=[
    source('src/leaf.mjs','export default 42;'),
    source('src/root.mjs','export * from "./leaf.mjs";')
  ];
  assert.equal(read(views,'src/leaf.mjs','default').status,'observed');
  assert.equal(read(views,'src/root.mjs','default').status,'absent');
});

test('source owners, Unicode paths, and bounded source multiplicity refuse aliasing',()=>{
  assert.throws(()=>index([
    source('src/a.mjs','export const x=1;'),
    source('src/a.mjs','export const x=2;'),
  ]),TypeError);
  assert.throws(()=>index([
    source('src/../outside.mjs','export const x=1;'),
  ]),TypeError);
  assert.throws(()=>index([
    source('src/cafe\u0301.mjs','export const x=1;'),
  ]),TypeError);
  assert.throws(()=>index(new Array(65).fill(
    source('src/a.mjs','export const x=1;'))),TypeError);
  const views=[source('src/a.mjs','export const x=1;')];
  assert.equal(index(views)
    .inspect({owner:'another/repository',path:'src/a.mjs',exportName:'x'}).status,'unknown');
  assert.equal(index(views)
    .inspect({owner,path:'src/a.mjs',exportName:'x'}).status,'observed');
});

test('caller must supply checked finite existing source limits before any syntax analysis',()=>{
  const views=[source('src/small.mjs','export const x=1;')];
  assert.throws(()=>indexJavaScriptModuleBindings(views),RangeError);
  assert.throws(()=>indexJavaScriptModuleBindings(views,
    {maxBytes:2_097_153,maxModules:64}),RangeError);
  assert.throws(()=>indexJavaScriptModuleBindings(views,
    {maxBytes:2_097_152,maxModules:65}),RangeError);
  assert.throws(()=>indexJavaScriptModuleBindings(views,
    {maxBytes:1,maxModules:1}),RangeError);
  assert.equal(indexJavaScriptModuleBindings(views,
    {maxBytes:Buffer.byteLength(views[0].text,'utf8'),maxModules:1})
    .inspect({owner,path:'src/small.mjs',exportName:'x'}).status,'observed');
});

test('original ECMAScript syntax supplier is the exact source-owned parser blob',()=>{
  const packageFile=JSON.parse(readFileSync(new URL(
    '../node_modules/@red-cup-engineering/javascript-parser-service/package.json',
    import.meta.url),'utf8'));
  assert.equal(packageFile.name,'@red-cup-engineering/javascript-parser-service');
  assert.equal(packageFile.version,'0.1.0');
  const bytes=readFileSync(new URL(
    '../node_modules/@red-cup-engineering/javascript-parser-service/src/javascript-parser.mjs',
    import.meta.url));
  const blobSha=createHash('sha1')
    .update(Buffer.from('blob '+bytes.byteLength+'\0')).update(bytes)
    .digest('hex');
  assert.equal(blobSha,'5ca0fa15caab57032cfab43f0cfba3000f7704b9',
    'published original parser source must match the selected source-owned Git blob');
});

test('real original Design module is source-observed, without executing its source',()=>{
  const path='src/engineering-design.mjs';
  const text=readFileSync(new URL('../src/engineering-design.mjs',import.meta.url),'utf8');
  const parser=index([source(path,text)]);
  for(const exportName of ['planEngineeringDesign','receiveEngineeringDesign','readEngineeringCodeWork']){
    const result=parser.inspect({owner,path,exportName});
    assert.equal(result.status,'observed',exportName+' '+result.reason);
    assert.deepEqual(result.resolved,{owner,path,binding:exportName});
  }
  assert.equal(parser.inspect({owner,path,exportName:'fabricateVerifiedProgram'}).status,
    'absent','source readout cannot invent a manufacturing capability');
});
