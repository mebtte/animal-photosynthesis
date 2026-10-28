import { once } from 'node:events';
import { watch } from 'node:fs';
import type { FSWatcher } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import directory from '../utils/directory.ts';
import { serializeWatchError } from './events.ts';
import type { WatchEvent } from './events.ts';
import createArticleBuilder from './article_builder.ts';
import createRebuildQueue from './queue.ts';
import createPreviewServer from './server.ts';
import classifyChanges, { ignoredChange } from './changes.ts';

const id = process.argv[2];
if (!id || path.basename(id) !== id || id === '.' || id === '..') throw new Error('Invalid article id.');
// 该进程只负责开发预览, 修改模块上下文不会影响生产构建进程.
directory.BUILD = path.join(directory.ROOT, 'build-dev', id);
const preview = createPreviewServer({ outputDirectory: directory.BUILD, articleId: id });
const buildArticle = createArticleBuilder(id);
const watchers: FSWatcher[] = [];
let closing = false;

function emit(event: WatchEvent) {
  // 子进程只发送结构化状态, 由父进程独占终端, 避免日志与动画互相覆盖.
  if (process.connected) process.send?.(event, () => {});
}

const queue = createRebuildQueue({
  async build(changes) {
    const start = performance.now();
    emit({ type: 'build-start', changes });
    try {
      const rendered = await buildArticle(changes);
      if (!closing) {
        if (rendered) preview.succeeded();
        else preview.staticChanged();
        emit({ type: 'build-success', duration: performance.now() - start, rendered });
      }
    } catch (error) {
      if (!closing) {
        preview.failed(error);
        emit({ type: 'build-error', duration: performance.now() - start, error: serializeWatchError(error) });
      }
    }
  },
  onError(error) {
    preview.failed(error);
    emit({ type: 'build-error', duration: 0, error: serializeWatchError(error) });
  },
});

async function close(code = 0) {
  if (closing) return;
  closing = true;
  for (const watcher of watchers) watcher.close();
  await preview.close();
  await queue.close();
  if (process.connected) process.disconnect();
  process.exitCode = code;
}

async function fatal(error: unknown) {
  if (closing) return;
  emit({ type: 'fatal', error: serializeWatchError(error) });
  await close(1);
}

process.on('SIGINT', () => { void close(); });
process.on('SIGTERM', () => { void close(); });
process.on('disconnect', () => { void close(); });

async function start() {
  await mkdir(directory.BUILD, { recursive: true });
  if (closing) return;
  preview.server.listen(8000);
  await Promise.race([once(preview.server, 'listening'), once(preview.server, 'close')]);
  if (closing) return;
  preview.server.on('error', (error) => { void fatal(error); });
  for (const root of [directory.ARTICLES, directory.SRC]) {
    const watcher = watch(root, { recursive: true }, (type, filename) => {
      if (closing) return;
      if (filename && ignoredChange(filename)) return;
      const relative = filename?.split(path.sep).join('/');
      if (root === directory.ARTICLES && relative && relative !== id && !relative.startsWith(`${id}/`)) return;
      const changed = filename ? path.join(root, filename) : '*';
      const plan = classifyChanges([changed], id);
      if (plan.render || plan.static) queue.schedule([changed]);
    });
    watcher.on('error', (error) => { void fatal(error); });
    watchers.push(watcher);
  }
  emit({ type: 'ready' });
  queue.schedule(['*']);
}

try {
  await start();
} catch (error) {
  await fatal(error);
}
