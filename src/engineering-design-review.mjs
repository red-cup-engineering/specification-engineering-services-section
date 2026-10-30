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

  for (const component of components) {
    const seenPorts = new Set();
    for (const requirement of component.requires) {
      if (requirement.componentId === component.id) {
        throw new TypeError(`self dependency: ${component.id}`);
      }
      if (!componentIds.has(requirement.componentId)) {
        throw new TypeError(`unknown required provider id: ${requirement.componentId}`);
      }
      if (seenPorts.has(requirement.port)) {
        throw new TypeError(`duplicate required port name on consumer: ${component.id}`);
      }
      seenPorts.add(requirement.port);
    }
  }

  const cellIds = new Set();
  const allNormativeClauseIds = new Set();
  for (const row of rows) {
    if (cellIds.has(row.cell)) {
      throw new TypeError(`duplicate trace cell id: ${row.cell}`);
    }
    cellIds.add(row.cell);
    for (const clauseId of row.normativeClauseIds) {
      allNormativeClauseIds.add(clauseId);
    }
  }

  const claimedClauseIds = new Set();
  for (const component of components) {
    for (const clauseId of component.specificationClauseIds) {
      claimedClauseIds.add(clauseId);
    }
  }

  for (const component of components) {
    for (const clauseId of component.specificationClauseIds) {
      if (!allNormativeClauseIds.has(clauseId)) {
        throw new TypeError(`component clause id absent from every trace row: ${clauseId}`);
      }
    }
  }

  for (const row of rows) {
    for (const clauseId of row.normativeClauseIds) {
      if (!claimedClauseIds.has(clauseId)) {
        throw new TypeError(`original normative clause without a claiming component: ${clauseId}`);
      }
    }
  }

  const dependencyByComponentId = new Map();
  for (const component of components) {
    const dependencyIds = [];
    const seenDependencyIds = new Set();
    for (const requirement of component.requires) {
      if (!seenDependencyIds.has(requirement.componentId)) {
        seenDependencyIds.add(requirement.componentId);
        dependencyIds.push(requirement.componentId);
      }
    }
    dependencyByComponentId.set(component.id, dependencyIds);
  }

  function transitiveDependencyClosure(seedIds) {
    const visited = new Set();
    const stack = [...seedIds];
    while (stack.length > 0) {
      const id = stack.pop();
      if (visited.has(id)) {
        continue;
      }
      visited.add(id);
      const dependencies = dependencyByComponentId.get(id);
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

  const rowClosures = [];
  const coveredComponentIds = new Set();
  for (const row of rows) {
    const seedIds = [];
    for (const component of components) {
      let intersects = false;
      for (const clauseId of component.specificationClauseIds) {
        if (row.normativeClauseIds.includes(clauseId)) {
          intersects = true;
          break;
        }
      }
      if (intersects) {
        seedIds.push(component.id);
      }
    }
    const closure = transitiveDependencyClosure(seedIds);
    rowClosures.push(closure);
    for (const id of closure) {
      coveredComponentIds.add(id);
    }
  }

  for (const component of components) {
    if (!coveredComponentIds.has(component.id)) {
      throw new TypeError(`orphan component not in any trace closure: ${component.id}`);
    }
  }

  const providedPortsByComponentId = new Map();
  for (const target of components) {
    const providedPorts = [];
    const seenPorts = new Set();
    for (const consumer of components) {
      if (consumer.id === target.id) {
        continue;
      }
      for (const requirement of consumer.requires) {
        if (requirement.componentId === target.id && !seenPorts.has(requirement.port)) {
          seenPorts.add(requirement.port);
          providedPorts.push(requirement.port);
        }
      }
    }
    providedPortsByComponentId.set(target.id, providedPorts);
  }

  const outComponents = [];
  for (const component of components) {
    const dependencyIds = [];
    const seenDependencyIds = new Set();
    for (const requirement of component.requires) {
      if (!seenDependencyIds.has(requirement.componentId)) {
        seenDependencyIds.add(requirement.componentId);
        dependencyIds.push(requirement.componentId);
      }
    }
    const requiredPorts = [];
    for (const requirement of component.requires) {
      requiredPorts.push(requirement.port);
    }
    outComponents.push({
      id: component.id,
      owner: component.owner,
      layer: component.layer,
      responsibility: component.responsibility,
      dependencyIds,
      providedPorts: providedPortsByComponentId.get(component.id),
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

  const outTraceability = [];
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const closure = rowClosures[index];
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
    outTraceability.push({
      requirementCellId: row.cell,
      specificationClauseIds: [...row.normativeClauseIds],
      architectureModelIds,
      designElementIds,
    });
  }

  return {
    components: outComponents,
    connections,
    traceability: outTraceability,
    openQuestions: [...openQuestions],
  };
}