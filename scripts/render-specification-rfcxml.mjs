#!/usr/bin/env node
import { validateSpecificationRecord } from "../src/specification.mjs";
import { renderSpecificationRfcXml } from "../src/specification-rfcxml.mjs";
import { readSourceJsonStdin } from "./read-source-json-stdin.mjs";

if (import.meta.main) {
  if (process.argv.includes("--help")) {
    process.stdout.write("render-specification-rfcxml — Reads one Specification record carrying an rfc block as JSON on stdin, validates it against the group schema, and writes its RFCXML v3 (RFC 7991) Internet-Draft to stdout.\n");
  } else {
    const record = await readSourceJsonStdin(process.stdin);
    const { valid, issues } = validateSpecificationRecord(record);
    if (!valid) {
      process.stderr.write(`${JSON.stringify(issues)}\n`);
      process.exitCode = 1;
    } else {
      process.stdout.write(renderSpecificationRfcXml(record));
    }
  }
}
