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

const isSchemaObject = candidate => candidate !== null && typeof candidate === 'object' &&
  !Array.isArray(candidate);

/**
 * Read an RFC 8259 JSON Schema document using the original 2020-12 supplier.
 * Its identity compares content; it does not establish behavioral subtyping.
 *
 * @param {string} schemaText - JSON Schema source, not an instance payload.
 * @param {{portableOnly?: boolean}} [options]
 * @returns {{schema: object | boolean, sourceIdentity: string}}
 */
export function readEngineeringInterfaceSchema(schemaText, { portableOnly = false } = {}) {
  if (typeof schemaText !== 'string' || !schemaText.isWellFormed() ||
      schemaText.length === 0)
    throw new TypeError('Engineering interface source must be complete UTF-8 JSON text');
  // Apply the declared source-bound byte ceiling before parsing untrusted
  // JSON. An eventually refused source must not consume unbounded parser fuel.
  if (portableOnly && Buffer.byteLength(schemaText, 'utf8') > 65_536)
    throw new TypeError('Engineering review port schema exceeds its source boundary');
  const parsedSchema = admitCanonicalJson(schemaText, UNBOUNDED_JSON_ENVELOPE).value;
  if (typeof parsedSchema !== 'boolean' && !isSchemaObject(parsedSchema))
    throw new TypeError('Engineering interface must be a JSON Schema object or boolean');
  if (portableOnly) {
    // Only self-contained reference-free Draft 2020-12 Schemas are admitted
    // for source-reviewed HLD port gluing. The original JSON Schema supplier
    // accepts richer syntax, but no native reference resolver or source bundle
    // is bound into THIS review. Do not invent a partial URI/JSON-Pointer
    // resolver or treat two matching unreceived references as compatibility.
    const pendingNodes=[parsedSchema];
    while(pendingNodes.length) {
      const schemaNode=pendingNodes.pop();
      if(schemaNode===null || typeof schemaNode!=='object')continue;
      if(Object.hasOwn(schemaNode,'$ref') || Object.hasOwn(schemaNode,'$dynamicRef') ||
         Object.hasOwn(schemaNode,'$recursiveRef'))
        throw new TypeError('Engineering review requires materialized reference-free port schemas');
      pendingNodes.push(...Object.values(schemaNode));
    }
  }
  if (isSchemaObject(parsedSchema)) createSchema(parsedSchema,
    parsedSchema.$id ?? 'urn:engineering-design:unadmitted-interface',
    { allowUnknownAnnotations: true });
  return Object.freeze({
    schema: parsedSchema,
    sourceIdentity: semanticIdOf('metroplat.artifact')(parsedSchema),
  });
}
