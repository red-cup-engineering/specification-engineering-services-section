import assert from "node:assert/strict";
import test from "node:test";
import { Readable } from "node:stream";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { MAX_SOURCE_JSON_BYTES, readSourceJsonStdin } from "../scripts/read-source-json-stdin.mjs";

const chunks = (...parts) => Readable.from(parts);

test("all source stdin readers preserve split UTF-8 bytes and authentic JSON values", async () => {
  const result = await readSourceJsonStdin(chunks(
    Buffer.from('{"word":"'), Buffer.from([0xe2]), Buffer.from([0x9c]),
    Buffer.from([0x93]), Buffer.from('","done":true}')));
  assert.deepEqual(result, {word:"✓",done:true});
});

test("source stdin uses a sharp byte cap: exact limit accepted, one additional byte refused", async () => {
  const exact = '"' + "x".repeat(MAX_SOURCE_JSON_BYTES - 2) + '"';
  assert.equal(Buffer.byteLength(exact), MAX_SOURCE_JSON_BYTES);
  const result = await readSourceJsonStdin(chunks(Buffer.from(exact)));
  assert.equal(result.length, MAX_SOURCE_JSON_BYTES - 2);
  await assert.rejects(
    readSourceJsonStdin(chunks(Buffer.alloc(MAX_SOURCE_JSON_BYTES, 0x20), Buffer.from(" "))),
    /input exceeds .* source bytes/u);
});

test("missing, malformed and lossy-decoded input cannot become fabricated source records", async () => {
  await assert.rejects(readSourceJsonStdin(chunks()), /empty source/u);
  await assert.rejects(readSourceJsonStdin(chunks(Buffer.from('{"a":}'))), SyntaxError);
  await assert.rejects(readSourceJsonStdin(chunks(Buffer.from([0x7b,0x22,0x78,0x22,0x3a,0x22,0xc3,0x28,0x22,0x7d]))), TypeError);
  await assert.rejects(readSourceJsonStdin(Readable.from(['{"predecoded":true}'])), /raw byte chunks/u);
  for (const maxBytes of [0,-1,1.5,MAX_SOURCE_JSON_BYTES + 1]) {
    await assert.rejects(readSourceJsonStdin(chunks(Buffer.from("{}")), {maxBytes}), /maxBytes/u);
  }
  await assert.rejects(readSourceJsonStdin(chunks(Buffer.from("{}")), {maxBytes:1}), /input exceeds/u);
});

test("all four actual original producer CLIs reject oversized byte input without partial product", () => {
  const names = [
    "derive-specification.mjs",
    "render-specification.mjs",
    "render-specification-rfcxml.mjs",
    "render-architecture-description.mjs"
  ];
  const tooLarge = Buffer.alloc(MAX_SOURCE_JSON_BYTES + 1, 0x20);
  for (const name of names) {
    const command = fileURLToPath(new URL("../scripts/" + name, import.meta.url));
    const oversized = spawnSync(process.execPath, [command], {
      input:tooLarge,encoding:"utf8",maxBuffer:2 * 1024 * 1024,timeout:15_000
    });
    assert.equal(oversized.status, 1, name + " " + (oversized.error?.message ?? oversized.stderr));
    assert.equal(oversized.stdout, "", name + " must not emit partial accepted bytes");
    assert.match(oversized.stderr, /source-json-stdin: input exceeds/u);
    const help = spawnSync(process.execPath, [command, "--help"], {
      input:tooLarge,encoding:"utf8",maxBuffer:2 * 1024 * 1024,timeout:15_000
    });
    assert.equal(help.status,0,name + " help must not consume source");
    assert.match(help.stdout,new RegExp(name.slice(0,-4).replaceAll("-", "-"),"u"));
  }
});
