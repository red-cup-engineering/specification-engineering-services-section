#!/usr/bin/env node
/**
 * Original source-qualified Engineering review → HLD receiving.
 * This command is only a bounded stdin adapter for the existing Design
 * provider; a source digest, successful projection or exit 0 is not Office
 * adoption, independent Proof, Code fabrication or Work settlement.
 */
import { receiveEngineeringHighLevelReview } from '../src/engineering-design.mjs';
import { readSourceJsonStdin } from './read-source-json-stdin.mjs';

if (import.meta.main) {
  const args=process.argv.slice(2);
  if (args.length===1 && args[0]==='--help') {
    process.stdout.write(
      'receive-engineering-high-level-review — Read one canonical JSON record ' +
      '{sources,reviewText,expectedReviewSha256,reviewedSourceCut,limits} from stdin; ' +
      'project original source-qualified HLD review through original Design receiving. ' +
      'No inference, authority, Code effect, Proof or independent acceptance.\n');
  } else if (args.length!==0) {
    process.stderr.write('receive-engineering-high-level-review: unsupported argument\n');
    process.exitCode=2;
  } else {
    try {
      const input=await readSourceJsonStdin(process.stdin);
      const required=[
        'sources','reviewText','expectedReviewSha256','reviewedSourceCut','limits'];
      if (!input || typeof input!=='object' || Array.isArray(input) ||
          Object.keys(input).length!==required.length ||
          !required.every(key=>Object.hasOwn(input,key)))
        throw new TypeError('engineering-review: exact original source review envelope required');
      const result=receiveEngineeringHighLevelReview(input);
      if(result.type==='EngineeringDesignDerivationRefusal') {
        process.stderr.write(JSON.stringify(result)+'\n');
        process.exitCode=1;
      } else {
        process.stdout.write(JSON.stringify(result)+'\n');
      }
    } catch(error) {
      process.stderr.write('engineering-review: '+error.message+'\n');
      process.exitCode=1;
    }
  }
}
