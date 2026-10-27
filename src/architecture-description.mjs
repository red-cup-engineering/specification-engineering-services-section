import { fileURLToPath } from "node:url";
import { readFileText } from "@red-cup-engineering/computer-file-engineering-services-section/read-file";
import { validateJsonSchema } from "@red-cup-engineering/json-schema-services-section/validation";
import { artifactId } from "@red-cup-engineering/semiotic-eavt-services-section/identity";

const SCHEMA_PATH = fileURLToPath(new URL("../data/records/schema/architecture-description.schema.json", import.meta.url));
const SCHEMA = JSON.parse(await readFileText(SCHEMA_PATH));

/**
 * Source-owning consumers admit the actual statements. This renderer only validates a
 * bounded architecture-description data graph and projects its admitted literal content.
 * ISO/IEC/IEEE 42010:2022 conformance and semantic refinement are NOT established here.
 */
export function loadArchitectureDescriptionSchema() {
  return SCHEMA;
}

const byId = (items) => new Map(items.map((item) => [item.id, item]));
const ordered = (items) => [...items].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
const refs = (ids) => [...ids].sort().join(", ");
// A source value is never allowed to introduce an unauthored Markdown line.
// Retain all original ordinary-LF and CRLF rendering while flattening the
// alternate line separators accepted by the existing source JSON schema.
// Multiline model prose remains line-authored inside the original blockquote.
const text = (value) => value.replace(/\r\n|[\r\n\u000b\u000c\u0085\u2028\u2029]/gu, " ").replace(/\\/gu, "\\\\").replace(/([|*_{}\[\]()#+!<>])/gu, "\\$1").replaceAll(String.fromCharCode(96), String.fromCharCode(92, 96));
const row = (cells) => "| " + cells.map(text).join(" | ") + " |";
const table = (headers, rows) => [row(headers), row(headers.map(() => "---")), ...rows.map(row)].join("\n");
const heading = (level, value) => "#".repeat(level) + " " + text(value);
const quote = (value) => value.replace(/\r\n?|[\u000b\u000c\u0085\u2028\u2029]/gu, "\n").split("\n").map((line) =>
  "> " + line.replace(/\\/gu, "\\\\").replace(/([`*_{}\[\]()#!])/gu, "\\$1")
    .replace(/</gu, "&lt;").replace(/>/gu, "&gt;")).join("\n");

function semanticIssues(record) {
  const issues = [];
  const maps = Object.fromEntries(
    ["sources", "stakeholders", "concerns", "viewpoints", "views", "models", "correspondences", "decisions", "openQuestions"]
      .map((kind) => [kind, byId(record[kind])])
  );
  // Source-qualified inverse edges are computed once; each concern/model must
  // retain precisely its original identity, multiplicity and refusal behavior.
  // Repeated existential scans made large architecture graphs quadratic.
  const stakeholderConcerns = new Set(record.stakeholders.flatMap((item) => item.concernIds));
  const viewpointConcerns = new Set(record.viewpoints.flatMap((item) => item.concernIds));
  const renderedViewpoints = new Set(record.views.map((item) => item.viewpointId));
  const referencedModels = new Set(record.views.flatMap((item) => item.modelIds));
  const issue = (path, message) => issues.push({
    kind: "architecture-description", path, keyword: "reference", message,
  });
  // A shared source or an ungrounded system cannot silently discharge both
  // distinct upstream engineering stages merely by claiming two field names.
  if (record.upstream.requirementsSourceId === record.upstream.specificationSourceId)
    issue("upstream", "requirements and specification must name distinct source identities");
  for (const [role, sourceId] of Object.entries(record.upstream)) {
    if (!record.system.sourceIds.includes(sourceId))
      issue("system.sourceIds", "system of interest lacks the original " + role + " source " + sourceId);
  }
  for (const kind of Object.keys(maps)) {
    if (maps[kind].size !== record[kind].length) issue(kind, "duplicate source-qualified identifier in " + kind);
  }
  const has = (kind, id, path) => {
    if (!maps[kind].has(id)) issue(path, "unknown " + kind + " identifier " + id);
  };
  const sourceRefs = (item, path) => item.sourceIds.forEach((id) => has("sources", id, path + ".sourceIds"));
  has("sources", record.upstream.requirementsSourceId, "upstream.requirementsSourceId");
  has("sources", record.upstream.specificationSourceId, "upstream.specificationSourceId");
  sourceRefs(record.system, "system");
  for (const stakeholder of record.stakeholders) {
    stakeholder.concernIds.forEach((id) => has("concerns", id, "stakeholders." + stakeholder.id + ".concernIds"));
  }
  for (const concern of record.concerns) {
    sourceRefs(concern, "concerns." + concern.id);
    if (!stakeholderConcerns.has(concern.id))
      issue("concerns." + concern.id, "no admitted stakeholder owns this concern");
    if (!viewpointConcerns.has(concern.id))
      issue("concerns." + concern.id, "no viewpoint addresses this concern");
  }
  for (const viewpoint of record.viewpoints) {
    viewpoint.concernIds.forEach((id) => has("concerns", id, "viewpoints." + viewpoint.id + ".concernIds"));
    if (!renderedViewpoints.has(viewpoint.id))
      issue("viewpoints." + viewpoint.id, "viewpoint has no rendered view");
  }
  for (const view of record.views) {
    has("viewpoints", view.viewpointId, "views." + view.id + ".viewpointId");
    sourceRefs(view, "views." + view.id);
    const viewpoint = maps.viewpoints.get(view.viewpointId);
    // An architecture view cannot discharge a viewpoint merely by referencing
    // ANY model. Every declared concern must have an explicitly attributed
    // model, and a model cannot claim a concern outside its governing viewpoint.
    // This is graph coverage, NOT semantic evidence of correct behavior or Proof.
    const addressed = new Set();
    for (const id of view.modelIds) {
      has("models", id, "views." + view.id + ".modelIds");
      const model = maps.models.get(id);
      if (model && viewpoint && !viewpoint.modelKinds.includes(model.kind))
        issue("views." + view.id, "model kind " + model.kind + " is not declared by viewpoint " + viewpoint.id);
      if (!model) continue;
      for (const concernId of model.concernIds) {
        has("concerns", concernId, "models." + model.id + ".concernIds");
        if (viewpoint && !viewpoint.concernIds.includes(concernId))
          issue("views." + view.id, "model " + model.id + " claims concern " + concernId
            + " outside viewpoint " + viewpoint.id);
        addressed.add(concernId);
      }
    }
    for (const concernId of viewpoint?.concernIds ?? []) {
      if (!addressed.has(concernId))
        issue("views." + view.id, "no model explicitly addresses viewpoint concern " + concernId);
    }
  }
  for (const model of record.models) {
    sourceRefs(model, "models." + model.id);
    model.concernIds.forEach((id) => has("concerns", id, "models." + model.id + ".concernIds"));
    if (!referencedModels.has(model.id))
      issue("models." + model.id, "model has no governing view");
  }
  for (const correspondence of record.correspondences) {
    has("views", correspondence.fromViewId, "correspondences." + correspondence.id + ".fromViewId");
    has("views", correspondence.toViewId, "correspondences." + correspondence.id + ".toViewId");
    sourceRefs(correspondence, "correspondences." + correspondence.id);
    if (correspondence.fromViewId === correspondence.toViewId)
      issue("correspondences." + correspondence.id, "correspondence must relate distinct views");
  }
  for (const decision of record.decisions) {
    decision.concernIds.forEach((id) => has("concerns", id, "decisions." + decision.id + ".concernIds"));
    sourceRefs(decision, "decisions." + decision.id);
  }
  return issues;
}

/** Validate JSON Schema and cross-record identities without inventing data or source trust. */
export function validateArchitectureDescriptionRecord(record) {
  const basic = validateJsonSchema(record, SCHEMA);
  if (!basic.valid) return basic;
  const issues = semanticIssues(record);
  return { valid: issues.length === 0, issues };
}


/**
 * Optional exact source-cut admission for original Engineering consumers.
 * Ordinary ArchitectureDescription schema validation can prove internal
 * referential coherence but cannot know whether a referenced Revision
 * still matches a current Requirement/Specification. Supply both ACTUAL
 * selected source objects to check immutable content addresses, plus the
 * already-carried requirement->specification lineage. No external signer or
 * rights are authenticated here; a valid result is still a candidate, not
 * a 42010 certificate, a proof of the view's correctness or accepted Work.
 */
export function validateArchitectureDescriptionAgainstSourceCut(record, {
  requirement, specification,
} = {}) {
  const base = validateArchitectureDescriptionRecord(record);
  if (!base.valid) return base;
  const issues = [];
  const refuse = (path,message) => issues.push(Object.freeze({
    kind:"architecture-description",path,keyword:"source-revision",message,
  }));
  if (!requirement || typeof requirement !== "object" ||
      Array.isArray(requirement) || requirement.kind !== "requirement" ||
      typeof requirement.id !== "string" ||
      !Array.isArray(requirement["met-when"]) ||
      requirement["met-when"].length === 0)
    refuse("sourceCut.requirement","a complete original source Requirement is required");
  if (!specification || typeof specification !== "object" ||
      Array.isArray(specification) ||
      typeof specification.identity?.id !== "string" ||
      !Array.isArray(specification.provenance?.derivedFrom))
    refuse("sourceCut.specification","a separately derived Specification is required");
  if (issues.length > 0) return Object.freeze({valid:false,issues:Object.freeze(issues)});
  // These identities are derived locally from the exact supplied source
  // graph, not self-attested strings in the Architecture Description.
  const expectedRequirement = artifactId(requirement);
  const expectedSpecification = artifactId(specification);
  const current = [
    [record.upstream.requirementsSourceId,expectedRequirement,"requirementsSourceId"],
    [record.upstream.specificationSourceId,expectedSpecification,"specificationSourceId"],
  ];
  for (const [id,expected,kind] of current) {
    const stored = record.sources.find(item=>item.id===id);
    if (stored?.revision !== expected)
      refuse("sources."+id+".revision",kind+
        " does not identify the selected source content");
  }
  const expectedRelation = requirement.id + "@" + expectedRequirement;
  if (!specification.provenance.derivedFrom.includes(expectedRelation))
    refuse("sourceCut.specification.provenance",
      "Specification does not retain this exact original Requirement source");

  // A document-level Requirement/Specification citation does NOT entail
  // that any individual original customer obligation has an architecture
  // implementation. Explicit source-cell/Specification-clause correspondence
  // is independently declared on a concern and checked against the original
  // two complete source objects. Ambiguous cross-products are refused.
  const sourceCells = new Map(requirement["met-when"].map(row=>[row.cell,row]));
  if(sourceCells.size!==requirement["met-when"].length ||
     !requirement["met-when"].every(row=>typeof row?.cell==="string" &&
       row.cell.startsWith(requirement.id+":")))
    refuse("sourceCut.requirement.met-when",
      "original Requirement source cells must be distinct and belong to this Requirement");
  if(!Array.isArray(specification.topics) ||
     specification.topics.some(topic=>!Array.isArray(topic?.clauses)))
    refuse("sourceCut.specification.topics",
      "the original source Specification has no complete normative clause catalog");
  if(issues.length>0)return Object.freeze({valid:false,issues:Object.freeze(issues)});
  const clauses=specification.topics.flatMap(topic=>topic.clauses);
  const clauseMap=new Map(clauses.map(row=>[row.id,row]));
  if(clauseMap.size!==clauses.length)
    refuse("sourceCut.specification.topics","duplicate normative clause IDs are not a valid correspondence");
  const backref=cell=>"Original Requirement "+requirement.id+" ("+
    expectedRequirement+"), cell "+cell;
  for(const concern of record.concerns) {
    const r=concern.requirementCellIds,s=concern.specificationClauseIds;
    if((r===undefined)!==(s===undefined)) {
      refuse("concerns."+concern.id,"exact original Work cells and normative clauses must be paired");
      continue;
    }
    if(r===undefined)continue; // Truly untraced; never silently covered.
    if(!concern.sourceIds.includes(record.upstream.requirementsSourceId) ||
       !concern.sourceIds.includes(record.upstream.specificationSourceId))
      refuse("concerns."+concern.id+".sourceIds",
        "a clause-traced concern must cite both original source stages");
    for(const cell of r) {
      if(!sourceCells.has(cell))
        refuse("concerns."+concern.id+".requirementCellIds",
          "unknown original Requirement condition "+cell);
      if(!s.some(id=>clauseMap.get(id)?.backedBy?.includes(backref(cell))))
        refuse("concerns."+concern.id+".requirementCellIds",
          "no selected normative clause actually backs source condition "+cell);
    }
    for(const id of s) {
      const clause=clauseMap.get(id);
      if(!clause)
        refuse("concerns."+concern.id+".specificationClauseIds",
          "unknown normative Specification clause "+id);
      else if(!r.some(cell=>clause.backedBy?.includes(backref(cell))))
        refuse("concerns."+concern.id+".specificationClauseIds",
          "normative Specification clause "+id+" belongs to another source cell");
    }
  }
  return Object.freeze({
    valid:issues.length===0,issues:Object.freeze(issues),
  });
}

/**
 * The real Requirement-cell → normative Specification clause → architecture
 * concern/model/view trace, using precisely the original source cut. An
 * architecture-level citation without a source-cell pair is explicitly
 * UNTRACED. A rendered model is a documentary promise, never an executed
 * proof or an independently accepted customer requirement.
 *
 * The caller must separately authenticate provenance and read rights before
 * presenting customer-private source statements; this pure source reader
 * grants no additional document/tenant visibility.
 */
export function readRequirementArchitectureTrace(record,sources) {
  const checked=validateArchitectureDescriptionAgainstSourceCut(record,sources);
  if(!checked.valid)
    throw new TypeError("architecture-description: selected source cut: "+
      JSON.stringify(checked.issues));
  const {requirement,specification}=sources;
  const sourceRevision=artifactId(requirement);
  const refsOf=cell=>"Original Requirement "+requirement.id+" ("+
    sourceRevision+"), cell "+cell;
  // Index exact generated source references once. Do NOT scan every
  // 1,024+ original buyer condition for every Spec clause.
  const cellBySourceRef=new Map(requirement["met-when"].map(row=>
    [refsOf(row.cell),row.cell]));
  const normative=new Map();
  for(const topic of specification.topics)for(const clause of topic.clauses)
    for(const originalRef of clause.backedBy??[]){
      const cell=cellBySourceRef.get(originalRef);
      if(cell===undefined)continue;
      const list=normative.get(cell)??[];
      list.push(clause.id);normative.set(cell,list);
    }
  const modelViews=new Map();
  const models=byId(record.models);
  const viewpoints=byId(record.viewpoints);
  for(const view of record.views){
    const vp=viewpoints.get(view.viewpointId);
    for(const modelId of view.modelIds){
      const model=models.get(modelId);
      for(const concernId of model?.concernIds??[]){
        if(!vp?.concernIds.includes(concernId))continue;
        const list=modelViews.get(concernId)??[];
        list.push(Object.freeze({modelId,viewId:view.id,viewpointId:view.viewpointId}));
        modelViews.set(concernId,list);
      }
    }
  }
  const traced=new Map();
  for(const concern of record.concerns){
    if(concern.requirementCellIds===undefined)continue;
    for(const cell of concern.requirementCellIds){
      const clauseIds=new Set(normative.get(cell)??[]);
      const selected=concern.specificationClauseIds.filter(id=>clauseIds.has(id));
      const list=traced.get(cell)??[];
      for(const relation of modelViews.get(concern.id)??[])
        list.push(Object.freeze({
          clauseIds:Object.freeze([...selected].sort()),
          concernId:concern.id,...relation,
        }));
      traced.set(cell,list);
    }
  }
  const rows=requirement["met-when"].map(row=>{
    const originalClauses=Object.freeze([...(normative.get(row.cell)??[])].sort());
    const paths=Object.freeze([...(traced.get(row.cell)??[])].sort((a,b)=>
      a.concernId.localeCompare(b.concernId) ||
      a.modelId.localeCompare(b.modelId) || a.viewId.localeCompare(b.viewId)));
    return Object.freeze({
      cell:row.cell,originalStatement:row.says,
      sourceTarget:row.target,
      normativeClauseIds:originalClauses,
      authoredPaths:paths,
      standing:originalClauses.length===0?"source-not-normatively-interpreted":
        paths.length===0?"normative-but-architecture-untraced":
        "source-to-authored-model-only-not-proved",
    });
  }).sort((a,b)=>a.cell.localeCompare(b.cell));
  const mapped=rows.filter(row=>row.authoredPaths.length>0).length;
  const frozenRows=Object.freeze(rows);
  return Object.freeze({
    kind:"specification.requirement-architecture-trace.v1",
    originalRequirementId:requirement.id,
    originalRequirementSource:sourceRevision,
    originalSpecificationSource:artifactId(specification),
    originalArchitectureId:record.identity.id,
    counts:Object.freeze({
      sourceCells:rows.length,
      authoredModelMapped:mapped,
      untraced:rows.length-mapped,
    }),
    rows:frozenRows,
    standardsConformance:"unassessed",
    independentProof:false,
    independentlyAcceptedCustomerWork:false,
    rightsAndSourceAuthentication:"required-from-original-custodian",
  });
}

/** Source-bound render includes the complete honest buyer-clause trace. */
export function renderArchitectureDescriptionFromSourceCut(record,sources) {
  const trace=readRequirementArchitectureTrace(record,sources);
  const rows=trace.rows.map(row=>[
    row.cell,row.normativeClauseIds.join(", ")||"UNREVIEWED",
    row.authoredPaths.map(p=>p.concernId+" / "+p.modelId+" / "+p.viewId).join("; ")||"UNTRACED",
    row.standing,
  ]);
  return renderArchitectureDescriptionMarkdown(record)+
    "\n"+heading(2,"Exact original Requirement-to-model traceability")+
    "\n\n"+table(["Original buyer condition","Specification clauses",
      "Concern / model / view","Standing"],rows)+
    "\n\n"+text("Authored mapping "+trace.counts.authoredModelMapped+
      " of "+trace.counts.sourceCells+" original source conditions; "+
      trace.counts.untraced+" remain without an authored model trace. "+
      "No verified source rights, semantic proof, executed check, standards "+
      "certificate or independent customer acceptance is implied.")+"\n";
}

/** Reproducible Markdown projection, not a conformance audit or proof of the architecture. */
export function renderArchitectureDescriptionMarkdown(record) {
  const check = validateArchitectureDescriptionRecord(record);
  if (!check.valid) throw new TypeError("architecture-description: " + JSON.stringify(check.issues));

  const modelById = byId(record.models);
  const sections = [
    heading(1, record.identity.title),
    "**Status:** " + text(record.identity.status) + ". ISO/IEC/IEEE 42010:2022-informed candidate profile; **conformance unassessed**. No independent architecture or refinement proof is implied.",
    heading(2, "Document identity and original source cut"),
    table(["Field", "Recorded value"], [
      ["Identifier", record.identity.id], ["Revision", record.identity.revision],
      ["Owner", record.identity.owner], ["Standard", record.standard.designation + ":" + record.standard.edition],
      ["Applicability (authored claim, not adopted by this renderer)", record.standard.applicability],
      ["Original requirements source", record.upstream.requirementsSourceId],
      ["Original specification source", record.upstream.specificationSourceId],
    ]),
    heading(2, "System of interest"),
    "**" + text(record.system.name) + "** — " + text(record.system.description) + ".",
    "Source records: " + refs(record.system.sourceIds),
    heading(2, "Stakeholders and concerns"),
    table(["Stakeholder ID", "Name", "Concern IDs"], ordered(record.stakeholders).map((entry) =>
      [entry.id, entry.name, refs(entry.concernIds)])),
    table(["Concern ID", "Statement", "Source IDs"], ordered(record.concerns).map((entry) =>
      [entry.id, entry.statement, refs(entry.sourceIds)])),
    heading(2, "Viewpoints"),
    table(["Viewpoint ID", "Name", "Concern IDs", "Model kinds", "Authored method"],
      ordered(record.viewpoints).map((entry) =>
        [entry.id, entry.name, refs(entry.concernIds), [...entry.modelKinds].sort().join(", "), entry.method])),
    heading(2, "Architecture views and source models"),
  ];
  for (const view of ordered(record.views)) {
    sections.push(heading(3, view.name + " [" + view.id + "]"));
    sections.push("Governing viewpoint: " + text(view.viewpointId) + ". Source IDs: " + refs(view.sourceIds) + ".");
    for (const modelId of [...view.modelIds].sort()) {
      const model = modelById.get(modelId);
      sections.push(heading(4, model.kind + " model [" + model.id + "]"));
      sections.push("Source IDs: " + refs(model.sourceIds) + ". Addressed concern IDs (source-authored coverage only): " + refs(model.concernIds) + ".");
      sections.push(quote(model.content));
    }
  }
  sections.push(heading(2, "Cross-view correspondences and rules"));
  sections.push(record.correspondences.length
    ? table(["ID", "From view", "To view", "Authored rule", "Source IDs"],
      ordered(record.correspondences).map((item) =>
        [item.id, item.fromViewId, item.toViewId, item.rule, refs(item.sourceIds)]))
    : "No cross-view correspondences have been asserted in the supplied source data; this does not certify compatible views.");
  sections.push(heading(2, "Architecture decisions and rationale"));
  for (const item of ordered(record.decisions)) {
    sections.push(heading(3, item.id));
    sections.push(text(item.statement));
    sections.push("Rationale: " + text(item.rationale) + ". Concern IDs: " + refs(item.concernIds)
      + ". Source IDs: " + refs(item.sourceIds) + ".");
    sections.push("Authored alternatives: " + [...item.alternatives].sort().map(text).join("; "));
  }
  sections.push(heading(2, "Open questions and refusal conditions"));
  sections.push(record.openQuestions.length
    ? table(["ID", "Question", "Blocked by"], ordered(record.openQuestions).map((item) =>
      [item.id, item.question, item.blockedBy]))
    : "None supplied; this is not an independently accepted completeness or proof certificate.");
  sections.push(heading(2, "Source revisions (author assertions; authentication is external)"));
  sections.push(table(["Source ID", "Original locator", "Revision"], ordered(record.sources).map((item) =>
    [item.id, item.locator, item.revision])));
  sections.push("**Receiving boundary:** document bytes are a deterministic projection only. Independent standards audit, semantic proof, right to fabricate, native production and downstream receiving remain separate.");
  return sections.join("\n\n") + "\n";
}
