import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
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


function largeOriginalSourceGraph(count=1200) {
  const record=candidate();
  for(let i=0;i<count;i++){
    const cid="capacity-concern-"+i,mid="capacity-model-"+i;
    record.concerns.push({id:cid,statement:"Keep source concern "+i,sourceIds:["spec"]});
    record.stakeholders[0].concernIds.push(cid);
    record.viewpoints[0].concernIds.push(cid);
    record.models.push({id:mid,kind:"interface",
      content:"Source-model "+i+" keeps the original concern",
      concernIds:[cid],sourceIds:["spec"]});
    record.views[0].modelIds.push(mid);
  }
  return record;
}

test("large original source graph retains every concern and model without cardinality collapse", () => {
  const count=1200,record=largeOriginalSourceGraph(count);
  const started=performance.now();
  const reading=validateArchitectureDescriptionRecord(record);
  assert.equal(reading.valid,true,JSON.stringify(reading.issues?.slice(0,3)));
  const output=renderArchitectureDescriptionMarkdown(record);
  const elapsed=performance.now()-started;
  console.log("Architecture description source graph: "
    +(count+2)+" concerns, "+(count+1)+" models, "
    +Math.round(elapsed)+" ms native full validation+render.");
  assert.match(output,/capacity-model-1199/u);
  assert.match(output,/capacity-concern-1199/u);
  assert.equal((output.match(/source-authored coverage only/gu)??[]).length,count+1);
  const missing=structuredClone(record);
  missing.models.pop();
  assert.equal(validateArchitectureDescriptionRecord(missing).valid,false,
    "one lost source model cannot silently satisfy the large original viewpoint");
});

if (process.env.SPEC_ARCHITECTURE_BASELINE_MODULE) {
  test("same-job native baseline and indexed source preserve exact output, refusals and measure resource cost",async()=>{
    const {pathToFileURL}=await import("node:url");
    const baseline=await import(pathToFileURL(process.env.SPEC_ARCHITECTURE_BASELINE_MODULE).href);
    const original=largeOriginalSourceGraph();
    const broken=structuredClone(original);
    broken.models.pop();
    const beforeRefusal=baseline.validateArchitectureDescriptionRecord(broken);
    const afterRefusal=validateArchitectureDescriptionRecord(broken);
    assert.deepEqual(afterRefusal,beforeRefusal,
      "same source must refuse an absent model with identical original issues");
    const sample=(validate,render)=>{
      const start=performance.now();
      const result=validate(original);
      assert.equal(result.valid,true,JSON.stringify(result.issues?.slice(0,2)));
      const bytes=render(original);
      return {elapsed:performance.now()-start,bytes};
    };
    // Separate ordinary assertions from the timed comparable useful job.
    for(let i=0;i<2;i++){
      const b=sample(baseline.validateArchitectureDescriptionRecord,baseline.renderArchitectureDescriptionMarkdown);
      const n=sample(validateArchitectureDescriptionRecord,renderArchitectureDescriptionMarkdown);
      assert.equal(b.bytes,n.bytes,"input, rendering and original source identity are comparable");
    }
    const before=[],after=[];
    for(let i=0;i<5;i++){
      const first=i%2===0
        ?sample(baseline.validateArchitectureDescriptionRecord,baseline.renderArchitectureDescriptionMarkdown)
        :sample(validateArchitectureDescriptionRecord,renderArchitectureDescriptionMarkdown);
      const second=i%2===0
        ?sample(validateArchitectureDescriptionRecord,renderArchitectureDescriptionMarkdown)
        :sample(baseline.validateArchitectureDescriptionRecord,baseline.renderArchitectureDescriptionMarkdown);
      const b=i%2===0?first:second,n=i%2===0?second:first;
      assert.equal(b.bytes,n.bytes,"no performance gain through content loss");
      before.push(b.elapsed);after.push(n.elapsed);
    }
    const median=(values)=>[...values].sort((a,b)=>a-b)[2];
    console.log("Architecture description native paired receiving; 1202 concerns, 1201 models; "
      +"baseline median "+median(before).toFixed(2)+"ms, indexed median "
      +median(after).toFixed(2)+"ms, ratio "+(median(after)/median(before)).toFixed(3)
      +"; original full output byte-equal; adverse refusal equal.");
  });
}

test("actual native architecture-description command reads accepted JSON bytes and renders the identical sourced product", () => {
  const original=candidate();
  const cli=fileURLToPath(new URL("../scripts/render-architecture-description.mjs",import.meta.url));
  const run=(value)=>spawnSync(process.execPath,[cli],{
    input:value,encoding:"utf8",timeout:15_000,maxBuffer:2 * 1024 * 1024
  });
  const valid=run(JSON.stringify(original));
  assert.equal(valid.status,0,valid.stderr);
  assert.equal(valid.stdout,renderArchitectureDescriptionMarkdown(original),
    "native command must produce the same exact original source artifact");
  assert.equal(valid.stderr,"");
  const incomplete=structuredClone(original);
  incomplete.views[0].modelIds=["missing-model"];
  const refused=run(JSON.stringify(incomplete));
  assert.equal(refused.status,1,refused.stderr);
  assert.equal(refused.stdout,"","invalid source cannot emit a partial architecture");
  assert.match(refused.stderr,/unknown models identifier missing-model/u);
});
