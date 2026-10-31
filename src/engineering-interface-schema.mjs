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
    // An independently reviewed HLD schema is one bounded, completely
    // materialized source object. An unreceived remote or locally unresolved
    // $ref cannot be made real merely by writing the same URL on both sides.
    if (Buffer.byteLength(text, 'utf8') > 65_536)
      throw new TypeError('Engineering review port schema exceeds the original bounded source cut');
    const localTarget = (ref) => {
      if (ref === '#') return value;
      if (!ref.startsWith('#/') || ref.includes('%'))
        throw new TypeError('Engineering review cannot resolve an external or unqualified local schema reference');
      let target = value;
      for (const part of ref.slice(2).split('/')) {
        if (/~(?![01])/u.test(part))
          throw new TypeError('Engineering review schema reference has invalid JSON Pointer escaping');
        const key=part.replaceAll('~1','/').replaceAll('~0','~');
        if (target === null || typeof target !== 'object' ||
            !Object.hasOwn(target,key))
          throw new TypeError('Engineering review schema references an absent original definition');
        target=target[key];
      }
      if (typeof target !== 'boolean' && !object(target))
        throw new TypeError('Engineering review schema reference is not a schema');
      return target;
    };
    const stack = [{node:value,root:true}];
    while (stack.length) {
      const {node,root}=stack.pop();
      if (node === null || typeof node !== 'object') continue;
      // Nested $id changes the base URI. Require a separate admitted source
      // model for that more general JSON Schema composition.
      if (!root && Object.hasOwn(node,'$id'))
        throw new TypeError('Engineering review nested schema IDs need a qualified separate source');
      if (Object.hasOwn(node,'$dynamicRef'))
        throw new TypeError('Engineering review dynamic schema references require independent resolution');
      if (Object.hasOwn(node,'$ref')) {
        if (typeof node.$ref !== 'string') throw new TypeError('Invalid schema reference');
        localTarget(node.$ref);
      }
      for (const child of Object.values(node)) stack.push({node:child,root:false});
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
