import { parentPort, workerData } from 'node:worker_threads';
import buildArticle from '../tasks/build_article.ts';
import type { ArticleContext } from '../tasks/build_article.ts';

if (!parentPort) throw new Error('文章构建任务必须在线程池中运行.');
const port = parentPort;
const context = workerData as ArticleContext;

port.on('message', async ({ index, value }: { index: number; value: string }) => {
  try {
    const result = await buildArticle(value, context);
    port.postMessage({ index, result });
  } catch (cause) {
    throw new Error(`文章 ${value} 构建失败.`, { cause });
  }
});
