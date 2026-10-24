import { fileURLToPath } from "node:url";
import { readFileText } from "@red-cup-engineering/computer-file-engineering-services-section/read-file";
import { validateJsonSchema } from "@red-cup-engineering/json-schema-services-section/validation";

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
const text = (value) => value.replace(/\r?\n/gu, " ").replace(/\\/gu, "\\\\").replace(/([|*_{}\[\]()#+!<>])/gu, "\\$1").replaceAll(String.fromCharCode(96), String.fromCharCode(92, 96));
const row = (cells) => "| " + cells.map(text).join(" | ") + " |";
const table = (headers, rows) => [row(headers), row(headers.map(() => "---")), ...rows.map(row)].join("\n");
const heading = (level, value) => "#".repeat(level) + " " + text(value);
const quote = (value) => value.replace(/\r\n?/gu, "\n").split("\n").map((line) =>
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
