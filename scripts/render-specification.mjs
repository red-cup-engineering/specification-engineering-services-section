#!/usr/bin/env node
import { renderSpecificationMarkdown, validateSpecificationRecord } from "../src/specification.mjs";
import { readSourceJsonStdin } from "./read-source-json-stdin.mjs";

if (import.meta.main) {
  if (process.argv.includes("--help")) {
    process.stdout.write("render-specification — Reads one Specification record as JSON on stdin, validates it against the group schema, and writes its rendered Markdown carrier to stdout.\n");
  } else {
    const record = await readSourceJsonStdin(process.stdin);
    const { valid, issues } = validateSpecificationRecord(record);
    if (!valid) {
      process.stderr.write(`${JSON.stringify(issues)}\n`);
      process.exitCode = 1;
    } else {
      process.stdout.write(renderSpecificationMarkdown(record));
    }
  }
}
