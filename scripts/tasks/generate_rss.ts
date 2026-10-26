import ejs from 'ejs';

import fs from '../utils/fs.ts';
import directory from '../utils/directory.ts';
import config from '../config.ts';
import ora from '../utils/ora.ts';
import type { ArticleSummary } from '../types.ts';

export default async (articleList: ArticleSummary[]) => {
  const spinner = ora.createSpinner('正在生成 rss.xml ...');
  const xml = await ejs.renderFile(`${directory.TEMPLATE}/rss.ejs`, {
    articleList,
    config,
  });
  await fs.writeFile(`${directory.BUILD}/rss.xml`, xml);
  spinner.succeed('rss.xml 已生成');
};
