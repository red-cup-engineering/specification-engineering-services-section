import { createHash } from 'node:crypto';
import { readRequirementArchitectureTrace } from './architecture-description.mjs';
import { semanticIdOf } from '@red-cup-engineering/computer-data-engineering-services-section/semiotic-expression-notation/semantic-content-identity';

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
  let value;
  try { value = JSON.parse(text); } catch { throw new TypeError('Malformed source JSON'); }
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
    requireThat(exact(source, ['kind', 'text']) && ORDER.includes(source.kind) && typeof source.text === 'string' && source.text.length >= 1);
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
  const context = { sources, cells, models, authoredClausesByCell, hld: null };
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

function schemaTextValid(text) {
  try {
    const value = JSON.parse(text);
    return typeof value === 'boolean' || object(value);
  } catch { return false; }
}
function validLld(design, context) {
  if (!exact(design, ['operations', 'traceability', 'openQuestions']) || !strings(design.openQuestions)) return false;
  if (!Array.isArray(design.operations) || design.operations.length === 0) return false;
  const components = new Set(context.hld.components.map(c => c.id));
  const realized = new Set(), operations = new Map(), pairs = new Set();
  const scalars = ['id', 'componentId', 'module', 'exportName', 'inputSchemaJson', 'outputSchemaJson', 'behavior'];
  const lists = ['preconditions', 'postconditions', 'failureCases', 'resourceBounds', 'effectBoundaries', 'acceptanceObligations'];
  for (const operation of design.operations) {
    if (!exact(operation, [...scalars, ...lists]) || !scalars.every(k => nonblank(operation[k]))) return false;
    if (!lists.every(k => strings(operation[k], k === 'preconditions' ? 0 : 1))) return false;
    if (operations.has(operation.id) || !components.has(operation.componentId)) return false;
    const pair = JSON.stringify([operation.module, operation.exportName]);
    if (pairs.has(pair)) return false;
    const path = operation.module;
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
  let design;
  try { design = JSON.parse(input.deliveryText); } catch {
    return { type: 'EngineeringDesignDerivationRefusal', reason: 'invalid-design' };
  }
  if (!validDesign(input.stage, design, context)) return { type: 'EngineeringDesignDerivationRefusal', reason: 'invalid-design' };
  return { type: 'EngineeringDesignCandidate', stage: input.stage, sources: plan.sources, design, admitted: false, proof: 'unreceived' };
}
