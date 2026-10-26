import ejs from 'ejs';

import fs from '../utils/fs.ts';
import directory from '../utils/directory.ts';
import ora from '../utils/ora.ts';
import config from '../config.ts';
import type { ArticleSummary } from '../types.ts';

export default async (articleList: ArticleSummary[]) => {
  const spinner = ora.createSpinner('正在生成 sitemap.xml ...');
  const xml = await ejs.renderFile(`${directory.TEMPLATE}/sitemap.ejs`, {
    articleList,
    config,
  });
  await fs.writeFile(`${directory.BUILD}/sitemap.xml`, xml);
  spinner.succeed('sitemap.xml 已生成');
};
