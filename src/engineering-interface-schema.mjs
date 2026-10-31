/**
 * Original Engineering interface-schema admission shared by the low-level
 * Design receiver and the source-reviewed HLD interface correspondence.
 * It delegates syntax to the incumbent canonical JSON supplier and schema
 * vocabulary to the incumbent JSON Schema Draft 2020-12 supplier.
 *
 * An address establishes content coincidence, NOT behavioral subtyping,
 * independent review, source ownership, effect authority, or Proof.
 */
import { admitCanonicalJson, UNBOUNDED_JSON_ENVELOPE } from '@red-cup-engineering/json-services-section/canonical-json';
import { createSchema } from '@red-cup-engineering/json-schema-services-section';
import { semanticIdOf } from '@red-cup-engineering/computer-data-engineering-services-section/semiotic-expression-notation/semantic-content-identity';

const object = value => value !== null && typeof value === 'object' &&
  !Array.isArray(value);

export function readEngineeringInterfaceSchema(text, { portableOnly = false } = {}) {
  if (typeof text !== 'string' || !text.isWellFormed() ||
      text.length === 0)
    throw new TypeError('Engineering interface source must be complete UTF-8 JSON text');
  const value = admitCanonicalJson(text, UNBOUNDED_JSON_ENVELOPE).value;
  if (typeof value !== 'boolean' && !object(value))
    throw new TypeError('Engineering interface must be a JSON Schema object or boolean');
  if (portableOnly) {
    // A remote $ref is a dependency on a schema not present in this exact
    // source cut; matching strings do NOT authenticate or receive that schema.
    // Local pointers are still structural declarations, not proven semantics.
    const stack = [value];
    while (stack.length) {
      const entry = stack.pop();
      if (entry === null || typeof entry !== 'object') continue;
      if (Object.hasOwn(entry, '$ref') || Object.hasOwn(entry, '$dynamicRef')) {
        for (const key of ['$ref', '$dynamicRef']) if (Object.hasOwn(entry, key) &&
            (typeof entry[key] !== 'string' || !entry[key].startsWith('#')))
          throw new TypeError('Engineering review port schema cannot depend on an unreceived external reference');
      }
      stack.push(...Object.values(entry));
    }
  }
  if (object(value)) createSchema(value,
    value.$id ?? 'urn:engineering-design:unadmitted-interface',
    { allowUnknownAnnotations: true });
  return Object.freeze({
    schema: value,
    sourceIdentity: semanticIdOf('metroplat.artifact')(value),
  });
}
