import assert from "node:assert/strict";
import test from "node:test";
import {
  deriveSpecificationRecord, deriveSpecificationFromRequirementReview,
  renderSpecificationMarkdown, validateSpecificationRecord,
} from "../src/specification.mjs";

function draft(overrides = {}) {
  return {
    identity: { id: "example", title: "Example", seat: "example-seat", carrier: "example.md", authors: ["emsenn"] },
    whatThisIs: "An example.",
    topics: [
      { heading: "Constraints", body: "{{clause:c1}} {{law:l1}}", clauses: [{ id: "c1", keyword: "MUST", statement: "do X", actor: "Software", backedBy: ["a citation"] }], laws: [{ id: "l1", authority: "owner", revision: "v1", locator: "x.md", applicability: "always", statement: "law text" }] },
    ],
    provenance: { derivedFrom: ["a ruling"] },
    ...overrides,
  };
}

test("deriveSpecificationRecord fills identity and provenance defaults", () => {
  const record = deriveSpecificationRecord(draft(), { now: "2026-09-06T12:00:00.000Z" });
  assert.equal(record.identity.version, "0.1.0");
  assert.equal(record.identity.stability, "draft");
  assert.equal(record.identity["date-created"], "2026-09-06");
  assert.equal(record.provenance.derivedAt, "2026-09-06T12:00:00.000Z");
  assert.equal(record.provenance.derivedBy, "derive-specification.mjs");
});

test("deriveSpecificationRecord lifts a topic's local laws into the top-level laws array and strips the local copy", () => {
  const record = deriveSpecificationRecord(draft(), { now: "2026-09-06T00:00:00Z" });
  assert.deepEqual(record.laws.map((law) => law.id), ["l1"]);
  assert.equal(record.topics[0].laws, undefined);
});

test("deriveSpecificationRecord produces a record that validates against the house schema", () => {
  const record = deriveSpecificationRecord(draft(), { now: "2026-09-06T00:00:00Z" });
  const { valid, issues } = validateSpecificationRecord(record);
  assert.equal(valid, true, JSON.stringify(issues));
});

test("deriveSpecificationRecord refuses when two topics define the same law id differently", () => {
  const conflicting = draft({
    topics: [
      { heading: "A", body: "{{law:l1}}", clauses: [], laws: [{ id: "l1", authority: "owner", revision: "v1", locator: "x.md", applicability: "always", statement: "one version" }] },
      { heading: "B", body: "{{law:l1}}", clauses: [], laws: [{ id: "l1", authority: "owner", revision: "v2", locator: "x.md", applicability: "always", statement: "a different version" }] },
    ],
  });
  assert.throws(() => deriveSpecificationRecord(conflicting), /define laws "l1" with different content/u);
});

test("deriveSpecificationRecord accepts an explicit identity field, overriding the default", () => {
  const record = deriveSpecificationRecord(draft({ identity: { ...draft().identity, version: "2.0.0" } }), { now: "2026-09-06T00:00:00Z" });
  assert.equal(record.identity.version, "2.0.0");
});

test("derivation refuses implicit wall-clock timestamps for unpinned input", () => {
  assert.throws(() => deriveSpecificationRecord(draft()), /pinned ISO UTC timestamp required/u);
});

test("a pinned identity date makes identical draft inputs byte-stable without --now", () => {
  const current = draft({ identity: { ...draft().identity, "date-created": "2026-10-23" } });
  const first = deriveSpecificationRecord(current);
  const second = deriveSpecificationRecord(structuredClone(current));
  assert.equal(JSON.stringify(first), JSON.stringify(second));
  assert.equal(first.provenance.derivedAt, "2026-10-23T00:00:00.000Z");
});

test("an original timestamp is preferred to any unspecified ambient clock", () => {
  const current = draft({ provenance: { derivedFrom: ["a ruling"], derivedAt: "2026-10-22T15:00:00Z" } });
  const first = deriveSpecificationRecord(current);
  assert.equal(first.identity["date-created"], "2026-10-22");
  assert.equal(first.provenance.derivedAt, current.provenance.derivedAt);
});

test("source derivation refuses clashing normative identifiers before producing a specification", () => {
  const original = draft();
  const extra = { heading: "Unadopted vendor evidence", body: "{{clause:c1}}",
    clauses: [{ ...original.topics[0].clauses[0],
      statement: "do NOT do X", keyword: "MUST NOT",
      backedBy: ["one unaudited vendor comment"] }] };
  for (const topics of [
    [...original.topics, extra],
    [extra, ...original.topics],
  ]) assert.throws(
    () => deriveSpecificationRecord({ ...original, topics }, { now: "2026-10-24T00:00:00Z" }),
    /clause "c1" is declared twice/u,
    "source identity cannot depend on independent topic order",
  );
  const valid = deriveSpecificationRecord(original, { now: "2026-10-24T00:00:00Z" });
  assert.equal(validateSpecificationRecord(valid).valid, true);
});

function sourceRequirement() {
  return {
    id:"enterprise-work-continuity",kind:"requirement",
    asks:"Retain exact Work, seller and customer receiving",
    "met-when":[
      {cell:"enterprise-work-continuity:source",target:"held",
        says:"preserve the exact source-owned Work identity"},
      {cell:"enterprise-work-continuity:acceptance",target:"held",
        says:"never count an unreceived vendor check as customer acceptance"},
      {cell:"enterprise-work-continuity:money",target:"held",
        says:"report only independently settled seller revenue"},
    ],
  };
}
function sourceReview(source=sourceRequirement()) {
  return {
    identity:{id:"enterprise-work-continuity-specification",
      title:"Source-qualified Work continuity",seat:"engineering-review",
      carrier:"content/work-continuity.md",authors:["original source reviewer"]},
    at:"2026-10-24T18:00:00Z",reviewedBy:"source-identified-reviewer",
    interpretations:source["met-when"].map((c,i)=>({
      cell:c.cell,clauseId:["original-work","original-acceptance","original-revenue"][i],
      keyword:i===1?"MUST NOT":"MUST",actor:"The software Work receiver",
    })),
  };
}

test("every original Requirement acceptance condition survives a separately attributed normative review",()=>{
  const original=sourceRequirement(),review=sourceReview(original);
  const record=deriveSpecificationFromRequirementReview(original,review);
  assert.equal(validateSpecificationRecord(record).valid,true);
  assert.equal(record.identity.stability,"draft");
  assert.match(record.identity.status,/requires-independent/u);
  assert.equal(record.topics.length,1);
  const produced=record.topics[0].clauses;
  assert.equal(produced.length,original["met-when"].length);
  assert.deepEqual(produced.map(x=>x.statement),
    original["met-when"].map(x=>x.says),
    "the reviewer may assign normative roles but cannot rewrite customer source");
  assert.deepEqual(produced.map(x=>x.id),
    ["original-work","original-acceptance","original-revenue"]);
  assert.deepEqual(produced.map(x=>x.keyword),["MUST","MUST NOT","MUST"]);
  for (const [i,clause] of produced.entries()) {
    assert.match(clause.backedBy[0],new RegExp(original["met-when"][i].cell));
    assert.ok(record.topics[0].body.includes("{{clause:"+clause.id+"}}"));
  }
  assert.match(record.provenance.derivedFrom[0],/^enterprise-work-continuity@ni:\/\/\/sha-256;/u);
  assert.equal(record.provenance.derivedBy,"source-identified-reviewer");
  assert.equal(record.openQuestions.length,1);
  const out=renderSpecificationMarkdown(record);
  assert.match(out,/original source reviewer/u);
  assert.match(out,/The software Work receiver MUST NOT.*never count/u);
  assert.match(out,/## Open questions/u);
  const reread=deriveSpecificationFromRequirementReview(
    structuredClone(original),structuredClone(review));
  assert.equal(JSON.stringify(record),JSON.stringify(reread),
    "same complete source, reviewer and pinned instant must produce byte-identical draft");
  assert.equal(original["met-when"][0].target,"held",
    "candidate compilation never changes the original Requirement's acceptance status");
});

test("unknown, duplicate, dropped or unreviewed original Work conditions refuse instead of disappearing",()=>{
  const source=sourceRequirement(),review=sourceReview(source);
  const denial=source=>assert.throws(
    ()=>deriveSpecificationFromRequirementReview(source,sourceReview(source)),
    /requirement-to-specification:/u);
  const duplicate=structuredClone(source);
  duplicate["met-when"].push({...duplicate["met-when"][0]});
  denial(duplicate);
  for (const target of ["denied","contested",null]) {
    const changed=structuredClone(source);
    changed["met-when"][0].target=target;
    denial(changed);
  }
  for (const bad of [
    {...review,interpretations:review.interpretations.slice(1)},
    {...review,interpretations:[review.interpretations[0],review.interpretations[0],review.interpretations[2]]},
    {...review,interpretations:[...review.interpretations.slice(0,2),
      {...review.interpretations[2],cell:"another-work:foreign"}]},
    {...review,interpretations:review.interpretations.map((x,i)=>
      i===1?{...x,clauseId:review.interpretations[0].clauseId}:x)},
    {...review,interpretations:review.interpretations.map((x,i)=>
      i===1?{...x,keyword:"SHALL"}:x)},
    {...review,interpretations:review.interpretations.map((x,i)=>
      i===1?{...x,statement:"suppress the original source"}:x)},
  ]) assert.throws(()=>deriveSpecificationFromRequirementReview(source,bad),
    /requirement-to-specification:/u);
});

test("source revision, unpinned time and untrusted identity cannot forge an accepted Specification",()=>{
  const source=sourceRequirement(),review=sourceReview(source);
  const first=deriveSpecificationFromRequirementReview(source,review);
  const changed=structuredClone(source);
  changed["met-when"][1].says="never mark a vendor API acknowledgment as buyer receipt";
  const second=deriveSpecificationFromRequirementReview(changed,review);
  assert.notEqual(first.provenance.derivedFrom[0],second.provenance.derivedFrom[0],
    "changing source without changing Work ID forces a new content-bound correspondence");
  assert.equal(second.topics[0].clauses[1].statement,changed["met-when"][1].says);
  for(const bad of [
    {...review,at:undefined},
    {...review,at:"tomorrow"},
    {...review,reviewedBy:""},
    {...review,identity:{...review.identity,title:"Trust me\\n## Accepted without review"}},
  ]) assert.throws(()=>deriveSpecificationFromRequirementReview(source,bad),
    /(requirement-to-specification|pinned ISO UTC timestamp)/u);
  const explicitlySpoofed={...review,identity:{...review.identity,
    stability:"stable",status:"independently-accepted",version:"4.0.0"}};
  const refusedPromotion=deriveSpecificationFromRequirementReview(source,explicitlySpoofed);
  assert.equal(refusedPromotion.identity.status,first.identity.status);
  assert.equal(refusedPromotion.identity.stability,"draft");
  assert.equal(refusedPromotion.identity.version,"4.0.0",
    "version identity may be supplied but is not acceptance evidence");
});
