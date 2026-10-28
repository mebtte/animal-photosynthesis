#!/usr/bin/env node
import { availableParallelism } from 'node:os';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import initial from './tasks/initial.ts';
import copyStatic from './tasks/copy_static.ts';
import generateTitleFont from './tasks/generate_title_font.ts';
import generateCommonFont from './tasks/generate_common_font.ts';
import generateSitemap from './tasks/generate_sitemap.ts';
import generateRss from './tasks/generate_rss.ts';
import buildIndex from './tasks/build_index.ts';
import fs from './utils/fs.ts';
import directory from './utils/directory.ts';
import runWorkerPool from './utils/worker_pool.ts';
import createBuildReporter, { formatDuration } from './utils/build_reporter.ts';
import type { ArticleResult } from './tasks/build_article.ts';

// 字体裁剪会占用较多内存, 默认并行度同时受 CPU 和 4 个线程限制.
const defaultConcurrency = Math.min(4, availableParallelism());
const options = yargs(hideBin(process.argv))
  .scriptName('npm run build --')
  .usage('$0 [options]')
  .option('concurrency', {
    alias: 'c', type: 'number', default: defaultConcurrency,
    description: '文章构建的最大并行线程数',
  })
  .option('verbose', { alias: 'v', type: 'boolean', default: false, description: '显示每篇文章的构建结果及错误详情' })
  .check(({ concurrency }) => {
    if (!Number.isSafeInteger(concurrency) || concurrency < 1) {
      throw new Error('--concurrency 必须为正整数.');
    }
    return true;
  })
  .strict()
  .version(false)
  .help()
  .parseSync();

const reporter = createBuildReporter(options.verbose);
const start = performance.now();

async function build() {
  await reporter.phase('[1/4] 初始化构建目录', initial);
  const [titleFontPath, commonFontPath, articleIds, updatesTemplate] = await reporter.phase(
    '[2/4] 准备公共资源',
    () => Promise.all([
      generateTitleFont(), generateCommonFont(), fs.readdir(directory.ARTICLES),
      fs.readFile(`${directory.TEMPLATE}/article/article_updates.ejs`).then((data) => data.toString()),
      copyStatic(),
    ]),
  );

  const concurrency = Math.min(options.concurrency, articleIds.length);
  let completed = 0;
  const results = await reporter.phase(
    `[3/4] 构建 ${articleIds.length} 篇文章 (并行 ${concurrency})`,
    () => runWorkerPool<string, ArticleResult | null>({
      workerURL: new URL('./workers/article.ts', import.meta.url),
      items: articleIds,
      concurrency: options.concurrency,
      workerData: { titleFontPath, commonFontPath, updatesTemplate },
      onResult(result, id) {
        completed += 1;
        reporter.progress(`[3/4] 构建文章 ${completed}/${articleIds.length} | ${id}`);
        reporter.detail(`${completed}/${articleIds.length} ${id}: ${!result ? '跳过空文章' : result.hidden ? '已构建 (隐藏)' : '已构建'}`);
      },
    }),
  );
  const articleList = results.flatMap((result) => result && !result.hidden ? [result.article] : [])
    .sort((a, b) => Date.parse(b.publishTime!) - Date.parse(a.publishTime!));

  await reporter.phase('[4/4] 生成首页, RSS 和 sitemap', () => Promise.all([
    buildIndex(articleList, { titleFontPath, commonFontPath }),
    generateSitemap(articleList), generateRss(articleList),
  ]));
  const built = results.filter(Boolean).length;
  reporter.summary(`构建完成: ${built} 篇文章, ${articleList.length} 篇公开, ${built - articleList.length} 篇隐藏, ${articleIds.length - built} 篇跳过.\n输出: build/ | 并行: ${concurrency} | 总耗时: ${formatDuration(performance.now() - start)}`);
}

try {
  await build();
} catch (error) {
  reporter.error(error);
  process.exitCode = 1;
}
