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
[manifest](package.json) currently names source edition `0.1.3-dev.1`. A source edition or
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

## A reviewed HLD reuses the original receiver

\`receiveEngineeringHighLevelReview({sources,reviewText,expectedReviewSha256,reviewedSourceCut,limits})\`
is a **pure source projection** in the existing \`./engineering-design\` entrypoint,
not a new model caller, proof checker or WorkCell. It binds the original full
Requirement, Specification and Architecture text, the separately pinned source
cut from the review's author, and the exact unchanged review JSON. The review
source is identified by both its literal SHA-256 bytes and the incumbent Data
semantic NI, without treating either identity as authorization.

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
The existing LLD planner may consume the unchanged HLD candidate as its
fourth source; original Work, native inference for genuinely unresolved LLD,
independent stage Proof, Code fabrication, integration and beneficiary receiving
remain separately required.

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

## Specification and venue rendering

A reviewed Requirement can be interpreted into a draft with
`deriveSpecificationFromRequirementReview`. Each normative clause retains its original
supported source condition rather than relying on the entire source document's presence as
blanket coverage. A rendered Specification is a reproducible Markdown carrier with source
identities, topic sections and BCP 14 clauses.
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
requalification without justifying regeneration of unchanged logic. Both readouts have no
effect on original Work, rights, Proof or the beneficiary. See
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
