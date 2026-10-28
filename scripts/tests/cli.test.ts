import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { statSync } from 'node:fs';
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

test('build help documents concurrency and verbose output', () => {
  const result = run('scripts/build.ts', '--help');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /--concurrency/);
  assert.match(result.stdout, /--verbose/);
});

test('invalid build concurrency fails before changing build output', () => {
  const before = statSync(directory.BUILD, { bigint: true }).mtimeNs;
  for (const value of ['0', '-1', '1.5', 'nope', 'Infinity']) {
    const result = run('scripts/build.ts', '--concurrency', value);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /正整数/);
    assert.doesNotMatch(result.stderr, /\u001b\[/, 'redirected logs must not contain ANSI control sequences');
  }
  assert.equal(statSync(directory.BUILD, { bigint: true }).mtimeNs, before);
});
