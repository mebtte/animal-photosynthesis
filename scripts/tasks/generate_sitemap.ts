import ejs from 'ejs';

import fs from '../utils/fs.ts';
import directory from '../utils/directory.ts';
import config from '../config.ts';
import type { ArticleSummary } from '../types.ts';

export default async (articleList: ArticleSummary[]) => {
  const xml = await ejs.renderFile(`${directory.TEMPLATE}/sitemap.ejs`, {
    articleList,
    config,
  });
  await fs.writeFile(`${directory.BUILD}/sitemap.xml`, xml);
};
