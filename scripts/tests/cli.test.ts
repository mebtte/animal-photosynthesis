import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import directory from '../utils/directory.ts';

const run = (...args: string[]) => spawnSync(process.execPath, args, {
  cwd: directory.ROOT,
  encoding: 'utf8',
  timeout: 10_000,
});

test('watch help documents the article id without starting a watcher', () => {
  const result = run('scripts/watch.ts', '--help');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /--id/);
});

test('watch rejects a missing article id', () => {
  const result = run('scripts/watch.ts');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Please specify the article id/);
});

test('preview server retains the port and cache options', () => {
  const result = run('node_modules/http-server/bin/http-server', '--help');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /-p/);
  assert.match(result.stdout, /-c/);
});
