import ejs from 'ejs';

import fs from '../utils/fs.ts';
import directory from '../utils/directory.ts';
import config from '../config.ts';
import { latestDate, normalizeDate } from '../utils/article_dates.ts';
import { articleUrl, siteUrl } from '../utils/site_url.ts';
import type { ArticleSummary } from '../types.ts';

export async function renderRss(articleList: ArticleSummary[]): Promise<string> {
  const articles = articleList.map((article) => {
    const published = normalizeDate(article.publishTime, `${article.id}.publishTime`);
    const modified = normalizeDate(article.modifiedTime, `${article.id}.modifiedTime`);
    return {
      ...article,
      url: articleUrl(article.id),
      pubDate: published ? new Date(published).toUTCString() : undefined,
      modifiedTime: latestDate([published, modified]),
    };
  });
  const latest = latestDate(articles.map((article) => article.modifiedTime));
  return ejs.renderFile(`${directory.TEMPLATE}/rss.ejs`, {
    articleList: articles,
    config,
    homeUrl: siteUrl(),
    feedUrl: siteUrl('rss.xml'),
    lastBuildDate: latest ? new Date(latest).toUTCString() : undefined,
  });
}

export default async (articleList: ArticleSummary[]) => {
  await fs.writeFile(`${directory.BUILD}/rss.xml`, await renderRss(articleList));
};
