import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from '../utils/fs.ts';
import toBuild, { invalidateResources } from '../utils/to_build.ts';

test('concurrent references share a single resource copy', async (context) => {
  const read = context.mock.method(fs, 'readFile', async () => Buffer.from('shared image'));
  const write = context.mock.method(fs, 'writeFile', async () => {});
  const jobs = Array.from({ length: 10 }, () => toBuild('/fixture/shared.png'));
  const results = await Promise.all(jobs);
  assert(jobs.every((job) => job === jobs[0]));
  assert.equal(new Set(results).size, 1);
  assert.equal(read.mock.callCount(), 1);
  assert.equal(write.mock.callCount(), 1);
});

test('a resource already owned by another worker is reused', async (context) => {
  context.mock.method(fs, 'readFile', async () => Buffer.from('another worker owns this'));
  context.mock.method(fs, 'writeFile', async () => {
    throw Object.assign(new Error('already exists'), { code: 'EEXIST' });
  });
  assert.match(await toBuild('/fixture/existing.png'), /^[a-f0-9]{32}\.png$/);
});

test('failed resource copies can be retried and do not hide write errors', async (context) => {
  context.mock.method(fs, 'readFile', async () => Buffer.from('retry copy'));
  let attempts = 0;
  context.mock.method(fs, 'writeFile', async () => {
    if (attempts++ === 0) throw Object.assign(new Error('permission denied'), { code: 'EACCES' });
  });
  await assert.rejects(toBuild('/fixture/retry.png'), /permission denied/);
  assert.match(await toBuild('/fixture/retry.png'), /^[a-f0-9]{32}\.png$/);
  assert.equal(attempts, 2);
});

test('invalidating a changed resource refreshes its content hash', async (context) => {
  let content = 'before save';
  context.mock.method(fs, 'readFile', async () => Buffer.from(content));
  context.mock.method(fs, 'writeFile', async () => {});
  const before = await toBuild('/fixture/changing.png');
  content = 'after save';
  invalidateResources(['/fixture/changing.png']);
  const after = await toBuild('/fixture/changing.png');
  assert.notEqual(after, before);
});
