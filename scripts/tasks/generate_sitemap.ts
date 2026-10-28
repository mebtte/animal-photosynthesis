import ejs from 'ejs';

import fs from '../utils/fs.ts';
import directory from '../utils/directory.ts';
import { latestDate, normalizeDate } from '../utils/article_dates.ts';
import { articleUrl, siteUrl } from '../utils/site_url.ts';
import type { ArticleSummary } from '../types.ts';

export function renderSitemap(articleList: ArticleSummary[]): Promise<string> {
  return ejs.renderFile(`${directory.TEMPLATE}/sitemap.ejs`, {
    articleList: articleList.map((article) => ({
      url: articleUrl(article.id),
      lastmod: latestDate([
        normalizeDate(article.publishTime, `${article.id}.publishTime`),
        normalizeDate(article.modifiedTime, `${article.id}.modifiedTime`),
      ]),
    })),
    homeUrl: siteUrl(),
  });
}

export default async (articleList: ArticleSummary[]) => {
  await fs.writeFile(`${directory.BUILD}/sitemap.xml`, await renderSitemap(articleList));
};
