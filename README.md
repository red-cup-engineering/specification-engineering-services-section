# @red-cup-engineering/specification-engineering-services-section

<!-- 561-group-standards:badges:start -->
[![Red Cup Engineering](https://img.shields.io/badge/561%20Group-Red%20Cup%20Engineering-c0392b)](https://github.com/red-cup-engineering)
[![License: MIT](https://img.shields.io/badge/license-MIT-c0392b)](LICENSE)
[![Indigenous data: CARE](https://img.shields.io/badge/Indigenous%20data-CARE-4b6f44)](https://github.com/red-cup-engineering/.github/blob/main/GOVERNANCE.md)
[![Tips welcome](https://img.shields.io/badge/tips-welcome-d4a017)](https://github.com/561-group/.github/blob/main/TIPS.md)
<!-- 561-group-standards:badges:end -->

Fabricates Specification records from journaled rulings and semantic-record-journal rows into topic-sectioned, BCP14-clause Markdown carriers, never handwritten.

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
