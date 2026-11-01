/**
 * Public, effect-free Engineering Design contracts.
 * The runtime implementation remains in engineering-design.mjs.
 *
 * This is a TypeScript declaration of the EXISTING JSON carriers, not a
 * replacement serialization or a grant of execution / review / Proof.
 * JSON Schema Draft 2020-12 is the canonical wire vocabulary.
 */
export type DesignStage = 'high-level' | 'low-level';
export type SourceKind = 'requirement' | 'specification' | 'architecture' | 'high-level';
export type Sha256Digest = `sha256:${string}`;
export type SemanticContentId = `ni:///sha-256;${string}`;
export type JsonSchema = boolean | Record<string, unknown>;
export type DesignProofStatus = 'unreceived';

export interface DesignSourceInput {
  readonly kind: SourceKind;
  readonly text: string;
}
export interface DesignSourceRevision extends DesignSourceInput {
  readonly digest: Sha256Digest;
}
export interface DesignSourceReference {
  readonly kind: SourceKind;
  readonly digest: Sha256Digest;
}
export interface RequirementTrace {
  readonly requirementCellId: string;
  readonly specificationClauseIds: readonly string[];
  readonly architectureModelIds: readonly string[];
  readonly designElementIds: readonly string[];
}
export interface DesignComponent {
  readonly id: string;
  readonly owner: string;
  readonly layer: 'data' | 'code' | 'networking' | 'systems';
  readonly responsibility: string;
  readonly dependencyIds: readonly string[];
  readonly providedPorts: readonly string[];
  readonly requiredPorts: readonly string[];
}
export interface ComponentConnection {
  readonly fromComponentId: string;
  readonly toComponentId: string;
  readonly port: string;
}
export interface HighLevelDesign {
  readonly components: readonly DesignComponent[];
  readonly connections: readonly ComponentConnection[];
  readonly traceability: readonly RequirementTrace[];
  readonly openQuestions: readonly string[];
}
export interface DesignOperation {
  readonly id: string;
  readonly componentId: string;
  /** Prospective relative POSIX module path; not a repository identity. */
  readonly module: string;
  readonly exportName: string;
  /** Draft 2020-12 JSON Schema sources, not validated runtime values. */
  readonly inputSchemaJson: string;
  readonly outputSchemaJson: string;
  readonly behavior: string;
  readonly preconditions: readonly string[];
  readonly postconditions: readonly string[];
  readonly failureCases: readonly string[];
  readonly resourceBounds: readonly string[];
  readonly effectBoundaries: readonly string[];
  readonly acceptanceObligations: readonly string[];
}
export interface LowLevelDesign {
  readonly operations: readonly DesignOperation[];
  readonly traceability: readonly RequirementTrace[];
  readonly openQuestions: readonly string[];
}
export interface DesignCandidate {
  readonly type: 'EngineeringDesignCandidate';
  readonly stage: DesignStage;
  readonly sources: readonly DesignSourceRevision[];
  readonly design: HighLevelDesign | LowLevelDesign;
  readonly admitted: false;
  readonly proof: DesignProofStatus;
}
export interface DesignDerivationRefusal {
  readonly type: 'EngineeringDesignDerivationRefusal';
  readonly reason: 'invalid-review' | 'invalid-design' | 'source-cut-mismatch';
}
export interface DesignDerivationPlan {
  readonly type: 'EngineeringDesignDerivationPlan';
  readonly stage: DesignStage;
  readonly sources: readonly DesignSourceRevision[];
  readonly request: {
    readonly taskClass: 'code-fabrication';
    readonly objective: string;
    readonly messages: readonly {
      readonly role: 'system' | 'user';
      readonly content: string;
    }[];
    readonly schema: Record<string, unknown>;
    readonly requiredCapabilities: readonly ['text-output'];
  };
}

export interface ReviewedPortOffer {
  readonly port: string;
  /** The source-owned JSON Schema document, not a network payload. */
  readonly schemaJson: string;
}
export interface ReviewedPortRequirement extends ReviewedPortOffer {
  readonly componentId: string;
}
export interface HighLevelDesignReviewComponent {
  readonly id: string;
  readonly owner: string;
  readonly layer: DesignComponent['layer'];
  readonly responsibility: string;
  readonly provides: readonly ReviewedPortOffer[];
  readonly requires: readonly ReviewedPortRequirement[];
  readonly specificationClauseIds: readonly string[];
}
export interface HighLevelDesignReview {
  readonly components: readonly HighLevelDesignReviewComponent[];
  readonly openQuestions: readonly string[];
}
export interface HighLevelDesignReviewBounds {
  readonly maxReviewBytes: number;
  readonly maxComponents: number;
  readonly maxRequirements: number;
  readonly maxTraceRows: number;
}
export interface HighLevelDesignReviewProjection {
  readonly type: 'EngineeringDesignReviewProjection';
  readonly version: 1;
  readonly originalReview: {
    readonly expectedSha256: Sha256Digest;
    readonly semanticId: SemanticContentId;
    readonly bytes: number;
  };
  readonly reviewText: string;
  readonly sourceCut: readonly DesignSourceReference[];
  readonly deliveryText: string;
  readonly candidate: DesignCandidate & { readonly stage: 'high-level'; readonly design: HighLevelDesign };
  readonly limits: HighLevelDesignReviewBounds;
  readonly admitted: false;
  readonly independentReview: 'unreceived';
  readonly proof: DesignProofStatus;
  readonly executableWork: false;
}
export interface DesignInferenceWorkRefusal {
  readonly type: 'EngineeringDesignInferenceWorkRefusal';
  readonly reason: 'source-verification-procedures-not-declared' | 'hld-reviewed-interface-contract-unreceived';
  readonly stage: DesignStage;
  readonly originalRequirementId: string;
  readonly sourceCut: readonly DesignSourceReference[];
  readonly sourceVerification?: {
    readonly scope: string;
    readonly clauseCount: number;
    readonly declaredTestCount: number;
    readonly missingClauseIds: readonly string[];
  };
  readonly inferenceSubmitted: false;
  readonly executableWork: false;
  readonly independentProof: DesignProofStatus;
}
/** Existing CIE native request (MCP transport belongs to the CIE host). */
export interface DesignInferenceWorkRequest {
  readonly objective: string;
  readonly context: string;
  readonly contextOptimization: { readonly mode: 'exact' };
  readonly taskClass: 'code-fabrication';
  readonly outputSchema: Record<string, unknown>;
  readonly enforceProviderSchema: true;
  readonly requiredCapabilities: readonly ['json-schema-output'];
}
export interface CodeSourceView {
  readonly owner: string;
  readonly path: string;
  readonly text: string;
  readonly expectedSha256: Sha256Digest;
}
export type CodeSourceStatus = 'source-not-observed' | 'source-cut-disagreement' | 'source-present-unassayed';
export interface ReviewedPortContract {
  readonly port: string;
  readonly schemaJson: string;
  readonly schemaIdentity: SemanticContentId;
  readonly componentId?: string;
}
export interface ReviewedComponentPortContracts {
  readonly reviewSha256: Sha256Digest;
  readonly provided: readonly ReviewedPortContract[];
  readonly required: readonly ReviewedPortContract[];
}
export interface CodeWorkTarget {
  readonly operationId: string;
  readonly componentId: string;
  readonly originalComponentOwner: string;
  readonly module: string;
  readonly exportName: string;
  readonly sourceStatus: CodeSourceStatus;
  readonly observedSha256: Sha256Digest | null;
  readonly expectedSha256: Sha256Digest | null;
  readonly bindingObservation: Record<string, unknown> | null;
  readonly reviewedPortContracts: ReviewedComponentPortContracts | null;
  readonly originalTrace: readonly (RequirementTrace & { readonly sourceTarget: 'held' | 'denied' })[];
  readonly interface: { readonly inputSchema: JsonSchema; readonly outputSchema: JsonSchema };
  readonly testObligations: Record<string, unknown> & { readonly status: 'unreceived' };
}
export interface DesignCodeWorkReadout {
  readonly type: 'EngineeringDesignCodeWorkReadout';
  readonly version: 1;
  readonly designCarrierId: SemanticContentId;
  readonly sourceCut: readonly DesignSourceReference[];
  readonly codeSnapshotScope: 'supplied-target-views-only';
  readonly status: 'source-disagreement' | 'source-present-unassayed';
  readonly targets: readonly CodeWorkTarget[];
  readonly discrepancies: readonly {
    readonly code: string; readonly operationId: string;
    readonly module: string; readonly detail: string;
  }[];
  readonly sourceVerification: {
    readonly scope: string; readonly status: string;
    readonly clauseCount: number; readonly declaredTestCount: number;
    readonly missingClauseIds: readonly string[];
  };
  readonly hldPortSource:
    | { readonly status: 'name-only-unreviewed' }
    | { readonly status: 'reviewed-source-replayed-unadmitted'; readonly reviewSha256: Sha256Digest; readonly semanticId: SemanticContentId };
  readonly originalDesignAdmitted: false;
  readonly independentProof: DesignProofStatus;
  readonly executableWork: false;
  readonly codeApplied: false;
  readonly beneficiaryReceived: false;
}
export function planEngineeringDesign(input: {
  readonly stage: DesignStage;
  readonly sources: readonly DesignSourceInput[];
}): DesignDerivationPlan;
export function readEngineeringDesignInferenceWork(
  plan: DesignDerivationPlan
): DesignInferenceWorkRefusal | DesignInferenceWorkRequest;
export function receiveEngineeringDesign(input: {
  readonly stage: DesignStage;
  readonly sources: readonly DesignSourceInput[];
  readonly plan: DesignDerivationPlan;
  readonly deliveryText: string;
}): DesignCandidate | DesignDerivationRefusal;
export function receiveEngineeringHighLevelReview(input: {
  readonly sources: readonly DesignSourceInput[];
  readonly reviewText: string;
  readonly expectedReviewSha256: Sha256Digest;
  readonly reviewedSourceCut: readonly DesignSourceReference[];
  readonly limits: HighLevelDesignReviewBounds;
}): HighLevelDesignReviewProjection | DesignDerivationRefusal;
export function readEngineeringCodeWork(input: {
  readonly designCandidate: DesignCandidate & { readonly stage: 'low-level'; readonly design: LowLevelDesign };
  readonly originalPlan: DesignDerivationPlan;
  readonly originalDeliveryText: string;
  readonly sourceViews: readonly CodeSourceView[];
}): DesignCodeWorkReadout;
