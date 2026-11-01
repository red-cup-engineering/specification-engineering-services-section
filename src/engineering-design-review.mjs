import { readEngineeringInterfaceSchema } from './engineering-interface-schema.mjs';

/**
 * Derive graph and source trace once from a high-level review; original EngineeringDesign source receiving remains external.
 * @param {{review:object,trace:object}} params
 * @param {object} params.review - the admitted high-level review with components and openQuestions
 * @param {object} params.trace - the original readRequirementArchitectureTrace readout with rows
 * @returns {{components:Array,connections:Array,traceability:Array,openQuestions:Array<string>}} the high-level design JSON consumed by original receiveEngineeringDesign
 */
export function projectHighLevelDesignReview({ review, trace } = {}) {
  if (review === null || typeof review !== 'object' || Array.isArray(review)) {
    throw new TypeError('review must be an object');
  }
  if (trace === null || typeof trace !== 'object' || Array.isArray(trace)) {
    throw new TypeError('trace must be an object');
  }

  const components = review.components || [];
  const openQuestions = review.openQuestions || [];
  const rows = trace.rows || [];

  const componentIds = new Set();
  for (const component of components) {
    if (componentIds.has(component.id)) {
      throw new TypeError(`duplicate component id: ${component.id}`);
    }
    componentIds.add(component.id);
  }

  // ENG-20: provider interfaces are separately authored source, not the
  // closure of consumer wishes. Previously we "supplied" every demanded port
  // by deriving provider.providedPorts from consumers' requires, then used
  // that self-created declaration as evidence of composition.
  //
  // Each portable interface carries an actual JSON Schema document, admitted
  // by the ORIGINAL shared Design/JSON Schema supplier. Identical semantic
  // schema addresses conservatively establish a typed cut; different schemas
  // need a separately received refinement law and cannot be guessed equal.
  const providedSchemasByComponentId = new Map();
  const readPortSchemaIdentity = (entry, role) => {
    // The direct projector must enforce the same closed source vocabulary
    // as the received HLD review schema. Unknown fields cannot grant proof,
    // authority or a second covert supplier-owned port description.
    const keys=role==='provider'
      ? ['port','schemaJson'] : ['componentId','port','schemaJson'];
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry) ||
        Object.keys(entry).length !== keys.length ||
        !keys.every(key=>Object.hasOwn(entry,key)) ||
        typeof entry.port !== 'string' || !entry.port.trim() ||
        !entry.port.isWellFormed() || entry.port.normalize('NFC') !== entry.port ||
        /[\r\n\u0000]/u.test(entry.port) ||
        typeof entry.schemaJson !== 'string')
      throw new TypeError(`invalid source-owned ${role} port declaration`);
    return readEngineeringInterfaceSchema(entry.schemaJson,
      {portableOnly:true}).sourceIdentity;
  };
  for (const component of components) {
    if (!Array.isArray(component.provides) || !Array.isArray(component.requires))
      throw new TypeError(`original HLD review must independently author provider and consumer ports: ${component.id}`);
    const providerPortSchemas = new Map();
    for (const port of component.provides) {
      const schema = readPortSchemaIdentity(port,'provider');
      if (providerPortSchemas.has(port.port))
        throw new TypeError(`duplicate provider port declaration: ${component.id}/${port.port}`);
      providerPortSchemas.set(port.port,schema);
    }
    providedSchemasByComponentId.set(component.id,providerPortSchemas);
  }
  for (const component of components) {
    const seenPorts = new Set();
    for (const requirement of component.requires) {
      const consumerSchemaIdentity = readPortSchemaIdentity(requirement,'consumer');
      if (requirement.componentId === component.id) {
        throw new TypeError(`self dependency: ${component.id}`);
      }
      if (!componentIds.has(requirement.componentId)) {
        throw new TypeError(`unknown required provider id: ${requirement.componentId}`);
      }
      if (seenPorts.has(requirement.port)) {
        throw new TypeError(`duplicate required port name on consumer: ${component.id}`);
      }
      const providerPortSchemas=providedSchemasByComponentId.get(requirement.componentId).get(requirement.port);
      if (providerPortSchemas === undefined || providerPortSchemas !== consumerSchemaIdentity)
        throw new TypeError(`unreceived or incompatible provider contract for ${requirement.componentId}/${requirement.port} required by ${component.id}`);
      seenPorts.add(requirement.port);
    }
  }

  const seenRequirementCellIds = new Set();
  const requiredSpecificationClauseIds = new Set();
  for (const row of rows) {
    if (seenRequirementCellIds.has(row.cell)) {
      throw new TypeError(`duplicate trace cell id: ${row.cell}`);
    }
    seenRequirementCellIds.add(row.cell);
    for (const clauseId of row.normativeClauseIds) {
      requiredSpecificationClauseIds.add(clauseId);
    }
  }

  const allocatedSpecificationClauseIds = new Set();
  for (const component of components) {
    for (const clauseId of component.specificationClauseIds) {
      allocatedSpecificationClauseIds.add(clauseId);
    }
  }

  for (const component of components) {
    for (const clauseId of component.specificationClauseIds) {
      if (!requiredSpecificationClauseIds.has(clauseId)) {
        throw new TypeError(`component clause id absent from every trace row: ${clauseId}`);
      }
    }
  }

  for (const row of rows) {
    for (const clauseId of row.normativeClauseIds) {
      if (!allocatedSpecificationClauseIds.has(clauseId)) {
        throw new TypeError(`original normative clause without a claiming component: ${clauseId}`);
      }
    }
  }

  const dependenciesByComponentId = new Map();
  for (const component of components) {
    const dependencyIds = [];
    const distinctDependencyIds = new Set();
    for (const requirement of component.requires) {
      if (!distinctDependencyIds.has(requirement.componentId)) {
        distinctDependencyIds.add(requirement.componentId);
        dependencyIds.push(requirement.componentId);
      }
    }
    dependenciesByComponentId.set(component.id, dependencyIds);
  }

  function collectTransitiveDependencies(tracedComponentSeeds) {
    const visited = new Set();
    const stack = [...tracedComponentSeeds];
    while (stack.length > 0) {
      const id = stack.pop();
      if (visited.has(id)) {
        continue;
      }
      visited.add(id);
      const dependencies = dependenciesByComponentId.get(id);
      if (dependencies) {
        for (const dependencyId of dependencies) {
          if (!visited.has(dependencyId)) {
            stack.push(dependencyId);
          }
        }
      }
    }
    return visited;
  }

  const traceDependencyClosures = [];
  const tracedComponentIds = new Set();
  for (const row of rows) {
    const tracedComponentSeeds = [];
    for (const component of components) {
      let intersects = false;
      for (const clauseId of component.specificationClauseIds) {
        if (row.normativeClauseIds.includes(clauseId)) {
          intersects = true;
          break;
        }
      }
      if (intersects) {
        tracedComponentSeeds.push(component.id);
      }
    }
    const closure = collectTransitiveDependencies(tracedComponentSeeds);
    traceDependencyClosures.push(closure);
    for (const id of closure) {
      tracedComponentIds.add(id);
    }
  }

  for (const component of components) {
    if (!tracedComponentIds.has(component.id)) {
      throw new TypeError(`orphan component not in any trace closure: ${component.id}`);
    }
  }

  const designComponents = [];
  for (const component of components) {
    const dependencyIds = [];
    const distinctDependencyIds = new Set();
    for (const requirement of component.requires) {
      if (!distinctDependencyIds.has(requirement.componentId)) {
        distinctDependencyIds.add(requirement.componentId);
        dependencyIds.push(requirement.componentId);
      }
    }
    const requiredPorts = [];
    for (const requirement of component.requires) {
      requiredPorts.push(requirement.port);
    }
    designComponents.push({
      id: component.id,
      owner: component.owner,
      layer: component.layer,
      responsibility: component.responsibility,
      dependencyIds,
      providedPorts: component.provides.map(port => port.port),
      requiredPorts,
    });
  }

  const connections = [];
  for (const consumer of components) {
    for (const requirement of consumer.requires) {
      connections.push({
        fromComponentId: requirement.componentId,
        toComponentId: consumer.id,
        port: requirement.port,
      });
    }
  }

  const traceabilityRows = [];
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const closure = traceDependencyClosures[index];
    const architectureModelIds = [];
    const seenModelIds = new Set();
    for (const authoredPath of row.authoredPaths) {
      if (!seenModelIds.has(authoredPath.modelId)) {
        seenModelIds.add(authoredPath.modelId);
        architectureModelIds.push(authoredPath.modelId);
      }
    }
    const designElementIds = [];
    for (const component of components) {
      if (closure.has(component.id)) {
        designElementIds.push(component.id);
      }
    }
    traceabilityRows.push({
      requirementCellId: row.cell,
      specificationClauseIds: [...row.normativeClauseIds],
      architectureModelIds,
      designElementIds,
    });
  }

  return {
    components: designComponents,
    connections,
    traceability: traceabilityRows,
    openQuestions: [...openQuestions],
  };
}