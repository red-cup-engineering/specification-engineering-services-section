import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { readFileText } from "@red-cup-engineering/computer-file-engineering-services-section/read-file";
import { writeFileText } from "@red-cup-engineering/computer-file-engineering-services-section/write-file";
import { makeSpecification } from "../scripts/make-specification.mjs";
import { updateSpecification } from "../scripts/update-specification.mjs";

function minimalRecord(title) {
  return {
    identity: { id: "example-specification", title, seat: "specification-engineering-services-section", carrier: "carrier.md", "date-created": "2026-09-06", authors: ["emsenn"], version: "0.1.0", stability: "draft", status: "draft" },
    whatThisIs: "An example.",
    topics: [],
    implementations: [],
    openQuestions: [],
    laws: [],
    standards: [],
    provenance: { derivedFrom: ["test"], derivedAt: "2026-09-06T00:00:00Z", derivedBy: "test" },
  };
}

test("makeSpecification writes a rendered carrier that does not yet exist", async () => {
  const directory = mkdtempSync(join(tmpdir(), "make-specification-"));
  try {
    const recordPath = join(directory, "record.json");
    const destinationPath = join(directory, "carrier.md");
    await writeFileText(recordPath, JSON.stringify(minimalRecord("First title")));
    const result = await makeSpecification(recordPath, destinationPath);
    assert.equal(result.destinationPath, destinationPath);
    assert.match(await readFileText(destinationPath), /# First title/u);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("makeSpecification refuses when the destination already exists", async () => {
  const directory = mkdtempSync(join(tmpdir(), "make-specification-"));
  try {
    const recordPath = join(directory, "record.json");
    const destinationPath = join(directory, "carrier.md");
    await writeFileText(recordPath, JSON.stringify(minimalRecord("First title")));
    await writeFileText(destinationPath, "already here");
    await assert.rejects(() => makeSpecification(recordPath, destinationPath), /already exists/u);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("makeSpecification refuses when destinationPath does not match identity.carrier", async () => {
  const directory = mkdtempSync(join(tmpdir(), "make-specification-"));
  try {
    const recordPath = join(directory, "record.json");
    const destinationPath = join(directory, "wrong-name.md");
    await writeFileText(recordPath, JSON.stringify(minimalRecord("First title")));
    await assert.rejects(() => makeSpecification(recordPath, destinationPath), /does not end with identity\.carrier/u);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("updateSpecification refuses when no carrier exists yet", async () => {
  const directory = mkdtempSync(join(tmpdir(), "update-specification-"));
  try {
    const recordPath = join(directory, "record.json");
    const destinationPath = join(directory, "carrier.md");
    await writeFileText(recordPath, JSON.stringify(minimalRecord("First title")));
    await assert.rejects(() => updateSpecification(recordPath, destinationPath), /no carrier exists yet/u);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("updateSpecification re-renders an existing carrier and reports whether it changed", async () => {
  const directory = mkdtempSync(join(tmpdir(), "update-specification-"));
  try {
    const recordPath = join(directory, "record.json");
    const destinationPath = join(directory, "carrier.md");
    await writeFileText(recordPath, JSON.stringify(minimalRecord("First title")));
    await makeSpecification(recordPath, destinationPath);
    await writeFileText(recordPath, JSON.stringify(minimalRecord("Second title")));
    const result = await updateSpecification(recordPath, destinationPath);
    assert.equal(result.changed, true);
    assert.match(await readFileText(destinationPath), /# Second title/u);
    const repeated = await updateSpecification(recordPath, destinationPath);
    assert.equal(repeated.changed, false);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("makeSpecification rejects a lookalike source root before misattributing a citation", async () => {
  const sourceRoot = mkdtempSync(join(tmpdir(), "specification-source-cut-"));
  const sibling = sourceRoot + "lib"; // NOT a child: lexical suffix matches 'lib/carrier.md'.
  try {
    mkdirSync(sibling, { recursive: true });
    await writeFileText(join(sourceRoot, "CLAUDE.md"), "# Authority in the other tree\\n");
    const record = minimalRecord("Do not borrow source evidence");
    record.identity.carrier = "lib/carrier.md";
    record.topics = [{
      heading: "Traceability",
      body: "{{clause:retain-evidence}}",
      clauses: [{
        id: "retain-evidence", actor: "The source reader", keyword: "MUST",
        statement: "use evidence from the actual destination repository",
        backedBy: ["[source record](CLAUDE.md)"],
      }],
    }];
    const recordPath = join(sourceRoot, "record.json");
    const destinationPath = join(sibling, "carrier.md");
    await writeFileText(recordPath, JSON.stringify(record));
    // Old behavior finds sourceRoot/CLAUDE.md, then writes sibling/carrier.md.
    await assert.rejects(() => makeSpecification(recordPath, destinationPath),
      /does not end with identity\.carrier/u);
    assert.equal(existsSync(destinationPath), false,
      "refused source roots must not manufacture a cross-tree carrier");
  } finally {
    rmSync(sibling, { recursive: true, force: true });
    rmSync(sourceRoot, { recursive: true, force: true });
  }
});

test("updateSpecification leaves an existing carrier untouched on lookalike root refusal", async () => {
  const sourceRoot = mkdtempSync(join(tmpdir(), "specification-update-cut-"));
  const sibling = sourceRoot + "lib";
  try {
    mkdirSync(sibling, { recursive: true });
    const recordPath = join(sourceRoot, "record.json");
    const destinationPath = join(sibling, "carrier.md");
    const record = minimalRecord("Wrong repository");
    record.identity.carrier = "lib/carrier.md";
    await writeFileText(recordPath, JSON.stringify(record));
    await writeFileText(destinationPath, "Existing source-owned carrier\\n");
    await assert.rejects(() => updateSpecification(recordPath, destinationPath),
      /does not end with identity\.carrier/u);
    assert.equal(await readFileText(destinationPath), "Existing source-owned carrier\\n",
      "unadmitted source selection cannot rewrite another tree");
  } finally {
    rmSync(sibling, { recursive: true, force: true });
    rmSync(sourceRoot, { recursive: true, force: true });
  }
});
