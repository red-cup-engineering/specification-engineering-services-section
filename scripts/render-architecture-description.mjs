#!/usr/bin/env node
import {
  renderArchitectureDescriptionMarkdown,validateArchitectureDescriptionRecord,
  renderArchitectureDescriptionFromSourceCut,
} from "../src/architecture-description.mjs";
import { readSourceJsonStdin } from "./read-source-json-stdin.mjs";

if (import.meta.main) {
  if (process.argv.includes("--help")) {
    process.stdout.write("render-architecture-description [--source-cut] — Reads one ArchitectureDescriptionCandidate JSON from stdin. --source-cut requires {requirement,specification,architecture} as exact source objects and renders the source-verified original Requirement-cell→Specification-clause→architecture-model trace, including untraced cells. No proof, permission or conformance grant.\n");
  } else {
    const sourceCut=process.argv.includes("--source-cut");
    const invalid=process.argv.slice(2).some(arg=>arg!=="--source-cut") ||
      process.argv.filter(arg=>arg==="--source-cut").length>1;
    if(invalid) {
      process.stderr.write("render-architecture-description: unsupported argument\n");
      process.exitCode=2;
    }else{
      const input=await readSourceJsonStdin(process.stdin);
      if(sourceCut){
        // This route consumes three ORIGINAL source objects. Never synthesize
        // missing normative decisions, stakeholder authority, or source bytes.
        if(!input || typeof input!=="object" || Array.isArray(input) ||
           Object.keys(input).sort().join(",")!=="architecture,requirement,specification")
          throw new TypeError("source-cut architecture requires exact Requirement, Specification and Architecture input");
        process.stdout.write(renderArchitectureDescriptionFromSourceCut(
          input.architecture,{requirement:input.requirement,specification:input.specification}));
      }else{
        const check=validateArchitectureDescriptionRecord(input);
        if(!check.valid){
          process.stderr.write(JSON.stringify(check.issues)+"\n");
          process.exitCode=1;
        }else process.stdout.write(renderArchitectureDescriptionMarkdown(input));
      }
    }
  }
}
