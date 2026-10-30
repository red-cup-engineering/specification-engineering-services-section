import { artifactId } from '@red-cup-engineering/semiotic-eavt-services-section/identity';

// Source-format fixtures only; no real review, proof or adoption is implied.
export function sourcesFixture() {
  const requirement = {
    kind: 'requirement', id: 'source-req', 'met-when': [
      { cell: 'source-req:a', target: 'held', says: 'Retain A.' },
      { cell: 'source-req:b', target: 'held', says: 'Retain B.' },
    ],
  };
  const requirementRevision = artifactId(requirement);
  const reference = cell =>
    'Original Requirement source-req (' + requirementRevision + '), cell source-req:' + cell;
  const specification = {
    identity: { id: 'source-spec' },
    provenance: { derivedFrom: ['source-req@' + requirementRevision] },
    topics: [{ clauses: [
      { id: 'clause-a', backedBy: [reference('a')] },
      { id: 'clause-b', backedBy: [reference('b')] },
    ] }],
  };
  const sourceIds = ['requirement', 'specification'];
  const architecture = {
    type: 'ArchitectureDescriptionCandidate',
    version: 1,
    identity: { id: 'source-arch', title: 'Synthetic original design',
      revision: 'unadmitted-fixture-v1', owner: 'source-owner', status: 'candidate' },
    standard: { designation: 'ISO/IEC/IEEE 42010', edition: '2022',
      applicability: 'Synthetic source-format fixture only', conformance: 'unassessed' },
    system: { name: 'Source fixture', description: 'Two separate requirements',
      sourceIds },
    upstream: { requirementsSourceId: 'requirement',
      specificationSourceId: 'specification' },
    sources: [
      { id: 'requirement', locator: 'fixture:requirement',
        revision: requirementRevision },
      { id: 'specification', locator: 'fixture:specification',
        revision: artifactId(specification) },
    ],
    stakeholders: [{ id: 'buyer', name: 'Fixture buyer',
      concernIds: ['concern-a', 'concern-b'] }],
    concerns: [
      { id: 'concern-a', statement: 'Retain A.', sourceIds,
        requirementCellIds: ['source-req:a'], specificationClauseIds: ['clause-a'] },
      { id: 'concern-b', statement: 'Retain B.', sourceIds,
        requirementCellIds: ['source-req:b'], specificationClauseIds: ['clause-b'] },
    ],
    viewpoints: [{ id: 'functional', name: 'Functional',
      concernIds: ['concern-a', 'concern-b'], modelKinds: ['component'],
      method: 'Synthetic attributed fixture' }],
    views: [{ id: 'functional-view', name: 'Functional view',
      viewpointId: 'functional', modelIds: ['model-a', 'model-a-alt', 'model-b'],
      sourceIds }],
    models: [
      { id: 'model-a', kind: 'component', content: 'Component for A.',
        concernIds: ['concern-a'], sourceIds },
      { id: 'model-a-alt', kind: 'component', content: 'Alternative model for A.',
        concernIds: ['concern-a'], sourceIds },
      { id: 'model-b', kind: 'component', content: 'Component for B.',
        concernIds: ['concern-b'], sourceIds },
    ],
    correspondences: [],
    decisions: [{ id: 'choice', statement: 'Model each separate cell.',
      rationale: 'Distinct requirement sources.', alternatives: ['Use one component.'],
      concernIds: ['concern-a', 'concern-b'], sourceIds }],
    openQuestions: [],
  };
  return [
    { kind: 'requirement', text: JSON.stringify(requirement) },
    { kind: 'specification', text: JSON.stringify(specification) },
    { kind: 'architecture', text: JSON.stringify(architecture) },
  ];
}

// Shared native and independently packed-consumer source-cut counterexample.
// These are format-only, unadmitted records, not a qualified design.
export function clausesSplitAcrossModels({ completeArchitecture = false } = {}) {
  const sources = sourcesFixture();
  const specification = JSON.parse(sources[1].text);
  const architecture = JSON.parse(sources[2].text);
  // Both normative clauses belong to source-req:a; each independently
  // authored architectural model supplies only one of those clauses.
  specification.topics[0].clauses.push({
    id: 'clause-a2',
    backedBy: [specification.topics[0].clauses[0].backedBy[0]],
  });
  architecture.sources.find(source => source.id === 'specification').revision =
    artifactId(specification);
  if (completeArchitecture) {
    architecture.stakeholders[0].concernIds.push('concern-a2');
    architecture.concerns.push({
      id: 'concern-a2', statement: 'Independently model second clause for A.',
      sourceIds: ['requirement', 'specification'],
      requirementCellIds: ['source-req:a'], specificationClauseIds: ['clause-a2'],
    });
    architecture.viewpoints[0].concernIds.push('concern-a2');
    architecture.views[0].modelIds.push('model-a2');
    architecture.models.push({
      id: 'model-a2', kind: 'component',
      content: 'Source-identified second requirement-clause responsibility.',
      concernIds: ['concern-a2'], sourceIds: ['requirement', 'specification'],
    });
  }
  sources[1].text = JSON.stringify(specification);
  sources[2].text = JSON.stringify(architecture);
  return sources;
}

/**
 * One additional expressly unadmitted reviewer/model source-cut fixture.
 * Mirrors the actual Requirement writer's held|denied target domain, with
 * exact whole-Requirement, normative clause and 42010-model source addresses.
 * It cannot claim authority, generator conformance or a measured refusal.
 */
export function sourceWithDeniedCondition() {
  const sources=sourcesFixture();
  const requirement=JSON.parse(sources[0].text);
  requirement['met-when'][1].target='denied';
  requirement['met-when'][1].says='Release supplier output without independent recipient acceptance.';
  const specification=JSON.parse(sources[1].text);
  specification.provenance.derivedFrom=[
    requirement.id+'@'+artifactId(requirement),
  ];
  for(const [index,clause] of specification.topics[0].clauses.entries()) {
    const row=requirement['met-when'][index];
    clause.backedBy=[
      'Original Requirement '+requirement.id+' ('+artifactId(requirement)+'), cell '+row.cell,
    ];
  }
  specification.topics[0].clauses[1].keyword='MUST NOT';
  specification.topics[0].clauses[1].statement=requirement['met-when'][1].says;
  const architecture=JSON.parse(sources[2].text);
  architecture.sources.find(row=>row.id==='requirement').revision=artifactId(requirement);
  architecture.sources.find(row=>row.id==='specification').revision=artifactId(specification);
  architecture.concerns[1].statement='Refuse supplier output without recipient acceptance.';
  architecture.models.find(row=>row.id==='model-b').content='Original denial is modeled, not observed.';
  sources[0].text=JSON.stringify(requirement);
  sources[1].text=JSON.stringify(specification);
  sources[2].text=JSON.stringify(architecture);
  return sources;
}
