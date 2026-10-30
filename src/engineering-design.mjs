import { createHash } from 'node:crypto';
import { readRequirementArchitectureTrace } from './architecture-description.mjs';
import { semanticIdOf } from '@red-cup-engineering/computer-data-engineering-services-section/semiotic-expression-notation/semantic-content-identity';
import { admitCanonicalJson, UNBOUNDED_JSON_ENVELOPE } from '@red-cup-engineering/json-services-section/canonical-json';
import { createSchema } from '@red-cup-engineering/json-schema-services-section';
import { indexJavaScriptModuleBindings } from './javascript-module-bindings.mjs';

/*
 * engineering-design-generator-bootstrap; selected artifact src/engineering-design.mjs.
 * Source: /home/emsenn/bare-cedar-fog/services/engineering-services-section/data/records/service-records/requirements-management-service-records/moneyday-generator-bootstrap.work-order.md, lines 1–51;
 * sha256:e9d7b54100ae1e71897cbf454ab4b6eeee5a5c9e4b8f4452a99a917cbef21ff1.
 * Specification: ni:///sha-256;ibxfTKKv52uoJFwqXfc83Cr-UxHUFMiwJf1LHAPFGZs.
 * Normative trace: native-design-generation, exact-source-cut, source-binding,
 * native-request, hld-profile, lld-profile, complete-trace, lld-upstream,
 * receive-original, unknowns-and-independence, no-false-closure, bounded-domain
 * all project through jsnode-modules and owe stage-contract-receiving.
 * All are subject to the following constraints; none is discharged by this source.
 * leader-source: 561 Group Leader, bounded bootstrap authorized2026-10-27;
 * https://github.com/red-cup-engineering/engineering-services-section/blob/d11f80170c947e18e695bdaa0dbfb713edac1252/data/records/service-records/requirements-management-service-records/requirements-generate-specifications-designs-and-normative-code.json
 * Applies only to constructing and qualifying missing Engineering generator stages.
 * Use incumbent native Fabrication; preserve provenance, independent receiving,
 * generated/proof chain and downstream earning, storage and custody gates.
 * native-line: Red Cup Engineering, installed Fabrication0.4.15-dev.1 and
 * JSNodePackage0.4.0; /gnu/store/sq5kwc4b6y2k7h7izqi6rjbadjvvagwy-bare-cedar-fog-deployment-1/node_modules/@red-cup-engineering/computer-systems-fabrication-engineering-services-section/scripts/fabricate-jsnode-closure.mjs
 * Applies to original source-free meaning closure and isolated native receiver.
 * Independent pre-source assays, complete isolated module execution and actual
 * lot outcomes remain owed; the writer must not receive hidden derived assays.
 * original-owner-placement: Red Cup Engineering, bounded bootstrap contract;
 * https://github.com/red-cup-engineering/engineering-services-section/pull/176
 * Applies to actual source, module graph and independently received consumer.
 * Preserve incumbent Specification/Architecture operations, source/export bytes
 * and consumers in the original specification-engineering-services-section owner.
 * export-name-grammar: Ecma TC39, living draft observed2026-10-27,
 * ModuleExportName and IdentifierName productions only;
 * https://tc39.es/ecma262/multipage/ecmascript-language-scripts-and-modules.html#prod-ModuleExportName
 * Applies only to public export versus local binding; ASCII restriction here
 * grants neither valid local reserved-word bindings nor whole-edition conformance.
 * Mandatory receiving still owed: stage-contract-receiving (independent native
 * functional assays); original-consumer-receiving (actual infer delivery, HLD
 * then LLD, original producer tests and independent installed consumer receiving);
 * source-artifact-and-channel-receiving (original Code/module/closure inspection,
 * native lots/proofing, owner/export preservation and exact supplier delegation);
 * host-effects-and-input-custody-receiving (actual effects and argument ownership
 * inspection plus native isolation/consumer execution); outer-envelope-receiving
 * (independent export/schema inspection and original typed caller admission).
 * Output-only cases cannot certify these reviews. No qualification, publication,
 * installation, Proof, source adoption, semantic refinement or earning is granted.
 * Original full source-cut validation and competent adoption remain external.
 * Unknowns and all design testimony remain conditional; downstream effectful
 * fabrication owes blocking-unknown refusal and source/design-pinned Proof.
 * Host/typed request owner retains byte, time and resource limits.
 */

import { projectHighLevelDesignReview } from './engineering-design-review.mjs';
import { fileURLToPath } from 'node:url';
import { readFileText } from '@red-cup-engineering/computer-file-engineering-services-section/read-file';
import { validateJsonSchema } from '@red-cup-engineering/json-schema-services-section/validation';

const REVIEW_INPUT_SCHEMA_PATH=fileURLToPath(new URL(
  '../data/records/schema/project-high-level-design-review.input.schema.json',
  import.meta.url));
const REVIEW_INPUT_SCHEMA=JSON.parse(await readFileText(REVIEW_INPUT_SCHEMA_PATH));

const ORDER = ['requirement', 'specification', 'architecture', 'high-level'];
const LAYERS = ['data', 'code', 'networking', 'systems'];
const SYSTEM = 'Derive only the requested engineering design candidate from the complete original source cut. Retain every original requirement, explicit uncertainty and source identity. Follow the supplied response schema. A candidate is not adoption, proof, fabrication, installation or operation. Return one complete JSON design value. Exact source identity and upstream uncertainty remain in the complete source envelope; keep openQuestions concise and retain relevant blockers without repeating entire source records or source metadata. For high-level design use unique component IDs, acyclic dependencies on same or lower Data, Code, Networking, Systems layers, provider-to-consumer port connections with exactly one provider per required port, and one exact original Requirement-cell trace row covering every component. For low-level design use the exact component IDs and per-cell allocations from the supplied high-level candidate, cover every high-level component, and use unique operation IDs and module/export pairs. Every module is a concrete prospective POSIX relative path starting src/ and ending .mjs, with no backslash or empty, dot or dotdot segment. Every exportName is a whole ASCII identifier spelling: letter, underscore or dollar first, then letters, digits, underscores or dollars. Choose concrete NEW candidate module/export names where new work is required; this does not assert that those interfaces already exist. Retain unresolved existing bindings in openQuestions, never as placeholder prose in module or exportName. Input/output schema fields contain JSON text decoding to an object or boolean. Each trace row names exactly its original Specification clauses, actual Architecture model IDs and selected design elements; low-level operation component IDs for that row must equal the high-level component allocation as a set. Keep all declared behavior, failure, bound, effect and acceptance fields; unknown bounds or mechanisms remain explicit unqualified blockers and grant no effect authority. The receiver checks structural correspondence only; semantic refinement, source adoption, Proof and installed operation remain separately unreceived.';

const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const nonblank = v => typeof v === 'string' && v.trim().length > 0;
function requireThat(condition) {
  if (!condition) throw new TypeError('Invalid engineering design input or source projection');
}
function exact(v, keys) {
  return object(v) && Object.keys(v).length === keys.length && keys.every(k => Object.hasOwn(v, k));
}
function strings(v, minimum = 0, unique = false) {
  return Array.isArray(v) && v.length >= minimum && v.every(nonblank) && (!unique || new Set(v).size === v.length);
}
function sameSet(a, b) {
  const x = new Set(a), y = new Set(b);
  return x.size === y.size && [...x].every(v => y.has(v));
}
function equal(a, b) {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== typeof b) return false;
  if (Array.isArray(a) || Array.isArray(b)) {
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => equal(v, b[i]));
  }
  if (!object(a) || !object(b)) return false;
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every(k => Object.hasOwn(b, k) && equal(a[k], b[k]));
}
function parseObject(text) {
  // The original JSON supplier is the only syntax/duplicate-key admission
  // authority: JSON.parse alone silently discards earlier normative clauses.
  // Keep the incumbent host's source-size admission unchanged; do not impose
  // the JSON transformation seller's narrower 64 KiB policy on Engineering.
  const value = admitCanonicalJson(text, UNBOUNDED_JSON_ENVELOPE).value;
  requireThat(object(value));
  return value;
}

// Fresh schema graphs are built for every plan; no returned declaration is shared.
function designSchema(stage) {
  const s = () => ({ type: 'string', minLength: 1 });
  const arr = (items, minimum) => minimum === undefined
    ? { type: 'array', items } : { type: 'array', items, minItems: minimum };
  const obj = properties => ({ type: 'object', additionalProperties: false, required: Object.keys(properties), properties });
  const trace = () => arr(obj({
    requirementCellId: s(), specificationClauseIds: arr(s(), 1),
    architectureModelIds: arr(s(), 1), designElementIds: arr(s(), 1)
  }), 1);
  if (stage === 'high-level') return obj({
    components: arr(obj({
      id: s(), owner: s(), layer: { enum: ['data', 'code', 'networking', 'systems'] },
      responsibility: s(), dependencyIds: arr(s()), providedPorts: arr(s()), requiredPorts: arr(s())
    }), 1),
    connections: arr(obj({ fromComponentId: s(), toComponentId: s(), port: s() })),
    traceability: trace(), openQuestions: arr(s())
  });
  return obj({
    operations: arr(obj({
      id: s(), componentId: s(), module: s(), exportName: s(),
      inputSchemaJson: s(), outputSchemaJson: s(), behavior: s(),
      preconditions: arr(s()), postconditions: arr(s(), 1), failureCases: arr(s(), 1),
      resourceBounds: arr(s(), 1), effectBoundaries: arr(s(), 1), acceptanceObligations: arr(s(), 1)
    }), 1),
    traceability: trace(), openQuestions: arr(s())
  });
}

function envelope(input, receiving) {
  requireThat(exact(input, receiving ? ['plan', 'stage', 'sources', 'deliveryText'] : ['stage', 'sources']));
  requireThat(input.stage === 'high-level' || input.stage === 'low-level');
  requireThat(Array.isArray(input.sources) && input.sources.length >= 1);
  for (const source of input.sources) {
    requireThat(exact(source, ['kind', 'text']) && ORDER.includes(source.kind) &&
      typeof source.text === 'string' && source.text.length >= 1 &&
      // Node UTF-8 encoding replaces isolated UTF-16 surrogates with U+FFFD.
      // Accepting them gives distinct authored source strings one digest.
      source.text.isWellFormed());
  }
  if (receiving) requireThat(object(input.plan) && typeof input.deliveryText === 'string');
}

function sourceContext(stage, supplied) {
  const kinds = ORDER.slice(0, stage === 'high-level' ? 3 : 4);
  requireThat(supplied.length === kinds.length);
  const byKind = new Map();
  for (const source of supplied) {
    requireThat(kinds.includes(source.kind) && !byKind.has(source.kind));
    byKind.set(source.kind, source.text);
  }
  requireThat(kinds.every(k => byKind.has(k)));
  const sources = kinds.map(kind => {
    const text = byKind.get(kind);
    return { kind, text, digest: 'sha256:' + createHash('sha256').update(text, 'utf8').digest('hex') };
  });
  const parsed = new Map(sources.map(s => [s.kind, parseObject(s.text)]));
  const r = parsed.get('requirement');
  requireThat(r.kind === 'requirement' && nonblank(r.id) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(r.id) && !/[^a-z0-9-]/.test(r.id));
  requireThat(Array.isArray(r['met-when']) && r['met-when'].length > 0);
  const cells = new Map();
  for (const condition of r['met-when']) {
    requireThat(object(condition) && nonblank(condition.cell) && condition.cell.startsWith(r.id + ':') && !cells.has(condition.cell));
    requireThat(condition.target === 'held' && nonblank(condition.says) && !/[\r\n\u0000]/.test(condition.says));
    cells.set(condition.cell, []);
  }
  // This is the complete native parsed Requirement, including ignored fields.
  // Supplier refusals deliberately propagate without replacement or repair.
  const address = semanticIdOf('metroplat.artifact')(r);
  const specification = parsed.get('specification');
  requireThat(object(specification.identity) && nonblank(specification.identity.id));
  requireThat(object(specification.provenance) && Array.isArray(specification.provenance.derivedFrom));
  requireThat(specification.provenance.derivedFrom.every(v => typeof v === 'string') && specification.provenance.derivedFrom.includes(r.id + '@' + address));
  requireThat(Array.isArray(specification.topics) && specification.topics.length > 0);
  const references = new Map([...cells.keys()].map(cell => ['Original Requirement ' + r.id + ' (' + address + '), cell ' + cell, cell]));
  const clauseIds = new Set();
  for (const topic of specification.topics) {
    requireThat(object(topic) && Array.isArray(topic.clauses));
    for (const clause of topic.clauses) {
      requireThat(object(clause) && nonblank(clause.id) && !clauseIds.has(clause.id));
      requireThat(strings(clause.backedBy, 1, true));
      // Native Specification already supports an authored clause.test. It is
      // an unexecuted verification obligation, not LLD model testimony.
      // Refuse unsafe source carriers before an inference or Code readout.
      requireThat(clause.test === undefined ||
        (typeof clause.test === 'string' && clause.test.trim().length > 0 &&
          Buffer.byteLength(clause.test, 'utf8') <= 4096 &&
          clause.test.isWellFormed() &&
          !/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/u.test(clause.test)));
      clauseIds.add(clause.id);
      for (const ref of clause.backedBy) {
        requireThat(references.has(ref));
        cells.get(references.get(ref)).push(clause.id);
      }
    }
  }
  requireThat(clauseIds.size > 0 && [...cells.values()].every(v => v.length > 0));
  const architecture = parsed.get('architecture');
  requireThat(architecture.type === 'ArchitectureDescriptionCandidate' && object(architecture.identity));
  requireThat(nonblank(architecture.identity.id) && nonblank(architecture.identity.revision));
  // Reuse the incumbent Architecture reader's *exact source-cut* admission,
  // not just model-ID existence. Otherwise an old/different Architecture can
  // mint fresh HLD/LLD candidates merely by copying an unrelated model label.
  const architectureTrace = readRequirementArchitectureTrace(architecture, {
    requirement: r, specification
  });
  // Preserve the original Architecture reader's per-clause source relation.
  // A model tied to a Requirement cell does not necessarily implement every
  // separately authored normative clause for that cell.
  const authoredClausesByCell = new Map(architectureTrace.rows.map(row => {
    const modeled = new Map();
    for (const path of row.authoredPaths) {
      const clauses = modeled.get(path.modelId) ?? new Set();
      for (const clause of path.clauseIds) clauses.add(clause);
      modeled.set(path.modelId, clauses);
    }
    return [row.cell, modeled];
  }));
  // Architecture must be complete enough to plan Design: if even one
  // normative clause lacks a model, refuse before invoking inference.
  requireThat(authoredClausesByCell.size === cells.size &&
    [...cells].every(([cell, clauses]) => {
      const modeled = authoredClausesByCell.get(cell);
      return modeled && modeled.size > 0 &&
        clauses.every(clause => [...modeled.values()].some(set => set.has(clause)));
    }));
  requireThat(Array.isArray(architecture.models) && architecture.models.length > 0);
  const models = new Set();
  for (const model of architecture.models) {
    requireThat(object(model) && nonblank(model.id) && !models.has(model.id) && nonblank(model.content));
    models.add(model.id);
  }
  const context = { sources, cells, models, authoredClausesByCell, architectureTrace, hld: null };
  if (stage === 'low-level') {
    const upstream = parsed.get('high-level');
    requireThat(exact(upstream, ['type', 'stage', 'sources', 'design', 'admitted', 'proof']));
    requireThat(upstream.type === 'EngineeringDesignCandidate' && upstream.stage === 'high-level' && upstream.admitted === false && upstream.proof === 'unreceived');
    requireThat(equal(upstream.sources, sources.slice(0, 3)));
    requireThat(validDesign('high-level', upstream.design, context));
    context.hld = upstream.design;
  }
  return context;
}

function traceValid(rows, elements, context, lowLevel) {
  if (!Array.isArray(rows) || rows.length !== context.cells.size) return false;
  const seen = new Set(), covered = new Set();
  const upstreamRows = lowLevel ? new Map(context.hld.traceability.map(r => [r.requirementCellId, r])) : null;
  for (const row of rows) {
    if (!exact(row, ['requirementCellId', 'specificationClauseIds', 'architectureModelIds', 'designElementIds']) || !nonblank(row.requirementCellId)) return false;
    if (seen.has(row.requirementCellId) || !context.cells.has(row.requirementCellId)) return false;
    seen.add(row.requirementCellId);
    if (!strings(row.specificationClauseIds, 1, true) || !strings(row.architectureModelIds, 1, true) || !strings(row.designElementIds, 1, true)) return false;
    if (!sameSet(row.specificationClauseIds, context.cells.get(row.requirementCellId))) return false;
    // Selected models must *jointly* witness every claimed normative clause,
    // not merely occur somewhere under the same original Requirement cell.
    const byModel = context.authoredClausesByCell.get(row.requirementCellId);
    const supportedClauses = new Set();
    if (!row.architectureModelIds.every(id => {
      if (!context.models.has(id) || !byModel?.has(id)) return false;
      for (const clause of byModel.get(id)) supportedClauses.add(clause);
      return true;
    }) || !sameSet([...supportedClauses], row.specificationClauseIds) ||
      !row.designElementIds.every(id => elements.has(id))) return false;
    for (const id of row.designElementIds) covered.add(id);
    if (lowLevel && (!sameSet(row.designElementIds.map(id => elements.get(id).componentId), upstreamRows.get(row.requirementCellId)?.designElementIds ?? []) ||
      !sameSet(row.architectureModelIds, upstreamRows.get(row.requirementCellId)?.architectureModelIds ?? []))) return false;
  }
  return covered.size === elements.size;
}

function validHld(design, context) {
  if (!exact(design, ['components', 'connections', 'traceability', 'openQuestions']) || !strings(design.openQuestions)) return false;
  if (!Array.isArray(design.components) || design.components.length === 0 || !Array.isArray(design.connections)) return false;
  const components = new Map();
  for (const c of design.components) {
    if (!exact(c, ['id', 'owner', 'layer', 'responsibility', 'dependencyIds', 'providedPorts', 'requiredPorts'])) return false;
    if (!nonblank(c.id) || !nonblank(c.owner) || !nonblank(c.responsibility) || !LAYERS.includes(c.layer) || components.has(c.id)) return false;
    if (!strings(c.dependencyIds, 0, true) || !strings(c.providedPorts, 0, true) || !strings(c.requiredPorts, 0, true)) return false;
    components.set(c.id, c);
  }
  for (const c of components.values()) for (const id of c.dependencyIds) {
    const provider = components.get(id);
    if (!provider || id === c.id || LAYERS.indexOf(provider.layer) > LAYERS.indexOf(c.layer)) return false;
  }
  // Iterative dependency elimination avoids recursive graph traversal.
  const pending = new Map(), consumers = new Map([...components.keys()].map(id => [id, []]));
  for (const c of components.values()) {
    pending.set(c.id, c.dependencyIds.length);
    for (const id of c.dependencyIds) consumers.get(id).push(c.id);
  }
  const ready = [...pending.keys()].filter(id => pending.get(id) === 0);
  let count = 0;
  for (let i = 0; i < ready.length; i++) {
    count++;
    for (const id of consumers.get(ready[i])) {
      const remaining = pending.get(id) - 1;
      pending.set(id, remaining);
      if (remaining === 0) ready.push(id);
    }
  }
  if (count !== components.size) return false;
  const triples = new Set(), connected = new Map([...components.keys()].map(id => [id, new Set()]));
  for (const connection of design.connections) {
    if (!exact(connection, ['fromComponentId', 'toComponentId', 'port']) || !nonblank(connection.fromComponentId) || !nonblank(connection.toComponentId) || !nonblank(connection.port)) return false;
    const from = components.get(connection.fromComponentId), to = components.get(connection.toComponentId);
    if (!from || !to || from.id === to.id || !to.dependencyIds.includes(from.id) || !from.providedPorts.includes(connection.port) || !to.requiredPorts.includes(connection.port)) return false;
    const triple = JSON.stringify([from.id, to.id, connection.port]);
    if (triples.has(triple) || connected.get(to.id).has(connection.port)) return false;
    triples.add(triple);
    connected.get(to.id).add(connection.port);
  }
  for (const c of components.values()) if (!c.requiredPorts.every(port => connected.get(c.id).has(port))) return false;
  return traceValid(design.traceability, components, context, false);
}

// An embedded LLD interface schema is normative source, not an opaque JSON
// string. JSON.parse silently erases earlier duplicate keys and changes the
// prospective Code contract, so share the original strict JSON admission.
function parseSchemaText(text) {
  const value = admitCanonicalJson(text, UNBOUNDED_JSON_ENVELOPE).value;
  if (typeof value !== 'boolean' && !object(value))
    throw new TypeError('Invalid Engineering Design interface schema JSON');
  // JSON syntax is not Schema vocabulary syntax: preserve the original source
  // text, but ask the incumbent bounded Draft 2020-12 supplier to refuse
  // malformed keyword contracts before projecting prospective Code Work.
  // This temporary validation address is never returned as source identity,
  // admitted Design, independent Proof or a native Code effect.
  if (object(value)) createSchema(value,
    value.$id ?? 'urn:engineering-design:unadmitted-interface',
    { allowUnknownAnnotations: true });
  return value;
}
function schemaTextValid(text) {
  try { parseSchemaText(text); return true; }
  catch { return false; }
}
function validLld(design, context) {
  if (!exact(design, ['operations', 'traceability', 'openQuestions']) || !strings(design.openQuestions)) return false;
  if (!Array.isArray(design.operations) || design.operations.length === 0) return false;
  const components = new Map(context.hld.components.map(c => [c.id, c]));
  const realized = new Set(), operations = new Map(), pairs = new Set();
  const scalars = ['id', 'componentId', 'module', 'exportName', 'inputSchemaJson', 'outputSchemaJson', 'behavior'];
  const lists = ['preconditions', 'postconditions', 'failureCases', 'resourceBounds', 'effectBoundaries', 'acceptanceObligations'];
  for (const operation of design.operations) {
    if (!exact(operation, [...scalars, ...lists]) || !scalars.every(k => nonblank(operation[k]))) return false;
    if (!lists.every(k => strings(operation[k], k === 'preconditions' ? 0 : 1))) return false;
    if (operations.has(operation.id) || !components.has(operation.componentId)) return false;
    // A relative module/export is unique only within its original HLD owner.
    // Identically named exports in different source repositories are distinct
    // Code targets; the same owner/path/export remains an actual collision.
    const pair = JSON.stringify([components.get(operation.componentId)?.owner,
      operation.module, operation.exportName]);
    if (pairs.has(pair)) return false;
    const path = operation.module;
    // POSIX source paths cannot contain NUL. Unpaired UTF-16 surrogates
    // materialize as replacement-character bytes, so they can alias another
    // prospectively named module while the Design IDs still appear distinct.
    // Keep valid scalar Unicode paths but insist on their exact NFC-stable
    // spelling: a Code/filesystem source may otherwise address the same
    // prospective module through a different canonically equivalent path.
    // Refuse the proposal, never rewrite a reviewed path under its old NI.
    if (path.includes(String.fromCharCode(0)) || !path.isWellFormed() || path.normalize('NFC') !== path) return false;
    if (!path.startsWith('src/') || !path.endsWith('.mjs') || path.includes('\\') || path.split('/').some(part => part === '' || part === '.' || part === '..')) return false;
    // Whole ASCII membership, including exclusion of every trailing terminator.
    if (!/^[A-Za-z_$]/.test(operation.exportName) || /[^A-Za-z0-9_$]/.test(operation.exportName)) return false;
    if (!schemaTextValid(operation.inputSchemaJson) || !schemaTextValid(operation.outputSchemaJson)) return false;
    operations.set(operation.id, operation);
    pairs.add(pair);
    realized.add(operation.componentId);
  }
  return realized.size === components.size && traceValid(design.traceability, operations, context, true);
}
function validDesign(stage, design, context) {
  return stage === 'high-level' ? validHld(design, context) : validLld(design, context);
}
function makePlan(stage, context) {
  const sources = context.sources;
  return {
    type: 'EngineeringDesignDerivationPlan', stage, sources,
    request: {
      taskClass: 'code-fabrication', objective: 'Derive ' + stage + ' design',
      messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: JSON.stringify({ stage, sources }) }],
      schema: designSchema(stage), requiredCapabilities: ['text-output']
    }
  };
}

/**
 * Plan source-bound native inference for an HLD or LLD candidate.
 * Validates the declared envelope and current structural source projection;
 * supplier TypeError refusals propagate. No model invocation or adoption occurs.
 * @param {{stage: 'high-level'|'low-level', sources: Array<{kind: string, text: string}>}} input Original stage and exact source texts.
 * @returns {object} EngineeringDesignDerivationPlan with the native request and exact source hashes.
 */
export function planEngineeringDesign(input) {
  envelope(input, false);
  return makePlan(input.stage, sourceContext(input.stage, input.sources));
}

/**
 * Project an unchanged Design derivation plan into the ORIGINAL Computer
 * Inference Engine's closed, typed work-request input, without invoking it.
 *
 * The historic plan.request is an abstract Design intent: CIE does not admit
 * its "messages"/"schema" keys. CIE instead consumes "objective"/"context"/
 * "outputSchema" and only offers provider-side constrained JSON when explicitly
 * enabled for a provider advertising "json-schema-output". Preserve this
 * original plan (including earlier HLD/negative-lot source identities) and
 * translate it deterministically rather than rewriting a prior receipt.
 *
 * Source contracts: CIE inference-work-request.schema.json at blob
 * 81608c2608df119d8ddb0f2ecd5cee42fce879a0; inference-dispatch.mjs at
 * 91c2176454d93dcbf103f24e96e1b69b9f9b27dc; direct-endpoint-provider.mjs
 * at a17f7759fc5b17fa9f2e8f3980c8fd3a240ad956 (observed 2026-10-29).
 * CIE's plain inference route has a generic host system message, so Design's
 * former system instructions must now travel explicitly in the objective.
 * This changes prompt-role priority; it is NOT a proven equivalent inference
 * delivery. The original Design receiver must independently assay the result.
 *
 * Caller/host still owns Work, resource ceilings, provider capability evidence,
 * credentials, authorized spend and actual CIE invocation. Missing availability
 * is a refusal, not a reason to silently fall back to an unconstrained model.
 * The output is not a provider request receipt, adopted Design or Proof.
 */
export function readEngineeringDesignInferenceWork(plan) {
  requireThat(exact(plan, ['type', 'stage', 'sources', 'request']) &&
    plan.type === 'EngineeringDesignDerivationPlan' && Array.isArray(plan.sources));
  const supplied = plan.sources.map(source => {
    requireThat(exact(source, ['kind', 'text', 'digest']) &&
      typeof source.text === 'string' && typeof source.digest === 'string');
    return { kind: source.kind, text: source.text };
  });
  // Re-derive the COMPLETE original unmodified plan and its verified upstream
  // Requirement/Specification/Architecture/HLD source cut. No caller-supplied
  // request fragment or source digest may be substituted after this check.
  const derived = makePlan(plan.stage, sourceContext(plan.stage, supplied));
  requireThat(equal(plan, derived));
  return {
    objective: plan.request.objective + '\n\n' + plan.request.messages[0].content,
    context: plan.request.messages[1].content,
    contextOptimization: { mode: 'exact' },
    taskClass: plan.request.taskClass,
    outputSchema: structuredClone(plan.request.schema),
    enforceProviderSchema: true,
    requiredCapabilities: ['json-schema-output']
  };
}

/**
 * Receive an actual HLD or LLD candidate against its complete current plan.
 * Structural correspondence does not receive semantic refinement, Proof, source
 * adoption or effect authority; all independent review obligations remain owed.
 * @param {{plan: object, stage: 'high-level'|'low-level', sources: Array<{kind: string, text: string}>, deliveryText: string}} input Current source cut, original plan and actual delivery.
 * @returns {object} An unchanged parsed design in an unadmitted EngineeringDesignCandidate with proof unreceived, or an explicit derivation refusal.
 */
export function receiveEngineeringDesign(input) {
  envelope(input, true);
  const context = sourceContext(input.stage, input.sources);
  const plan = makePlan(input.stage, context);
  if (!equal(plan, input.plan)) return { type: 'EngineeringDesignDerivationRefusal', reason: 'source-cut-mismatch' };
  // A delivered raw string must have a one-to-one UTF-8 representation
  // before parsing: JSON.parse tolerates lone surrogates even though hashing
  // or materializing them silently changes the authored source bytes.
  if (!input.deliveryText.isWellFormed())
    return { type: 'EngineeringDesignDerivationRefusal', reason: 'invalid-design' };
  let design;
  try {
    // Reuse identical strict JSON admission for the provider's delivered
    // design: duplicate operations or escaped lone surrogates cannot disappear
    // between raw delivery and the original source-owned candidate.
    design = admitCanonicalJson(input.deliveryText, UNBOUNDED_JSON_ENVELOPE).value;
  } catch {
    return { type: 'EngineeringDesignDerivationRefusal', reason: 'invalid-design' };
  }
  if (!validDesign(input.stage, design, context)) return { type: 'EngineeringDesignDerivationRefusal', reason: 'invalid-design' };
  return { type: 'EngineeringDesignCandidate', stage: input.stage, sources: plan.sources, design, admitted: false, proof: 'unreceived' };
}


/**
 * Receive one original review-authored HLD through the EXISTING Design
 * projector AND exact source-cut Design receiver, not a second HLD generator.
 *
 * Inputs preserve the original Requirement, Specification, Architecture,
 * reviewed source cut and byte-identical review JSON. The review and selected
 * budget must be admitted by their actual external Office/host; an SHA/NI is
 * an integrity address, not authority. No model, shell, Code writer or paid
 * inference is invoked here. Even an internally valid result is an
 * unadmitted Design candidate with independent Proof and receiving open.
 *
 * The source-bound HLD candidate can be reused as the unchanged fourth
 * source for the original low-level planEngineeringDesign operation.
 */
export function receiveEngineeringHighLevelReview({
  sources, reviewText, expectedReviewSha256, reviewedSourceCut, limits,
} = {}) {
  const bounded = ['maxReviewBytes', 'maxComponents', 'maxRequirements', 'maxTraceRows'];
  if (!exact(limits, bounded) ||
      !bounded.every(key => Number.isSafeInteger(limits[key]) && limits[key] > 0))
    throw new TypeError('Engineering review bounds must be exact positive integers');
  if (typeof reviewText !== 'string' || !reviewText.isWellFormed() ||
      !/^sha256:[a-f0-9]{64}$/u.test(expectedReviewSha256))
    throw new TypeError('Engineering review source digest requires well-formed original text');
  const reviewBytes = Buffer.byteLength(reviewText, 'utf8');
  if (reviewBytes > limits.maxReviewBytes)
    throw new TypeError('Engineering review budget exceeded before projection');
  const actualDigest = 'sha256:' +
    createHash('sha256').update(reviewText, 'utf8').digest('hex');
  if (expectedReviewSha256 !== actualDigest)
    throw new TypeError('Engineering review source digest mismatch');

  // This is precisely the source projection used by planEngineeringDesign
  // and receiveEngineeringDesign. Never accept a separate caller trace.
  const context = sourceContext('high-level', sources);
  const sourceCut = context.sources.map(({kind,digest}) => ({kind,digest}));
  if (!Array.isArray(reviewedSourceCut) || !equal(reviewedSourceCut, sourceCut))
    return { type:'EngineeringDesignDerivationRefusal', reason:'source-cut-mismatch' };
  if (context.cells.size > limits.maxTraceRows)
    throw new TypeError('Engineering review budget exceeded for original trace');

  let review;
  try { review = parseObject(reviewText); }
  catch {
    return { type:'EngineeringDesignDerivationRefusal', reason:'invalid-review' };
  }
  if (!Array.isArray(review.components))
    return { type:'EngineeringDesignDerivationRefusal', reason:'invalid-review' };
  if (review.components.length > limits.maxComponents ||
      review.components.reduce((total, component) =>
        total + (Array.isArray(component?.requires) ? component.requires.length : 0), 0)
        > limits.maxRequirements)
    throw new TypeError('Engineering review budget exceeded for component allocations');

  // The original source-generated input schema governs the review's syntax;
  // the original Architecture reader supplies the *actual* authored trace.
  // A caller-authored model ID or claim cannot replace that derived evidence.
  const input = {review,trace:context.architectureTrace};
  if (!validateJsonSchema(input, REVIEW_INPUT_SCHEMA).valid)
    return { type:'EngineeringDesignDerivationRefusal', reason:'invalid-review' };

  let design;
  try { design = projectHighLevelDesignReview(input); }
  catch {
    return { type:'EngineeringDesignDerivationRefusal', reason:'invalid-review' };
  }
  const plan = makePlan('high-level', context);
  const deliveryText = JSON.stringify(design);
  const candidate = receiveEngineeringDesign({
    stage:'high-level', sources, plan, deliveryText,
  });
  // Cycles, false clause/model attribution, illegal layer links or incomplete
  // traceability are refused by the EXISTING Design receiver, not by a weaker
  // second structural checker.
  if (candidate.type !== 'EngineeringDesignCandidate') return candidate;
  return {
    type:'EngineeringDesignReviewProjection', version:1,
    originalReview:{
      expectedSha256:expectedReviewSha256,
      semanticId:semanticIdOf('metroplat.artifact')(review),
      bytes:reviewBytes,
    },
    reviewText, sourceCut, deliveryText, candidate,
    admitted:false, independentReview:'unreceived',
    proof:'unreceived', executableWork:false,
  };
}


/**
 * Read the exact Code-source cut against an ORIGINAL source-traced LLD
 * candidate. This turns the existing Design operation allocations into
 * machine-addressable Code/test Work INTENTS; it never fabricates, imports,
 * executes, installs, adopts or independently proves a program.
 *
 * Only the originally supplied plan and provider-delivered Design JSON can
 * authorize this READOUT of a received candidate. The original CIE/Work
 * receiver still must authenticate the provider task, original Work and
 * external authority; this is NOT a self-attested source certificate.
 *
 * A provided source view is only the selected custodian's declared bytes:
 * even a matching sha256 proves byte correspondence, NOT Git authority or
 * runtime behavior. An absent view is "unobserved", NOT proof the file is
 * absent from an uninspected repository. The original Code and Work owners
 * separately issue effect grants, implementation assays and receipts.
 */
export function readEngineeringCodeWork({
  designCandidate, originalPlan, originalDeliveryText, sourceViews,
} = {}) {
  requireThat(exact(designCandidate,
    ['type', 'stage', 'sources', 'design', 'admitted', 'proof']));
  requireThat(designCandidate.type === 'EngineeringDesignCandidate' &&
    designCandidate.stage === 'low-level' &&
    designCandidate.admitted === false && designCandidate.proof === 'unreceived');
  requireThat(Array.isArray(designCandidate.sources) &&
    designCandidate.sources.length === 4);
  const sources = designCandidate.sources.map(row => {
    requireThat(exact(row, ['kind', 'text', 'digest']) &&
      typeof row.text === 'string' &&
      row.digest === 'sha256:' + createHash('sha256').update(row.text, 'utf8').digest('hex'));
    return { kind: row.kind, text: row.text };
  });
  // The original LLD producer is the only local structural admission
  // authority. Re-receive the exact original provider-delivered JSON against
  // the original source-bound derivation plan, then compare the COMPLETE
  // returned candidate; a caller-mutated candidate cannot rewrite the
  // subsequently derived Code targets while preserving an old receipt.
  requireThat(typeof originalDeliveryText === 'string');
  const received = receiveEngineeringDesign({
    stage: 'low-level', sources, plan: originalPlan,
    deliveryText: originalDeliveryText,
  });
  requireThat(equal(received, designCandidate));

  // This already independently reconstructed Design contains the HLD's
  // original component owners. A relative src/ path is NOT a repository
  // identity: File, Deployment and Fabrication may all propose the same
  // relative module spelling. Preserve their original ownership, without
  // inferring GitHub authorization or executable Work from the HLD label.
  const highLevel = parseObject(designCandidate.sources[3].text);
  // Read original Specification verification procedures, not invented LLD
  // expectations. Source revisions and per-clause trace were already
  // re-received above against the complete Requirement/Architecture/HLD cut.
  const originalSpecification = parseObject(designCandidate.sources[1].text);
  const declaredSourceTests = new Map(originalSpecification.topics.flatMap(topic =>
    topic.clauses.map(clause => [clause.id, clause.test ?? null])));
  const originalOwners = new Map(highLevel.design.components.map(row =>
    [row.id, row.owner]));
  const keyOf = (owner, path) => JSON.stringify([owner, path]);
  const ownersByPath = new Map();
  const plannedSources = new Set();
  requireThat(Array.isArray(sourceViews) && sourceViews.length <= 64);
  requireThat(designCandidate.design.operations.length <= 64);
  for (const operation of designCandidate.design.operations) {
    const owner = originalOwners.get(operation.componentId);
    requireThat(nonblank(owner));
    plannedSources.add(keyOf(owner, operation.module));
    const owners = ownersByPath.get(operation.module) ?? new Set();
    owners.add(owner);
    ownersByPath.set(operation.module, owners);
  }
  const views = new Map();
  let bytes = 0;
  for (const view of sourceViews) {
    // Source identity is always the original HLD owner and exact path. An
    // ownerless view cannot borrow authority even when only one owner is
    // visible in this particular candidate; source revisions may add another.
    requireThat(exact(view, ['owner', 'path', 'text', 'expectedSha256']));
    const owners = ownersByPath.get(view.path);
    const owner = view.owner;
    const key = keyOf(owner, view.path);
    requireThat(nonblank(owner) && owners?.has(owner) &&
      plannedSources.has(key) && !views.has(key) &&
      typeof view.text === 'string' && view.text.isWellFormed() &&
      /^sha256:[a-f0-9]{64}$/u.test(view.expectedSha256));
    bytes += Buffer.byteLength(view.text, 'utf8');
    requireThat(Number.isSafeInteger(bytes) && bytes <= 2_097_152);
    const actualSha256 =
      'sha256:' + createHash('sha256').update(view.text, 'utf8').digest('hex');
    views.set(key, {
      owner, path: view.path, text: view.text,
      actualSha256, expectedSha256: view.expectedSha256,
      matchesExpectedSource: actualSha256 === view.expectedSha256,
    });
  }

  // The supplier's original trace carries the exact Requirement-cell,
  // normative Specification clauses and authored Architecture models.
  // Each proposed Code operation inherits all of its ORIGINAL trace rows;
  // no model-generated refines edge, new Requirement or proof is invented.
  const traced = new Map(designCandidate.design.operations.map(x => [x.id, []]));
  for (const row of designCandidate.design.traceability) {
    for (const operationId of row.designElementIds) {
      traced.get(operationId).push({
        requirementCellId: row.requirementCellId,
        specificationClauseIds: [...row.specificationClauseIds],
        architectureModelIds: [...row.architectureModelIds],
      });
    }
  }
  const gap = (code, operationId, module, detail) =>
    ({ code, operationId, module, detail });
  const discrepancies = [];
  // Only exact custodian-addressed bytes may enter the existing nonexecuting
  // ECMAScript grammar reader. Unobserved and mismatched source remains
  // unknown; imported modules outside this finite original target cut cannot
  // be guessed from the consumer's installed node_modules.
  const syntax = indexJavaScriptModuleBindings(
    [...views.values()].filter(v => v.matchesExpectedSource)
      .map(({owner,path,text}) => ({owner,path,text})),
    {maxBytes:2_097_152,maxModules:64});
  const targets = [...designCandidate.design.operations]
    .sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
    .map(operation => {
      const source = views.get(keyOf(originalOwners.get(operation.componentId), operation.module));
      const status = source === undefined ? 'source-not-observed'
        : !source.matchesExpectedSource ? 'source-cut-disagreement'
          : 'source-present-unassayed';
      if (status === 'source-not-observed')
        discrepancies.push(gap('SOURCE_VIEW_NOT_RECEIVED', operation.id,
          operation.module, 'No source bytes were provided for the intended module'));
      if (status === 'source-cut-disagreement')
        discrepancies.push(gap('SOURCE_DIGEST_DISAGREEMENT', operation.id,
          operation.module, 'Source bytes differ from the custodian-addressed digest'));
      const bindingObservation = status === 'source-present-unassayed'
        ? syntax.inspect({owner:originalOwners.get(operation.componentId),
          path:operation.module,exportName:operation.exportName}) : null;
      if (bindingObservation?.status === 'absent')
        discrepancies.push(gap('CODE_EXPORT_NOT_OBSERVED', operation.id,
          operation.module, 'Selected named export is absent in the complete supplied ECMAScript module'));
      if (bindingObservation?.status === 'contested')
        discrepancies.push(gap('CODE_EXPORT_CONTESTED', operation.id,
          operation.module, 'Distinct or duplicated ECMAScript export claims are contested'));
      // This is a ready-to-route *plan*, not an executable WorkCell. Treat
      // qualitative test obligations as independently unreceived, never
      // automatically generated behavioral assertions or passing tests.
      return {
        operationId: operation.id, componentId: operation.componentId,
        originalComponentOwner: originalOwners.get(operation.componentId),
        module: operation.module, exportName: operation.exportName,
        sourceStatus: status,
        observedSha256: source?.actualSha256 ?? null,
        expectedSha256: source?.expectedSha256 ?? null,
        // Syntax-only reading, never a semantic implementation/Proof verdict.
        // Unknown imports and parser refusals cannot become a clean code assay.
        bindingObservation,
        originalTrace: traced.get(operation.id)
          .sort((a,b) => a.requirementCellId < b.requirementCellId ? -1 :
            a.requirementCellId > b.requirementCellId ? 1 : 0),
        interface: {
          inputSchema: parseSchemaText(operation.inputSchemaJson),
          outputSchema: parseSchemaText(operation.outputSchemaJson),
        },
        testObligations: {
          behavior: operation.behavior,
          preconditions: [...operation.preconditions],
          postconditions: [...operation.postconditions],
          failureCases: [...operation.failureCases],
          resourceBounds: [...operation.resourceBounds],
          effectBoundaries: [...operation.effectBoundaries],
          acceptance: [...operation.acceptanceObligations],
          // Independently authored Specification tests remain separate from
          // model-derived LLD tests. Missing procedures are explicit gaps;
          // declared procedures are carried only as inert test descriptions.
          sourceVerification: traced.get(operation.id).flatMap(row =>
            row.specificationClauseIds.map(specificationClauseId => {
              const test = declaredSourceTests.get(specificationClauseId) ?? null;
              return {
                requirementCellId: row.requirementCellId,
                specificationClauseId,
                test,
                status: test === null
                  ? 'verification-test-not-declared' : 'declared-unverified',
              };
            })),
          status: 'unreceived',
        },
      };
    });
  // Reuse the original Data semantic-content identity rather than hashing
  // JSON.stringify's caller-controlled property order. Source text digests
  // remain byte-exact; the parsed Design identity is semantic and stable.
  const designSource = semanticIdOf('metroplat.artifact')(designCandidate);
  const readout = {
    type: 'EngineeringDesignCodeWorkReadout', version: 1,
    designCarrierId: designSource,
    sourceCut: designCandidate.sources.map(({ kind, digest }) => ({ kind, digest })),
    codeSnapshotScope: 'supplied-target-views-only',
    status: discrepancies.length ? 'source-disagreement' : 'source-present-unassayed',
    targets, discrepancies,
    originalDesignAdmitted: false, independentProof: 'unreceived',
    executableWork: false, codeApplied: false, beneficiaryReceived: false,
  };
  // Deeply immutable so later worker mutations cannot silently rewrite a
  // source-target's diagnostics or original normative trace after readout.
  const freeze = value => {
    if (value !== null && typeof value === 'object') {
      for (const child of Object.values(value)) freeze(child);
      Object.freeze(value);
    }
    return value;
  };
  return freeze(readout);
}
