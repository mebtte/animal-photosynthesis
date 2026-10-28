import assert from 'node:assert/strict';
import { test } from 'node:test';
import runWorkerPool from '../utils/worker_pool.ts';

const workerURL = new URL('./fixtures/pool_worker.ts', import.meta.url);
interface Job {
  number?: number;
  delay?: number;
  fail?: boolean;
  exit?: boolean;
}
interface Result {
  value: number;
  threadId: number;
  started: number;
  finished: number;
}

test('worker pool runs concurrently within its limit and preserves input order', async () => {
  const completed: number[] = [];
  const results = await runWorkerPool<Job, Result>({
    workerURL,
    items: [120, 10, 10, 10].map((delay, number) => ({ number, delay })),
    concurrency: 2,
    workerData: { barrier: new SharedArrayBuffer(4), size: 2 },
    onResult(result) { completed.push(result.value); },
  });
  assert.deepEqual(results.map((result) => result.value), [0, 1, 2, 3]);
  assert.equal(completed[0], 1, 'a slow first task must not block other tasks');
  assert.equal(new Set(results.map((result) => result.threadId)).size, 2);
  const events = results.flatMap((result) => [
    { time: result.started, delta: 1 }, { time: result.finished, delta: -1 },
  ]).sort((a, b) => a.time - b.time || a.delta - b.delta);
  let active = 0;
  let peak = 0;
  for (const event of events) {
    active += event.delta;
    peak = Math.max(peak, active);
  }
  assert.equal(peak, 2);
});

test('worker failure rejects the pool and cancels remaining tasks', async () => {
  await assert.rejects(runWorkerPool({
    workerURL, items: [{ fail: true }, { delay: 10_000 }], concurrency: 2,
  }), /fixture worker failure/);
});

test('unexpected clean worker exit rejects instead of hanging', async () => {
  await assert.rejects(runWorkerPool({
    workerURL, items: [{ exit: true }], concurrency: 1,
  }), /意外退出/);
});

test('progress callback errors stop the pool', async () => {
  await assert.rejects(runWorkerPool({
    workerURL, items: [{ number: 1, delay: 1 }], concurrency: 1,
    onResult() { throw new Error('progress failed'); },
  }), /progress failed/);
});

test('empty task lists resolve without starting workers', async () => {
  assert.deepEqual(await runWorkerPool({ workerURL, items: [], concurrency: 2 }), []);
});

test('invalid concurrency is rejected before creating workers', async () => {
  for (const concurrency of [0, -1, 1.5, NaN, Infinity]) {
    await assert.rejects(runWorkerPool({ workerURL, items: [1], concurrency }), /正整数/);
  }
});
