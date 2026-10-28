import * as path from 'node:path';
import ejs from 'ejs';
import md5 from 'md5';
import config from '../config.ts';
import directory from '../utils/directory.ts';
import fs from '../utils/fs.ts';
import fontmin from '../utils/fontmin.ts';
import parseArticle from '../utils/parse_article.ts';
import parseHtmlResource from '../utils/parse_html_resource.ts';
import type { ArticleSummary } from '../types.ts';

export interface ArticleContext {
  titleFontPath: string;
  commonFontPath: string;
  updatesTemplate: string;
}

export interface ArticleResult {
  article: ArticleSummary;
  hidden: boolean;
}

export default async function buildArticle(
  articleId: string,
  context: ArticleContext,
): Promise<ArticleResult | null> {
  const data = await parseArticle(articleId);
  if (!data) return null;
  const fontPath = `${directory.ASSET}/content_font.ttf`;
  const articleContentFontPath = await fontmin({
    fontPath,
    text: data.mdText + context.updatesTemplate,
    generateFilename: (buffer) => `${directory.BUILD}/${md5(buffer)}${path.extname(fontPath)}`,
  });
  const html = await ejs.renderFile(`${directory.TEMPLATE}/article/index.ejs`, {
    ...data,
    config,
    titleFontPath: context.titleFontPath,
    commonFontPath: context.commonFontPath,
    articleContentFontPath: articleContentFontPath.replace(`${directory.BUILD}/`, ''),
  });
  await fs.writeFile(`${directory.BUILD}/${articleId}.html`, await parseHtmlResource(html));
  return {
    article: {
      id: articleId,
      title: data.title,
      description: data.description,
      publishTime: data.publishTime,
    },
    hidden: data.hidden,
  };
}
