---
title: "specification"
description: "A Specification is a Resource that states what is true of one thing, what is forbidden, and what is open. Reference this spec when writing or evaluating any spec file in the system."
date-created: 2026-03-18
---

## What this is

A **Specification** is a [Resource](../../../../../../../../../information-science-services-section/content/text/glossary/terms/resource.md) that describes one thing — a mathematical object, a system behavior, a convention, or a unit type — by stating what is true of it, what is forbidden, and what is open.
Every normative claim uses RFC 2119 keywords.
A Specification MUST NOT invent claims that are not settled; unsettled claims go in Open questions.

## Required sections

Every Specification MUST contain the following sections, in this order:

**`## What this is`** — one paragraph.
What the thing is and why it exists.
For mathematical objects: cite the defining math entity(s) as a markdown link.
For conventions: state the purpose directly.

**Topic sections** — one section per distinct aspect of the thing.
Normative claims appear inline, in context, not collected into a flat list.
A reader looking for everything about one aspect of the thing finds it in one place.

**`## Implementations`** — SHOULD be present for FARS-level files.
One subsection per named implementation context.
Each subsection states what the concept maps to in that context and any implementation-specific constraints.
Conceptual constraints go in topic sections.
Abstract concept files do not embed encoding or implementation details — those belong in chain files at the appropriate level.

**`## Open questions`** — claims that would be MUST or MUST NOT once a specific dependency is resolved.
Each item names the blocking dependency.

## Body structure as nuclear diamond

The required body sections correspond to the four regions of the nuclear diamond:

| Body region | Nuclear diamond position | What it contains |
|---|---|---|
| Frontmatter | π(X) = Fix(σ) ∩ Fix(Δ) | settled coordinates: what both directions agree on |
| What this is | Fix(σ) | what the backward dependencies (uses:) determine |
| Topic sections | Fix(Δ) | what forward consumers require |
| Open questions | X \ (Fix(σ) ∪ Fix(Δ)) | what neither direction has resolved |

A document with an empty Open questions section has no free shadow — it is in H* at the document level.

## Normative keywords

Normative keywords follow RFC 2119:

- **MUST** / **MUST NOT**: absolute requirement or prohibition; settled by proof, axiom, or definition.
- **SHOULD** / **SHOULD NOT**: strong preference; deviation requires justification.
- **MAY**: explicitly permitted; not a requirement.

Every MUST/MUST NOT claim for a mathematical object spec MUST be traceable to a math entity or proof.
State the citation inline: "A nucleus MUST be idempotent — [nucleus](../../../../../../../../../philosophy-services-section/services/relationality-services-section/content/text/glossary/concepts/nucleus.md)."

## Open questions

- Whether `domain` and `codomain` in spec frontmatter are the same field as in math entity frontmatter, or two distinct fields sharing a name.
  Resolution blocked by: formal skill-object-type vocabulary.

## Additional material from the Google Drive library

Specification is a domain within Tech.
