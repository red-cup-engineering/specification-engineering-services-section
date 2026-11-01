/** Typed projection of the original source-reviewed HLD, without admission. */
import type { HighLevelDesign, HighLevelDesignReview } from './engineering-design.mjs';
export interface ArchitectureTraceRow {
  readonly cell: string;
  readonly normativeClauseIds: readonly string[];
  readonly authoredPaths: readonly {
    readonly modelId: string;
    readonly clauseIds: readonly string[];
  }[];
}
export function projectHighLevelDesignReview(input: {
  readonly review: HighLevelDesignReview;
  readonly trace: { readonly rows: readonly ArchitectureTraceRow[] };
}): HighLevelDesign;
