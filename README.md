# @red-cup-engineering/specification-engineering-services-section

<!-- 561-group-standards:badges:start -->
[![Red Cup Engineering](https://img.shields.io/badge/561%20Group-Red%20Cup%20Engineering-c0392b)](https://github.com/red-cup-engineering)
[![License: MIT](https://img.shields.io/badge/license-MIT-c0392b)](LICENSE)
[![Indigenous data: CARE](https://img.shields.io/badge/Indigenous%20data-CARE-4b6f44)](https://github.com/red-cup-engineering/.github/blob/main/GOVERNANCE.md)
[![Tips welcome](https://img.shields.io/badge/tips-welcome-d4a017)](https://github.com/561-group/.github/blob/main/TIPS.md)
<!-- 561-group-standards:badges:end -->

Fabricates Specification records from journaled rulings and semantic-record-journal rows into topic-sectioned, BCP14-clause Markdown carriers, never handwritten.

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
