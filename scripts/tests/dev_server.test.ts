import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdir, mkdtemp, readFile, rename, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import fs from 'fs-extra';
import createPreviewServer from '../dev/server.ts';

test('preview shutdown is safe before listen and can be repeated', async () => {
  const preview = createPreviewServer({ outputDirectory: '/unused', articleId: 'example' });
  await preview.close();
  await preview.close();
  assert.equal(preview.server.listening, false);
});

test('preview serves isolated output, reload events and fresh static files, then releases connections', async (context) => {
  const root = await mkdtemp(path.join(tmpdir(), 'animal-watch-server-'));
  const output = path.join(root, 'output');
  const source = path.join(root, 'static');
  await Promise.all([mkdir(output), mkdir(source)]);
  const preview = createPreviewServer({ outputDirectory: output, staticDirectory: source, articleId: 'example' });
  context.after(async () => { await preview.close(); await fs.emptyDir(root); });
  preview.server.listen(0, '127.0.0.1');
  await once(preview.server, 'listening');
  const address = preview.server.address() as { port: number };
  const base = `http://127.0.0.1:${address.port}`;
  const controller = new AbortController();
  context.after(() => controller.abort());
  const stream = await fetch(`${base}/__watch/events`, { signal: controller.signal });
  assert.match(stream.headers.get('content-type')!, /text\/event-stream/);
  const reader = stream.body!.getReader();
  let buffer = '';
  const decoder = new TextDecoder();
  const event = async () => {
    while (!buffer.includes('\n\n')) {
      const { value, done } = await reader.read();
      assert(!done, 'event stream ended unexpectedly');
      buffer += decoder.decode(value, { stream: true });
    }
    const boundary = buffer.indexOf('\n\n');
    const frame = buffer.slice(0, boundary);
    buffer = buffer.slice(boundary + 2);
    return { name: /event: (.+)/.exec(frame)![1], data: JSON.parse(/data: (.+)/.exec(frame)![1]) };
  };
  assert.equal((await event()).name, 'state');
  assert.equal((await fetch(`${base}/example`)).status, 503);
  const original = '<html><body>last successful page</body></html>';
  await writeFile(path.join(output, 'example.html'), original);
  const response = await fetch(`${base}/example`);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /__watch\/client\.js/);
  assert.equal(await readFile(path.join(output, 'example.html'), 'utf8'), original);
  assert.equal((await fetch(`${base}/`, { redirect: 'manual' })).headers.get('location'), '/example');
  assert.equal((await fetch(`${base}/__watch/client.js`)).status, 200);
  preview.failed(new Error('bad template'));
  const failure = await event();
  assert.equal(failure.name, 'build-error'); assert.match(failure.data.error, /bad template/);
  assert.match(await (await fetch(`${base}/example`)).text(), /last successful page/);
  preview.succeeded(); assert.equal((await event()).name, 'built');

  await writeFile(path.join(source, 'robots.txt'), 'before');
  assert.equal(await (await fetch(`${base}/robots.txt`)).text(), 'before');
  await writeFile(path.join(source, 'robots.txt'), 'after');
  assert.equal(await (await fetch(`${base}/robots.txt`)).text(), 'after');
  await rename(path.join(source, 'robots.txt'), path.join(source, 'renamed.txt'));
  assert.equal((await fetch(`${base}/robots.txt`)).status, 404);
  await writeFile(path.join(output, 'hashed.js'), 'window.fixture = true;');
  const asset = await fetch(`${base}/hashed.js`);
  assert.equal(asset.status, 200); assert.match(await asset.text(), /window.fixture/);
  assert.equal((await fetch(`${base}/%2e%2e%2fsecret`)).status, 403);
  await preview.close();
  assert.equal(preview.server.listening, false);
});
