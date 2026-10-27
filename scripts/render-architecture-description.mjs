#!/usr/bin/env node
import {
  renderArchitectureDescriptionMarkdown,validateArchitectureDescriptionRecord,
  renderArchitectureDescriptionFromSourceCut, readRequirementArchitectureImpact,
} from "../src/architecture-description.mjs";
import { readSourceJsonStdin } from "./read-source-json-stdin.mjs";

if (import.meta.main) {
  if (process.argv.includes("--help")) {
    process.stdout.write("render-architecture-description [--source-cut | --source-impact] — Normal render reads one ArchitectureDescriptionCandidate. --source-cut renders a source-verified {requirement,specification,architecture}. --source-impact accepts {before:{requirement,specification,architecture},after:{requirement,specification,architecture}} and returns deterministic JSON for stage requalification (no execution, proof, permission or customer acceptance).\n");
  } else {
    const flags=process.argv.slice(2);
    const sourceCut=flags.includes("--source-cut");
    const sourceImpact=flags.includes("--source-impact");
    const invalid=flags.length>1 || flags.some(arg=>
      !["--source-cut","--source-impact"].includes(arg)) ||
      (sourceCut && sourceImpact);
    if(invalid) {
      process.stderr.write("render-architecture-description: unsupported argument\n");
      process.exitCode=2;
    }else{
      const input=await readSourceJsonStdin(process.stdin);
      // Both source-cut routes share the original bounded, fatal-UTF8 input
      // reader. Values outside the exact three source owners cannot introduce
      // acceptance flags, new rights or requested source effects.
      const isExactCut=value=>value && typeof value==="object" &&
        !Array.isArray(value) &&
        Object.keys(value).sort().join(",")==="architecture,requirement,specification";
      if(sourceImpact){
        if(!input || typeof input!=="object" || Array.isArray(input) ||
           Object.keys(input).sort().join(",")!=="after,before" ||
           !isExactCut(input.before) || !isExactCut(input.after))
          throw new TypeError("source-impact requires exact before/after source-cut triples");
        process.stdout.write(JSON.stringify(readRequirementArchitectureImpact(
          input.before,input.after))+"\n");
      }else if(sourceCut){
        // This route consumes three ORIGINAL source objects. Never synthesize
        // missing normative decisions, stakeholder authority, or source bytes.
        if(!isExactCut(input))
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
