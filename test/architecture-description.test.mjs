import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  renderArchitectureDescriptionMarkdown, validateArchitectureDescriptionRecord,
  renderArchitectureDescriptionFromSourceCut, validateArchitectureDescriptionAgainstSourceCut,
  readRequirementArchitectureTrace, readRequirementArchitectureImpact,
} from "../src/architecture-description.mjs";
import { deriveSpecificationFromRequirementReview } from "../src/specification.mjs";
import { artifactId } from "@red-cup-engineering/semiotic-eavt-services-section/identity";

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

// The incumbent specification-carrier structural-source work applies to its
// architecture projection too: a source-local newline is not a new document
// heading, metadata field, normative clause, or unquoted model instruction.
test("source-authored architecture line separators stay inside original document cells and model quotes", () => {
  const value = candidate();
  value.identity.title = "Original architecture\r## forged proof";
  value.concerns[0].statement = "Original source concern\u2028## forged requirement";
  value.openQuestions[0].question = "Original question\u0085## forged answer";
  value.models[0].content = "Step A\rStep B\u2029Step C";
  const md = renderArchitectureDescriptionMarkdown(value);
  assert.doesNotMatch(md, /[\r\u0085\u2028\u2029]/u,
    "rendered architecture carrier must not leak alternate line separators");
  assert.match(md, /Original architecture/u);
  assert.match(md, /forged proof/u);
  assert.doesNotMatch(md, /^## forged proof$/gmu,
    "source identity must not forge a section");
  assert.doesNotMatch(md, /^## forged requirement$/gmu,
    "source concern must not forge a normative section");
  assert.match(md, /> Step A\n> Step B\n> Step C/u,
    "real authored model lines must remain within original blockquote custody");
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

function actualRequirementReviewSource() {
 const requirement={id:"original-work-acceptance",kind:"requirement",
   "met-when":[
     {cell:"original-work-acceptance:source",target:"held",
       says:"retain the original customer Work identity"},
     {cell:"original-work-acceptance:receiver",target:"held",
       says:"require separate independent acceptance of useful customer output"},
   ]};
 const review={
   identity:{id:"work-acceptance-spec",title:"Customer receiving candidate",
     seat:"source-review",carrier:"candidate/source-work.md",authors:["review-only"]},
   at:"2026-10-24T19:00:00Z",reviewedBy:"unadmitted-review-test",
   interpretations:[
     {cell:"original-work-acceptance:source",clauseId:"source-work",
       keyword:"MUST",actor:"The Work receiver"},
     {cell:"original-work-acceptance:receiver",clauseId:"customer-acceptance",
       keyword:"MUST NOT",actor:"The Work receiver"},
   ],
 };
 const specification=deriveSpecificationFromRequirementReview(requirement,review);
 return {requirement,specification};
}

test("actual Requirement->Specification->Architecture source cut refuses stale revisions",()=>{
 const sources=actualRequirementReviewSource();
 const architecture=candidate();
 architecture.sources.find(source=>source.id==="req").revision=artifactId(sources.requirement);
 architecture.sources.find(source=>source.id==="spec").revision=artifactId(sources.specification);
 const checked=validateArchitectureDescriptionAgainstSourceCut(architecture,sources);
 assert.equal(checked.valid,true,JSON.stringify(checked.issues));
 assert.equal(validateArchitectureDescriptionRecord(architecture).valid,true);
 const md=renderArchitectureDescriptionFromSourceCut(architecture,sources);
 assert.match(md,/ISO\/IEC\/IEEE 42010:2022-informed/u);
 assert.match(md,/conformance unassessed/u);
 assert.match(md,/## Source revisions/u);
 const changedRequirement=structuredClone(sources.requirement);
 changedRequirement["met-when"][0].says="new source obligation with same Work ID";
 assert.equal(validateArchitectureDescriptionRecord(architecture).valid,true,
   "unchanged internal IDs cannot detect that the original customer source changed");
 const stale=validateArchitectureDescriptionAgainstSourceCut(architecture,{
   ...sources,requirement:changedRequirement,
 });
 assert.equal(stale.valid,false);
 assert.ok(stale.issues.some(issue=>issue.keyword==="source-revision"));
 assert.throws(()=>renderArchitectureDescriptionFromSourceCut(architecture,{
   ...sources,requirement:changedRequirement,
 }),/selected source cut/u);
 const changedSpecification=structuredClone(sources.specification);
 changedSpecification.identity.status="undelivered successor source";
 assert.equal(validateArchitectureDescriptionAgainstSourceCut(architecture,{
   ...sources,specification:changedSpecification,
 }).valid,false);
});

test("matching architecture revision labels cannot counterfeit original Requirement lineage",()=>{
 const sources=actualRequirementReviewSource();
 const architecture=candidate();
 architecture.sources.find(source=>source.id==="req").revision=artifactId(sources.requirement);
 const forged=structuredClone(sources.specification);
 forged.provenance.derivedFrom=["another-customer@ni:///sha-256;"+("A".repeat(43))];
 architecture.sources.find(source=>source.id==="spec").revision=artifactId(forged);
 assert.equal(validateArchitectureDescriptionRecord(architecture).valid,true,
   "internally coherent but source-deceptive architecture needs actual source reader");
 const result=validateArchitectureDescriptionAgainstSourceCut(architecture,{
   ...sources,specification:forged,
 });
 assert.equal(result.valid,false);
 assert.ok(result.issues.some(issue=>issue.path==="sourceCut.specification.provenance"));
 assert.throws(()=>renderArchitectureDescriptionFromSourceCut(architecture,{
   ...sources,specification:forged,
 }),/selected source cut/u);
 const absent=validateArchitectureDescriptionAgainstSourceCut(architecture,{});
 assert.equal(absent.valid,false);
 assert.ok(absent.issues.length>=2);
});


/**
 * A real buyer expressed its enterprise-KM needs in the NYPA
 * Q26-7821RJM RFP, Attachment 1 §§2.1–2.2 (October 2026):
 * permission-filtered cited answers, governed ontology vocabulary and
 * SharePoint model publication. These are our ORIGINAL UNADMITTED
 * source-to-Engineering clauses, not a fictional NYPA order or adoption.
 */
function publishedUtilityBuyerTrace() {
  const requirement={
    id:"nypa-knowledge-management",kind:"requirement",
    "met-when":[
      {cell:"nypa-knowledge-management:permission-filtered-answers",target:"held",
        says:"Provide source-cited question answering while enforcing original reader permissions."},
      {cell:"nypa-knowledge-management:governed-vocabulary",target:"held",
        says:"Govern and version enterprise taxonomy and ontology term definitions."},
      {cell:"nypa-knowledge-management:sharepoint-model-publication",target:"held",
        says:"Publish and synchronize controlled vocabulary models to SharePoint Online term stores."},
    ],
  };
  const review={
    identity:{id:"utility-knowledge-source-spec",title:"NYPA source-only knowledge workshare",
      seat:"review-with-original-contracting-office",
      carrier:"candidate/utility-knowledge.md",authors:["unadmitted-source-review"]},
    at:"2026-10-24T21:00:00Z",reviewedBy:"unadmitted-technical-evidence-review",
    interpretations:[
      {cell:requirement["met-when"][0].cell,
        clauseId:"nypa-permissioned-answers",keyword:"MUST",actor:"The scoped solution"},
      {cell:requirement["met-when"][1].cell,
        clauseId:"nypa-governed-vocabulary",keyword:"MUST",actor:"The scoped solution"},
      {cell:requirement["met-when"][2].cell,
        clauseId:"nypa-sharepoint-model-publishing",keyword:"MUST",actor:"The scoped solution"},
    ],
  };
  const specification=deriveSpecificationFromRequirementReview(requirement,review);
  const architecture=candidate();
  architecture.identity.title="Scoped NYPA knowledge candidate (not a bid)";
  const req=architecture.sources.find(row=>row.id==="req");
  const spec=architecture.sources.find(row=>row.id==="spec");
  const buyerPdf="https://api.nypa.gov/rfq/v1/api/public/rfq/File?fileName=Q26-7821RJM+-+Instructions+%2B+Scope+of+Services.pdf&rfqNumber=Q26-7821RJM";
  req.locator=buyerPdf+"#page=9";
  req.revision=artifactId(requirement);
  spec.revision=artifactId(specification);
  const concern=architecture.concerns.find(row=>row.id==="rights");
  concern.sourceIds=["req","spec"];
  concern.requirementCellIds=[requirement["met-when"][0].cell];
  concern.specificationClauseIds=["nypa-permissioned-answers"];
  return {requirement,specification,architecture,review};
}

test("a real published utility buyer's three source conditions trace only the one actually mapped to an authored model",()=>{
  const sources=publishedUtilityBuyerTrace();
  assert.equal(validateArchitectureDescriptionAgainstSourceCut(sources.architecture,sources).valid,true);
  const trace=readRequirementArchitectureTrace(sources.architecture,sources);
  assert.equal(trace.kind,"specification.requirement-architecture-trace.v1");
  assert.equal(trace.counts.sourceCells,3);
  assert.equal(trace.counts.authoredModelMapped,1);
  assert.equal(trace.counts.untraced,2);
  const first=trace.rows.find(row=>row.cell.endsWith(":permission-filtered-answers"));
  assert.deepEqual(first.normativeClauseIds,["nypa-permissioned-answers"]);
  assert.equal(first.authoredPaths[0].concernId,"rights");
  assert.equal(first.authoredPaths[0].modelId,"auth-model");
  assert.equal(first.authoredPaths[0].viewId,"boundary-view");
  assert.equal(first.standing,"source-to-authored-model-only-not-proved");
  for(const suffix of [":governed-vocabulary",":sharepoint-model-publication"]){
    const row=trace.rows.find(x=>x.cell.endsWith(suffix));
    assert.equal(row.authoredPaths.length,0,"one generic Requirement source citation cannot certify every source cell");
    assert.equal(row.standing,"normative-but-architecture-untraced");
  }
  assert.equal(trace.independentProof,false);
  assert.equal(trace.independentlyAcceptedCustomerWork,false);
  assert.equal(trace.standardsConformance,"unassessed");
  const md=renderArchitectureDescriptionFromSourceCut(sources.architecture,sources);
  assert.match(md,/Exact original Requirement-to-model traceability/u);
  assert.match(md,/permission-filtered-answers/u);
  assert.match(md,/sharepoint-model-publication/u);
  assert.match(md,/2 remain without an authored model trace/u);
  assert.equal(md,renderArchitectureDescriptionFromSourceCut(
    structuredClone(sources.architecture),
    {requirement:structuredClone(sources.requirement),
      specification:structuredClone(sources.specification)}),
    "source identity, explicit maps and rendering must be byte-stable");
});

test("cross-work and wrong-clause mappings cannot counterfeit buyer requirement coverage",()=>{
  const sources=publishedUtilityBuyerTrace();
  const original=structuredClone(sources.architecture);
  const wrong=structuredClone(original);
  wrong.concerns[0].specificationClauseIds=["nypa-governed-vocabulary"];
  let result=validateArchitectureDescriptionAgainstSourceCut(wrong,sources);
  assert.equal(result.valid,false);
  assert.ok(result.issues.some(row=>/belongs to another source cell|no selected normative clause/u.test(row.message)));
  const foreign=structuredClone(original);
  foreign.concerns[0].requirementCellIds=["other-buyer:invented"];
  result=validateArchitectureDescriptionAgainstSourceCut(foreign,sources);
  assert.equal(result.valid,false);
  assert.ok(result.issues.some(row=>/unknown original Requirement condition/u.test(row.message)));
  const missingStage=structuredClone(original);
  delete missingStage.concerns[0].specificationClauseIds;
  result=validateArchitectureDescriptionAgainstSourceCut(missingStage,sources);
  assert.equal(result.valid,false);
  assert.ok(result.issues.some(row=>/must be paired/u.test(row.message)));
  const noQualifiedSource=structuredClone(original);
  noQualifiedSource.concerns[0].sourceIds=["req"];
  result=validateArchitectureDescriptionAgainstSourceCut(noQualifiedSource,sources);
  assert.equal(result.valid,false);
  assert.ok(result.issues.some(row=>/cite both original source stages/u.test(row.message)));
  const forgedNorms=structuredClone(sources.specification);
  forgedNorms.topics[0].clauses[0].backedBy=["another-buyer-decision"];
  const changedArchitecture=structuredClone(original);
  changedArchitecture.sources.find(row=>row.id==="spec").revision=artifactId(forgedNorms);
  result=validateArchitectureDescriptionAgainstSourceCut(changedArchitecture,{
    ...sources,specification:forgedNorms,
  });
  assert.equal(result.valid,false);
  assert.ok(result.issues.some(row=>/no selected normative clause actually backs/u.test(row.message)));
  const changedRequirement=structuredClone(sources.requirement);
  changedRequirement["met-when"][0].says="new client revision of same original cell";
  assert.throws(()=>readRequirementArchitectureTrace(original,{
    ...sources,requirement:changedRequirement,
  }),/selected source cut/u);
});

test("the original architecture CLI emits the real verified three-source trace rather than a free-form approval claim",()=>{
  const sources=publishedUtilityBuyerTrace();
  const runner=fileURLToPath(new URL("../scripts/render-architecture-description.mjs",import.meta.url));
  const packed=JSON.stringify({architecture:sources.architecture,
    requirement:sources.requirement,specification:sources.specification});
  const result=spawnSync(process.execPath,[runner,"--source-cut"],{
    input:packed,encoding:"utf8",timeout:20000,
  });
  assert.equal(result.status,0,result.stderr);
  assert.match(result.stdout,/Exact original Requirement-to-model traceability/u);
  assert.match(result.stdout,/nypa-knowledge-management:governed-vocabulary/u);
  assert.match(result.stdout,/normative-but-architecture-untraced/u);
  const ordinary=spawnSync(process.execPath,[runner],{
    input:JSON.stringify(sources.architecture),encoding:"utf8",timeout:20000,
  });
  assert.equal(ordinary.status,0,ordinary.stderr);
  assert.doesNotMatch(ordinary.stdout,/Exact original Requirement-to-model traceability/u,
    "unauthenticated single-document preview cannot claim source-cut traceability");
});
test("independent source-cut replay has no new Work or model impact", () => {
  const cut = publishedUtilityBuyerTrace();
  const first = readRequirementArchitectureImpact(cut,cut);
  const cloned = structuredClone(cut);
  assert.deepEqual(readRequirementArchitectureImpact(cut,cloned),first);
  assert.equal(first.kind,"specification.requirement-architecture-impact.v1");
  assert.equal(first.summary.affectedCells,0);
  assert.equal(first.summary.regenerationCells,0);
  assert.equal(first.summary.requalificationOnlyCells,0);
  assert.deepEqual(first.changes,[]);
  assert.deepEqual(first.affectedModels,[]);
  assert.deepEqual(first.affectedViews,[]);
  assert.equal(first.independentReceiving,"required-from-original-work-and-customer");
  assert.equal(Object.isFrozen(first.changes),true);
  assert.equal(Object.isFrozen(first.summary),true);
});

test("changed buyer words invalidate the old source cut but identify only genuinely changed fabrication work", () => {
  const prior = publishedUtilityBuyerTrace();
  const next = structuredClone(prior);
  next.requirement["met-when"][0].says =
    "The revised buyer now requires cited answers to omit inaccessible source snippets.";
  next.specification = deriveSpecificationFromRequirementReview(next.requirement,next.review);
  next.architecture.sources.find(source=>source.id==="req").revision = artifactId(next.requirement);
  next.architecture.sources.find(source=>source.id==="spec").revision = artifactId(next.specification);
  const impact=readRequirementArchitectureImpact(prior,next);
  assert.equal(impact.summary.affectedCells,3,
    "all original source witnesses need requalification after source-revision change");
  assert.equal(impact.summary.regenerationCells,1,
    "only one original condition changed materially");
  assert.equal(impact.summary.requalificationOnlyCells,2);
  assert.ok(impact.changes.find(row=>row.cell.endsWith(":permission-filtered-answers"))
    .reasons.includes("source-statement-changed"));
  assert.equal(impact.changes.filter(row=>row.kind==="regenerate-and-requalify").length,1);
  assert.equal(impact.changes.filter(row=>row.kind==="requalify-source-only").length,2);
  assert.deepEqual(impact.affectedModels,["auth-model"]);
  assert.deepEqual(impact.affectedViews,["boundary-view"]);
  assert.notEqual(impact.before.requirement,impact.after.requirement);
  assert.notEqual(impact.before.specification,impact.after.specification);
  assert.equal(impact.after.architecture,artifactId(next.architecture));
});

test("newly mapped Architecture concerns trigger model requalification without fabricating a beneficiary receipt", () => {
  const prior = publishedUtilityBuyerTrace();
  const next = structuredClone(prior);
  const concern=next.architecture.concerns.find(row=>row.id==="failure");
  concern.sourceIds=["req","spec"];
  concern.requirementCellIds=["nypa-knowledge-management:governed-vocabulary"];
  concern.specificationClauseIds=["nypa-governed-vocabulary"];
  const impact=readRequirementArchitectureImpact(prior,next);
  assert.equal(impact.summary.affectedCells,3,"changed Architecture source must not reuse an old proof");
  assert.equal(impact.summary.regenerationCells,1);
  assert.equal(impact.summary.requalificationOnlyCells,2);
  const added=impact.changes.find(row=>row.cell.endsWith(":governed-vocabulary"));
  assert.ok(added.reasons.includes("architecture-model-trace-changed"));
  assert.equal(added.beforeStanding,"normative-but-architecture-untraced");
  assert.equal(added.afterStanding,"source-to-authored-model-only-not-proved");
  assert.deepEqual(impact.affectedModels,["auth-model"]);
  assert.equal(impact.summary.untracedAfter,1);
  assert.equal(impact.independentlyAcceptedCustomerWork,false);
});

test("a stale, unpaired, or forged source cut never produces a change-impact Work instruction", () => {
  const prior=publishedUtilityBuyerTrace();
  const invalid=structuredClone(prior);
  invalid.requirement["met-when"][0].says="new unreviewed customer wording";
  assert.throws(()=>readRequirementArchitectureImpact(prior,invalid),/selected source cut/u);
  const foreign=structuredClone(prior);
  foreign.architecture.concerns[0].specificationClauseIds=["nypa-governed-vocabulary"];
  assert.throws(()=>readRequirementArchitectureImpact(prior,foreign),/selected source cut/u);
  assert.throws(()=>readRequirementArchitectureImpact(prior,{}),TypeError);
  assert.throws(()=>readRequirementArchitectureImpact(undefined,prior),TypeError);
});

test("original source-impact CLI performs a bounded JSON read and returns source-qualified Work impact", () => {
  const prior=publishedUtilityBuyerTrace();
  const next=structuredClone(prior);
  next.specification.topics[0].clauses[0].statement="Changed authored clause wording.";
  next.architecture.sources.find(source=>source.id==="spec").revision=artifactId(next.specification);
  const runner=fileURLToPath(new URL("../scripts/render-architecture-description.mjs",import.meta.url));
  const request=JSON.stringify({before:prior,after:next});
  const result=spawnSync(process.execPath,[runner,"--source-impact"],{
    input:request,encoding:"utf8",timeout:20000,
  });
  assert.equal(result.status,0,result.stderr);
  const impact=JSON.parse(result.stdout);
  assert.equal(impact.kind,"specification.requirement-architecture-impact.v1");
  assert.equal(impact.summary.regenerationCells,1,
    "changed normative clause content requires regenerating affected implementation even when the clause ID remains stable");
  assert.equal(impact.summary.requalificationOnlyCells,2);
  assert.ok(impact.changes.find(row=>row.cell.endsWith(":permission-filtered-answers"))
    .reasons.includes("normative-clause-content-changed"));
  const denied=spawnSync(process.execPath,[runner,"--source-impact"],{
    input:JSON.stringify({before:prior,after:next,accepted:true}),encoding:"utf8",timeout:20000,
  });
  assert.notEqual(denied.status,0);
  assert.equal(denied.stdout,"","foreign acceptance words never become rendered instructions");
});
test("changing the code-facing model body under an unchanged ID is a genuine regeneration obligation",()=>{
  const prior=publishedUtilityBuyerTrace();
  const next=structuredClone(prior);
  next.architecture.models[0].content="The revised original model fails closed on an expired permission witness.";
  const impact=readRequirementArchitectureImpact(prior,next);
  assert.equal(impact.summary.regenerationCells,1);
  assert.equal(impact.summary.requalificationOnlyCells,2);
  assert.ok(impact.changes.find(row=>row.cell.endsWith(":permission-filtered-answers"))
    .reasons.includes("architecture-model-content-changed"));
  assert.deepEqual(impact.affectedModels,["auth-model"]);
});
