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

