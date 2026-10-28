import * as path from 'node:path';
import { rename } from 'node:fs/promises';
import ejs from 'ejs';
import md5 from 'md5';
import config from '../config.ts';
import directory from '../utils/directory.ts';
import fs from '../utils/fs.ts';
import fontmin from '../utils/fontmin.ts';
import parseArticle from '../utils/parse_article.ts';
import parseHtmlResource from '../utils/parse_html_resource.ts';
import { articleUrl, siteUrl } from '../utils/site_url.ts';
import type { ArticleSummary } from '../types.ts';

export interface ArticleContext {
  titleFontPath: string;
  commonFontPath: string;
  updatesTemplate: string;
  articleContentFontPath?: string;
  atomic?: boolean;
}

export interface ArticleResult {
  article: ArticleSummary;
  hidden: boolean;
  articleContentFontPath: string;
}

export default async function buildArticle(
  articleId: string,
  context: ArticleContext,
): Promise<ArticleResult | null> {
  const data = await parseArticle(articleId);
  if (!data) return null;
  const fontPath = `${directory.ASSET}/content_font.ttf`;
  const articleContentFontPath = context.articleContentFontPath ?? await fontmin({
    fontPath,
    text: data.mdText + context.updatesTemplate,
    generateFilename: (buffer) => `${directory.BUILD}/${md5(buffer)}${path.extname(fontPath)}`,
  });
  const html = await ejs.renderFile(`${directory.TEMPLATE}/article/index.ejs`, {
    ...data,
    config,
    titleFontPath: context.titleFontPath,
    commonFontPath: context.commonFontPath,
    canonicalUrl: articleUrl(articleId),
    feedUrl: siteUrl('rss.xml'),
    articleContentFontPath: articleContentFontPath.replace(`${directory.BUILD}/`, ''),
  });
  const filename = `${directory.BUILD}/${articleId}.html`;
  const output = context.atomic ? `${filename}.tmp` : filename;
  // watch 的串行队列复用暂存文件, 成功后原子替换, 不暴露半写入页面.
  await fs.writeFile(output, await parseHtmlResource(html));
  if (context.atomic) await rename(output, filename);
  return {
    article: {
      id: articleId,
      title: data.title,
      description: data.description,
      publishTime: data.publishTime,
      modifiedTime: data.modifiedTime,
    },
    hidden: data.hidden,
    articleContentFontPath,
  };
}
