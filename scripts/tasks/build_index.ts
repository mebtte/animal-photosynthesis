import ejs from 'ejs';
import config from '../config.ts';
import directory from '../utils/directory.ts';
import fs from '../utils/fs.ts';
import parseHtmlResource from '../utils/parse_html_resource.ts';
import { siteUrl } from '../utils/site_url.ts';
import generateAllArticleTitleFont from './generate_all_article_title_font.ts';
import type { ArticleSummary } from '../types.ts';

export default async function buildIndex(
  articleList: ArticleSummary[],
  fonts: { titleFontPath: string; commonFontPath: string },
) {
  const allArticleTitleFontPath = await generateAllArticleTitleFont(articleList);
  const html = await ejs.renderFile(`${directory.TEMPLATE}/index.ejs`, {
    articleList,
    config,
    ...fonts,
    allArticleTitleFontPath,
    canonicalUrl: siteUrl(),
    feedUrl: siteUrl('rss.xml'),
  });
  await fs.writeFile(`${directory.BUILD}/index.html`, await parseHtmlResource(html));
}
