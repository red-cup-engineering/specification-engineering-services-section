#!/usr/bin/env node
import { deriveSpecificationFromRequirementReview } from "../src/specification.mjs";
import { readSourceJsonStdin } from "./read-source-json-stdin.mjs";

if (import.meta.main) {
  if (process.argv.includes("--help")) {
    process.stdout.write("derive-specification-from-requirement — Reads {requirement, review} as JSON on stdin: the section's one original Requirement record and the review (identity, interpretations, at, reviewedBy, and optional cells naming the requirement cut it covers). Writes the derived, schema-valid Specification record as JSON on stdout. Nothing is inferred from prose; the record's says text is each clause's statement.\n");
  } else {
    const input = await readSourceJsonStdin(process.stdin);
    if (!input || typeof input !== "object" || Array.isArray(input) ||
        Object.keys(input).sort().join(",") !== "requirement,review")
      throw new TypeError("derive-specification-from-requirement: exactly {requirement, review} required");
    process.stdout.write(`${JSON.stringify(deriveSpecificationFromRequirementReview(input.requirement, input.review))}\n`);
  }
}
