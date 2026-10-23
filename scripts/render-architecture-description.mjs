#!/usr/bin/env node
import { renderArchitectureDescriptionMarkdown, validateArchitectureDescriptionRecord } from "../src/architecture-description.mjs";

async function readStdin() {
  let text = "";
  for await (const chunk of process.stdin) text += chunk;
  return text;
}

if (import.meta.main) {
  if (process.argv.includes("--help")) {
    process.stdout.write("render-architecture-description — Reads one typed ArchitectureDescriptionCandidate JSON from stdin, validates source identity/cross-view references, and renders a deterministic ISO/IEC/IEEE 42010:2022-informed candidate Markdown document. This is NOT a conformance audit or proof.\n");
  } else {
    const record = JSON.parse(await readStdin());
    const check = validateArchitectureDescriptionRecord(record);
    if (!check.valid) {
      process.stderr.write(JSON.stringify(check.issues) + "\n");
      process.exitCode = 1;
    } else {
      process.stdout.write(renderArchitectureDescriptionMarkdown(record));
    }
  }
}
