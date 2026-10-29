/**
 * Nonexecuting ECMAScript module export reading for the original Design→Code
 * source-view boundary. The JavaScript grammar belongs to the existing
 * javascript-parser-service. This module only interprets named export edges
 * within the explicitly supplied, owner-qualified, byte-addressed cut.
 *
 * A syntactic export is NOT a behavioral assay, independent Proof, Git
 * authority, executable Work or a customer receipt. Unknown source modules,
 * parser refusals, conflicts and cycles stay unknown/contested, not "absent".
 */
import { posix } from 'node:path';
import { parseJavaScript } from '@red-cup-engineering/javascript-parser-service';

const nameOf = n => n?.name ?? (typeof n?.value === 'string' ? n.value : null);
const token = (owner, path) => JSON.stringify([owner,path]);
const unique = xs => [...new Set(xs)];
const ordered = xs => [...xs].sort((a,b)=>a<b?-1:a>b?1:0);
const plain = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const nonblank = v => typeof v === 'string' && v.trim().length !== 0;
const scalar = v => nonblank(v) && v.isWellFormed();
const out = (status, resolved = null, evidence = [], reason = null) =>
  Object.freeze({status, resolved, evidence:Object.freeze(evidence), reason});
const target = (owner, path, binding) => Object.freeze({owner,path,binding});
const note = (path, exportedName, node) =>
  Object.freeze({path,exportedName,start:node.start,end:node.end});
function declaredNames(pattern) {
  if (!pattern) return [];
  switch(pattern.type) {
    case 'Identifier': return [pattern.name];
    case 'RestElement': return declaredNames(pattern.argument);
    case 'AssignmentPattern': return declaredNames(pattern.left);
    case 'ArrayPattern': return pattern.elements.flatMap(declaredNames);
    case 'ObjectPattern': return pattern.properties.flatMap(x =>
      declaredNames(x.type === 'RestElement' ? x.argument : x.value));
    default: return [];
  }
}
function declarationsOf(node) {
  if (!node) return [];
  if (node.type === 'VariableDeclaration')
    return node.declarations.flatMap(x=>declaredNames(x.id));
  if (node.type === 'FunctionDeclaration' || node.type === 'ClassDeclaration')
    return node.id ? [node.id.name] : [];
  return [];
}
function relative(from, specifier) {
  if (!scalar(specifier) || !specifier.startsWith('./') && !specifier.startsWith('../'))
    return null;
  if (specifier.includes('\\') || specifier.includes('\0') ||
      specifier.normalize('NFC') !== specifier) return null;
  const path = posix.normalize(posix.join(posix.dirname(from),specifier));
  if (path === '..' || path.startsWith('../') || path.startsWith('/') ||
      !path.endsWith('.mjs') || path.includes('\\') || path.normalize('NFC') !== path)
    return null;
  return path;
}
/**
 * Index at most the ORIGINAL Design Code Work's supplied and validated source
 * views. Each view is {owner,path,text}; the caller separately verifies exact
 * bytes against the original source custodian and enforces the host resource
 * envelope. The index does not read files, resolve npm, execute source or
 * import code. Re-export source paths must be present within this same cut.
 */
export function indexJavaScriptModuleBindings(sources, {maxBytes,maxModules}={}) {
  // The host must name the checked original Code Work envelope; untrusted
  // profile data cannot enlarge its existing 2 MiB / 64-view boundary.
  if (!Number.isSafeInteger(maxBytes)||maxBytes<1||maxBytes>2_097_152||
      !Number.isSafeInteger(maxModules)||maxModules<1||maxModules>64)
    throw new RangeError('source-binding-envelope-not-admitted');
  if (!Array.isArray(sources)||sources.length>maxModules)
    throw new TypeError('source-view-count');
  const views = new Map();
  let bytes=0;
  for (const v of sources) {
    if (!plain(v) || !scalar(v.owner) || !scalar(v.path) || typeof v.text !== 'string' ||
        !v.text.isWellFormed() || !v.path.endsWith('.mjs') ||
        v.path.includes('\\') || v.path.normalize('NFC') !== v.path ||
        v.path.startsWith('/') || v.path.split('/').some(x=>!x||x==='.'||x==='..'))
      throw new TypeError('malformed-original-source-view');
    bytes+=Buffer.byteLength(v.text,'utf8');
    if (!Number.isSafeInteger(bytes)||bytes>maxBytes)
      throw new RangeError('source-binding-byte-bound-exceeded');
    const key=token(v.owner,v.path);
    if (views.has(key)) throw new TypeError('duplicate-original-source-view');
    views.set(key,v);
  }
  const documents = new Map();
  function documentOf(key) {
    if (documents.has(key)) return documents.get(key);
    const view=views.get(key);
    if (!view) return null;
    let program;
    try { program=parseJavaScript(view.text,{sourceType:'module'}); }
    catch { const result={invalid:'ecmascript-parser-refused'}; documents.set(key,result); return result; }
    const locals=new Map(),direct=new Map(),stars=[];
    let duplicateTopLevel=false;
    const bind=(name,value)=>{
      if(typeof name!=='string') return;
      const existing=locals.get(name);
      // ECMAScript module top-level lexical names cannot collide with
      // imports or other declarations. Repeated var declarations are one
      // legal binding; a naive Map overwrite would otherwise manufacture a
      // valid export from an invalid source module.
      if(existing && !(existing.declarationKind==='var' &&
                       value.declarationKind==='var'))
        duplicateTopLevel=true;
      else locals.set(name,value);
    };
    const offer=(name,entry)=>{
      if (typeof name!=='string') return;
      const existing=direct.get(name)||[];
      existing.push(entry);
      direct.set(name,existing);
    };
    // Independent declaration/lexical binding pass: exports can refer to a
    // declaration later in the module, but an invented name isn't a binding.
    for (const node of program.body) {
      const decl=node.type==='ExportNamedDeclaration' ||
        node.type==='ExportDefaultDeclaration' ? node.declaration : node;
      const declarationKind=decl?.type==='VariableDeclaration' ? decl.kind : decl?.type;
      for (const name of declarationsOf(decl))
        bind(name,{kind:'local',declarationKind});
      if (node.type==='ImportDeclaration')
        for (const s of node.specifiers) {
          const imported=s.type==='ImportDefaultSpecifier' ? 'default' :
            s.type==='ImportNamespaceSpecifier' ? '*' : nameOf(s.imported);
          bind(nameOf(s.local),{kind:'import',declarationKind:'import',
            from:node.source?.value,imported});
        }
    }
    for (const node of program.body) {
      if (node.type==='ExportDefaultDeclaration') {
        offer('default',{kind:'default',node});
      } else if (node.type==='ExportAllDeclaration') {
        if (node.exported)
          offer(nameOf(node.exported),{kind:'namespace',from:node.source?.value,node});
        else stars.push({from:node.source?.value,node});
      } else if (node.type==='ExportNamedDeclaration') {
        if (node.declaration)
          for (const name of declarationsOf(node.declaration))
            offer(name,{kind:'local',name,node});
        for (const spec of node.specifiers)
          offer(nameOf(spec.exported),{
            kind:node.source?'from':'local',
            name:nameOf(spec.local),from:node.source?.value,node,
          });
      }
    }
    const doc={locals,direct,stars,
      ...(duplicateTopLevel?{invalid:'duplicate-top-level-binding'}:{})};
    documents.set(key,doc);
    return doc;
  }
  function resolve(owner,path,exportedName,visited=new Set()) {
    const key=token(owner,path), coordinate=JSON.stringify([key,exportedName]);
    if (visited.has(coordinate))
      return out('unknown',null,[],'cyclic-reexport');
    if (!views.has(key))
      return out('unknown',null,[],'source-not-provided');
    const doc=documentOf(key);
    if (doc.invalid)
      return out('unknown',null,[],doc.invalid);
    const next=new Set(visited);next.add(coordinate);
    const direct=doc.direct.get(exportedName)||[];
    if (direct.length>1)
      return out('contested',null,direct.map(x=>note(path,exportedName,x.node)),
        'duplicate-explicit-export');
    const recurse=(from,name,node)=>{
      const targetPath=relative(path,from);
      if (!targetPath) return out('unknown',null,[note(path,exportedName,node)],
        'unresolved-external-or-invalid-import');
      const reading=resolve(owner,targetPath,name,next);
      return out(reading.status,reading.resolved,
        [note(path,exportedName,node),...reading.evidence],reading.reason);
    };
    const entry=direct[0];
    if (entry) {
      if (entry.kind==='default')
        return out('observed',target(owner,path,'default'),
          [note(path,exportedName,entry.node)]);
      if (entry.kind==='namespace') {
        const resolvedPath=relative(path,entry.from);
        if (!resolvedPath || !views.has(token(owner,resolvedPath)))
          return out('unknown',null,[note(path,exportedName,entry.node)],
            'namespace-source-not-provided');
        const namespaceDocument=documentOf(token(owner,resolvedPath));
        if (namespaceDocument.invalid)
          return out('unknown',null,[note(path,exportedName,entry.node)],
            namespaceDocument.invalid);
        return out('observed',target(owner,resolvedPath,'*'),
          [note(path,exportedName,entry.node)]);
      }
      if (entry.kind==='from')
        return recurse(entry.from,entry.name,entry.node);
      const local=doc.locals.get(entry.name);
      if (!local)
        return out('unknown',null,[note(path,exportedName,entry.node)],
          'exported-local-not-declared');
      if (local.kind==='import') {
        if (local.imported==='*') {
          const resolvedPath=relative(path,local.from);
          if (!resolvedPath || !views.has(token(owner,resolvedPath)))
            return out('unknown',null,[note(path,exportedName,entry.node)],
              'namespace-source-not-provided');
          const namespaceDocument=documentOf(token(owner,resolvedPath));
          if (namespaceDocument.invalid)
            return out('unknown',null,[note(path,exportedName,entry.node)],
              namespaceDocument.invalid);
          return out('observed',target(owner,resolvedPath,'*'),
            [note(path,exportedName,entry.node)]);
        }
        return recurse(local.from,local.imported,entry.node);
      }
      return out('observed',target(owner,path,entry.name),
        [note(path,exportedName,entry.node)]);
    }
    if (exportedName==='default') return out('absent');
    // ECMAScript star exports omit default. Several witnessed paths that
    // resolve to one ORIGINAL target do not create a conflict; distinct
    // resolved targets do. An unresolved edge forbids a false "absent".
    const readings=doc.stars.map(x=>recurse(x.from,exportedName,x.node));
    if (readings.some(x=>x.status==='contested'))
      return out('contested',null,readings.flatMap(x=>x.evidence),
        'nested-export-conflict');
    const qualified=readings.filter(x=>x.status==='observed');
    const ids=unique(qualified.map(x=>JSON.stringify(x.resolved)));
    if (ids.length>1)
      return out('contested',null,readings.flatMap(x=>x.evidence),
        'distinct-star-export-targets');
    const unknown=readings.find(x=>x.status==='unknown');
    if (unknown)
      return out('unknown',null,unknown.evidence,unknown.reason);
    if (qualified.length) {
      const first=[...qualified].sort((a,b)=>
        JSON.stringify(a.evidence)<JSON.stringify(b.evidence)?-1:1)[0];
      return out('observed',first.resolved,first.evidence);
    }
    return out('absent');
  }
  return Object.freeze({
    inspect({owner,path,exportName}={}) {
      if (!scalar(owner)||!scalar(path)||!scalar(exportName))
        throw new TypeError('exact-owner-path-export-required');
      return resolve(owner,path,exportName);
    },
  });
}
