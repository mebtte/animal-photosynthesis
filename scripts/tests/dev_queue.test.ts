import assert from 'node:assert/strict';
import path from 'node:path';
import { setTimeout } from 'node:timers/promises';
import { test } from 'node:test';
import createRebuildQueue from '../dev/queue.ts';
import classifyChanges, { ignoredChange } from '../dev/changes.ts';
import directory from '../utils/directory.ts';

async function waitFor(predicate: () => boolean) {
  const deadline = Date.now() + 1500;
  while (!predicate()) {
    assert(Date.now() < deadline, 'timed out waiting for rebuild');
    await setTimeout(2);
  }
}

test('watch coalesces repeated save events into one rebuild', async (context) => {
  const batches: string[][] = [];
  const queue = createRebuildQueue({ delay: 10, async build(changes) { batches.push(changes); }, onError: assert.fail });
  context.after(() => queue.close());
  queue.schedule(['index.md']);
  queue.schedule(['index.md', 'image.png']);
  await waitFor(() => batches.length === 1);
  await setTimeout(20);
  assert.deepEqual(batches, [['index.md', 'image.png']]);
});

test('changes during a build are merged into a serialized follow-up build', async (context) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  const batches: string[][] = [];
  let active = 0;
  let peak = 0;
  const queue = createRebuildQueue({
    delay: 5,
    async build(changes) {
      active += 1; peak = Math.max(peak, active);
      batches.push(changes);
      if (batches.length === 1) await gate;
      active -= 1;
    },
    onError: assert.fail,
  });
  context.after(() => { release(); return queue.close(); });
  queue.schedule(['first']);
  await waitFor(() => batches.length === 1);
  queue.schedule(['second']); queue.schedule(['third', 'second']);
  await setTimeout(15);
  assert.equal(batches.length, 1);
  release();
  await waitFor(() => batches.length === 2);
  assert.equal(peak, 1);
  assert.deepEqual(batches[1], ['second', 'third']);
});

test('a failed build releases the queue and a later save recovers', async (context) => {
  let attempts = 0;
  const errors: unknown[] = [];
  const queue = createRebuildQueue({
    delay: 5,
    async build() { if (++attempts === 1) throw new Error('missing file'); },
    onError(error) { errors.push(error); },
  });
  context.after(() => queue.close());
  queue.schedule(['deleted']); await waitFor(() => errors.length === 1);
  queue.schedule(['recreated']); await waitFor(() => attempts === 2);
  assert.equal(errors.length, 1);
});

test('closing a queue cancels pending debounce work', async () => {
  let called = false;
  const queue = createRebuildQueue({ delay: 5, async build() { called = true; }, onError: assert.fail });
  queue.schedule(['pending']); await queue.close();
  queue.schedule(['after close']); await setTimeout(15);
  assert.equal(called, false);
});

test('dependency classification avoids unnecessary font generation', () => {
  const plan = (name: string) => classifyChanges([path.join(directory.ROOT, name)], 'example');
  assert.equal(plan('articles/example/index.md').contentFont, true);
  assert.equal(plan('articles/example').contentFont, true);
  assert.equal(plan('articles/example').invalidateAll, true);
  assert.equal(plan('articles/example/image.png').contentFont, false);
  assert.equal(plan('src/assets/prism.css').contentFont, false);
  assert.equal(plan('src/assets/prism.css').render, true);
  assert.equal(plan('src/template/common/footer.ejs').commonFont, true);
  assert.equal(plan('src/assets/title_font.ttf').titleFont, true);
  assert.equal(plan('src/template/article/article_updates.ejs').contentFont, true);
  assert.equal(plan('src/static/robots.txt').render, false);
  assert(Object.values(classifyChanges(['*'], 'example')).every(Boolean));
  for (const name of ['.DS_Store', '.#index.md', 'index.md~', 'index.md.swp', 'asset.tmp']) assert(ignoredChange(name));
  assert(!ignoredChange('article/image.png'));
});
