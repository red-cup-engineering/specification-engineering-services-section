/**
 * Shared bounded source-carrier entrance for the four original Specification
 * stdin commands. Stream chunks are BYTE data, not pre-decoded text: only a
 * fatal UTF-8 decode of a complete bounded payload may be parsed as JSON.
 *
 * This is an input resource boundary, not an authorization, source
 * authentication, standards-conformance certificate, or fabrication proof.
 */
import { admitCanonicalJson, UNBOUNDED_JSON_ENVELOPE } from "@red-cup-engineering/json-services-section/canonical-json";

export const MAX_SOURCE_JSON_BYTES = 8 * 1024 * 1024;

/** @param {AsyncIterable<Uint8Array>} input Original byte stream. */
export async function readSourceJsonStdin(input, { maxBytes = MAX_SOURCE_JSON_BYTES } = {}) {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1 || maxBytes > MAX_SOURCE_JSON_BYTES)
    throw new RangeError("source-json-stdin: maxBytes must be within the admitted limit");
  const pieces = [];
  let size = 0;
  for await (const part of input) {
    if (!(part instanceof Uint8Array))
      throw new TypeError("source-json-stdin: expected raw byte chunks, not pre-decoded text");
    size += part.byteLength;
    if (size > maxBytes)
      throw new RangeError("source-json-stdin: input exceeds " + maxBytes + " source bytes");
    pieces.push(part);
  }
  if (size === 0) throw new TypeError("source-json-stdin: empty source is not a JSON record");
  // One allocation and one decode after the full byte cap; no quadratic
  // chunk-by-chunk string concatenation, lossy UTF-8, or partial parse.
  const decoded = new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(pieces, size));
  // The original JSON owner strictly admits every source member before the
  // Requirement/Specification/Architecture makers see a parsed value. Bare
  // JSON.parse discards duplicate keys and accepts escaped lone surrogates,
  // which can silently delete claims from their source trace. The existing
  // eight-megabyte host entrance remains the resource limit for this command;
  // do not substitute the JSON transformation seller's smaller envelope.
  return admitCanonicalJson(decoded, UNBOUNDED_JSON_ENVELOPE).value;
}
