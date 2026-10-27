#!/usr/bin/env node
import {
  renderArchitectureDescriptionMarkdown,validateArchitectureDescriptionRecord,
  renderArchitectureDescriptionFromSourceCut, deriveArchitectureDescriptionFromSpecificationReview,
} from "../src/architecture-description.mjs";
import { readSourceJsonStdin } from "./read-source-json-stdin.mjs";

if (import.meta.main) {
  if (process.argv.includes("--help")) {
    process.stdout.write("render-architecture-description [--source-cut|--reviewed-source-cut] — Bare input renders a candidate ArchitectureDescription. --source-cut reads {requirement,specification,architecture}; --reviewed-source-cut deterministically creates an ArchitectureDescriptionCandidate from {requirement,specification,review} with authored decisions, then renders the exact buyer-cell trace. An authored model is not Proof, source rights, standards conformance or accepted Work.\n");
  } else {
    const sourceCut=process.argv.includes("--source-cut");
    const reviewedSourceCut=process.argv.includes("--reviewed-source-cut");
    const invalid=process.argv.slice(2).some(arg=>!["--source-cut","--reviewed-source-cut"].includes(arg)) ||
      process.argv.slice(2).length>1;
    if(invalid) {
      process.stderr.write("render-architecture-description: unsupported argument\n");
      process.exitCode=2;
    }else{
      const input=await readSourceJsonStdin(process.stdin);
      if(reviewedSourceCut){
        if(!input || typeof input!=="object" || Array.isArray(input) ||
           Object.keys(input).sort().join(",")!=="requirement,review,specification")
          throw new TypeError("architecture-review: exact Requirement, Specification and authored review required");
        const candidate=deriveArchitectureDescriptionFromSpecificationReview(input);
        process.stdout.write(renderArchitectureDescriptionFromSourceCut(
          candidate,{requirement:input.requirement,specification:input.specification}));
      }else if(sourceCut){
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
