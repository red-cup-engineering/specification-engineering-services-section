#!/usr/bin/env node
import { deriveSpecificationRecord, validateSpecificationRecord } from "../src/specification.mjs";
import { readSourceJsonStdin } from "./read-source-json-stdin.mjs";

if (import.meta.main) {
  if (process.argv.includes("--help")) {
    process.stdout.write("derive-specification [--now <ISO-8601>] — Reads one authoring draft as JSON on stdin (a partial identity, whatThisIs, topics with local per-topic laws/standards, implementations, openQuestions, and provenance.derivedFrom) and writes the derived, schema-valid Specification record as JSON on stdout, validated before being printed. Determinism requires an explicit --now, provenance.derivedAt, or identity.date-created; no ambient clock is used.\n");
  } else {
    const nowFlagIndex = process.argv.indexOf("--now");
    const now = nowFlagIndex === -1 ? undefined : process.argv[nowFlagIndex + 1];
    const draft = await readSourceJsonStdin(process.stdin);
    const record = deriveSpecificationRecord(draft, now === undefined ? {} : { now });
    const { valid, issues } = validateSpecificationRecord(record);
    if (!valid) {
      process.stderr.write(`${JSON.stringify(issues)}\n`);
      process.exitCode = 1;
    } else {
      process.stdout.write(`${JSON.stringify(record)}\n`);
    }
  }
}
