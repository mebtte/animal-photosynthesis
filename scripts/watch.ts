#!/usr/bin/env node
import path from 'node:path';
import fs from 'fs-extra';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import directory from './utils/directory.ts';
import superviseWatch from './dev/supervisor.ts';
import createWatchReporter from './dev/reporter.ts';
import { serializeWatchError } from './dev/events.ts';

const { id } = yargs(hideBin(process.argv))
  .option('id', { type: 'string', default: '' })
  .parseSync();

const reporter = createWatchReporter({ id });

if (!id) {
  reporter.event({ type: 'fatal', error: { message: '请使用 --id 指定文章目录, 例如 npm run watch -- --id my_nas.' } });
  process.exit(1);
}

const articleDirectory = path.join(directory.ARTICLES, id);
let valid = false;
try {
  valid = path.basename(id) === id && id !== '.' && id !== '..' && fs.statSync(articleDirectory).isDirectory();
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
    reporter.event({ type: 'fatal', error: serializeWatchError(error) });
    process.exit(1);
  }
}
if (!valid) {
  reporter.event({ type: 'fatal', error: { message: `文章目录不存在或不是文件夹: ${articleDirectory}` } });
  process.exit(1);
}

try {
  reporter.header();
  process.exitCode = await superviseWatch(id, reporter);
} catch (error) {
  reporter.event({ type: 'fatal', error: serializeWatchError(error) });
  process.exitCode = 1;
}
