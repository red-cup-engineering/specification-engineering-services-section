# Specification Engineering Services Section

<!-- 561-group-standards:badges:start -->
[![Red Cup Engineering](https://img.shields.io/badge/561%20Group-Red%20Cup%20Engineering-c0392b)
](https://github.com/red-cup-engineering)
[![License: MIT](https://img.shields.io/badge/license-MIT-c0392b)](LICENSE)
[![Indigenous data: CARE](https://img.shields.io/badge/Indigenous%20data-CARE-4b6f44)
](https://github.com/red-cup-engineering/.github/blob/main/GOVERNANCE.md)
[![Tips welcome](https://img.shields.io/badge/tips-welcome-d4a017)
](https://github.com/561-group/.github/blob/main/TIPS.md)
<!-- 561-group-standards:badges:end -->


Specification Engineering turns source-admitted Requirements and reviewed decisions into
**source-traceable Specification and Architecture records**, and reads proposed high- and
low-level Design without granting implementation or publication rights. The package
[manifest](package.json) currently names source edition `0.1.4`. A source edition or
passing generator test is not a released, installed, independently proved or
beneficiary-received engineering product.

The original
[Engineering four-closure Work #137](https://github.com/red-cup-engineering/engineering-services-section/issues/137)
governs the larger chain: admitted Requirements → Specification → Design (Architecture, high
level, low level) → independent Proof → Fabrication → actual consumer receiving. A
deterministic Markdown renderer is only one operation in that chain. The
[Design-profile PR #19](https://github.com/red-cup-engineering/specification-engineering-services-section/pull/19)
still holds separately qualified language and artifact profile work.

## Maintained interfaces and their owners

The package [exports](package.json) select these existing source modules; the corresponding
`scripts/` commands are stdin/stdout adapters, not separate authorities.

| Public export | Source owner | What it produces or reads |
| --- | --- | --- |
| `./specification` | [specification.mjs](src/specification.mjs) | Validated Specification record, source identity/citation checks, deterministic BCP 14 Markdown and reviewed Requirement→Specification derivation |
| `./specification-rfcxml` | [specification-rfcxml.mjs](src/specification-rfcxml.mjs) | RFCXML v3 Internet-Draft rendering of an eligible Specification |
| `./specification-readout` | [specification-readout.mjs](src/specification-readout.mjs) | Source-language BCP 14 clause readings and XML projection |
| `./architecture-description` | [architecture-description.mjs](src/architecture-description.mjs) | Source-bound ArchitectureDescriptionCandidate, exact buyer-condition trace, revision pressure and source-impact readings |
| `./engineering-design` | [engineering-design.mjs](src/engineering-design.mjs) | Source-pinned review → original HLD receiver, HLD/LLD plans and read-only Code-work targets |
| `./javascript-module-bindings` | [javascript-module-bindings.mjs](src/javascript-module-bindings.mjs) | Nonexecuting syntax observations of exact JavaScript module/export bindings |

The [Specification](data/records/schema/specification.schema.json),
[Architecture](data/records/schema/architecture-description.schema.json) and
[Design input/output](data/records/schema/plan-engineering-design.input.schema.json) schemas
are in their existing `data/records/schema/` home. Original obligations belong to those
schemas, source readers, relevant tests and authorized Requirement/Work owners—not to
explanatory paragraphs duplicated in this README.

## Public contract types, wire formats, and protocol ownership

The `./engineering-design` and `./engineering-design-review` ESM exports retain
their original JavaScript functions and their **unchanged JSON field names**.
Their `src/*.d.mts` declarations supply standard NodeNext/TypeScript types
for `DesignSourceRevision`, `DesignDerivationPlan`, `HighLevelDesignReviewProjection`,
`DesignCodeWorkReadout`, source identities and non-executable refusals. Native
runtime shape checking uses the **existing Draft 2020-12 JSON Schema** records in
`data/records/schema/`, now identified with stable `$schema`/`$id` URIs.
The reviewed-HLD and Code Work readouts are validated against their packaged
schemas before returning; neither generated TypeScript types nor JSON Schema
validation establishes behavioral proof or authorization.

The source wire format remains RFC 8259 JSON, admitted by the existing strict
canonical-JSON supplier; normative source `text` is labeled
`application/json`, while the embedded `schemaJson` documents are
`application/schema+json` (a media-type annotation, **not** implicit validation).
Those documents are separately parsed, validated and source-identified before
comparing producer and consumer contracts. Portable schemas retain the original
65,536-byte bound and now refuse oversized source **before parsing**.

**Transport authority stays with the existing host.** This module produces the
native `objective/context/outputSchema` request actually accepted by the Computer
Inference Engine; its real host owns MCP **JSON-RPC 2.0** tool transport and
Agent2Agent task delivery where configured. The existing `scripts/` are
stdin/stdout JSON adapters, not a new HTTP API. Do not rename a native inference
request into an invented OpenAPI route, wrap a non-HTTP refusal in RFC 9457
`application/problem+json`, or claim an installed protocol endpoint based on
a schema document. An authorized HTTP host must separately qualify any HTTP
operation, OpenAPI 3.1 description, authentication, error mapping and consumer.

## A reviewed HLD reuses the original receiver

\`receiveEngineeringHighLevelReview({sources,reviewText,expectedReviewSha256,reviewedSourceCut,limits})\`
is a **pure source projection** in the existing \`./engineering-design\` entrypoint,
not a new model caller, proof checker or WorkCell. It binds the original full
Requirement, Specification and Architecture text, the separately pinned source
cut from the review's author, and the exact unchanged review JSON. The review
source is identified by both its literal SHA-256 bytes and the incumbent Data
semantic NI, without treating either identity as authorization.

**ENG-20: typed review interfaces are independent source claims.** Each
`review.components[]` must author its own `provides: [{port,schemaJson}]`
and `requires: [{componentId,port,schemaJson}]`. Each `schemaJson` is
canonical-JSON-admitted and checked by the original Draft 2020-12 supplier;
a reviewed port schema is finite (at most 64 KiB), completely supplied and
reference-free because no external schema bundle or resolver has been
received. The original projector compares the original Data semantic content
identities of the *offered provider schema* and *required consumer schema*.
It refuses absent provider offers, duplicate declarations and mismatched
contracts even when names and graph edges agree. In particular, **it never
derives a provider's offered interface from another component's wishes**.
Exact schema identity is a conservative structural gluing rule, not a general
schema-subtyping theorem. A lawful nonidentical refinement needs an
independently qualified source and receiving relation, not a guessed
compatibility of names or example values. Unreceived `$ref` links are refused.

The existing HLD output still carries its original name-only `providedPorts`
and `requiredPorts` fields; the pinned `reviewText` carries the complete
reviewed contract source. A standalone HLD from the independent inference
receiver has **not** thereby acquired typed port semantics, and the HLD→LLD
and LLD→Code refinements remain separately owed. Without the original
review, an old HLD cannot be retroactively granted these guarantees.

The implementation reconstructs the original Architecture's authored trace;
calls the existing source-generated
[\`projectHighLevelDesignReview\`](src/engineering-design-review.mjs) against the
original review input schema; and sends that **deterministic output** through
the original \`receiveEngineeringDesign\` structural receiver. A missing or stale
reviewed source cut, forged/ambiguous review, clause disagreement or invalid
dependency topology cannot silently produce a candidate. Explicit finite host
limits cover review bytes, component count, required ports and trace rows.
Original host authority must establish that those limits are admissible.

The returned \`EngineeringDesignReviewProjection\` contains the original
review text and digests, source cut, deterministic design text and the same
\`EngineeringDesignCandidate\` received through the original engine.
Both carriers remain \`admitted:false\`, with independent review and Proof
\`unreceived\` and no executable Work. An Office-supplied review digest or
source revision is **not independently authenticated by this pure function**.
The LLD planner can consume the **exact reviewed HLD projection** as its fourth
source, replaying the original review, type contracts, revision and host bounds
before producing a candidate. An older unreviewed HLD with connected name-only
ports remains inspectable but is refused at the CIE inference-work boundary.
The Code Work readout retains reviewed schema identities without treating
same-schema coincidence as operational compatibility. Original Work, genuinely
unresolved LLD behavior, independent stage Proof, Code fabrication, integration
and beneficiary receiving remain separately required.

See the [source-cut integration regression](test/engineering-design-reviewed-hld.integration.test.mjs),
including exact replay, stale cuts, foreign clauses, cyclic dependency and
source/host limit refusals. Test success demonstrates only the named
source transformation, not a released or independently accepted SDLC.

## One source admission boundary

The four original Specification stdin commands—`census-specification`, `make-specification`,
`update-specification` and `derive-specification` —share
[read-source-json-stdin.mjs](scripts/read-source-json-stdin.mjs). The reader requires valid
UTF-8 within the **8 MiB** request boundary, then delegates canonical JSON admission to the
existing `@red-cup-engineering/json-services-section/canonical-json` supplier. Nested
duplicate object keys, malformed Unicode scalar escapes and invalid input refuse rather than
being silently normalized into different Requirements.

The Design source entrances apply the same strict JSON discipline. They preserve each
**literal original source text**, its exact SHA-256 cut and the separate admitted JSON
value. JSON canonicalization is not permission to rewrite the custodian's words, infer a
missing witness, treat a digest as authority or exceed the input boundary. This source
admission is tested in [source-stdin.test.mjs](test/source-stdin.test.mjs); it does not
adopt the original customer's Requirements.

The public `loadSpecificationSchema` and `loadArchitectureDescriptionSchema` functions
provide independent readback copies; consumer edits cannot change the original
internal validators. Both readers use their single source-owned committed schema,
not a second requirements dialect or a new approval authority. Separate source,
architecture and independently installed package regressions exercise this boundary.

## Specification and venue rendering

A reviewed Requirement can be interpreted into a draft with
`deriveSpecificationFromRequirementReview`. The review must explicitly carry
`reviewedRequirementRevision`, the complete original Requirement content
identity even when `cells` selects only some conditions. A missing, stale
or foreign source revision refuses; re-deriving an output digest cannot
silently transfer an old reviewer's interpretation to new source text.
This source integrity check is not reviewer authentication or proof of
Office adoption. Each normative clause retains its original
supported source condition rather than relying on the entire source document's presence as
blanket coverage. A condition marked `"inference": true` (added by an agent, not stated by
the Leader) is an engineering decision: it is reviewed and becomes a clause like any other,
and its `backedBy` stays the exact original Requirement-cell source address.
The `inference` and `leader-words` facts remain independently inspectable in that
original Requirement, never appended to a machine-readable citation key. The
engineering decision is not left open for the Leader (rule
engineering-decisions-are-made-not-deferred-to-the-leader). A rendered Specification
is a reproducible Markdown carrier with source identities, topic sections and BCP 14 clauses.
[Specification tests](test/specification.test.mjs) and
[Requirement-derivation tests](test/derive-specification.test.mjs) exercise the existing
source contract.

For IETF-style presentation, `renderSpecificationRfcXml` emits RFCXML v3 under RFC 7991 from
a Specification that supplies its explicit `rfc` block: draft identity, category, stream,
intellectual-property status, abstract, authors and references. It maps the house
introduction, BCP 14 material (RFC 2119 and RFC 8174), implementation status (RFC 7942), and
open questions to the venue's sections. The renderer refuses missing Security Considerations
or IANA Considerations topics. See [RFCXML tests](test/specification-rfcxml.test.mjs).

These two outputs are **representations of the source record**, not independent technical
review, RFC publication or standards conformance certification.

## Source-qualified Architecture

The `./architecture-description` module validates and renders an **ISO/IEC/IEEE
42010:2022-informed candidate**, not an independently admitted architecture or standards
audit. The input must already identify the original Requirement and Specification source
revisions, system, stakeholder concerns, viewpoints, views, models, correspondences and
decisions. It refuses broken cross-references, unknown identifiers, unauthored model
selections and self-claimed conformance. A stable original input and generator revision
produce stable Markdown bytes.

`deriveArchitectureDescriptionFromSpecificationReview({requirement,specification,review})`
accepts independently authored architectural choices bound to the exact original source cut;
it does **not** invent those choices. The result remains `candidate` with 42010 conformance
`unassessed`. `identity.owner` names an attributed source author, not an authenticated
governing Office.

`readRequirementArchitectureTrace(architecture,{requirement,specification})` separately
checks each exact `met-when[].cell` through a source-backed normative clause, a declared
concern, and its actual model/view/viewpoint. Missing mappings remain **untraced**. The
original public enterprise-knowledge-management RFP fixture demonstrates this distinction:
three Requirement conditions and interpreted clauses can yield **one mapped Architecture
condition and two still untraced**, without being mistaken for an implemented SharePoint,
taxonomy or citation service. The fixture is source-test evidence, not an authorized bid or
a buyer receipt. See
[architecture-description.test.mjs](test/architecture-description.test.mjs).

The [Architecture CLI](scripts/render-architecture-description.mjs) retains ordinary
rendering and explicit source-bound modes:

```sh
node scripts/render-architecture-description.mjs < architecture-candidate.json
node scripts/render-architecture-description.mjs --source-cut < original-three-stage-cut.json
node scripts/render-architecture-description.mjs --reviewed-source-cut < authored-review-source-cut.json
```

Each source-cut mode verifies its own required input; a whole-document identity or loose
document similarity cannot substitute for cell-to-clause-to-model trace.

## HLD, LLD and Code-work readout

`planEngineeringDesign({stage,sources})` and
`receiveEngineeringDesign({stage,sources,plan,deliveryText})` belong to the existing
`./engineering-design` export. High-level Design requires the complete original Requirement,
Specification and Architecture texts. Low-level Design additionally requires the exact
previously source-received HLD. The plan binds an exact source cut and request; an
independently authorized inference provider supplies `deliveryText`. Receiving the response
checks stage, trace, authored model witnesses and allocation, but always leaves
`admitted:false` and `proof:"unreceived"`.

`readEngineeringDesignInferenceWork(plan)` is **the original Design→Computer
Inference Engine work-request boundary**, not an alias for the read-only plan.
It replays the exact original Requirement, Specification, Architecture and HLD
source cut, including the already source-admitted
`readRequirementArchitectureTrace().sourceVerification` inventory. When any
selected normative Specification clause lacks an independently authored
`clause.test` declaration, it returns an immutable
`EngineeringDesignInferenceWorkRefusal` with original stage/source digests,
the precise missing clause IDs, and `inferenceSubmitted:false`; **it does not
return a CIE-submittable work request**. A fully declared but unexecuted set
may be projected into the original strict CIE request after host qualification;
declaration alone neither proves the tests exist nor authorizes procurement,
effectful Work, payment, independent Proof or an accepted implementation.
There is no caller override or fallback to another inference API. This is the
first source-qualification gate before potential provider cost, not a fifth
Engineering closure.

An LLD `operations[].module` is a prospective canonical `src/...mjs` path. It cannot include
NUL, unpaired Unicode surrogates or a decomposed spelling that is not NFC-stable. Do not
silently rename an old candidate and keep its prior Design identity; receive it again from
the original source cut. The shape check does not prove a file or export exists.

`readEngineeringCodeWork` reconstructs the original source-received Design from its plan and
**exact provider-delivered JSON** before projecting a Code target. Each supplied source view
must identify `{owner,path,text,expectedSha256}`; the identity is **(original HLD component
owner, module path)**, never the file path alone. Duplicate, foreign, ownerless,
digest-disagreeing or over-budget views refuse. The incumbent boundary is **2,097,152 UTF-8
bytes and 64 module views**. Its `designCarrierId` is the existing Data
`semanticIdOf('metroplat.artifact')` identity over the received candidate—not the raw
delivery SHA-256 and not a signed approval.

The nonexecuting `indexJavaScriptModuleBindings(sources,{maxBytes,maxModules})` parser
reports `observed`, `absent`, `unknown` or `contested` for a source-identified export.
Direct exports, re-exports, namespace bindings and export-star paths retain their original
module identity; conflicting export-star targets remain contested, while absent source,
unsupported paths and unresolved cycles remain unknown. The reader never executes submitted
JavaScript. `CODE_EXPORT_NOT_OBSERVED` and `CODE_EXPORT_CONTESTED` distinguish the
corresponding failures; syntactic observation is not behavioral Proof. The parser is
`@red-cup-engineering/javascript-parser-service@0.1.0`; it does **not** supply Guile Scheme
analysis or close
[PR #19](https://github.com/red-cup-engineering/specification-engineering-services-section/pull/19).

The existing Requirement-review derivation now permits an independently authored
`interpretations[].test` for any original condition, using the already defined
`Specification.clause.test` field. A test declaration is bounded, single-line,
source-versioned, and **never executed** by the generator. Existing Specifications
without a declared test are still drafts, not silently given new cases.

The same existing Design → Code readout reports
`targets[].testObligations.sourceVerification` per original Requirement-cell and
Specification-clause pairing. Each row carries the exact source-authored `test` or
`null`; its state is `declared-unverified` or
`verification-test-not-declared`. These states are preconditions for an
independent test receiver, **not** executable tests, Code fabrication, Proof,
release admission or beneficiary acceptance. Revisions to normative test
declarations invalidate the original exact Architecture/HLD/LLD source cut.

Projected `targets[].originalTrace` rows retain the exact original Requirement
`sourceTarget` (`held` or `denied`) alongside the cell ID, Specification clauses
and Architecture models. This is a desired evidence target, **not** an observed
positive/negative witness; the source reviewer still owns the normative BCP14
interpretation and the real test receiver owns executed verification.

Projected targets retain original Requirement cells, Specification clauses, Architecture
models, input/output schemas, preconditions, effects, errors and verification obligations.
Even with source present, the status remains `source-present-unassayed`; the flags
`originalDesignAdmitted:false`, `executableWork:false`, `codeApplied:false`,
`beneficiaryReceived:false` and `independentProof:unreceived` are not upgraded by a
syntactic match. No new WorkCell, model provider, file write, source maker or release is
created here.

## Reading Requirement changes without recreating Work

`readRequirementRevisionPressure(before,after)` accepts two complete original Requirements
with the **same source-owned identity**. It distinguishes changed original text, accepted
conditions, speakers, ordering and exact EAVT content addresses. It can signal that
downstream source requalification or regeneration is required, but it neither creates a new
Requirement nor retroactively adopts the change. The Architecture CLI exposes this early
reading through `--requirement-pressure`.

`readRequirementArchitectureImpact(before,after)` is **different**: it accepts two
independently qualified complete {Requirement, Specification, Architecture} triples and
compares exact source and stage revisions, original conditions, normative clause identities
**and contents**, and model/view mappings. Its `--source-impact` CLI mode distinguishes
`regenerate-and-requalify` from `requalify-source-only`. Changed source identity can require
requalification without justifying regeneration of unchanged logic. The Architecture
impact reader **reuses the same original Requirement revision-pressure verdict**:
changed whole-Requirement `asks` (buyer purpose) or original condition ordering
requires renewed regeneration across the selected source domain; changed metadata
about the origin of one selected condition regenerates only that responsibility.
The existing `Specification.clause.test` is a separate, independently authored
verification declaration: adding, replacing or removing that test requires
source and test requalification, but **not** regeneration of unchanged Code.
Its declaration is neither an executed test nor evidence of behavioral Proof.
Changes to normative actor, keyword, statement, source mappings or architecture
models continue to demand the corresponding implementation regeneration.
Changes confined to **excluded** conditions, or source-level provenance alone,
require complete source requalification without manufacturing unrelated Code
work. Each reason remains source-addressed and unreceived; a change-impact
report is neither a maker command nor authorization to spend, merge or accept.
Both readouts have no effect on original Work, rights, Proof or the beneficiary. See
[revision-pressure tests](test/requirement-revision-pressure.test.mjs) and
[the independent packed consumer](test/requirement-revision-packed-consumer.mjs).

The original Moneyday Design-generator work order remains
[here](data/records/service-records/fabrication-work-order-service-records/moneyday-design-generators.work-order.md).
A change report is not a substituted customer decision; its original Requirement Office and
recipient still owe the actual admission and receiving.

## Reproducible source qualification is not settlement

The [native receiving workflow](.github/workflows/specification-native-receiving.yml) runs
the original Node 24 tests and separately installed package consumers, packs the same source
twice into byte-identical npm archives, checks `SHA256SUMS` and retains the consumer-tested
archive for its configured artifact period. Its separate least-privileged attestation job
authenticates the **actual archive bytes, repository, signer workflow and commit** using
GitHub's Sigstore-backed attestation and an adversarial changed-archive control.

```sh
gh attestation verify ./specification-engineering-services-section.tgz \
  --repo red-cup-engineering/specification-engineering-services-section \
  --signer-workflow red-cup-engineering/specification-engineering-services-section/.github/workflows/specification-native-receiving.yml
```

Substitute the actual downloaded archive path above, not an invented published filename. The
signed statement is a provenance claim for the tested source artifact. It is **not** Stage
Proof, a SLSA Build Level 3 assessment, npm release, installed Bare Cedar Fog or MetroPlat
operation, SignChain institutional receipt, or independent customer acceptance. The original
Engineering
[#137](https://github.com/red-cup-engineering/engineering-services-section/issues/137),
source owners and affected buyers retain each distinct remaining obligation.
