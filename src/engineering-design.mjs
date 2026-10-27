import { createHash } from 'node:crypto';
import { semanticIdOf } from '@red-cup-engineering/computer-data-engineering-services-section/semiotic-expression-notation/semantic-content-identity';

/*
 * src/engineering-design.mjs — engineering-design-generator-bootstrap.
 * Source: /home/emsenn/bare-cedar-fog/services/engineering-services-section/data/records/service-records/requirements-management-service-records/moneyday-generator-bootstrap.work-order.md, lines 1–51.
 * Source digest: sha256:492e59c864a9783fa2b1b04e8f3c7013864c9da1a747e863eea2cf1c29652744.
 * Specification: ni:///sha-256;kX7HL0zVNw1DTiqFclj0osqWVa4VK0F9R_1qAj0ik8k.
 * Behavioral trace: native-design-generation, exact-source-cut, source-binding,
 * native-request, hld-profile, lld-profile, complete-trace, lld-upstream,
 * receive-original, unknowns-and-independence, no-false-closure, bounded-domain.
 * All trace through jsnode-modules to stage-contract-receiving and all four
 * constraints below. This source makes no claim that receiving has occurred.
 *
 * leader-source: law, 561 Group Leader, bounded bootstrap authorized2026-10-27.
 * https://github.com/red-cup-engineering/engineering-services-section/blob/d11f80170c947e18e695bdaa0dbfb713edac1252/data/records/service-records/requirements-management-service-records/requirements-generate-specifications-designs-and-normative-code.json
 * Applies only to constructing and qualifying missing Engineering generator
 * stages. Use incumbent native Fabrication; preserve provenance, independent
 * receiving and generated/proof chain for downstream earning/storage/custody.
 *
 * native-line: standard, Red Cup Engineering, installed Fabrication0.4.15-dev.1
 * and JSNodePackage0.4.0. Locator:
 * /gnu/store/sq5kwc4b6y2k7h7izqi6rjbadjvvagwy-bare-cedar-fog-deployment-1/node_modules/@red-cup-engineering/computer-systems-fabrication-engineering-services-section/scripts/fabricate-jsnode-closure.mjs
 * Applies to original source-free module meaning closure and isolated native
 * receiver. The Code maker separately derives independent assays, projects
 * native ESM, runs the isolated module set and preserves actual lot outcomes.
 *
 * original-owner-placement: standard, Red Cup Engineering, bounded bootstrap
 * contract; https://github.com/red-cup-engineering/engineering-services-section/pull/176.
 * Applies to actual source, module graph and independently received consumer.
 * Preserve incumbent Specification/Architecture exports and consumers; integrate
 * only this module in the original Specification owner. Source/artifact/channel
 * and host-effects/input-custody receiving remain mandatory independent reviews.
 *
 * export-name-grammar: standard, Ecma TC39, living draft observed2026-10-27,
 * ModuleExportName and IdentifierName productions only.
 * https://tc39.es/ecma262/multipage/ecmascript-language-scripts-and-modules.html#prod-ModuleExportName
 * Applies only to public export names versus local bindings, restricted here to
 * ASCII. Reserved public names do not certify valid bindings or module syntax.
 *
 * Mandatory, separately unreceived obligations (work order lines 35–37):
 * stage-contract-receiving: independent pre-source native functional assays of
 * both stages, source reconstruction, refusals, graphs, traces and claim limits;
 * its unchanged carrier excludes invalid outer envelopes and cannot certify
 * placement, effects, input custody or independent channels.
 * original-consumer-receiving: actual original infer carrier and actual HLD then
 * LLD deliveries for Moneyday generation/hygiene; publication/installation only
 * after original-producer tests and independent installed consumer receiving.
 * source-artifact-and-channel-receiving: original parser/module/closure and lot
 * review, original-owner preservation and actual complete-Requirement native
 * supplier delegation; writer must not receive derived hidden assays.
 * host-effects-and-input-custody-receiving: independently inspect call effects
 * and ownership with native isolation/consumer execution; no input mutation,
 * filesystem, network, environment, credentials, subprocess, clock, randomness,
 * package publication/installation or generated application execution.
 * outer-envelope-receiving: independently receive required schema checks and
 * TypeError behavior through the original typed caller.
 * None of these reviews is self-certified here. Full upstream validation,
 * semantic refinement, truth and measurement of claims, bound qualification,
 * source adoption and source/design-pinned Proof remain downstream obligations.
 * Blocking unknowns must separately stop effectful fabrication. Candidates are
 * always unadmitted with proof unreceived, including retained unsupported claims
 * and questions. This bootstrap grants no publication or operational authority.
 */

const kinds = ['requirement', 'specification', 'architecture', 'high-level'];
const layers = ['data', 'code', 'networking', 'systems'];
const systemText = 'Derive only the requested engineering design candidate from the complete original source cut. Retain every original requirement, explicit uncertainty and source identity. Follow the supplied response schema. A candidate is not adoption, proof, fabrication, installation or operation.';
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const nonblank = value => typeof value === 'string' && value.trim().length > 0;
function ensure(condition) { if (!condition) throw new TypeError('Invalid engineering design input or structure'); }
function exact(value, keys) {
  return object(value) && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
}
function array(value, minimum = 0) { return Array.isArray(value) && value.length >= minimum; }
function strings(value, minimum = 0, unique = false) {
  return array(value, minimum) && value.every(nonblank) && (!unique || new Set(value).size === value.length);
}
function sameSet(a, b) {
  const left = new Set(a), right = new Set(b);
  return left.size === right.size && [...left].every(value => right.has(value));
}
function equal(a, b) {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) || Array.isArray(b)) {
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((value, index) => equal(value, b[index]));
  }
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every(key => Object.hasOwn(b, key) && equal(a[key], b[key]));
}
function parseSource(text) {
  let value;
  try { value = JSON.parse(text); } catch (error) { throw new TypeError('Malformed source JSON', { cause: error }); }
  ensure(object(value));
  return value;
}
function envelope(input, receiving) {
  ensure(exact(input, receiving ? ['plan', 'stage', 'sources', 'deliveryText'] : ['stage', 'sources']));
  ensure(input.stage === 'high-level' || input.stage === 'low-level');
  ensure(array(input.sources, 1));
  for (const source of input.sources) {
    ensure(exact(source, ['kind', 'text']));
    ensure(kinds.includes(source.kind) && typeof source.text === 'string' && source.text.length >= 1);
  }
  if (receiving) ensure(object(input.plan) && typeof input.deliveryText === 'string');
}

// Fresh schemas per request prevent returned declarations from becoming shared state.
function designSchema(stage) {
  const text = () => ({ type: 'string', minLength: 1 });
  const list = (minimum = 0) => {
    const value = { type: 'array', items: text() };
    if (minimum) value.minItems = minimum;
    return value;
  };
  const record = properties => ({ type: 'object', additionalProperties: false, required: Object.keys(properties), properties });
  const rows = { type: 'array', items: record({
    requirementCellId: text(), specificationClauseIds: list(1), architectureModelIds: list(1), designElementIds: list(1)
  }), minItems: 1 };
  if (stage === 'high-level') return record({
    components: { type: 'array', items: record({
      id: text(), owner: text(), layer: { enum: [...layers] }, responsibility: text(),
      dependencyIds: list(), providedPorts: list(), requiredPorts: list()
    }), minItems: 1 },
    connections: { type: 'array', items: record({ fromComponentId: text(), toComponentId: text(), port: text() }) },
    traceability: rows, openQuestions: list()
  });
  return record({
    operations: { type: 'array', items: record({
      id: text(), componentId: text(), module: text(), exportName: text(),
      inputSchemaJson: text(), outputSchemaJson: text(), behavior: text(),
      preconditions: list(), postconditions: list(1), failureCases: list(1),
      resourceBounds: list(1), effectBoundaries: list(1), acceptanceObligations: list(1)
    }), minItems: 1 },
    traceability: rows, openQuestions: list()
  });
}
// Only the schema vocabulary declared above is needed; nonblank is an explicit
// additional design rule, not a semantic interpretation of retained testimony.
function conforms(value, schema) {
  if (schema.enum) return schema.enum.includes(value);
  if (schema.type === 'string') return nonblank(value);
  if (schema.type === 'array') return array(value, schema.minItems ?? 0) && value.every(item => conforms(item, schema.items));
  if (schema.type === 'object') return exact(value, schema.required) && schema.required.every(key => conforms(value[key], schema.properties[key]));
  return false;
}

function sourceContext(sources) {
  const requirement = parseSource(sources[0].text);
  const specification = parseSource(sources[1].text);
  const architecture = parseSource(sources[2].text);
  ensure(requirement.kind === 'requirement' && nonblank(requirement.id));
  ensure(/^[a-z0-9]+(?:-[a-z0-9]+)*(?![\s\S])/.test(requirement.id));
  ensure(array(requirement['met-when'], 1));
  const cells = new Map();
  for (const condition of requirement['met-when']) {
    ensure(object(condition));
    ensure(nonblank(condition.cell) && condition.cell.startsWith(requirement.id + ':'));
    ensure(!cells.has(condition.cell) && condition.target === 'held');
    ensure(nonblank(condition.says) && !/[\r\n\u0000]/.test(condition.says));
    cells.set(condition.cell, []);
  }
  // Delegate on the entire native parsed object, without stripping, repairing,
  // roundtripping or catching the supplier's TypeError (including ignored fields).
  const address = semanticIdOf('metroplat.artifact')(requirement);
  ensure(object(specification.identity) && nonblank(specification.identity.id));
  ensure(object(specification.provenance));
  const derivedFrom = specification.provenance.derivedFrom;
  ensure(Array.isArray(derivedFrom) && derivedFrom.every(value => typeof value === 'string'));
  ensure(derivedFrom.includes(requirement.id + '@' + address));
  ensure(array(specification.topics, 1));
  const references = new Map([...cells.keys()].map(cell => [
    'Original Requirement ' + requirement.id + ' (' + address + '), cell ' + cell, cell
  ]));
  const clauseIds = new Set();
  for (const topic of specification.topics) {
    ensure(object(topic) && Array.isArray(topic.clauses));
    for (const clause of topic.clauses) {
      ensure(object(clause) && nonblank(clause.id) && !clauseIds.has(clause.id));
      ensure(strings(clause.backedBy, 1, true));
      clauseIds.add(clause.id);
      for (const reference of clause.backedBy) {
        ensure(references.has(reference));
        cells.get(references.get(reference)).push(clause.id);
      }
    }
  }
  ensure(clauseIds.size > 0 && [...cells.values()].every(ids => ids.length > 0));
  ensure(architecture.type === 'ArchitectureDescriptionCandidate');
  ensure(object(architecture.identity) && nonblank(architecture.identity.id) && nonblank(architecture.identity.revision));
  ensure(array(architecture.models, 1));
  const models = new Set();
  for (const model of architecture.models) {
    ensure(object(model) && nonblank(model.id) && nonblank(model.content) && !models.has(model.id));
    models.add(model.id);
  }
  return { cells, models };
}

function traceValid(design, context, elements, hld = null) {
  const rows = new Set(), covered = new Set();
  const upstreamRows = hld ? new Map(hld.traceability.map(row => [row.requirementCellId, row])) : null;
  for (const row of design.traceability) {
    const cell = row.requirementCellId;
    if (!context.cells.has(cell) || rows.has(cell)) return false;
    rows.add(cell);
    if (!strings(row.specificationClauseIds, 1, true) || !sameSet(row.specificationClauseIds, context.cells.get(cell))) return false;
    if (!strings(row.architectureModelIds, 1, true) || !row.architectureModelIds.every(id => context.models.has(id))) return false;
    if (!strings(row.designElementIds, 1, true) || !row.designElementIds.every(id => elements.has(id))) return false;
    for (const id of row.designElementIds) covered.add(id);
    if (hld && !sameSet(row.designElementIds.map(id => elements.get(id).componentId), upstreamRows.get(cell).designElementIds)) return false;
  }
  return rows.size === context.cells.size && covered.size === elements.size;
}
function hldValid(design, context) {
  if (!conforms(design, designSchema('high-level'))) return false;
  const components = new Map();
  for (const component of design.components) {
    if (components.has(component.id)) return false;
    components.set(component.id, component);
    for (const key of ['dependencyIds', 'providedPorts', 'requiredPorts']) if (!strings(component[key], 0, true)) return false;
  }
  for (const component of components.values()) {
    for (const id of component.dependencyIds) {
      const dependency = components.get(id);
      if (!dependency || id === component.id || layers.indexOf(dependency.layer) > layers.indexOf(component.layer)) return false;
    }
  }
  // Iterative topological removal detects cycles without recursive graph walks.
  const remaining = new Map([...components].map(([id, component]) => [id, component.dependencyIds.length]));
  const consumers = new Map([...components.keys()].map(id => [id, []]));
  for (const component of components.values()) for (const id of component.dependencyIds) consumers.get(id).push(component.id);
  const queue = [...remaining].filter(([, count]) => count === 0).map(([id]) => id);
  for (let index = 0; index < queue.length; index++) {
    for (const id of consumers.get(queue[index])) {
      const count = remaining.get(id) - 1;
      remaining.set(id, count);
      if (count === 0) queue.push(id);
    }
  }
  if (queue.length !== components.size) return false;
  const triples = new Set(), supplied = new Set();
  for (const connection of design.connections) {
    const provider = components.get(connection.fromComponentId), consumer = components.get(connection.toComponentId);
    if (!provider || !consumer || provider.id === consumer.id) return false;
    if (!consumer.dependencyIds.includes(provider.id) || !provider.providedPorts.includes(connection.port) || !consumer.requiredPorts.includes(connection.port)) return false;
    const triple = JSON.stringify([provider.id, consumer.id, connection.port]);
    const port = JSON.stringify([consumer.id, connection.port]);
    if (triples.has(triple) || supplied.has(port)) return false;
    triples.add(triple);
    supplied.add(port);
  }
  for (const component of components.values()) for (const port of component.requiredPorts) {
    if (!supplied.has(JSON.stringify([component.id, port]))) return false;
  }
  return traceValid(design, context, components);
}
function lldValid(design, context, hld) {
  if (!conforms(design, designSchema('low-level'))) return false;
  const components = new Set(hld.components.map(component => component.id));
  const realized = new Set(), operations = new Map(), pairs = new Set();
  for (const operation of design.operations) {
    if (operations.has(operation.id) || !components.has(operation.componentId)) return false;
    const pair = JSON.stringify([operation.module, operation.exportName]);
    if (pairs.has(pair)) return false;
    pairs.add(pair);
    if (!operation.module.startsWith('src/') || !operation.module.endsWith('.mjs') || operation.module.includes('\\')) return false;
    if (operation.module.split('/').some(segment => segment === '' || segment === '.' || segment === '..')) return false;
    // Negative lookahead means absolute end, including rejection of final LF/CR.
    if (!/^[A-Za-z_$][A-Za-z0-9_$]*(?![\s\S])/.test(operation.exportName)) return false;
    for (const key of ['inputSchemaJson', 'outputSchemaJson']) {
      let schema;
      try { schema = JSON.parse(operation[key]); } catch { return false; }
      if (typeof schema !== 'boolean' && !object(schema)) return false;
    }
    operations.set(operation.id, operation);
    realized.add(operation.componentId);
  }
  return realized.size === components.size && traceValid(design, context, operations, hld);
}

function reconstruct(stage, inputSources) {
  const expected = stage === 'high-level' ? kinds.slice(0, 3) : [...kinds];
  ensure(inputSources.length === expected.length);
  const byKind = new Map();
  for (const source of inputSources) {
    ensure(expected.includes(source.kind) && !byKind.has(source.kind));
    byKind.set(source.kind, source.text);
  }
  const sources = expected.map(kind => {
    const text = byKind.get(kind);
    return { kind, text, digest: 'sha256:' + createHash('sha256').update(text, 'utf8').digest('hex') };
  });
  const context = sourceContext(sources);
  let hld = null;
  if (stage === 'low-level') {
    const upstream = parseSource(sources[3].text);
    ensure(exact(upstream, ['type', 'stage', 'sources', 'design', 'admitted', 'proof']));
    ensure(upstream.type === 'EngineeringDesignCandidate' && upstream.stage === 'high-level' && upstream.admitted === false && upstream.proof === 'unreceived');
    ensure(equal(upstream.sources, sources.slice(0, 3)));
    ensure(hldValid(upstream.design, context));
    hld = upstream.design;
  }
  const plan = {
    type: 'EngineeringDesignDerivationPlan', stage, sources,
    request: {
      taskClass: 'code-fabrication', objective: 'Derive ' + stage + ' design',
      messages: [
        { role: 'system', content: systemText },
        { role: 'user', content: JSON.stringify({ stage, sources }) }
      ],
      schema: designSchema(stage), requiredCapabilities: ['text-output']
    }
  };
  return { plan, context, hld };
}

/**
 * Plan source-bound native inference for an HLD or LLD candidate. Performs only
 * the declared source projection; full upstream validation and all independent
 * receiving obligations remain with the original owners.
 * @param {{stage: 'high-level'|'low-level', sources: Array<{kind: string, text: string}>}} input Exact planning envelope.
 * @returns {object} EngineeringDesignDerivationPlan with retained sources and native request.
 * @throws {TypeError} For invalid envelopes, malformed sources or native identity refusal.
 */
export function planEngineeringDesign(input) {
  envelope(input, false);
  return reconstruct(input.stage, input.sources).plan;
}

/**
 * Receive an actual HLD or LLD delivery against the reconstructed current plan.
 * Retains all structurally admitted testimony and questions without endorsing
 * semantic claims, proof, adoption, installation or operation.
 * @param {{plan: object, stage: 'high-level'|'low-level', sources: Array<{kind: string, text: string}>, deliveryText: string}} input Exact receiving envelope.
 * @returns {object} Unadmitted EngineeringDesignCandidate or the declared mismatch/design refusal.
 * @throws {TypeError} For invalid envelopes, malformed current sources or native identity refusal.
 */
export function receiveEngineeringDesign(input) {
  envelope(input, true);
  const { plan, context, hld } = reconstruct(input.stage, input.sources);
  const refusal = reason => ({ type: 'EngineeringDesignDerivationRefusal', reason });
  if (!equal(plan, input.plan)) return refusal('source-cut-mismatch');
  let design;
  try { design = JSON.parse(input.deliveryText); } catch { return refusal('invalid-design'); }
  const valid = input.stage === 'high-level' ? hldValid(design, context) : lldValid(design, context, hld);
  if (!valid) return refusal('invalid-design');
  return { type: 'EngineeringDesignCandidate', stage: input.stage, sources: plan.sources, design, admitted: false, proof: 'unreceived' };
}
