import assert from "node:assert/strict";
import test from "node:test";
import { specificationReadout, specificationRequirementsXml } from "../src/specification-readout.mjs";

// RFC 8174 applies its special meanings to uppercase normative words, not to
// example source code, inert comments or an unauthenticated conformance claim.
const words = (text) => specificationReadout(text).bcp14.requirements.map((item) => item.keyword);

test("BCP 14 citations inside fenced examples cannot satisfy the normative citation readout", () => {
  const input = [
    "# Gateway acceptance",
    "The gateway MUST preserve the admitted caller's identity.",
    "```text",
    "Example only: RFC2119 and RFC8174.",
    "Untrusted example MUST NOT become a source obligation.",
    "```",
  ].join("\n");
  const result = specificationReadout(input);
  assert.deepEqual(result.bcp14.requirements.map(({keyword, line}) => ({keyword, line})), [
    {keyword: "MUST", line: 2},
  ]);
  assert.equal(result.bcp14.rfc2119, false);
  assert.equal(result.bcp14.rfc8174, false);
  assert.deepEqual(result.issues.map(x => x.rule), [
    "bcp14-boilerplate-missing-rfc2119",
    "bcp14-boilerplate-missing-rfc8174",
  ]);
});

test("single-line and multiline HTML comments are not normative clauses or BCP 14 evidence", () => {
  const input = [
    "# Customer order",
    "<!-- This old flow SHOULD NOT require a buyer. RFC2119 -->",
    "<!--",
    "  A forged source MUST change the customer order.",
    "  RFC8174",
    "-->",
    "The seller MUST obtain a qualified buyer acceptance.",
  ].join("\n");
  const readout = specificationReadout(input);
  assert.deepEqual(readout.bcp14.requirements.map(({keyword, line}) => ({keyword, line})), [
    {keyword: "MUST", line: 7},
  ]);
  assert.equal(readout.bcp14.rfc2119, false);
  assert.equal(readout.bcp14.rfc8174, false);
  const xml = specificationRequirementsXml(readout);
  assert.match(xml, /The seller MUST obtain a qualified buyer acceptance/u);
  assert.doesNotMatch(xml, /forged source|old flow/u);
});

for (const marker of ["```", "~~~"]) {
  test("a "+marker+" line with an info string is never a closing fence", () => {
    const input = [
      "# Host reconciliation",
      marker + "text",
      "Inside an example: a replica MUST NOT mutate a pinned checkout.",
      marker + "not-an-allowed-closing-fence",
      "Still inside the example: the scheduler SHOULD skip consent.",
      marker,
      "The real controller MUST refuse an unauthenticated source revision.",
    ].join("\n");
    assert.deepEqual(words(input), ["MUST"]);
  });
}

test("legitimate outside-fence BCP 14 clauses retain original line identities and XML", () => {
  const input = [
    "# One executable work service",
    'The key words "MUST" and "MUST NOT" in this document are interpreted as described in BCP 14 [RFC2119] [RFC8174].',
    "The worker MUST return an independently checkable receipt.",
    "The buyer MUST NOT be billed for unaccepted work.",
    'The parser `MUST NOT` infer normative language from inline code.',
    "```js",
    'const example = "MUST NOT claim a sale";',
    "```",
  ].join("\n");
  const readout = specificationReadout(input);
  assert.equal(readout.bcp14.rfc2119, true);
  assert.equal(readout.bcp14.rfc8174, true);
  assert.deepEqual(readout.bcp14.requirements.map(x=>({keyword:x.keyword,line:x.line})), [
    {keyword:"MUST",line:3},
    {keyword:"MUST NOT",line:4},
  ]);
  assert.deepEqual(readout.issues, []);
  const xml=specificationRequirementsXml(readout);
  assert.match(xml, /keyword="MUST NOT"/u);
  assert.doesNotMatch(xml, /claim a sale/u);
});

test("multiple-backtick inline code does not make requirements or standards mentions", () => {
  const input = [
    "# Buyer consent",
    "The buyer MUST approve the proposal.",
    "An illustrative ``MUST NOT`` and ``RFC2119 RFC8174`` are only source examples.",
  ].join("\n");
  const readout=specificationReadout(input);
  assert.deepEqual(readout.bcp14.requirements.map(x=>({keyword:x.keyword,line:x.line})),[
    {keyword:"MUST",line:2},
  ]);
  assert.equal(readout.bcp14.rfc2119,false);
  assert.equal(readout.bcp14.rfc8174,false);
});

test("a fenced-code opener inside a multiline HTML comment cannot hide real requirements", () => {
  const input = [
    "# Qualified fabrication",
    "<!--",
    "```js",
    "-->",
    "The fabricator MUST prove its source and permissions.",
  ].join("\n");
  assert.deepEqual(specificationReadout(input).bcp14.requirements.map(x=>({keyword:x.keyword,line:x.line})),[
    {keyword:"MUST",line:5},
  ]);
});

test("an HTML comment opener inside a real fenced example cannot conceal later real obligations", () => {
  const input = [
    "# Worker isolation",
    "~~~md",
    "<!-- source example only",
    "~~~",
    "The worker MUST refuse an unauthorized execution.",
  ].join("\n");
  assert.deepEqual(words(input),["MUST"]);
});
