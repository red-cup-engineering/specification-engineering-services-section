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
    // Only self-contained reference-free Draft 2020-12 Schemas are admitted
    // for source-reviewed HLD port gluing. The original JSON Schema supplier
    // accepts richer syntax, but no native reference resolver or source bundle
    // is bound into THIS review. Do not invent a partial URI/JSON-Pointer
    // resolver or treat two matching unreceived references as compatibility.
    if (Buffer.byteLength(text, 'utf8') > 65_536)
      throw new TypeError('Engineering review port schema exceeds its source boundary');
    const pending=[value];
    while(pending.length) {
      const item=pending.pop();
      if(item===null || typeof item!=='object')continue;
      if(Object.hasOwn(item,'$ref') || Object.hasOwn(item,'$dynamicRef') ||
         Object.hasOwn(item,'$recursiveRef'))
        throw new TypeError('Engineering review requires materialized reference-free port schemas');
      pending.push(...Object.values(item));
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
