# @red-cup-engineering/specification-engineering-services-section

<!-- 561-group-standards:badges:start -->
[![Red Cup Engineering](https://img.shields.io/badge/561%20Group-Red%20Cup%20Engineering-c0392b)](https://github.com/red-cup-engineering)
[![License: MIT](https://img.shields.io/badge/license-MIT-c0392b)](LICENSE)
[![Indigenous data: CARE](https://img.shields.io/badge/Indigenous%20data-CARE-4b6f44)](https://github.com/red-cup-engineering/.github/blob/main/GOVERNANCE.md)
[![Tips welcome](https://img.shields.io/badge/tips-welcome-d4a017)](https://github.com/561-group/.github/blob/main/TIPS.md)
<!-- 561-group-standards:badges:end -->

Fabricates Specification records from journaled rulings and semantic-record-journal rows into topic-sectioned, BCP14-clause Markdown carriers, never handwritten.

## Source-bound HLD and LLD candidate generation

The existing `./engineering-design` public export supplies
`planEngineeringDesign({stage, sources})` and
`receiveEngineeringDesign({stage, sources, plan, deliveryText})`.
`stage` is `high-level` or `low-level`. The first stage requires **the
complete original** `requirement`, `specification` and `architecture`
source texts; the second additionally requires the exact previously received
`high-level` candidate. The plan carries the original text/identity and a
source-pinned inference request; a separately authorized provider supplies
the JSON `deliveryText`. The receiving function checks that proposal against
the exact plan and source cut and returns a typed refusal or an
`EngineeringDesignCandidate`.

A structurally received candidate retains `admitted:false` and
`proof:"unreceived"`. The source reader refuses a changed original Requirement
or Specification revision, a foreign Architecture model, a normative clause
without an authored model witness, a design row whose selected models do not
cover its claimed clauses, and an LLD that revises its HLD allocation without
a new upstream design. No inference operation, proof authority, filesystem
write, accepted Work or release is granted by this exported module.

The LLD `operations[].module` is a **prospective source file name**, not
an arbitrary model label. In addition to its already required canonical POSIX
`src/...mjs` shape, it must contain no NUL and be well-formed UTF-16
(therefore a single stable UTF-8 spelling on materialization). The receiver
refuses unpaired high/low surrogates without rewriting or normalizing the
model's proposal. Valid paired Unicode characters remain permitted. This
source-format gate makes no assertion that a target file or export exists.

**Migration:** Older unadmitted Design candidates containing a NUL or
unpaired surrogate module path cannot be grandfathered into Code fabrication.
Reissue an LLD with a usable original-source-bound module spelling and
repeat independent Design receiving and Proof. Do not silently replace its
path while preserving an old source/revision identity.

The original generation Work is recorded in
`data/records/service-records/fabrication-work-order-service-records/moneyday-design-generators.work-order.md`;
the original receiving candidate is in the neighboring
`fabrication-receiving-service-records`. Those are source and acceptance
records, not proof that the Moneyday buyer received an operating repair.
See the original Engineering four-closure [issue #137](https://github.com/red-cup-engineering/engineering-services-section/issues/137)
for the source-to-Design/Proof/maker/operation obligations.

## Source-bound LLD to Code Work readout

The original engineering-design public export now includes
**readEngineeringCodeWork**. It consumes one incumbent LLD
EngineeringDesignCandidate, the **original derivation plan**, the **exact
original provider-delivered Design JSON**, and bounded source views of the
Code modules addressed by that LLD. It reuses the original
receiveEngineeringDesign function to reconstruct the same source-received
candidate. A mutated candidate, foreign plan, changed normative clause,
stale Architecture/HLD allocation, false adoption or forged Proof status
refuses before any Code Work is projected.

Each source view is an exact {path, text, expectedSha256} declaration from
the original Code custodian. Its raw UTF-8 digest is independently computed
and compared with that supplied expectation. Only module paths named in
the LLD are allowed, no duplicates; the complete supplied view is capped
at 2 MiB. This verifies correspondence **within the supplied source cut**.
It does not authenticate GitHub checkout ownership, prove the file actually
exports the named function, test runtime behavior, or establish source
completeness. Missing from a supplied view means "not observed", not
"does not exist in the repository."

The typed EngineeringDesignCodeWorkReadout provides a bounded, deterministic
Code work target for each source-traced LLD operation: the exact prospective
module/export pair, observed source digest, inherited original Requirement
cells / Specification clauses / Architecture models, parsed input/output
JSON Schemas, preconditions, behavior, failure and resource/effect bounds,
and unchanged independently **unreceived** test and acceptance obligations.
The discrepancy codes SOURCE_VIEW_NOT_RECEIVED and
SOURCE_DIGEST_DISAGREEMENT identify genuine failures of the supplied cut.
Even with every source present, the status is only
source-present-unassayed. The result is deeply immutable.

The reader cannot create another WorkCell registry or scheduler, choose
an inference provider, write a module, synthesize behavioral assertions from
unqualified prose, authenticate a model delivery, spend resources or settle a
customer obligation. The flags originalDesignAdmitted, executableWork,
codeApplied and beneficiaryReceived remain false; independentProof remains
unreceived. The original Engineering, Code, Work, Sign and Enterprise owners
must independently qualify revision-pinned Proof, verify exports and behavior
in an isolated assay, and admit effects and actual consumer receiving.

Native regression tests use the actual Requirement→Specification→Architecture
→HLD→LLD source fixture and cover correct trace, changed source digest,
unprovided/extra source, fabricated Design mutation, prototype/Unicode and
source budget boundaries, and several Code operations in one module. The
existing packed-consumer test imports the new reader through the public
engineering-design export from a clean independently installed package, not
from the local source tree. These tests qualify a source-producing readout,
not delivered working software.

## Reproducible source-candidate qualification

Source changes and **shipped README changes** run the original native Node 24
suite, historical source regressions, npm packaging, and a clean independent
installation exercising the public Specification/Architecture/HLD/LLD APIs.
The same checks also run on merged main source, not only PR previews. The CI
job packs the candidate twice from the same source, requires byte-identical
archives, creates and verifies `SHA256SUMS`, and retains the exact
consumer-tested tarball plus checksum for 30 days in its Actions artifact.
A different source commit must earn its own source-qualified checksum.

To run the source checks in a qualified Node 24 checkout, resolve the declared
dependencies from the original approved registry and run `npm test`. The
CI-installed consumer uses `npm pack --ignore-scripts`, an independent
`npm install` of that archive, and the package's actual exported APIs.
The SHA-256 checksum by itself proves only local archive integrity.
The original qualification workflow additionally sends that **same** tested
archive, after all native and independently installed consumer checks pass, to
a separate least-privileged attestation job. The second job verifies the
downloaded SHA256SUMS and expected installed Design module, asks GitHub's
Sigstore-backed `actions/attest` for a signed SLSA v1 provenance statement
and independently checks the artifact's **real bytes**, repository,
specific signer workflow, exact commit and GitHub-hosted runner using
`gh attestation verify`. An independently modified tarball is the negative
control and must refuse. Both jobs must pass for source qualification.

After retrieving the original GitHub Actions tarball, its independent consumer
can verify the signed provenance without trusting our text record:

```sh
gh attestation verify ./red-cup-engineering-specification-engineering-services-section-0.1.2.tgz \\
  --repo red-cup-engineering/specification-engineering-services-section \\
  --signer-workflow red-cup-engineering/specification-engineering-services-section/.github/workflows/specification-native-receiving.yml
```

The unsigned checksum file is still provided for offline integrity comparison;
the signed attestation is held by GitHub, and the verification command checks
GitHub's trusted signing certificate and authenticated subject digest. Check
the source commit/ref in the resulting statement before adoption. A signed
source/build claim is **not** an independently accepted Design proof, a SLSA
Build Level 3 assessment, immutable npm registry publication, a successful
Bare Cedar Fog host installation or recipient benefit. The owner of SignChain
retains institutional evidence-chain integration rather than treating this
external attestation as a replacement for source-owned Work.



## Deterministic architecture-description projection (source proposal)

This package also projects an **ArchitectureDescriptionCandidate** record into a reproducible, **ISO/IEC/IEEE 42010:2022-informed** Markdown architecture description. The source schema is [`data/records/schema/architecture-description.schema.json`](data/records/schema/architecture-description.schema.json), the pure-ish read/validation/rendering surface is exported as `./architecture-description`, and the stdin→stdout CLI is `scripts/render-architecture-description.mjs`.

The record must *already* contain original requirement/specification source identities and revisions, system, stakeholders, concerns, viewpoints, views, models, correspondences, decisions and rationales. The renderer checks source/ID references and concern/view/model correspondence, rejects unknown identifiers and self-claimed conformance, sorts semantically unordered records, and uses **no model inference, implicit timestamp or live data lookup**. The same input and generator revision give identical Markdown bytes. Missing data is a refusal addressed to its original source owner, not an invitation to hallucinate material to fill a template.

**Precise scope:** This is an architecture *description* candidate generator, **not** an architect, a proof of source→design refinement, an ISO 42010:2022 audit, the high-/low-level design generator, a pre-fabrication Proof receipt or an installed end-to-end `engineering()` operation. The existing historical 2011-edition review does not establish 2022 conformance. Those different effects remain separately owed by the [original Engineering Work #137](https://github.com/red-cup-engineering/engineering-services-section/issues/137) and its [source PR #138](https://github.com/red-cup-engineering/engineering-services-section/pull/138). The proof gate is mandatory **before effectful Fabricating**, after Design(Architecture → High-level → Low-level).

In a package-equipped Node environment:

```sh
node scripts/render-architecture-description.mjs < admitted-architecture-candidate.json > architecture-description.md
node --test test/architecture-description.test.mjs
```

**Packaging correction:** Both `specification.schema.json` (already read by the existing specification renderer) and `architecture-description.schema.json` are now included in the package's `files` whitelist. Original independent Node 24 checks now exercise the full source suite, a real packed archive, both schemas and a separately installed consumer's architecture-description import; the resulting candidate is still not a deployed Engineering closure or standards certificate. Four source JSON stdin commands share one byte-preserving, fatal UTF-8, **8 MiB maximum input** reader and refuse invalid/oversized requests before writing any product. No accepted customer or native release is inferred.

## Source-cut Requirements traceability: exact buyer condition to architecture model

A valid whole-document source revision, a Specification clause, and a model
addressing another Architecture concern do not mean the original buyer
condition was designed. An external enterprise-KM RFP can demand permissioned
source-cited answers, governed taxonomy and SharePoint term-store publishing
as independent deliverables; sourcing the whole RFP at the System level
must not falsely imply all three have an architecture implementation.

The ORIGINAL architecture-description module now exports
readRequirementArchitectureTrace(architecture,{requirement,specification})
alongside existing full source-cut validation and renderer. It builds
the complete deterministic trace from each original Requirement
met-when[].cell through the **exact source-backed** Specification
clauses[].backedBy generated by the original deriveSpecificationFromRequirementReview,
to an **explicit** Architecture concern.requirementCellIds and
concern.specificationClauseIds pair, and through its existing model,
view and governing viewpoint. The model must genuinely address that concern
in the original Architecture graph. Neither concern nor model proves
working code, permission rights or buyer acceptance.

Both concern arrays must exist, refer to the actual source-cut Requirement
and Specification, and concern.sourceIds must name both original stage
sources. Every selected buyer cell needs a selected Specification clause
that backs exactly that cell, and every declared clause must back at least
one selected cell. Foreign buyer cells, cross-work substitution, missing
source stages, stale revisions, speculative matches and inconsistent rows
are rejected. A source-only system/view citation **never** establishes
per-clause mapping. Optional mapping fields can be absent so historical
architectures remain readable, but those original cells remain explicitly
untraced, rather than counted as qualified architecture.

The existing native CLI accepts an opt-in complete source-cut input:

    node scripts/render-architecture-description.mjs --source-cut < three-sources.json > source-trace.md

The input is one typed JSON object containing exactly requirement,
specification and architecture, each acquired and authorized independently.
The same original 8-MiB UTF-8 byte reader applies. The normal architecture
description is followed by a **complete original buyer-cell trace**
(not a 42010/29148 certification), retaining exact normative clause IDs,
authored concern/model/view paths and untraced source cells. The ordinary
bare architecture-input CLI remains compatible.

**Real source test:** The public
[NYPA Q26-7821RJM knowledge management RFP](https://rfp.nypa.gov/)
Attachment 1 sections 2.1–2.2 separately demands permission-respecting
citation answers, governed ontology and SharePoint model publication.
The existing original source suite models all three as unadmitted source
conditions, explicitly reviews three clauses, and maps ONLY the first to
a candidate rights-related architecture model. It reports **1/3 authored
model mappings, 2/3 not yet architected**, even though all three clauses
were interpreted. This does not authorize an NYPA bid, imply implemented
SharePoint connectors, qualify current vendor references/insurance,
establish independent Engineering Proof, produce purchased customer work,
or generate revenue. Current NYPA Ariba registration and addenda are the
original Opportunity/Coesite seller's separate responsibilities.

Formal correspondence in these source stages is analogous to a restricted
local gluing question, but it is **not** an Obsmetrologia theorem about
generated Kinematic Space, L-Space fibers or hypertensor sections. Those
require source-derived occurrence-pair incidence, genuine cover/restriction,
gluing and kernel-qualified proof. A documentary association must not
be promoted to full sheaf mathematics, Gotham-equivalent authorization,
or tested Asana/Jira workflow. Native Node/package receiving and actual
original Engineering design/proof/customer acceptance remain distinct.

## Requirement → reviewed Specification → generated Architecture candidate

The original Engineering Requirement
[`requirements-generate-specifications-designs-and-normative-code`](https://github.com/red-cup-engineering/engineering-services-section/blob/main/data/records/service-records/requirements-management-service-records/requirements-generate-specifications-designs-and-normative-code.json)
requires Architecture artifacts to be generated from the original admitted
Requirement and Specification, rather than copying stage digests into an
unattributed prose draft. The existing `./architecture-description` now
exports `deriveArchitectureDescriptionFromSpecificationReview({requirement,
specification,review})`. The new entry to the existing bounded CLI is:

```sh
node scripts/render-architecture-description.mjs --reviewed-source-cut \
  < requirement-specification-authored-review.json > architecture-candidate.md
```

The single input object has exactly `requirement`, `specification`, `review`.
The review is *authored architectural data* with exactly
`identity: {id,title,owner}`, `sourceCut: {requirementRevision,specificationRevision}`,
`applicability`,
`system: {name,description,supportingSourceIds?}`,
`supportingSources: [{id,locator,revision},...]`,
`stakeholders`, `concerns`, `viewpoints`, `views`, `models`,
`correspondences`, `decisions` and `openQuestions`—the original
Architecture graph arrays, **not** a new stage ledger. The review must itself identify the exact source cut it was authored against;
the derived output binds `req` and `spec` to the *actual* content identities,
rejecting stale
Specification lineage, unsupported review fields, unauthored architectural
decisions, missing model references, mismatched buyer cells and foreign
normative clauses. Reviewer status/approval, revision hashes, Proof and
conformance fields cannot be supplied: revision identity is derived from the
source cut and review; the existing schema fixes status at `candidate` and
42010:2022 conformance at `unassessed`. The original exact buyer-cell trace
still reports **untraced** obligations instead of counting them as satisfied.
No operating rights are inferred from `identity.owner`; the original custodian
must authenticate the reviewer separately.

This changes a real source-to-stage projection, not whether architectural
choices exist. A reviewer must still furnish appropriate stakeholder concerns,
models, decisions and source references; a deterministic renderer cannot decide
architecture or make a source reviewer legitimate. Neither this method nor a
green source/package test closes Engineering #137: HLD, LLD, independent
pre-fabrication Proof, original maker effect, installed operation and independent
beneficiary acceptance remain separate gates.

## Renderings

One record, two carriers:

- `renderSpecificationMarkdown` (`./specification`, `scripts/render-specification.mjs`)
  writes the house Markdown carrier.
- `renderSpecificationRfcXml` (`./specification-rfcxml`,
  `scripts/render-specification-rfcxml.mjs`) writes an RFCXML v3 (RFC 7991)
  Internet-Draft from a record that carries an `rfc` block. The block holds
  the draft name, category, stream, IPR, abstract, authors and references.
  The IETF submission tool accepts RFCXML v3 directly, so no xml2rfc,
  kramdown-rfc or mmark is needed.

The RFCXML rendering maps the house sections onto the venue's:

- `What this is` becomes the Introduction.
- A BCP 14 section is added, with the exact RFC 8174 text and RFC 2119 and
  RFC 8174 as normative references.
- A clause renders as "<actor> <bcp14>KEYWORD</bcp14> <statement>." A clause
  alone in its paragraph gives that paragraph the clause id as its anchor.
- `Implementations` becomes the Implementation Status section of RFC 7942.
- `Open questions` becomes an Open Issues appendix.

It refuses a record that has no Security Considerations or IANA Considerations
topic.

Topic bodies are read through the Markdown section's
`projectMarkdownBlocks` and `projectMarkdownInline`, the same projections its
HTML renderer uses.
## Detect revision drift without manufacturing accepted Work

Original \`readRequirementArchitectureImpact(before,after)\` consumes two already
source-verified {requirement,specification,architecture} triples. It first
exercises the existing full Requirement→Specification→Architecture source-cut
admission on **both** sides. It compares the exact source revisions, original
Requirement conditions, source-owned normative clause identities **and
contents**, authored model/view mappings, and original model contents. Reusing
the same clause or model identifier with altered content is an explicit
regeneration obligation, never mistaken for stable software.

Its deterministic \`changes\` separate \`regenerate-and-requalify\` from
\`requalify-source-only\`. The latter means a changed source revision invalidates
old custody even when that particular condition's declared logic is unchanged;
it is not an instruction to recreate an unchanged model. It reports the
affected original model/view IDs for a competent downstream Work consumer,
preserves untraced source conditions, and never opens Work, issues authority,
executes code, blesses a proof, self-accepts or settles a customer benefit.

The already-shipped Architecture CLI adds \`--source-impact\`: one bounded
JSON stdin request with exactly
\`{before:{requirement,specification,architecture},after:{requirement,specification,architecture}}\`
yields this read-only typed JSON result. Extra purported \`accepted\` or
\`execute\` fields refuse before output. Native tests exercise identical replay,
changed original customer words, same-ID normative source and same-ID model
content changes, genuinely new model mappings, stale cuts and CLI admission.
There is no additional lifecycle journal or shadow requirement database.
