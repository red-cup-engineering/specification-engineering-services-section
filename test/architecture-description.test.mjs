import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderArchitectureDescriptionMarkdown, validateArchitectureDescriptionRecord } from "../src/architecture-description.mjs";

function candidate() {
  return {
    type: "ArchitectureDescriptionCandidate",
    version: 1,
    identity: { id: "example-architecture", title: "Example architecture", revision: "rev-1", owner: "real-original-owner", status: "candidate" },
    standard: { designation: "ISO/IEC/IEEE 42010", edition: "2022", applicability: "candidate architecture-description profile", conformance: "unassessed" },
    system: { name: "Example system", description: "An authorized example with a refusal path", sourceIds: ["req", "spec"] },
    upstream: { requirementsSourceId: "req", specificationSourceId: "spec" },
    sources: [
      { id: "decision-source", locator: "https://example.test/decision", revision: "sha-3" },
      { id: "spec", locator: "https://example.test/spec", revision: "sha-2" },
      { id: "req", locator: "https://example.test/req", revision: "sha-1" },
    ],
    stakeholders: [{ id: "buyer", name: "Original consumer", concernIds: ["rights", "failure"] }],
    concerns: [
      { id: "rights", statement: "Deny unauthorized calls", sourceIds: ["req"] },
      { id: "failure", statement: "Preserve failure receipts", sourceIds: ["spec"] },
    ],
    viewpoints: [
      { id: "boundary", name: "Authorization boundaries", concernIds: ["rights", "failure"], modelKinds: ["interface"], method: "Authored interface-contract projection" },
    ],
    views: [{ id: "boundary-view", name: "Bounded supplier view", viewpointId: "boundary", modelIds: ["auth-model"], sourceIds: ["spec"] }],
    models: [{ id: "auth-model", kind: "interface", content: "Unauthorized request => refusal receipt", concernIds: ["rights", "failure"], sourceIds: ["spec"] }],
    correspondences: [],
    decisions: [{
      id: "decision-1", statement: "Server verifies authorization", rationale: "Client-only checks can be bypassed",
      alternatives: ["Client-only authorization", "No exposed interface"], concernIds: ["rights", "failure"], sourceIds: ["decision-source"],
    }],
    openQuestions: [{ id: "proof", question: "Has the server-side refusal relation been proved?", blockedBy: "original qualified checker" }],
  };
}

test("source-qualified candidate validates and has an explicit unassessed 42010:2022 profile", () => {
  const result = validateArchitectureDescriptionRecord(candidate());
  assert.equal(result.valid, true, JSON.stringify(result.issues));
  const md = renderArchitectureDescriptionMarkdown(candidate());
  for (const section of ["Stakeholders and concerns", "Viewpoints", "Architecture views and source models", "Cross-view correspondences", "Architecture decisions", "Source revisions"])
    assert.ok(md.includes(section), section);
  assert.match(md, /conformance unassessed/u);
  // Generated headings escape Markdown punctuation; assertions read those actual bytes.
  assert.match(md, /Source revisions \\\(author assertions/u);
  assert.match(md, /sha-1/u);
  assert.match(md, /sha-2/u);
  assert.doesNotMatch(md, /conformance certified/u);
});

test("same source cut has byte-stable output without clock or order-dependent source lists", () => {
  const a = candidate();
  const b = candidate();
  b.sources.reverse();
  b.concerns.reverse();
  b.decisions[0].alternatives.reverse();
  b.stakeholders[0].concernIds.reverse();
  assert.equal(renderArchitectureDescriptionMarkdown(a), renderArchitectureDescriptionMarkdown(b));
  assert.equal(renderArchitectureDescriptionMarkdown(a), renderArchitectureDescriptionMarkdown(a));
});

test("missing viewpoint, source, governing model or stakeholder concern refuses, rather than inventing one", () => {
  const cases = [
    (x) => { x.views[0].viewpointId = "not-real"; },
    (x) => { x.decisions[0].sourceIds = ["missing-source"]; },
    (x) => { x.views[0].modelIds = ["missing-model"]; },
    (x) => { x.stakeholders[0].concernIds = ["rights"]; x.viewpoints[0].concernIds = ["rights"]; },
    (x) => { x.models[0].kind = "unapproved-model-kind"; },
  ];
  for (const mutate of cases) {
    const value = candidate();
    mutate(value);
    const readout = validateArchitectureDescriptionRecord(value);
    assert.equal(readout.valid, false, JSON.stringify(value));
    assert.throws(() => renderArchitectureDescriptionMarkdown(value), /architecture-description/u);
  }
});

test("architecture views require model-addressed original concerns, not just any diagram", () => {
  const valid = candidate();
  const md = renderArchitectureDescriptionMarkdown(valid);
  assert.match(md, /Addressed concern IDs \(source-authored coverage only\): failure, rights/u);
  for (const modify of [
    (x) => { x.models[0].concernIds = ["rights"]; },
    (x) => { x.models[0].concernIds = ["failure"]; },
    (x) => { x.models[0].concernIds = ["missing"]; },
    (x) => { x.models[0].concernIds = []; },
    (x) => { delete x.models[0].concernIds; },
  ]) {
    const instance = candidate();
    modify(instance);
    const reading = validateArchitectureDescriptionRecord(instance);
    assert.equal(reading.valid, false, JSON.stringify(instance));
    assert.throws(() => renderArchitectureDescriptionMarkdown(instance), /architecture-description/u);
  }
});

test("shared source model may not claim a concern outside a view's declared viewpoint", () => {
  const x = candidate();
  x.viewpoints.push({ id: "second", name: "Rights only", concernIds: ["rights"],
    modelKinds: ["interface"], method: "Exact authored source model" });
  x.views.push({id:"second-view", name:"Second boundary", viewpointId:"second",
    modelIds:["auth-model"],sourceIds:["req"]});
  const invalid=validateArchitectureDescriptionRecord(x);
  assert.equal(invalid.valid,false);
  assert.ok(invalid.issues.some(issue => /outside viewpoint second/u.test(issue.message)));
  assert.throws(()=>renderArchitectureDescriptionMarkdown(x),/architecture-description/u);
});

test("separate source models can explicitly cover every concern of one original viewpoint", () => {
  const x=candidate();
  x.models[0].concernIds=["rights"];
  x.models.push({id:"refusal-model",kind:"interface",
    content:"Server persists one denied-work reply from original claim and source witness",
    concernIds:["failure"],sourceIds:["spec"]});
  x.views[0].modelIds.push("refusal-model");
  const reading=validateArchitectureDescriptionRecord(x);
  assert.equal(reading.valid,true,JSON.stringify(reading.issues));
  const result=renderArchitectureDescriptionMarkdown(x);
  assert.match(result,/Addressed concern IDs \(source-authored coverage only\): rights/u);
  assert.match(result,/Addressed concern IDs \(source-authored coverage only\): failure/u);
  assert.match(result,/conformance unassessed/u,"coverage cannot self-certify formal semantics");
  const permuted=structuredClone(x);
  permuted.models.reverse();
  permuted.views[0].modelIds.reverse();
  assert.equal(renderArchitectureDescriptionMarkdown(x),renderArchitectureDescriptionMarkdown(permuted));
});

test("duplicate IDs and absent original specification cut refuse deterministically", () => {
  const value = candidate();
  value.sources.push({ ...value.sources[0] });
  assert.equal(validateArchitectureDescriptionRecord(value).valid, false);
  const missing = candidate();
  missing.upstream.specificationSourceId = "missing";
  assert.equal(validateArchitectureDescriptionRecord(missing).valid, false);
});

test("the renderer cannot promote a 2011 or self-claimed 2022 conformance label", () => {
  const value = candidate();
  value.standard.conformance = "certified";
  assert.equal(validateArchitectureDescriptionRecord(value).valid, false);
  const other = candidate();
  other.standard.edition = "2011";
  assert.equal(validateArchitectureDescriptionRecord(other).valid, false);
});

test("source text cannot introduce untrusted headings or HTML through a generated model", () => {
  const value = candidate();
  value.identity.title = "A\n## forged claim";
  value.models[0].content = "<script>alert(1)</script>";
  const md = renderArchitectureDescriptionMarkdown(value);
  assert.doesNotMatch(md, /^## forged claim$/gmu);
  assert.doesNotMatch(md, /<script>/u);
  assert.match(md, /&lt;script&gt;/u);
});

test("published package must include both source schemas required by its runtime imports", () => {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.ok(pkg.files.includes("data/records/schema"), "packed package must ship the schema directory");
  assert.equal(pkg.exports["./architecture-description"], "./src/architecture-description.mjs");
});

test("a source cannot impersonate both accepted requirements and specification", () => {
  const conflated = candidate();
  conflated.upstream.specificationSourceId = conflated.upstream.requirementsSourceId;
  const reading = validateArchitectureDescriptionRecord(conflated);
  assert.equal(reading.valid, false);
  assert.ok(reading.issues.some((issue) => issue.path === "upstream"));
  assert.throws(() => renderArchitectureDescriptionMarkdown(conflated), /architecture-description/u);
});

test("a system view must retain its original upstream sources, not only a tertiary decision", () => {
  const detached = candidate();
  detached.system.sourceIds = ["decision-source"];
  const reading = validateArchitectureDescriptionRecord(detached);
  assert.equal(reading.valid, false);
  assert.ok(reading.issues.some((issue) => issue.path === "system.sourceIds"));
});

test("untrusted model text remains literal, including Markdown links and remote-image syntax", () => {
  const value = candidate();
  value.models[0].content = "![remote](https://example.test/tracker)\n[role](https://example.test/redirect)\n## forged claim\n<script>alert(1)</script>";
  const md = renderArchitectureDescriptionMarkdown(value);
  assert.ok(md.includes(String.raw`> \!\[remote\]\(https://example.test/tracker\)`));
  assert.ok(md.includes(String.raw`> \[role\]\(https://example.test/redirect\)`));
  assert.doesNotMatch(md, /^> !\[/gmu);
  assert.doesNotMatch(md, /^> \[role\]/gmu);
  assert.match(md, /&lt;script&gt;/u);
});
